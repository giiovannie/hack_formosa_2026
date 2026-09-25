"use client"

import { useState } from "react"
import { CredentialForm } from "@/components/credential-form"

const links = [
  { label: "Producto", href: "#funcionalidades" },
  { label: "Problema", href: "#problema" },
  { label: "Simplicidad", href: "#simplicidad" },
]

export default function Navbar({ onAuthSuccess }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-[#F8F9FA]/80 backdrop-blur-md transition-colors duration-300 dark:border-[#263346] dark:bg-[#0B0F17]/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-orange-600 to-orange-500">
              <img src="/gato.svg" alt="Gato Stock Mascota" className="h-10 w-10 object-contain" />
            </div>
            <span className="text-lg text-[#1E293B] dark:text-[#F8FAFC]">Stockflow</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#64748B] transition-colors hover:text-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] dark:focus-visible:ring-brand sm:inline-flex"
            >
              Iniciar sesión
            </button>
            <a
              href="#cta"
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/50 dark:bg-brand dark:shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:hover:bg-brand-hover dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.45)]"
            >
              Probar Demo
            </a>
          </div>
        </nav>
      </header>
      {isAuthOpen && (
        <CredentialForm
          onClose={() => setIsAuthOpen(false)}
          onSuccess={onAuthSuccess}
        />
      )}
    </>
  )
}
