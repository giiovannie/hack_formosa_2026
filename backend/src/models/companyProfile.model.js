import { DataTypes } from 'sequelize';

const textList = () => ({
  type: DataTypes.JSON,
  allowNull: false,
  validate: {
    isTextList(value) {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
        throw new Error('Debe ser una lista de textos no vacíos');
      }
    },
  },
});

export const defineCompanyProfileModel = (sequelize) => sequelize.define('CompanyProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  industry: { type: DataTypes.STRING, allowNull: false },
  areas: textList(),
  availableData: textList(),
  analysisObjectives: textList(),
}, { engine: 'InnoDB' });
