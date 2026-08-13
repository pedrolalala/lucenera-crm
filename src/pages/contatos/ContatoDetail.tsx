import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Edit2, Save, X, Loader2, Plus, Trash2 } from 'lucide-react'

type ContatoRow = Database['public']['Tables']['contatos']['Row']
type TipoContato = 'cliente' | 'arquiteto' | 'engenheiro' | 'eletricista' | 'fornecedor'

type FieldType = 'text' | 'email' | 'date' | 'textarea' | 'boolean' | 'select'

interface FieldConfig {
  key: keyof ContatoRow
  label: string
  type?: FieldType
  span?: 1 | 2
  required?: boolean
  options?: { value: string; label: string }[]
}

// SPEC-052 (achado 2026-08-04): opções confirmadas por print do sistema de
// referência do usuário — "Tipo Cliente", distinto de "Regime Apuração".
const TIPO_CLIENTE_OPTIONS = [
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'nao_contribuinte', label: 'Não Contribuinte' },
  { value: 'industria', label: 'Indústria' },
  { value: 'revendedor', label: 'Revendedor' },
]

// SPEC-052: opções confirmadas pelo usuário em 2026-08-04.
const REGIME_APURACAO_OPTIONS = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'regime_normal', label: 'Regime Normal' },
]

// SPEC-064: rótulo puramente informativo (Lucenera abrindo filial em São
// Paulo) — não influencia nenhuma regra de negócio, cálculo ou permissão.
const PERFIL_OPTIONS = [
  { value: 'ribeirao', label: 'Ribeirão' },
  { value: 'sao_paulo', label: 'São Paulo' },
]

const PLURAL_TO_TIPO: Record<string, TipoContato> = {
  clientes: 'cliente',
  arquitetos: 'arquiteto',
  engenheiros: 'engenheiro',
  eletricistas: 'eletricista',
  fornecedores: 'fornecedor',
}

const LIST_ROUTES: Record<TipoContato, string> = {
  cliente: '/contatos/clientes',
  arquiteto: '/contatos/arquitetos',
  engenheiro: '/contatos/engenheiros',
  eletricista: '/contatos/eletricistas',
  fornecedor: '/contatos/fornecedores',
}

const TITLES: Record<TipoContato, string> = {
  cliente: 'Cliente',
  arquiteto: 'Arquiteto',
  engenheiro: 'Engenheiro',
  eletricista: 'Eletricista',
  fornecedor: 'Fornecedor',
}

// Tipos que suportam "Pessoas da Empresa" (múltiplas pessoas/CPF-CNPJ
// vinculadas ao mesmo cadastro, via empresa_id) — pedido do usuário pra
// igualar o comportamento de Engenheiro ao de Arquiteto (2026-08-11).
const TIPOS_COM_PESSOAS: TipoContato[] = ['arquiteto', 'engenheiro']

// SPEC-044: campos completos por tipo de contato. `data_nascimento` e o
// status `ativo` já existem em `contatos` mas não apareciam em nenhum
// formulário de edição antes desta SPEC.
const FIELD_CONFIGS: Record<TipoContato, FieldConfig[]> = {
  cliente: [
    { key: 'nome', label: 'Nome e Razão Social', required: true },
    { key: 'nome_empresa', label: 'Nome Fantasia' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'email_financeiro', label: 'E-mail Financeiro', type: 'email' },
    { key: 'celular', label: 'Celular' },
    { key: 'telefone', label: 'Telefone Fixo' },
    { key: 'cpf_cnpj', label: 'CPF / CNPJ' },
    // SPEC-096: Tipo Cliente sobe pra logo após CPF/CNPJ; RG e Inscrição
    // Estadual ficam adjacentes no grid de 2 colunas (antes o Tipo Cliente
    // entrava entre os dois, quebrando o pareamento visual).
    { key: 'tipo_cliente', label: 'Tipo Cliente', type: 'select', options: TIPO_CLIENTE_OPTIONS },
    { key: 'rg', label: 'RG' },
    { key: 'inscricao_estadual', label: 'Inscrição Estadual' },
    {
      key: 'regime_apuracao',
      label: 'Regime de Apuração',
      type: 'select',
      options: REGIME_APURACAO_OPTIONS,
    },
    // SPEC-064: perfil Ribeirão/São Paulo, só visualização.
    { key: 'perfil', label: 'Perfil', type: 'select', options: PERFIL_OPTIONS },
    { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado (UF)' },
    { key: 'cep', label: 'CEP' },
    { key: 'bairro', label: 'Bairro' },
    { key: 'endereco', label: 'Endereço', span: 2 },
    // SPEC-052: endereços de entrega e cobrança, distintos do principal.
    { key: 'cep_entrega', label: 'CEP (Entrega)' },
    { key: 'numero_entrega', label: 'Número (Entrega)' },
    { key: 'bairro_entrega', label: 'Bairro (Entrega)' },
    { key: 'cidade_entrega', label: 'Cidade (Entrega)' },
    { key: 'estado_entrega', label: 'Estado (Entrega)' },
    { key: 'endereco_entrega', label: 'Endereço de Entrega', span: 2 },
    { key: 'cep_cobranca', label: 'CEP (Cobrança)' },
    { key: 'numero_cobranca', label: 'Número (Cobrança)' },
    { key: 'bairro_cobranca', label: 'Bairro (Cobrança)' },
    { key: 'cidade_cobranca', label: 'Cidade (Cobrança)' },
    { key: 'estado_cobranca', label: 'Estado (Cobrança)' },
    { key: 'endereco_cobranca', label: 'Endereço de Cobrança', span: 2 },
    { key: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    { key: 'ativo', label: 'Status', type: 'boolean' },
  ],
  arquiteto: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'nome_empresa', label: 'Empresa / Escritório' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'celular', label: 'Celular' },
    { key: 'telefone', label: 'Telefone Fixo' },
    { key: 'cpf_cnpj', label: 'CPF / CNPJ' },
    { key: 'rg', label: 'RG' },
    { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado (UF)' },
    { key: 'endereco', label: 'Endereço', span: 2 },
    { key: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    { key: 'ativo', label: 'Status', type: 'boolean' },
  ],
  engenheiro: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'especialidade', label: 'Especialidade' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'celular', label: 'Celular' },
    { key: 'telefone', label: 'Telefone Fixo' },
    { key: 'nome_empresa', label: 'Empresa / Escritório' },
    { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
    { key: 'endereco_comercial', label: 'Endereço Comercial', span: 2 },
    { key: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    { key: 'ativo', label: 'Status', type: 'boolean' },
  ],
  eletricista: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'celular', label: 'Celular' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado (UF)' },
    { key: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    { key: 'ativo', label: 'Status', type: 'boolean' },
  ],
  // Fornecedor usa `cnpj`/`razao_social`, mesmos campos dos 357 fornecedores
  // já existentes (importação Connect) e da criação rápida em
  // cadastro-lucenera (SPEC-053) — não usa `cpf_cnpj` como os outros tipos.
  fornecedor: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'razao_social', label: 'Razão Social' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'celular', label: 'Celular' },
    { key: 'telefone', label: 'Telefone Fixo' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado (UF)' },
    { key: 'cep', label: 'CEP' },
    { key: 'bairro', label: 'Bairro' },
    { key: 'endereco', label: 'Endereço', span: 2 },
    { key: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    { key: 'ativo', label: 'Status', type: 'boolean' },
  ],
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const raw = String(dateStr).split('T')[0]
  const d = new Date(`${raw}T00:00:00`)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR')
}

export default function ContatoDetail() {
  const { tipoPlural, id } = useParams<{ tipoPlural: string; id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const tipo = tipoPlural ? PLURAL_TO_TIPO[tipoPlural] : undefined
  const fields = tipo ? FIELD_CONFIGS[tipo] : []

  const [contato, setContato] = useState<ContatoRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ContatoRow>>({})

  const [pessoas, setPessoas] = useState<ContatoRow[]>([])
  const [loadingPessoas, setLoadingPessoas] = useState(false)
  const [addingPessoa, setAddingPessoa] = useState(false)
  const [savingPessoa, setSavingPessoa] = useState(false)
  const [novaPessoa, setNovaPessoa] = useState({
    nome: '',
    data_nascimento: '',
    email: '',
    cpf_cnpj: '',
    endereco: '',
  })
  const [pessoaToDelete, setPessoaToDelete] = useState<ContatoRow | null>(null)

  // Pedido do usuário (2026-08-11): Engenheiro deve ter a mesma opção de
  // "Pessoas da Empresa" que Arquiteto já tinha (SPEC-044) — generalizado
  // de "só arquiteto" pra qualquer tipo em TIPOS_COM_PESSOAS.
  const showPessoasSection =
    !!tipo && TIPOS_COM_PESSOAS.includes(tipo) && !!contato && !contato.empresa_id

  const fetchContato = async () => {
    if (!id) return
    setLoading(true)
    const { data, error } = await supabase.from('contatos').select('*').eq('id', id).single()
    if (error) {
      toast({
        title: 'Erro ao carregar contato',
        description: error.message,
        variant: 'destructive',
      })
      setContato(null)
    } else {
      setContato(data)
      setEditForm(data)
    }
    setLoading(false)
  }

  const fetchPessoas = async (empresaId: string, tipoPessoa: TipoContato) => {
    setLoadingPessoas(true)
    const { data } = await supabase
      .from('contatos')
      .select('*')
      .eq('tipo', tipoPessoa)
      .eq('empresa_id', empresaId)
      .order('nome')
    setPessoas(data || [])
    setLoadingPessoas(false)
  }

  useEffect(() => {
    fetchContato()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoPlural, id])

  useEffect(() => {
    if (contato && tipo && TIPOS_COM_PESSOAS.includes(tipo) && !contato.empresa_id) {
      fetchPessoas(contato.id, tipo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contato?.id, contato?.empresa_id, tipo])

  if (!tipo) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Tipo de contato inválido.</p>
        <Button variant="outline" onClick={() => navigate('/contatos/clientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contato) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Contato não encontrado.</p>
        <Button variant="outline" onClick={() => navigate(LIST_ROUTES[tipo])}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para {TITLES[tipo]}s
        </Button>
      </div>
    )
  }

  const handleChange = (key: keyof ContatoRow, value: any) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  // SPEC-052: busca automática de CEP (ViaCEP) e CNPJ (BrasilAPI), mesmo
  // padrão usado em ClientFormFields/ClientCreateModal. `suffix` seleciona
  // qual bloco de endereço preencher ('' = principal, '_entrega', '_cobranca').
  const buscarEnderecoPorCep = async (cepValue: string, suffix: '' | '_entrega' | '_cobranca') => {
    const digits = (cepValue || '').replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await response.json()
      if (!data || data.erro) {
        toast({ title: 'CEP não encontrado', description: 'Preencha o endereço manualmente.' })
        return
      }
      handleChange(`endereco${suffix}` as keyof ContatoRow, data.logradouro || '')
      handleChange(`bairro${suffix}` as keyof ContatoRow, data.bairro || '')
      handleChange(`cidade${suffix}` as keyof ContatoRow, data.localidade || '')
      handleChange(`estado${suffix}` as keyof ContatoRow, (data.uf || '').toUpperCase())
    } catch {
      toast({
        title: 'Não foi possível consultar o CEP',
        description: 'Verifique sua conexão. Você pode preencher o endereço manualmente.',
      })
    }
  }

  const buscarDadosPorCnpj = async (cpfCnpjValue: string) => {
    const digits = (cpfCnpjValue || '').replace(/\D/g, '')
    if (digits.length !== 14) return
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      if (!response.ok) {
        toast({ title: 'CNPJ não encontrado', description: 'Preencha os dados manualmente.' })
        return
      }
      const data = await response.json()
      if (!editForm.nome) handleChange('nome', data.razao_social || '')
      if (!editForm.nome_empresa)
        handleChange('nome_empresa', data.nome_fantasia || data.razao_social || '')
    } catch {
      toast({
        title: 'Não foi possível consultar o CNPJ',
        description: 'Verifique sua conexão. Você pode preencher os dados manualmente.',
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm(contato)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!editForm.nome || !String(editForm.nome).trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, any> = {}
      fields.forEach((f) => {
        payload[f.key as string] = (editForm as any)[f.key] ?? null
      })

      const { error } = await supabase.from('contatos').update(payload).eq('id', contato.id)

      if (error) {
        if (error.code === '23505' && error.message.includes('cpf_cnpj')) {
          toast({
            title: 'Erro ao salvar',
            description: 'Já existe um cadastro com este CPF/CNPJ.',
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
        }
        return
      }

      toast({ title: `${TITLES[tipo]} atualizado com sucesso` })
      setIsEditing(false)
      await fetchContato()
    } finally {
      setSaving(false)
    }
  }

  const handleAddPessoa = async () => {
    if (!novaPessoa.nome.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    setSavingPessoa(true)
    try {
      const { error } = await supabase.from('contatos').insert({
        tipo,
        empresa_id: contato.id,
        nome: novaPessoa.nome.trim(),
        data_nascimento: novaPessoa.data_nascimento || null,
        email: novaPessoa.email || null,
        cpf_cnpj: novaPessoa.cpf_cnpj || null,
        endereco: novaPessoa.endereco || null,
        ativo: true,
      } as any)

      if (error) throw error

      toast({ title: 'Pessoa adicionada com sucesso' })
      setNovaPessoa({ nome: '', data_nascimento: '', email: '', cpf_cnpj: '', endereco: '' })
      setAddingPessoa(false)
      await fetchPessoas(contato.id, tipo)
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar pessoa', description: err.message, variant: 'destructive' })
    } finally {
      setSavingPessoa(false)
    }
  }

  const handleDeletePessoa = async () => {
    if (!pessoaToDelete) return
    const { error } = await supabase.from('contatos').delete().eq('id', pessoaToDelete.id)
    if (error) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Pessoa removida' })
      await fetchPessoas(contato.id, tipo)
    }
    setPessoaToDelete(null)
  }

  const renderFieldEdit = (f: FieldConfig) => {
    const value = (editForm as any)[f.key]

    if (f.type === 'boolean') {
      return (
        <Select
          value={value === false ? 'false' : 'true'}
          onValueChange={(v) => handleChange(f.key, v === 'true')}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (f.type === 'select' && f.options) {
      return (
        <Select value={value || ''} onValueChange={(v) => handleChange(f.key, v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (f.type === 'textarea') {
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => handleChange(f.key, e.target.value)}
          rows={3}
        />
      )
    }

    if (f.type === 'date') {
      return (
        <Input
          type="date"
          value={value ? String(value).split('T')[0] : ''}
          onChange={(e) => handleChange(f.key, e.target.value || null)}
          className="h-9"
        />
      )
    }

    if (f.key === 'cep' || f.key === 'cep_entrega' || f.key === 'cep_cobranca') {
      const suffix = f.key === 'cep' ? '' : f.key === 'cep_entrega' ? '_entrega' : '_cobranca'
      return (
        <Input
          placeholder="00000-000"
          maxLength={9}
          value={value || ''}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '')
            const formatted = digits.replace(/(\d{5})(\d)/, '$1-$2')
            handleChange(f.key, formatted)
            buscarEnderecoPorCep(formatted, suffix)
          }}
          className="h-9"
        />
      )
    }

    if (f.key === 'cpf_cnpj') {
      return (
        <Input
          value={value || ''}
          onChange={(e) => {
            handleChange(f.key, e.target.value)
            buscarDadosPorCnpj(e.target.value)
          }}
          className="h-9"
        />
      )
    }

    return (
      <Input
        type={f.type === 'email' ? 'email' : 'text'}
        value={value || ''}
        onChange={(e) => handleChange(f.key, e.target.value)}
        className="h-9"
      />
    )
  }

  const renderFieldView = (f: FieldConfig) => {
    const value = (contato as any)[f.key]

    if (f.type === 'boolean') {
      return (
        <Badge variant={value !== false ? 'default' : 'secondary'}>
          {value !== false ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    }

    if (f.type === 'select') {
      const opt = f.options?.find((o) => o.value === value)
      return <span className="font-medium">{opt?.label || value || '-'}</span>
    }

    if (f.type === 'date') {
      return <span className="font-medium">{formatDate(value)}</span>
    }

    return <span className="font-medium break-words">{value || '-'}</span>
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(LIST_ROUTES[tipo])}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contato.nome || 'Sem nome'}</h1>
            <p className="text-muted-foreground mt-1">
              {TITLES[tipo]} · {contato.nome_empresa || 'Cadastro completo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
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
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {fields.map((f) => (
              <div
                key={String(f.key)}
                className={f.span === 2 ? 'sm:col-span-2 space-y-1.5' : 'space-y-1.5'}
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </span>
                {isEditing ? renderFieldEdit(f) : <div>{renderFieldView(f)}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showPessoasSection && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Pessoas da Empresa</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAddingPessoa(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pessoa
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground -mt-2">
              Pessoas vinculadas a esta empresa não aparecem na listagem de {TITLES[tipo]}s nem
              nos campos de seleção de {TITLES[tipo].toLowerCase()} do projeto — o vínculo do
              projeto continua sempre com a empresa, para não fragmentar a comissão.
            </p>

            {loadingPessoas ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : pessoas.length === 0 && !addingPessoa ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhuma pessoa cadastrada para esta empresa ainda.
              </p>
            ) : (
              <div className="rounded-md border divide-y">
                {pessoas.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3">
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => navigate(`${LIST_ROUTES[tipo]}/${p.id}`)}
                    >
                      <div className="font-medium">{p.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(p.data_nascimento)}
                        {p.email ? ` · ${p.email}` : ''}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPessoaToDelete(p)}
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {addingPessoa && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-md bg-muted/30">
                <Input
                  placeholder="Nome *"
                  value={novaPessoa.nome}
                  onChange={(e) => setNovaPessoa({ ...novaPessoa, nome: e.target.value })}
                />
                <Input
                  type="date"
                  value={novaPessoa.data_nascimento}
                  onChange={(e) =>
                    setNovaPessoa({ ...novaPessoa, data_nascimento: e.target.value })
                  }
                />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={novaPessoa.email}
                  onChange={(e) => setNovaPessoa({ ...novaPessoa, email: e.target.value })}
                />
                <Input
                  placeholder="CPF / CNPJ"
                  value={novaPessoa.cpf_cnpj}
                  onChange={(e) => setNovaPessoa({ ...novaPessoa, cpf_cnpj: e.target.value })}
                />
                <Input
                  placeholder="Endereço"
                  value={novaPessoa.endereco}
                  onChange={(e) => setNovaPessoa({ ...novaPessoa, endereco: e.target.value })}
                  className="sm:col-span-2"
                />
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddingPessoa(false)
                      setNovaPessoa({
                        nome: '',
                        data_nascimento: '',
                        email: '',
                        cpf_cnpj: '',
                        endereco: '',
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleAddPessoa} disabled={savingPessoa}>
                    {savingPessoa ? 'Salvando...' : 'Salvar Pessoa'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!pessoaToDelete}
        onOpenChange={(open) => !open && setPessoaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Pessoa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{' '}
              <span className="font-bold text-foreground">"{pessoaToDelete?.nome}"</span>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeletePessoa}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
