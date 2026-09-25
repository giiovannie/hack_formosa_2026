import { FileWarning, PackageX, Truck } from "lucide-react"
import { motion } from "framer-motion"
import ProblemCard from "@/components/problem-card"

const problems = [
  {
    icon: FileWarning,
    title: "Planillas desactualizadas",
    description:
      "Datos cargados manualmente, se te interponen las versiones y nunca se sabe cuál es la real. Se elije a ciegas un Excel que ya quedó viejo.",
  },
  {
    icon: PackageX,
    title: "Mercadería parada",
    description:
      "Capital sin salida: productos que no rotan mientras te faltan los que sí se venden. Tu economia se queda quieta sin darte cuenta.",
  },
  {
    icon: Truck,
    title: "Demoras en envíos",
    description:
      "Te quedás sin stock justo cuando llega el pedido. Reponés tarde, perdés ventas y el cliente se va a la competencia.",
  },
]

export default function ProblemSection() {
  return (
    <section id="problema" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-[#1E293B] md:text-4xl dark:text-[#F8FAFC]">
            Gestionar un comercio no debería doler tanto
          </h2>
          <p className="mt-4 text-pretty text-[#64748B] dark:text-[#94A3B8]">
            Estos son los problemas que frenan a las Pymes todos los días. Stockflow los resuelve eficientemente.
          </p>
        </div>
      </motion.div>

      <div className="mt-14 grid gap-5 md:grid-cols-3 md:grid-rows-2">
        {problems.map((problem, index) => (
          <ProblemCard key={problem.title} delay={index * 0.1} featured={index === 0} {...problem} />
        ))}
      </div>
    </section>
  )
}
