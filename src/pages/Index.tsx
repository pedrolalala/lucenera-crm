import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjetos, type Projeto } from '@/services/projetos'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Search, MapPin, Loader2, Plus, Flag, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

export default function Index() {
  const navigate = useNavigate()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)

  const [searchCidade, setSearchCidade] = useState('')
  const [searchEstado, setSearchEstado] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchNivel, setSearchNivel] = useState('')

  useEffect(() => {
    getProjetos()
      .then(setProjetos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredProjetos = projetos.filter((p) => {
    const matchCidade = p.Cidade?.toLowerCase().includes(searchCidade.toLowerCase()) ?? true
    const matchEstado = p.Estado?.toLowerCase().includes(searchEstado.toLowerCase()) ?? true
    const matchStatus = p.Status?.toLowerCase().includes(searchStatus.toLowerCase()) ?? true
    const matchNivel =
      p.nivel_estrategico?.toLowerCase().includes(searchNivel.toLowerCase()) ?? true
    return matchCidade && matchEstado && matchStatus && matchNivel
  })

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projetos</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o andamento dos projetos luminotécnicos.
          </p>
        </div>
        <Button onClick={() => navigate('/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Projetos</CardTitle>
          <CardDescription>Refine a lista de projetos utilizando os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="relative">
              <Activity className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por Status..."
                className="pl-8"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Flag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por Nível..."
                className="pl-8"
                value={searchNivel}
                onChange={(e) => setSearchNivel(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por Cidade..."
                className="pl-8"
                value={searchCidade}
                onChange={(e) => setSearchCidade(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por Estado..."
                className="pl-8"
                value={searchEstado}
                onChange={(e) => setSearchEstado(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Nível Estratégico</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredProjetos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum projeto encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjetos.map((projeto) => (
                    <TableRow
                      key={projeto.Codigo}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/projeto/${projeto.Codigo}`)}
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        #{projeto.Codigo}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {projeto.Projeto || 'Sem nome'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{projeto.Cidade || '-'}</span>
                          <span className="text-xs text-muted-foreground">
                            {projeto.Estado || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {projeto.nivel_estrategico ? (
                          <Badge variant="outline">{projeto.nivel_estrategico}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {projeto.Status ? (
                          <Badge variant={projeto.Status === 'Concluído' ? 'default' : 'secondary'}>
                            {projeto.Status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
