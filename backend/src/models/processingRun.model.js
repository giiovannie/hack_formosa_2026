import { DataTypes } from 'sequelize';

export const defineProcessingRunModel = (sequelize) => sequelize.define('ProcessingRun', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  dataImportId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending', validate: { isIn: [['pending', 'processing', 'completed', 'failed']] } },
  stages: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  errors: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  result: { type: DataTypes.JSON, allowNull: true },
}, { engine: 'InnoDB' });
