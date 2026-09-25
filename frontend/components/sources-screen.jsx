import { useMemo, useState } from 'react'
import { CheckCircle2, Database, Filter, LogOut, Plus, Search, ShieldCheck, X } from 'lucide-react'

const sourceTypes = ['Base de datos', 'Archivo', 'API', 'Servicio externo']
const sourceOrigins = ['Interna', 'Externa']
const sourceStatuses = ['Autorizada', 'Pendiente', 'Revocada']

const initialSources = [
  { id: 1, name: 'Ventas principales', type: 'Base de datos', origin: 'Interna', status: 'Autorizada', updatedAt: '2026-09-25' },
  { id: 2, name: 'Catálogo de proveedores', type: 'Archivo', origin: 'Interna', status: 'Autorizada', updatedAt: '2026-09-24' },
  { id: 3, name: 'Índice de precios mayoristas', type: 'API', origin: 'Externa', status: 'Pendiente', updatedAt: '2026-09-22' },
]

const emptyForm = { name: '', type: sourceTypes[0], origin: sourceOrigins[0], status: sourceStatuses[0], updatedAt: new Date().toISOString().slice(0, 10) }

function StatusBadge({ status }) {
  const styles = {
    Autorizada: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Pendiente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Revocada: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }

  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status === 'Autorizada' && <CheckCircle2 className="size-3.5" aria-hidden="true" />}{status}</span>
}

function SourceForm({ onAdd, onClose }) {
  const [form, setForm] = useState(emptyForm)

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    onAdd({ ...form, name: form.name.trim(), id: Date.now() })
    setForm(emptyForm)
  }

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#263346] dark:bg-[#151D2A]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mt-1 text-xl font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Registrar origen de datos</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#64748B] hover:bg-slate-100 dark:hover:bg-[#263346]" aria-label="Cerrar formulario">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]">Nombre<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Stock del depósito" className="mt-2 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-3 text-sm font-normal outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC] dark:focus:border-brand" /></label>
        <label className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]">Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-3 text-sm font-normal outline-none focus:border-brand-blue dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC]">{sourceTypes.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]">Origen<select value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-3 text-sm font-normal outline-none focus:border-brand-blue dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC]">{sourceOrigins.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]">Estado<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-3 text-sm font-normal outline-none focus:border-brand-blue dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC]">{sourceStatuses.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC] md:col-span-2">Fecha de actualización<input required type="date" value={form.updatedAt} onChange={(event) => setForm({ ...form, updatedAt: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-3 text-sm font-normal outline-none focus:border-brand-blue dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC]" /></label>
        <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-slate-100 dark:hover:bg-[#263346]">Cancelar</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-brand dark:text-[#0B0F17] dark:hover:bg-brand-hover"><Plus className="size-4" aria-hidden="true" />Guardar fuente</button></div>
      </form>
    </section>
  )
}

export default function SourcesScreen({ onLogout }) {
  const [sources, setSources] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stockflow-sources')) || initialSources } catch { return initialSources }
  })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todas')
  const [type, setType] = useState('Todos')
  const [isFormOpen, setIsFormOpen] = useState(false)

  function addSource(source) {
    const nextSources = [source, ...sources]
    setSources(nextSources)
    localStorage.setItem('stockflow-sources', JSON.stringify(nextSources))
    setIsFormOpen(false)
  }

  const filteredSources = useMemo(() => sources.filter((source) => {
    const matchesQuery = source.name.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'Todas' || source.status === status) && (type === 'Todos' || source.type === type)
  }), [query, sources, status, type])

  const authorizedCount = sources.filter((source) => source.status === 'Autorizada').length

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] dark:bg-[#0B0F17] dark:text-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md dark:border-[#263346] dark:bg-[#0B0F17]/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#fuentes" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-blue text-white dark:bg-brand"><Database className="size-5" aria-hidden="true" /></span><span className="font-semibold tracking-tight">Stockflow</span></a>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#64748B] hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:bg-[#263346]"><LogOut className="size-4" aria-hidden="true" />Cerrar sesión</button>
        </nav>
      </header>
      <main id="fuentes" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Fuentes internas y externas</h1><p className="mt-3 max-w-2xl text-[#64748B] dark:text-[#94A3B8]">Registrá, consultá y supervisá las fuentes autorizadas que alimentan tus decisiones.</p></div><button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 dark:bg-brand dark:text-[#0B0F17] dark:hover:bg-brand-hover"><Plus className="size-4" aria-hidden="true" />Registrar fuente</button></div>
        <section aria-label="Resumen de fuentes" className="mt-10 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#263346] dark:bg-[#151D2A]"><p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Fuentes registradas</p><p className="mt-2 text-3xl font-bold">{sources.length}</p></div><div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#263346] dark:bg-[#151D2A]"><p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Fuentes autorizadas</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400"><ShieldCheck className="size-7" aria-hidden="true" />{authorizedCount}</p></div><div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#263346] dark:bg-[#151D2A]"><p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Pendientes de revisión</p><p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{sources.filter((source) => source.status === 'Pendiente').length}</p></div></section>
        {isFormOpen && <div className="mt-8"><SourceForm onAdd={addSource} onClose={() => setIsFormOpen(false)} /></div>}
        <section className="mt-10 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#263346] dark:bg-[#151D2A]" aria-labelledby="sources-title"><div className="flex flex-col gap-4 border-b border-[#E2E8F0] p-5 dark:border-[#263346] md:flex-row md:items-center md:justify-between"><div><h2 id="sources-title" className="text-lg font-semibold">Fuentes autorizadas y estado</h2><p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Consultá el origen y la última actualización de cada fuente.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar fuente" aria-label="Buscar fuente" className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] pl-9 pr-3 text-sm outline-none focus:border-brand-blue sm:w-48 dark:border-[#263346] dark:bg-[#0B0F17]" /></label><label className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado" className="h-10 w-full appearance-none rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] pl-9 pr-8 text-sm outline-none focus:border-brand-blue dark:border-[#263346] dark:bg-[#0B0F17]"><option>Todas</option>{sourceStatuses.map((option) => <option key={option}>{option}</option>)}</select></label><select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filtrar por tipo" className="h-10 rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] px-3 text-sm outline-none focus:border-brand-blue dark:border-[#263346] dark:bg-[#0B0F17]"><option>Todos</option>{sourceTypes.map((option) => <option key={option}>{option}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#F8F9FA] text-xs uppercase tracking-wide text-[#64748B] dark:bg-[#0B0F17] dark:text-[#94A3B8]"><tr><th className="px-5 py-4 font-semibold">Nombre</th><th className="px-5 py-4 font-semibold">Tipo</th><th className="px-5 py-4 font-semibold">Origen</th><th className="px-5 py-4 font-semibold">Estado</th><th className="px-5 py-4 font-semibold">Actualización</th></tr></thead><tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263346]">{filteredSources.map((source) => <tr key={source.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03]"><th scope="row" className="px-5 py-4 font-semibold">{source.name}</th><td className="px-5 py-4 text-[#64748B] dark:text-[#94A3B8]">{source.type}</td><td className="px-5 py-4 text-[#64748B] dark:text-[#94A3B8]">{source.origin}</td><td className="px-5 py-4"><StatusBadge status={source.status} /></td><td className="px-5 py-4 text-[#64748B] dark:text-[#94A3B8]">{source.updatedAt}</td></tr>)}{filteredSources.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">No hay fuentes que coincidan con los filtros.</td></tr>}</tbody></table></div></section>
      </main>
    </div>
  )
}