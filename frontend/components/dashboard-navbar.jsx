<<<<<<< HEAD
import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, Database, FileCheck2, GitBranch, LayoutDashboard, Settings2, Upload } from "lucide-react"

const navItems = [
=======
import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, Database, FileCheck2, GitBranch, LayoutDashboard, Settings2, Upload } from "lucide-react"

const navItems = [
>>>>>>> 853cee2583f556d8931ed66aa632ecc5f97c087c
  { id: "data-entry", label: "Carga de datos", icon: Upload },
  { id: "processing", label: "Procesamiento", icon: Database },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "data-quality", label: "Calidad de datos", icon: FileCheck2 },
  { id: "traceability", label: "Trazabilidad", icon: GitBranch },
]

export default function DashboardNavbar({ activeView, onNavigate }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setIsProfileMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsProfileMenuOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isProfileMenuOpen])

  return (
    <header className="relative z-[60] border-b border-[#E2E8F0] bg-[#F8F9FA]/90 backdrop-blur-md dark:border-[#263346] dark:bg-[#0B0F17]/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#dashboard" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500"><img src="/gato.svg" alt="Stockflow" className="h-10 w-10 object-contain" /></div>
          <div className="hidden sm:block"><p className="text-xs uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">Workspace</p><p className="text-base font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Stockflow</p></div>
        </a>
        <div className="hidden items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white/80 p-1 dark:border-[#263346] dark:bg-[#151D2A]/80 md:flex">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${activeView === id ? "bg-brand-blue font-semibold text-white shadow-sm dark:bg-brand dark:text-[#0B0F17]" : "text-[#64748B] hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Ver alertas" className="relative rounded-lg p-2 text-[#64748B] hover:bg-white hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#151D2A] dark:hover:text-[#F8FAFC]"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" /></button>
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#1E293B] dark:border-[#263346] dark:bg-[#151D2A] dark:text-[#F8FAFC]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue dark:bg-brand/10 dark:text-brand">ML</span>
              <span className="hidden sm:inline">María López</span>
              <ChevronDown className={`h-4 w-4 text-[#94A3B8] transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isProfileMenuOpen && (
              <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl dark:border-[#263346] dark:bg-[#151D2A]">
                <div className="flex items-center gap-3 px-3 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-bold text-brand-blue dark:bg-brand/10 dark:text-brand">ML</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1E293B] dark:text-[#F8FAFC]">María López</p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Información del usuario</p>
                  </div>
                </div>
                <dl className="space-y-3 px-3 py-2">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">Edad</dt>
                    <dd className="mt-0.5 text-sm text-[#1E293B] dark:text-[#F8FAFC]">26 años</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">Correo electrónico</dt>
                    <dd className="mt-0.5 break-all text-sm text-[#1E293B] dark:text-[#F8FAFC]">marialopez@gmail.com</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">PyME a cargo</dt>
                    <dd className="mt-0.5 text-sm text-[#1E293B] dark:text-[#F8FAFC]">Almacén La Esquina</dd>
                  </div>
                </dl>
                <div className="my-1 border-t border-[#E2E8F0] dark:border-[#263346]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    onNavigate("settings")
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#1E293B] transition hover:bg-[#F8F9FA] dark:text-[#F8FAFC] dark:hover:bg-[#0B0F17]"
                >
                  <Settings2 className="h-4 w-4 text-brand-blue dark:text-brand" />
                  Configuración
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
