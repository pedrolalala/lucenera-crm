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
  User,
  Phone,
  FileText,
  Info,
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

type Arquiteto = Database['public']['Tables']['contatos']['Row']

const arquitetoSchema = z.object({
  nome: z.string().min(2, 'Obrigatório'),
  nome_empresa: z.string().optional().nullable(),
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
  cpf_cnpj: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

type ArquitetoFormValues = z.infer<typeof arquitetoSchema>

function ArquitetoDetails({ arquiteto }: { arquiteto: Arquiteto }) {
  const Section = ({ title, icon: Icon, children }: any) => (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <div className="bg-muted/30 p-3 rounded-md space-y-2 text-sm">{children}</div>
    </div>
  )
  const Field = ({ label, value }: { label: string; value: any }) => (
    <p>
      <span className="font-medium text-foreground">{label}:</span> {value || '-'}
    </p>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      <div className="space-y-4">
        <Section title="Dados da Empresa" icon={Building2}>
          <Field label="Empresa" value={arquiteto.nome_empresa} />
          <Field label="Nome do Arquiteto" value={arquiteto.nome} />
        </Section>
        <Section title="Contato" icon={Phone}>
          <Field label="Celular" value={arquiteto.celular} />
          <Field label="Telefone" value={arquiteto.telefone} />
          <Field label="Email" value={arquiteto.email} />
        </Section>
      </div>
      <div className="space-y-4">
        <Section title="Localização" icon={MapPin}>
          <Field label="Endereço" value={arquiteto.endereco} />
          <Field label="Bairro" value={arquiteto.bairro} />
          <Field
            label="Cidade/UF"
            value={`${arquiteto.cidade || '-'}${arquiteto.estado ? ` / ${arquiteto.estado}` : ''}`}
          />
          <Field label="CEP" value={arquiteto.cep} />
        </Section>
        <Section title="Documentação" icon={FileText}>
          <Field label="CPF/CNPJ" value={arquiteto.cpf_cnpj} />
          <Field label="RG" value={arquiteto.rg} />
          <Field label="Data Nasc." value={arquiteto.data_nascimento} />
        </Section>
      </div>
      {arquiteto.observacoes && (
        <div className="md:col-span-2 mt-2">
          <Section title="Observações" icon={Info}>
            <div className="whitespace-pre-wrap">{arquiteto.observacoes}</div>
          </Section>
        </div>
      )}
    </div>
  )
}

export default function Arquitetos() {
  const [arquitetos, setArquitetos] = useState<Arquiteto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchState, setSearchState] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [searchName, setSearchName] = useState('')

  const [selectedArquiteto, setSelectedArquiteto] = useState<Arquiteto | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingArquiteto, setEditingArquiteto] = useState<Arquiteto | null>(null)
  const [arquitetoToDelete, setArquitetoToDelete] = useState<Arquiteto | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [cameFromView, setCameFromView] = useState(false)
  const [viewMode, setViewMode] = useViewMode('arquitetos', 'cards')

  const form = useForm<ArquitetoFormValues>({
    resolver: zodResolver(arquitetoSchema),
    defaultValues: {
      nome: '',
      nome_empresa: '',
      email: '',
      celular: '',
      telefone: '',
      cidade: '',
      estado: '',
      endereco: '',
      bairro: '',
      cep: '',
      cpf_cnpj: '',
      rg: '',
      observacoes: '',
    },
  })

  const fetchArquitetos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('contatos').select('*').eq('tipo', 'arquiteto')
      if (error) throw error

      const sorted = (data || []).sort((a, b) => {
        const nameA = a.nome || ''
        const nameB = b.nome || ''
        return nameA.localeCompare(nameB)
      })
      setArquitetos(sorted)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar arquitetos',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArquitetos()
    const channel = supabase
      .channel('contatos_arquitetos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos', filter: 'tipo=eq.arquiteto' },
        fetchArquitetos,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && arquitetos.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = arquitetos.find(
        (a) =>
          a.nome?.toLowerCase().trim() === normalizedView ||
          a.nome_empresa?.toLowerCase().trim() === normalizedView,
      )
      if (!match) {
        match = arquitetos.find(
          (a) =>
            a.nome?.toLowerCase().includes(normalizedView) ||
            a.nome_empresa?.toLowerCase().includes(normalizedView),
        )
      }

      if (match) {
        setSelectedArquiteto(match)
        setCameFromView(true)
      } else {
        setSearchName(viewName)
      }

      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, arquitetos, setSearchParams])

  const filteredArquitetos = useMemo(() => {
    return arquitetos.filter((a) => {
      const matchCity =
        !searchCity || (a.cidade?.toLowerCase() || '').includes(searchCity.toLowerCase())
      const matchState =
        !searchState || (a.estado?.toLowerCase() || '').includes(searchState.toLowerCase())
      const matchCompany =
        !searchCompany ||
        (a.nome_empresa?.toLowerCase() || '').includes(searchCompany.toLowerCase())
      const matchName =
        !searchName || (a.nome?.toLowerCase() || '').includes(searchName.toLowerCase())
      return matchCity && matchState && matchCompany && matchName
    })
  }, [arquitetos, searchCity, searchState, searchCompany, searchName])

  const onSubmit = async (values: ArquitetoFormValues) => {
    if (editingArquiteto?.id) {
      const { error } = await supabase.from('contatos').update(values).eq('id', editingArquiteto.id)

      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Arquiteto atualizado com sucesso' })
        setIsEditModalOpen(false)
        fetchArquitetos()
      }
    } else {
      const { error } = await supabase.from('contatos').insert([{ ...values, tipo: 'arquiteto' }])

      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Arquiteto adicionado com sucesso' })
        setIsEditModalOpen(false)
        fetchArquitetos()
      }
    }
  }

  const handleDelete = async () => {
    if (arquitetoToDelete && arquitetoToDelete.id) {
      const { error } = await supabase.from('contatos').delete().eq('id', arquitetoToDelete.id)

      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Arquiteto excluído com sucesso' })
        fetchArquitetos()
      }
      setArquitetoToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingArquiteto(null)
    form.reset({
      nome: '',
      nome_empresa: '',
      email: '',
      celular: '',
      telefone: '',
      cidade: '',
      estado: '',
      endereco: '',
      bairro: '',
      cep: '',
      cpf_cnpj: '',
      rg: '',
      observacoes: '',
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (arquiteto: Arquiteto) => {
    setSelectedArquiteto(arquiteto)
    setCameFromView(false)
  }

  const handleCloseViewModal = (open: boolean) => {
    if (!open) {
      setSelectedArquiteto(null)
      if (cameFromView) {
        navigate(-1)
      }
    }
  }

  const openEditModal = (arquiteto: Arquiteto) => {
    setEditingArquiteto(arquiteto)
    form.reset({
      nome: arquiteto.nome || '',
      nome_empresa: arquiteto.nome_empresa || '',
      email: arquiteto.email || '',
      celular: arquiteto.celular || '',
      telefone: arquiteto.telefone || '',
      cidade: arquiteto.cidade || '',
      estado: arquiteto.estado || '',
      endereco: arquiteto.endereco || '',
      bairro: arquiteto.bairro || '',
      cep: arquiteto.cep || '',
      cpf_cnpj: arquiteto.cpf_cnpj || '',
      rg: arquiteto.rg || '',
      observacoes: arquiteto.observacoes || '',
    })
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Arquitetos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Base de arquitetos e empresas parceiras integradas.
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
            <Plus className="mr-2 h-5 w-5" /> NOVO ARQUITETO
          </Button>
        </div>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa..."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
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
            Carregando arquitetos...
          </div>
        ) : filteredArquitetos.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed">
            <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum arquiteto encontrado</h3>
            <p className="text-muted-foreground mt-1">
              Ajuste os filtros ou cadastre um novo arquiteto.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArquitetos.map((arquiteto) => (
              <Card
                key={arquiteto.id}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 flex flex-col animate-fade-in"
                onClick={() => openViewModal(arquiteto)}
              >
                <CardHeader className="pb-3 relative">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(arquiteto)
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
                        setArquitetoToDelete(arquiteto)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="pr-16">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {arquiteto.nome}
                    </CardTitle>
                    {arquiteto.nome_empresa && (
                      <CardDescription className="text-sm font-medium mt-1 line-clamp-1">
                        {arquiteto.nome_empresa}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground pt-2">
                  {arquiteto.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{arquiteto.email}</span>
                    </div>
                  )}
                  {(arquiteto.celular || arquiteto.telefone) && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{arquiteto.celular || arquiteto.telefone}</span>
                    </div>
                  )}
                  {(arquiteto.cidade || arquiteto.estado) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {[arquiteto.cidade, arquiteto.estado].filter(Boolean).join(' - ')}
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
                      openViewModal(arquiteto)
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
                  <TableHead className="font-semibold">Empresa</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="font-semibold">Cidade/UF</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArquitetos.map((arquiteto, idx) => (
                  <TableRow
                    key={arquiteto.id || idx}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => openViewModal(arquiteto)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {arquiteto.nome || '-'}
                    </TableCell>
                    <TableCell>{arquiteto.nome_empresa || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {arquiteto.celular || arquiteto.telefone || '-'}
                        </span>
                        {arquiteto.email && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {arquiteto.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {arquiteto.cidade
                        ? `${arquiteto.cidade}${arquiteto.estado ? ` - ${arquiteto.estado}` : ''}`
                        : '-'}
                    </TableCell>
                    <TableCell
                      className="text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openViewModal(arquiteto)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(arquiteto)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setArquitetoToDelete(arquiteto)}
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArquiteto ? 'Editar Arquiteto' : 'Novo Arquiteto'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do arquiteto ou empresa parceira.
            </DialogDescription>
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
                        Nome do Arquiteto <span className="text-destructive">*</span>
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
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} value={field.value || ''} />
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
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingArquiteto ? 'Salvar Alterações' : 'Criar Arquiteto'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedArquiteto && !isEditModalOpen} onOpenChange={handleCloseViewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />{' '}
              {selectedArquiteto?.nome || 'Detalhes do Arquiteto'}
            </DialogTitle>
            <DialogDescription>Informações completas do arquiteto e empresa.</DialogDescription>
          </DialogHeader>
          {selectedArquiteto && <ArquitetoDetails arquiteto={selectedArquiteto} />}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => handleCloseViewModal(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!arquitetoToDelete}
        onOpenChange={(open) => !open && setArquitetoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Arquiteto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquiteto "{arquitetoToDelete?.nome}
              "? Esta ação não pode ser desfeita.
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
