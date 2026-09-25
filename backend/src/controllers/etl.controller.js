import { matchedData } from 'express-validator';
import { runEtl } from '../helpers/runEtl.helper.js';
import { publicProcessingRun } from '../helpers/publicProcessingRun.helper.js';

const missing = () => Object.assign(new Error('Importación o proceso no encontrado'), { status: 404 });
const conflict = () => Object.assign(new Error('La importación ya se está procesando'), { status: 409 });

export const createEtlControllers = (database, models, config) => {
  const start = async (companyId, dataImportId) => database.transaction(async (transaction) => {
    const dataImport = await models.DataImportModel.scope('withRawPayload').findOne({
      where: { id: dataImportId, companyId }, transaction, lock: transaction.LOCK.UPDATE,
    });
    if (!dataImport) throw missing();
    if (dataImport.status === 'processing') throw conflict();
    await dataImport.update({ status: 'processing' }, { transaction });
    const run = await models.ProcessingRunModel.create({ companyId, dataImportId, status: 'processing',
      stages: [{ name: 'extraction', status: 'completed' }, { name: 'validation', status: 'processing' }] }, { transaction });
    return { dataImport, run };
  });
  const execute = async (req, res, next, dataImportId) => {
    let run;
    try {
      const started = await start(req.user.companyId, dataImportId);
      run = started.run;
      try {
        const result = await runEtl(started.dataImport, config);
        await database.transaction(async (transaction) => {
          await run.update({ status: 'completed', result, stages: [
            'extraction', 'validation', 'cleaning', 'sanitization', 'normalization', 'classification', 'loading',
          ].map((name) => ({ name, status: 'completed' })) }, { transaction });
          await started.dataImport.update({ status: 'completed' }, { transaction });
        });
      } catch (error) {
        await database.transaction(async (transaction) => {
          await run.update({ status: 'failed', errors: [error.message.slice(0, 200)], stages: [
            { name: 'extraction', status: 'completed' }, { name: 'validation', status: 'failed' },
          ] }, { transaction });
          await started.dataImport.update({ status: 'failed' }, { transaction });
        });
      }
      return res.status(200).json({ message: 'Proceso ETL finalizado', process: publicProcessingRun(run) });
    } catch (error) { return next(error); }
  };
  return {
    processImport: (req, res, next) => execute(req, res, next, matchedData(req, { locations: ['params'] }).importacionId),
    reprocess: async (req, res, next) => {
      try {
        const { id } = matchedData(req, { locations: ['params'] });
        const prior = await models.ProcessingRunModel.findOne({ where: { id, companyId: req.user.companyId } });
        if (!prior) throw missing();
        return execute(req, res, next, prior.dataImportId);
      } catch (error) { return next(error); }
    },
    getProcess: async (req, res, next) => {
      try {
        const { id } = matchedData(req, { locations: ['params'] });
        const run = await models.ProcessingRunModel.findOne({ where: { id, companyId: req.user.companyId } });
        if (!run) throw missing();
        return res.status(200).json({ message: 'Proceso ETL obtenido', process: publicProcessingRun(run) });
      } catch (error) { return next(error); }
    },
  };
};
