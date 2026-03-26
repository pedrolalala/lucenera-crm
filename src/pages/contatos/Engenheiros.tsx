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

const engineerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo de engenharia é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  company: z.string(),
  commercialAddress: z.string(),
})

type EngineerFormValues = z.infer<typeof engineerSchema>

interface Engineer extends EngineerFormValues {
  id: string
}

const MOCK_ENGINEERS: Engineer[] = [
  {
    id: '1',
    name: 'Carlos Alberto',
    type: 'Civil',
    email: 'carlos@construtora.com',
    phone: '(11) 98888-7777',
    company: 'Construtora Alfa',
    commercialAddress: 'Av. Paulista, 1000 - São Paulo',
  },
  {
    id: '2',
    name: 'Marcos Vinicius',
    type: 'Elétrica',
    email: 'marcos.eletrica@exemplo.com',
    phone: '(16) 97777-6666',
    company: 'MV Elétrica',
    commercialAddress: 'Rua das Indústrias, 500 - Ribeirão Preto',
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    type: 'Automação',
    email: 'fernanda@automacao.br',
    phone: '(21) 99999-5555',
    company: 'SmartHomes',
    commercialAddress: 'Av. das Américas, 2000 - Rio de Janeiro',
  },
]

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
  const [engineers, setEngineers] = useState<Engineer[]>(MOCK_ENGINEERS)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [engineerToDelete, setEngineerToDelete] = useState<string | null>(null)

  const form = useForm<EngineerFormValues>({
    resolver: zodResolver(engineerSchema),
    defaultValues: {
      name: '',
      type: '',
      email: '',
      phone: '',
      company: '',
      commercialAddress: '',
    },
  })

  useEffect(() => {
    if (editingEngineer) {
      form.reset(editingEngineer)
    } else {
      form.reset({
        name: '',
        type: '',
        email: '',
        phone: '',
        company: '',
        commercialAddress: '',
      })
    }
  }, [editingEngineer, form, isModalOpen])

  const filteredEngineers = useMemo(() => {
    return engineers.filter((e) => {
      const q = search.toLowerCase()
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      )
    })
  }, [engineers, search])

  const onSubmit = (values: EngineerFormValues) => {
    if (editingEngineer) {
      setEngineers((prev) =>
        prev.map((e) => (e.id === editingEngineer.id ? { ...values, id: e.id } : e)),
      )
      toast({ title: 'Engenheiro atualizado com sucesso' })
    } else {
      const newEngineer = { ...values, id: Math.random().toString(36).substring(2, 9) }
      setEngineers((prev) => [newEngineer, ...prev])
      toast({ title: 'Engenheiro adicionado com sucesso' })
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (engineerToDelete) {
      setEngineers((prev) => prev.filter((e) => e.id !== engineerToDelete))
      toast({ title: 'Engenheiro excluído com sucesso' })
      setEngineerToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingEngineer(null)
    setIsModalOpen(true)
  }

  const openEditModal = (engineer: Engineer) => {
    setEditingEngineer(engineer)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Engenheiros</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão do portfólio de parceiros e engenheiros técnicos.
          </p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto shadow-elevation h-11" size="lg">
          <Plus className="mr-2 h-5 w-5" /> NOVO ENGENHEIRO
        </Button>
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

        <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Tipo / Especialidade</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">End. Comercial</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEngineers.map((engineer) => (
                <TableRow key={engineer.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{engineer.name}</TableCell>
                  <TableCell>{engineer.type}</TableCell>
                  <TableCell>{engineer.company || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm">{engineer.phone}</span>
                      {engineer.email && (
                        <span className="text-xs text-muted-foreground">{engineer.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="hidden lg:table-cell max-w-[200px] truncate"
                    title={engineer.commercialAddress}
                  >
                    {engineer.commercialAddress || '-'}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(engineer)}
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
              {filteredEngineers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum engenheiro encontrado.
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
            <DialogTitle>{editingEngineer ? 'Editar Engenheiro' : 'Novo Engenheiro'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do engenheiro para adicioná-lo ao sistema.
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
                        Tipo de Engenharia <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEngineer ? 'Salvar Alterações' : 'Criar Engenheiro'}
                </Button>
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
