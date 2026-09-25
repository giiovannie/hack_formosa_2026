import { useState } from 'react'
import { getModule } from '@/src/api'
import { ApiDataView } from '@/components/api-module'

export default function Contextualization() {
  const [seriesId, setSeriesId] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const analyze = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setResult(null)
    const to = new Date().toISOString().slice(0, 10)
    const from = `${new Date().getUTCFullYear() - 1}-01-01`
    const params = new URLSearchParams({ from, to, interval: 'month', metric: 'count', externalSourceId: 'datos-argentina-series', seriesId })
    try { setResult(await getModule(`/contextualizacion?${params}`)) } catch (cause) { setError(cause.message) } finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-[#090d15] px-5 py-10 text-[#f3f5f7]"><div className="mx-auto max-w-5xl"><h1 className="text-3xl font-bold">Contextualización temporal</h1><p className="mt-2 text-sm text-[#8e9aac]">Compara registros procesados de tu empresa con una serie oficial. La serie debe ser elegida por vos.</p><form onSubmit={analyze} className="mt-6 flex flex-wrap gap-3 rounded-xl border border-[#293749] bg-[#0f1621] p-5"><label className="min-w-64 flex-1 text-sm">ID de serie oficial<input required value={seriesId} onChange={(event) => setSeriesId(event.target.value)} placeholder="ID publicado por Datos Argentina" className="mt-2 block w-full rounded-lg border border-[#334154] bg-[#111b29] p-3"/></label><button disabled={busy} className="self-end rounded-lg bg-[#ff6b19] px-4 py-3 text-sm font-semibold disabled:opacity-50">{busy ? 'Consultando…' : 'Consultar y comparar'}</button></form>{error && <p role="alert" className="mt-4 rounded-lg bg-rose-950/50 p-4 text-sm text-rose-200">{error}</p>}{result && <div className="mt-5"><ApiDataView data={result.context} emptyMessage="No hay datos comparables para el período seleccionado." /></div>}</div></main>
}
