import { CheckCircle2, LoaderCircle, RefreshCw, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import AnimatedNumber from "@/components/animated-number"

const toneClasses = {
  blue: "bg-blue-50 text-brand-blue dark:bg-blue-500/10 dark:text-blue-300",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300",
}

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } },
}

const contentSequenceVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const contentRiseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease: "easeOut" } },
}

function WidgetState({ widget, onRetry }) {
  if (widget.status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
        <LoaderCircle className="h-4 w-4 animate-spin text-brand-blue dark:text-brand" />
        Cargando información...
      </div>
    )
  }

  if (widget.status === "empty") {
    return <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">No hay información para mostrar todavía.</p>
  }

  if (widget.status === "error") {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-300">
          <XCircle className="h-4 w-4" />
          No se pudo cargar el widget
        </div>
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-blue-700 dark:text-brand dark:hover:text-brand-hover">
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300">
      <CheckCircle2 className="h-4 w-4" />
      {widget.detail}
    </div>
  )
}

export default function DashboardWidget({ widget, onRetry, animationDelay = 0 }) {
  const Icon = widget.icon
  const isUnavailable = widget.status === "empty" || widget.status === "error"

  return (
    <motion.article variants={cardVariants} className="flex min-h-[232px] flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)] dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
      <motion.div variants={contentRiseVariants} className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[widget.tone]}`}><Icon className="h-5 w-5" /></div>
        <span className="text-right text-[11px] font-medium text-[#94A3B8]">{widget.status === "ready" ? "Datos procesados" : "Sin registros"}</span>
      </motion.div>
      <motion.div variants={contentSequenceVariants} className="mt-5">
        <motion.p variants={contentRiseVariants} className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">{widget.title}</motion.p>
        <motion.p variants={contentRiseVariants} className={`mt-1 text-2xl font-bold tracking-tight ${isUnavailable ? "text-[#94A3B8]" : "text-[#1E293B] dark:text-[#F8FAFC]"}`}><AnimatedNumber value={widget.value} delay={animationDelay} /></motion.p>
      </motion.div>
      <motion.div variants={contentRiseVariants} className="mt-auto pt-4"><WidgetState widget={widget} onRetry={onRetry} /></motion.div>
    </motion.article>
  )
}
