import { useCallback, useEffect, useState } from 'react'
import { getModule } from '@/src/api'

const labels = {
  processId: 'Proceso', dataImportId: 'Importación', totalProcessed: 'Registros procesados',
  validRecords: 'Registros válidos', rejectedRecords: 'Registros observados', duplicates: 'Duplicados',
  incompleteRecords: 'Registros incompletos', status: 'Estado', id: 'ID', name: 'Nombre',
  qualityErrors: 'Filas para revisar',
  type: 'Tipo', origin: 'Origen', source: 'Fuente', sourceId: 'ID de fuente', dataType: 'Tipo de datos',
  createdAt: 'Fecha de creación', updatedAt: 'Última actualización', consultedAt: 'Fecha de consulta',
  queryType: 'Consulta', parameters: 'Parámetros', history: 'Historial de procesos', importation: 'Importación',
  runs: 'Procesos ETL', stages: 'Etapas', errors: 'Errores', quality: 'Calidad', qualityValidatedAt: 'Calidad validada',
  persistedRecords: 'Registros guardados', totalOperations: 'Operaciones', averagePerObservedPeriod: 'Promedio por período',
  periods: 'Actividad por período', byArea: 'Actividad por área', byOperation: 'Actividad por operación',
  missingArea: 'Sin área', missingOperation: 'Sin operación', interpretation: 'Interpretación',
  analysis: 'Análisis', metric: 'Métrica', field: 'Campo', from: 'Desde', to: 'Hasta', interval: 'Intervalo',
  trend: 'Tendencia', direction: 'Dirección', slopePerInterval: 'Cambio por período', estimate: 'Estimación',
  observedPeriods: 'Períodos observados', method: 'Método', evidence: 'Datos de referencia',
  alerts: 'Alertas', condition: 'Condición', operator: 'Operador', threshold: 'Umbral', evaluatedAt: 'Evaluada',
  acknowledged: 'Reconocida', active: 'Activa', triggered: 'Activada', not_triggered: 'Sin activación',
  insufficient_data: 'Datos insuficientes', completed: 'Completado', failed: 'Fallido', processing: 'Procesando',
  pending: 'Pendiente', success: 'Correcta', name: 'Nombre', deletedAt: 'Fecha de baja',
  total: 'Total', count: 'Cantidad', period: 'Período', area: 'Área', operation: 'Operación',
  internal: 'Datos de la empresa', external: 'Serie externa', points: 'Valores por período', observedOverlap: 'Comparación por período',
  internalValue: 'Valor empresa', externalValue: 'Valor externo', includedRecords: 'Registros incluidos',
  provenance: 'Procedencia', seriesId: 'Serie consultada', queryId: 'Consulta', sourceUpdatedAt: 'Actualizada en origen',
  interpretation: 'Lectura', valid: 'Válido', invalid: 'Inválido', row: 'Fila', field: 'Campo', reason: 'Motivo',
}

const labelFor = (key) => labels[key] || key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/^./, (character) => character.toUpperCase())
const isScalar = (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value)
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  const states = { completed: 'Completado', failed: 'Fallido', processing: 'Procesando', pending: 'Pendiente',
    success: 'Correcta', active: 'Activa', acknowledged: 'Reconocida', triggered: 'Activada',
    not_triggered: 'Sin activación', insufficient_data: 'Datos insuficientes', increasing: 'En aumento',
    decreasing: 'En descenso', stable: 'Estable', descriptive: 'Descriptiva', observed: 'Disponible',
    insufficient_overlap: 'Coincidencia insuficiente' }
  if (typeof value === 'string' && states[value]) return states[value]
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toLocaleString('es-AR')
  }
  return String(value)
}

function ResultTable({ rows }) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  return <div className="overflow-x-auto rounded-lg border border-[#293749]"><table className="w-full text-left text-sm"><thead className="bg-[#111b29] text-xs uppercase tracking-wide text-[#8e9aac]"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-medium">{labelFor(column)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? `${row.period ?? row.row ?? 'item'}-${index}`} className="border-t border-[#293749] text-[#dce3ec]">{columns.map((column) => <td key={column} className="px-4 py-3">{formatValue(row[column])}</td>)}</tr>)}</tbody></table></div>
}

function DataBlock({ name, value, depth = 0 }) {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) {
    if (!value.length) return <section key={name} className="rounded-xl border border-[#293749] bg-[#0f1621] p-4"><h3 className="mb-2 font-semibold">{labelFor(name)}</h3><p className="text-sm text-[#8e9aac]">Sin datos para mostrar.</p></section>
    if (value.every(isScalar)) return <section key={name} className="rounded-xl border border-[#293749] bg-[#0f1621] p-4"><h3 className="mb-3 font-semibold">{labelFor(name)}</h3><div className="flex flex-wrap gap-2">{value.map((item, index) => <span key={`${item}-${index}`} className="rounded-full bg-[#182434] px-3 py-1.5 text-sm text-[#dce3ec]">{formatValue(item)}</span>)}</div></section>
    if (value.every((item) => item && typeof item === 'object' && !Array.isArray(item)) && value.every((item) => Object.values(item).every(isScalar))) return <section key={name} className="space-y-3"><h3 className="font-semibold">{labelFor(name)}</h3><ResultTable rows={value} /></section>
    return <section key={name} className="space-y-3"><h3 className="font-semibold">{labelFor(name)}</h3><div className="grid gap-3 md:grid-cols-2">{value.map((item, index) => <article key={item?.id ?? index} className="rounded-xl border border-[#293749] bg-[#0f1621] p-4"><DataObject value={item} depth={depth + 1} /></article>)}</div></section>
  }
  if (typeof value === 'object') return <section key={name} className="space-y-3"><h3 className="font-semibold">{labelFor(name)}</h3><article className="rounded-xl border border-[#293749] bg-[#0f1621] p-4"><DataObject value={value} depth={depth + 1} /></article></section>
  return <div key={name} className="rounded-xl border border-[#293749] bg-[#0f1621] p-4"><p className="text-xs text-[#8e9aac]">{labelFor(name)}</p><p className="mt-1 break-words text-lg font-semibold text-[#f3f5f7]">{formatValue(value)}</p></div>
}

function DataObject({ value, depth = 0 }) {
  if (!value || typeof value !== 'object') return <p className="text-sm">{formatValue(value)}</p>
  const entries = Object.entries(value).filter(([key]) => key !== 'message')
  const scalarEntries = entries.filter(([, item]) => isScalar(item))
  const nestedEntries = entries.filter(([, item]) => !isScalar(item))
  return <div className="space-y-4">
    {!!scalarEntries.length && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{scalarEntries.map(([key, item]) => <DataBlock key={key} name={key} value={item} depth={depth} />)}</div>}
    {!!nestedEntries.length && <div className="space-y-5">{nestedEntries.map(([key, item]) => <DataBlock key={key} name={key} value={item} depth={depth} />)}</div>}
  </div>
}

export function ApiDataView({ data, emptyMessage = 'Todavía no hay datos para mostrar.' }) {
  const payload = data && Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'message'))
  if (!payload || !Object.keys(payload).length) return <p className="rounded-xl border border-dashed border-[#39485c] p-8 text-center text-sm text-[#8e9aac]">{emptyMessage}</p>
  return <DataObject value={payload} />
}

export function useApiModule(loader) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setData(await loader()) } catch (cause) { setData(null); setError(cause.message) } finally { setLoading(false) }
  }, [loader])
  useEffect(() => { reload() }, [reload])
  return { data, error, loading, reload, setData }
}

export function ApiModule({ title, description, path, loader: customLoader, emptyMessage = 'Todavía no hay datos guardados para esta empresa.' }) {
  const pathLoader = useCallback(() => getModule(path), [path])
  const loader = customLoader || pathLoader
  const { data, error, loading, reload } = useApiModule(loader)
  return <main className="min-h-screen bg-[#090d15] px-5 py-10 text-[#f3f5f7]"><section className="mx-auto max-w-5xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#ff792c]">Datos de tu empresa</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-[#8e9aac]">{description}</p><div className="mt-7">{loading ? <p className="rounded-xl border border-[#293749] bg-[#0f1621] p-5 text-sm text-[#b7c0cc]">Consultando datos…</p> : error ? <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-5"><p className="text-sm text-rose-200">{error}</p><button onClick={reload} className="mt-3 text-sm font-semibold text-[#ff9a63]">Reintentar</button></div> : <ApiDataView data={data} emptyMessage={emptyMessage} />}</div></section></main>
}
