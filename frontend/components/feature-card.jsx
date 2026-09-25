import { motion } from "framer-motion"

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-none dark:hover:border-brand/50"
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-blue/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-brand/10"
        aria-hidden="true"
      />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-transform duration-300 group-hover:scale-110 dark:bg-brand/15 dark:text-brand">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="relative mt-5 text-lg font-semibold text-[#1E293B] dark:text-[#F8FAFC]">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{description}</p>
    </motion.div>
  )
}
