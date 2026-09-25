import { DataTypes } from 'sequelize';

export const defineDataImportModel = (sequelize) => sequelize.define('DataImport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  sourceId: { type: DataTypes.INTEGER, allowNull: false },
  kind: { type: DataTypes.STRING(16), allowNull: false, validate: { isIn: [['file', 'manual']] } },
  dataType: { type: DataTypes.STRING(100), allowNull: false },
  metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  originalFilename: { type: DataTypes.STRING(255), allowNull: true },
  mimeType: { type: DataTypes.STRING(100), allowNull: true },
  rawPayload: { type: DataTypes.TEXT('medium'), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
}, {
  engine: 'InnoDB',
  defaultScope: { attributes: { exclude: ['rawPayload'] } },
  scopes: { withRawPayload: { attributes: { include: ['rawPayload'] } } },
});
