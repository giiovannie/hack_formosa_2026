<<<<<<< HEAD
'use client'

import { useState } from 'react'
import { Activity, ArrowLeft, CheckCircle2, CircleHelp, Clock3, Database, ExternalLink, FileCheck2, Globe2, Link2, ShieldCheck, XCircle } from 'lucide-react'

const record = {
  id: 'IMP-2025-00384',
  name: 'Inventario sucursales',
  source: 'Archivo CSV',
  origin: 'Carga manual autorizada',
  importedAt: '12 mar 2025, 16:05',
  status: 'Procesado',
  validation: 'Validado con observaciones',
  file: 'inventario_sucursales_marzo.csv',
  rows: '12.480 registros',
  size: '2,8 MB',
  checksum: 'sha256: 84a9...c21d',
  owner: 'Martina López',
}

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-lg bg-[#f4511e] shadow-[0_0_18px_rgba(244,81,30,.25)]"><span className="text-lg text-white">✣</span></div><span className="text-[15px] font-bold tracking-tight text-[#f3f5f7]">Stockflow</span></div>
}

function StatusPill({ children, tone = 'green' }) {
  const styles = { green: 'border-[#6ee7b7]/20 bg-[#6ee7b7]/10 text-[#7ce8bb]', amber: 'border-[#ffb454]/20 bg-[#ffb454]/10 text-[#ffc170]', blue: 'border-[#55b9ee]/20 bg-[#55b9ee]/10 text-[#83d4fa]' }
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>
}

function DetailRow({ label, value, mono = false }) {
  return <div className="flex flex-col gap-1 border-b border-[#202b39] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"><dt className="text-xs text-[#8490a3]">{label}</dt><dd className={`text-sm text-[#e7edf4] sm:text-right ${mono ? 'font-mono text-xs text-[#a9b7c8]' : ''}`}>{value}</dd></div>
}

export default function Traceability({ embedded = false }) {
  const [showOrigin, setShowOrigin] = useState(false)
  const [message, setMessage] = useState('')

  const handleBack = () => setMessage('Volviendo a Fuentes de información…')
  const handleRefresh = () => setMessage('Validación actualizada y persistida correctamente.')

  return <main className="min-h-screen bg-[#090d15] text-[#f3f5f7] selection:bg-[#ff6b19]/30">
    {!embedded && <header className="border-b border-[#202b39] bg-[#0a0f18]/95"><div className="mx-auto flex h-[66px] max-w-[1180px] items-center justify-between px-5 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm text-[#8792a4] md:flex"><a className="hover:text-white" href="#dashboard">Dashboard</a><a className="text-[#e8edf3]" href="#fuentes">Fuentes</a><a className="hover:text-white" href="#calidad">Calidad de datos</a></nav><div className="flex items-center gap-4"><span className="hidden text-sm text-[#8f9bac] sm:block">Hola, Martina</span><button aria-label="Abrir ayuda" className="grid size-8 place-items-center rounded-full border border-[#293546] text-[#8490a3]"><CircleHelp size={16}/></button><div className="grid size-8 place-items-center rounded-full bg-[#293546] text-xs font-semibold text-[#dbe2ea]">ML</div></div></div></header>}
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-10">
      <button onClick={handleBack} className="mb-7 inline-flex items-center gap-2 text-sm text-[#8e9aac] transition hover:text-white"><ArrowLeft size={16}/> Fuentes de información</button>
      {message && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-[#6ee7b7]/25 bg-[#6ee7b7]/10 px-4 py-3 text-sm text-[#9af0c9]"><span>{message}</span><button aria-label="Cerrar mensaje" onClick={() => setMessage('')}><XCircle size={16}/></button></div>}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#ff792c]">Detalle de importación</p><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">{record.name}</h1><StatusPill><CheckCircle2 size={14}/> {record.status}</StatusPill></div><p className="mt-2 text-sm text-[#8e9aac]">Registro persistido y listo para consultar su trazabilidad.</p></div><button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-lg border border-[#334154] bg-[#101925] px-4 py-2.5 text-sm font-semibold text-[#dce4ec] transition hover:border-[#55b9ee]/60 hover:bg-[#142333]"><Activity size={16}/> Actualizar validación</button></div>
      <section className="grid gap-5 lg:grid-cols-[1.35fr_.85fr]">
        <div className="space-y-5">
          <article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#8b7cf6]/10 text-[#aaa0ff]"><FileCheck2 size={20}/></div><div><h2 className="font-semibold text-[#eef2f6]">Información del registro</h2><p className="text-xs text-[#718096]">Identificación y estado actual</p></div></div><dl><DetailRow label="ID de importación" value={record.id} mono/><DetailRow label="Fuente" value={record.source}/><DetailRow label="Fecha de importación" value={record.importedAt}/><DetailRow label="Estado de procesamiento" value={<StatusPill><CheckCircle2 size={14}/> Procesado</StatusPill>}/><DetailRow label="Validación" value={<StatusPill tone="amber">Validado con observaciones</StatusPill>}/></dl></article>
          <article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#55b9ee]/10 text-[#70c9f4]"><Database size={20}/></div><div><h2 className="font-semibold text-[#eef2f6]">Resumen del procesamiento</h2><p className="text-xs text-[#718096]">Resultado registrado por el sistema</p></div></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-[#253142] bg-[#0b121c] p-3"><p className="text-xs text-[#718096]">Registros</p><p className="mt-1 font-semibold text-[#e8edf3]">{record.rows}</p></div><div className="rounded-lg border border-[#253142] bg-[#0b121c] p-3"><p className="text-xs text-[#718096]">Observaciones</p><p className="mt-1 font-semibold text-[#ffc170]">24 campos</p></div><div className="rounded-lg border border-[#253142] bg-[#0b121c] p-3"><p className="text-xs text-[#718096]">Duración</p><p className="mt-1 font-semibold text-[#e8edf3]">00:01:42</p></div></div><div className="mt-4 flex items-start gap-2 rounded-lg border border-[#ffb454]/20 bg-[#ffb454]/[.06] p-3 text-xs leading-5 text-[#d9b47b]"><Clock3 className="mt-0.5 shrink-0" size={15}/> Se detectaron valores incompletos en la columna “sucursal”. El registro permanece disponible y trazable.</div></article>
        </div>
        <aside className="space-y-5"><article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#ff792c]/10 text-[#ff9b63]"><Globe2 size={20}/></div><div><h2 className="font-semibold text-[#eef2f6]">Origen del dato</h2><p className="text-xs text-[#718096]">Trazabilidad de la importación</p></div></div><dl><DetailRow label="Tipo de origen" value={record.origin}/><DetailRow label="Archivo de origen" value={record.file} mono/><DetailRow label="Responsable" value={record.owner}/><DetailRow label="Tamaño" value={record.size}/></dl><button onClick={() => setShowOrigin((current) => !current)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#3b4a5d] bg-[#131d2a] px-4 py-2.5 text-sm font-semibold text-[#e6edf5] transition hover:border-[#ff792c]/70 hover:text-white"><Link2 size={16}/> {showOrigin ? 'Ocultar detalle del origen' : 'Consultar origen del dato'}</button>{showOrigin && <div className="mt-4 rounded-lg border border-[#55b9ee]/20 bg-[#55b9ee]/[.06] p-3 text-xs leading-5 text-[#9bdcff]"><p className="font-medium text-[#c4ebff]">Carga manual autorizada</p><p className="mt-1">El archivo fue incorporado desde el espacio seguro de operaciones y quedó asociado a este registro.</p><p className="mt-2 font-mono text-[11px] text-[#7ecdf2]">{record.checksum}</p><a href="#source" className="mt-3 inline-flex items-center gap-1 text-[#b6e7ff] underline underline-offset-2">Ver referencia técnica <ExternalLink size={12}/></a></div>}</article><article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-[#6ee7b7]" size={19}/><div><h2 className="text-sm font-semibold text-[#e9f2ed]">Registro protegido</h2><p className="mt-1 text-xs leading-5 text-[#8490a3]">La información de origen, procesamiento y validación queda persistida para auditoría.</p></div></div></article></aside>
      </section>
    </div>
  </main>
}
=======
'use client'

import { useState } from 'react'
import { Activity, ArrowLeft, CheckCircle2, CircleHelp, Clock3, Database, ExternalLink, FileCheck2, Globe2, Link2, ShieldCheck, XCircle } from 'lucide-react'

const record = {
  id: 'IMP-2025-00384',
  name: 'Inventario sucursales',
  source: 'Archivo CSV',
  origin: 'Carga manual autorizada',
  importedAt: '12 mar 2025, 16:05',
  status: 'Procesado',
  validation: 'Validado con observaciones',
  file: 'inventario_sucursales_marzo.csv',
  rows: '12.480 registros',
  size: '2,8 MB',
  checksum: 'sha256: 84a9...c21d',
  owner: 'Martina López',
}

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-lg bg-[#f4511e] shadow-[0_0_18px_rgba(244,81,30,.25)]"><span className="text-lg text-white">✣</span></div><span className="text-[15px] font-bold tracking-tight text-[#f3f5f7]">Stockflow</span></div>
}

function StatusPill({ children, tone = 'green' }) {
  const styles = { green: 'border-[#6ee7b7]/20 bg-[#6ee7b7]/10 text-[#7ce8bb]', amber: 'border-[#ffb454]/20 bg-[#ffb454]/10 text-[#ffc170]', blue: 'border-[#55b9ee]/20 bg-[#55b9ee]/10 text-[#83d4fa]' }
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>
}

function DetailRow({ label, value, mono = false }) {
  return <div className="flex flex-col gap-1 border-b border-[#202b39] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"><dt className="text-xs text-[#8490a3]">{label}</dt><dd className={`text-sm text-[#e7edf4] sm:text-right ${mono ? 'font-mono text-xs text-[#a9b7c8]' : ''}`}>{value}</dd></div>
}

export default function Traceability({ embedded = false }) {
  const [showOrigin, setShowOrigin] = useState(false)
  const [message, setMessage] = useState('')

  const handleBack = () => setMessage('Volviendo a Fuentes de información…')
  const handleRefresh = () => setMessage('Validación actualizada y persistida correctamente.')

  return <main className="min-h-screen bg-[#090d15] text-[#f3f5f7] selection:bg-[#ff6b19]/30">
    {!embedded && <header className="border-b border-[#202b39] bg-[#0a0f18]/95"><div className="mx-auto flex h-[66px] max-w-[1180px] items-center justify-between px-5 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm text-[#8792a4] md:flex"><a className="hover:text-white" href="#dashboard">Dashboard</a><a className="text-[#e8edf3]" href="#fuentes">Fuentes</a><a className="hover:text-white" href="#calidad">Calidad de datos</a></nav><div className="flex items-center gap-4"><span className="hidden text-sm text-[#8f9bac] sm:block">Hola, Martina</span><button aria-label="Abrir ayuda" className="grid size-8 place-items-center rounded-full border border-[#293546] text-[#8490a3]"><CircleHelp size={16}/></button><div className="grid size-8 place-items-center rounded-full bg-[#293546] text-xs font-semibold text-[#dbe2ea]">ML</div></div></div></header>}
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-10">
      <button onClick={handleBack} className="mb-7 inline-flex items-center gap-2 text-sm text-[#8e9aac] transition hover:text-white"><ArrowLeft size={16}/> Fuentes de información</button>
      {message && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-[#6ee7b7]/25 bg-[#6ee7b7]/10 px-4 py-3 text-sm text-[#9af0c9]"><span>{message}</span><button aria-label="Cerrar mensaje" onClick={() => setMessage('')}><XCircle size={16}/></button></div>}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#ff792c]">Detalle de importación</p><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">{record.name}</h1><StatusPill><CheckCircle2 size={14}/> {record.status}</StatusPill></div><p className="mt-2 text-sm text-[#8e9aac]">Registro persistido y listo para consultar su trazabilidad.</p></div><button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-lg border border-[#334154] bg-[#101925] px-4 py-2.5 text-sm font-semibold text-[#dce4ec] transition hover:border-[#55b9ee]/60 hover:bg-[#142333]"><Activity size={16}/> Actualizar validación</button></div>
      <section className="grid gap-5 lg:grid-cols-[1.35fr_.85fr]">
        <div className="space-y-5">
          <article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#8b7cf6]/10 text-[#aaa0ff]"><FileCheck2 size={20}/></div><div><h2 className="font-semibold text-[#eef2f6]">Información del registro</h2><p className="text-xs text-[#718096]">Identificación y estado actual</p></div></div><dl><DetailRow label="ID de importación" value={record.id} mono/><DetailRow label="Fuente" value={record.source}/><DetailRow label="Fecha de importación" value={record.importedAt}/><DetailRow label="Estado de procesamiento" value={<StatusPill><CheckCircle2 size={14}/> Procesado</StatusPill>}/><DetailRow label="Validación" value={<StatusPill tone="amber">Validado con observaciones</StatusPill>}/></dl></article>
          <article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#55b9ee]/10 text-[#70c9f4]"><Database size={20}/></div><div><h2 className="font-semibold text-[#eef2f6]">Resumen del procesamiento</h2><p className="text-xs text-[#718096]">Resultado registrado por el sistema</p></div></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-[#253142] bg-[#0b121c] p-3"><p className="text-xs text-[#718096]">Registros</p><p className="mt-1 font-semibold text-[#e8edf3]">{record.rows}</p></div><div className="rounded-lg border border-[#253142] bg-[#0b121c] p-3"><p className="text-xs text-[#718096]">Observaciones</p><p className="mt-1 font-semibold text-[#ffc170]">24 campos</p></div><div className="rounded-lg border border-[#253142] bg-[#0b121c] p-3"><p className="text-xs text-[#718096]">Duración</p><p className="mt-1 font-semibold text-[#e8edf3]">00:01:42</p></div></div><div className="mt-4 flex items-start gap-2 rounded-lg border border-[#ffb454]/20 bg-[#ffb454]/[.06] p-3 text-xs leading-5 text-[#d9b47b]"><Clock3 className="mt-0.5 shrink-0" size={15}/> Se detectaron valores incompletos en la columna “sucursal”. El registro permanece disponible y trazable.</div></article>
        </div>
        <aside className="space-y-5"><article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#ff792c]/10 text-[#ff9b63]"><Globe2 size={20}/></div><div><h2 className="font-semibold text-[#eef2f6]">Origen del dato</h2><p className="text-xs text-[#718096]">Trazabilidad de la importación</p></div></div><dl><DetailRow label="Tipo de origen" value={record.origin}/><DetailRow label="Archivo de origen" value={record.file} mono/><DetailRow label="Responsable" value={record.owner}/><DetailRow label="Tamaño" value={record.size}/></dl><button onClick={() => setShowOrigin((current) => !current)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#3b4a5d] bg-[#131d2a] px-4 py-2.5 text-sm font-semibold text-[#e6edf5] transition hover:border-[#ff792c]/70 hover:text-white"><Link2 size={16}/> {showOrigin ? 'Ocultar detalle del origen' : 'Consultar origen del dato'}</button>{showOrigin && <div className="mt-4 rounded-lg border border-[#55b9ee]/20 bg-[#55b9ee]/[.06] p-3 text-xs leading-5 text-[#9bdcff]"><p className="font-medium text-[#c4ebff]">Carga manual autorizada</p><p className="mt-1">El archivo fue incorporado desde el espacio seguro de operaciones y quedó asociado a este registro.</p><p className="mt-2 font-mono text-[11px] text-[#7ecdf2]">{record.checksum}</p><a href="#source" className="mt-3 inline-flex items-center gap-1 text-[#b6e7ff] underline underline-offset-2">Ver referencia técnica <ExternalLink size={12}/></a></div>}</article><article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-[#6ee7b7]" size={19}/><div><h2 className="text-sm font-semibold text-[#e9f2ed]">Registro protegido</h2><p className="mt-1 text-xs leading-5 text-[#8490a3]">La información de origen, procesamiento y validación queda persistida para auditoría.</p></div></div></article></aside>
      </section>
    </div>
  </main>
}
>>>>>>> 853cee2583f556d8931ed66aa632ecc5f97c087c
