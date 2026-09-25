import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { createDatabase } from '../src/config/database.js';
import { initializeModels } from '../src/models/relaciones.js';
import { createApp } from '../src/app.js';

test('BE E01–E08 HTTP contracts and isolation on real MySQL', async (t) => {
  // This suite creates and removes only its own randomly named database.
  // It never loads .env or uses the application's DB_NAME.
  const name = `be_e01_test_${randomBytes(10).toString('hex')}`;
  const connection = {
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    port: Number(process.env.TEST_DB_PORT || 3306),
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
  };
  const admin = await mysql.createConnection(connection);
  let created = false;
  let database;
  let server;
  t.after(async () => {
    try {
      if (server) await new Promise((resolve) => server.close(resolve));
      if (database) await database.close();
      if (created && /^be_e01_test_[a-f0-9]{20}$/.test(name)) {
        await admin.query(`DROP DATABASE \`${name}\``);
      }
    } finally { await admin.end(); }
  });
  await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  created = true;
  database = createDatabase({ DB_NAME: name, DB_HOST: connection.host, DB_PORT: connection.port,
    DB_USER: connection.user, DB_PASSWORD: connection.password });
  const models = initializeModels(database);
  await database.sync();
  const config = { JWT_SECRET: randomBytes(32).toString('hex'), JWT_EXPIRES_IN: '1h', FRONTEND_URL: 'http://localhost:5173', NODE_ENV: 'production',
    PYTHON_EXECUTABLE: process.env.TEST_PYTHON_EXECUTABLE || path.join(process.cwd(), '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python') };
  const app = createApp({ database, models, config });
  server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const request = async (method, path, data, cookie, origin) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers.Cookie = cookie;
    if (origin) headers.Origin = origin;
    const response = await fetch(`${base}${path}`, { method, headers, body: data === undefined ? undefined : JSON.stringify(data) });
    const body = await response.json();
    assert.equal(JSON.stringify(body).includes('"password"'), false);
    return { status: response.status, body, cookie: response.headers.get('set-cookie') };
  };
  const owner = (email) => ({ firstName: 'Ana', lastName: 'Perez', email, password: 'test-password-123' });
  const login = async (email) => {
    const response = await request('POST', '/auth/login', { email, password: 'test-password-123' });
    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.match(response.cookie, /HttpOnly/i);
    assert.match(response.cookie, /SameSite=Strict/i);
    assert.match(response.cookie, /; Secure/i);
    return response.cookie.split(';')[0];
  };
  let companyA;
  let companyB;
  let cookieA;
  let cookieB;
  let member;
  let memberCookie;

  await t.test('registration creates company and hashed owner and login sets cookie', async () => {
    companyA = await request('POST', '/empresas', { name: 'Company A', owner: owner('a@example.com') });
    companyB = await request('POST', '/empresas', { name: 'Company B', owner: owner('b@example.com') });
    assert.equal(companyA.status, 201, JSON.stringify(companyA.body));
    assert.equal(companyB.status, 201);
    assert.equal(companyA.body.user.role, 'owner');
    assert.equal(companyA.body.user.companyId, companyA.body.company.id);
    const stored = await models.UserModel.scope('withPassword').findByPk(companyA.body.user.id);
    assert.match(stored.password, /^\$2[aby]\$/);
    cookieA = await login('A@EXAMPLE.COM');
    cookieB = await login('b@example.com');
    assert.equal((await request('POST', '/auth/login', { email: 'a@example.com', password: 'wrong' })).status, 401);
    assert.equal((await request('POST', '/auth/login', { email: 'none@example.com', password: 'wrong' })).status, 401);
  });
  await t.test('duplicate owner email rolls back company insertion', async () => {
    const count = await models.CompanyModel.count();
    assert.equal((await request('POST', '/empresas', { name: 'Rolled back', owner: owner('a@example.com') })).status, 409);
    assert.equal(await models.CompanyModel.count(), count);
  });
  await t.test('invalid input, extra tenant, unknown nested fields and untrusted origin are rejected', async () => {
    assert.equal((await request('POST', '/empresas', { name: '', owner: owner('bad') })).status, 400);
    assert.equal((await request('POST', '/empresas', { name: 'Injected', owner: { ...owner('c@example.com'), companyId: 999 } })).status, 400);
    assert.equal((await request('POST', '/empresas', { name: 'Denied', owner: owner('c@example.com') }, undefined, 'https://untrusted.example')).status, 403);
    assert.equal((await request('POST', '/usuarios', { ...owner('c@example.com'), role: 'member', companyId: companyB.body.company.id }, cookieA)).status, 400);
    assert.equal((await request('GET', '/usuarios?limit=101', undefined, cookieA)).status, 400);
    assert.equal((await request('POST', '/empresas', { name: 'Long', owner: { ...owner('c@example.com'), password: 'á'.repeat(37) } })).status, 400);
  });
  await t.test('unauthenticated and cross-tenant requests cannot access data', async () => {
    assert.equal((await request('GET', '/usuarios')).status, 401);
    assert.equal((await request('GET', '/usuarios', undefined, 'token=invalid')).status, 401);
    assert.equal((await request('GET', `/empresas/${companyA.body.company.id}`, undefined, cookieA)).status, 200);
    assert.equal((await request('GET', `/empresas/${companyB.body.company.id}`, undefined, cookieA)).status, 404);
    assert.equal((await request('PUT', `/usuarios/${companyB.body.user.id}`, { ...owner('b@example.com'), role: 'member' }, cookieA)).status, 404);
    assert.equal((await request('DELETE', `/usuarios/${companyB.body.user.id}`, undefined, cookieA)).status, 404);
    const listed = await request('GET', '/usuarios?page=1&limit=1', undefined, cookieA);
    assert.equal(listed.body.pagination.total, 1);
    assert.deepEqual(listed.body.users.map((user) => user.companyId), [companyA.body.company.id]);
  });
  await t.test('owner creates and edits a member; member cannot manage users', async () => {
    const response = await request('POST', '/usuarios', { ...owner('member@example.com'), role: 'member' }, cookieA);
    assert.equal(response.status, 201);
    member = response.body.user;
    memberCookie = await login('member@example.com');
    assert.equal((await request('GET', '/usuarios', undefined, memberCookie)).status, 403);
    assert.equal((await request('POST', '/usuarios', { ...owner('denied@example.com'), role: 'member' }, memberCookie)).status, 403);
    const changed = await request('PUT', `/usuarios/${member.id}`, { firstName: 'Maria', lastName: 'Perez', email: member.email, role: 'member' }, cookieA);
    assert.equal(changed.status, 200);
    assert.equal(changed.body.user.firstName, 'Maria');
    const duplicate = await request('PUT', `/usuarios/${member.id}`, { ...owner('a@example.com'), role: 'member' }, cookieA);
    assert.equal(duplicate.status, 409);
  });
  const profileData = { industry: 'Comercio', areas: ['Ventas'], availableData: ['CSV'], analysisObjectives: ['Mejorar ventas'] };
  await t.test('E02 missing profile is null; concurrent first writes create one persistent profile', async () => {
    const initial = await request('GET', '/empresa/perfil', undefined, cookieA);
    assert.equal(initial.status, 200);
    assert.equal(initial.body.profile, null);
    assert.equal(await models.CompanyProfileModel.count(), 0);
    const alternative = { industry: 'Servicios', areas: ['Compras'], availableData: [], analysisObjectives: ['Reducir costos'] };
    const results = await Promise.all([
      request('PUT', '/empresa/perfil', profileData, cookieA),
      request('PUT', '/empresa/perfil', alternative, cookieA),
    ]);
    assert.deepEqual(results.map((result) => result.status), [200, 200]);
    assert.equal(results[0].body.profile.id, results[1].body.profile.id);
    assert.equal(await models.CompanyProfileModel.count({ where: { companyId: companyA.body.company.id } }), 1);
    const persisted = await models.CompanyProfileModel.findOne({ where: { companyId: companyA.body.company.id } });
    const expected = persisted.industry === profileData.industry ? profileData : alternative;
    for (const key of Object.keys(expected)) assert.deepEqual(persisted[key], expected[key]);
    const read = await request('GET', '/empresa/perfil', undefined, cookieA);
    for (const key of Object.keys(expected)) assert.deepEqual(read.body.profile[key], expected[key]);
  });
  await t.test('E02 replacement persists trimmed arrays, permits empty lists and enforces unique company FK', async () => {
    const response = await request('PUT', '/empresa/perfil', {
      industry: ' Comercio ', areas: [' Ventas ', 'Ventas'], availableData: [], analysisObjectives: [' Crecer '],
    }, cookieA);
    assert.equal(response.status, 200);
    assert.equal(response.body.profile.industry, 'Comercio');
    assert.deepEqual(response.body.profile.areas, ['Ventas', 'Ventas']);
    assert.deepEqual(response.body.profile.availableData, []);
    assert.deepEqual(response.body.profile.analysisObjectives, ['Crecer']);
    await assert.rejects(models.CompanyProfileModel.create({ ...profileData, companyId: companyA.body.company.id }),
      (error) => error.name === 'SequelizeUniqueConstraintError');
    await assert.rejects(models.CompanyProfileModel.create({ ...profileData, companyId: 2147483647 }),
      (error) => error.name === 'SequelizeForeignKeyConstraintError');
  });
  await t.test('E02 rejects invalid lists and tenant injection without changing persisted data', async () => {
    const before = (await request('GET', '/empresa/perfil', undefined, cookieA)).body.profile;
    for (const field of ['areas', 'availableData', 'analysisObjectives']) {
      for (const value of [null, 'Ventas', {}, [1], [' '], [{ name: 'Ventas' }]]) {
        assert.equal((await request('PUT', '/empresa/perfil', { ...profileData, [field]: value }, cookieA)).status, 400);
      }
      const missing = { ...profileData };
      delete missing[field];
      assert.equal((await request('PUT', '/empresa/perfil', missing, cookieA)).status, 400);
    }
    assert.equal((await request('PUT', '/empresa/perfil', { ...profileData, industry: '' }, cookieA)).status, 400);
    assert.equal((await request('PUT', '/empresa/perfil', { ...profileData, companyId: companyB.body.company.id }, cookieA)).status, 400);
    assert.equal((await request('PUT', '/empresa/perfil?companyId=999', profileData, cookieA)).status, 400);
    assert.equal((await request('GET', '/empresa/perfil?companyId=999', undefined, cookieA)).status, 400);
    assert.deepEqual((await request('GET', '/empresa/perfil', undefined, cookieA)).body.profile, before);
  });
  await t.test('E02 keeps companies isolated and restricts writes to their owner', async () => {
    assert.equal((await request('GET', '/empresa/perfil')).status, 401);
    assert.equal((await request('PUT', '/empresa/perfil', profileData)).status, 401);
    assert.equal((await request('GET', '/empresa/perfil', undefined, cookieB)).body.profile, null);
    const other = await request('PUT', '/empresa/perfil', { ...profileData, industry: 'Industria B' }, cookieB);
    assert.equal(other.status, 200);
    assert.equal(other.body.profile.companyId, companyB.body.company.id);
    assert.equal((await request('GET', '/empresa/perfil', undefined, cookieA)).body.profile.industry, 'Comercio');
    assert.equal((await request('GET', '/empresa/perfil', undefined, memberCookie)).body.profile.companyId, companyA.body.company.id);
    assert.equal((await request('PUT', '/empresa/perfil', profileData, memberCookie)).status, 403);
    assert.equal((await request('PUT', '/empresa/perfil', profileData, cookieA, 'https://untrusted.example')).status, 403);
  });
  const sourceData = { name: 'Caja', type: 'internal', origin: 'Sucursal centro', description: 'CSV de ventas', status: 'disponible', sourceUpdatedAt: '2026-09-24T12:00:00.000Z' };
  let sourceA;
  await t.test('E04 owner creates and retrieves internal/external sources with isolated lists', async () => {
    const response = await request('POST', '/fuentes', sourceData, cookieA);
    assert.equal(response.status, 201, JSON.stringify(response.body));
    sourceA = response.body.source;
    assert.equal(sourceA.companyId, companyA.body.company.id);
    assert.equal(sourceA.type, 'internal');
    const external = await request('POST', '/fuentes', { ...sourceData, type: 'external', name: 'Índice público' }, cookieB);
    assert.equal(external.status, 201);
    assert.equal((await request('GET', `/fuentes/${sourceA.id}`, undefined, cookieA)).body.source.id, sourceA.id);
    assert.equal((await request('GET', `/fuentes/${external.body.source.id}`, undefined, cookieA)).status, 404);
    const listA = await request('GET', '/fuentes?page=1&limit=1', undefined, cookieA);
    assert.equal(listA.body.pagination.total, 1);
    assert.deepEqual(listA.body.sources.map((source) => source.companyId), [companyA.body.company.id]);
  });
  await t.test('E04 validates fields and rejects tenant injection', async () => {
    assert.equal((await request('POST', '/fuentes', { ...sourceData, type: 'other' }, cookieA)).status, 400);
    assert.equal((await request('POST', '/fuentes', { ...sourceData, companyId: companyB.body.company.id }, cookieA)).status, 400);
    assert.equal((await request('POST', '/fuentes?companyId=999', sourceData, cookieA)).status, 400);
    assert.equal((await request('POST', '/fuentes', { ...sourceData, status: '' }, cookieA)).status, 400);
    assert.equal((await request('POST', '/fuentes', { ...sourceData, sourceUpdatedAt: 'invalid' }, cookieA)).status, 400);
    assert.equal((await request('GET', '/fuentes?limit=101', undefined, cookieA)).status, 400);
  });
  await t.test('E04 only owner can change own source, edits and soft deletion persist', async () => {
    assert.equal((await request('GET', '/fuentes', undefined, memberCookie)).status, 200);
    assert.equal((await request('POST', '/fuentes', sourceData, memberCookie)).status, 403);
    assert.equal((await request('PUT', `/fuentes/${sourceA.id}`, sourceData, memberCookie)).status, 403);
    assert.equal((await request('DELETE', `/fuentes/${sourceA.id}`, undefined, memberCookie)).status, 403);
    assert.equal((await request('PUT', `/fuentes/${sourceA.id}`, { ...sourceData, name: 'Caja editada', sourceUpdatedAt: undefined }, cookieB)).status, 404);
    assert.equal((await request('DELETE', `/fuentes/${sourceA.id}`, undefined, cookieB)).status, 404);
    const edited = await request('PUT', `/fuentes/${sourceA.id}`, { name: 'Caja editada', type: 'internal', origin: 'Centro', status: 'activa' }, cookieA);
    assert.equal(edited.status, 200);
    assert.equal(edited.body.source.name, 'Caja editada');
    assert.equal(edited.body.source.description, null);
    assert.equal(edited.body.source.sourceUpdatedAt, null);
    assert.equal((await request('DELETE', `/fuentes/${sourceA.id}`, undefined, cookieA)).status, 200);
    assert.equal((await request('GET', `/fuentes/${sourceA.id}`, undefined, cookieA)).status, 404);
    assert.ok((await models.SourceModel.findByPk(sourceA.id, { paranoid: false })).deletedAt);
  });
  let importSource;
  let importId;
  let tracedRecordId;
  let traceImportId;
  const uploadCsv = async (cookie, sourceId, filename, content, extra = {}) => {
    const form = new FormData();
    form.set('sourceId', String(sourceId));
    form.set('dataType', 'sales');
    form.set('metadata', JSON.stringify({ period: '2026-09', ...extra }));
    if (content !== null) form.set('file', new Blob([content], { type: 'text/csv' }), filename);
    const response = await fetch(`${base}/datos/importaciones`, { method: 'POST', headers: { Cookie: cookie }, body: form });
    return { status: response.status, body: await response.json() };
  };
  await t.test('E03 accepts CSV and manual records as pending for same-company source', async () => {
    const created = await request('POST', '/fuentes', sourceData, cookieA);
    assert.equal(created.status, 201);
    importSource = created.body.source;
    const csv = await uploadCsv(cookieA, importSource.id, 'sales.csv', 'product,quantity\nA,2\n');
    assert.equal(csv.status, 201, JSON.stringify(csv.body));
    importId = csv.body.dataImport.id;
    assert.equal(csv.body.dataImport.status, 'pending');
    assert.equal(csv.body.dataImport.sourceId, importSource.id);
    assert.equal(JSON.stringify(csv.body).includes('rawPayload'), false);
    const stored = await models.DataImportModel.scope('withRawPayload').findByPk(importId);
    assert.equal(stored.rawPayload, 'product,quantity\nA,2\n');
    const manual = await request('POST', '/datos/registros', { sourceId: importSource.id, dataType: 'sales', record: { product: 'B', quantity: 3 } }, cookieA);
    assert.equal(manual.status, 201);
    assert.equal(manual.body.dataImport.kind, 'manual');
    assert.equal(manual.body.dataImport.status, 'pending');
    const read = await request('GET', `/datos/importaciones/${manual.body.dataImport.id}`, undefined, cookieA);
    assert.equal(read.status, 200);
    assert.equal(JSON.stringify(read.body).includes('rawPayload'), false);
    const list = await request('GET', '/datos/importaciones?page=1&limit=1', undefined, cookieA);
    assert.equal(list.body.pagination.total, 2);
    assert.equal(list.body.dataImports.length, 1);
    assert.equal(JSON.stringify(list.body).includes('rawPayload'), false);
  });
  await t.test('E03 rejects invalid uploads, wrong tenant and wrong source', async () => {
    const count = await models.DataImportModel.count({ where: { companyId: companyA.body.company.id } });
    assert.equal((await uploadCsv(cookieB, importSource.id, 'sales.csv', 'a,b\n1,2')).status, 404);
    assert.equal((await uploadCsv(cookieA, 2147483647, 'sales.csv', 'a,b\n1,2')).status, 404);
    assert.equal((await uploadCsv(cookieA, importSource.id, 'sales.txt', 'a,b\n1,2')).status, 400);
    assert.equal((await uploadCsv(cookieA, importSource.id, 'empty.csv', '')).status, 400);
    assert.equal((await uploadCsv(cookieA, importSource.id, 'bad.csv', new Uint8Array([0xff]))).status, 400);
    assert.equal((await uploadCsv(cookieA, importSource.id, 'large.csv', 'a'.repeat(1024 * 1024 + 1))).status, 413);
    assert.equal((await uploadCsv(cookieA, importSource.id, 'missing.csv', null)).status, 400);
    assert.equal((await request('POST', '/datos/registros', { sourceId: importSource.id, dataType: 'sales', record: [] }, cookieA)).status, 400);
    assert.equal((await request('POST', '/datos/registros', { sourceId: importSource.id, dataType: 'sales', record: {} }, cookieA)).status, 400);
    assert.equal((await request('POST', '/datos/registros', { sourceId: importSource.id, dataType: 'sales', record: { x: 1 }, companyId: companyB.body.company.id }, cookieA)).status, 400);
    assert.equal((await request('GET', '/datos/importaciones?companyId=999', undefined, cookieA)).status, 400);
    assert.equal((await request('GET', `/datos/importaciones/${importId}`, undefined, cookieB)).status, 404);
    assert.equal(await models.DataImportModel.count({ where: { companyId: companyA.body.company.id } }), count);
  });
  await t.test('E05 processes, isolates and reprocesses imports with quality results', async () => {
    const first = await request('POST', `/etl/procesar/${importId}`, undefined, cookieA);
    assert.equal(first.status, 200, JSON.stringify(first.body));
    assert.equal(first.body.process.status, 'completed');
    assert.deepEqual(first.body.process.result.summary, { total: 1, accepted: 1, rejected: 0 });
    assert.equal(JSON.stringify(first.body).includes('normalized'), false);
    const storedRun = await models.ProcessingRunModel.findByPk(first.body.process.id);
    assert.equal(storedRun.result.accepted[0].normalized.product, 'A');
    const runId = first.body.process.id;
    assert.equal((await request('GET', `/etl/procesos/${runId}`, undefined, cookieB)).status, 404);
    assert.equal((await request('POST', `/etl/reprocesar/${runId}`, undefined, cookieB)).status, 404);
    assert.equal((await request('POST', `/etl/procesar/${importId}`, undefined, cookieB)).status, 404);
    const second = await request('POST', `/etl/reprocesar/${runId}`, undefined, cookieA);
    assert.equal(second.status, 200, JSON.stringify(second.body));
    assert.notEqual(second.body.process.id, runId);
    assert.equal(second.body.process.status, 'completed');
    assert.equal((await request('GET', `/etl/procesos/${runId}`, undefined, cookieA)).body.process.status, 'completed');
    assert.equal((await request('GET', `/datos/importaciones/${importId}`, undefined, cookieA)).body.dataImport.status, 'completed');
    const bad = await uploadCsv(cookieA, importSource.id, 'bad-shape.csv', 'a,a\n1,2\n');
    assert.equal(bad.status, 201);
    const failed = await request('POST', `/etl/procesar/${bad.body.dataImport.id}`, undefined, cookieA);
    assert.equal(failed.status, 200);
    assert.equal(failed.body.process.status, 'failed');
    assert.equal((await request('GET', `/datos/importaciones/${bad.body.dataImport.id}`, undefined, cookieA)).body.dataImport.status, 'failed');
    const quality = await uploadCsv(cookieA, importSource.id, 'quality.csv', ' product , quantity\n A , 2 \n A ,2\n , \nB,3\n');
    assert.equal(quality.status, 201);
    const qualityRun = await request('POST', `/etl/procesar/${quality.body.dataImport.id}`, undefined, cookieA);
    assert.equal(qualityRun.body.process.status, 'completed');
    assert.deepEqual(qualityRun.body.process.result.summary, { total: 4, accepted: 2, rejected: 2 });
    const qualityStored = await models.ProcessingRunModel.findByPk(qualityRun.body.process.id);
    assert.deepEqual(qualityStored.result.rejected.map((row) => row.reason), ['duplicate', 'empty']);
    assert.equal(qualityStored.result.accepted[0].original[' product '], ' A ');
    const manual = await request('POST', '/datos/registros', { sourceId: importSource.id, dataType: 'sales', record: { product: '  C ', quantity: 4 } }, cookieA);
    const manualRun = await request('POST', `/etl/procesar/${manual.body.dataImport.id}`, undefined, cookieA);
    assert.equal(manualRun.body.process.status, 'completed');
    assert.equal((await models.ProcessingRunModel.findByPk(manualRun.body.process.id)).result.accepted[0].normalized.product, 'C');
  });
  await t.test('E06 validates quality, pages errors, corrects records and isolates tenants', async () => {
    const csv = await uploadCsv(cookieA, importSource.id, 'quality-e06.csv', 'date,amount,count\n2026-02-30,1.234,x\n2026-02-28,12.50,2\n2026-02-28,12.50,2\n, ,\n');
    assert.equal(csv.status, 201);
    const id = csv.body.dataImport.id;
    assert.equal((await request('POST', `/etl/procesar/${id}`, undefined, cookieA)).body.process.status, 'completed');
    assert.equal((await request('GET', `/calidad/${id}`, undefined, cookieA)).status, 404);
    assert.equal((await request('POST', `/calidad/${id}/validar`, { rules: { nonexistent: 'date' } }, cookieA)).status, 400);
    const validated = await request('POST', `/calidad/${id}/validar`, { rules: { date: 'date', amount: 'money', count: 'integer' } }, cookieA);
    assert.equal(validated.status, 200, JSON.stringify(validated.body));
    assert.equal(validated.body.quality.totalProcessed, 4);
    assert.equal(validated.body.quality.validRecords, 1);
    assert.equal(validated.body.quality.duplicates, 1);
    assert.equal(validated.body.quality.incompleteRecords, 1);
    assert.equal((await request('GET', `/calidad/${id}`, undefined, cookieB)).status, 404);
    assert.equal((await request('POST', `/calidad/${id}/validar`, {}, cookieB)).status, 404);
    assert.equal((await request('GET', `/calidad/${id}/errores?page=1&limit=2`, undefined, cookieA)).body.errors.length, 2);
    assert.equal((await request('GET', `/calidad/${id}/errores?limit=101`, undefined, cookieA)).status, 400);
    assert.equal((await request('PUT', `/calidad/${id}/registros/1`, { record: { date: '2026-02-27', amount: '1.23', count: '1' } }, cookieB)).status, 404);
    assert.equal((await request('PUT', `/calidad/${id}/registros/1`, { record: { amount: '1.23' } }, cookieA)).status, 400);
    assert.equal((await request('PUT', `/calidad/${id}/registros/2`, { record: { date: '2026-02-27', amount: '1.23', count: '1' } }, cookieA)).status, 409);
    const fixed = await request('PUT', `/calidad/${id}/registros/1`, { record: { date: '2026-02-27', amount: '1.23', count: '1' } }, cookieA);
    assert.equal(fixed.status, 200, JSON.stringify(fixed.body));
    assert.equal(fixed.body.quality.validRecords, 2);
    const stored = await models.ProcessingRunModel.findByPk(fixed.body.processId);
    assert.equal(stored.result.accepted[0].original.date, '2026-02-30');
    assert.equal(stored.result.corrections['1'].date, '2026-02-27');
  });
  await t.test('E07 stores only validated records, preserves history and tenant references', async () => {
    const csv = await uploadCsv(cookieA, importSource.id, 'stored.csv', 'product,quantity\nA,2\nA,2\n , \n');
    assert.equal(csv.status, 201);
    const id = csv.body.dataImport.id;
    traceImportId = id;
    assert.equal((await request('POST', `/datos-procesados/importaciones/${id}`, undefined, cookieA)).status, 409);
    assert.equal((await request('POST', `/datos-procesados/importaciones/${id}`, undefined, cookieB)).status, 404);
    assert.equal((await request('POST', `/datos-procesados/importaciones/${id}`)).status, 401);
    const processed = await request('POST', `/etl/procesar/${id}`, undefined, cookieA);
    assert.equal(processed.body.process.status, 'completed');
    assert.equal((await request('POST', `/datos-procesados/importaciones/${id}`, undefined, cookieA)).status, 409);
    const quality = await request('POST', `/calidad/${id}/validar`, { rules: { quantity: 'integer' } }, cookieA);
    assert.equal(quality.body.quality.validRecords, 1);
    const saved = await request('POST', `/datos-procesados/importaciones/${id}`, undefined, cookieA);
    assert.equal(saved.status, 200, JSON.stringify(saved.body));
    assert.equal(saved.body.persistedRecords, 1);
    assert.equal(saved.body.alreadyPersisted, false);
    const again = await request('POST', `/datos-procesados/importaciones/${id}`, undefined, cookieA);
    assert.equal(again.body.alreadyPersisted, true);
    assert.equal(again.body.persistedRecords, 1);
    assert.equal((await request('POST', `/calidad/${id}/validar`, {}, cookieA)).status, 409);
    assert.equal((await request('PUT', `/calidad/${id}/registros/2`, { record: { product: 'B', quantity: '3' } }, cookieA)).status, 409);
    const list = await request('GET', '/datos-procesados?page=1&limit=1', undefined, cookieA);
    assert.equal(list.status, 200);
    assert.equal(list.body.pagination.total, 1);
    const record = list.body.records[0];
    tracedRecordId = record.id;
    assert.equal(record.companyId, companyA.body.company.id);
    assert.equal(record.sourceId, importSource.id);
    assert.equal(record.dataImportId, id);
    assert.equal(record.processingRunId, processed.body.process.id);
    assert.equal(record.values.product, 'A');
    assert.equal((await request('GET', `/datos-procesados/${record.id}`, undefined, cookieB)).status, 404);
    assert.equal((await request('GET', '/datos-procesados', undefined, cookieB)).body.pagination.total, 0);
    const reprocessed = await request('POST', `/etl/reprocesar/${processed.body.process.id}`, undefined, cookieA);
    assert.equal(reprocessed.body.process.status, 'completed');
    assert.notEqual(reprocessed.body.process.id, processed.body.process.id);
    assert.equal((await request('POST', `/calidad/${id}/validar`, {}, cookieA)).status, 200);
    assert.equal((await request('POST', `/datos-procesados/importaciones/${id}`, undefined, cookieA)).body.persistedRecords, 1);
    assert.equal((await request('GET', '/datos-procesados', undefined, cookieA)).body.pagination.total, 2);
    assert.equal(await models.ProcessedRecordModel.count({ where: { processingRunId: processed.body.process.id } }), 1);
    const fixable = await uploadCsv(cookieA, importSource.id, 'corrected.csv', 'product,quantity\nC,\n');
    assert.equal(fixable.status, 201);
    const fixableId = fixable.body.dataImport.id;
    assert.equal((await request('POST', `/etl/procesar/${fixableId}`, undefined, cookieA)).body.process.status, 'completed');
    assert.equal((await request('POST', `/calidad/${fixableId}/validar`, { rules: { quantity: 'integer' } }, cookieA)).body.quality.validRecords, 0);
    const corrected = await request('PUT', `/calidad/${fixableId}/registros/1`, { record: { product: 'C', quantity: '3' } }, cookieA);
    assert.equal(corrected.body.quality.validRecords, 1);
    const savedCorrection = await request('POST', `/datos-procesados/importaciones/${fixableId}`, undefined, cookieA);
    assert.equal(savedCorrection.body.persistedRecords, 1);
    const storedCorrection = await models.ProcessedRecordModel.findOne({ where: { companyId: companyA.body.company.id, dataImportId: fixableId } });
    assert.equal(storedCorrection.values.quantity, '3');
    assert.equal((await models.DataImportModel.scope('withRawPayload').findByPk(fixableId)).rawPayload, 'product,quantity\nC,\n');
    await assert.rejects(models.ProcessedRecordModel.create({ companyId: companyA.body.company.id, sourceId: 2147483647,
      dataImportId: id, processingRunId: processed.body.process.id, rowNumber: 99, dataType: 'sales', values: { product: 'C' } }),
    (error) => error.name === 'SequelizeForeignKeyConstraintError');
  });
  await t.test('E08 reconstructs a record path and import history without changing it', async () => {
    const trace = await request('GET', `/trazabilidad/registros/${tracedRecordId}`, undefined, cookieA);
    assert.equal(trace.status, 200, JSON.stringify(trace.body));
    assert.equal(trace.body.trace.recordId, tracedRecordId);
    assert.equal(trace.body.trace.source.id, importSource.id);
    assert.equal(trace.body.trace.importation.id, traceImportId);
    assert.equal(trace.body.trace.processing.status, 'completed');
    assert.equal(trace.body.trace.validation.status, 'valid');
    assert.ok(trace.body.trace.validation.validatedAt);
    assert.ok(trace.body.trace.importation.createdAt);
    assert.ok(trace.body.trace.persistence.createdAt);
    assert.equal(JSON.stringify(trace.body).includes('rawPayload'), false);
    assert.equal((await request('GET', `/trazabilidad/registros/${tracedRecordId}`, undefined, cookieB)).status, 404);
    assert.equal((await request('GET', `/trazabilidad/registros/${tracedRecordId}`)).status, 401);
    const history = await request('GET', `/trazabilidad/importaciones/${traceImportId}?page=1&limit=1`, undefined, cookieA);
    assert.equal(history.status, 200, JSON.stringify(history.body));
    assert.equal(history.body.pagination.total, 2);
    assert.equal(history.body.history.runs.length, 1);
    assert.equal(history.body.history.runs[0].persistedRecords, 1);
    assert.equal((await request('GET', `/trazabilidad/importaciones/${traceImportId}?page=2&limit=1`, undefined, cookieA)).body.history.runs.length, 1);
    assert.equal((await request('GET', `/trazabilidad/importaciones/${traceImportId}`, undefined, cookieB)).status, 404);
    assert.equal((await request('GET', `/trazabilidad/importaciones/${traceImportId}?limit=101`, undefined, cookieA)).status, 400);
    const before = await models.ProcessingRunModel.count({ where: { dataImportId: traceImportId } });
    await request('GET', `/trazabilidad/importaciones/${traceImportId}`, undefined, cookieA);
    assert.equal(await models.ProcessingRunModel.count({ where: { dataImportId: traceImportId } }), before);
  });
  await t.test('E03 source with imports cannot be deleted and inactive source rejects new imports', async () => {
    assert.equal((await request('DELETE', `/fuentes/${importSource.id}`, undefined, cookieA)).status, 409);
    assert.ok(await models.SourceModel.findByPk(importSource.id));
    await models.SourceModel.destroy({ where: { id: importSource.id } });
    const historical = await request('GET', `/trazabilidad/registros/${tracedRecordId}`, undefined, cookieA);
    assert.equal(historical.status, 200);
    assert.ok(historical.body.trace.source.deletedAt);
    assert.equal((await uploadCsv(cookieA, importSource.id, 'sales.csv', 'a,b\n1,2')).status, 404);
    assert.equal((await request('POST', '/datos/registros', { sourceId: importSource.id, dataType: 'sales', record: { x: 1 } }, cookieA)).status, 404);
    assert.equal((await request('GET', `/datos/importaciones/${importId}`, undefined, cookieA)).status, 200);
  });
  await t.test('last owner cannot be deleted or demoted', async () => {
    assert.equal((await request('DELETE', `/usuarios/${companyA.body.user.id}`, undefined, cookieA)).status, 409);
    assert.equal((await request('PUT', `/usuarios/${companyA.body.user.id}`, { ...owner('a@example.com'), role: 'member' }, cookieA)).status, 409);
  });
  await t.test('database rejects orphan users and new sessions use changed passwords and roles', async () => {
    await assert.rejects(models.UserModel.create({ ...owner('orphan@example.com'), role: 'member', companyId: 2147483647 }),
      (error) => error.name === 'SequelizeForeignKeyConstraintError');
    const extra = await request('POST', '/usuarios', { ...owner('demoted@example.com'), role: 'owner' }, cookieB);
    assert.equal(extra.status, 201);
    const extraCookie = await login('demoted@example.com');
    const updated = await request('PUT', `/usuarios/${extra.body.user.id}`, {
      ...owner('demoted@example.com'), password: 'changed-password-123', role: 'member',
    }, cookieB);
    assert.equal(updated.status, 200);
    assert.equal((await request('GET', '/usuarios', undefined, extraCookie)).status, 403);
    assert.equal((await request('POST', '/auth/login', { email: 'demoted@example.com', password: 'test-password-123' })).status, 401);
    assert.equal((await request('POST', '/auth/login', { email: 'demoted@example.com', password: 'changed-password-123' })).status, 200);
  });
  await t.test('concurrent owner deletions leave an active owner', async () => {
    const response = await request('POST', '/usuarios', { ...owner('owner2@example.com'), role: 'owner' }, cookieA);
    assert.equal(response.status, 201);
    const secondCookie = await login('owner2@example.com');
    const results = await Promise.all([
      request('DELETE', `/usuarios/${response.body.user.id}`, undefined, cookieA),
      request('DELETE', `/usuarios/${companyA.body.user.id}`, undefined, secondCookie),
    ]);
    assert.equal(results.filter((result) => result.status === 200).length, 1);
    assert.ok(results.some((result) => [401, 403, 409].includes(result.status)));
    assert.equal(await models.UserModel.count({ where: { companyId: companyA.body.company.id, role: 'owner' } }), 1);
    cookieA = await login(results[0].status === 200 ? 'a@example.com' : 'owner2@example.com');
  });
  await t.test('soft-deleted user loses login and existing session; email remains reserved', async () => {
    assert.equal((await request('DELETE', `/usuarios/${member.id}`, undefined, cookieA)).status, 200);
    assert.equal(await models.UserModel.findByPk(member.id), null);
    assert.ok((await models.UserModel.findByPk(member.id, { paranoid: false })).deletedAt);
    assert.equal((await request('GET', `/empresas/${companyA.body.company.id}`, undefined, memberCookie)).status, 401);
    assert.equal((await request('GET', '/empresa/perfil', undefined, memberCookie)).status, 401);
    assert.equal((await request('POST', '/auth/login', { email: member.email, password: 'test-password-123' })).status, 401);
    assert.equal((await request('POST', '/usuarios', { ...owner(member.email), role: 'member' }, cookieA)).status, 409);
  });
  await t.test('soft-deleted company denies all sessions and login while retaining users', async () => {
    await models.CompanyModel.destroy({ where: { id: companyB.body.company.id } });
    assert.ok(await models.UserModel.findByPk(companyB.body.user.id));
    assert.equal((await request('GET', '/usuarios', undefined, cookieB)).status, 401);
    assert.equal((await request('GET', '/empresa/perfil', undefined, cookieB)).status, 401);
    assert.equal((await request('PUT', '/empresa/perfil', profileData, cookieB)).status, 401);
    assert.ok(await models.CompanyProfileModel.findOne({ where: { companyId: companyB.body.company.id } }));
    assert.equal((await request('POST', '/auth/login', { email: 'b@example.com', password: 'test-password-123' })).status, 401);
  });
});
