'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound, X } from 'lucide-react'

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.09.31-1.58V7.89H3.3A9.48 9.48 0 0 0 2.25 12c0 1.48.36 2.88 1.05 4.11l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z" />
    </svg>
  )
}

export function CredentialForm({ initialMode = 'login', onClose, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const isRegister = mode === 'register'

  function handleSubmit(event) {
    event.preventDefault()
    onAuthenticated?.()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="credential-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar autenticación" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-7 shadow-2xl shadow-slate-950/20 dark:border-[#263346] dark:bg-[#151D2A] dark:shadow-black/50 sm:p-9">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-lg p-2 text-[#64748B] transition hover:bg-slate-100 hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:text-[#94A3B8] dark:hover:bg-[#263346] dark:hover:text-[#F8FAFC] dark:focus-visible:ring-brand" aria-label="Cerrar autenticación">
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="mb-8 pr-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#1E293B] dark:text-[#F8FAFC]">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-blue text-white shadow-lg shadow-blue-600/20 dark:bg-brand dark:text-[#0B0F17] dark:shadow-[0_0_20px_rgba(249,115,22,0.3)]"></span>
          </div>
          <h2 id="credential-title" className="text-2xl font-semibold tracking-tight text-[#1E293B] dark:text-[#F8FAFC]">
            {isRegister ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#64748B] dark:text-[#94A3B8]">
            {isRegister ? 'Empezá a ordenar tus operaciones hoy.' : 'Accedé a tu espacio de gestión inteligente.'}
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="flex flex-col gap-2 text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]" htmlFor="credential-name">
              Nombre o empresa
              <span className="relative">
                <UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                <input id="credential-name" name="name" type="text" autoComplete="name" placeholder="Tu empresa" required className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-11 text-sm text-[#1E293B] outline-none transition placeholder:text-[#94A3B8] hover:border-brand-blue/70 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC] dark:hover:border-brand/70 dark:focus:border-brand dark:focus:ring-brand/10" />
              </span>
            </label>
          )}
          <label className="flex flex-col gap-2 text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]" htmlFor="credential-email">
            Correo electrónico
            <span className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
              <input id="credential-email" name="email" type="email" autoComplete="email" placeholder="tu@empresa.com" required className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-11 text-sm text-[#1E293B] outline-none transition placeholder:text-[#94A3B8] hover:border-brand-blue/70 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC] dark:hover:border-brand/70 dark:focus:border-brand dark:focus:ring-brand/10" />
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]" htmlFor="credential-password">
            Contraseña
            <span className="relative">
              <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
              <input id="credential-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="••••••••" required className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] px-11 pr-11 text-sm text-[#1E293B] outline-none transition placeholder:text-[#94A3B8] hover:border-brand-blue/70 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 dark:border-[#263346] dark:bg-[#0B0F17] dark:text-[#F8FAFC] dark:hover:border-brand/70 dark:focus:border-brand dark:focus:ring-brand/10" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#64748B] transition hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] dark:focus-visible:ring-brand" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff aria-hidden="true" className="size-[18px]" /> : <Eye aria-hidden="true" className="size-[18px]" />}
              </button>
            </span>
          </label>
          {!isRegister && <div className="-mt-1 flex justify-end"><a href="#forgot-password" className="text-xs font-medium text-[#64748B] transition hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] dark:focus-visible:ring-brand">¿Olvidaste tu contraseña?</a></div>}
          <button type="submit" className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/30 active:scale-[0.99] dark:bg-brand dark:text-[#0B0F17] dark:shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:hover:bg-brand-hover dark:focus-visible:ring-brand/30">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>

        <div className="my-7 flex items-center gap-3 text-xs text-[#94A3B8]"><span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#263346]" /><span>o</span><span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#263346]" /></div>
        <button type="button" onClick={onAuthenticated} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-transparent text-sm font-semibold text-[#1E293B] transition hover:border-brand-blue/50 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/15 dark:border-[#263346] dark:text-[#F8FAFC] dark:hover:border-brand/50 dark:hover:bg-brand/10 dark:focus-visible:ring-brand/15"><GoogleMark /> Continuar con Google</button>
        <p className="mt-7 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
          {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}{' '}
          <button type="button" onClick={() => { setMode(isRegister ? 'login' : 'register'); setShowPassword(false) }} className="font-semibold text-brand-blue underline-offset-4 hover:underline dark:text-brand">
            {isRegister ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </p>
        <p className="mt-4 text-center text-xs leading-5 text-[#94A3B8]">Al continuar, aceptas nuestros <a href="#terms" className="underline decoration-[#E2E8F0] underline-offset-2 hover:text-[#1E293B] dark:hover:text-[#F8FAFC]">Términos</a> y <a href="#privacy" className="underline decoration-[#E2E8F0] underline-offset-2 hover:text-[#1E293B] dark:hover:text-[#F8FAFC]">Política de privacidad</a>.</p>
      </div>
    </div>
  )
}

export function LoginPage({ onClose }) {
  return <CredentialForm onClose={onClose} />
}