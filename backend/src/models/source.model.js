import { DataTypes } from 'sequelize';

export const defineSourceModel = (sequelize) => sequelize.define('Source', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  type: { type: DataTypes.STRING(16), allowNull: false, validate: { isIn: [['internal', 'external']] } },
  origin: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(100), allowNull: false },
  sourceUpdatedAt: { type: DataTypes.DATE, allowNull: true },
}, { paranoid: true, engine: 'InnoDB' });
