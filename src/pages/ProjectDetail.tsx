import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getProjeto,
  updateProjetoById,
  saveProjetoParcelas,
  replaceProjetoArquitetos,
  type Projeto,
} from '@/services/projetos'
import { Constants, type Database } from '@/lib/supabase/types'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import useProjectStore from '@/stores/useProjectStore'
import { redirectWithCode } from '@/lib/cross-system-auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  User,
  UserCircle,
  Briefcase,
  Loader2,
  Edit2,
  Save,
  X,
  DollarSign,
  HardHat,
  Package,
  Calculator,
  Link2,
  ExternalLink,
  Check,
  ChevronsUpDown,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArchitectSplitPicker, type ArquitetoSplit } from '@/components/ArchitectSplitPicker'
import { NewEmployeeModal } from '@/components/NewEmployeeModal'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { contacts } = useProjectStore()

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Projeto>>({})
  const [editParcelas, setEditParcelas] = useState<
    Partial<Database['public']['Tables']['projeto_parcelas']['Row']>[]
  >([])

  // SPEC-077: arquitetos com percentual (many-to-many) e responsável ligado
  // a funcionarios — ficam fora de editForm (que é Partial<Projeto>, com
  // arquiteto_id/responsavel_id singulares antigos) pelo mesmo motivo que
  // editParcelas já é estado separado.
  const [editArquitetos, setEditArquitetos] = useState<ArquitetoSplit[]>([])
  const [selectedResponsavelName, setSelectedResponsavelName] = useState('')
  const [openResponsavel, setOpenResponsavel] = useState(false)
  const [searchResponsavel, setSearchResponsavel] = useState('')
  const [dbFuncionarios, setDbFuncionarios] = useState<{ id: string; nome: string }[]>([])
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)

  const projetoArquitetosParaPicker = (data: Projeto): ArquitetoSplit[] => {
    if (data.projeto_arquitetos && data.projeto_arquitetos.length > 0) {
      return data.projeto_arquitetos
        .filter((pa) => pa.arquiteto)
        .map((pa) => ({
          arquiteto_id: pa.arquiteto!.id,
          nome: pa.arquiteto!.nome,
          percentual: Number(pa.percentual),
        }))
    }
    // Rede de segurança: projeto muito antigo que escapou do backfill —
    // cai de volta pro arquiteto_id singular como 100%.
    if (data.arquiteto_id && data.arquiteto?.nome) {
      return [{ arquiteto_id: data.arquiteto_id, nome: data.arquiteto.nome, percentual: 100 }]
    }
    return []
  }

  useEffect(() => {
    const fetchFuncionarios = async () => {
      let q = supabase.from('funcionarios').select('id, nome').eq('status', 'Ativo').order('nome')
      if (searchResponsavel) q = q.ilike('nome', `%${searchResponsavel}%`)
      const { data } = await q.limit(100)
      if (data) setDbFuncionarios(data)
    }
    const timeout = setTimeout(fetchFuncionarios, 300)
    return () => clearTimeout(timeout)
  }, [searchResponsavel])

  const openBudgetSystem = async (projetoId: string) => {
    const redirectTo = `/budgets/new?projeto_id=${encodeURIComponent(projetoId)}`
    try {
      await redirectWithCode(
        'https://gestaofinanceiralucenera.goskip.app',
        redirectTo,
        'orcamentos',
        {
          newTab: true,
        },
      )
    } catch {
      window.open(
        `https://gestaofinanceiralucenera.goskip.app${redirectTo}`,
        '_blank',
        'noopener,noreferrer',
      )
    }
  }

  useEffect(() => {
    if (!id) return
    getProjeto(id)
      .then((data) => {
        setProjeto(data)
        setEditForm(data)
        // SPEC-004: parcelas geradas por orçamento aprovado não entram no
        // editor manual — saveProjetoParcelas também bloqueia no banco.
        setEditParcelas((data.projeto_parcelas || []).filter((p) => !p.orcamento_id))
        setEditArquitetos(projetoArquitetosParaPicker(data))
        setSelectedResponsavelName(data.responsavel_funcionario?.nome || '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/projetos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Projetos
        </Button>
      </div>
    )
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(projeto)
      setEditParcelas((projeto.projeto_parcelas || []).filter((p) => !p.orcamento_id))
      setEditArquitetos(projetoArquitetosParaPicker(projeto))
      setSelectedResponsavelName(projeto.responsavel_funcionario?.nome || '')
    }
    setIsEditing(!isEditing)
  }

  const handleParcelaChange = (
    index: number,
    field: keyof Database['public']['Tables']['projeto_parcelas']['Row'],
    value: any,
  ) => {
    const newParcelas = [...editParcelas]
    newParcelas[index] = { ...newParcelas[index], [field]: value }
    setEditParcelas(newParcelas)
  }

  const handleAddParcela = () => {
    const maxNum = editParcelas.reduce((max, p) => Math.max(max, p.numero_parcela || 0), 0)
    setEditParcelas([
      ...editParcelas,
      {
        numero_parcela: maxNum + 1,
        valor: 1, // Start with 1 to avoid constraint error (valor > 0)
        status: 'pendente',
        juros: 0,
        multa: 0,
        desconto: 0,
      },
    ])
  }

  const handleRemoveParcela = (index: number) => {
    const newParcelas = [...editParcelas]
    newParcelas.splice(index, 1)
    setEditParcelas(newParcelas)
  }

  const handleSave = async () => {
    if (!projeto.id) return

    const projectStatus = editForm.status || projeto.status
    const hasNewParcelas = editParcelas.some((p) => !p.id)

    if (hasNewParcelas && projectStatus !== 'Ajustes finais' && projectStatus !== 'Finalizado') {
      toast({
        title: 'Ação não permitida',
        description:
          'Novas parcelas só podem ser adicionadas quando o projeto está em "Ajustes finais" ou "Finalizado".',
        variant: 'destructive',
      })
      return
    }

    for (const p of editParcelas) {
      if (!p.valor || p.valor <= 0) {
        toast({
          title: 'Valor inválido',
          description: `A parcela ${p.numero_parcela} precisa ter valor maior que 0.`,
          variant: 'destructive',
        })
        return
      }
      if (p.valor_pago !== null && p.valor_pago !== undefined && p.valor_pago < 0) {
        toast({
          title: 'Valor inválido',
          description: `O valor pago da parcela ${p.numero_parcela} não pode ser negativo.`,
          variant: 'destructive',
        })
        return
      }
      if ((p.juros && p.juros < 0) || (p.multa && p.multa < 0) || (p.desconto && p.desconto < 0)) {
        toast({
          title: 'Valor inválido',
          description: `Juros, multa e desconto não podem ser negativos na parcela ${p.numero_parcela}.`,
          variant: 'destructive',
        })
        return
      }
    }

    // SPEC-077: Responsável e ao menos 1 arquiteto passam a ser obrigatórios.
    if (!editForm.responsavel_funcionario_id) {
      toast({
        title: 'Responsável obrigatório',
        description: 'Selecione um responsável para o projeto.',
        variant: 'destructive',
      })
      return
    }
    if (editArquitetos.length === 0) {
      toast({
        title: 'Arquiteto obrigatório',
        description: 'Selecione pelo menos um arquiteto para o projeto.',
        variant: 'destructive',
      })
      return
    }
    const somaArquitetos = editArquitetos.reduce((acc, a) => acc + (Number(a.percentual) || 0), 0)
    if (Math.abs(somaArquitetos - 100) > 0.01) {
      toast({
        title: 'Percentuais inválidos',
        description: `A soma dos percentuais dos arquitetos deve ser 100% (atual: ${somaArquitetos.toFixed(2)}%).`,
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // SPEC-045: `link_sharepoint` existe na coluna real (migration
      // 20260724_061) mas ainda não está no types.ts gerado — usa `as any`
      // no payload em vez de tentar reescrever o arquivo de tipos inteiro
      // (mesmo padrão já usado em Index.tsx para `get_dashboard_stats`).
      const payload: Database['public']['Tables']['projetos']['Update'] & {
        link_sharepoint?: string | null
        responsavel_funcionario_id?: string | null
      } = {
        codigo: editForm.codigo,
        nome: editForm.nome,
        status: editForm.status,
        nivel_estrategico: editForm.nivel_estrategico,
        data_entrada: editForm.data_entrada || null,
        cidade: editForm.cidade,
        estado: editForm.estado,
        cliente_id: editForm.cliente_id,
        responsavel_obra_id: editForm.responsavel_obra_id,
        // SPEC-077: Responsável agora vem de funcionarios — responsavel_nome
        // continua sendo gravado junto (nome do funcionário escolhido) pra
        // não quebrar o trigger que deriva a equipe/comissão a partir dele.
        responsavel_funcionario_id: editForm.responsavel_funcionario_id,
        responsavel_nome: selectedResponsavelName || null,
        link_sharepoint: (editForm as any).link_sharepoint || null,
        // SPEC-064: rótulo Ribeirão/São Paulo, só visualização — independente
        // do perfil do cliente vinculado, sem herança automática.
        perfil: (editForm as any).perfil || null,
      }

      await updateProjetoById(projeto.id, payload as any)

      await replaceProjetoArquitetos(
        projeto.id,
        editArquitetos.map((a) => ({ arquiteto_id: a.arquiteto_id, percentual: a.percentual })),
      )

      const originalIds = projeto.projeto_parcelas?.map((p) => p.id) || []
      await saveProjetoParcelas(projeto.id, editParcelas, originalIds)

      const updated = await getProjeto(projeto.id)
      setProjeto(updated)
      setEditForm(updated)
      setEditParcelas(updated.projeto_parcelas || [])
      setEditArquitetos(projetoArquitetosParaPicker(updated))
      setSelectedResponsavelName(updated.responsavel_funcionario?.nome || '')
      setIsEditing(false)
      toast({ title: 'Projeto atualizado com sucesso' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Projeto, value: string | null) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveNewFuncionario = (funcionario: { id: string; nome: string }) => {
    handleChange('responsavel_funcionario_id' as keyof Projeto, funcionario.id)
    setSelectedResponsavelName(funcionario.nome)
    setEmployeeModalOpen(false)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR')
  }

  const formatQuantity = (val: number | null) => {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(Number(val) || 0)
  }

  const formatDiscount = (val: number | null) => {
    const discount = Number(val) || 0
    return discount > 0 ? `${formatQuantity(discount)}%` : '-'
  }

  const formatApprovedItemOrigin = (orcamentoId: string | null) => {
    if (!orcamentoId) return '-'
    return `Orçamento ${orcamentoId.slice(0, 8)}`
  }

  const renderApprovedItemStatus = (validado: boolean | null) => {
    if (validado === false) {
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-muted-foreground/30"
        >
          Cancelado
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Ativo
      </Badge>
    )
  }

  const clientes = contacts.filter((c) => c.tipo === 'cliente')
  const engenheiros = contacts.filter((c) => c.tipo === 'engenheiro')

  const valorTotal =
    projeto.projeto_parcelas?.reduce((acc, p) => {
      const v = Number(p.valor) || 0
      const j = Number(p.juros) || 0
      const m = Number(p.multa) || 0
      const d = Number(p.desconto) || 0
      return acc + v + j + m - d
    }, 0) ||
    Number(projeto.valor_total) ||
    0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projetos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <Input
                  value={editForm.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="h-10 text-2xl font-bold max-w-[400px]"
                />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight">
                  {projeto.nome || 'Projeto sem nome'}
                </h1>
              )}
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground font-medium">#</span>
                  <Input
                    value={editForm.codigo || ''}
                    onChange={(e) => handleChange('codigo', e.target.value.replace(/[^\d.]/g, ''))}
                    onBlur={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '')
                      if (onlyNumbers.length >= 3) {
                        handleChange('codigo', `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`)
                      }
                    }}
                    className="h-8 w-24 text-sm"
                  />
                </div>
              ) : (
                <Badge variant="secondary" className="text-sm">
                  #{projeto.codigo}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Visualizando detalhes completos do projeto</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => void openBudgetSystem(projeto.id)}>
                <Calculator className="mr-2 h-4 w-4" />
                Gerar Orçamento
              </Button>
              <Button onClick={handleEditToggle}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar Projeto
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Status</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.status || ''}
                    onValueChange={(v) => handleChange('status', v)}
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.projeto_status.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={projeto.status === 'Finalizado' ? 'default' : 'secondary'}>
                    {projeto.status || 'Não informado'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Nível Estratégico</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.nivel_estrategico || 'null'}
                    onValueChange={(v) =>
                      handleChange('nivel_estrategico', v === 'null' ? null : v)
                    }
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {Constants.public.Enums.projeto_nivel.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium">
                    {projeto.nivel_estrategico || 'Não informado'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Data de Entrada</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.data_entrada?.split('T')[0] || ''}
                    onChange={(e) => handleChange('data_entrada', e.target.value)}
                    className="h-8 max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(projeto.data_entrada)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Valor Fechado</span>
              <div className="w-2/3 flex justify-end">
                <span className="font-medium flex items-center gap-2 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(valorTotal)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Localização</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2 max-w-[250px]">
                    <Input
                      value={editForm.cidade || ''}
                      onChange={(e) => handleChange('cidade', e.target.value)}
                      className="h-8"
                      placeholder="Cidade"
                    />
                    <Input
                      value={editForm.estado || ''}
                      onChange={(e) => handleChange('estado', e.target.value)}
                      className="h-8 w-16"
                      placeholder="UF"
                    />
                  </div>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.cidade || '-'} / {projeto.estado || '-'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground w-1/3">Perfil</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={(editForm as any).perfil || 'null'}
                    onValueChange={(v) =>
                      handleChange('perfil' as keyof Projeto, v === 'null' ? null : v)
                    }
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Não informado</SelectItem>
                      <SelectItem value="ribeirao">Ribeirão</SelectItem>
                      <SelectItem value="sao_paulo">São Paulo</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium">
                    {(projeto as any).perfil === 'sao_paulo'
                      ? 'São Paulo'
                      : (projeto as any).perfil === 'ribeirao'
                        ? 'Ribeirão'
                        : 'Não informado'}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">
                Responsável <span className="text-destructive">*</span>
              </span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <div className="flex items-center gap-2 max-w-[280px]">
                    <Popover open={openResponsavel} onOpenChange={setOpenResponsavel}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={openResponsavel}
                          className={cn(
                            'flex-1 justify-between h-8 font-normal truncate',
                            !editForm.responsavel_funcionario_id && 'text-muted-foreground',
                          )}
                        >
                          <span className="truncate">
                            {editForm.responsavel_funcionario_id
                              ? selectedResponsavelName || 'Selecionado'
                              : 'Selecione'}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0" align="end">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Buscar funcionário..."
                            value={searchResponsavel}
                            onValueChange={setSearchResponsavel}
                          />
                          <CommandList>
                            <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                            <CommandGroup>
                              {dbFuncionarios.map((o) => (
                                <CommandItem
                                  value={o.id}
                                  key={o.id}
                                  onSelect={() => {
                                    handleChange('responsavel_funcionario_id' as keyof Projeto, o.id)
                                    setSelectedResponsavelName(o.nome)
                                    setOpenResponsavel(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      o.id === editForm.responsavel_funcionario_id
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {o.nome}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setOpenResponsavel(false)
                                  setEmployeeModalOpen(true)
                                }}
                                className="text-primary font-medium cursor-pointer"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Funcionário
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={() => setEmployeeModalOpen(true)}
                      title="Adicionar Novo Funcionário"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.responsavel_funcionario?.nome ||
                      projeto.responsavel_nome ||
                      'Não definido'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Cliente</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.cliente_id || 'null'}
                    onValueChange={(v) => handleChange('cliente_id', v === 'null' ? null : v)}
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.cliente?.nome ? (
                      <Link
                        to={`/contatos/clientes?view=${encodeURIComponent(projeto.cliente.nome)}`}
                        className="text-primary hover:underline"
                      >
                        {projeto.cliente.nome}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-start py-2 border-b">
              <span className="text-muted-foreground w-1/3 pt-2">
                Arquiteto(s) <span className="text-destructive">*</span>
              </span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <div className="w-full max-w-[280px]">
                    <ArchitectSplitPicker value={editArquitetos} onChange={setEditArquitetos} />
                  </div>
                ) : projeto.projeto_arquitetos && projeto.projeto_arquitetos.length > 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    {projeto.projeto_arquitetos.map(
                      (pa) =>
                        pa.arquiteto && (
                          <span
                            key={pa.arquiteto.id}
                            className="font-medium flex items-center gap-2 text-right"
                          >
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Link
                              to={`/contatos/arquitetos?view=${encodeURIComponent(pa.arquiteto.nome)}`}
                              className="text-primary hover:underline"
                            >
                              {pa.arquiteto.nome}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              ({Number(pa.percentual).toFixed(2)}%)
                            </span>
                          </span>
                        ),
                    )}
                  </div>
                ) : projeto.arquiteto?.nome ? (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Link
                      to={`/contatos/arquitetos?view=${encodeURIComponent(projeto.arquiteto.nome)}`}
                      className="text-primary hover:underline"
                    >
                      {projeto.arquiteto.nome}
                    </Link>
                  </span>
                ) : (
                  <span className="font-medium text-muted-foreground">Não definido</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground w-1/3">Engenheiro Responsável</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.responsavel_obra_id || 'null'}
                    onValueChange={(v) =>
                      handleChange('responsavel_obra_id', v === 'null' ? null : v)
                    }
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {engenheiros.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <HardHat className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.engenheiro?.nome ? (
                      <Link
                        to={`/contatos/engenheiros?view=${encodeURIComponent(projeto.engenheiro.nome)}`}
                        className="text-primary hover:underline"
                      >
                        {projeto.engenheiro.nome}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Link do SharePoint
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Input
                type="url"
                placeholder="https://lucenera.sharepoint.com/sites/..."
                value={(editForm as any).link_sharepoint || ''}
                onChange={(e) => handleChange('link_sharepoint' as keyof Projeto, e.target.value)}
              />
            ) : (projeto as any).link_sharepoint ? (
              <a
                href={(projeto as any).link_sharepoint}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir pasta do projeto no SharePoint
              </a>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum link do SharePoint cadastrado ainda.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Itens Aprovados do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projeto.projeto_itens && projeto.projeto_itens.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[220px]">Item</TableHead>
                      <TableHead className="min-w-[100px]">Qtd.</TableHead>
                      <TableHead className="min-w-[130px]">Preço Unit.</TableHead>
                      <TableHead className="min-w-[100px]">Desconto</TableHead>
                      <TableHead className="min-w-[130px]">Subtotal</TableHead>
                      <TableHead className="min-w-[150px]">Origem</TableHead>
                      <TableHead className="min-w-[120px]">Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...projeto.projeto_itens]
                      .sort((a, b) => (a.descricao || '').localeCompare(b.descricao || ''))
                      .map((item) => {
                        const subtotal =
                          item.subtotal ??
                          (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0)

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.descricao || 'Item sem descrição'}
                            </TableCell>
                            <TableCell>{formatQuantity(item.quantidade)}</TableCell>
                            <TableCell className="font-semibold text-emerald-600">
                              {formatCurrency(Number(item.preco_unitario))}
                            </TableCell>
                            <TableCell>{formatDiscount(item.desconto)}</TableCell>
                            <TableCell className="font-semibold text-emerald-600">
                              {formatCurrency(Number(subtotal))}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {formatApprovedItemOrigin(item.orcamento_id)}
                              </Badge>
                            </TableCell>
                            <TableCell>{renderApprovedItemStatus(item.validado)}</TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border rounded-md bg-muted/20">
                Nenhum item aprovado ainda.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Parcelas do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                {(projeto.projeto_parcelas || []).some((p) => p.orcamento_id) && (
                  <p className="text-xs text-muted-foreground">
                    Parcelas geradas por orçamento aprovado não aparecem aqui para edição — são
                    protegidas e ficam visíveis no modo de visualização.
                  </p>
                )}
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[60px]">Nº</TableHead>
                        <TableHead className="min-w-[100px]">Valor</TableHead>
                        <TableHead className="min-w-[130px]">Vencimento</TableHead>
                        <TableHead className="min-w-[140px]">Forma Pgto</TableHead>
                        <TableHead className="min-w-[120px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Valor Pago</TableHead>
                        <TableHead className="min-w-[130px]">Pagamento</TableHead>
                        <TableHead className="min-w-[80px]">Juros</TableHead>
                        <TableHead className="min-w-[80px]">Multa</TableHead>
                        <TableHead className="min-w-[80px]">Desc.</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editParcelas.map((p, index) => (
                        <TableRow key={p.id || index}>
                          <TableCell>
                            <Input
                              type="number"
                              value={p.numero_parcela || ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'numero_parcela',
                                  e.target.value ? parseInt(e.target.value) : null,
                                )
                              }
                              className="w-14 h-8 px-2"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={p.valor || ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'valor',
                                  e.target.value ? parseFloat(e.target.value) : null,
                                )
                              }
                              className="w-full h-8 px-2"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={p.data_vencimento || ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'data_vencimento',
                                  e.target.value || null,
                                )
                              }
                              className="w-full h-8 px-2"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={p.forma_pagamento || 'null'}
                              onValueChange={(v) =>
                                handleParcelaChange(
                                  index,
                                  'forma_pagamento',
                                  v === 'null' ? null : v,
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-full px-2 text-xs">
                                <SelectValue placeholder="Forma" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="null">Nenhuma</SelectItem>
                                {Constants.public.Enums.pagamento_forma.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={p.status || 'pendente'}
                              onValueChange={(v) => handleParcelaChange(index, 'status', v)}
                            >
                              <SelectTrigger className="h-8 w-full px-2 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Constants.public.Enums.parcela_status.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={p.valor_pago ?? ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'valor_pago',
                                  e.target.value ? parseFloat(e.target.value) : null,
                                )
                              }
                              className="w-full h-8 px-2"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={p.data_pagamento || ''}
                              onChange={(e) =>
                                handleParcelaChange(index, 'data_pagamento', e.target.value || null)
                              }
                              className="w-full h-8 px-2"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={p.juros ?? ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'juros',
                                  e.target.value ? parseFloat(e.target.value) : 0,
                                )
                              }
                              className="w-full h-8 px-2"
                              placeholder="Juros"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={p.multa ?? ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'multa',
                                  e.target.value ? parseFloat(e.target.value) : 0,
                                )
                              }
                              className="w-full h-8 px-2"
                              placeholder="Multa"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={p.desconto ?? ''}
                              onChange={(e) =>
                                handleParcelaChange(
                                  index,
                                  'desconto',
                                  e.target.value ? parseFloat(e.target.value) : 0,
                                )
                              }
                              className="w-full h-8 px-2"
                              placeholder="Desc."
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveParcela(index)}
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddParcela}>
                  Adicionar Parcela
                </Button>
              </div>
            ) : projeto.projeto_parcelas && projeto.projeto_parcelas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[60px]">Nº</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Forma Pgto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Pago</TableHead>
                      <TableHead>Adicionais</TableHead>
                      <TableHead className="text-right">Pagamento</TableHead>
                      <TableHead>Origem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...projeto.projeto_parcelas]
                      .sort((a, b) => a.numero_parcela - b.numero_parcela)
                      .map((p) => {
                        const hasAdicionais =
                          Number(p.juros) > 0 || Number(p.multa) > 0 || Number(p.desconto) > 0
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.numero_parcela}</TableCell>
                            <TableCell className="font-semibold text-emerald-600">
                              {formatCurrency(Number(p.valor))}
                            </TableCell>
                            <TableCell>{formatDate(p.data_vencimento)}</TableCell>
                            <TableCell className="capitalize">{p.forma_pagamento || '-'}</TableCell>
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
                              {p.valor_pago !== null ? formatCurrency(Number(p.valor_pago)) : '-'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {hasAdicionais ? (
                                <div className="flex flex-col gap-0.5">
                                  {Number(p.juros) > 0 && (
                                    <span>Juros: {formatCurrency(Number(p.juros))}</span>
                                  )}
                                  {Number(p.multa) > 0 && (
                                    <span>Multa: {formatCurrency(Number(p.multa))}</span>
                                  )}
                                  {Number(p.desconto) > 0 && (
                                    <span className="text-red-500">
                                      Desc: -{formatCurrency(Number(p.desconto))}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatDate(p.data_pagamento)}
                            </TableCell>
                            <TableCell>
                              {p.orcamento_id ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  Orçamento aprovado
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Manual</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>{' '}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border rounded-md bg-muted/20">
                Nenhuma parcela cadastrada para este projeto.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewEmployeeModal
        open={employeeModalOpen}
        onOpenChange={setEmployeeModalOpen}
        onSuccess={handleSaveNewFuncionario}
      />
    </div>
  )
}
