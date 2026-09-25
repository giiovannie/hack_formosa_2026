import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function CtaSection() {
  return (
    <section data-page-enter="" id="cta" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white px-8 py-16 text-center shadow-[0_0_50px_rgba(37,99,235,0.12)] dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-[0_0_20px_rgba(249,115,22,0.3)] md:px-16 md:py-20"
      >
        <div
          className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-blue-200/60 dark:from-[#0B0F17] dark:via-[#151D2A] dark:to-[#F97316]/30"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-[#1E293B] dark:text-[#F8FAFC] md:text-4xl">
            Empezá a tomar decisiones con datos, no con corazonadas
          </h2>
          <p className="mt-4 text-pretty text-[#64748B] dark:text-[#94A3B8]">
            Probá Stockflow gratis y ordená tu stock, tus ventas y tus números en minutos. Sin tarjeta, sin
            compromisos.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-blue px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/50 dark:bg-brand dark:text-[#0B0F17] dark:shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:hover:bg-brand-hover dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.45)]"
            >
              Probar Gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
