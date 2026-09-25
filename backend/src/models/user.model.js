import { DataTypes } from 'sequelize';

export const defineUserModel = (sequelize) => sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['owner', 'member']] } },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  paranoid: true,
  engine: 'InnoDB',
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: { include: ['password'] } } },
});
