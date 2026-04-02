import { useEffect, useState, useMemo } from 'react'
import { getProjetos, type Projeto } from '@/services/projetos'
import { Loader2, Calendar, Users } from 'lucide-react'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

function parseDateString(dateStr: string | null): Date | null {
  if (!dateStr) return null
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/')
    if (day && month && year) {
      return new Date(Number(year), Number(month) - 1, Number(day))
    }
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export default function Index() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<string>('todos')
  const [responsavel, setResponsavel] = useState<string>('todos')

  useEffect(() => {
    getProjetos()
      .then(setProjetos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const responsaveis = useMemo(() => {
    const set = new Set(projetos.map((p) => p.responsavel).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [projetos])

  const filteredProjetos = useMemo(() => {
    return projetos.filter((p) => {
      // Filtro por responsável
      if (responsavel !== 'todos' && p.responsavel !== responsavel) {
        return false
      }

      // Filtro por período
      if (periodo !== 'todos') {
        const pDate = parseDateString(p.data_entrada)
        if (!pDate) return false

        const now = new Date()
        const diffTime = Math.abs(now.getTime() - pDate.getTime())
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44)

        if (periodo === '3m' && diffMonths > 3) return false
        if (periodo === '6m' && diffMonths > 6) return false
        if (periodo === '12m' && diffMonths > 12) return false
      }

      return true
    })
  }, [projetos, periodo, responsavel])

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

      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Período
            </label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo o período</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Responsável
            </label>
            <Select value={responsavel} onValueChange={setResponsavel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os responsáveis</SelectItem>
                {responsaveis.map((resp) => (
                  <SelectItem key={resp} value={resp}>
                    {resp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DashboardMetrics projetos={filteredProjetos} />

      <DashboardCharts projetos={filteredProjetos} />
    </div>
  )
}
