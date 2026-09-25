import { Boxes } from "lucide-react"

export default function Footer({ showProductLinks = true }) {
  return (
    <footer data-page-enter="" className="border-t border-[#E2E8F0] bg-[#F8F9FA] transition-colors duration-300 dark:border-[#263346] dark:bg-[#0B0F17]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue dark:bg-brand">
            <Boxes className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-semibold text-[#1E293B] dark:text-[#F8FAFC]">Stockflow</span>
        </a>

        {showProductLinks && <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#64748B] dark:text-[#94A3B8]">
          <a href="#funcionalidades" className="transition-colors hover:text-[#1E293B] dark:hover:text-[#F8FAFC]">
            Producto
          </a>
          <a href="#problema" className="transition-colors hover:text-[#1E293B] dark:hover:text-[#F8FAFC]">
            Problema
          </a>
          <a href="#simplicidad" className="transition-colors hover:text-[#1E293B] dark:hover:text-[#F8FAFC]">
            Simplicidad
          </a>
          <a href="#cta" className="transition-colors hover:text-[#1E293B] dark:hover:text-[#F8FAFC]">
            Probar Demo
          </a>
        </nav>}

        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">© {new Date().getFullYear()} Stockflow</p>
      </div>
    </footer>
  )
}
