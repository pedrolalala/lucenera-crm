import { useState, useMemo, useEffect } from 'react'
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
import {
  Search,
  LayoutGrid,
  List,
  Mail,
  ChevronRight,
  MapPin,
  Building2,
  Truck,
  Phone,
  Plus,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { toast } from '@/hooks/use-toast'

type Fornecedor = Database['public']['Tables']['contatos']['Row']

// Fornecedor usa `cnpj`/`razao_social`, não `cpf_cnpj` — mesmos campos já
// usados pelos 357 fornecedores existentes (importação Connect, SPEC-050) e
// pela criação rápida de fornecedor em cadastro-lucenera (SPEC-053).
const fornecedorSchema = z.object({
  nome: z.string().min(2, 'Obrigatório'),
  razao_social: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  email: z
    .string()
    .email('Email inválido')
    .or(z.literal('').or(z.null()))
    .transform((v) => v || null),
  celular: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

type FornecedorFormValues = z.infer<typeof fornecedorSchema>

const FORNECEDOR_FORM_DEFAULTS: FornecedorFormValues = {
  nome: '',
  razao_social: '',
  cnpj: '',
  email: '',
  celular: '',
  telefone: '',
  cidade: '',
  estado: '',
  endereco: '',
  bairro: '',
  cep: '',
  observacoes: '',
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchState, setSearchState] = useState('')
  const [searchName, setSearchName] = useState('')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useViewMode('fornecedores', 'cards')

  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: FORNECEDOR_FORM_DEFAULTS,
  })

  const fetchFornecedores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('contatos').select('*').eq('tipo', 'fornecedor')
      if (error) throw error

      const sorted = (data || []).sort((a, b) => {
        const nameA = a.nome || ''
        const nameB = b.nome || ''
        return nameA.localeCompare(nameB)
      })
      setFornecedores(sorted)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar fornecedores',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFornecedores()
    const channel = supabase
      .channel('contatos_fornecedores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos', filter: 'tipo=eq.fornecedor' },
        fetchFornecedores,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && fornecedores.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = fornecedores.find(
        (f) =>
          f.nome?.toLowerCase().trim() === normalizedView ||
          f.razao_social?.toLowerCase().trim() === normalizedView,
      )
      if (!match) {
        match = fornecedores.find(
          (f) =>
            f.nome?.toLowerCase().includes(normalizedView) ||
            f.razao_social?.toLowerCase().includes(normalizedView),
        )
      }

      if (match) {
        navigate(`/contatos/fornecedores/${match.id}`, { replace: true })
        return
      }

      setSearchName(viewName)
      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, fornecedores, setSearchParams, navigate])

  const filteredFornecedores = useMemo(() => {
    return fornecedores.filter((f) => {
      const matchCity =
        !searchCity || (f.cidade?.toLowerCase() || '').includes(searchCity.toLowerCase())
      const matchState =
        !searchState || (f.estado?.toLowerCase() || '').includes(searchState.toLowerCase())
      const matchName =
        !searchName ||
        (f.nome?.toLowerCase() || '').includes(searchName.toLowerCase()) ||
        (f.razao_social?.toLowerCase() || '').includes(searchName.toLowerCase())
      return matchCity && matchState && matchName
    })
  }, [fornecedores, searchCity, searchState, searchName])

  const onSubmit = async (values: FornecedorFormValues) => {
    const { data, error } = await supabase
      .from('contatos')
      .insert([{ ...values, tipo: 'fornecedor' }])
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Fornecedor adicionado com sucesso' })
    setIsNewModalOpen(false)
    if (data?.id) {
      navigate(`/contatos/fornecedores/${data.id}`)
    } else {
      fetchFornecedores()
    }
  }

  const handleDelete = async () => {
    if (fornecedorToDelete && fornecedorToDelete.id) {
      const { error } = await supabase.from('contatos').delete().eq('id', fornecedorToDelete.id)

      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Fornecedor excluído com sucesso' })
        fetchFornecedores()
      }
      setFornecedorToDelete(null)
    }
  }

  const openNewModal = () => {
    form.reset(FORNECEDOR_FORM_DEFAULTS)
    setIsNewModalOpen(true)
  }

  const viewFornecedor = (fornecedor: Fornecedor) => {
    navigate(`/contatos/fornecedores/${fornecedor.id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Fornecedores</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Base de fornecedores cadastrados no sistema.
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
            <Plus className="mr-2 h-5 w-5" /> NOVO FORNECEDOR
          </Button>
        </div>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou razão social..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por cidade..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por estado (ex: SP)..."
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            Carregando fornecedores...
          </div>
        ) : filteredFornecedores.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed">
            <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mt-1">
              Ajuste os filtros ou cadastre um novo fornecedor.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFornecedores.map((fornecedor) => (
              <Card
                key={fornecedor.id}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 flex flex-col animate-fade-in"
                onClick={() => viewFornecedor(fornecedor)}
              >
                <CardHeader className="pb-3 relative">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        viewFornecedor(fornecedor)
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
                        setFornecedorToDelete(fornecedor)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="pr-16">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {fornecedor.nome}
                    </CardTitle>
                    {fornecedor.razao_social && (
                      <CardDescription className="text-sm font-medium mt-1 line-clamp-1">
                        {fornecedor.razao_social}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground pt-2">
                  {fornecedor.cnpj && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{fornecedor.cnpj}</span>
                    </div>
                  )}
                  {fornecedor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{fornecedor.email}</span>
                    </div>
                  )}
                  {(fornecedor.celular || fornecedor.telefone) && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{fornecedor.celular || fornecedor.telefone}</span>
                    </div>
                  )}
                  {(fornecedor.cidade || fornecedor.estado) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {[fornecedor.cidade, fornecedor.estado].filter(Boolean).join(' - ')}
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
                      viewFornecedor(fornecedor)
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
                  <TableHead className="font-semibold">Razão Social</TableHead>
                  <TableHead className="font-semibold">CNPJ</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="font-semibold">Cidade/UF</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFornecedores.map((fornecedor, idx) => (
                  <TableRow
                    key={fornecedor.id || idx}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => viewFornecedor(fornecedor)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {fornecedor.nome || '-'}
                    </TableCell>
                    <TableCell>{fornecedor.razao_social || '-'}</TableCell>
                    <TableCell>{fornecedor.cnpj || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {fornecedor.celular || fornecedor.telefone || '-'}
                        </span>
                        {fornecedor.email && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {fornecedor.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {fornecedor.cidade
                        ? `${fornecedor.cidade}${fornecedor.estado ? ` - ${fornecedor.estado}` : ''}`
                        : '-'}
                    </TableCell>
                    <TableCell
                      className="text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewFornecedor(fornecedor)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewFornecedor(fornecedor)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFornecedorToDelete(fornecedor)}
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

      {/* Novo Fornecedor — edição acontece na página cheia (/contatos/fornecedores/:id) */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Fornecedor</DialogTitle>
            <DialogDescription>Preencha os dados do fornecedor.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <Input
                          placeholder="Nome do fornecedor"
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
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão Social" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0000-00"
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
                          maxLength={2}
                          placeholder="SP"
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
                          placeholder="Notas adicionais"
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
                <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Fornecedor</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!fornecedorToDelete}
        onOpenChange={(open) => !open && setFornecedorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{fornecedorToDelete?.nome}"? Esta ação
              não pode ser desfeita.
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
