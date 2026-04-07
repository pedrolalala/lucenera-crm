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
      key: 'Responsavel',
    },
    {
      label: 'Arquiteto Responsável',
      state: filterArquiteto,
      set: setFilterArquiteto,
      key: 'Arquiteto_Responsavel',
    },
    {
      label: 'Engenheiro',
      state: filterEngenheiro,
      set: setFilterEngenheiro,
      key: 'Responsavel_da_Obra',
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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projetos</h1>
          <p className="text-slate-500">
            Gerencie e acompanhe o andamento dos projetos luminotécnicos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-100 p-1.5 rounded-lg flex items-center border border-slate-200">
            <Button
              variant={viewMode === 'resumida' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'resumida' ? 'bg-white shadow-sm font-medium' : 'text-slate-600'
              }
              onClick={() => setViewMode('resumida')}
            >
              Resumida
            </Button>
            <Button
              variant={viewMode === 'operacional' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'operacional' ? 'bg-white shadow-sm font-medium' : 'text-slate-600'
              }
              onClick={() => setViewMode('operacional')}
            >
              Operacional
            </Button>
            <Button
              variant={viewMode === 'completa' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'completa' ? 'bg-white shadow-sm font-medium' : 'text-slate-600'
              }
              onClick={() => setViewMode('completa')}
            >
              Completa
            </Button>
          </div>
          <Button onClick={() => navigate('/novo')} className="shadow-sm font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-wrap items-end gap-5">
            {filterConfigs.map((config) => (
              <div key={config.label} className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {config.label}
                </label>
                <Select value={config.state} onValueChange={config.set}>
                  <SelectTrigger className="bg-white border-slate-200 shadow-sm focus:ring-primary/20 transition-all">
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
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-medium transition-all"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="rounded-md border-0 min-w-[700px]">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] py-4 text-slate-600 font-semibold">
                    Código
                  </TableHead>
                  {(viewMode === 'completa' || viewMode === 'operacional') && (
                    <TableHead className="py-4 text-slate-600 font-semibold">Nível</TableHead>
                  )}
                  <TableHead className="py-4 text-slate-600 font-semibold">Projeto</TableHead>
                  {(viewMode === 'completa' || viewMode === 'operacional') && (
                    <TableHead className="py-4 text-slate-600 font-semibold">Responsável</TableHead>
                  )}
                  {(viewMode === 'completa' || viewMode === 'operacional') && (
                    <TableHead className="py-4 text-slate-600 font-semibold">
                      Data Entrada
                    </TableHead>
                  )}
                  <TableHead className="py-4 text-slate-600 font-semibold">Status</TableHead>
                  {viewMode === 'completa' && (
                    <TableHead className="py-4 text-slate-600 font-semibold">Arquiteto</TableHead>
                  )}
                  {viewMode === 'completa' && (
                    <TableHead className="py-4 text-slate-600 font-semibold">Engenheiro</TableHead>
                  )}
                  {viewMode === 'completa' && (
                    <TableHead className="py-4 text-slate-600 font-semibold">Valor</TableHead>
                  )}
                  {(viewMode === 'completa' || viewMode === 'resumida') && (
                    <TableHead className="py-4 text-slate-600 font-semibold">Localização</TableHead>
                  )}
                  <TableHead className="w-[50px] py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={getColSpan()} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : filteredProjetos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={getColSpan()}
                      className="h-32 text-center text-slate-500 font-medium"
                    >
                      Nenhum projeto encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjetos.map((projeto) => (
                    <TableRow
                      key={projeto.Codigo || Math.random().toString()}
                      className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      onClick={() => navigate(`/projeto/${projeto.Codigo}`)}
                    >
                      <TableCell className="py-4 font-medium text-slate-900">
                        {formatCodigo(projeto.Codigo)}
                      </TableCell>

                      {(viewMode === 'completa' || viewMode === 'operacional') && (
                        <TableCell className="py-4">
                          {projeto.Nivel_Estrategico ? (
                            <Badge variant="outline" className="bg-slate-50">
                              {projeto.Nivel_Estrategico}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </TableCell>
                      )}

                      <TableCell
                        className="py-4 font-semibold text-slate-900 max-w-[200px] truncate"
                        title={projeto.Projeto || ''}
                      >
                        {projeto.Projeto || 'Sem nome'}
                      </TableCell>

                      {(viewMode === 'completa' || viewMode === 'operacional') && (
                        <TableCell
                          className="py-4 max-w-[120px] truncate text-slate-600"
                          title={projeto.Responsavel || ''}
                        >
                          {projeto.Responsavel || '-'}
                        </TableCell>
                      )}

                      {(viewMode === 'completa' || viewMode === 'operacional') && (
                        <TableCell className="py-4 whitespace-nowrap text-slate-500">
                          {formatDate(projeto.Data_Entrada)}
                        </TableCell>
                      )}

                      <TableCell className="py-4">
                        {projeto.Status ? (
                          <Badge
                            variant={projeto.Status === 'Concluído' ? 'default' : 'secondary'}
                            className="font-medium shadow-sm"
                          >
                            {projeto.Status}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>

                      {viewMode === 'completa' && (
                        <TableCell
                          className="py-4 max-w-[150px] truncate text-slate-600"
                          title={projeto.Arquiteto_Responsavel || ''}
                        >
                          {projeto.Arquiteto_Responsavel || '-'}
                        </TableCell>
                      )}

                      {viewMode === 'completa' && (
                        <TableCell
                          className="py-4 max-w-[150px] truncate text-slate-600"
                          title={projeto.Responsavel_da_Obra || ''}
                        >
                          {projeto.Responsavel_da_Obra || '-'}
                        </TableCell>
                      )}

                      {viewMode === 'completa' && (
                        <TableCell
                          className="py-4 max-w-[120px] truncate text-slate-700 font-medium"
                          title={(projeto as any).valor_fechado || ''}
                        >
                          {(projeto as any).valor_fechado || '-'}
                        </TableCell>
                      )}

                      {(viewMode === 'completa' || viewMode === 'resumida') && (
                        <TableCell className="py-4">
                          <div
                            className="flex flex-col max-w-[150px] truncate"
                            title={`${projeto.Cidade || ''} - ${projeto.Estado || ''}`}
                          >
                            <span className="text-slate-700 font-medium">
                              {projeto.Cidade || '-'}
                            </span>
                            <span className="text-xs text-slate-500">{projeto.Estado || '-'}</span>
                          </div>
                        </TableCell>
                      )}

                      <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
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
