import { useCallback } from 'react'
import { ApiModule } from '@/components/api-module'
import { getModule, getRecentImports } from '@/src/api'

export default function DataQuality() {
  const loader = useCallback(async () => {
    const dataImports = await getRecentImports()
    const latest = dataImports.filter((item) => item.status === 'completed').at(-1)
    if (!latest) return null
    const [quality, errors] = await Promise.all([
      getModule(`/calidad/${latest.id}`),
      getModule(`/calidad/${latest.id}/errores?page=1&limit=100`),
    ])
    return { ...quality, qualityErrors: errors.errors || [] }
  }, [])
  return <ApiModule title="Calidad de datos" description="Resultados de calidad y errores del proceso de datos más reciente." loader={loader} />
}
