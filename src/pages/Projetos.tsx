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
import { Loader2, Plus, FilterX, X, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

export default function Projetos() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('resumida')
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

  const filteredProjetos = projetos.filter((p) => {
    if (viewMode === 'operacional') {
      const status = p.status || ''
      if (status === 'Completo' || status === 'Finalizado' || status === 'Concluído') return false
    }

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
      return d.toLocaleDateString('pt-BR')
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
                    {getUnique(config).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Valor Total
              </label>
              <Select value={filterValorTotal} onValueChange={setFilterValorTotal}>
                <SelectTrigger className="bg-white border-slate-200 shadow-sm focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value=">0">Maior que 0</SelectItem>
                </SelectContent>
              </Select>
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
                      <TableHead className="py-4 text-slate-600 font-semibold">Status</TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Arquiteto
                      </TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Engenheiro
                      </TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold">Cidade</TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold">Estado</TableHead>
                    </>
                  )}
                  {viewMode === 'operacional' && (
                    <>
                      <TableHead className="py-4 text-slate-600 font-semibold">Status</TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold">
                        Responsável
                      </TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Data Entrada
                      </TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold">Cidade</TableHead>
                    </>
                  )}
                  {viewMode === 'resumida' && (
                    <>
                      <TableHead className="py-4 text-slate-600 font-semibold">Status</TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold">
                        Responsável
                      </TableHead>
                    </>
                  )}

                  <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                    Valor Total
                  </TableHead>
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
                            <TableCell className="py-4 text-slate-600 max-w-[150px] truncate">
                              {projeto.arquiteto?.nome || '-'}
                            </TableCell>
                            <TableCell className="py-4 text-slate-600 max-w-[150px] truncate">
                              {projeto.engenheiro?.nome || '-'}
                            </TableCell>
                            <TableCell
                              className="py-4 text-slate-700 max-w-[150px] truncate"
                              title={projeto.cidade || ''}
                            >
                              {projeto.cidade || '-'}
                            </TableCell>
                            <TableCell className="py-4 text-slate-600">
                              {projeto.estado || '-'}
                            </TableCell>
                          </>
                        )}

                        {viewMode === 'operacional' && (
                          <>
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

                            <TableCell className="py-4 max-w-[150px] truncate text-slate-600">
                              {projeto.responsavel?.nome || projeto.responsavel_nome || '-'}
                            </TableCell>

                            <TableCell className="py-4 whitespace-nowrap text-slate-500">
                              {formatDate(projeto.data_entrada)}
                            </TableCell>

                            <TableCell className="py-4">
                              <span
                                className="text-slate-700 font-medium truncate max-w-[150px] block"
                                title={projeto.cidade || ''}
                              >
                                {projeto.cidade || '-'}
                              </span>
                            </TableCell>
                          </>
                        )}

                        {viewMode === 'resumida' && (
                          <>
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

                            <TableCell className="py-4 max-w-[150px] truncate text-slate-600">
                              {projeto.responsavel?.nome || projeto.responsavel_nome || '-'}
                            </TableCell>
                          </>
                        )}

                        <TableCell className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm whitespace-nowrap">
                            {formatCurrency(valorTotal)}
                          </span>
                        </TableCell>

                        <TableCell className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
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

      <Dialog
        open={!!selectedProjeto}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProjeto(null)
            setIsEditing(false)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing ? 'Editar Projeto e Parcelas' : 'Detalhes Rápidos do Projeto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedProjeto && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      {selectedProjeto.responsavel?.nome || selectedProjeto.responsavel_nome || '-'}
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
                  {isEditing ? (
                    <div className="space-y-3">
                      {editedPagamentos.map((p, idx) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-2 sm:grid-cols-6 items-end gap-3 bg-slate-50 p-3 rounded-md border border-slate-100"
                        >
                          <div className="col-span-1">
                            <Label className="text-xs text-slate-500 mb-1 block">Nº Parcela</Label>
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
                            <Label className="text-xs text-slate-500 mb-1 block">Vencimento</Label>
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
                  ) : (
                    (() => {
                      const pagamentos = [...(selectedProjeto.projeto_parcelas || [])].sort(
                        (a, b) => a.numero_parcela - b.numero_parcela,
                      )

                      if (pagamentos.length === 0) {
                        return (
                          <p className="text-slate-500 text-sm py-2">Nenhuma parcela registrada.</p>
                        )
                      }

                      return (
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead className="w-[80px]">Nº</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valor Pago</TableHead>
                                <TableHead className="text-right">Pagamento</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pagamentos.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell className="font-medium text-slate-500">
                                    {p.numero_parcela}
                                  </TableCell>
                                  <TableCell className="font-semibold text-emerald-600">
                                    {formatCurrency(Number(p.valor) || 0)}
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    {formatDate(p.data_vencimento)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        p.status === 'paga'
                                          ? 'default'
                                          : p.status === 'atrasada'
                                            ? 'destructive'
                                            : 'secondary'
                                      }
                                    >
                                      {p.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-semibold text-emerald-600">
                                    {p.valor_pago ? formatCurrency(Number(p.valor_pago)) : '-'}
                                  </TableCell>
                                  <TableCell className="text-right text-slate-600">
                                    {formatDate(p.data_pagamento)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-slate-50 font-bold">
                                <TableCell colSpan={5} className="text-slate-700">
                                  Valor Total Parcelado
                                </TableCell>
                                <TableCell className="text-right text-emerald-600">
                                  {formatCurrency(getValorTotal(selectedProjeto))}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      )
                    })()
                  )}
                </div>

                <div className="flex justify-end pt-6 gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/projeto/${selectedProjeto.id}`)}
                  >
                    Ver Detalhes Completos
                  </Button>
                  <div className="flex-1" />
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
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
                      >
                        Fechar
                      </Button>
                      <Button onClick={startEditing}>Editar</Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
