import { useCallback } from 'react'
import { ApiModule } from '@/components/api-module'
import { getModule, getRecentImports } from '@/src/api'

export default function Traceability() {
  const loader = useCallback(async () => {
    const dataImports = await getRecentImports()
    const latest = dataImports.at(-1)
    if (!latest) return null
    return getModule(`/trazabilidad/importaciones/${latest.id}?page=1&limit=100`)
  }, [])
  return <ApiModule title="Trazabilidad" description="Historial de procesos ETL de la importación más reciente de esta empresa." loader={loader} />
}
