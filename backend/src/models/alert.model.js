import { DataTypes } from 'sequelize';

export const defineAlertModel = (sequelize) => sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  condition: { type: DataTypes.JSON, allowNull: false },
  evidence: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  evaluatedAt: { type: DataTypes.DATE, allowNull: false },
}, { engine: 'InnoDB' });
