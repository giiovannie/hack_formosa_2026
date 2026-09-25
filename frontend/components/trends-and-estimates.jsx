import { useCallback } from 'react'
import { ApiModule } from '@/components/api-module'
import { getModule } from '@/src/api'

export default function TrendsAndEstimates() {
  const loader = useCallback(() => {
    const to = new Date().toISOString().slice(0, 10)
    const from = `${new Date().getUTCFullYear() - 1}-01-01`
    const params = new URLSearchParams({ from, to, interval: 'month', metric: 'count' })
    return getModule(`/tendencias?${params}`)
  }, [])
  return <ApiModule title="Tendencias y estimaciones" description="Análisis basado en la serie histórica real de registros procesados." loader={loader} />
}
