import { useCallback, useEffect, useState } from 'react'
import { getModule, postModule, uploadModule } from '@/src/api'

export default function DataEntry() {
  const [sources, setSources] = useState([])
  const [sourceId, setSourceId] = useState('')
  const [dataType, setDataType] = useState('')
  const [file, setFile] = useState(null)
  const [record, setRecord] = useState({ product: '', quantity: '', price: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadSources = useCallback(async () => {
    try {
      const { sources: available = [] } = await getModule('/fuentes?page=1&limit=100')
      setSources(available)
      if (!sourceId && available[0]) setSourceId(String(available[0].id))
    } catch (cause) { setError(cause.message) }
  }, [sourceId])
  useEffect(() => { loadSources() }, [loadSources])

  const processImport = async (dataImport) => {
    const { process } = await postModule(`/etl/procesar/${dataImport.id}`)
    if (process?.status !== 'completed') {
      throw new Error(process?.errors?.[0] || 'El proceso ETL no terminó correctamente.')
    }
    await postModule(`/calidad/${dataImport.id}/validar`, {})
    const result = await postModule(`/datos-procesados/importaciones/${dataImport.id}`, {})
    return result.persistedRecords
  }
  const receive = async (event) => {
    event.preventDefault()
    if (!sourceId || !dataType.trim()) { setError('Elegí una fuente y el tipo de datos.'); return }
    if (!file) { setError('Seleccioná un archivo CSV.'); return }
    setBusy(true); setError(''); setMessage('Guardando y procesando el archivo…')
    try {
      const { dataImport } = await uploadModule('/datos/importaciones', { sourceId, dataType: dataType.trim() }, file)
      const count = await processImport(dataImport)
      setMessage(`Importación ${dataImport.id} guardada. ${count} registros persistidos.`)
      setFile(null)
    } catch (cause) { setMessage(''); setError(cause.message) } finally { setBusy(false) }
  }
  const receiveManual = async (event) => {
    event.preventDefault()
    if (!sourceId || !dataType.trim()) { setError('Elegí una fuente y el tipo de datos.'); return }
    setBusy(true); setError(''); setMessage('Guardando y procesando el registro…')
    try {
      const { dataImport } = await postModule('/datos/registros', { sourceId: Number(sourceId), dataType: dataType.trim(), record })
      const count = await processImport(dataImport)
      setMessage(`Registro ${dataImport.id} guardado. ${count} registros persistidos.`)
    } catch (cause) { setMessage(''); setError(cause.message) } finally { setBusy(false) }
  }
  const createSource = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true); setError('')
    try {
      await postModule('/fuentes', { name: form.get('name'), origin: form.get('origin'), type: 'internal', status: 'active' })
      formElement.reset()
      await loadSources()
    } catch (cause) { setError(cause.message) } finally { setBusy(false) }
  }

  return <main className="min-h-screen bg-[#090d15] px-5 py-10 text-[#f3f5f7]"><div className="mx-auto max-w-4xl"><h1 className="text-3xl font-bold">Cargar datos</h1><p className="mt-2 text-sm text-[#8e9aac]">Los archivos y registros se guardan, procesan y persisten en la base de datos de tu empresa.</p>
    {!sources.length && <form onSubmit={createSource} className="mt-6 grid gap-3 rounded-xl border border-[#293749] bg-[#0f1621] p-5 sm:grid-cols-3"><h2 className="sm:col-span-3 font-semibold">Creá tu primera fuente interna</h2><input name="name" required placeholder="Nombre de la fuente" className="rounded-lg border border-[#334154] bg-[#111b29] p-3 text-sm"/><input name="origin" required placeholder="Sistema u origen" className="rounded-lg border border-[#334154] bg-[#111b29] p-3 text-sm"/><button disabled={busy} className="rounded-lg bg-[#ff6b19] p-3 text-sm font-semibold">Crear fuente</button></form>}
    {sources.length > 0 && <><div className="mt-6 grid gap-3 rounded-xl border border-[#293749] bg-[#0f1621] p-5 sm:grid-cols-2"><label className="text-sm">Fuente<select value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="mt-2 block w-full rounded-lg border border-[#334154] bg-[#111b29] p-3">{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label><label className="text-sm">Tipo de datos<input required value={dataType} onChange={(event) => setDataType(event.target.value)} placeholder="Ej. inventario" className="mt-2 block w-full rounded-lg border border-[#334154] bg-[#111b29] p-3"/></label></div>
    <form onSubmit={receive} className="mt-4 rounded-xl border border-[#293749] bg-[#0f1621] p-5"><h2 className="font-semibold">Importar archivo CSV</h2><p className="mt-1 text-xs text-[#8e9aac]">Formato UTF-8, máximo 1 MB.</p><input type="file" accept=".csv,text/csv" required onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-4 block w-full text-sm"/><button disabled={busy} className="mt-4 rounded-lg bg-[#ff6b19] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Importar y procesar</button></form>
    <form onSubmit={receiveManual} className="mt-4 rounded-xl border border-[#293749] bg-[#0f1621] p-5"><h2 className="font-semibold">Agregar registro manual</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{Object.entries(record).map(([key, value]) => <label key={key} className="text-sm capitalize">{key}<input required value={value} onChange={(event) => setRecord((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 block w-full rounded-lg border border-[#334154] bg-[#111b29] p-3"/></label>)}</div><button disabled={busy} className="mt-4 rounded-lg border border-[#46566b] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Guardar registro</button></form></>}
    {message && <p role="status" className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-200">{message}</p>}{error && <p role="alert" className="mt-4 rounded-lg border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</p>}
  </div></main>
}
