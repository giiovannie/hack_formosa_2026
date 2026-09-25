import { DataTypes } from 'sequelize';

export const defineBackupModel = (sequelize) => sequelize.define('Backup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  createdById: { type: DataTypes.INTEGER, allowNull: false },
  fileName: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  sha256: { type: DataTypes.STRING(64), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false },
  kind: { type: DataTypes.STRING(20), allowNull: false },
}, { engine: 'InnoDB' });
