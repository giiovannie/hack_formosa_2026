import { CheckCircle2 } from "lucide-react"

export default function ProcessingStepList({
  steps,
  currentStep,
  isProcessing,
  completed,
}) {
  const getStepState = (index) => {
    if (completed || index < currentStep) return "complete"
    if (index === currentStep && isProcessing) return "active"
    return "upcoming"
  }

  return (
    <ol className="mt-8 space-y-4">
      {steps.map((step, index) => {
        const state = getStepState(index)
        const isComplete = state === "complete"
        const isActive = state === "active"

        return (
          <li
            key={step.label}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
              isComplete
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                : isActive
                  ? "border-brand-blue/30 bg-blue-50 dark:border-brand/40 dark:bg-brand/5"
                  : "border-[#E2E8F0] bg-[#F8F9FA] dark:border-[#263346] dark:bg-[#0B0F17]"
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isComplete
                  ? "bg-emerald-500 text-white"
                  : isActive
                    ? "bg-brand-blue text-white dark:bg-brand dark:text-[#0B0F17]"
                    : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#263346] dark:text-[#94A3B8]"
              }`}
            >
              {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-[#1E293B] dark:text-[#F8FAFC]">{step.label}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    isComplete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : isActive
                        ? "bg-brand-blue/10 text-brand-blue dark:bg-brand/10 dark:text-brand"
                        : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#263346] dark:text-[#94A3B8]"
                  }`}
                >
                  {isComplete ? "Listo" : isActive ? "En curso" : "Pendiente"}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{step.caption}</p>
            </div>

            <div className="rounded-xl bg-white px-3 py-2 text-right text-xs font-medium text-[#1E293B] shadow-sm dark:bg-[#0B0F17] dark:text-[#F8FAFC]">
              {step.tag}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
