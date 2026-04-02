import { useState, useMemo, useEffect } from 'react'
import {
  Search,
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

type Arquiteto = Database['public']['Tables']['Arquitetos_empresas_crm']['Row']

const arquitetoSchema = z.object({
  'Nome do Arquiteto': z.string().min(2, 'Obrigatório'),
  'Nome da Empresa': z.string().optional().nullable(),
  Email: z
    .string()
    .email('Email inválido')
    .or(z.literal('').or(z.null()))
    .transform((v) => v || null),
  Celular: z.string().optional().nullable(),
  Telefone: z.string().optional().nullable(),
  Cidade: z.string().optional().nullable(),
  Estado: z.string().optional().nullable(),
  endereço: z.string().optional().nullable(),
  Bairro: z.string().optional().nullable(),
  CEP: z.string().optional().nullable(),
  'CPF/CNPJ': z.string().optional().nullable(),
  RG: z.string().optional().nullable(),
  Observacoes: z.string().optional().nullable(),
  numero_de_arquitetos: z.coerce.number().optional().nullable(),
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
          <Field label="Empresa" value={arquiteto['Nome da Empresa']} />
          <Field label="Código" value={arquiteto.codigo_do_arquiteto} />
          <Field label="Nº de Arquitetos" value={arquiteto.numero_de_arquitetos} />
        </Section>
        <Section title="Contato" icon={Phone}>
          <Field label="Celular" value={arquiteto.Celular} />
          <Field label="Telefone" value={arquiteto.Telefone} />
          <Field label="Email" value={arquiteto.Email} />
        </Section>
      </div>
      <div className="space-y-4">
        <Section title="Localização" icon={MapPin}>
          <Field label="Endereço" value={arquiteto.endereço} />
          <Field label="Bairro" value={arquiteto.Bairro} />
          <Field
            label="Cidade/UF"
            value={`${arquiteto.Cidade || '-'}${arquiteto.Estado ? ` / ${arquiteto.Estado}` : ''}`}
          />
          <Field label="CEP" value={arquiteto.CEP} />
        </Section>
        <Section title="Documentação" icon={FileText}>
          <Field label="CPF/CNPJ" value={arquiteto['CPF/CNPJ']} />
          <Field label="RG" value={arquiteto.RG} />
          <Field label="Data Nasc." value={arquiteto.data_de_nascimento} />
        </Section>
      </div>
      {arquiteto.Observacoes && (
        <div className="md:col-span-2 mt-2">
          <Section title="Observações" icon={Info}>
            <div className="whitespace-pre-wrap">{arquiteto.Observacoes}</div>
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

  const form = useForm<ArquitetoFormValues>({
    resolver: zodResolver(arquitetoSchema),
    defaultValues: {
      'Nome do Arquiteto': '',
      'Nome da Empresa': '',
      Email: '',
      Celular: '',
      Telefone: '',
      Cidade: '',
      Estado: '',
      endereço: '',
      Bairro: '',
      CEP: '',
      'CPF/CNPJ': '',
      RG: '',
      Observacoes: '',
      numero_de_arquitetos: null,
    },
  })

  const fetchArquitetos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('Arquitetos_empresas_crm').select('*')
      if (error) throw error

      const sorted = (data || []).sort((a, b) => {
        const nameA = a['Nome do Arquiteto'] || ''
        const nameB = b['Nome do Arquiteto'] || ''
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
      .channel('arquitetos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Arquitetos_empresas_crm' },
        fetchArquitetos,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredArquitetos = useMemo(() => {
    return arquitetos.filter((a) => {
      const matchCity =
        !searchCity || (a.Cidade?.toLowerCase() || '').includes(searchCity.toLowerCase())
      const matchState =
        !searchState || (a.Estado?.toLowerCase() || '').includes(searchState.toLowerCase())
      const matchCompany =
        !searchCompany ||
        (a['Nome da Empresa']?.toLowerCase() || '').includes(searchCompany.toLowerCase())
      const matchName =
        !searchName ||
        (a['Nome do Arquiteto']?.toLowerCase() || '').includes(searchName.toLowerCase())
      return matchCity && matchState && matchCompany && matchName
    })
  }, [arquitetos, searchCity, searchState, searchCompany, searchName])

  const onSubmit = async (values: ArquitetoFormValues) => {
    if (editingArquiteto?.codigo_do_arquiteto) {
      const { error } = await supabase
        .from('Arquitetos_empresas_crm')
        .update(values)
        .eq('codigo_do_arquiteto', editingArquiteto.codigo_do_arquiteto)

      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Arquiteto atualizado com sucesso' })
        setIsEditModalOpen(false)
      }
    } else {
      const { error } = await supabase.from('Arquitetos_empresas_crm').insert([values])

      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Arquiteto adicionado com sucesso' })
        setIsEditModalOpen(false)
      }
    }
  }

  const handleDelete = async () => {
    if (arquitetoToDelete && arquitetoToDelete.codigo_do_arquiteto) {
      const { error } = await supabase
        .from('Arquitetos_empresas_crm')
        .delete()
        .eq('codigo_do_arquiteto', arquitetoToDelete.codigo_do_arquiteto)

      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Arquiteto excluído com sucesso' })
      }
      setArquitetoToDelete(null)
    }
  }

  const openNewModal = () => {
    setEditingArquiteto(null)
    form.reset({
      'Nome do Arquiteto': '',
      'Nome da Empresa': '',
      Email: '',
      Celular: '',
      Telefone: '',
      Cidade: '',
      Estado: '',
      endereço: '',
      Bairro: '',
      CEP: '',
      'CPF/CNPJ': '',
      RG: '',
      Observacoes: '',
      numero_de_arquitetos: null,
    })
    setIsEditModalOpen(true)
  }

  const openEditModal = (arquiteto: Arquiteto) => {
    setEditingArquiteto(arquiteto)
    form.reset({
      'Nome do Arquiteto': arquiteto['Nome do Arquiteto'] || '',
      'Nome da Empresa': arquiteto['Nome da Empresa'] || '',
      Email: arquiteto.Email || '',
      Celular: arquiteto.Celular || '',
      Telefone: arquiteto.Telefone || '',
      Cidade: arquiteto.Cidade || '',
      Estado: arquiteto.Estado || '',
      endereço: arquiteto.endereço || '',
      Bairro: arquiteto.Bairro || '',
      CEP: arquiteto.CEP || '',
      'CPF/CNPJ': arquiteto['CPF/CNPJ'] || '',
      RG: arquiteto.RG || '',
      Observacoes: arquiteto.Observacoes || '',
      numero_de_arquitetos: arquiteto.numero_de_arquitetos,
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
        <Button onClick={openNewModal} className="w-full sm:w-auto shadow-elevation h-11" size="lg">
          <Plus className="mr-2 h-5 w-5" /> NOVO ARQUITETO
        </Button>
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

        <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Carregando arquitetos...
                  </TableCell>
                </TableRow>
              ) : filteredArquitetos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum arquiteto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredArquitetos.map((arquiteto, idx) => (
                  <TableRow
                    key={arquiteto.codigo_do_arquiteto || idx}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedArquiteto(arquiteto)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {arquiteto['Nome do Arquiteto'] || '-'}
                    </TableCell>
                    <TableCell>{arquiteto['Nome da Empresa'] || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {arquiteto.Celular || arquiteto.Telefone || '-'}
                        </span>
                        {arquiteto.Email && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {arquiteto.Email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {arquiteto.Cidade
                        ? `${arquiteto.Cidade}${arquiteto.Estado ? ` - ${arquiteto.Estado}` : ''}`
                        : '-'}
                    </TableCell>
                    <TableCell
                      className="text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedArquiteto(arquiteto)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
                  name="Nome do Arquiteto"
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
                  name="Nome da Empresa"
                  render={({ field }) => (
                    <FormItem>
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
                  name="numero_de_arquitetos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Arquitetos na Equipe</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 5"
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
                  name="Email"
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
                  name="Celular"
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
                  name="Telefone"
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
                  name="CPF/CNPJ"
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
                  name="Cidade"
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
                  name="Estado"
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
                  name="endereço"
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
                  name="Observacoes"
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

      <Dialog
        open={!!selectedArquiteto && !isEditModalOpen}
        onOpenChange={(open) => !open && setSelectedArquiteto(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />{' '}
              {selectedArquiteto?.['Nome do Arquiteto'] || 'Detalhes do Arquiteto'}
            </DialogTitle>
            <DialogDescription>Informações completas do arquiteto e empresa.</DialogDescription>
          </DialogHeader>
          {selectedArquiteto && <ArquitetoDetails arquiteto={selectedArquiteto} />}
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
              Tem certeza que deseja excluir o arquiteto "{arquitetoToDelete?.['Nome do Arquiteto']}
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
