import { DataTypes } from 'sequelize';

export const defineCompanyModel = (sequelize) => sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, { paranoid: true, engine: 'InnoDB' });
