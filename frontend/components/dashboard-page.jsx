import { useState } from "react"
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"
import DashboardWidget from "@/components/dashboard-widget"
import ProcessingDashboard from "@/components/processing-dashboard"
import DataEntry from "@/components/data-entry-and-upload"
import DataQuality from "@/components/data-quality"
import { dashboardWidgets } from "@/components/dashboard-data"
import CompanyConfiguration from "@/components/Profile-and-empresarial-configuration"
import Traceability from "@/components/traceability"

function WidgetPicker({ visibleIds, onToggle }) {
  return (
    <div className="absolute right-0 top-12 z-10 w-64 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-xl dark:border-[#263346] dark:bg-[#151D2A]">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B] dark:text-[#94A3B8]">Widgets visibles</p>
      <div className="space-y-1">
        {dashboardWidgets.map((widget) => {
          const selected = visibleIds.includes(widget.id)
          return <button key={widget.id} type="button" onClick={() => onToggle(widget.id)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-[#1E293B] hover:bg-[#F8F9FA] dark:text-[#F8FAFC] dark:hover:bg-[#0B0F17]"><span>{widget.title}</span><span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-brand-blue bg-brand-blue text-white dark:border-brand dark:bg-brand dark:text-[#0B0F17]" : "border-[#CBD5E1] dark:border-[#475569]"}`}>{selected && <Check className="h-3.5 w-3.5" />}</span></button>
        })}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("data-entry")
  const [visibleIds, setVisibleIds] = useState(dashboardWidgets.map((widget) => widget.id))
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [widgets, setWidgets] = useState(dashboardWidgets)

  const toggleWidget = (id) => setVisibleIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id])
  const retryWidget = (id) => setWidgets((current) => current.map((widget) => widget.id === id ? { ...widget, status: "loading" } : widget))

  if (activeView === "data-entry") {
    return <div className="min-h-screen bg-[#090d15] text-[#f3f5f7]"><DashboardNavbar activeView={activeView} onNavigate={setActiveView} /><div className="[&>main>header]:hidden"><DataEntry /></div></div>
  }

  if (activeView === "processing") {
    return <div className="min-h-screen bg-[#090d15] text-[#f3f5f7]"><DashboardNavbar activeView={activeView} onNavigate={setActiveView} /><ProcessingDashboard embedded /></div>
  }

  if (activeView === "traceability") {
    return <div className="min-h-screen bg-[#090d15] text-[#f3f5f7]"><DashboardNavbar activeView={activeView} onNavigate={setActiveView} /><Traceability embedded /></div>
  }

  if (activeView === "data-quality") {
    return <div className="min-h-screen bg-[#090d15] text-[#f3f5f7]"><DashboardNavbar activeView={activeView} onNavigate={setActiveView} /><div className="[&>main>header]:hidden"><DataQuality /></div></div>
  }

  if (activeView === "settings") {
    return <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17]"><DashboardNavbar activeView={activeView} onNavigate={setActiveView} /><CompanyConfiguration embedded /></div>
  }

  return (
    <div id="dashboard" className="min-h-screen bg-[#F8F9FA] text-[#1E293B] dark:bg-[#0B0F17] dark:text-[#F8FAFC]
      ">
      <DashboardNavbar activeView={activeView} onNavigate={setActiveView} />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue dark:text-brand">Resumen ejecutivo</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] md:text-4xl">Buen día, María</h1><p className="mt-2 text-[#64748B] dark:text-[#94A3B8]">Estos son los indicadores de tu empresa para hoy.</p></div>
          <div className="relative">
            <button type="button" onClick={() => setIsPickerOpen((current) => !current)} className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E293B] shadow-sm transition hover:border-brand-blue/50 dark:border-[#263346] dark:bg-[#151D2A] dark:text-[#F8FAFC]"><SlidersHorizontal className="h-4 w-4 text-brand-blue dark:text-brand" />Configurar widgets<ChevronDown className={`h-4 w-4 transition-transform ${isPickerOpen ? "rotate-180" : ""}`} /></button>
            {isPickerOpen && <WidgetPicker visibleIds={visibleIds} onToggle={toggleWidget} />}
          </div>
        </section>
        <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Indicadores principales</h2><p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Actualización automática cada 15 minutos</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Última sincronización: 09:42</span></div>
        {visibleIds.length === 0 ? <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center dark:border-[#475569] dark:bg-[#151D2A]"><p className="font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Tu tablero está vacío</p><p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Elegí al menos un widget para comenzar.</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{widgets.filter((widget) => visibleIds.includes(widget.id)).map((widget) => <DashboardWidget key={widget.id} widget={widget} onRetry={() => retryWidget(widget.id)} />)}</div>}
      </main>
    </div>
  )
}
