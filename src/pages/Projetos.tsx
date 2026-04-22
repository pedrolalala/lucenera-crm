import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjetos, updateProjetoById, deleteProjeto, type Projeto } from '@/services/projetos'
import { supabase } from '@/lib/supabase/client'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type ViewMode = 'resumida' | 'operacional' | 'completa'

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
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? 'all' : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
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
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('projetos-view-mode') as ViewMode) || 'resumida'
  })
  const [displayMode, setDisplayMode] = useDisplayMode('projetos', 'cards')

  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProjeto, setEditedProjeto] = useState<Projeto | null>(null)
  const [editedPagamentos, setEditedPagamentos] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterResponsavel, setFilterResponsavel] = useState('all')
  const [filterArquiteto, setFilterArquiteto] = useState('all')
  const [filterEngenheiro, setFilterEngenheiro] = useState('all')
  const [filterCidade, setFilterCidade] = useState('all')
  const [filterValorTotal, setFilterValorTotal] = useState('all')

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
    if (!projeto.projeto_parcelas || !Array.isArray(projeto.projeto_parcelas)) return null
    const datas = projeto.projeto_parcelas
      .map((p: any) => p.data_fechamento)
      .filter(Boolean)
      .sort()
    return datas.length > 0 ? datas[datas.length - 1] : null
  }

  const filteredProjetos = projetos.filter((p) => {
    if (filterValorTotal === '>0') {
      const total = getValorTotal(p)
      if (total <= 0) return false
    }

    return filterConfigs.every((config) => {
      if (config.state === 'all') return true
      const val = config.extract ? config.extract(p) : (p as any)[config.key]
      return val === config.state
    })
  })

  const clearFilters = () => {
    filterConfigs.forEach((c) => c.set('all'))
    setFilterValorTotal('all')
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

  const startEditing = () => {
    if (!selectedProjeto) return
    setIsEditing(true)
    setEditedProjeto({ ...selectedProjeto })

    const pags = (selectedProjeto.projeto_parcelas || []).map((p: any) => ({
      id: p.id,
      numero_parcela: p.numero_parcela,
      valor: p.valor || '',
      data_vencimento: p.data_vencimento || '',
      data_pagamento: p.data_pagamento || '',
      valor_pago: p.valor_pago || '',
      status: p.status || 'pendente',
    }))
    pags.sort((a, b) => a.numero_parcela - b.numero_parcela)
    setEditedPagamentos(pags)
  }

  const handleSave = async () => {
    if (!editedProjeto || !selectedProjeto) return
    setSaving(true)
    try {
      const dataToSave = {
        codigo: editedProjeto.codigo,
        nome: editedProjeto.nome,
        nivel_estrategico: editedProjeto.nivel_estrategico,
        status: editedProjeto.status,
        cidade: editedProjeto.cidade,
        estado: editedProjeto.estado,
        data_entrada: editedProjeto.data_entrada,
        arquivado: editedProjeto.arquivado,
        tipo_item: editedProjeto.tipo_item,
        caminho: editedProjeto.caminho,
      } as any

      await updateProjetoById(selectedProjeto.id, dataToSave)

      // Save pagamentos
      const existingIds = new Set((selectedProjeto.projeto_parcelas || []).map((p) => p.id))
      const editedIds = new Set(
        editedPagamentos.map((p) => p.id).filter((id) => id && !String(id).startsWith('new-')),
      )

      for (const p of editedPagamentos) {
        const payload = {
          projeto_id: selectedProjeto.id,
          numero_parcela: p.numero_parcela || 1,
          valor: Number(p.valor) || 0,
          data_vencimento: p.data_vencimento || null,
          data_pagamento: p.data_pagamento || null,
          valor_pago: p.valor_pago ? Number(p.valor_pago) : null,
          status: p.status || 'pendente',
        }
        if (p.id && !String(p.id).startsWith('new-')) {
          await supabase.from('projeto_parcelas').update(payload).eq('id', p.id)
        } else {
          await supabase.from('projeto_parcelas').insert(payload)
        }
      }

      for (const oldId of Array.from(existingIds)) {
        if (!editedIds.has(oldId)) {
          await supabase.from('projeto_parcelas').delete().eq('id', oldId)
        }
      }

      toast({ title: 'Sucesso', description: 'Projeto atualizado com sucesso.' })
      setSelectedProjeto(null)
      setIsEditing(false)
      loadProjetos()
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar projeto.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await deleteProjeto(id)
      toast({ title: 'Sucesso', description: 'Projeto excluído.' })
      loadProjetos()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const renderField = (label: string, key: keyof Projeto, type: string = 'text') => {
    if (isEditing && editedProjeto) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          <Input
            type={type}
            value={(editedProjeto as any)[key] || ''}
            onChange={(e) =>
              setEditedProjeto({
                ...editedProjeto,
                [key]:
                  type === 'number' && e.target.value ? Number(e.target.value) : e.target.value,
              })
            }
          />
        </div>
      )
    }

    let val = selectedProjeto?.[key] as any
    if (key === 'data_entrada' && !isEditing) val = formatDate(val)

    if (key === 'status' && !isEditing) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          <div>
            {val ? (
              <Badge
                variant={
                  val === 'Concluído' || val === 'Completo' || val === 'Finalizado'
                    ? 'default'
                    : 'secondary'
                }
              >
                {String(val)}
              </Badge>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <p className="text-slate-900 font-medium break-all">{val ? String(val) : '-'}</p>
      </div>
    )
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
            <ProjectMobileCards
              viewMode={viewMode}
              onClickProject={(id) => {
                const proj = projetos.find((p) => p.id === id)
                if (proj) setSelectedProjeto(proj)
              }}
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
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <div className="rounded-md border-0 min-w-[700px]">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] py-4 text-slate-600 font-semibold">
                      Código
                    </TableHead>
                    {viewMode === 'completa' && (
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Nível Estratégico
                      </TableHead>
                    )}
                    <TableHead className="py-4 text-slate-600 font-semibold">Projeto</TableHead>

                    {viewMode === 'completa' && (
                      <>
                        <TableHead className="py-4 text-slate-600 font-semibold">
                          Responsável
                        </TableHead>
                        <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                          Data Entrada
                        </TableHead>
                      </>
                    )}

                    <TableHead className="py-4 text-slate-600 font-semibold">Status</TableHead>

                    {(viewMode === 'operacional' || viewMode === 'completa') && (
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Data Fechamento
                      </TableHead>
                    )}

                    <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                      Engenheiro/Arquiteto
                    </TableHead>

                    {(viewMode === 'operacional' || viewMode === 'completa') && (
                      <TableHead className="py-4 text-slate-600 font-semibold">Cidade</TableHead>
                    )}

                    {viewMode === 'completa' && (
                      <TableHead className="py-4 text-slate-600 font-semibold">Estado</TableHead>
                    )}

                    {viewMode === 'completa' && (
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Valor Total
                      </TableHead>
                    )}
                    <TableHead className="w-[100px] py-4 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={viewMode === 'completa' ? 12 : viewMode === 'operacional' ? 8 : 6}
                        className="h-32 text-center"
                      >
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      </TableCell>
                    </TableRow>
                  ) : filteredProjetos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={viewMode === 'completa' ? 12 : viewMode === 'operacional' ? 8 : 6}
                        className="h-32 text-center text-slate-500 font-medium"
                      >
                        Nenhum projeto encontrado com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjetos.map((projeto) => {
                      const valorTotal = getValorTotal(projeto)

                      return (
                        <TableRow
                          key={projeto.id}
                          className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => setSelectedProjeto(projeto)}
                        >
                          <TableCell className="py-4 font-medium text-slate-900">
                            {projeto.codigo}
                          </TableCell>

                          {viewMode === 'completa' && (
                            <TableCell className="py-4 text-slate-600">
                              {projeto.nivel_estrategico || '-'}
                            </TableCell>
                          )}

                          <TableCell
                            className="py-4 font-semibold text-slate-900 max-w-[200px] truncate"
                            title={projeto.nome || ''}
                          >
                            {projeto.nome || 'Sem nome'}
                          </TableCell>

                          {viewMode === 'completa' && (
                            <>
                              <TableCell className="py-4 text-slate-600 max-w-[150px] truncate">
                                {projeto.responsavel?.nome || projeto.responsavel_nome || '-'}
                              </TableCell>
                              <TableCell className="py-4 whitespace-nowrap text-slate-500">
                                {formatDate(projeto.data_entrada)}
                              </TableCell>
                            </>
                          )}

                          <TableCell className="py-4">
                            {projeto.status ? (
                              <Badge
                                variant={
                                  projeto.status === 'Concluído' ||
                                  projeto.status === 'Completo' ||
                                  projeto.status === 'Finalizado'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="font-medium shadow-sm"
                              >
                                {projeto.status}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </TableCell>

                          {(viewMode === 'operacional' || viewMode === 'completa') && (
                            <TableCell className="py-4 whitespace-nowrap text-emerald-700 font-medium">
                              {formatDate(getDataFechamento(projeto))}
                            </TableCell>
                          )}

                          <TableCell className="py-4 text-slate-600 max-w-[150px] truncate">
                            {projeto.engenheiro?.nome || projeto.arquiteto?.nome || '-'}
                          </TableCell>

                          {(viewMode === 'operacional' || viewMode === 'completa') && (
                            <TableCell
                              className="py-4 text-slate-700 max-w-[150px] truncate"
                              title={projeto.cidade || ''}
                            >
                              {projeto.cidade || '-'}
                            </TableCell>
                          )}

                          {viewMode === 'completa' && (
                            <TableCell className="py-4 text-slate-600">
                              {projeto.estado || '-'}
                            </TableCell>
                          )}

                          {viewMode === 'completa' && (
                            <TableCell className="py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm whitespace-nowrap">
                                {formatCurrency(valorTotal)}
                              </span>
                            </TableCell>
                          )}

                          <TableCell
                            className="py-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/projeto/${projeto.id}`)}
                              >
                                <Edit2 className="w-4 h-4 text-slate-600" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
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

      <Sheet
        open={!!selectedProjeto}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProjeto(null)
            setIsEditing(false)
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[480px] md:w-[600px] lg:w-[45vw] sm:max-w-none flex flex-col p-6 shadow-2xl border-l-0"
        >
          <SheetHeader className="flex-none pb-4 border-b border-slate-100">
            <SheetTitle className="text-xl text-slate-800">
              {isEditing ? 'Editar Projeto e Parcelas' : 'Detalhes do Projeto'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 pr-2 -mr-2 space-y-6">
            {selectedProjeto && (
              <>
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField('Código', 'codigo', 'text')}
                      {renderField('Nível Estratégico', 'nivel_estrategico')}
                      {renderField('Projeto', 'nome')}

                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Cliente
                        </span>
                        <p className="text-slate-900 font-medium break-all">
                          {selectedProjeto.cliente?.nome || '-'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Responsável
                        </span>
                        <p className="text-slate-900 font-medium break-all">
                          {selectedProjeto.responsavel?.nome ||
                            selectedProjeto.responsavel_nome ||
                            '-'}
                        </p>
                      </div>

                      {renderField('Data de Entrada', 'data_entrada')}
                      {renderField('Status', 'status')}

                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Arquiteto
                        </span>
                        <p className="text-slate-900 font-medium break-all">
                          {selectedProjeto.arquiteto?.nome || '-'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Engenheiro
                        </span>
                        <p className="text-slate-900 font-medium break-all">
                          {selectedProjeto.engenheiro?.nome || '-'}
                        </p>
                      </div>

                      {renderField('Cidade', 'cidade')}
                      {renderField('Estado', 'estado')}
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                        Parcelas do Projeto
                      </h4>
                      <div className="space-y-3">
                        {editedPagamentos.map((p, idx) => (
                          <div
                            key={p.id}
                            className="grid grid-cols-2 sm:grid-cols-6 items-end gap-3 bg-slate-50 p-3 rounded-md border border-slate-100"
                          >
                            <div className="col-span-1">
                              <Label className="text-xs text-slate-500 mb-1 block">
                                Nº Parcela
                              </Label>
                              <Input
                                type="number"
                                value={p.numero_parcela}
                                onChange={(e) => {
                                  const newPags = [...editedPagamentos]
                                  newPags[idx].numero_parcela = e.target.value
                                  setEditedPagamentos(newPags)
                                }}
                              />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                              <Label className="text-xs text-slate-500 mb-1 block">Valor</Label>
                              <Input
                                type="number"
                                value={p.valor}
                                onChange={(e) => {
                                  const newPags = [...editedPagamentos]
                                  newPags[idx].valor = e.target.value
                                  setEditedPagamentos(newPags)
                                }}
                                placeholder="0,00"
                              />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                              <Label className="text-xs text-slate-500 mb-1 block">
                                Vencimento
                              </Label>
                              <Input
                                type="date"
                                value={p.data_vencimento}
                                onChange={(e) => {
                                  const newPags = [...editedPagamentos]
                                  newPags[idx].data_vencimento = e.target.value
                                  setEditedPagamentos(newPags)
                                }}
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newPags = editedPagamentos.filter((_, i) => i !== idx)
                                  setEditedPagamentos(newPags)
                                }}
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedPagamentos([
                              ...editedPagamentos,
                              {
                                id: `new-${Date.now()}`,
                                numero_parcela: editedPagamentos.length + 1,
                                valor: '',
                                data_vencimento: '',
                                data_pagamento: '',
                                valor_pago: '',
                                status: 'pendente',
                              },
                            ])
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Nova Parcela
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900 break-words">
                        {selectedProjeto.cliente?.nome || 'Cliente não informado'}
                      </h1>
                      <h2 className="text-xl text-slate-600 font-medium break-words">
                        {selectedProjeto.nome || 'Projeto sem nome'}
                      </h2>
                      <p className="text-sm text-slate-500 font-mono mt-1">
                        Cód: {selectedProjeto.codigo}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/80 p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Status
                        </span>
                        <div>
                          <Badge
                            variant={
                              ['Concluído', 'Completo', 'Finalizado'].includes(
                                selectedProjeto.status as string,
                              )
                                ? 'default'
                                : 'secondary'
                            }
                            className="shadow-sm font-medium"
                          >
                            {selectedProjeto.status || '-'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Valor Total
                        </span>
                        <p className="text-slate-900 font-bold text-lg leading-none">
                          {formatCurrency(getValorTotal(selectedProjeto))}
                        </p>
                      </div>

                      {(viewMode === 'operacional' || viewMode === 'completa') && (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Data Fechamento
                            </span>
                            <p className="text-slate-900 font-medium">
                              {formatDate(getDataFechamento(selectedProjeto))}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Engenheiro
                            </span>
                            <p
                              className="text-slate-900 font-medium truncate"
                              title={selectedProjeto.engenheiro?.nome || '-'}
                            >
                              {selectedProjeto.engenheiro?.nome || '-'}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Arquiteto
                            </span>
                            <p
                              className="text-slate-900 font-medium truncate"
                              title={selectedProjeto.arquiteto?.nome || '-'}
                            >
                              {selectedProjeto.arquiteto?.nome || '-'}
                            </p>
                          </div>
                        </>
                      )}

                      {viewMode === 'completa' && (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Cidade / Estado
                            </span>
                            <p className="text-slate-900 font-medium">
                              {[selectedProjeto.cidade, selectedProjeto.estado]
                                .filter(Boolean)
                                .join(' / ') || '-'}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Data Entrada
                            </span>
                            <p className="text-slate-900 font-medium">
                              {formatDate(selectedProjeto.data_entrada)}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Nível Estratégico
                            </span>
                            <p className="text-slate-900 font-medium">
                              {selectedProjeto.nivel_estrategico ? (
                                <Badge variant="outline" className="bg-white shadow-sm">
                                  {selectedProjeto.nivel_estrategico}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {(() => {
                      const related = selectedProjeto.cliente_id
                        ? projetos.filter(
                            (p) =>
                              p.cliente_id === selectedProjeto.cliente_id &&
                              p.id !== selectedProjeto.id,
                          )
                        : []

                      return (
                        <div className="mt-2 pt-6 border-t border-slate-200">
                          <h3 className="font-bold text-lg mb-4 text-slate-800">
                            Projetos Relacionados
                          </h3>
                          {related.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {related.map((rp) => (
                                <Card
                                  key={rp.id}
                                  onClick={() => setSelectedProjeto(rp)}
                                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all p-4 bg-white border-slate-200 group"
                                >
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div>
                                      <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                        {rp.nome}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] uppercase tracking-wider bg-slate-100"
                                        >
                                          {rp.status || '-'}
                                        </Badge>
                                        {(viewMode === 'operacional' ||
                                          viewMode === 'completa') && (
                                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
                                            Fechamento: {formatDate(getDataFechamento(rp))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0 border border-slate-200">
                                      {rp.codigo}
                                    </span>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100 text-center font-medium">
                              Nenhum outro projeto encontrado para este cliente.
                            </p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          {selectedProjeto && (
            <div className="flex-none pt-4 mt-2 border-t border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/projeto/${selectedProjeto.id}`)}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  Ver Detalhes Completos
                </Button>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving} className="shadow-sm">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedProjeto(null)
                          setIsEditing(false)
                        }}
                        variant="outline"
                        className="shadow-sm"
                      >
                        Fechar
                      </Button>
                      <Button onClick={startEditing} className="shadow-sm">
                        Editar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
