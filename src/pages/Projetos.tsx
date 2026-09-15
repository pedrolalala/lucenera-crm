import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteProjeto, type Projeto } from '@/services/projetos'
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
import {
  Loader2,
  Plus,
  FilterX,
  X,
  Edit2,
  Trash2,
  Check,
  ChevronsUpDown,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react'
import { useViewMode as useDisplayMode } from '@/hooks/use-view-mode'
import { ProjectMobileCards } from '@/components/ProjectMobileCards'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import useProjectStore from '@/stores/useProjectStore'

type ViewMode = 'resumida' | 'operacional' | 'completa'

const MESES = [
  { label: 'Janeiro', value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Março', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Maio', value: '05' },
  { label: 'Junho', value: '06' },
  { label: 'Julho', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Setembro', value: '09' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
]

function FilterCombobox({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  options: { label: string; value: string }[]
}) {
  const [open, setOpen] = useState(false)

  const selectedLabel =
    value === 'all' ? 'Todos' : options.find((opt) => opt.value === value)?.label || value

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-slate-200 shadow-sm focus:ring-primary/20 transition-all font-normal h-10 px-3 py-2"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Buscar...`} />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Todos"
                onSelect={() => {
                  onChange('all')
                  setOpen(false)
                }}
              >
                <Check
                  className={cn('mr-2 h-4 w-4', value === 'all' ? 'opacity-100' : 'opacity-0')}
                />
                Todos
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={String(option.label)}
                  onSelect={() => {
                    onChange(option.value === value ? 'all' : String(option.value))
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === String(option.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function Projetos() {
  const navigate = useNavigate()
  const { toast } = useToast()
  // SPEC-043: consome a lista compartilhada de `useProjectStore` em vez de
  // buscar `getProjetos()` de novo aqui.
  const { projects: projetos, loading, refreshProjects } = useProjectStore()

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('projetos-view-mode') as ViewMode) || 'resumida'
  })
  const [displayMode, setDisplayMode] = useDisplayMode('projetos', 'cards')

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterResponsavel, setFilterResponsavel] = useState('all')
  const [filterArquiteto, setFilterArquiteto] = useState('all')
  const [filterEngenheiro, setFilterEngenheiro] = useState('all')
  const [filterCidade, setFilterCidade] = useState('all')
  const [filterValorTotal, setFilterValorTotal] = useState('all')
  const [filterAnoFechamento, setFilterAnoFechamento] = useState('all')
  const [filterMesFechamento, setFilterMesFechamento] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    localStorage.setItem('projetos-view-mode', viewMode)
  }, [viewMode])

  const filterConfigs = [
    { label: 'Status', state: filterStatus, set: setFilterStatus, key: 'status' },
    {
      label: 'Responsável',
      state: filterResponsavel,
      set: setFilterResponsavel,
      key: 'responsavel',
      extract: (p: Projeto) => p.responsavel?.nome || p.responsavel_nome,
    },
    {
      label: 'Arquiteto',
      state: filterArquiteto,
      set: setFilterArquiteto,
      key: 'arquiteto',
      extract: (p: Projeto) => p.arquiteto?.nome,
    },
    {
      label: 'Engenheiro',
      state: filterEngenheiro,
      set: setFilterEngenheiro,
      key: 'engenheiro',
      extract: (p: Projeto) => p.engenheiro?.nome,
    },
    { label: 'Cidade', state: filterCidade, set: setFilterCidade, key: 'cidade' },
  ]

  const getUnique = (config: any) => {
    const vals = projetos
      .map((p) => (config.extract ? config.extract(p) : (p as any)[config.key]))
      .filter(Boolean) as string[]
    return Array.from(new Set(vals)).sort()
  }

  const getValorTotal = (projeto: Projeto) => {
    if (projeto.projeto_parcelas && Array.isArray(projeto.projeto_parcelas)) {
      return projeto.projeto_parcelas.reduce(
        (acc: number, p: any) => acc + (Number(p.valor) || 0),
        0,
      )
    }
    return Number(projeto.valor_total) || 0
  }

  const getDataFechamento = (projeto: Projeto) => {
    return projeto.data_fechamento || null
  }

  const anosFechamento = Array.from(
    new Set(projetos.map((p) => p.ano_fechamento).filter(Boolean)),
  ).sort((a, b) => Number(b) - Number(a)) as string[]

  // SPEC-116 (piloto 2): busca universal multi-termo, sem distinção de
  // acento — cada palavra digitada precisa aparecer em algum campo do
  // projeto (código, nome, status, nível estratégico, cidade/UF, cliente,
  // arquiteto, engenheiro, responsável), em qualquer ordem. Antes só
  // casava código/nome com a frase inteira e era sensível a acento.
  const normalizeSearch = (str: string) =>
    str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()

  const filteredProjetos = projetos.filter((p) => {
    const searchTerms = normalizeSearch(searchTerm.trim()).split(/\s+/).filter(Boolean)
    if (searchTerms.length) {
      const haystack = normalizeSearch(
        [
          p.codigo,
          p.nome,
          p.status,
          p.nivel_estrategico,
          p.cidade,
          p.estado,
          p.responsavel?.nome || p.responsavel_nome,
          p.cliente?.nome,
          p.arquiteto?.nome,
          p.engenheiro?.nome,
        ]
          .filter(Boolean)
          .join(' '),
      )
      if (!searchTerms.every((t) => haystack.includes(t))) return false
    }

    if (filterValorTotal === '>0') {
      const total = getValorTotal(p)
      if (total <= 0) return false
    }

    if (filterAnoFechamento !== 'all' && String(p.ano_fechamento) !== filterAnoFechamento)
      return false
    if (filterMesFechamento !== 'all' && String(p.mes_fechamento) !== filterMesFechamento)
      return false

    return filterConfigs.every((config) => {
      if (config.state === 'all') return true
      const val = config.extract ? config.extract(p) : (p as any)[config.key]
      return val === config.state
    })
  })

  const clearFilters = () => {
    filterConfigs.forEach((c) => c.set('all'))
    setFilterValorTotal('all')
    setFilterAnoFechamento('all')
    setFilterMesFechamento('all')
    setSearchTerm('')
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    if (dateStr.includes('/')) return dateStr
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return format(d, 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await deleteProjeto(id)
      toast({ title: 'Sucesso', description: 'Projeto excluído.' })
      refreshProjects()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
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
                viewMode === 'resumida'
                  ? 'bg-primary text-primary-foreground shadow-sm font-medium hover:bg-primary/90'
                  : 'text-slate-600'
              }
              onClick={() => setViewMode('resumida')}
            >
              Resumida
            </Button>
            <Button
              variant={viewMode === 'operacional' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'operacional'
                  ? 'bg-primary text-primary-foreground shadow-sm font-medium hover:bg-primary/90'
                  : 'text-slate-600'
              }
              onClick={() => setViewMode('operacional')}
            >
              Operacional
            </Button>
            <Button
              variant={viewMode === 'completa' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'completa'
                  ? 'bg-primary text-primary-foreground shadow-sm font-medium hover:bg-primary/90'
                  : 'text-slate-600'
              }
              onClick={() => setViewMode('completa')}
            >
              Completa
            </Button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <Button
              variant={displayMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className={displayMode === 'cards' ? 'bg-white shadow-sm' : ''}
              onClick={() => setDisplayMode('cards')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Cards
            </Button>
            <Button
              variant={displayMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className={displayMode === 'table' ? 'bg-white shadow-sm' : ''}
              onClick={() => setDisplayMode('table')}
            >
              <List className="h-4 w-4 mr-2" /> Planilha
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
            <div className="space-y-2 flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-[300px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Buscar Projeto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar por código, nome, cliente, cidade, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-slate-200 shadow-sm focus:ring-primary/20 transition-all font-normal h-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {filterConfigs.map((config) => (
              <div key={config.label} className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {config.label}
                </label>
                <FilterCombobox
                  label={config.label}
                  value={config.state}
                  onChange={config.set}
                  options={getUnique(config).map((s) => ({ label: s, value: s }))}
                />
              </div>
            ))}
            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Ano Fechamento
              </label>
              <FilterCombobox
                label="Ano Fechamento"
                value={filterAnoFechamento}
                onChange={setFilterAnoFechamento}
                options={anosFechamento.map((a) => ({ label: a, value: a }))}
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Mês Fechamento
              </label>
              <FilterCombobox
                label="Mês Fechamento"
                value={filterMesFechamento}
                onChange={setFilterMesFechamento}
                options={MESES}
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Valor Total
              </label>
              <FilterCombobox
                label="Valor Total"
                value={filterValorTotal}
                onChange={setFilterValorTotal}
                options={[{ label: 'Maior que 0', value: '>0' }]}
              />
            </div>
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

      {displayMode === 'cards' ? (
        loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* SPEC-044: clique no card navega direto para /projeto/:id (página cheia) — Sheet lateral removido. */}
            <ProjectMobileCards
              viewMode={viewMode}
              onClickProject={(id) => navigate(`/projeto/${id}`)}
              projects={
                filteredProjetos.map((p) => ({
                  id: p.id,
                  codigo: p.codigo,
                  name: p.nome,
                  status: p.status,
                  strategicLevel: p.nivel_estrategico,
                  responsible: p.responsavel?.nome || p.responsavel_nome || '-',
                  entryDate: p.data_entrada,
                  client: p.cliente?.nome || '-',
                  architect: p.arquiteto?.nome || '-',
                  engineer: p.engenheiro?.nome || p.arquiteto?.nome || '-',
                  city: p.cidade || '-',
                  state: p.estado || '-',
                  valor_fechado: formatCurrency(getValorTotal(p)),
                  data_fechamento: getDataFechamento(p),
                })) as any
              }
            />
          </div>
        )
      ) : (
        // SPEC-145: Projeto/Responsável/Eng.-Arquiteto/Cidade quebram linha
        // (sem truncar, sem nowrap) em vez de forçar a tabela a crescer;
        // datas/status/valor ficam compactos e nowrap. O <main> do Layout
        // não tem mais teto de largura (max-w-[1400px] removido), então a
        // tabela ocupa o espaço disponível sem precisar de rolagem
        // horizontal em resolução normal de monitor de operação.
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <div className="rounded-md border-0">
              <Table className="table-auto w-full">
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[70px] px-2 py-3 text-slate-600 font-semibold text-xs">
                      Código
                    </TableHead>
                    {viewMode === 'completa' && (
                      <TableHead className="w-[56px] px-2 py-3 text-slate-600 font-semibold text-xs">
                        Nível
                      </TableHead>
                    )}
                    <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs min-w-[160px]">
                      Projeto
                    </TableHead>

                    {viewMode === 'completa' && (
                      <>
                        <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs min-w-[140px]">
                          Responsável
                        </TableHead>
                        <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs whitespace-nowrap">
                          Entrada
                        </TableHead>
                      </>
                    )}

                    <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs whitespace-nowrap">
                      Status
                    </TableHead>

                    {viewMode === 'completa' && (
                      <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs whitespace-nowrap">
                        Fechamento
                      </TableHead>
                    )}

                    {(viewMode === 'operacional' || viewMode === 'completa') && (
                      <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs whitespace-nowrap">
                        Valor Total
                      </TableHead>
                    )}

                    <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs min-w-[140px]">
                      Eng./Arquiteto
                    </TableHead>

                    {(viewMode === 'operacional' || viewMode === 'completa') && (
                      <TableHead className="px-2 py-3 text-slate-600 font-semibold text-xs min-w-[110px]">
                        Cidade
                      </TableHead>
                    )}

                    {viewMode === 'completa' && (
                      <TableHead className="w-[40px] px-2 py-3 text-slate-600 font-semibold text-xs">
                        UF
                      </TableHead>
                    )}

                    <TableHead className="w-[88px] px-2 py-3 text-right text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={viewMode === 'completa' ? 12 : viewMode === 'operacional' ? 7 : 5}
                        className="h-32 text-center"
                      >
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      </TableCell>
                    </TableRow>
                  ) : filteredProjetos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={viewMode === 'completa' ? 12 : viewMode === 'operacional' ? 7 : 5}
                        className="h-32 text-center text-slate-500 font-medium"
                      >
                        Nenhum projeto encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjetos.map((projeto) => {
                      const valorTotal = getValorTotal(projeto)

                      return (
                        <TableRow
                          key={projeto.id}
                          className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => navigate(`/projeto/${projeto.id}`)}
                        >
                          <TableCell
                            className="px-2 py-3 font-medium text-slate-900 truncate"
                            title={projeto.codigo || ''}
                          >
                            {projeto.codigo}
                          </TableCell>

                          {viewMode === 'completa' && (
                            <TableCell className="px-2 py-3 text-slate-600 truncate">
                              {projeto.nivel_estrategico || '-'}
                            </TableCell>
                          )}

                          <TableCell className="px-2 py-3 font-semibold text-slate-900 whitespace-normal break-words min-w-[160px]">
                            {projeto.nome || 'Sem nome'}
                          </TableCell>

                          {viewMode === 'completa' && (
                            <>
                              <TableCell className="px-2 py-3 text-slate-600 break-words min-w-[140px]">
                                {projeto.responsavel?.nome || projeto.responsavel_nome || '-'}
                              </TableCell>
                              <TableCell className="px-2 py-3 text-slate-500 whitespace-nowrap text-xs">
                                {formatDate(projeto.data_entrada)}
                              </TableCell>
                            </>
                          )}

                          <TableCell className="px-2 py-3 whitespace-nowrap">
                            {projeto.status ? (
                              <Badge
                                variant={
                                  projeto.status === 'Concluído' ||
                                  projeto.status === 'Completo' ||
                                  projeto.status === 'Finalizado'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="font-medium shadow-sm text-[10px] px-1.5 py-0.5 whitespace-nowrap leading-tight"
                              >
                                {projeto.status}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </TableCell>

                          {viewMode === 'completa' && (
                            <TableCell className="px-2 py-3 text-emerald-700 font-medium whitespace-nowrap text-xs">
                              {formatDate(getDataFechamento(projeto))}
                            </TableCell>
                          )}

                          {(viewMode === 'operacional' || viewMode === 'completa') && (
                            <TableCell className="px-2 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm whitespace-nowrap">
                                {formatCurrency(valorTotal)}
                              </span>
                            </TableCell>
                          )}

                          <TableCell className="px-2 py-3 text-slate-600 break-words min-w-[140px]">
                            {projeto.engenheiro?.nome || projeto.arquiteto?.nome || '-'}
                          </TableCell>

                          {(viewMode === 'operacional' || viewMode === 'completa') && (
                            <TableCell className="px-2 py-3 text-slate-700 break-words min-w-[110px]">
                              {projeto.cidade || '-'}
                            </TableCell>
                          )}

                          {viewMode === 'completa' && (
                            <TableCell className="px-2 py-3 text-slate-600 truncate">
                              {projeto.estado || '-'}
                            </TableCell>
                          )}

                          <TableCell
                            className="px-2 py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => navigate(`/projeto/${projeto.id}`)}
                              >
                                <Edit2 className="w-4 h-4 text-slate-600" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o projeto?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(projeto.id)}
                                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
