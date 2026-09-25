import { Bell, ChevronDown, LayoutDashboard, Settings2 } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

export default function DashboardNavbar() {
  return (
    <header className="border-b border-[#E2E8F0] bg-[#F8F9FA]/90 backdrop-blur-md dark:border-[#263346] dark:bg-[#0B0F17]/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#dashboard" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500"><img src="/gato.svg" alt="Stockflow" className="h-10 w-10 object-contain" /></div>
          <div className="hidden sm:block"><p className="text-xs uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">Workspace</p><p className="text-base font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Stockflow</p></div>
        </a>
        <div className="hidden items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white/80 p-1 dark:border-[#263346] dark:bg-[#151D2A]/80 md:flex">
          <a href="#dashboard" className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-brand dark:text-[#0B0F17]"><LayoutDashboard className="h-4 w-4" />Dashboard</a>
          <a href="#settings" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"><Settings2 className="h-4 w-4" />Configuración</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" aria-label="Ver alertas" className="relative rounded-lg p-2 text-[#64748B] hover:bg-white hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#151D2A] dark:hover:text-[#F8FAFC]"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" /></button>
          <button type="button" className="hidden items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#1E293B] dark:border-[#263346] dark:bg-[#151D2A] dark:text-[#F8FAFC] sm:flex"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue dark:bg-brand/10 dark:text-brand">ML</span>María López<ChevronDown className="h-4 w-4 text-[#94A3B8]" /></button>
        </div>
      </nav>
    </header>
  )
}