import { ShieldCheck } from "lucide-react"

export default function ProcessingSummary({ completed }) {
  return (
    <aside className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Resumen final</h3>
        <ShieldCheck className="h-5 w-5 text-emerald-500" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F9FA] p-4 dark:border-[#263346] dark:bg-[#0B0F17]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748B] dark:text-[#94A3B8]">Registros</p>
          <p className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">2.148</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F9FA] p-4 dark:border-[#263346] dark:bg-[#0B0F17]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748B] dark:text-[#94A3B8]">Calidad</p>
          <p className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">96,4%</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F9FA] p-4 dark:border-[#263346] dark:bg-[#0B0F17]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748B] dark:text-[#94A3B8]">Errores críticos</p>
          <p className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">08</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4 dark:border-brand/35 dark:bg-brand/5">
        <p className="text-xs uppercase tracking-[0.14em] text-brand-blue dark:text-brand">Estado</p>
        <p className="mt-2 text-lg font-semibold text-[#1E293B] dark:text-[#F8FAFC]">
          {completed ? "Procesamiento finalizado" : "Pendiente de ejecución"}
        </p>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
          {completed
            ? "Los datos fueron validados, normalizados y cargados en el repositorio."
            : "Haz clic en iniciar procesamiento para ejecutar la pipeline sin backend."}
        </p>
      </div>
    </aside>
  )
}
