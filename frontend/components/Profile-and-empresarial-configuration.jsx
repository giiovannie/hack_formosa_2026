'use client'

import { useState } from 'react'
import { Check, ChevronDown, CircleHelp, LockKeyhole, Plus, Save, X } from 'lucide-react'

const industries = ['Comercio minorista', 'Distribución', 'Manufactura', 'Servicios profesionales', 'Gastronomía', 'Otro']
const sources = ['Planillas Excel', 'Sistema de ventas', 'Sistema de stock', 'E-commerce', 'Facturación', 'Otro']
const areas = ['Stock e inventario', 'Ventas y rentabilidad', 'Compras y proveedores', 'Flujo de caja', 'Logística y entregas']
const goals = ['Detectar quiebres de stock', 'Saber qué productos vender más', 'Entender mis márgenes', 'Prever mis compras', 'Ordenar mis números']

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-lg bg-[#f4511e] shadow-[0_0_18px_rgba(244,81,30,.25)]"><span className="text-lg leading-none text-white">✣</span></div><span className="text-[15px] font-bold tracking-tight text-[#f3f5f7]">Stockflow</span></div>
}

function Step({ number, label, active, complete }) {
  return <div className="flex items-center gap-3"><div className={`grid size-7 place-items-center rounded-full border text-xs font-semibold ${complete ? 'border-[#ff6b19] bg-[#ff6b19] text-white' : active ? 'border-[#ff6b19] bg-[#29170f] text-[#ff8a43]' : 'border-[#2c3747] bg-[#151c28] text-[#7e8a9e]'}`}>{complete ? <Check size={14} strokeWidth={3} /> : number}</div><span className={`hidden text-sm sm:block ${active ? 'font-medium text-[#f3f5f7]' : 'text-[#7e8a9e]'}`}>{label}</span></div>
}

function SelectField({ label, value, onChange, options, error }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-[#dce1e8]">{label}</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className={`h-11 w-full appearance-none rounded-lg border bg-[#121a26] px-3.5 pr-10 text-sm text-[#f3f5f7] outline-none transition focus:border-[#ff6b19] focus:ring-2 focus:ring-[#ff6b19]/15 ${error ? 'border-[#ed6a4c]' : 'border-[#293546]'}`}><option value="">Seleccioná una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-[#8490a3]" size={16} /></div>{error && <span className="mt-1.5 block text-xs text-[#ff8b6b]">{error}</span>}</label>
}

function ChoiceGroup({ title, hint, options, selected, toggle }) {
  return <fieldset><legend className="text-sm font-medium text-[#dce1e8]">{title}</legend>{hint && <p className="mt-1 text-xs text-[#8490a3]">{hint}</p>}<div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map((option) => { const checked = selected.includes(option); return <button type="button" key={option} onClick={() => toggle(option)} aria-pressed={checked} className={`flex min-h-11 items-center justify-between rounded-lg border px-3.5 text-left text-sm transition ${checked ? 'border-[#ff6b19] bg-[#2a1a13] text-[#fff5ef]' : 'border-[#293546] bg-[#121a26] text-[#aeb8c7] hover:border-[#566277]'}`}><span>{option}</span><span className={`grid size-4.5 place-items-center rounded border ${checked ? 'border-[#ff6b19] bg-[#ff6b19] text-white' : 'border-[#526075]'}`}>{checked && <Check size={12} strokeWidth={3} />}</span></button> })}</div></fieldset>
}

export default function CompanyConfiguration({ embedded = false }) {
  const [industry, setIndustry] = useState('')
  const [company, setCompany] = useState('Almacén La Esquina')
  const [sourcesSelected, setSourcesSelected] = useState(['Planillas Excel', 'Sistema de stock'])
  const [areasSelected, setAreasSelected] = useState(['Stock e inventario', 'Ventas y rentabilidad'])
  const [goalsSelected, setGoalsSelected] = useState(['Detectar quiebres de stock', 'Saber qué productos vender más'])
  const [saved, setSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggle = (setter) => (value) => setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  const hasError = submitted && !industry
  const handleSubmit = (event) => { event.preventDefault(); setSubmitted(true); if (!industry || !company.trim() || !sourcesSelected.length || !areasSelected.length || !goalsSelected.length) return; setSaved(true); setTimeout(() => setSaved(false), 3500) }

  return <main className="min-h-screen bg-[#090d15] text-[#f3f5f7] selection:bg-[#ff6b19]/30">
    {!embedded && <header className="border-b border-[#202b39] bg-[#0a0f18]/95"><div className="mx-auto flex h-[66px] max-w-[1180px] items-center justify-between px-5 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm text-[#8792a4] md:flex"><a href="#perfil" className="text-[#e8edf3]">Perfil</a><a href="#analisis" className="hover:text-white">Análisis</a><a href="#ayuda" className="hover:text-white">Ayuda</a></nav><div className="flex items-center gap-4"><span className="hidden text-sm text-[#8f9bac] sm:block">Hola, Martina</span><button aria-label="Abrir ayuda" className="grid size-8 place-items-center rounded-full border border-[#293546] text-[#8490a3] hover:text-white"><CircleHelp size={16} /></button><div className="grid size-8 place-items-center rounded-full bg-[#293546] text-xs font-semibold text-[#dbe2ea]">ML</div></div></div></header>}
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-10"><div className="mb-9 flex items-center justify-between"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#ff792c]">Configuración</p><h1 className="text-2xl font-bold tracking-tight text-[#f7f8fa] sm:text-[30px]">Perfil de tu empresa</h1><p className="mt-2 text-sm text-[#8e9aac]">Completá estos datos para que Stockflow entienda mejor tu negocio.</p></div><div className="hidden items-center gap-4 sm:flex"><Step number="1" label="Tu empresa" active /><div className="h-px w-10 bg-[#2d3949]" /><Step number="2" label="Listo" /></div></div>
      <form id="perfil" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6"><section className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 shadow-2xl shadow-black/10 sm:p-7"><div className="mb-7 flex items-start justify-between"><div><h2 className="text-lg font-semibold">Contanos sobre tu empresa</h2><p className="mt-1 text-sm text-[#8490a3]">Esta información nos ayuda a personalizar tus recomendaciones.</p></div><span className="rounded-full border border-[#304052] px-2.5 py-1 text-[11px] text-[#8490a3]">1 de 3</span></div><div className="grid gap-5 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium text-[#dce1e8]">Nombre de la empresa</span><input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ej: Almacén La Esquina" className="h-11 w-full rounded-lg border border-[#293546] bg-[#121a26] px-3.5 text-sm text-[#f3f5f7] outline-none placeholder:text-[#617086] focus:border-[#ff6b19] focus:ring-2 focus:ring-[#ff6b19]/15" />{submitted && !company.trim() && <span className="mt-1.5 block text-xs text-[#ff8b6b]">Ingresá el nombre de tu empresa.</span>}</label><SelectField label="Actividad o rubro" value={industry} onChange={setIndustry} options={industries} error={hasError ? 'Elegí el rubro de tu empresa.' : ''} /></div></section>
        <section className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-7"><div className="mb-7"><h2 className="text-lg font-semibold">¿Qué información tenés disponible?</h2><p className="mt-1 text-sm text-[#8490a3]">Podés seleccionar más de una opción.</p></div><ChoiceGroup title="Fuentes de información" hint="No hace falta que estén conectadas todavía." options={sources} selected={sourcesSelected} toggle={toggle(setSourcesSelected)} />{submitted && !sourcesSelected.length && <p className="mt-2 text-xs text-[#ff8b6b]">Seleccioná al menos una fuente.</p>}</section>
        <section id="analisis" className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-7"><div className="mb-7"><h2 className="text-lg font-semibold">¿Qué querés monitorear?</h2><p className="mt-1 text-sm text-[#8490a3]">Elegí las áreas más importantes para vos.</p></div><ChoiceGroup title="Áreas a monitorear" options={areas} selected={areasSelected} toggle={toggle(setAreasSelected)} />{submitted && !areasSelected.length && <p className="mt-2 text-xs text-[#ff8b6b]">Elegí al menos un área.</p>}</section>
        <section className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-7"><div className="mb-7"><h2 className="text-lg font-semibold">¿Qué querés analizar primero?</h2><p className="mt-1 text-sm text-[#8490a3]">Esto nos permite priorizar tus primeros reportes.</p></div><ChoiceGroup title="Objetivos principales" options={goals} selected={goalsSelected} toggle={toggle(setGoalsSelected)} />{submitted && !goalsSelected.length && <p className="mt-2 text-xs text-[#ff8b6b]">Elegí al menos un objetivo.</p>}</section>
        <div className="flex flex-col-reverse items-stretch justify-between gap-4 pb-4 sm:flex-row sm:items-center"><button type="button" className="h-11 rounded-lg px-4 text-sm font-medium text-[#8490a3] hover:text-white">Guardar y continuar después</button><button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ff6b19] px-6 text-sm font-semibold text-white shadow-lg shadow-[#ff6b19]/15 transition hover:bg-[#ff7c31] focus:outline-none focus:ring-2 focus:ring-[#ff6b19] focus:ring-offset-2 focus:ring-offset-[#090d15]">{saved ? <><Check size={16} /> Perfil guardado</> : <><Save size={16} /> Guardar perfil</>}</button></div></div>
        <aside className="hidden lg:block"><div className="sticky top-6 rounded-xl border border-[#253142] bg-[#0f1621] p-5"><p className="mb-5 text-xs font-semibold uppercase tracking-[.16em] text-[#8490a3]">Tu progreso</p><div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#202b39]"><div className="h-full w-[75%] rounded-full bg-[#ff6b19]" /></div><p className="mb-6 text-sm text-[#aeb8c7"><strong className="text-white">75%</strong> completo</p><div className="space-y-5"><Step number="1" label="Información básica" complete /><Step number="2" label="Fuentes disponibles" complete /><Step number="3" label="Áreas y objetivos" active /></div><div className="my-6 h-px bg-[#253142]" /><div className="flex gap-3 text-xs leading-5 text-[#8490a3]"><LockKeyhole className="mt-0.5 shrink-0 text-[#ff792c]" size={15} /><p>Tus datos están protegidos y solo se usan para mejorar tus análisis.</p></div></div></aside>
      </form>
    </div>
    <div id="ayuda" className="sr-only">Centro de ayuda de Stockflow</div>
  </main>
}
