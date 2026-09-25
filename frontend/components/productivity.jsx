import { useCallback } from 'react'
import { ApiModule } from '@/components/api-module'
import { getModule } from '@/src/api'

export default function Productivity() {
  const loader = useCallback(async () => {
    const to = new Date().toISOString().slice(0, 10)
    const from = `${new Date().getUTCFullYear()}-01-01`
    const params = new URLSearchParams({ from, to, interval: 'month' })
    return getModule(`/productividad?${params}`)
  }, [])
  return <ApiModule title="Productividad" description="Indicadores descriptivos calculados desde los registros procesados de la empresa." loader={loader} />
}
