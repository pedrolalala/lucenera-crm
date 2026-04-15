import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type ContatoRow = Database['public']['Tables']['contatos']['Row']

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
  endereco_comercial: z.string().optional().nullable(),
})

type EngineerFormValues = z.infer<typeof engineerSchema>

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
  const [editingEngineer, setEditingEngineer] = useState<ContatoRow | null>(null)
  const [engineerToDelete, setEngineerToDelete] = useState<string | null>(null)

  const [viewingEngineer, setViewingEngineer] = useState<ContatoRow | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [cameFromView, setCameFromView] = useState(false)

  const form = useForm<EngineerFormValues>({
    resolver: zodResolver(engineerSchema),
    defaultValues: {
      nome: '',
      especialidade: '',
      email: '',
      telefone: '',
      celular: '',
      nome_empresa: '',
      endereco_comercial: '',
    },
  })

  const fetchEngineers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('tipo', 'engenheiro')
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

  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && engineers.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = engineers.find((e) => e.nome.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = engineers.find((e) => e.nome.toLowerCase().includes(normalizedView))
      }

      if (match) {
        setViewingEngineer(match)
        setIsViewModalOpen(true)
        setCameFromView(true)
      } else {
        setSearch(viewName)
      }

      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, engineers, setSearchParams])

  useEffect(() => {
    if (editingEngineer) {
      form.reset({
        nome: editingEngineer.nome,
        especialidade: editingEngineer.especialidade || '',
        email: editingEngineer.email || '',
        telefone: editingEngineer.telefone || '',
        celular: editingEngineer.celular || '',
        nome_empresa: editingEngineer.nome_empresa || '',
        endereco_comercial: editingEngineer.endereco_comercial || '',
      })
    } else {
      form.reset({
        nome: '',
        especialidade: '',
        email: '',
        telefone: '',
        celular: '',
        nome_empresa: '',
        endereco_comercial: '',
      })
    }
  }, [editingEngineer, form, isModalOpen])

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
    if (editingEngineer) {
      const { error } = await supabase.from('contatos').update(values).eq('id', editingEngineer.id)
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Engenheiro atualizado com sucesso' })
        setIsModalOpen(false)
        fetchEngineers()
      }
    } else {
      const { error } = await supabase.from('contatos').insert([{ ...values, tipo: 'engenheiro' }])
      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Engenheiro adicionado com sucesso' })
        setIsModalOpen(false)
        fetchEngineers()
      }
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
    setEditingEngineer(null)
    setIsModalOpen(true)
  }

  const openViewModal = (engineer: ContatoRow) => {
    setViewingEngineer(engineer)
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

  const openEditModal = (engineer: ContatoRow) => {
    setEditingEngineer(engineer)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in-up">
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
                <TableHead className="font-semibold">Especialidade</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">End. Comercial</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Carregando engenheiros...
                  </TableCell>
                </TableRow>
              ) : filteredEngineers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum engenheiro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEngineers.map((engineer) => (
                  <TableRow key={engineer.id} className="hover:bg-muted/50 transition-colors">
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
                      title={engineer.endereco_comercial || ''}
                    >
                      {engineer.endereco_comercial || '-'}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openViewModal(engineer)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
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
                ))
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
                  name="endereco_comercial"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço Comercial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, Número, Complemento, Bairro, Cidade"
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

      <Dialog open={isViewModalOpen} onOpenChange={handleCloseViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Engenheiro</DialogTitle>
            <DialogDescription>Informações completas do registro</DialogDescription>
          </DialogHeader>
          {viewingEngineer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 py-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Nome</h4>
                <p className="text-foreground">{viewingEngineer.nome || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Especialidade</h4>
                <p className="text-foreground">{viewingEngineer.especialidade || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">E-mail</h4>
                <p className="text-foreground">{viewingEngineer.email || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Telefone</h4>
                <p className="text-foreground">{viewingEngineer.telefone || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Celular</h4>
                <p className="text-foreground">{viewingEngineer.celular || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Empresa</h4>
                <p className="text-foreground">{viewingEngineer.nome_empresa || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Endereço Comercial</h4>
                <p className="text-foreground">{viewingEngineer.endereco_comercial || '-'}</p>
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
