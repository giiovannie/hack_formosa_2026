export const publicProcessingRun = (run) => {
  const data = run.toJSON();
  if (data.result) data.result = { summary: data.result.summary };
  return data;
};
