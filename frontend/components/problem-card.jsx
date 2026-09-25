import { motion } from "framer-motion"

export default function ProblemCard({ icon: Icon, title, description, featured, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={`group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-[0_0_25px_rgba(37,99,235,0.18)] dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-[0_15px_40px_rgba(0,0,0,0.16)] dark:hover:border-brand/50 dark:hover:shadow-[0_0_25px_rgba(249,115,22,0.25)] ${featured ? "md:col-span-2 md:row-span-2 md:p-8" : ""}`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-blue/5 blur-3xl transition-opacity duration-300 group-hover:bg-brand-blue/20 dark:bg-brand/10 dark:group-hover:bg-brand/20" aria-hidden="true" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-brand-blue/20 bg-brand-blue/10 text-brand-blue dark:border-brand/20 dark:bg-brand/10 dark:text-brand">
        <Icon className="h-6 w-6 animate-pulse" aria-hidden="true" />
      </div>
      <h3 className={`relative mt-5 font-semibold text-[#1E293B] dark:text-[#F8FAFC] ${featured ? "text-2xl md:max-w-sm" : "text-lg"}`}>{title}</h3>
      <p className={`relative mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8] ${featured ? "md:max-w-md md:text-base" : ""}`}>{description}</p>
      {featured && <div className="relative mt-8 hidden h-16 items-end gap-1 sm:flex" aria-hidden="true">{[34, 52, 43, 68, 56, 82, 74, 96, 88, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-blue/20 to-brand-blue/80 transition-all duration-500 group-hover:from-brand-blue/50 dark:from-brand/20 dark:to-brand/80 dark:group-hover:from-brand/50" style={{ height: `${height}%` }} />)}</div>}
    </motion.div>
  )
}
