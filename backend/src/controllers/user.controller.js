import { matchedData } from 'express-validator';
import { hashPassword } from '../helpers/bcrypt.helper.js';
import { publicUser } from '../helpers/publicData.helper.js';

const fail = (status, message) => Object.assign(new Error(message), { status });

export const createUserControllers = (database, models) => {
  // All user writes lock the same company row, then re-check the acting owner.
  // This also prevents stale authorization during concurrent role changes.
  const withOwnerLock = (actor, action) => database.transaction(async (transaction) => {
    const company = await models.CompanyModel.findByPk(actor.companyId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!company) throw fail(404, 'Empresa no encontrada');
    const owner = await models.UserModel.findOne({ where: { id: actor.id, companyId: actor.companyId }, transaction });
    if (!owner || owner.role !== 'owner') throw fail(403, 'No tenés permisos para esta operación');
    return action(transaction);
  });
  const getTarget = async (id, companyId, transaction) => {
    const user = await models.UserModel.findOne({ where: { id, companyId }, transaction });
    if (!user) throw fail(404, 'Usuario no encontrado');
    return user;
  };
  const protectLastOwner = async (user, transaction) => {
    if (user.role === 'owner' && await models.UserModel.count({ where: { companyId: user.companyId, role: 'owner' }, transaction }) <= 1) {
      throw fail(409, 'No se puede eliminar ni degradar al último owner');
    }
  };
  return {
    getAllUsers: async (req, res, next) => {
      try {
        const { page, limit } = matchedData(req);
        const { count, rows } = await models.UserModel.findAndCountAll({
          where: { companyId: req.user.companyId }, limit, offset: (page - 1) * limit, order: [['id', 'ASC']],
        });
        return res.status(200).json({ message: 'Usuarios obtenidos correctamente', users: rows.map(publicUser),
          pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
      } catch (error) { return next(error); }
    },
    createUser: async (req, res, next) => {
      try {
        const data = matchedData(req);
        data.password = await hashPassword(data.password);
        const user = await withOwnerLock(req.user, (transaction) => models.UserModel.create({ ...data, companyId: req.user.companyId }, { transaction }));
        return res.status(201).json({ message: 'Usuario creado correctamente', user: publicUser(user) });
      } catch (error) { return next(error); }
    },
    updateUser: async (req, res, next) => {
      try {
        const { id, ...data } = matchedData(req);
        if (data.password !== undefined) data.password = await hashPassword(data.password);
        const user = await withOwnerLock(req.user, async (transaction) => {
          const target = await getTarget(id, req.user.companyId, transaction);
          if (data.role !== 'owner') await protectLastOwner(target, transaction);
          return target.update(data, { transaction });
        });
        return res.status(200).json({ message: 'Usuario actualizado correctamente', user: publicUser(user) });
      } catch (error) { return next(error); }
    },
    deleteUser: async (req, res, next) => {
      try {
        const { id } = matchedData(req);
        await withOwnerLock(req.user, async (transaction) => {
          const target = await getTarget(id, req.user.companyId, transaction);
          await protectLastOwner(target, transaction);
          await target.destroy({ transaction });
        });
        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
      } catch (error) { return next(error); }
    },
  };
};
