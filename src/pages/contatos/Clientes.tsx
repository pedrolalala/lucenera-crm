import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'

type ContatoRow = Database['public']['Tables']['contatos']['Row']

const clientSchema = z.object({
  nome: z.string().trim().min(2, 'Nome é obrigatório'),
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
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function Clientes() {
  const [clients, setClients] = useState<ContatoRow[]>([])
  const [loading, setLoading] = useState(true)

  const [searchName, setSearchName] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [searchState, setSearchState] = useState('')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [editingClient, setEditingClient] = useState<ContatoRow | null>(null)
  const [selectedClient, setSelectedClient] = useState<ContatoRow | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ContatoRow | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [cameFromView, setCameFromView] = useState(false)
  const { user } = useAuth()

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome: '',
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
    const viewName = searchParams.get('view')
    if (viewName && clients.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = clients.find((c) => c.nome?.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = clients.find((c) => c.nome?.toLowerCase().includes(normalizedView))
      }

      if (match) {
        setSelectedClient(match)
        setIsViewModalOpen(true)
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

  const filteredClients = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    const sName = normalize(searchName.trim())
    const sCity = normalize(searchCity.trim())
    const sState = normalize(searchState.trim())

    return clients.filter((c) => {
      const matchName = !sName || normalize(c.nome || '').includes(sName)
      const matchCity = !sCity || normalize(c.cidade || '').includes(sCity)
      const matchState = !sState || normalize(c.estado || '').includes(sState)
      return matchName && matchCity && matchState
    })
  }, [clients, searchName, searchCity, searchState])

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
        fetchClients()
      }
    } else {
      const { error } = await supabase
        .from('contatos')
        .insert([{ ...values, tipo: 'cliente', ativo: true, created_by: user?.id }])

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
        fetchClients()
      }
      setClientToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingClient(null)
    form.reset({
      nome: '',
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
    })
    setIsEditModalOpen(true)
  }

  const openEditModal = (client: ContatoRow) => {
    setEditingClient(client)
    form.reset({
      nome: client.nome || '',
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
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (client: ContatoRow) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
    setCameFromView(false)
  }

  const handleCloseViewModal = (open: boolean) => {
    if (!open) {
      setIsViewModalOpen(false)
      if (cameFromView) {
        navigate(-1)
      }
    } else {
      setIsViewModalOpen(true)
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão do portfólio de clientes e empresas do sistema.
          </p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto shadow-elevation h-11" size="lg">
          <Plus className="mr-2 h-5 w-5" /> NOVO CLIENTE
        </Button>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por cidade..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por estado (UF)..."
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Cidade</TableHead>
                <TableHead className="font-semibold">UF</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <TableRow
                    key={client.id || index}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => openViewModal(client)}
                  >
                    <TableCell className="font-medium text-foreground">{client.nome}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {client.celular || client.telefone || '-'}
                    </TableCell>
                    <TableCell>{client.cidade || '-'}</TableCell>
                    <TableCell>{client.estado || '-'}</TableCell>
                    <TableCell
                      className="text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openViewModal(client)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
                    <FormItem className="sm:col-span-2">
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

      <Dialog open={isViewModalOpen} onOpenChange={handleCloseViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>Informações completas do registro</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 py-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Nome</h4>
                <p className="text-foreground">{selectedClient.nome || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">CPF / CNPJ</h4>
                <p className="text-foreground">{selectedClient.cpf_cnpj || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">E-mail</h4>
                <p className="text-foreground">{selectedClient.email || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">E-mail Financeiro</h4>
                <p className="text-foreground">{selectedClient.email_financeiro || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Celular</h4>
                <p className="text-foreground">{selectedClient.celular || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Telefone Fixo</h4>
                <p className="text-foreground">{selectedClient.telefone || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Endereço</h4>
                <p className="text-foreground">{selectedClient.endereco || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Bairro</h4>
                <p className="text-foreground">{selectedClient.bairro || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">CEP</h4>
                <p className="text-foreground">{selectedClient.cep || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Cidade</h4>
                <p className="text-foreground">{selectedClient.cidade || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Estado (UF)</h4>
                <p className="text-foreground">{selectedClient.estado || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Observações</h4>
                <p className="text-foreground whitespace-pre-wrap bg-muted/30 p-2 rounded min-h-12">
                  {selectedClient.observacoes || '-'}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => handleCloseViewModal(false)}>
              Fechar
            </Button>
          </div>
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
              Tem certeza que deseja excluir o cliente "{clientToDelete?.nome}"? Esta ação não pode
              ser desfeita.
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
