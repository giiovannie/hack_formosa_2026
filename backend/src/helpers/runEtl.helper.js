import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const defaultScript = fileURLToPath(new URL('../../etl/process.py', import.meta.url));

export const runEtl = (dataImport, config = {}) => new Promise((resolve, reject) => {
  const python = config.PYTHON_EXECUTABLE || 'python';
  const script = config.ETL_SCRIPT_PATH || defaultScript;
  const child = spawn(python, [script], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell: false });
  let stdout = '';
  let finished = false;
  const finish = (error, value) => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    if (error) reject(error);
    else resolve(value);
  };
  const timer = setTimeout(() => {
    child.kill();
    finish(new Error('Tiempo de ETL agotado'));
  }, 30000);
  child.on('error', () => finish(new Error('No se pudo iniciar Python')));
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
    if (stdout.length > 8 * 1024 * 1024) {
      child.kill();
      finish(new Error('Resultado ETL demasiado grande'));
    }
  });
  child.stderr.resume();
  child.on('close', (code) => {
    if (finished) return;
    if (code !== 0) return finish(new Error('Falló el proceso ETL'));
    try {
      const output = JSON.parse(stdout);
      if (output.ok === false && typeof output.error === 'string') return finish(new Error(output.error));
      if (output.ok !== true || !output.result) throw new Error('Resultado ETL inválido');
      return finish(null, output.result);
    } catch { return finish(new Error('Resultado ETL inválido')); }
  });
  child.stdin.on('error', () => {});
  child.stdin.end(JSON.stringify({ kind: dataImport.kind, rawPayload: dataImport.rawPayload }));
});
