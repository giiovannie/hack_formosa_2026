import { matchedData } from 'express-validator';

export const createCompanyProfileControllers = (database, models) => ({
  getCompanyProfile: async (req, res, next) => {
    try {
      const profile = await models.CompanyProfileModel.findOne({ where: { companyId: req.user.companyId } });
      return res.status(200).json({ message: 'Perfil obtenido correctamente', profile });
    } catch (error) { return next(error); }
  },
  updateCompanyProfile: async (req, res, next) => {
    try {
      const data = matchedData(req, { locations: ['body'] });
      const companyId = req.user.companyId;
      const profile = await database.transaction(async (transaction) => {
        const company = await models.CompanyModel.findByPk(companyId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!company) throw Object.assign(new Error('Empresa no encontrada'), { status: 404 });
        const actor = await models.UserModel.findOne({ where: { id: req.user.id, companyId }, transaction });
        if (!actor || actor.role !== 'owner') throw Object.assign(new Error('No tenés permisos para esta operación'), { status: 403 });
        const existing = await models.CompanyProfileModel.findOne({ where: { companyId }, transaction });
        if (existing) return existing.update(data, { transaction });
        return models.CompanyProfileModel.create({ ...data, companyId }, { transaction });
      });
      return res.status(200).json({ message: 'Perfil guardado correctamente', profile });
    } catch (error) { return next(error); }
  },
});
