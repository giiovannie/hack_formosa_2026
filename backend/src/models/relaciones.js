import { defineCompanyModel } from './company.model.js';
import { defineUserModel } from './user.model.js';

export const initializeModels = (sequelize) => {
  const CompanyModel = defineCompanyModel(sequelize);
  const UserModel = defineUserModel(sequelize);
  const relation = {
    foreignKey: { name: 'companyId', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE',
  };
  CompanyModel.hasMany(UserModel, { ...relation, as: 'users' });
  UserModel.belongsTo(CompanyModel, { ...relation, as: 'company' });
  return { CompanyModel, UserModel };
};
