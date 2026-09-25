export const publicUser = (user) => {
  const { id, firstName, lastName, email, role, companyId, createdAt, updatedAt } = user;
  return { id, firstName, lastName, email, role, companyId, createdAt, updatedAt };
};
export const publicCompany = (company) => {
  const { id, name, createdAt, updatedAt } = company;
  return { id, name, createdAt, updatedAt };
};
