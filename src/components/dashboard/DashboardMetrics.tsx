import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, CheckCircle, Clock } from 'lucide-react'
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

  const projetosEmAndamento = projetos.filter(
    (p) =>
      p.Status === 'Em andamento' ||
      p.Status === 'Em Andamento' ||
      p.Status?.toLowerCase().includes('andamento'),
  ).length

  const projetosConcluidos = projetos.filter(
    (p) =>
      p.Status === 'Concluído' ||
      p.Status === 'Concluido' ||
      p.Status?.toLowerCase() === 'concluído',
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClientes}</div>
          <p className="text-xs text-muted-foreground mt-1">Cadastrados no sistema</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projetos.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Todos os registros</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projetosEmAndamento}</div>
          <p className="text-xs text-muted-foreground mt-1">Projetos ativos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projetosConcluidos}</div>
          <p className="text-xs text-muted-foreground mt-1">Projetos finalizados</p>
        </CardContent>
      </Card>
    </div>
  )
}
