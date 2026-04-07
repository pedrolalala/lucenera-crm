import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProjetos, type Projeto } from '@/services/projetos'
import { Loader2, DollarSign, Briefcase, CheckCircle, Clock } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function Index() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('todos')
  const [responsavel, setResponsavel] = useState('todos')

  useEffect(() => {
    const loadProjetos = async () => {
      setLoading(true)
      try {
        const data = await getProjetos()
        setProjetos(data)
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjetos()
  }, [])

  const responsaveis = useMemo(() => {
    const reps = projetos.map((p) => p.Responsavel).filter(Boolean) as string[]
    return Array.from(new Set(reps)).sort()
  }, [projetos])

  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return null
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  }

  const filteredProjetos = useMemo(() => {
    const now = new Date()
    let limitDate: Date | null = null

    if (periodo !== 'todos') {
      limitDate = new Date()
      limitDate.setMonth(now.getMonth() - parseInt(periodo))
    }

    return projetos.filter((p) => {
      if (responsavel !== 'todos' && p.Responsavel !== responsavel) return false

      if (limitDate) {
        const pDate = parseDate(p.Data_Entrada)
        if (!pDate) return false
        if (pDate < limitDate) return false
      }

      return true
    })
  }, [projetos, periodo, responsavel])

  const parseValor = (val: any) => {
    if (!val) return 0
    if (typeof val === 'number') return val
    const str = String(val).trim()
    if (str.includes(',')) {
      const clean = str
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '')
      return parseFloat(clean) || 0
    }
    const clean = str.replace(/[^\d.-]/g, '')
    return parseFloat(clean) || 0
  }

  const getValorTotal = (projeto: any) => {
    let total = 0
    for (let i = 1; i <= 10; i++) {
      total += parseValor(projeto[`valor_fechado_${i}`])
    }
    return total
  }

  const totalProjetos = filteredProjetos.length
  const totalRevenue = filteredProjetos.reduce((acc, p) => acc + getValorTotal(p), 0)

  const activeProjetos = filteredProjetos.filter(
    (p) => p.Status && !['Concluído', 'Completo', 'Finalizado'].includes(p.Status),
  ).length
  const completedProjetos = filteredProjetos.filter(
    (p) => p.Status && ['Concluído', 'Completo', 'Finalizado'].includes(p.Status),
  ).length

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredProjetos.forEach((p) => {
      const status = p.Status || 'Sem Status'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filteredProjetos])

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Visão geral e indicadores dos projetos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Período:</span>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[160px] h-9 border-slate-200 bg-white focus:ring-primary/20">
                <SelectValue placeholder="Todos os tempos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tempos</SelectItem>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Responsável:</span>
            <Select value={responsavel} onValueChange={setResponsavel}>
              <SelectTrigger className="w-[160px] h-9 border-slate-200 bg-white focus:ring-primary/20">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {responsaveis.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total de Projetos
                </CardTitle>
                <Briefcase className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalProjetos}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    totalRevenue,
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{activeProjetos}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{completedProjetos}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Projetos por Status</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {statusData.length > 0 ? (
                  <ChartContainer
                    config={{ value: { label: 'Projetos', color: 'hsl(var(--primary))' } }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                      >
                        <XAxis
                          dataKey="name"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    Sem dados para exibir
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-3 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Projetos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProjetos.slice(0, 6).map((projeto) => (
                    <div
                      key={projeto.Codigo || Math.random()}
                      className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1 overflow-hidden pr-4">
                        <p
                          className="text-sm font-medium text-slate-900 truncate"
                          title={projeto.Projeto || ''}
                        >
                          {projeto.Projeto || 'Sem nome'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold">{projeto.Codigo}</span>
                          <span>•</span>
                          <span className="truncate">{projeto.Responsavel || 'Sem resp.'}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(getValorTotal(projeto))}
                      </div>
                    </div>
                  ))}
                  {filteredProjetos.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      Nenhum projeto encontrado com os filtros atuais.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
