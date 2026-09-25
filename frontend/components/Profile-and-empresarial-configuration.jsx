import { useCallback, useEffect, useState } from 'react'
import { getModule, putModule } from '@/src/api'

const fields = ['areas', 'availableData', 'analysisObjectives']
const fieldLabels = { areas: 'Áreas', availableData: 'Datos disponibles', analysisObjectives: 'Objetivos de análisis' }

export default function CompanyConfiguration() {
  const [profile, setProfile] = useState(null)
  const [industry, setIndustry] = useState('')
  const [lists, setLists] = useState({ areas: '', availableData: '', analysisObjectives: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    try {
      const result = await getModule('/empresa/perfil')
      setProfile(result.profile)
      if (result.profile) {
        setIndustry(result.profile.industry || '')
        setLists(Object.fromEntries(fields.map((key) => [key, (result.profile[key] || []).join(', ')])))
      }
    } catch (cause) { setError(cause.message) }
  }, [])
  useEffect(() => { load() }, [load])
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      const body = { industry, ...Object.fromEntries(fields.map((key) => [key, lists[key].split(',').map((value) => value.trim()).filter(Boolean)])) }
      const result = await putModule('/empresa/perfil', body)
      setProfile(result.profile); setMessage('Perfil guardado en la base de datos.')
    } catch (cause) { setError(cause.message) } finally { setBusy(false) }
  }

  return <main className="min-h-screen bg-[#090d15] px-5 py-10 text-[#f3f5f7]"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold">Perfil empresarial</h1><p className="mt-2 text-sm text-[#8e9aac]">La configuración se guarda para la empresa autenticada.</p>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}<form onSubmit={save} className="mt-6 space-y-4 rounded-xl border border-[#293749] bg-[#0f1621] p-5"><label className="block text-sm">Rubro<input required value={industry} onChange={(event) => setIndustry(event.target.value)} className="mt-2 block w-full rounded-lg border border-[#334154] bg-[#111b29] p-3"/></label>{fields.map((key) => <label key={key} className="block text-sm">{fieldLabels[key]}<input value={lists[key]} onChange={(event) => setLists((current) => ({ ...current, [key]: event.target.value }))} placeholder="Separá los valores con comas" className="mt-2 block w-full rounded-lg border border-[#334154] bg-[#111b29] p-3"/></label>)}<button disabled={busy} className="rounded-lg bg-[#ff6b19] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{busy ? 'Guardando…' : profile ? 'Guardar cambios' : 'Crear perfil'}</button>{message && <p role="status" className="text-sm text-emerald-300">{message}</p>}</form></div></main>
}
