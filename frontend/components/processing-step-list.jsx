import { CheckCircle2 } from "lucide-react"
import AnimatedNumber from "@/components/animated-number"

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
            data-page-enter="" className={`flex items-center gap-4 rounded-lg border p-4 transition ${
              isComplete
                ? "border-emerald-200 bg-emerald-50 dark:border-[#2b6c55] dark:bg-[#12271f]"
                : isActive
                  ? "border-brand-blue/30 bg-blue-50 dark:border-[#6d4c29] dark:bg-[#2a1d12]"
                  : "border-[#E2E8F0] bg-[#F8F9FA] dark:border-[#253142] dark:bg-[#121a26]"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isComplete
                  ? "bg-emerald-500 text-white dark:bg-[#2b6c55]"
                  : isActive
                    ? "bg-brand-blue text-white dark:bg-[#ff6b19]"
                    : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#253142] dark:text-[#8490a3]"
              }`}
            >
              {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#1E293B] dark:text-[#f3f5f7]">{step.label}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    isComplete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-[#12271f] dark:text-[#6ee7b7]"
                      : isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-[#2a1d12] dark:text-[#ffb36e]"
                        : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#253142] dark:text-[#8490a3]"
                  }`}
                >
                  {isComplete ? "Listo" : isActive ? "En curso" : "Pendiente"}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#8490a3]">{step.caption}</p>
            </div>

            <div className="rounded-md bg-white px-3 py-2 text-right text-xs font-medium text-[#1E293B] shadow-sm dark:bg-[#0b111b] dark:text-[#dce1e8]">
              <AnimatedNumber value={step.tag} delay={index * 0.1} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
