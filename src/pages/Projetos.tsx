import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjetos, type Projeto } from '@/services/projetos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Plus, FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectActions } from '@/components/ProjectActions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ViewMode = 'resumida' | 'operacional' | 'completa'

export default function Projetos() {
  const navigate = useNavigate()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('resumida')

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterResponsavel, setFilterResponsavel] = useState('all')
  const [filterArquiteto, setFilterArquiteto] = useState('all')
  const [filterEngenheiro, setFilterEngenheiro] = useState('all')
  const [filterEletricista, setFilterEletricista] = useState('all')
  const [filterCidade, setFilterCidade] = useState('all')

  const loadProjetos = () => {
    setLoading(true)
    getProjetos()
      .then(setProjetos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProjetos()
  }, [])

  const filterConfigs = [
    { label: 'Status', state: filterStatus, set: setFilterStatus, key: 'Status' },
    {
      label: 'Responsável',
      state: filterResponsavel,
      set: setFilterResponsavel,
      key: 'responsavel',
    },
    {
      label: 'Arquiteto Responsável',
      state: filterArquiteto,
      set: setFilterArquiteto,
      key: 'arquiteto',
    },
    { label: 'Engenheiro', state: filterEngenheiro, set: setFilterEngenheiro, key: 'engenheiro' },
    {
      label: 'Eletricista',
      state: filterEletricista,
      set: setFilterEletricista,
      key: 'eletricista',
    },
    { label: 'Cidade', state: filterCidade, set: setFilterCidade, key: 'Cidade' },
  ]

  const getUnique = (key: string) => {
    const vals = projetos.map((p) => (p as any)[key]).filter(Boolean) as string[]
    return Array.from(new Set(vals)).sort()
  }

  const filteredProjetos = projetos.filter((p) => {
    return filterConfigs.every((config) => {
      if (config.state === 'all') return true
      return (p as any)[config.key] === config.state
    })
  })

  const clearFilters = () => {
    filterConfigs.forEach((c) => c.set('all'))
  }

  const getColSpan = () => {
    if (viewMode === 'resumida') return 5
    if (viewMode === 'operacional') return 7
    return 11
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

  const formatCodigo = (codigo: any) => {
    if (!codigo) return '-'
    const codStr = codigo.toString()
    if (codStr.length > 2 && !codStr.includes('.')) {
      return `${codStr.substring(0, 2)}.${codStr.substring(2)}`
    }
    return codStr
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

      <Card className="border-0 shadow-sm bg-card/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            {filterConfigs.map((config) => (
              <div key={config.label} className="space-y-1.5 flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">{config.label}</label>
                <Select value={config.state} onValueChange={config.set}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {getUnique(config.key).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex-none w-full sm:w-auto mt-2 sm:mt-0">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <FilterX className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
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
                  {viewMode === 'completa' && <TableHead>Eletricista</TableHead>}
                  {(viewMode === 'completa' || viewMode === 'resumida') && (
                    <TableHead>Localização</TableHead>
                  )}
                  <TableHead className="w-[50px]"></TableHead>
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
                      key={projeto.Codigo || Math.random().toString()}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/projeto/${projeto.Codigo}`)}
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {formatCodigo(projeto.Codigo)}
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

                      {viewMode === 'completa' && (
                        <TableCell
                          className="max-w-[150px] truncate text-muted-foreground"
                          title={(projeto as any).eletricista || ''}
                        >
                          {(projeto as any).eletricista || '-'}
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

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ProjectActions projeto={projeto} onChange={loadProjetos} />
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
