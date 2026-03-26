import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
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
import { toast } from '@/hooks/use-toast'

const clientSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  company: z.string(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  address: z.string(),
  type: z.enum(['Pessoa Física', 'Pessoa Jurídica']),
})

type ClientFormValues = z.infer<typeof clientSchema>

interface Client extends ClientFormValues {
  id: string
}

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 99999-9999',
    company: 'Construtora Silva',
    city: 'São Paulo',
    address: 'Av Paulista, 1000',
    type: 'Pessoa Jurídica',
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@exemplo.com',
    phone: '(16) 98888-8888',
    company: '',
    city: 'Ribeirão Preto',
    address: 'Rua das Flores, 123',
    type: 'Pessoa Física',
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'carlos@santosarq.com',
    phone: '(21) 97777-7777',
    company: 'Santos Arquitetura',
    city: 'Rio de Janeiro',
    address: 'Av das Américas, 500',
    type: 'Pessoa Jurídica',
  },
]

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      city: '',
      address: '',
      type: 'Pessoa Física',
    },
  })

  useEffect(() => {
    if (editingClient) {
      form.reset(editingClient)
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        city: '',
        address: '',
        type: 'Pessoa Física',
      })
    }
  }, [editingClient, form, isModalOpen])

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      )
    })
  }, [clients, search])

  const onSubmit = (values: ClientFormValues) => {
    if (editingClient) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? { ...values, id: c.id } : c)),
      )
      toast({ title: 'Cliente atualizado com sucesso' })
    } else {
      const newClient = { ...values, id: Math.random().toString(36).substr(2, 9) }
      setClients((prev) => [newClient, ...prev])
      toast({ title: 'Cliente adicionado com sucesso' })
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (clientToDelete) {
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete))
      toast({ title: 'Cliente excluído com sucesso' })
      setClientToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingClient(null)
    setIsModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão do portfólio de clientes e empresas.
          </p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto shadow-elevation h-11" size="lg">
          <Plus className="mr-2 h-5 w-5" /> NOVO CLIENTE
        </Button>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, empresa, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>

        <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Cidade</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                  <TableCell>{client.company || '-'}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{client.phone}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
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
                      onClick={() => setClientToDelete(client.id)}
                      title="Excluir"
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de Cliente <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                          <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
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
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Telefone <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Complemento, Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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
