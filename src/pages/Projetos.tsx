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
import { MapPin, Loader2, Plus, Flag, Activity, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'resumida' | 'operacional' | 'completa'

export default function Projetos() {
  const navigate = useNavigate()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('resumida')

  const [searchStatus, setSearchStatus] = useState('')
  const [searchResponsavel, setSearchResponsavel] = useState('')

  useEffect(() => {
    getProjetos()
      .then(setProjetos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredProjetos = projetos.filter((p) => {
    const matchStatus =
      !searchStatus || (p.Status?.toLowerCase() || '').includes(searchStatus.toLowerCase())
    const matchResponsavel =
      !searchResponsavel ||
      (p.responsavel?.toLowerCase() || '').includes(searchResponsavel.toLowerCase())
    return matchStatus && matchResponsavel
  })

  const getColSpan = () => {
    if (viewMode === 'resumida') return 4
    if (viewMode === 'operacional') return 6
    return 9
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    if (dateStr.includes('/')) return dateStr
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o andamento dos projetos luminotécnicos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-muted p-1 rounded-md flex items-center">
            <Button
              variant={viewMode === 'resumida' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('resumida')}
            >
              Resumida
            </Button>
            <Button
              variant={viewMode === 'operacional' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('operacional')}
            >
              Operacional
            </Button>
            <Button
              variant={viewMode === 'completa' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('completa')}
            >
              Completa
            </Button>
          </div>
          <Button onClick={() => navigate('/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filtros de Projetos</CardTitle>
          <CardDescription>Refine a lista de projetos utilizando os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Activity className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por Status..."
              className="pl-8"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
            />
          </div>
          <div className="relative">
            <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por Responsável..."
              className="pl-8"
              value={searchResponsavel}
              onChange={(e) => setSearchResponsavel(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="rounded-md border-0 min-w-[700px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  {(viewMode === 'completa' || viewMode === 'operacional') && (
                    <TableHead>Nível</TableHead>
                  )}
                  <TableHead>Projeto</TableHead>
                  {(viewMode === 'completa' || viewMode === 'operacional') && (
                    <TableHead>Responsável</TableHead>
                  )}
                  {(viewMode === 'completa' || viewMode === 'operacional') && (
                    <TableHead>Data Entrada</TableHead>
                  )}
                  <TableHead>Status</TableHead>
                  {viewMode === 'completa' && <TableHead>Arquiteto</TableHead>}
                  {viewMode === 'completa' && <TableHead>Engenheiro</TableHead>}
                  {(viewMode === 'completa' || viewMode === 'resumida') && (
                    <TableHead>Localização</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={getColSpan()} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredProjetos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={getColSpan()}
                      className="h-24 text-center text-muted-foreground"
                    >
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

                      {(viewMode === 'completa' || viewMode === 'operacional') && (
                        <TableCell>
                          {projeto.nivel_estrategico ? (
                            <Badge variant="outline">{projeto.nivel_estrategico}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      )}

                      <TableCell
                        className="font-semibold max-w-[200px] truncate"
                        title={projeto.Projeto || ''}
                      >
                        {projeto.Projeto || 'Sem nome'}
                      </TableCell>

                      {(viewMode === 'completa' || viewMode === 'operacional') && (
                        <TableCell
                          className="max-w-[120px] truncate"
                          title={projeto.responsavel || ''}
                        >
                          {projeto.responsavel || '-'}
                        </TableCell>
                      )}

                      {(viewMode === 'completa' || viewMode === 'operacional') && (
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(projeto.data_entrada)}
                        </TableCell>
                      )}

                      <TableCell>
                        {projeto.Status ? (
                          <Badge variant={projeto.Status === 'Concluído' ? 'default' : 'secondary'}>
                            {projeto.Status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>

                      {viewMode === 'completa' && (
                        <TableCell
                          className="max-w-[150px] truncate text-muted-foreground"
                          title={projeto.arquiteto || ''}
                        >
                          {projeto.arquiteto || '-'}
                        </TableCell>
                      )}

                      {viewMode === 'completa' && (
                        <TableCell
                          className="max-w-[150px] truncate text-muted-foreground"
                          title={projeto.engenheiro || ''}
                        >
                          {projeto.engenheiro || '-'}
                        </TableCell>
                      )}

                      {(viewMode === 'completa' || viewMode === 'resumida') && (
                        <TableCell>
                          <div
                            className="flex flex-col max-w-[150px] truncate"
                            title={`${projeto.Cidade || ''} - ${projeto.Estado || ''}`}
                          >
                            <span>{projeto.Cidade || '-'}</span>
                            <span className="text-xs text-muted-foreground">
                              {projeto.Estado || '-'}
                            </span>
                          </div>
                        </TableCell>
                      )}
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
