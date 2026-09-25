import { useCallback } from 'react'
import { ApiModule } from '@/components/api-module'
import { getModule } from '@/src/api'

export default function ExternalSources() {
  const loader = useCallback(async () => {
    const [catalog, history] = await Promise.all([getModule('/fuentes-externas'), getModule('/fuentes-externas/consultas')])
    return { catalog: catalog.sources || [], recentQueries: history.queries || [] }
  }, [])
  return <ApiModule title="Fuentes externas" description="Catálogo autorizado y consultas externas registradas para esta empresa." loader={loader} />
}
