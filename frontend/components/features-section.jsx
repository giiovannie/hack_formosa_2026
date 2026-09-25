import { BellRing, Snowflake, FileSpreadsheet, MessageSquareText } from "lucide-react"
import { motion } from "framer-motion"
import FeatureCard from "@/components/feature-card"

const features = [
  {
    icon: BellRing,
    title: "Alertas de reposición de stock",
    description:
      "Recibí avisos automáticos antes de quedarte sin producto. Comprás a tiempo y nunca perdés una venta por falta de mercadería.",
  },
  {
    icon: Snowflake,
    title: "Detector de capital inmovilizado",
    description:
      "Identificá qué productos no rotan y cuánta plata tenés dormida en el depósito. Liberá capital y mejorá tu flujo de caja.",
  },
  {
    icon: FileSpreadsheet,
    title: "Ingesta fácil desde Excel/CSV",
    description:
      "Subí tus planillas de siempre y Stockflow las ordena por vos. Migrás en minutos, sin cargar todo a mano de nuevo.",
  },
  {
    icon: MessageSquareText,
    title: "Asistente virtual por chat",
    description:
      "Preguntá en lenguaje natural: ¿qué se vendió más?, ¿qué me falta reponer? El asistente responde al instante.",
  },
]

export default function FeaturesSection() {
  return (
    <section data-page-enter="" id="funcionalidades" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-[#1E293B] md:text-4xl dark:text-[#F8FAFC]">
            Todo lo que necesitás para decidir mejor
          </h2>
          <p className="mt-4 text-pretty text-[#64748B] dark:text-[#94A3B8]">
            Herramientas simples y potentes que trabajan por vos, para que te enfoques en hacer crecer tu negocio.
          </p>
        </div>
      </motion.div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} delay={index * 0.1} {...feature} />
        ))}
      </div>
    </section>
  )
}
