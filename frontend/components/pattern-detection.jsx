'use client'

import { useState } from 'react'
import { ArrowUpRight, CalendarDays, ChevronDown, CircleHelp, Download, Info, Sparkles, TrendingUp } from 'lucide-react'

const patterns = [
  {
    title: 'Pico de demanda al cierre de mes',
    type: 'Patrón observado',
    tone: 'orange',
    confidence: 'Alta confianza',
    summary: 'Las ventas aumentan de forma sostenida durante los últimos 5 días de cada mes.',
    periods: 'Oct 2024 · Nov 2024 · Dic 2024 · Ene 2025 · Feb 2025',
    evidence: [['+32%', 'ventas promedio'], ['5 de 5', 'meses con el patrón'], ['Últimos 5 días', 'ventana recurrente']],
    interpretation: 'Conviene anticipar inventario y personal antes del día 26 para absorber el aumento sin quiebres.',
  },
  {
    title: 'Menor rotación los lunes',
    type: 'Patrón observado',
    tone: 'blue',
    confidence: 'Confianza media',
    summary: 'El volumen de unidades vendidas queda por debajo del promedio semanal al inicio de la semana.',
    periods: 'Ene 2025 · Feb 2025 · Mar 2025',
    evidence: [['−18%', 'vs. promedio semanal'], ['11 de 12', 'lunes analizados'], ['Lunes', 'día más débil']],
    interpretation: 'Una activación comercial de inicio de semana podría compensar la caída, aunque se necesita más histórico para validarlo.',
  },
  {
    title: 'Café premium impulsa el ticket',
    type: 'Patrón observado',
    tone: 'violet',
    confidence: 'Alta confianza',
    summary: 'Las compras que incluyen café molido premium tienen un valor medio superior al resto.',
    periods: 'Nov 2024 · Dic 2024 · Ene 2025 · Feb 2025',
    evidence: [['+$8,40', 'ticket promedio'], ['+27%', 'ingreso por compra'], ['4 meses', 'consistencia']],
    interpretation: 'El producto puede funcionar como ancla para bundles, pero la relación no prueba causalidad por sí sola.',
  },
]

const toneStyles = { orange: { border: 'border-[#ff792c]/40', bg: 'bg-[#ff792c]/10', text: 'text-[#ff9a5b]', dot: 'bg-[#ff792c]' }, blue: { border: 'border-[#55b9ee]/40', bg: 'bg-[#55b9ee]/10', text: 'text-[#78ccf4]', dot: 'bg-[#55b9ee]' }, violet: { border: 'border-[#9c8cff]/40', bg: 'bg-[#9c8cff]/10', text: 'text-[#b8afff]', dot: 'bg-[#9c8cff]' } }

function Logo() { return <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-lg bg-[#f4511e] shadow-[0_0_18px_rgba(244,81,30,.25)]"><span className="text-lg text-white">✣</span></div><span className="text-[15px] font-bold tracking-tight text-[#f3f5f7]">Stockflow</span></div> }
function PatternCard({ pattern }) { const style = toneStyles[pattern.tone]; return <article className={`rounded-xl border ${style.border} bg-[#0f1621] p-5 sm:p-6`}><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${style.dot}`} /><span className={`text-xs font-semibold uppercase tracking-[.14em] ${style.text}`}>{pattern.type}</span></div><span className="rounded-full border border-[#334154] px-2.5 py-1 text-[11px] text-[#9eabbc]">{pattern.confidence}</span></div><h2 className="mt-4 text-lg font-semibold text-[#f3f5f7]">{pattern.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#a6b1c0]">{pattern.summary}</p><div className="mt-5 flex items-start gap-2 border-t border-[#253142] pt-4 text-xs text-[#748196]"><CalendarDays size={14} className="mt-0.5 shrink-0 text-[#ff792c]" /><span><strong className="font-medium text-[#bac4d0]">Períodos que lo sustentan</strong><br />{pattern.periods}</span></div><div className="mt-5 grid grid-cols-3 gap-2">{pattern.evidence.map(([value, label]) => <div key={label} className={`${style.bg} rounded-lg p-3`}><div className={`text-lg font-semibold ${style.text}`}>{value}</div><div className="mt-1 text-[11px] leading-4 text-[#9ba8b8]">{label}</div></div>)}</div><div className="mt-5 rounded-lg border border-[#334154] bg-[#111b29] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#d2d9e2]"><Sparkles size={14} className={style.text} /> Interpretación</div><p className="mt-2 text-sm leading-6 text-[#a9b5c3]">{pattern.interpretation}</p></div></article> }

export default function Page() { const [period, setPeriod] = useState('Últimos 12 meses'); return <main className="min-h-screen bg-[#090d15] text-[#f3f5f7]"><header className="border-b border-[#202b39] bg-[#0a0f18]/95"><div className="mx-auto flex h-[66px] max-w-[1180px] items-center justify-between px-5 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm text-[#8792a4] md:flex"><a className="hover:text-white" href="#comparar">Comparar</a><a className="text-[#e8edf3]" href="#patrones">Patrones</a><a className="hover:text-white" href="#fuentes">Fuentes</a></nav><div className="flex items-center gap-4"><span className="hidden text-sm text-[#8f9bac] sm:block">Hola, Martina</span><button aria-label="Abrir ayuda" className="grid size-8 place-items-center rounded-full border border-[#293546] text-[#8490a3]"><CircleHelp size={16} /></button><div className="grid size-8 place-items-center rounded-full bg-[#293546] text-xs font-semibold text-[#dbe2ea]">ML</div></div></div></header><div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-10"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#ff792c]">Detección de patrones</p><h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">Comportamientos repetitivos</h1><p className="mt-2 max-w-xl text-sm text-[#8e9aac]">Explora señales recurrentes detectadas en tus históricos y separa los datos de su interpretación.</p></div><button className="inline-flex items-center gap-2 rounded-lg border border-[#334154] px-3 py-2.5 text-sm text-[#b9c4d2] hover:border-[#55b9ee]/60 hover:text-white"><Download size={15} /> Exportar análisis</button></div><section className="mb-6 rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold text-[#e9eef4]"><TrendingUp size={16} className="text-[#6ee7b7]" /> 3 patrones relevantes detectados</div><p className="mt-1 text-xs text-[#8491a4]">Basado en ventas, inventario y comportamiento por producto.</p></div><label className="relative"><span className="sr-only">Seleccionar período</span><select value={period} onChange={event => setPeriod(event.target.value)} className="appearance-none rounded-lg border border-[#334154] bg-[#111b29] py-2.5 pl-3 pr-9 text-sm text-[#d4dce5] outline-none focus:border-[#ff792c]"><option>Últimos 12 meses</option><option>Últimos 6 meses</option><option>Este año</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-[#8290a3]" /></label></div></section><div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-semibold text-[#e9eef4]">Patrones observados</h2><p className="mt-1 text-xs text-[#7e8b9d]">Cada hallazgo incluye períodos y métricas que lo respaldan.</p></div><button className="inline-flex items-center gap-1 text-xs text-[#78ccf4] hover:text-white">Ver metodología <ArrowUpRight size={14} /></button></div><div className="grid gap-4 lg:grid-cols-3">{patterns.map(pattern => <PatternCard key={pattern.title} pattern={pattern} />)}</div><aside className="mt-6 flex gap-3 rounded-xl border border-[#293546] bg-[#0c131e] p-4 text-sm text-[#94a1b2]"><Info size={17} className="mt-0.5 shrink-0 text-[#55b9ee]" /><p><strong className="font-medium text-[#cbd4df]">Cómo leer esta vista:</strong> el patrón observado describe una repetición medible; la interpretación es una hipótesis para orientar decisiones, no una conclusión causal.</p></aside></div></main> }
