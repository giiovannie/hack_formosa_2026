'use client'

import { useMemo, useState } from 'react'
import { BarChart3, CalendarDays, ChevronDown, CircleHelp, DollarSign, Download, Package, ShoppingCart, TrendingDown, TrendingUp, Wallet, XCircle } from 'lucide-react'

const metricSets = {
  'Últimos 30 días': {
    range: '01 mar 2025 — 30 mar 2025',
    sales: '$ 128.450', salesChange: '+12,4%',
    purchases: '$ 76.820', purchasesChange: '+6,8%',
    losses: '$ 4.290', lossesChange: '-2,1%',
    income: '$ 47.340', incomeChange: '+18,7%',
    stock: '8.460', stockChange: 'unidades',
    chart: [44, 52, 48, 66, 62, 75, 68, 84, 78, 92, 86, 96],
    months: ['01 mar', '04 mar', '07 mar', '10 mar', '13 mar', '16 mar', '19 mar', '22 mar', '25 mar', '28 mar'],
  },
  'Últimos 7 días': {
    range: '24 mar 2025 — 30 mar 2025',
    sales: '$ 32.840', salesChange: '+8,2%',
    purchases: '$ 18.920', purchasesChange: '+3,5%',
    losses: '$ 980', lossesChange: '-4,6%',
    income: '$ 12.940', incomeChange: '+15,1%',
    stock: '8.460', stockChange: 'unidades',
    chart: [48, 62, 56, 74, 68, 82, 96],
    months: ['24 mar', '25 mar', '26 mar', '27 mar', '28 mar', '29 mar', '30 mar'],
  },
  'Este mes': {
    range: '01 mar 2025 — 31 mar 2025',
    sales: '$ 142.680', salesChange: '+14,8%',
    purchases: '$ 84.300', purchasesChange: '+9,1%',
    losses: '$ 4.870', lossesChange: '-1,8%',
    income: '$ 53.510', incomeChange: '+21,4%',
    stock: '8.460', stockChange: 'unidades',
    chart: [42, 55, 58, 61, 72, 68, 79, 84, 78, 88, 92, 98],
    months: ['01 mar', '04 mar', '07 mar', '10 mar', '13 mar', '16 mar', '19 mar', '22 mar', '25 mar', '28 mar'],
  },
}

const products = [
  { name: 'Café molido premium', category: 'Almacén', sold: '342 un.', value: '$ 8.550', color: '#ff792c' },
  { name: 'Leche entera 1L', category: 'Lácteos', sold: '286 un.', value: '$ 4.290', color: '#55b9ee' },
  { name: 'Galletas de avena', category: 'Almacén', sold: '219 un.', value: '$ 3.942', color: '#8b7cf6' },
  { name: 'Jugo de naranja', category: 'Bebidas', sold: '174 un.', value: '$ 3.132', color: '#6ee7b7' },
]

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-lg bg-[#f4511e] shadow-[0_0_18px_rgba(244,81,30,.25)]"><span className="text-lg text-white">✣</span></div><span className="text-[15px] font-bold tracking-tight text-[#f3f5f7]">Stockflow</span></div>
}

function Change({ value, positive = true }) {
  return <span className={`inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-[#6ee7b7]' : 'text-[#ffc170]'}`}>{positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{value}</span>
}

function MetricCard({ icon: Icon, label, value, change, accent, note, positive = true }) {
  return <article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5"><div className="flex items-start justify-between"><div className={`grid size-10 place-items-center rounded-lg ${accent.bg} ${accent.text}`}><Icon size={19} /></div><span className="text-[11px] uppercase tracking-[.14em] text-[#66758a]">{note}</span></div><p className="mt-5 text-sm text-[#8e9aac]">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#eef2f6]">{value}</p><div className="mt-3 flex items-center gap-2"><Change value={change} positive={positive} /><span className="text-xs text-[#66758a]">vs. período anterior</span></div></article>
}

function Chart({ values, labels }) {
  const max = Math.max(...values)
  return <div className="relative h-56 pt-4"><div className="pointer-events-none absolute inset-x-0 top-5 flex flex-col justify-between text-[10px] text-[#526075]" style={{ height: 'calc(100% - 38px)' }}><span>$ 15k</span><span>$ 10k</span><span>$ 5k</span><span>$ 0</span></div><div className="ml-10 flex h-[calc(100%-28px)] items-end gap-2 border-b border-l border-[#293546] px-3 pb-0 sm:gap-3">{values.map((value, index) => <div key={`${labels[index]}-${value}`} className="flex h-full flex-1 items-end"><div className="group relative w-full rounded-t-sm bg-gradient-to-t from-[#ff5a1f] to-[#ff9d63] opacity-90 transition hover:opacity-100" style={{ height: `${Math.max(20, (value / max) * 100)}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-[#172231] px-1.5 py-1 text-[10px] text-white group-hover:block">{value}%</span></div></div>)}</div><div className="ml-10 flex justify-between px-3 pt-2 text-[10px] text-[#66758a]">{labels.map((label) => <span key={label}>{label}</span>)}</div></div>
}

export default function Page() {
  const [period, setPeriod] = useState('Últimos 30 días')
  const [unit, setUnit] = useState('Moneda local')
  const [message, setMessage] = useState('')
  const data = useMemo(() => metricSets[period], [period])

  const updateFilter = (setter, value, label) => {
    setter(value)
    setMessage(`Métricas actualizadas para ${label}.`)
  }

  return <main className="min-h-screen bg-[#090d15] text-[#f3f5f7] selection:bg-[#ff6b19]/30">
    <header className="border-b border-[#202b39] bg-[#0a0f18]/95"><div className="mx-auto flex h-[66px] max-w-[1180px] items-center justify-between px-5 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm text-[#8792a4] md:flex"><a className="text-[#e8edf3]" href="#dashboard">Dashboard</a><a className="hover:text-white" href="#fuentes">Fuentes</a><a className="hover:text-white" href="#calidad">Calidad de datos</a></nav><div className="flex items-center gap-4"><span className="hidden text-sm text-[#8f9bac] sm:block">Hola, Martina</span><button aria-label="Abrir ayuda" className="grid size-8 place-items-center rounded-full border border-[#293546] text-[#8490a3]"><CircleHelp size={16}/></button><div className="grid size-8 place-items-center rounded-full bg-[#293546] text-xs font-semibold text-[#dbe2ea]">ML</div></div></div></header>
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-10">
      {message && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-[#6ee7b7]/25 bg-[#6ee7b7]/10 px-4 py-3 text-sm text-[#9af0c9]"><span>{message}</span><button aria-label="Cerrar mensaje" onClick={() => setMessage('')}><XCircle size={16}/></button></div>}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#ff792c]">Resumen operativo</p><h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">Métricas del negocio</h1><p className="mt-2 text-sm text-[#8e9aac]">Lectura contextual de ventas, compras, pérdidas, ingresos y stock.</p></div><div className="flex flex-wrap items-center gap-2"><label className="relative"><span className="sr-only">Período</span><CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8490a3]" size={15}/><select value={period} onChange={(event) => updateFilter(setPeriod, event.target.value, event.target.value)} className="appearance-none rounded-lg border border-[#334154] bg-[#101925] py-2.5 pl-9 pr-9 text-sm text-[#e6edf5] outline-none focus:border-[#55b9ee]"><option>Últimos 30 días</option><option>Últimos 7 días</option><option>Este mes</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8490a3]" size={15}/></label><label className="relative"><span className="sr-only">Unidad</span><select value={unit} onChange={(event) => updateFilter(setUnit, event.target.value, event.target.value)} className="appearance-none rounded-lg border border-[#334154] bg-[#101925] py-2.5 pl-3 pr-9 text-sm text-[#e6edf5] outline-none focus:border-[#55b9ee]"><option>Moneda local</option><option>Unidades</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8490a3]" size={15}/></label></div></div>
      <div className="mb-6 flex items-center justify-between rounded-lg border border-[#253142] bg-[#0d141e] px-4 py-3"><div><p className="text-xs text-[#718096]">Período seleccionado</p><p className="mt-1 text-sm font-medium text-[#dce4ec]">{data.range}</p></div><span className="text-xs text-[#8490a3]">Unidad: {unit}</span></div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"><MetricCard icon={ShoppingCart} label="Ventas" value={unit === 'Unidades' ? '1.284 un.' : data.sales} change={data.salesChange} note="realizado" accent={{ bg: 'bg-[#ff792c]/10', text: 'text-[#ff9b63]' }} /><MetricCard icon={Package} label="Compras" value={unit === 'Unidades' ? '742 un.' : data.purchases} change={data.purchasesChange} note="abastecimiento" accent={{ bg: 'bg-[#55b9ee]/10', text: 'text-[#70c9f4]' }} /><MetricCard icon={TrendingDown} label="Pérdidas" value={unit === 'Unidades' ? '38 un.' : data.losses} change={data.lossesChange} positive={false} note="mermas" accent={{ bg: 'bg-[#ffb454]/10', text: 'text-[#ffc170]' }} /><MetricCard icon={Wallet} label="Ingresos" value={unit === 'Unidades' ? '—' : data.income} change={unit === 'Unidades' ? 'No aplica' : data.incomeChange} note="netos" accent={{ bg: 'bg-[#6ee7b7]/10', text: 'text-[#7ce8bb]' }} /><MetricCard icon={BarChart3} label="Stock actual" value={data.stock} change={data.stockChange} note="disponible" accent={{ bg: 'bg-[#8b7cf6]/10', text: 'text-[#aaa0ff]' }} /></section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.85fr]"><article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-[#eef2f6]">Evolución de ventas</h2><p className="mt-1 text-xs text-[#718096]">Solo se muestran valores del período seleccionado</p></div><button className="inline-flex items-center gap-2 rounded-lg border border-[#334154] px-3 py-2 text-xs font-medium text-[#b6c1cf] hover:border-[#55b9ee]/60 hover:text-white"><Download size={14}/> Exportar</button></div><Chart values={data.chart} labels={data.months} /></article><article className="rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-[#eef2f6]">Stock por categoría</h2><p className="mt-1 text-xs text-[#718096]">Unidades disponibles</p></div><Package className="text-[#8b7cf6]" size={19}/></div><div className="mt-6 space-y-5"><div><div className="mb-2 flex justify-between text-xs"><span className="text-[#aeb8c6]">Almacén</span><span className="text-[#e6edf5]">3.420</span></div><div className="h-2 rounded-full bg-[#1b2634]"><div className="h-2 w-[78%] rounded-full bg-[#ff792c]" /></div></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-[#aeb8c6]">Bebidas</span><span className="text-[#e6edf5]">2.180</span></div><div className="h-2 rounded-full bg-[#1b2634]"><div className="h-2 w-[58%] rounded-full bg-[#55b9ee]" /></div></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-[#aeb8c6]">Lácteos</span><span className="text-[#e6edf5]">1.760</span></div><div className="h-2 rounded-full bg-[#1b2634]"><div className="h-2 w-[45%] rounded-full bg-[#8b7cf6]" /></div></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-[#aeb8c6]">Limpieza</span><span className="text-[#e6edf5]">1.100</span></div><div className="h-2 rounded-full bg-[#1b2634]"><div className="h-2 w-[30%] rounded-full bg-[#6ee7b7]" /></div></div></div></article></section>
      <section className="mt-5 rounded-xl border border-[#253142] bg-[#0f1621] p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-semibold text-[#eef2f6]">Productos destacados</h2><p className="mt-1 text-xs text-[#718096]">Mayor contribución a ventas en {period.toLowerCase()}</p></div><span className="rounded-full border border-[#ff792c]/20 bg-[#ff792c]/10 px-2.5 py-1 text-xs text-[#ffae7d]">Top 4</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <div key={product.name} className="rounded-lg border border-[#253142] bg-[#0b121c] p-4"><div className="mb-4 flex size-9 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: `${product.color}18`, color: product.color }}>#{products.indexOf(product) + 1}</div><p className="text-sm font-semibold text-[#e8edf3]">{product.name}</p><p className="mt-1 text-xs text-[#718096]">{product.category}</p><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-[#718096]">Vendidos</p><p className="mt-1 text-sm font-semibold text-[#dce4ec]">{product.sold}</p></div><p className="text-sm font-semibold text-[#7ce8bb]">{unit === 'Unidades' ? product.sold : product.value}</p></div></div>)}</div></section>
    </div>
  </main>
}
