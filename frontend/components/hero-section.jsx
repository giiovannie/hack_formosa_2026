import { ArrowRight, BarChart3, BellRing, Boxes, PlayCircle, TrendingUp } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F8F9FA] dark:bg-[#0B0F17]">
      <div className="pointer-events-none absolute -right-24 top-8 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl dark:bg-brand/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl dark:bg-violet-400/10" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-32">
        <div className="text-center lg:text-left">
        

          <h1 data-page-enter="" className="text-balance text-4xl font-bold leading-tight tracking-tight text-[#0F172A] md:text-6xl dark:text-[#F9FAFB]">
            Transformá el caos de tus planillas en decisiones que hacen crecer tu Pyme
          </h1>

          <p data-page-enter="" className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Stockflow reúne tu stock, tus ventas y tus números en un solo lugar. Pensado para pequeños comercios y
            emprendedores que quieren claridad, no complicaciones.
          </p>

          <div data-page-enter="" className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
          <a
            href="#cta"
            className="group inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 font-medium text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/50 dark:bg-brand dark:shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:hover:bg-brand-hover dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.45)]"
          >
            Probar Gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
          <a
            href="#funcionalidades"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white/70 px-6 py-3 font-medium text-[#1E293B] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-brand-blue/50 hover:bg-white dark:border-[#263346] dark:bg-white/5 dark:text-[#F8FAFC] dark:hover:border-brand/50 dark:hover:bg-white/10"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Ver Demo
          </a>
        </div>
      </div>

        <div data-page-enter="" className="relative mx-auto w-full max-w-2xl [perspective:1600px]" aria-label="Vista previa del dashboard de Stockflow">
          <div className="absolute -inset-8 rounded-[3rem] bg-brand-blue/10 blur-3xl dark:bg-brand/20" aria-hidden="true" />
          <div className="relative rotate-x-[10deg] rotate-y-[-12deg] rounded-2xl border border-[#E2E8F0] bg-white/90 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.18)] transition-transform duration-700 hover:rotate-x-[5deg] hover:rotate-y-[-5deg] dark:border-[#263346] dark:bg-[#151D2A]/90 dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] dark:border-[#263346] dark:bg-[#0B0F17]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 dark:border-[#263346]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1E293B] dark:text-[#F8FAFC]"><Boxes className="h-4 w-4 text-brand-blue dark:text-brand" /> Resumen de operaciones</div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">En vivo</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 dark:border-[#263346] dark:bg-[#151D2A]"><span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Ventas del mes</span><strong className="mt-1 block text-xl text-[#1E293B] dark:text-[#F8FAFC]">$48.290</strong><span className="mt-1 block text-[10px] text-[#10B981] dark:text-[#34D399]">+18.4% vs. anterior</span></div>
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 dark:border-[#263346] dark:bg-[#151D2A]"><span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Stock saludable</span><strong className="mt-1 block text-xl text-[#1E293B] dark:text-[#F8FAFC]">86%</strong><span className="mt-1 block text-[10px] text-brand-blue dark:text-brand">+12 productos</span></div>
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 dark:border-[#263346] dark:bg-[#151D2A]"><span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Capital inmovilizado</span><strong className="mt-1 block text-xl text-[#1E293B] dark:text-[#F8FAFC]">$6.840</strong><span className="mt-1 block text-[10px] text-[#F59E0B] dark:text-[#FBBF24]">-8.2% esta semana</span></div>
              </div>
              <div className="p-4 pt-1">
                <div className="flex items-center justify-between"><div><span className="text-xs font-medium text-[#1E293B] dark:text-[#F8FAFC]">Rotación de Stock vs. Capital Inmovilizado</span><span className="mt-1 block text-[10px] text-[#64748B] dark:text-[#94A3B8]">Últimos 6 meses</span></div><BarChart3 className="h-4 w-4 text-brand-blue dark:text-brand" /></div>
                <svg viewBox="0 0 640 190" className="mt-4 h-40 w-full" role="img" aria-label="Gráfico de rotación de stock y capital inmovilizado">
                  <defs><linearGradient id="stockFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" /><stop offset="100%" stopColor="#6366F1" stopOpacity="0" /></linearGradient></defs>
                  <path d="M0 145H640M0 100H640M0 55H640" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="4 8" />
                  <path d="M0 132 C70 126 78 105 130 112 S205 85 260 96 S340 58 395 76 S470 42 520 58 S585 25 640 34 V190 H0Z" fill="url(#stockFill)" />
                  <path d="M0 132 C70 126 78 105 130 112 S205 85 260 96 S340 58 395 76 S470 42 520 58 S585 25 640 34" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
                  <path d="M0 62 C70 72 88 86 135 78 S210 110 260 98 S350 125 395 105 S470 135 520 116 S585 145 640 128" fill="none" stroke="#38BDF8" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="7 8" strokeLinecap="round" />
                  <circle cx="520" cy="58" r="5" fill="#F8FAFC" stroke="#F97316" strokeWidth="3" />
                </svg>
                <div className="flex gap-5 text-[10px] text-[#64748B] dark:text-[#94A3B8]"><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-brand-blue dark:bg-brand" /> Rotación de stock</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Capital inmovilizado</span></div>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -left-5 top-10 hidden items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white/80 px-4 py-3 text-left shadow-[0_0_30px_rgba(37,99,235,0.18)] backdrop-blur-md sm:flex dark:border-[#263346] dark:bg-white/5 dark:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <TrendingUp className="h-5 w-5 text-[#10B981] dark:text-[#34D399]" /><div><strong className="block text-xs text-[#1E293B] dark:text-[#F8FAFC]">+32% Eficiencia en Ventas</strong><span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Últimos 30 días</span></div>
          </div>
          <div className="animate-float-delayed absolute -bottom-7 -right-4 hidden items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white/80 px-4 py-3 text-left shadow-[0_0_30px_rgba(239,68,68,0.14)] backdrop-blur-md sm:flex dark:border-[#263346] dark:bg-white/5 dark:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <BellRing className="h-5 w-5 text-[#EF4444] dark:text-[#F87171]" /><div><strong className="block text-xs text-[#1E293B] dark:text-[#F8FAFC]">Alerta Logística</strong><span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Stock crítico en 48hs</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
