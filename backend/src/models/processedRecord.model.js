import { DataTypes } from 'sequelize';

export const defineProcessedRecordModel = (sequelize) => sequelize.define('ProcessedRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  sourceId: { type: DataTypes.INTEGER, allowNull: false },
  dataImportId: { type: DataTypes.INTEGER, allowNull: false },
  processingRunId: { type: DataTypes.INTEGER, allowNull: false },
  rowNumber: { type: DataTypes.INTEGER, allowNull: false },
  dataType: { type: DataTypes.STRING(100), allowNull: false },
  values: { type: DataTypes.JSON, allowNull: false },
}, {
  engine: 'InnoDB',
  indexes: [{ unique: true, fields: ['processingRunId', 'rowNumber'] }, { fields: ['companyId', 'dataType'] }],
});
