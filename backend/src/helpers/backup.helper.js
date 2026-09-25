import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const defaultBackupDir = fileURLToPath(new URL('../../backups/', import.meta.url));
export const backupTables = [
  ['users', 'UserModel'], ['profile', 'CompanyProfileModel'], ['sources', 'SourceModel'],
  ['imports', 'DataImportModel'], ['runs', 'ProcessingRunModel'], ['records', 'ProcessedRecordModel'],
  ['alerts', 'AlertModel'], ['externalQueries', 'ExternalQueryModel'],
];
const maxBytes = 100 * 1024 * 1024;
const invalid = (message, status = 409) => Object.assign(new Error(message), { status });
const checksum = (payload) => createHash('sha256').update(payload).digest('hex');

export const captureCompany = async (models, companyId, transaction) => {
  const company = await models.CompanyModel.findByPk(companyId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!company) throw invalid('Empresa no encontrada', 404);
  const snapshot = { version: 1, companyId, company: { name: company.name }, tables: {} };
  for (const [key, modelName] of backupTables) {
    snapshot.tables[key] = await models[modelName].unscoped().findAll({ where: { companyId }, paranoid: false,
      order: [['id', 'ASC']], raw: true, transaction });
  }
  return snapshot;
};

export const writeSnapshot = async (backupDir, snapshot) => {
  const payload = JSON.stringify(snapshot);
  if (Buffer.byteLength(payload) > maxBytes) throw invalid('Respaldo demasiado grande', 413);
  await mkdir(backupDir, { recursive: true, mode: 0o700 });
  const fileName = `${randomBytes(24).toString('hex')}.json`;
  const file = path.join(backupDir, fileName);
  try { await writeFile(file, payload, { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') await unlink(file).catch(() => {}); throw error; }
  return { fileName, sha256: checksum(payload) };
};

export const removeSnapshot = async (backupDir, fileName) => {
  if (fileName) await unlink(path.join(backupDir, fileName)).catch(() => {});
};

export const readSnapshot = async (backupDir, backup, companyId) => {
  if (!/^[a-f0-9]{48}\.json$/.test(backup.fileName)) throw invalid('Archivo de respaldo inválido');
  const file = path.join(backupDir, backup.fileName);
  const info = await stat(file).catch(() => null);
  if (!info || !info.isFile() || info.size > maxBytes) throw invalid('Archivo de respaldo no disponible');
  const payload = await readFile(file, 'utf8');
  if (checksum(payload) !== backup.sha256) throw invalid('Integridad del respaldo inválida');
  let snapshot;
  try { snapshot = JSON.parse(payload); } catch { throw invalid('Contenido del respaldo inválido'); }
  if (snapshot.version !== 1 || snapshot.companyId !== companyId || typeof snapshot.company?.name !== 'string' ||
      !backupTables.every(([key]) => Array.isArray(snapshot.tables?.[key]) &&
        snapshot.tables[key].every((row) => row.companyId === companyId))) {
    throw invalid('Contenido del respaldo inválido');
  }
  return snapshot;
};

export const replaceCompany = async (models, companyId, snapshot, transaction) => {
  const company = await models.CompanyModel.findByPk(companyId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!company) throw invalid('Empresa no encontrada', 404);
  for (const [key, modelName] of [...backupTables].reverse()) {
    await models[modelName].unscoped().destroy({ where: { companyId }, force: true, transaction });
  }
  await company.update({ name: snapshot.company.name }, { transaction });
  for (const [key, modelName] of backupTables) {
    if (snapshot.tables[key].length) await models[modelName].unscoped().bulkCreate(snapshot.tables[key], { transaction, validate: true });
  }
};
