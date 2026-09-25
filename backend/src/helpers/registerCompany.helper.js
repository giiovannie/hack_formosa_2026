import { hashPassword } from './bcrypt.helper.js';

// Only explicitly allowed attributes are persisted. The caller cannot choose
// the first user's role or tenant, even when extra properties are supplied.
export const registerCompany = async (sequelize, models, companyData, ownerData) => {
  const password = await hashPassword(ownerData.password);
  return sequelize.transaction(async (transaction) => {
    const company = await models.CompanyModel.create({ name: companyData.name }, { transaction });
    const user = await models.UserModel.create({
      firstName: ownerData.firstName,
      lastName: ownerData.lastName,
      email: ownerData.email,
      password,
      role: 'owner',
      companyId: company.id,
    }, { transaction });
    return { company, user };
  });
};
