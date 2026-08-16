import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useViewMode } from '@/hooks/use-view-mode'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LayoutGrid, List, Mail, Phone, MapPin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRef } from 'react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useCepLookup, useCnpjLookup } from '@/hooks/use-document-lookup'

type ContatoRow = Database['public']['Tables']['contatos']['Row']

// Pedido do usuário (2026-08-16): este modal (o de verdade usado ao clicar
// "NOVO ENGENHEIRO" na listagem — diferente do cadastro rápido dentro de
// Novo Projeto, em NewContactModal.tsx) tinha só nome/especialidade/
// contato/empresa/endereço-livre. Precisa de CPF/CNPJ com busca automática
// (mesmo padrão de Cliente) e endereço estruturado. `endereco_comercial`
// sai deste formulário (substituído pelos campos novos), mas continua
// existindo na tabela e em ContatoDetail.tsx pra não perder o dado dos
// engenheiros já cadastrados — ver fallback em `enderecoExibicao` abaixo.
const engineerSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  especialidade: z.string().optional().nullable(),
  email: z
    .string()
    .email('Email inválido')
    .or(z.literal('').or(z.null()))
    .transform((v) => v || null),
  telefone: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  nome_empresa: z.string().optional().nullable(),
  cpf_cnpj: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
})

type EngineerFormValues = z.infer<typeof engineerSchema>

const ENGINEER_FORM_DEFAULTS: EngineerFormValues = {
  nome: '',
  especialidade: '',
  email: '',
  telefone: '',
  celular: '',
  nome_empresa: '',
  cpf_cnpj: '',
  rg: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
}

const enderecoExibicao = (engineer: ContatoRow) => engineer.endereco || engineer.endereco_comercial

const ENGINEER_TYPES = [
  'Civil',
  'Elétrica',
  'Mecânica',
  'Automação',
  'Computação',
  'Hidráulica',
  'Outros',
]

export default function Engenheiros() {
  const [engineers, setEngineers] = useState<ContatoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [engineerToDelete, setEngineerToDelete] = useState<string | null>(null)
  // Pessoas da empresa adicionadas já na criação do engenheiro — buffer
  // local, só viram registros em `contatos` (com empresa_id apontando pra
  // empresa recém-criada) no submit. Mesmo padrão de Arquitetos.tsx.
  const [novasPessoas, setNovasPessoas] = useState<
    { nome: string; data_nascimento: string; email: string; cpf_cnpj: string; endereco: string }[]
  >([])

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useViewMode('engenheiros', 'cards')

  const form = useForm<EngineerFormValues>({
    resolver: zodResolver(engineerSchema),
    defaultValues: ENGINEER_FORM_DEFAULTS,
  })

  const { buscar: buscarCep, loading: loadingCep } = useCepLookup()
  const { buscar: buscarCnpj, loading: loadingCnpj } = useCnpjLookup()
  const numeroRef = useRef<HTMLInputElement>(null)

  const buscarEnderecoPorCep = (cepValue: string) => {
    buscarCep(
      cepValue,
      (endereco) => {
        form.setValue('endereco', endereco.logradouro, { shouldDirty: true })
        form.setValue('bairro', endereco.bairro, { shouldDirty: true })
        form.setValue('cidade', endereco.cidade, { shouldDirty: true })
        form.setValue('estado', endereco.uf, { shouldDirty: true })
        numeroRef.current?.focus()
      },
      (message) => toast({ title: 'CEP', description: message }),
    )
  }

  const buscarDadosPorCnpj = (cpfCnpjValue: string) => {
    buscarCnpj(
      cpfCnpjValue,
      (dados) => {
        if (!form.getValues('nome')) form.setValue('nome', dados.razaoSocial, { shouldDirty: true })
        if (!form.getValues('nome_empresa'))
          form.setValue('nome_empresa', dados.nomeFantasia, { shouldDirty: true })
        if (dados.logradouro && !form.getValues('endereco'))
          form.setValue('endereco', dados.logradouro, { shouldDirty: true })
        if (dados.bairro && !form.getValues('bairro'))
          form.setValue('bairro', dados.bairro, { shouldDirty: true })
        if (dados.cidade && !form.getValues('cidade'))
          form.setValue('cidade', dados.cidade, { shouldDirty: true })
        if (dados.uf && !form.getValues('estado'))
          form.setValue('estado', dados.uf, { shouldDirty: true })
        if (dados.cep && !form.getValues('cep'))
          form.setValue('cep', dados.cep, { shouldDirty: true })
      },
      (message) => toast({ title: 'CNPJ', description: message }),
    )
  }

  const fetchEngineers = async () => {
    setLoading(true)
    // Registros com empresa_id preenchido são "pessoas" vinculadas a uma
    // empresa de engenharia (ver ContatoDetail.tsx) — não aparecem soltos
    // nesta listagem, só dentro da página cheia da empresa. Mesmo padrão
    // já usado em Arquitetos.tsx.
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('tipo', 'engenheiro')
      .is('empresa_id', null)
      .order('nome')
    if (error) {
      toast({
        title: 'Erro ao buscar engenheiros',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setEngineers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEngineers()

    const channel = supabase
      .channel('contatos_engenheiros')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos', filter: 'tipo=eq.engenheiro' },
        () => {
          fetchEngineers()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // SPEC-044: o deep-link ?view=Nome navega direto para a página cheia.
  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && engineers.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = engineers.find((e) => e.nome.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = engineers.find((e) => e.nome.toLowerCase().includes(normalizedView))
      }

      if (match) {
        navigate(`/contatos/engenheiros/${match.id}`, { replace: true })
        return
      }

      setSearch(viewName)
      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, engineers, setSearchParams, navigate])

  const filteredEngineers = useMemo(() => {
    return engineers.filter((e) => {
      const q = search.toLowerCase()
      return (
        e.nome.toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.nome_empresa || '').toLowerCase().includes(q) ||
        (e.especialidade || '').toLowerCase().includes(q)
      )
    })
  }, [engineers, search])

  const onSubmit = async (values: EngineerFormValues) => {
    // Pessoas adicionadas no formulário de criação são validadas e
    // inseridas junto, vinculadas via empresa_id ao engenheiro recém-criado
    // — depois navega direto pra página cheia dele. Mesmo padrão de
    // Arquitetos.tsx.
    if (novasPessoas.some((p) => !p.nome.trim())) {
      toast({
        title: 'Nome obrigatório',
        description:
          'Preencha o nome de todas as pessoas adicionadas, ou remova a linha em branco.',
        variant: 'destructive',
      })
      return
    }

    const { data, error } = await supabase
      .from('contatos')
      .insert([{ ...values, tipo: 'engenheiro' }])
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
      return
    }

    const pessoasValidas = novasPessoas.filter((p) => p.nome.trim())
    if (pessoasValidas.length > 0 && data?.id) {
      const { error: pessoasError } = await supabase.from('contatos').insert(
        pessoasValidas.map((p) => ({
          tipo: 'engenheiro',
          empresa_id: data.id,
          nome: p.nome.trim(),
          data_nascimento: p.data_nascimento || null,
          email: p.email || null,
          cpf_cnpj: p.cpf_cnpj || null,
          endereco: p.endereco || null,
          ativo: true,
        })),
      )
      if (pessoasError) {
        toast({
          title: 'Engenheiro criado, mas houve erro ao salvar as pessoas',
          description: pessoasError.message,
          variant: 'destructive',
        })
      }
    }

    toast({ title: 'Engenheiro adicionado com sucesso' })
    setIsModalOpen(false)
    if (data?.id) {
      navigate(`/contatos/engenheiros/${data.id}`)
    } else {
      fetchEngineers()
    }
  }

  const handleDelete = async () => {
    if (engineerToDelete) {
      const { error } = await supabase.from('contatos').delete().eq('id', engineerToDelete)
      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Engenheiro excluído com sucesso' })
        fetchEngineers()
      }
      setEngineerToDelete(null)
    }
  }

  const openNewModal = () => {
    form.reset(ENGINEER_FORM_DEFAULTS)
    setNovasPessoas([])
    setIsModalOpen(true)
  }

  const viewEngineer = (engineer: ContatoRow) => {
    navigate(`/contatos/engenheiros/${engineer.id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Engenheiros</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão do portfólio de parceiros e engenheiros técnicos.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto flex-col sm:flex-row">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto">
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'cards'
                  ? 'bg-white shadow-sm flex-1 sm:flex-none'
                  : 'flex-1 sm:flex-none'
              }
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'table'
                  ? 'bg-white shadow-sm flex-1 sm:flex-none'
                  : 'flex-1 sm:flex-none'
              }
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-2" /> Planilha
            </Button>
          </div>
          <Button
            onClick={openNewModal}
            className="w-full sm:w-auto shadow-elevation h-11"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" /> NOVO ENGENHEIRO
          </Button>
        </div>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, empresa, tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            Carregando engenheiros...
          </div>
        ) : filteredEngineers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed">
            <h3 className="text-lg font-medium text-foreground">Nenhum engenheiro encontrado</h3>
            <p className="text-muted-foreground mt-1">
              Ajuste os filtros ou cadastre um novo engenheiro.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEngineers.map((engineer) => (
              <Card
                key={engineer.id}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 flex flex-col animate-fade-in"
                onClick={() => viewEngineer(engineer)}
              >
                <CardHeader className="pb-3 relative">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        viewEngineer(engineer)
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEngineerToDelete(engineer.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="pr-16">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {engineer.nome}
                    </CardTitle>
                    {engineer.nome_empresa && (
                      <CardDescription className="text-sm font-medium mt-1 line-clamp-1">
                        {engineer.nome_empresa}
                      </CardDescription>
                    )}
                    {engineer.especialidade && (
                      <div className="text-xs font-semibold text-primary mt-1">
                        {engineer.especialidade}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground pt-2">
                  {engineer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{engineer.email}</span>
                    </div>
                  )}
                  {(engineer.celular || engineer.telefone) && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{engineer.celular || engineer.telefone}</span>
                    </div>
                  )}
                  {enderecoExibicao(engineer) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{enderecoExibicao(engineer)}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3 border-t bg-slate-50/50">
                  <Button
                    variant="default"
                    className="w-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      viewEngineer(engineer)
                    }}
                  >
                    Ver Detalhes
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border bg-card overflow-hidden shadow-subtle animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Especialidade</TableHead>
                  <TableHead className="font-semibold">Empresa</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">
                    End. Comercial
                  </TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEngineers.map((engineer) => (
                  <TableRow
                    key={engineer.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => viewEngineer(engineer)}
                  >
                    <TableCell className="font-medium text-foreground">{engineer.nome}</TableCell>
                    <TableCell>{engineer.especialidade || '-'}</TableCell>
                    <TableCell>{engineer.nome_empresa || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {engineer.celular || engineer.telefone || '-'}
                        </span>
                        {engineer.email && (
                          <span className="text-xs text-muted-foreground">{engineer.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell max-w-[200px] truncate"
                      title={enderecoExibicao(engineer) || ''}
                    >
                      {enderecoExibicao(engineer) || '-'}
                    </TableCell>
                    <TableCell
                      className="text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewEngineer(engineer)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewEngineer(engineer)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEngineerToDelete(engineer.id)}
                        title="Excluir"
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Novo Engenheiro — SPEC-044: edição agora acontece na página cheia (/contatos/engenheiros/:id) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Engenheiro</DialogTitle>
            <DialogDescription>
              Preencha os dados do engenheiro para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nome <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="especialidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ENGINEER_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Fixo</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 0000-0000" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nome_empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa / Escritório</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do escritório"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf_cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        CPF / CNPJ
                        {loadingCnpj && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Buscando...
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Documento"
                          {...field}
                          value={field.value || ''}
                          disabled={loadingCnpj}
                          onChange={(e) => {
                            field.onChange(e)
                            buscarDadosPorCnpj(e.target.value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="RG" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        CEP
                        {loadingCep && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Buscando...
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          {...field}
                          value={field.value || ''}
                          disabled={loadingCep}
                          onChange={(e) => {
                            field.onChange(e)
                            buscarEnderecoPorCep(e.target.value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número"
                          {...field}
                          value={field.value || ''}
                          ref={(el) => {
                            field.ref(el)
                            ;(numeroRef as React.MutableRefObject<HTMLInputElement | null>).current =
                              el
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF)</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" maxLength={2} {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Sala, Andar..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-semibold">Pessoas da Empresa (opcional)</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Se este cadastro representa um escritório com mais de um engenheiro,
                      adicione cada pessoa aqui (nome, data de nascimento, e-mail e CPF/CNPJ
                      individual). O vínculo do projeto continua sempre com a empresa, não com a
                      pessoa.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      setNovasPessoas([
                        ...novasPessoas,
                        { nome: '', data_nascimento: '', email: '', cpf_cnpj: '', endereco: '' },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pessoa
                  </Button>
                </div>

                {novasPessoas.length > 0 && (
                  <div className="space-y-2">
                    {novasPessoas.map((p, idx) => (
                      <div key={idx} className="border rounded-md p-3 bg-muted/30 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                            <Input
                              placeholder="Nome *"
                              value={p.nome}
                              onChange={(e) => {
                                const arr = [...novasPessoas]
                                arr[idx] = { ...arr[idx], nome: e.target.value }
                                setNovasPessoas(arr)
                              }}
                              className="h-9"
                            />
                            <Input
                              type="date"
                              value={p.data_nascimento}
                              onChange={(e) => {
                                const arr = [...novasPessoas]
                                arr[idx] = { ...arr[idx], data_nascimento: e.target.value }
                                setNovasPessoas(arr)
                              }}
                              className="h-9"
                            />
                            <Input
                              type="email"
                              placeholder="E-mail"
                              value={p.email}
                              onChange={(e) => {
                                const arr = [...novasPessoas]
                                arr[idx] = { ...arr[idx], email: e.target.value }
                                setNovasPessoas(arr)
                              }}
                              className="h-9"
                            />
                            <Input
                              placeholder="CPF / CNPJ"
                              value={p.cpf_cnpj}
                              onChange={(e) => {
                                const arr = [...novasPessoas]
                                arr[idx] = { ...arr[idx], cpf_cnpj: e.target.value }
                                setNovasPessoas(arr)
                              }}
                              className="h-9"
                            />
                            <Input
                              placeholder="Endereço"
                              value={p.endereco}
                              onChange={(e) => {
                                const arr = [...novasPessoas]
                                arr[idx] = { ...arr[idx], endereco: e.target.value }
                                setNovasPessoas(arr)
                              }}
                              className="h-9 sm:col-span-2"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setNovasPessoas(novasPessoas.filter((_, i) => i !== idx))
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Engenheiro</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!engineerToDelete}
        onOpenChange={(open) => !open && setEngineerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Engenheiro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este engenheiro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
