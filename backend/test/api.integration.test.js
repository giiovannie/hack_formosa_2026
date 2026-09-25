import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import mysql from 'mysql2/promise';
import { createDatabase } from '../src/config/database.js';
import { initializeModels } from '../src/models/relaciones.js';
import { createApp } from '../src/app.js';

test('BE E01/E02 HTTP contracts and isolation on real MySQL', async (t) => {
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
  const config = { JWT_SECRET: randomBytes(32).toString('hex'), JWT_EXPIRES_IN: '1h', FRONTEND_URL: 'http://localhost:5173', NODE_ENV: 'production' };
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
