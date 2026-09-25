import { DataTypes } from 'sequelize';

export const defineExportRecordModel = (sequelize) => sequelize.define('ExportRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  kind: { type: DataTypes.STRING(30), allowNull: false },
  format: { type: DataTypes.STRING(10), allowNull: false },
  filters: { type: DataTypes.JSON, allowNull: false },
  rowCount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false },
}, { engine: 'InnoDB' });
