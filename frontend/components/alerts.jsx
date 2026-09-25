import { ApiModule } from '@/components/api-module'

export default function Alerts() {
  return <ApiModule title="Alertas" description="Alertas generadas desde las condiciones evaluadas sobre tus registros procesados." path="/alertas?status=active" />
}
