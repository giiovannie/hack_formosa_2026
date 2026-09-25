import { ShieldCheck } from "lucide-react"

export default function ProcessingSummary({ completed }) {
  return (
    <aside className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-7 dark:border-[#253142] dark:bg-[#0f1621] dark:shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1E293B] dark:text-[#f3f5f7]">Resumen final</h3>
        <ShieldCheck className="h-5 w-5 text-emerald-500" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] p-4 dark:border-[#293546] dark:bg-[#121a26]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748B] dark:text-[#8490a3]">Registros</p>
          <p className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-[#f3f5f7]">2.148</p>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] p-4 dark:border-[#293546] dark:bg-[#121a26]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748B] dark:text-[#8490a3]">Calidad</p>
          <p className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-[#f3f5f7]">96,4%</p>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] p-4 dark:border-[#293546] dark:bg-[#121a26]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748B] dark:text-[#8490a3]">Errores críticos</p>
          <p className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-[#f3f5f7]">08</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4 dark:border-[#6d4c29] dark:bg-[#2a1d12]">
        <p className="text-xs uppercase tracking-[0.14em] text-brand-blue dark:text-[#ffb36e]">Estado</p>
        <p className="mt-2 text-sm font-semibold text-[#1E293B] dark:text-[#f2d0ad]">
          {completed ? "Procesamiento finalizado" : "Pendiente de ejecución"}
        </p>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#c59a70]">
          {completed
            ? "Los datos fueron validados, normalizados y cargados en el repositorio."
            : "Haz clic en iniciar procesamiento para ejecutar la pipeline sin backend."}
        </p>
      </div>
    </aside>
  )
}
