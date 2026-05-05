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
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
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
  if (!dStr) return '-'
  const [y, m, d] = dStr.split('-')
  if (!y || !m || !d) return dStr
  return `${d}/${m}/${y}`
}

export function StrategicDashboard() {
  const [data, setData] = useState<any[]>([])
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState('all')

  useEffect(() => {
    supabase
      .from('vw_dashboard_crm_fechamento')
      .select('*')
      .then(({ data: res }) => res && setData(res))
  }, [])

  const filters = useMemo(() => {
    const yrs = new Set<string>()
    data.forEach((d) => {
      if (d.ano_fechamento) yrs.add(String(d.ano_fechamento))
    })
    return {
      years: Array.from(yrs).sort((a, b) => b.localeCompare(a)),
    }
  }, [data])

  const metrics = useMemo(() => {
    let receita = 0
    const projSet = new Set<string>()
    const monthsKeys = [
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
    const evolMap = new Map(monthsKeys.map((m) => [m, 0]))
    const statusMap = new Map<string, Set<string>>()
    const tableData: any[] = []

    data.forEach((d) => {
      if (year !== 'all' && String(d.ano_fechamento) !== year) return
      if (month !== 'all' && String(d.mes_fechamento) !== month) return

      const val = Number(d.valor_total || 0)
      receita += val
      if (d.id) projSet.add(d.id)

      if (d.mes_fechamento) {
        const m = parseInt(d.mes_fechamento, 10) - 1
        if (m >= 0 && m < 12) evolMap.set(monthsKeys[m], evolMap.get(monthsKeys[m])! + val)
      }

      const s = d.status || 'Sem Status'
      if (!statusMap.has(s)) statusMap.set(s, new Set())
      if (d.id) statusMap.get(s)!.add(d.id)

      tableData.push({
        id: d.id,
        codigo: d.codigo,
        nome: d.nome,
        status: d.status || 'Sem Status',
        valor_total: val,
        data_fechamento: d.data_fechamento || '',
      })
    })

    tableData.sort((a, b) => b.data_fechamento.localeCompare(a.data_fechamento))

    return {
      receita,
      projetos: projSet.size,
      ticketMedio: projSet.size > 0 ? receita / projSet.size : 0,
      evolucao: Array.from(evolMap.entries()).map(([monthKey, valor]) => ({
        month: monthKey,
        valor,
      })),
      status: Array.from(statusMap.entries())
        .map(([statusKey, set]) => ({ status: statusKey, quantidade: set.size }))
        .sort((a, b) => b.quantidade - a.quantidade),
      table: tableData,
    }
  }, [data, year, month])

  return (
    <div className="mt-8 mb-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análise Estratégica</h2>
          <p className="text-muted-foreground text-sm">
            Métricas financeiras e performance do período.
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
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Meses</SelectItem>
              <SelectItem value="01">Janeiro</SelectItem>
              <SelectItem value="02">Fevereiro</SelectItem>
              <SelectItem value="03">Março</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Maio</SelectItem>
              <SelectItem value="06">Junho</SelectItem>
              <SelectItem value="07">Julho</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
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
            <CardTitle className="text-sm font-medium">Projetos Fechados</CardTitle>
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-subtle">
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
      <Card className="shadow-subtle mt-4">
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
                  <TableHead>Status</TableHead>
                  <TableHead>Data Fechamento</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.table.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.codigo}</TableCell>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{formatDate(row.data_fechamento)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.valor_total)}
                    </TableCell>
                  </TableRow>
                ))}
                {metrics.table.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhum projeto encontrado para o filtro selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
