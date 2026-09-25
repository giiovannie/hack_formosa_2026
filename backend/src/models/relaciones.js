import { defineCompanyModel } from './company.model.js';
import { defineUserModel } from './user.model.js';
import { defineCompanyProfileModel } from './companyProfile.model.js';
import { defineSourceModel } from './source.model.js';
import { defineDataImportModel } from './dataImport.model.js';

export const initializeModels = (sequelize) => {
  const CompanyModel = defineCompanyModel(sequelize);
  const UserModel = defineUserModel(sequelize);
  const CompanyProfileModel = defineCompanyProfileModel(sequelize);
  const SourceModel = defineSourceModel(sequelize);
  const DataImportModel = defineDataImportModel(sequelize);
  const relation = {
    foreignKey: { name: 'companyId', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE',
  };
  CompanyModel.hasMany(UserModel, { ...relation, as: 'users' });
  UserModel.belongsTo(CompanyModel, { ...relation, as: 'company' });
  CompanyModel.hasOne(CompanyProfileModel, { ...relation, as: 'profile' });
  CompanyProfileModel.belongsTo(CompanyModel, { ...relation, as: 'company' });
  CompanyModel.hasMany(SourceModel, { ...relation, as: 'sources' });
  SourceModel.belongsTo(CompanyModel, { ...relation, as: 'company' });
  CompanyModel.hasMany(DataImportModel, { ...relation, as: 'dataImports' });
  DataImportModel.belongsTo(CompanyModel, { ...relation, as: 'company' });
  SourceModel.hasMany(DataImportModel, { foreignKey: { name: 'sourceId', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE', as: 'dataImports' });
  DataImportModel.belongsTo(SourceModel, { foreignKey: { name: 'sourceId', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE', as: 'source' });
  return { CompanyModel, UserModel, CompanyProfileModel, SourceModel, DataImportModel };
};
