import { DataTypes } from 'sequelize';

export const defineExternalQueryModel = (sequelize) => sequelize.define('ExternalQuery', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  sourceKey: { type: DataTypes.STRING(100), allowNull: false },
  queryType: { type: DataTypes.STRING(100), allowNull: false },
  parameters: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false },
  consultedAt: { type: DataTypes.DATE, allowNull: false },
}, { updatedAt: false, engine: 'InnoDB' });
