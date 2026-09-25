import { Zap, MousePointerClick, Clock } from "lucide-react"

const points = [
  { icon: MousePointerClick, label: "Sin configuraciones difíciles" },
  { icon: Zap, label: "Fácil de usar desde el primer minuto" },
  { icon: Clock, label: "Pensado para tu día a día" },
]

export default function SimplicityBanner() {
  return (
    <section id="simplicidad" className="mx-auto max-w-6xl px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-10 shadow-sm md:p-14 dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-none">
        <div
          className="absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-3xl dark:bg-brand/10"
          aria-hidden="true"
        />
        <div data-page-enter="" className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-[#1E293B] md:text-4xl dark:text-[#F8FAFC]">
            Software simple, para gente que no tiene tiempo que perder
          </h2>
          <p className="mt-4 text-pretty text-[#64748B] dark:text-[#94A3B8]">
            Stockflow está pensado para el día a día real de pequeños comercios. Nada de manuales interminables ni
            instalaciones complejas: abrís, cargás y empezás a decidir mejor.
          </p>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.label}
              data-page-enter=""
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-5 py-4 dark:border-[#263346] dark:bg-[#0B0F17]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue dark:bg-brand/15 dark:text-brand">
                <point.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]">{point.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
