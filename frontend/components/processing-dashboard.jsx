import { useEffect, useState } from "react"
import {
  ArrowRight,
  Database,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react"
import ProcessingStepList from "@/components/processing-step-list"
import ProcessingSummary from "@/components/processing-summary"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "processing", label: "Procesamiento", icon: Sparkles },
  { id: "sources", label: "Fuentes", icon: Database },
  { id: "reports", label: "Reportes", icon: FileText },
  { id: "settings", label: "Configuración", icon: Settings },
]

export const processingSteps = [
  { label: "Extracción", caption: "Archivos y planillas cargadas", tag: "14/14" },
  { label: "Validación", caption: "Revisión de filas y columnas", tag: "96%" },
  { label: "Limpieza", caption: "Duplicados y errores corregidos", tag: "1.240" },
  { label: "Normalización", caption: "Formatos y unidades estandarizadas", tag: "84%" },
  { label: "Clasificación", caption: "Categorías y reglas aplicadas", tag: "640" },
  { label: "Carga", caption: "Resultado listo para análisis", tag: "Listo" },
]

export default function ProcessingDashboard({ embedded = false }) {
  const [activeView, setActiveView] = useState("processing")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isProcessing) return undefined

    const timer = window.setInterval(() => {
      setProgress((previous) => {
        const nextValue = Math.min(previous + 8, 100)
        const nextStep = Math.min(
          Math.floor((nextValue / 100) * processingSteps.length),
          processingSteps.length - 1,
        )

        setCurrentStep(nextStep)

        if (nextValue >= 100) {
          window.clearInterval(timer)
          setIsProcessing(false)
        }

        return nextValue
      })
    }, 420)

    return () => window.clearInterval(timer)
  }, [isProcessing])

  const completed = progress >= 100
  const activeStepLabel = processingSteps[Math.min(currentStep, processingSteps.length - 1)]?.label ?? "Extracción"

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] dark:bg-[#0B0F17] dark:text-[#F8FAFC]">
      {!embedded && <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-[#F8F9FA]/80 backdrop-blur-md dark:border-[#263346] dark:bg-[#0B0F17]/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500">
              <img src="/gato.svg" alt="Stockflow" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">Workspace</p>
              <p className="text-base font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Stockflow</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 p-1 dark:border-[#263346] dark:bg-[#151D2A]/80 md:flex">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeView === id
                    ? "bg-brand-blue text-white shadow-lg shadow-blue-600/25 dark:bg-brand dark:text-[#0B0F17]"
                    : "text-[#64748B] hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#1E293B] dark:border-[#263346] dark:bg-[#151D2A] dark:text-[#F8FAFC] sm:block">
              María López
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#1E293B] transition hover:border-brand-blue/50 hover:text-brand-blue dark:border-[#263346] dark:bg-[#151D2A] dark:text-[#F8FAFC] dark:hover:border-brand/60 dark:hover:text-brand"
            >
              Salir
            </button>
          </div>
        </nav>
      </header>}

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-blue dark:text-brand">Flujo de trabajo</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] md:text-4xl">
              Procesamiento de datos
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setProgress(0)
              setCurrentStep(0)
              setIsProcessing(false)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E293B] transition hover:border-brand-blue/50 hover:text-brand-blue dark:border-[#263346] dark:bg-[#151D2A] dark:text-[#F8FAFC] dark:hover:border-brand/60 dark:hover:text-brand"
          >
            <Wand2 className="h-4 w-4" />
            Reiniciar
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Estado actual</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#1E293B] dark:text-[#F8FAFC]">
                  {completed ? "Carga completada" : activeStepLabel}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => !isProcessing && setIsProcessing(true)}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80 dark:bg-brand dark:text-[#0B0F17] dark:shadow-[0_0_20px_rgba(249,115,22,0.26)] dark:hover:bg-brand-hover"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {completed ? "Reprocesar" : "Iniciar procesamiento"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between text-sm text-[#64748B] dark:text-[#94A3B8]">
                <span>Avance</span>
                <span className="font-semibold text-[#1E293B] dark:text-[#F8FAFC]">{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#263346]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-blue via-blue-500 to-[#F97316] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ProcessingStepList
              steps={processingSteps}
              currentStep={currentStep}
              isProcessing={isProcessing}
              completed={completed}
            />
          </section>

          <ProcessingSummary completed={completed} />
        </div>
      </main>
    </div>
  )
}
