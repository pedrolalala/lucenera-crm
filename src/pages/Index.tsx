import { ArrowRight, BarChart3, Users, Building2, HardHat, ListTodo, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StrategicDashboard } from '@/components/dashboard/StrategicDashboard'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Index() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedThisMonth: 0,
    totalValue: 0,
    clientsCount: 0,
    architectsCount: 0,
    engineersCount: 0,
  })

  const [recentProjects, setRecentProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_dashboard_stats' as any,
      )

      let totalValueView = 0
      const { data: vwData } = await supabase
        .from('vw_dashboard_crm_fechamento')
        .select('valor_total')
        .gt('valor_total', 0)

      if (vwData) {
        totalValueView = vwData.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)
      }

      if (!statsError && statsData) {
        setStats({ ...(statsData as any), totalValue: totalValueView })
      } else if (statsError) {
        console.error('Erro ao buscar stats do dashboard:', statsError)
      }

      const { data: projetosData, error: projError } = await supabase
        .from('projetos')
        .select('id, nome, codigo, cidade, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!projError && projetosData) {
        setRecentProjects(projetosData)
      }
    }

    fetchData()

    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projetos' }, fetchData)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projeto_parcelas' },
        fetchData,
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contatos' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do sistema e atalhos rápidos.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/novo')} className="shadow-elevation">
            <Plus className="mr-2 h-4 w-4" /> Novo Projeto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="shadow-subtle hover:shadow-elevation transition-all duration-300 border-l-4 border-l-primary group cursor-pointer"
          onClick={() => navigate('/projetos')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
          </CardContent>
        </Card>

        <Card
          className="shadow-subtle hover:shadow-elevation transition-all duration-300 border-l-4 border-l-emerald-500 group cursor-pointer"
          onClick={() => navigate('/projetos')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Fechado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico geral</p>
          </CardContent>
        </Card>

        <Card
          className="shadow-subtle hover:shadow-elevation transition-all duration-300 border-l-4 border-l-blue-500 group cursor-pointer"
          onClick={() => navigate('/contatos/clientes')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card
          className="shadow-subtle hover:shadow-elevation transition-all duration-300 border-l-4 border-l-purple-500 group cursor-pointer"
          onClick={() => navigate('/contatos/arquitetos')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.architectsCount + stats.engineersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Arquitetos e Engenheiros</p>
          </CardContent>
        </Card>
      </div>

      <StrategicDashboard />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-subtle">
          {' '}
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>Últimos projetos cadastrados ou atualizados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{project.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.codigo} {project.cidade ? `• ${project.cidade}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">{project.status}</div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/projeto/${project.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {recentProjects.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum projeto encontrado.
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/projetos">Ver todos os projetos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-subtle">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Atalhos para as principais áreas</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="h-14 justify-start" asChild>
              <Link to="/contatos/clientes">
                <Users className="mr-4 h-5 w-5 text-blue-500" />
                <div className="flex flex-col items-start">
                  <span>Gestão de Clientes</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Cadastros e histórico
                  </span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start" asChild>
              <Link to="/contatos/arquitetos">
                <Building2 className="mr-4 h-5 w-5 text-purple-500" />
                <div className="flex flex-col items-start">
                  <span>Arquitetos</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Parceiros e escritórios
                  </span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start" asChild>
              <Link to="/contatos/engenheiros">
                <HardHat className="mr-4 h-5 w-5 text-amber-500" />
                <div className="flex flex-col items-start">
                  <span>Engenheiros</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Executores de obra
                  </span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start" asChild>
              <Link to="/novo">
                <Plus className="mr-4 h-5 w-5 text-primary" />
                <div className="flex flex-col items-start">
                  <span>Novo Projeto</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Iniciar novo registro
                  </span>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
