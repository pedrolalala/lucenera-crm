import { useEffect, useState } from 'react'
import { getProjetos, type Projeto } from '@/services/projetos'
import { Loader2 } from 'lucide-react'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

export default function Index() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjetos()
      .then(setProjetos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral e acompanhamento das principais métricas do CRM.
          </p>
        </div>
      </div>

      <DashboardMetrics projetos={projetos} />

      <DashboardCharts projetos={projetos} />
    </div>
  )
}
