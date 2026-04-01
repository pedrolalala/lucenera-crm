import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { Projeto } from '@/services/projetos'

export function DashboardCharts({ projetos }: { projetos: Projeto[] }) {
  const statusData = useMemo(() => {
    const statusCount = projetos.reduce(
      (acc, p) => {
        const status = p.Status || 'Sem Status'
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(statusCount)
      .map(([status, quantidade]) => ({ status, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
  }, [projetos])

  const nivelData = useMemo(() => {
    const nivelCount = projetos.reduce(
      (acc, p) => {
        const nivel = p.nivel_estrategico || 'Não Definido'
        acc[nivel] = (acc[nivel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(nivelCount)
      .map(([nivel, quantidade]) => ({ nivel, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
  }, [projetos])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Projetos por Status</CardTitle>
          <CardDescription>Distribuição dos projetos baseada no status atual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ quantidade: { label: 'Quantidade', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
          >
            <BarChart data={statusData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="status"
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
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projetos por Nível Estratégico</CardTitle>
          <CardDescription>Classificação de projetos pelo nível de prioridade</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ quantidade: { label: 'Quantidade', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
          >
            <BarChart data={nivelData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="nivel"
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
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
