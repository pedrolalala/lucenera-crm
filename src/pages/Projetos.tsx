import { useEffect, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjetos, updateProjeto, type Projeto } from '@/services/projetos'
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
import { Loader2, Plus, FilterX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectActions } from '@/components/ProjectActions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
    if (viewMode === 'operacional') {
      const status = p.Status || ''
      if (status === 'Completo' || status === 'Finalizado' || status === 'Concluído') return false
    }

    if (filterValorTotal === '>0') {
      const total = getValorTotal(p)
      if (total <= 0) return false
    }

    return filterConfigs.every((config) => {
      if (config.state === 'all') return true
      return (p as any)[config.key] === config.state
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

  const formatCodigo = (codigo: any) => {
    if (!codigo) return '-'
    const codStr = codigo.toString()
    if (codStr.length > 2 && !codStr.includes('.')) {
      return `${codStr.substring(0, 2)}.${codStr.substring(2)}`
    }
    return codStr
  }

  const parseValor = (val: any) => {
    if (!val) return 0
    if (typeof val === 'number') return val
    const str = String(val).trim()
    if (str.includes(',')) {
      const clean = str
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '')
      return parseFloat(clean) || 0
    }
    const clean = str.replace(/[^\d.-]/g, '')
    return parseFloat(clean) || 0
  }

  const getValorTotal = (projeto: any) => {
    let total = 0
    for (let i = 1; i <= 10; i++) {
      total += parseValor(projeto[`valor_fechado_${i}`])
    }
    return total
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const startEditing = () => {
    if (!selectedProjeto) return
    setIsEditing(true)
    setEditedProjeto({ ...selectedProjeto })

    const pags = []
    for (let i = 1; i <= 10; i++) {
      const valor = (selectedProjeto as any)[`valor_fechado_${i}`]
      const data = (selectedProjeto as any)[`data_fechamento_${i}`]
      if (valor || data) {
        pags.push({ id: i, valor: valor || '', data: data || '' })
      }
    }
    setEditedPagamentos(pags)
  }

  const handleSave = async () => {
    if (!editedProjeto || !selectedProjeto) return
    setSaving(true)
    try {
      const dataToSave = { ...editedProjeto } as any
      delete dataToSave.id // Evita atualizar a primary key auto-incrementável

      // Limpa os pagamentos antigos
      for (let i = 1; i <= 10; i++) {
        dataToSave[`valor_fechado_${i}`] = null
        dataToSave[`data_fechamento_${i}`] = null
      }

      // Remapeia os pagamentos editados
      editedPagamentos.forEach((p, index) => {
        const i = index + 1
        if (i <= 10) {
          dataToSave[`valor_fechado_${i}`] = p.valor
          dataToSave[`data_fechamento_${i}`] = p.data
        }
      })

      await updateProjeto(selectedProjeto.Codigo!, dataToSave)

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
    if (key === 'Codigo') val = formatCodigo(val)
    if (key === 'Data_Entrada' && !isEditing) val = formatDate(val)

    if (key === 'Status' && !isEditing) {
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
                    {getUnique(config.key).map((s) => (
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
                        Arquiteto Responsável
                      </TableHead>
                      <TableHead className="py-4 text-slate-600 font-semibold whitespace-nowrap">
                        Responsável da Obra
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
                  <TableHead className="w-[50px] py-4"></TableHead>
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
                        key={projeto.Codigo || Math.random().toString()}
                        className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => setSelectedProjeto(projeto)}
                      >
                        <TableCell className="py-4 font-medium text-slate-900">
                          {formatCodigo(projeto.Codigo)}
                        </TableCell>

                        {viewMode === 'completa' && (
                          <TableCell className="py-4 text-slate-600">
                            {projeto.Nivel_Estrategico || '-'}
                          </TableCell>
                        )}

                        <TableCell
                          className="py-4 font-semibold text-slate-900 max-w-[200px] truncate"
                          title={projeto.Projeto || ''}
                        >
                          {projeto.Projeto || 'Sem nome'}
                        </TableCell>

                        {viewMode === 'completa' && (
                          <>
                            <TableCell
                              className="py-4 text-slate-600 max-w-[150px] truncate"
                              title={projeto.Responsavel || ''}
                            >
                              {projeto.Responsavel || '-'}
                            </TableCell>
                            <TableCell className="py-4 whitespace-nowrap text-slate-500">
                              {formatDate(projeto.Data_Entrada)}
                            </TableCell>
                            <TableCell className="py-4">
                              {projeto.Status ? (
                                <Badge
                                  variant={
                                    projeto.Status === 'Concluído' ||
                                    projeto.Status === 'Completo' ||
                                    projeto.Status === 'Finalizado'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="font-medium shadow-sm"
                                >
                                  {projeto.Status}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell
                              className="py-4 text-slate-600 max-w-[150px] truncate"
                              title={projeto.Arquiteto_Responsavel || ''}
                            >
                              {projeto.Arquiteto_Responsavel || '-'}
                            </TableCell>
                            <TableCell
                              className="py-4 text-slate-600 max-w-[150px] truncate"
                              title={projeto.Responsavel_da_Obra || ''}
                            >
                              {projeto.Responsavel_da_Obra || '-'}
                            </TableCell>
                            <TableCell
                              className="py-4 text-slate-700 max-w-[150px] truncate"
                              title={projeto.Cidade || ''}
                            >
                              {projeto.Cidade || '-'}
                            </TableCell>
                            <TableCell className="py-4 text-slate-600">
                              {projeto.Estado || '-'}
                            </TableCell>
                          </>
                        )}

                        {viewMode === 'operacional' && (
                          <>
                            <TableCell className="py-4">
                              {projeto.Status ? (
                                <Badge
                                  variant={
                                    projeto.Status === 'Concluído' ||
                                    projeto.Status === 'Completo' ||
                                    projeto.Status === 'Finalizado'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="font-medium shadow-sm"
                                >
                                  {projeto.Status}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </TableCell>

                            <TableCell
                              className="py-4 max-w-[150px] truncate text-slate-600"
                              title={projeto.Responsavel || ''}
                            >
                              {projeto.Responsavel || '-'}
                            </TableCell>

                            <TableCell className="py-4 whitespace-nowrap text-slate-500">
                              {formatDate(projeto.Data_Entrada)}
                            </TableCell>

                            <TableCell className="py-4">
                              <span
                                className="text-slate-700 font-medium truncate max-w-[150px] block"
                                title={projeto.Cidade || ''}
                              >
                                {projeto.Cidade || '-'}
                              </span>
                            </TableCell>
                          </>
                        )}

                        {viewMode === 'resumida' && (
                          <>
                            <TableCell className="py-4">
                              {projeto.Status ? (
                                <Badge
                                  variant={
                                    projeto.Status === 'Concluído' ||
                                    projeto.Status === 'Completo' ||
                                    projeto.Status === 'Finalizado'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="font-medium shadow-sm"
                                >
                                  {projeto.Status}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </TableCell>

                            <TableCell
                              className="py-4 max-w-[150px] truncate text-slate-600"
                              title={projeto.Responsavel || ''}
                            >
                              {projeto.Responsavel || '-'}
                            </TableCell>
                          </>
                        )}

                        <TableCell className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm whitespace-nowrap">
                            {formatCurrency(valorTotal)}
                          </span>
                        </TableCell>

                        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                          <ProjectActions projeto={projeto} onChange={loadProjetos} />
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing ? 'Editar Projeto' : 'Detalhes do Projeto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedProjeto && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {renderField('Código', 'Codigo', 'number')}
                  {renderField('Nível Estratégico', 'Nivel_Estrategico')}
                  {renderField('Projeto', 'Projeto')}
                  {renderField('Responsável', 'Responsavel')}
                  {renderField('Data de Entrada', 'Data_Entrada')}
                  {renderField('Status', 'Status')}
                  {renderField('Arquiteto Responsável', 'Arquiteto_Responsavel')}
                  {renderField('Responsável da Obra', 'Responsavel_da_Obra')}
                  {renderField('Cidade', 'Cidade')}
                  {renderField('Estado', 'Estado')}
                  {renderField('Arquivado', 'Arquivado')}
                  {renderField('Tipo de Item', 'Tipo_de_Item')}
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 space-y-1">
                    {renderField('Caminho', 'Caminho')}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                    Pagamentos Registrados
                  </h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      {editedPagamentos.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-md border border-slate-100"
                        >
                          <div className="w-full sm:w-1/2">
                            <Label className="text-xs text-slate-500 mb-1 block">Valor Pago</Label>
                            <Input
                              value={p.valor}
                              onChange={(e) => {
                                const newPags = [...editedPagamentos]
                                newPags[idx].valor = e.target.value
                                setEditedPagamentos(newPags)
                              }}
                              placeholder="Ex: 1500,00"
                            />
                          </div>
                          <div className="w-full sm:w-1/2">
                            <Label className="text-xs text-slate-500 mb-1 block">Data</Label>
                            <Input
                              type="text"
                              value={p.data}
                              onChange={(e) => {
                                const newPags = [...editedPagamentos]
                                newPags[idx].data = e.target.value
                                setEditedPagamentos(newPags)
                              }}
                              placeholder="DD/MM/AAAA"
                            />
                          </div>
                          <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
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
                      {editedPagamentos.length < 10 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditedPagamentos([
                              ...editedPagamentos,
                              { id: Date.now(), valor: '', data: '' },
                            ])
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar Pagamento
                        </Button>
                      )}
                    </div>
                  ) : (
                    (() => {
                      const pagamentos = []
                      for (let i = 1; i <= 10; i++) {
                        const valor = (selectedProjeto as any)[`valor_fechado_${i}`]
                        const data = (selectedProjeto as any)[`data_fechamento_${i}`]
                        if (valor || data) {
                          pagamentos.push({
                            i,
                            valor: valor ? formatCurrency(parseValor(valor)) : '-',
                            data: formatDate(data),
                          })
                        }
                      }

                      if (pagamentos.length === 0) {
                        return (
                          <p className="text-slate-500 text-sm py-2">
                            Nenhum pagamento registrado.
                          </p>
                        )
                      }

                      return (
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead className="w-[80px]">Parcela</TableHead>
                                <TableHead>Valor Pago</TableHead>
                                <TableHead className="text-right">Data</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pagamentos.map((p) => (
                                <TableRow key={p.i}>
                                  <TableCell className="font-medium text-slate-500">
                                    {p.i}
                                  </TableCell>
                                  <TableCell className="font-semibold text-emerald-600">
                                    {p.valor}
                                  </TableCell>
                                  <TableCell className="text-right text-slate-600">
                                    {p.data}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-slate-50 font-bold">
                                <TableCell colSpan={2} className="text-slate-700">
                                  Valor Total
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
