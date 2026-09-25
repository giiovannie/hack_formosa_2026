import { useEffect, useRef, useState } from "react"
import { Activity, Bell, ChevronDown, ChevronLeft, ChevronRight, FileCheck2, GitBranch, LayoutDashboard, LineChart, Settings2, Upload, Database } from "lucide-react"
import { motion } from "framer-motion"

const navItems = [
  { id: "data-entry", label: "Carga de datos", icon: Upload },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "data-quality", label: "Calidad de datos", icon: FileCheck2 },
  { id: "traceability", label: "Trazabilidad", icon: GitBranch },
  { id: "contextualization", label: "Contexto", icon: Activity },
  { id: "external-sources", label: "Fuentes", icon: Database },
  { id: "productivity", label: "Productividad", icon: LayoutDashboard },
  { id: "trends", label: "Tendencias", icon: LineChart },
]

export default function DashboardNavbar({ activeView, onNavigate }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [carouselCenter, setCarouselCenter] = useState(0)
  const [isCarouselEngaged, setIsCarouselEngaged] = useState(false)
  const profileMenuRef = useRef(null)
  const carouselRef = useRef(null)
  const lastWheelNavigation = useRef(0)

  const moveCarousel = (direction) => {
    const currentIndex = navItems.findIndex(({ id }) => id === activeView)
    const nextIndex = ((currentIndex < 0 ? carouselCenter : currentIndex) + direction + navItems.length) % navItems.length
    setCarouselCenter(nextIndex)
    onNavigate(navItems[nextIndex].id)
    const viewport = carouselRef.current
    const nextItem = viewport?.children[nextIndex]
    if (!viewport || !nextItem) return
    viewport.scrollTo({
      left: nextItem.offsetLeft - (viewport.clientWidth - nextItem.clientWidth) / 2,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const activeIndex = navItems.findIndex(({ id }) => id === activeView)
    if (activeIndex < 0) return
    setCarouselCenter(activeIndex)

    const viewport = carouselRef.current
    const activeItem = viewport?.children[activeIndex]
    if (!viewport || !activeItem) return
    viewport.scrollTo({
      left: activeItem.offsetLeft - (viewport.clientWidth - activeItem.clientWidth) / 2,
      behavior: "smooth",
    })
  }, [activeView])

  useEffect(() => {
    const handleSectionKeys = (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || isProfileMenuOpen) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))) return

      event.preventDefault()
      const currentIndex = navItems.findIndex(({ id }) => id === activeView)
      const baseIndex = currentIndex < 0 ? carouselCenter : currentIndex
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const nextIndex = (baseIndex + direction + navItems.length) % navItems.length
      const nextItem = carouselRef.current?.children[nextIndex]
      setCarouselCenter(nextIndex)
      onNavigate(navItems[nextIndex].id)
      requestAnimationFrame(() => {
        nextItem?.focus()
        if (carouselRef.current && nextItem) {
          carouselRef.current.scrollTo({
            left: nextItem.offsetLeft - (carouselRef.current.clientWidth - nextItem.clientWidth) / 2,
            behavior: 'smooth',
          })
        }
      })
    }

    document.addEventListener('keydown', handleSectionKeys)
    return () => document.removeEventListener('keydown', handleSectionKeys)
  }, [activeView, carouselCenter, isProfileMenuOpen, onNavigate])

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
    <header data-page-enter="" className="relative z-[60] border-b border-[#E2E8F0] bg-[#F8F9FA]/90 backdrop-blur-md dark:border-[#263346] dark:bg-[#0B0F17]/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#dashboard" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500"><img src="/gato.svg" alt="Stockflow" className="h-10 w-10 object-contain" /></div>
          <div className="hidden sm:block"><p className="text-xs uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">Workspace</p><p className="text-base font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Stockflow</p></div>
        </a>
        <div
          className={`group relative hidden w-[min(38vw,520px)] shrink items-center overflow-hidden px-1 transition-opacity duration-300 md:flex ${isCarouselEngaged ? "opacity-100" : "opacity-65 hover:opacity-100 focus-within:opacity-100"}`}
          onMouseEnter={() => setIsCarouselEngaged(true)}
          onMouseLeave={() => setIsCarouselEngaged(false)}
          onWheel={(event) => {
            const now = Date.now()
            if (!carouselRef.current || now - lastWheelNavigation.current < 220) return
            event.preventDefault()
            lastWheelNavigation.current = now
            const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
            if (delta !== 0) moveCarousel(delta > 0 ? 1 : -1)
          }}
          onMouseMove={(event) => {
            const items = [...(carouselRef.current?.children ?? [])]
            const pointerX = event.clientX
            const nearestIndex = items.reduce((nearest, item, index) => {
              const distance = Math.abs(item.getBoundingClientRect().left + item.offsetWidth / 2 - pointerX)
              return distance < nearest.distance ? { index, distance } : nearest
            }, { index: carouselCenter, distance: Infinity }).index
            setCarouselCenter(nearestIndex)
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#F8F9FA] to-transparent dark:from-[#0B0F17]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#F8F9FA] to-transparent dark:from-[#0B0F17]" />
          <button type="button" aria-label="Sección anterior" onClick={() => moveCarousel(-1)} className="absolute left-0 top-1/2 z-20 grid h-7 w-6 -translate-y-1/2 place-items-center rounded-md bg-white/90 text-[#334155] shadow-sm transition hover:bg-white dark:bg-[#151D2A]/90 dark:text-[#CBD5E1] dark:hover:bg-[#202B3A]"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="Sección siguiente" onClick={() => moveCarousel(1)} className="absolute right-0 top-1/2 z-20 grid h-7 w-6 -translate-y-1/2 place-items-center rounded-md bg-white/90 text-[#334155] shadow-sm transition hover:bg-white dark:bg-[#151D2A]/90 dark:text-[#CBD5E1] dark:hover:bg-[#202B3A]"><ChevronRight className="h-4 w-4" /></button>
          <div
            ref={carouselRef}
            role="toolbar"
            aria-label="Navegación principal"
            aria-orientation="horizontal"
            className="flex w-full items-center gap-1 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map(({ id, label, icon: Icon }, index) => {
              const distance = index - carouselCenter
              const scale = Math.max(0.78, 1 - Math.abs(distance) * 0.08)
              const opacity = Math.max(0.42, 1 - Math.abs(distance) * 0.18)
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  aria-current={activeView === id ? "page" : undefined}
                  onClick={() => {
                    setCarouselCenter(index)
                    onNavigate(id)
                  }}
                  className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-200 ${activeView === id ? "font-semibold text-white" : "text-[#64748B] hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"}`}
                  style={{ opacity, transform: `perspective(500px) rotateY(${distance * -8}deg) scale(${scale})` }}
                >
                  {activeView === id && <motion.span layoutId="navbar-active-section" className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_4px_16px_rgba(234,88,12,0.35)]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                  <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Ver alertas" aria-current={activeView === "alerts" ? "page" : undefined} onClick={() => onNavigate("alerts")} className={`relative rounded-lg p-2 transition ${activeView === "alerts" ? "bg-orange-500/10 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400" : "text-[#64748B] hover:bg-white hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#151D2A] dark:hover:text-[#F8FAFC]"}`}><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" /></button>
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
