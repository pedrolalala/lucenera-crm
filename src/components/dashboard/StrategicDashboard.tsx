import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const formatDate = (dStr: string) => {
  if (!dStr) return ''
  const [y, m, d] = dStr.split('-')
  return `${d}/${m}/${y}`
}

export function StrategicDashboard() {
  const [data, setData] = useState<any[]>([])
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [resp, setResp] = useState('all')

  useEffect(() => {
    supabase
      .from('projeto_parcelas')
      .select(
        `id, valor, data_pagamento, projeto_id, projetos(id, codigo, nome, responsavel_nome, status)`,
      )
      .not('data_pagamento', 'is', null)
      .then(({ data: res }) => res && setData(res))
  }, [])

  const filters = useMemo(() => {
    const yrs = new Set<string>(),
      rs = new Set<string>()
    data.forEach((d) => {
      if (d.data_pagamento) yrs.add(d.data_pagamento.substring(0, 4))
      if (d.projetos?.responsavel_nome) rs.add(d.projetos.responsavel_nome)
    })
    return {
      years: Array.from(yrs).sort((a, b) => b.localeCompare(a)),
      resps: Array.from(rs).sort(),
    }
  }, [data])

  const metrics = useMemo(() => {
    let receita = 0
    const projSet = new Set<string>()
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]
    const evolMap = new Map(months.map((m) => [m, 0]))
    const perfMap = new Map<string, number>()
    const statusMap = new Map<string, Set<string>>()
    const tableMap = new Map<string, any>()

    data.forEach((d) => {
      if (
        (year !== 'all' && !d.data_pagamento?.startsWith(year)) ||
        (resp !== 'all' && d.projetos?.responsavel_nome !== resp)
      )
        return
      const val = Number(d.valor || 0)
      receita += val
      projSet.add(d.projeto_id)
      if (d.data_pagamento) {
        const m = parseInt(d.data_pagamento.substring(5, 7), 10) - 1
        if (m >= 0 && m < 12) evolMap.set(months[m], evolMap.get(months[m])! + val)
      }
      const rName = d.projetos?.responsavel_nome || 'Sem Responsável'
      perfMap.set(rName, (perfMap.get(rName) || 0) + val)
      const s = d.projetos?.status || 'Sem Status'
      if (!statusMap.has(s)) statusMap.set(s, new Set())
      statusMap.get(s)!.add(d.projeto_id)

      const pid = d.projeto_id
      if (!tableMap.has(pid))
        tableMap.set(pid, {
          id: pid,
          codigo: d.projetos?.codigo,
          nome: d.projetos?.nome,
          responsavel: rName,
          valor_total: 0,
          ultima_data: d.data_pagamento || '',
        })
      const item = tableMap.get(pid)!
      item.valor_total += val
      if (d.data_pagamento > item.ultima_data) item.ultima_data = d.data_pagamento
    })

    return {
      receita,
      projetos: projSet.size,
      ticketMedio: projSet.size > 0 ? receita / projSet.size : 0,
      evolucao: Array.from(evolMap.entries()).map(([month, valor]) => ({ month, valor })),
      performance: Array.from(perfMap.entries())
        .map(([name, valor]) => ({ name, valor }))
        .sort((a, b) => b.valor - a.valor),
      status: Array.from(statusMap.entries())
        .map(([status, set]) => ({ status, quantidade: set.size }))
        .sort((a, b) => b.quantidade - a.quantidade),
      table: Array.from(tableMap.values()).sort((a, b) =>
        b.ultima_data.localeCompare(a.ultima_data),
      ),
    }
  }, [data, year, resp])

  return (
    <div className="mt-8 mb-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análise Estratégica</h2>
          <p className="text-muted-foreground text-sm">
            Métricas financeiras e performance da equipe.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Anos</SelectItem>
              {filters.years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resp} onValueChange={setResp}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Responsáveis</SelectItem>
              {filters.resps.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(metrics.receita)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projetos com Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.projetos}</div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics.ticketMedio)}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 shadow-subtle">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ valor: { label: 'Receita', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <AreaChart
                data={metrics.evolucao}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--color-valor)"
                  fill="var(--color-valor)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ quantidade: { label: 'Projetos' } }}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={metrics.status}
                  dataKey="quantidade"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {metrics.status.map((_, i) => (
                    <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Performance por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ valor: { label: 'Receita', color: 'hsl(var(--chart-2))' } }}
              className="h-[300px] w-full"
            >
              <BarChart
                data={metrics.performance}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="valor" fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Detalhamento Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Resp.</TableHead>
                    <TableHead>Últ. Pgto</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.table.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.codigo}</TableCell>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell>{row.responsavel}</TableCell>
                      <TableCell>{formatDate(row.ultima_data)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(row.valor_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {metrics.table.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Nenhum dado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
