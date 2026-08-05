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
  Loader2,
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
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'
import {
  clientSchema,
  clientFormDefaultValues,
  ClientFormFields,
  type ClientFormValues,
} from '@/components/ClientFormFields'
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

export default function Clientes() {
  const [clients, setClients] = useState<ContatoRow[]>([])
  const [loading, setLoading] = useState(true)

  const [searchName, setSearchName] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [searchStatus, setSearchStatus] = useState('all')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<ContatoRow | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useViewMode('clientes', 'cards')

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: clientFormDefaultValues,
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

  // SPEC-044: o deep-link ?view=Nome (usado por links vindos de ProjectDetail)
  // agora navega direto para a página cheia do cliente em vez de abrir um
  // card/drawer lateral.
  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && clients.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = clients.find((c) => c.nome?.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = clients.find((c) => c.nome?.toLowerCase().includes(normalizedView))
      }

      if (match) {
        navigate(`/contatos/clientes/${match.id}`, { replace: true })
        return
      }

      setSearchName(viewName)
      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, clients, setSearchParams, navigate])

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

  const filteredClients = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
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

  const onSubmit = async (values: ClientFormValues) => {
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
      setIsNewModalOpen(false)
      fetchClients()
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
        fetchClients()
      }
      setClientToDelete(null)
    }
  }

  const openNewModal = () => {
    form.reset(clientFormDefaultValues)
    setIsNewModalOpen(true)
  }

  const viewClient = (client: ContatoRow) => {
    navigate(`/contatos/clientes/${client.id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
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
              onClick={() => viewClient(client)}
            >
              <CardHeader className="pb-3 relative">
                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      viewClient(client)
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
                    viewClient(client)
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
                  onClick={() => viewClient(client)}
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
                      onClick={() => viewClient(client)}
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

      {/* New Client Form Modal — SPEC-044: edição agora acontece na página cheia (/contatos/clientes/:id) */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="space-y-4">
              <ClientFormFields form={form} />
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Cliente</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
