import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  UserCircle,
  FolderKanban,
  Loader2,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'
import { LayoutGrid, List } from 'lucide-react'
import { useViewMode } from '@/hooks/use-view-mode'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ContatoRow = Database['public']['Tables']['contatos']['Row']

const clientSchema = z.object({
  nome: z.string().trim().min(2, 'Nome é obrigatório'),
  nome_empresa: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  email: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido'),
  email_financeiro: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido'),
  telefone: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  celular: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  cpf_cnpj: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  rg: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  endereco: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  bairro: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  cep: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  cidade: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  estado: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  ativo: z.boolean().default(true),
})

type ClientFormValues = z.infer<typeof clientSchema>

const STATUS_STAGES = [
  'Estudo Inicial',
  'Elaboração Orçamento',
  'Proposta Sinal',
  'Projeto executivo',
  'Entrega materiais',
  'Ajustes finais',
  'Finalizado',
  'Arquivado',
]

export default function Clientes() {
  const [clients, setClients] = useState<ContatoRow[]>([])
  const [loading, setLoading] = useState(true)

  const [searchName, setSearchName] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [searchStatus, setSearchStatus] = useState('all')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)

  const [editingClient, setEditingClient] = useState<ContatoRow | null>(null)
  const [selectedClient, setSelectedClient] = useState<ContatoRow | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ContatoRow | null>(null)

  const [clientProjects, setClientProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [cameFromView, setCameFromView] = useState(false)
  const { user } = useAuth()
  const [viewMode, setViewMode] = useViewMode('clientes', 'cards')

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome: '',
      nome_empresa: '',
      email: '',
      email_financeiro: '',
      telefone: '',
      celular: '',
      cpf_cnpj: '',
      rg: '',
      endereco: '',
      bairro: '',
      cep: '',
      cidade: '',
      estado: '',
      observacoes: '',
      ativo: true,
    },
  })

  useEffect(() => {
    fetchClients()

    const channel = supabase
      .channel('contatos_clientes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos', filter: 'tipo=eq.cliente' },
        () => {
          fetchClients()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (selectedClient && isViewDrawerOpen) {
      fetchClientProjects(selectedClient.id)
    }
  }, [selectedClient, isViewDrawerOpen])

  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && clients.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = clients.find((c) => c.nome?.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = clients.find((c) => c.nome?.toLowerCase().includes(normalizedView))
      }

      if (match) {
        setSelectedClient(match)
        setIsViewDrawerOpen(true)
        setCameFromView(true)
      } else {
        setSearchName(viewName)
      }

      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, clients, setSearchParams])

  const fetchClients = async () => {
    if (clients.length === 0) setLoading(true)
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('tipo', 'cliente')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (error) {
      toast({
        title: 'Erro ao buscar clientes',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  const fetchClientProjects = async (clientId: string) => {
    setLoadingProjects(true)
    const { data, error } = await supabase
      .from('projetos')
      .select('*, responsavel:responsavel_id(nome)')
      .eq('cliente_id', clientId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setClientProjects(data)
    }
    setLoadingProjects(false)
  }

  const filteredClients = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    const sName = normalize(searchName.trim())
    const sCity = normalize(searchCity.trim())

    return clients.filter((c) => {
      const matchName =
        !sName ||
        normalize(c.nome || '').includes(sName) ||
        normalize(c.nome_empresa || '').includes(sName)
      const matchCity = !sCity || normalize(c.cidade || '').includes(sCity)
      const matchStatus =
        searchStatus === 'all' ||
        (searchStatus === 'ativo' && c.ativo !== false) ||
        (searchStatus === 'inativo' && c.ativo === false)

      return matchName && matchCity && matchStatus
    })
  }, [clients, searchName, searchCity, searchStatus])

  const groupedProjects = useMemo(() => {
    return clientProjects.reduce(
      (acc, project) => {
        const status = project.status || 'Outros'
        if (!acc[status]) acc[status] = []
        acc[status].push(project)
        return acc
      },
      {} as Record<string, any[]>,
    )
  }, [clientProjects])

  const onSubmit = async (values: ClientFormValues) => {
    if (editingClient?.id) {
      const { error } = await supabase.from('contatos').update(values).eq('id', editingClient.id)

      if (error) {
        if (error.code === '23505' && error.message.includes('cpf_cnpj')) {
          toast({
            title: 'Erro ao atualizar',
            description: 'Já existe um cadastro com este CPF/CNPJ.',
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
        }
      } else {
        toast({ title: 'Cliente atualizado com sucesso' })
        setIsEditModalOpen(false)

        if (selectedClient?.id === editingClient.id) {
          setSelectedClient({ ...selectedClient, ...values })
        }
        fetchClients()
      }
    } else {
      const { error } = await supabase
        .from('contatos')
        .insert([{ ...values, tipo: 'cliente', created_by: user?.id }])

      if (error) {
        if (error.code === '23505' && error.message.includes('cpf_cnpj')) {
          toast({
            title: 'Erro ao criar',
            description: 'Já existe um cadastro com este CPF/CNPJ.',
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
        }
      } else {
        toast({ title: 'Cliente adicionado com sucesso' })
        setIsEditModalOpen(false)
        fetchClients()
      }
    }
  }

  const handleFormError = (errors: any) => {
    console.error('Erros de validação do formulário:', errors)
    toast({
      title: 'Erro de validação',
      description: 'Verifique os campos obrigatórios e tente novamente.',
      variant: 'destructive',
    })
  }

  const handleDelete = async () => {
    if (clientToDelete && clientToDelete.id) {
      const { error } = await supabase.from('contatos').delete().eq('id', clientToDelete.id)

      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Cliente excluído com sucesso' })
        if (selectedClient?.id === clientToDelete.id) {
          setIsViewDrawerOpen(false)
        }
        fetchClients()
      }
      setClientToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingClient(null)
    form.reset({
      nome: '',
      nome_empresa: '',
      email: '',
      email_financeiro: '',
      telefone: '',
      celular: '',
      cpf_cnpj: '',
      rg: '',
      endereco: '',
      bairro: '',
      cep: '',
      cidade: '',
      estado: '',
      observacoes: '',
      ativo: true,
    })
    setIsEditModalOpen(true)
  }

  const openEditModal = (client: ContatoRow) => {
    setEditingClient(client)
    form.reset({
      nome: client.nome || '',
      nome_empresa: client.nome_empresa || '',
      email: client.email || '',
      email_financeiro: client.email_financeiro || '',
      telefone: client.telefone || '',
      celular: client.celular || '',
      cpf_cnpj: client.cpf_cnpj || '',
      rg: client.rg || '',
      endereco: client.endereco || '',
      bairro: client.bairro || '',
      cep: client.cep || '',
      cidade: client.cidade || '',
      estado: client.estado || '',
      observacoes: client.observacoes || '',
      ativo: client.ativo !== false,
    })
    setIsEditModalOpen(true)
  }

  const openViewDrawer = (client: ContatoRow) => {
    setSelectedClient(client)
    setIsViewDrawerOpen(true)
    setCameFromView(false)
  }

  const handleCloseViewDrawer = (open: boolean) => {
    if (!open) {
      setIsViewDrawerOpen(false)
      if (cameFromView) {
        navigate(-1)
      }
    } else {
      setIsViewDrawerOpen(true)
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão visual do portfólio de clientes e empresas do sistema.
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
            <Plus className="mr-2 h-5 w-5" /> NOVO CLIENTE
          </Button>
        </div>
      </div>

      <div className="bg-card p-5 rounded-xl border shadow-sm space-y-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filtros Dinâmicos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou empresa..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 bg-background transition-all"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por cidade..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-9 bg-background transition-all"
            />
          </div>
          <Select value={searchStatus} onValueChange={setSearchStatus}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && clients.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Carregando carteira de clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed">
          <UserCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground mt-1">
            Ajuste os filtros ou cadastre um novo cliente.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchName('')
              setSearchCity('')
              setSearchStatus('all')
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 flex flex-col animate-fade-in"
              onClick={() => openViewDrawer(client)}
            >
              <CardHeader className="pb-3 relative">
                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(client)
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
                      setClientToDelete(client)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex justify-between items-start pt-1">
                  <div className="pr-16">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {client.nome}
                    </CardTitle>
                    {client.nome_empresa && (
                      <CardDescription className="text-sm font-medium mt-1 line-clamp-1">
                        {client.nome_empresa}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <Badge
                    variant={client.ativo !== false ? 'default' : 'secondary'}
                    className={
                      client.ativo !== false
                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                        : ''
                    }
                  >
                    {client.ativo !== false ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground pt-2">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {(client.celular || client.telefone) && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{client.celular || client.telefone}</span>
                  </div>
                )}
                {(client.cidade || client.estado) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {[client.cidade, client.estado].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t bg-slate-50/50">
                <Button
                  variant="default"
                  className="w-full shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    openViewDrawer(client)
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
        <div className="rounded-md border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nome / Empresa</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Localização</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openViewDrawer(client)}
                >
                  <TableCell>
                    <div className="font-medium text-foreground">{client.nome}</div>
                    {client.nome_empresa && (
                      <div className="text-sm text-muted-foreground">{client.nome_empresa}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />{' '}
                          <span className="truncate max-w-[200px]">{client.email}</span>
                        </div>
                      )}
                      {(client.celular || client.telefone) && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />{' '}
                          <span>{client.celular || client.telefone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {[client.cidade, client.estado].filter(Boolean).join(' - ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={client.ativo !== false ? 'default' : 'secondary'}
                      className={
                        client.ativo !== false
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : ''
                      }
                    >
                      {client.ativo !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(client)}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setClientToDelete(client)}
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

      {/* Edit/New Client Form Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="space-y-4">
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
                        <Input placeholder="Nome completo" {...field} value={field.value || ''} />
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
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Razão Social ou Fantasia"
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
                  name="email_financeiro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail Financeiro</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="financeiro@exemplo.com"
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
                  name="cpf_cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="Documento" {...field} value={field.value || ''} />
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
                        <Input
                          placeholder="SP"
                          maxLength={2}
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
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} value={field.value || ''} />
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
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, Número, Complemento"
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
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Observações adicionais"
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
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Status de Atividade</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === 'true')}
                        value={field.value ? 'true' : 'false'}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Ativo</SelectItem>
                          <SelectItem value="false">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Drawer Details Client */}
      <Sheet open={isViewDrawerOpen} onOpenChange={handleCloseViewDrawer}>
        <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto bg-slate-50 p-0 border-l shadow-2xl">
          <div className="bg-white p-6 border-b sticky top-0 z-20 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                  {selectedClient?.nome}
                  <Badge
                    variant={selectedClient?.ativo !== false ? 'default' : 'secondary'}
                    className={
                      selectedClient?.ativo !== false
                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200'
                        : ''
                    }
                  >
                    {selectedClient?.ativo !== false ? 'Ativo' : 'Inativo'}
                  </Badge>
                </SheetTitle>
                {selectedClient?.nome_empresa && (
                  <SheetDescription className="mt-1 text-base text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {selectedClient.nome_empresa}
                  </SheetDescription>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEditModal(selectedClient!)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Editar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="projetos" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="projetos">Projetos do Cliente</TabsTrigger>
                <TabsTrigger value="detalhes">Dados de Contato</TabsTrigger>
              </TabsList>

              <TabsContent
                value="projetos"
                className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
              >
                {loadingProjects ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center bg-white rounded-xl border shadow-sm">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    Buscando projetos...
                  </div>
                ) : clientProjects.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-xl border border-dashed shadow-sm">
                    <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground">
                      Nenhum projeto encontrado
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Este cliente ainda não possui projetos vinculados em nenhuma etapa.
                    </p>
                  </div>
                ) : (
                  <Accordion
                    type="multiple"
                    defaultValue={[
                      'Estudo Inicial',
                      'Elaboração Orçamento',
                      'Proposta Sinal',
                      'Projeto executivo',
                      'Em Andamento',
                    ]}
                    className="space-y-4"
                  >
                    {STATUS_STAGES.filter((stage) => groupedProjects[stage]?.length > 0).map(
                      (stage) => (
                        <AccordionItem
                          key={stage}
                          value={stage}
                          className="bg-white border rounded-xl overflow-hidden shadow-sm"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-semibold text-base text-foreground">
                                {stage}
                              </span>
                              <Badge variant="secondary" className="rounded-full bg-slate-100">
                                {groupedProjects[stage].length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {groupedProjects[stage].map((project) => (
                                <div
                                  key={project.id}
                                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50 hover:bg-slate-50 shadow-sm"
                                  onClick={() => navigate(`/projeto/${project.id}`)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4
                                      className="font-semibold text-foreground line-clamp-1"
                                      title={project.nome}
                                    >
                                      {project.nome}
                                    </h4>
                                    <span className="text-xs font-mono bg-white border px-2 py-1 rounded text-muted-foreground shadow-sm shrink-0 ml-2">
                                      {project.codigo}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                                    <UserCircle className="h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                      {project.responsavel?.nome || 'Sem responsável atribuído'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                    <span className="text-sm font-semibold text-foreground">
                                      {project.valor_total
                                        ? new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                          }).format(project.valor_total)
                                        : '-'}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal bg-white"
                                    >
                                      {project.forma_pagamento || 'Pendente'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ),
                    )}
                    {/* Render 'Outros' status if any */}
                    {groupedProjects['Outros']?.length > 0 && (
                      <AccordionItem
                        value="Outros"
                        className="bg-white border rounded-xl overflow-hidden shadow-sm"
                      >
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold text-base text-foreground">
                              Outros Status
                            </span>
                            <Badge variant="secondary" className="rounded-full bg-slate-100">
                              {groupedProjects['Outros'].length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {groupedProjects['Outros'].map((project) => (
                              <div
                                key={project.id}
                                className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50 hover:bg-slate-50 shadow-sm"
                                onClick={() => navigate(`/projeto/${project.id}`)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4
                                    className="font-semibold text-foreground line-clamp-1"
                                    title={project.nome}
                                  >
                                    {project.nome}
                                  </h4>
                                  <span className="text-xs font-mono bg-white border px-2 py-1 rounded text-muted-foreground shadow-sm">
                                    {project.codigo}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                  <span className="text-sm font-semibold text-foreground">
                                    {project.valor_total
                                      ? new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                        }).format(project.valor_total)
                                      : '-'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent
                value="detalhes"
                className="bg-white rounded-xl border shadow-sm p-6 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">CPF / CNPJ</h4>
                    <p className="text-foreground font-medium">{selectedClient?.cpf_cnpj || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">RG</h4>
                    <p className="text-foreground font-medium">{selectedClient?.rg || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> E-mail Principal
                    </h4>
                    <p className="text-foreground">
                      {selectedClient?.email ? (
                        <a
                          href={`mailto:${selectedClient.email}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {selectedClient.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" /> E-mail Financeiro
                    </h4>
                    <p className="text-foreground">
                      {selectedClient?.email_financeiro ? (
                        <a
                          href={`mailto:${selectedClient.email_financeiro}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {selectedClient.email_financeiro}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Celular
                    </h4>
                    <p className="text-foreground">
                      {selectedClient?.celular ? (
                        <a
                          href={`tel:${selectedClient?.celular}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {selectedClient?.celular}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" /> Telefone Fixo
                    </h4>
                    <p className="text-foreground font-medium">{selectedClient?.telefone || '-'}</p>
                  </div>

                  <div className="sm:col-span-2 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Localização e Endereço
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <div className="sm:col-span-2 lg:col-span-4">
                        <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                          Endereço Completo
                        </span>
                        <span className="text-sm font-medium">
                          {selectedClient?.endereco || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                          Bairro
                        </span>
                        <span className="text-sm font-medium">{selectedClient?.bairro || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                          Cidade / UF
                        </span>
                        <span className="text-sm font-medium">
                          {[selectedClient?.cidade, selectedClient?.estado]
                            .filter(Boolean)
                            .join(' - ') || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                          CEP
                        </span>
                        <span className="text-sm font-medium">{selectedClient?.cep || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                      Observações Internas
                    </h4>
                    <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 text-sm text-foreground min-h-[100px] whitespace-pre-wrap leading-relaxed shadow-inner">
                      {selectedClient?.observacoes || (
                        <span className="text-muted-foreground italic">
                          Nenhuma observação registrada para este cliente.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente{' '}
              <span className="font-bold text-foreground">"{clientToDelete?.nome}"</span>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
