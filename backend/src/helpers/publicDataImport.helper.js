export const publicDataImport = (dataImport) => {
  const { id, companyId, sourceId, kind, dataType, metadata, originalFilename, status, createdAt, updatedAt } = dataImport;
  return { id, companyId, sourceId, kind, dataType, metadata, originalFilename, status, createdAt, updatedAt };
};
