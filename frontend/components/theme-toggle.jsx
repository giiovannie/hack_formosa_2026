"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
      className="group fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-brand-blue shadow-xl shadow-slate-900/10 transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 dark:border-[#263346] dark:bg-[#151D2A] dark:text-brand dark:shadow-black/40 sm:bottom-6 sm:right-6"
    >
      <span
        className="absolute inset-0 rounded-full bg-brand-blue/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 dark:bg-brand/20"
        aria-hidden="true"
      />
      <span className="relative flex items-center justify-center">
        <Sun
          className={`h-6 w-6 transition-all duration-500 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          } ${isDark ? "" : "absolute"}`}
          aria-hidden="true"
        />
        <Moon
          className={`h-6 w-6 transition-all duration-500 ${
            isDark ? "rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
          }`}
          aria-hidden="true"
        />
      </span>
    </button>
  )
}
