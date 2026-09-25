import { useCallback, useEffect, useState } from 'react'
import { getRecentImports, postModule } from '@/src/api'

export default function ProcessingDashboard({ embedded = false }) {
  const [imports, setImports] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const load = useCallback(async () => {
    try { setImports(await getRecentImports()); setError('') }
    catch (cause) { setError(cause.message) }
  }, [])
  useEffect(() => { load() }, [load])
  const process = async (item) => {
    if (item.status === 'completed') return
    setBusyId(item.id); setError('')
    try {
      const { process: etlProcess } = await postModule(`/etl/procesar/${item.id}`)
      if (etlProcess?.status !== 'completed') {
        throw new Error(etlProcess?.errors?.[0] || 'El proceso ETL no terminó correctamente.')
      }
      await postModule(`/calidad/${item.id}/validar`, {})
      await postModule(`/datos-procesados/importaciones/${item.id}`, {})
      await load()
    } catch (cause) { setError(cause.message) } finally { setBusyId(null) }
  }
  return <section className={`${embedded ? 'mx-auto max-w-5xl px-5 pb-10' : 'min-h-screen px-5 py-10'} bg-[#090d15] text-[#f3f5f7]`}><div className="mx-auto max-w-5xl"><h2 className="text-2xl font-bold">Procesamiento ETL</h2><p className="mt-2 text-sm text-[#8e9aac]">Estado real de las importaciones y procesos guardados para tu empresa.</p>{error && <p role="alert" className="mt-4 rounded-lg bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p>}<div className="mt-5 space-y-3">{imports.length ? imports.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#293749] bg-[#0f1621] p-4"><div><p className="font-semibold">{item.dataType} · Importación {item.id}</p><p className="mt-1 text-xs text-[#8e9aac]">{item.kind} · {item.status} · {new Date(item.createdAt).toLocaleString('es-AR')}</p></div><button disabled={busyId === item.id || item.status === 'completed'} onClick={() => process(item)} className="rounded-lg bg-[#ff6b19] px-4 py-2 text-sm font-semibold disabled:opacity-50">{busyId === item.id ? 'Procesando…' : item.status === 'completed' ? 'Procesado' : 'Procesar, validar y guardar'}</button></article>) : <p className="rounded-xl border border-dashed border-[#39485c] p-8 text-center text-sm text-[#8e9aac]">Todavía no hay importaciones para procesar.</p>}</div></div></section>
}
