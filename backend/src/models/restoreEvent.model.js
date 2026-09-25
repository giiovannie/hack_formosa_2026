import { DataTypes } from 'sequelize';

export const defineRestoreEventModel = (sequelize) => sequelize.define('RestoreEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  backupId: { type: DataTypes.INTEGER, allowNull: false },
  safetyBackupId: { type: DataTypes.INTEGER, allowNull: false },
  performedById: { type: DataTypes.INTEGER, allowNull: false },
  restoredAt: { type: DataTypes.DATE, allowNull: false },
}, { engine: 'InnoDB' });
