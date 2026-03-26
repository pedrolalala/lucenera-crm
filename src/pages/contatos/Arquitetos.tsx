import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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
  FormDescription,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/hooks/use-toast'

const architectSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  company: z.string(),
  commercialAddress: z.string(),
  residentialAddress: z.string(),
  isPartner: z.boolean().default(false),
})

type ArchitectFormValues = z.infer<typeof architectSchema>

interface Architect extends ArchitectFormValues {
  id: string
}

const MOCK_ARCHITECTS: Architect[] = [
  {
    id: '1',
    name: 'Flávia Camargo',
    specialty: 'Interiores / Residencial',
    email: 'flavia@camargoarq.com.br',
    phone: '(16) 99999-1111',
    company: 'Camargo Arquitetura',
    commercialAddress: 'Av. Wladimir Meirelles, 1500 - Ribeirão Preto',
    residentialAddress: '',
    isPartner: true,
  },
  {
    id: '2',
    name: 'Morize Carvalho',
    specialty: 'Corporativo',
    email: 'contato@morize.arq.br',
    phone: '(16) 98888-2222',
    company: 'Morize Projetos',
    commercialAddress: 'Rua João Penteado, 300 - Ribeirão Preto',
    residentialAddress: 'Cond. Ipê Branco',
    isPartner: true,
  },
  {
    id: '3',
    name: 'João Silva',
    specialty: 'Paisagismo',
    email: 'joao@silvapaisagismo.com',
    phone: '(11) 97777-3333',
    company: 'Silva Paisagismo',
    commercialAddress: 'Av. Paulista, 1000 - São Paulo',
    residentialAddress: '',
    isPartner: false,
  },
]

export default function Arquitetos() {
  const [architects, setArchitects] = useState<Architect[]>(MOCK_ARCHITECTS)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArchitect, setEditingArchitect] = useState<Architect | null>(null)
  const [architectToDelete, setArchitectToDelete] = useState<string | null>(null)

  const form = useForm<ArchitectFormValues>({
    resolver: zodResolver(architectSchema),
    defaultValues: {
      name: '',
      specialty: '',
      email: '',
      phone: '',
      company: '',
      commercialAddress: '',
      residentialAddress: '',
      isPartner: false,
    },
  })

  useEffect(() => {
    if (editingArchitect) {
      form.reset(editingArchitect)
    } else {
      form.reset({
        name: '',
        specialty: '',
        email: '',
        phone: '',
        company: '',
        commercialAddress: '',
        residentialAddress: '',
        isPartner: false,
      })
    }
  }, [editingArchitect, form, isModalOpen])

  const filteredArchitects = useMemo(() => {
    return architects.filter((a) => {
      const q = search.toLowerCase()
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.specialty.toLowerCase().includes(q)
      )
    })
  }, [architects, search])

  const onSubmit = (values: ArchitectFormValues) => {
    if (editingArchitect) {
      setArchitects((prev) =>
        prev.map((a) => (a.id === editingArchitect.id ? { ...values, id: a.id } : a)),
      )
      toast({ title: 'Arquiteto atualizado com sucesso' })
    } else {
      const newArchitect = { ...values, id: Math.random().toString(36).substr(2, 9) }
      setArchitects((prev) => [newArchitect, ...prev])
      toast({ title: 'Arquiteto adicionado com sucesso' })
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (architectToDelete) {
      setArchitects((prev) => prev.filter((a) => a.id !== architectToDelete))
      toast({ title: 'Arquiteto excluído com sucesso' })
      setArchitectToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingArchitect(null)
    setIsModalOpen(true)
  }

  const openEditModal = (architect: Architect) => {
    setEditingArchitect(architect)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Arquitetos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão do portfólio de parceiros e arquitetos.
          </p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto shadow-elevation h-11" size="lg">
          <Plus className="mr-2 h-5 w-5" /> NOVO ARQUITETO
        </Button>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, empresa, especialidade..."
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
                <TableHead className="font-semibold">Especialidade</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">End. Comercial</TableHead>
                <TableHead className="text-center font-semibold">Parceiro?</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArchitects.map((architect) => (
                <TableRow key={architect.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{architect.name}</TableCell>
                  <TableCell>{architect.specialty}</TableCell>
                  <TableCell>{architect.company || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm">{architect.phone}</span>
                      {architect.email && (
                        <span className="text-xs text-muted-foreground">{architect.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="hidden lg:table-cell max-w-[200px] truncate"
                    title={architect.commercialAddress}
                  >
                    {architect.commercialAddress || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {architect.isPartner ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Sim
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        <XCircle className="mr-1 h-3 w-3" /> Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(architect)}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setArchitectToDelete(architect.id)}
                      title="Excluir"
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredArchitects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum arquiteto encontrado.
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
            <DialogTitle>{editingArchitect ? 'Editar Arquiteto' : 'Novo Arquiteto'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do arquiteto para adicioná-lo ao sistema.
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
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Especialidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Interiores, Corporativo..." {...field} />
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
                      <FormLabel>Empresa / Escritório</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do escritório (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPartner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base cursor-pointer">É parceiro?</FormLabel>
                        <FormDescription className="text-xs">
                          Identifica parceria ativa com a Lucenera
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commercialAddress"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço Comercial</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Complemento, Bairro, Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="residentialAddress"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço Residencial</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Complemento, Bairro, Cidade" {...field} />
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
                  {editingArchitect ? 'Salvar Alterações' : 'Criar Arquiteto'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!architectToDelete}
        onOpenChange={(open) => !open && setArchitectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Arquiteto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este arquiteto? Esta ação não pode ser desfeita.
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
