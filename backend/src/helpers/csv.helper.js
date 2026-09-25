const safeText = (value) => {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[=+@\t\r]/.test(text) || (text.startsWith('-') && !/^-\d+(?:\.\d+)?$/.test(text))) return `'${text}`;
  return text;
};

const cell = (value) => `"${safeText(value).replaceAll('"', '""')}"`;

export const toCsv = (headers, rows) => `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`;
