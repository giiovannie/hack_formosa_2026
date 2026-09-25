import { matchedData } from 'express-validator';
import { defaultBackupDir, captureCompany, writeSnapshot, removeSnapshot, readSnapshot, replaceCompany } from '../helpers/backup.helper.js';

const publicFields = ['id', 'companyId', 'createdById', 'status', 'kind', 'createdAt'];

export const createBackupControllers = (database, models, backupDir = defaultBackupDir) => ({
  create: async (req, res, next) => {
    let fileName;
    try {
      const snapshot = await database.transaction((transaction) => captureCompany(models, req.user.companyId, transaction));
      const file = await writeSnapshot(backupDir, snapshot);
      fileName = file.fileName;
      const backup = await models.BackupModel.create({ companyId: req.user.companyId, createdById: req.user.id,
        ...file, status: 'ready', kind: 'manual' });
      fileName = null;
      return res.status(201).json({ message: 'Respaldo creado', backup: await models.BackupModel.findByPk(backup.id, { attributes: publicFields }) });
    } catch (error) { await removeSnapshot(backupDir, fileName); return next(error); }
  },
  list: async (req, res, next) => {
    try {
      const backups = await models.BackupModel.findAll({ where: { companyId: req.user.companyId },
        attributes: publicFields, order: [['id', 'DESC']], limit: 100 });
      return res.status(200).json({ message: 'Respaldos obtenidos', backups });
    } catch (error) { return next(error); }
  },
  restore: async (req, res, next) => {
    let safetyFileName;
    try {
      const { id } = matchedData(req, { locations: ['params'] });
      const backup = await models.BackupModel.findOne({ where: { id, companyId: req.user.companyId, status: 'ready' } });
      if (!backup) return res.status(404).json({ message: 'Respaldo no encontrado' });
      const snapshot = await readSnapshot(backupDir, backup, req.user.companyId);
      const result = await database.transaction(async (transaction) => {
        const current = await captureCompany(models, req.user.companyId, transaction);
        const file = await writeSnapshot(backupDir, current);
        safetyFileName = file.fileName;
        const safetyBackup = await models.BackupModel.create({ companyId: req.user.companyId, createdById: req.user.id,
          ...file, status: 'ready', kind: 'pre_restore' }, { transaction });
        await replaceCompany(models, req.user.companyId, snapshot, transaction);
        const event = await models.RestoreEventModel.create({ companyId: req.user.companyId, backupId: backup.id,
          safetyBackupId: safetyBackup.id, performedById: req.user.id, restoredAt: new Date() }, { transaction });
        return { eventId: event.id, backupId: backup.id, safetyBackupId: safetyBackup.id, restoredAt: event.restoredAt };
      });
      safetyFileName = null;
      return res.status(200).json({ message: 'Restauración completada', restoration: result });
    } catch (error) { await removeSnapshot(backupDir, safetyFileName); return next(error); }
  },
  restorations: async (req, res, next) => {
    try {
      const restorations = await models.RestoreEventModel.findAll({ where: { companyId: req.user.companyId },
        attributes: ['id', 'backupId', 'safetyBackupId', 'performedById', 'restoredAt'], order: [['id', 'DESC']], limit: 100 });
      return res.status(200).json({ message: 'Restauraciones obtenidas', restorations });
    } catch (error) { return next(error); }
  },
});
