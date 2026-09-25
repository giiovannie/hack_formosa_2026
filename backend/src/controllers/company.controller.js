import { matchedData } from 'express-validator';
import { registerCompany } from '../helpers/registerCompany.helper.js';
import { publicCompany, publicUser } from '../helpers/publicData.helper.js';

export const createCompanyControllers = (database, models) => ({
  createCompany: async (req, res, next) => {
    try {
      const data = matchedData(req);
      const { company, user } = await registerCompany(database, models, data, data.owner);
      return res.status(201).json({ message: 'Empresa registrada correctamente', company: publicCompany(company), user: publicUser(user) });
    } catch (error) { return next(error); }
  },
  getCompanyById: async (req, res, next) => {
    try {
      const { id } = matchedData(req);
      if (id !== req.user.companyId) return res.status(404).json({ message: 'Empresa no encontrada' });
      const company = await models.CompanyModel.findByPk(req.user.companyId);
      if (!company) return res.status(404).json({ message: 'Empresa no encontrada' });
      return res.status(200).json({ message: 'Empresa obtenida correctamente', company: publicCompany(company) });
    } catch (error) { return next(error); }
  },
});
