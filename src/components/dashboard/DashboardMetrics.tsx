import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  PieChart,
  PenTool,
  Edit3,
  DollarSign,
  XCircle,
  FileSignature,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Projeto } from '@/services/projetos'

export function DashboardMetrics({ projetos }: { projetos: Projeto[] }) {
  const [totalClientes, setTotalClientes] = useState(0)

  useEffect(() => {
    const fetchClientes = async () => {
      const { count } = await supabase
        .from('clientes_crm')
        .select('*', { count: 'exact', head: true })
      setTotalClientes(count || 0)
    }
    fetchClientes()
  }, [])

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    projetos.forEach((p) => {
      const status = p.Status?.trim() || 'Sem Status'
      counts[status] = (counts[status] || 0) + 1
    })
    return counts
  }, [projetos])

  const getCount = (statusMatch: string) => {
    return Object.entries(countByStatus)
      .filter(([status]) => status.toLowerCase() === statusMatch.toLowerCase())
      .reduce((acc, [, count]) => acc + count, 0)
  }

  const metrics = [
    {
      label: 'Elaboração Orçamento',
      count: getCount('Elaboração Orçamento'),
      icon: DollarSign,
      color: 'text-amber-500',
    },
    { label: 'Não Fechou', count: getCount('Não Fechou'), icon: XCircle, color: 'text-red-500' },
    {
      label: 'Proposta Sinal',
      count: getCount('Proposta Sinal'),
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Obra Finalizada',
      count: getCount('Obra Finalizada'),
      icon: CheckCircle,
      color: 'text-emerald-500',
    },
    {
      label: 'Emissão Projeto Exec.',
      count: getCount('Emissão Projeto Executivo'),
      icon: PenTool,
      color: 'text-indigo-500',
    },
    {
      label: 'Estudo Inicial',
      count: getCount('Estudo Inicial'),
      icon: PieChart,
      color: 'text-purple-500',
    },
    {
      label: 'Venda DocuSign',
      count: getCount('Venda DocuSign'),
      icon: FileSignature,
      color: 'text-pink-500',
    },
    {
      label: 'Ajustes Finais',
      count: getCount('Ajustes Finais'),
      icon: Edit3,
      color: 'text-orange-500',
    },
    {
      label: 'Contrato de Projeto',
      count: getCount('Contrato de Projeto'),
      icon: FileText,
      color: 'text-cyan-500',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalClientes}</div>
            <p className="text-xs text-primary/70 mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Total de Projetos (Filtrados)
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{projetos.length}</div>
            <p className="text-xs text-primary/70 mt-1">Exibidos atualmente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium truncate pr-2" title={m.label}>
                  {m.label}
                </CardTitle>
                <Icon className={`h-4 w-4 shrink-0 ${m.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
