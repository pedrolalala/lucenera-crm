import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import useProjectStore from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  ArrowLeft,
  Sparkles,
  Building2,
  HardHat,
  User,
  Plus,
  Zap,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from '@/hooks/use-toast'
import { NewContactModal, ContactType } from '@/components/NewContactModal'

const NEW_STATUS_OPTIONS = [
  'Estudo Inicial',
  'Elaboração Orçamento',
  'Proposta Sinal',
  'Informações necessárias',
  'Projeto executivo',
  'Entrega materiais',
  'Ajustes finais',
  'Finalizado',
  'Arquivado',
]

const formSchema = z.object({
  codigo: z.string().regex(/^\d{2}\.\d{3}$/, 'Formato inválido. Use o padrão XX.XXX (ex: 26.083)'),
  nome: z.string().min(2, 'Obrigatório'),
  nivel_estrategico: z.enum(['1', '2', '3', '4']),
  responsavel_nome: z.string().optional(),
  status: z.string().min(1, 'Obrigatório'),
  cliente_id: z.string().min(1, 'Obrigatório'),
  arquiteto_id: z.string().optional(),
  responsavel_obra_id: z.string().optional(),
  cidade: z.string().min(2, 'Obrigatório'),
  estado: z.string().length(2, 'Inválido'),
  data_entrada: z.date({
    required_error: 'A data de entrada é obrigatória.',
  }),
})

export default function ProjectNew() {
  const navigate = useNavigate()
  const { contacts, refreshContacts, refreshProjects } = useProjectStore()

  const [modalType, setModalType] = useState<ContactType | null>(null)
  const [loading, setLoading] = useState(false)
  const [openCliente, setOpenCliente] = useState(false)
  const [openArquiteto, setOpenArquiteto] = useState(false)
  const [openEngenheiro, setOpenEngenheiro] = useState(false)

  const clientes = contacts.filter((c) => c.tipo === 'cliente')
  const arquitetos = contacts.filter((c) => c.tipo === 'arquiteto')
  const engenheiros = contacts.filter((c) => c.tipo === 'engenheiro')

  const [responsaveis, setResponsaveis] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('projetos')
      .select('responsavel_nome')
      .not('responsavel_nome', 'is', null)
      .then(({ data }) => {
        if (data) {
          const uniqueNames = Array.from(
            new Set(data.map((d) => d.responsavel_nome).filter(Boolean) as string[]),
          )
          setResponsaveis(uniqueNames.sort())
        }
      })

    const fetchLatestCode = async () => {
      try {
        const { data, error } = await supabase
          .from('projetos')
          .select('codigo')
          .order('created_at', { ascending: false })
          .limit(1)

        if (!error && data && data.length > 0) {
          const lastCode = data[0].codigo
          if (lastCode && lastCode.includes('.')) {
            const parts = lastCode.split('.')
            if (parts.length === 2) {
              const prefix = parts[0]
              const suffix = parseInt(parts[1], 10)
              if (!isNaN(suffix)) {
                const nextSuffix = String(suffix + 1).padStart(3, '0')
                form.setValue('codigo', `${prefix}.${nextSuffix}`)
              }
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar último código:', err)
      }
    }

    fetchLatestCode()
  }, [form])

  const getCities = () => {
    return Array.from(new Set(contacts.map((c) => c.cidade).filter(Boolean))) as string[]
  }

  const getStateForCity = (city: string) => {
    const contact = contacts.find((c) => c.cidade?.toLowerCase() === city.toLowerCase())
    return contact?.estado || ''
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      nivel_estrategico: '3',
      cliente_id: 'null',
      arquiteto_id: 'null',
      responsavel_obra_id: 'null',
      responsavel_nome: '',
      cidade: '',
      estado: 'SP',
      status: 'Estudo Inicial',
      data_entrada: new Date(),
    },
  })

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const payload = {
        codigo: v.codigo,
        nome: v.nome,
        nivel_estrategico: v.nivel_estrategico,
        responsavel_nome: v.responsavel_nome || null,
        responsavel_id: null,
        status: v.status,
        cliente_id: v.cliente_id !== 'null' ? v.cliente_id : null,
        arquiteto_id: v.arquiteto_id !== 'null' ? v.arquiteto_id : null,
        responsavel_obra_id: v.responsavel_obra_id !== 'null' ? v.responsavel_obra_id : null,
        cidade: v.cidade,
        estado: v.estado,
        data_entrada: v.data_entrada.toISOString(),
      }

      const { data: result, error } = await supabase.functions.invoke('salvar-projeto', {
        body: payload,
      })

      if (error) throw error
      if (result?.error) throw new Error(result.error)

      await refreshProjects()
      toast({ title: 'Projeto criado com sucesso!' })
      navigate('/projetos')
    } catch (err: any) {
      toast({ title: 'Erro ao salvar projeto', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNewContact = async (contactData: any) => {
    await refreshContacts()

    if (modalType === 'cliente') form.setValue('cliente_id', contactData.id)
    else if (modalType === 'arquiteto') form.setValue('arquiteto_id', contactData.id)
    else if (modalType === 'engenheiro') form.setValue('responsavel_obra_id', contactData.id)

    setModalType(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      <Card className="border-t-4 border-t-primary shadow-elevation overflow-hidden">
        <CardHeader className="bg-muted/30 pb-8 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            Registro de Novo Projeto <Sparkles className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Preencha os dados abaixo para registrar um novo projeto no sistema.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-8">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel className="text-base">
                      Código <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 26.083"
                        className="h-11 text-base"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d.]/g, '')
                          field.onChange(val)
                        }}
                        onBlur={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, '')
                          if (onlyNumbers.length >= 3) {
                            field.onChange(`${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`)
                          }
                          field.onBlur()
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel className="text-base">
                      Projeto <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo do projeto"
                        className="h-11 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nivel_estrategico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nível Estratégico <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            Nível {n}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NEW_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
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
                name="responsavel_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input
                        list="responsaveis"
                        placeholder="Digite ou selecione..."
                        className="h-11 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_entrada"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel className="mb-2">
                      Data de Entrada <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal h-11',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 p-5 bg-muted/20 rounded-lg border">
                <FormField
                  control={form.control}
                  name="cliente_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2.5">
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="h-4 w-4" /> Cliente{' '}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Popover open={openCliente} onOpenChange={setOpenCliente}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCliente}
                                className={cn(
                                  'flex-1 justify-between h-11 font-normal',
                                  (!field.value || field.value === 'null') &&
                                    'text-muted-foreground',
                                )}
                              >
                                {field.value && field.value !== 'null'
                                  ? clientes.find((o) => o.id === field.value)?.nome
                                  : 'Não Informado'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar cliente..." />
                              <CommandList>
                                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="nao-informado"
                                    onSelect={() => {
                                      form.setValue('cliente_id', 'null')
                                      setOpenCliente(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === 'null' || !field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    Não Informado
                                  </CommandItem>
                                  {clientes.map((o) => (
                                    <CommandItem
                                      value={o.nome}
                                      key={o.id}
                                      onSelect={() => {
                                        form.setValue('cliente_id', o.id)
                                        setOpenCliente(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          o.id === field.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                      />
                                      {o.nome}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => {
                                      setOpenCliente(false)
                                      setModalType('cliente')
                                    }}
                                    className="text-primary font-medium cursor-pointer"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Cliente
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-11 w-11"
                          onClick={() => setModalType('cliente')}
                          title="Adicionar Novo Cliente"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arquiteto_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2.5">
                      <FormLabel className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" /> Arquiteto
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Popover open={openArquiteto} onOpenChange={setOpenArquiteto}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openArquiteto}
                                className={cn(
                                  'flex-1 justify-between h-11 font-normal',
                                  (!field.value || field.value === 'null') &&
                                    'text-muted-foreground',
                                )}
                              >
                                {field.value && field.value !== 'null'
                                  ? arquitetos.find((o) => o.id === field.value)?.nome
                                  : 'Não Informado'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar arquiteto..." />
                              <CommandList>
                                <CommandEmpty>Nenhum arquiteto encontrado.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="nao-informado"
                                    onSelect={() => {
                                      form.setValue('arquiteto_id', 'null')
                                      setOpenArquiteto(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === 'null' || !field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    Não Informado
                                  </CommandItem>
                                  {arquitetos.map((o) => (
                                    <CommandItem
                                      value={o.nome}
                                      key={o.id}
                                      onSelect={() => {
                                        form.setValue('arquiteto_id', o.id)
                                        setOpenArquiteto(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          o.id === field.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                      />
                                      {o.nome}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => {
                                      setOpenArquiteto(false)
                                      setModalType('arquiteto')
                                    }}
                                    className="text-primary font-medium cursor-pointer"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Arquiteto
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-11 w-11"
                          onClick={() => setModalType('arquiteto')}
                          title="Adicionar Novo Arquiteto"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsavel_obra_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2.5">
                      <FormLabel className="flex items-center gap-1.5">
                        <HardHat className="h-4 w-4" /> Engenheiro
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Popover open={openEngenheiro} onOpenChange={setOpenEngenheiro}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openEngenheiro}
                                className={cn(
                                  'flex-1 justify-between h-11 font-normal',
                                  (!field.value || field.value === 'null') &&
                                    'text-muted-foreground',
                                )}
                              >
                                {field.value && field.value !== 'null'
                                  ? engenheiros.find((o) => o.id === field.value)?.nome
                                  : 'Não Informado'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar engenheiro..." />
                              <CommandList>
                                <CommandEmpty>Nenhum engenheiro encontrado.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="nao-informado"
                                    onSelect={() => {
                                      form.setValue('responsavel_obra_id', 'null')
                                      setOpenEngenheiro(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === 'null' || !field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    Não Informado
                                  </CommandItem>
                                  {engenheiros.map((o) => (
                                    <CommandItem
                                      value={o.nome}
                                      key={o.id}
                                      onSelect={() => {
                                        form.setValue('responsavel_obra_id', o.id)
                                        setOpenEngenheiro(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          o.id === field.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                      />
                                      {o.nome}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => {
                                      setOpenEngenheiro(false)
                                      setModalType('engenheiro')
                                    }}
                                    className="text-primary font-medium cursor-pointer"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Engenheiro
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-11 w-11"
                          onClick={() => setModalType('engenheiro')}
                          title="Adicionar Novo Engenheiro"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>
                        Cidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          list="cities"
                          placeholder="Selecione ou digite"
                          className="h-11"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            const s = getStateForCity(e.target.value)
                            if (s) form.setValue('estado', s)
                          }}
                        />
                      </FormControl>
                      <FormDescription>Estado será preenchido automaticamente.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Estado <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          maxLength={2}
                          placeholder="UF"
                          className="h-11 uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <datalist id="cities">
              {getCities().map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <datalist id="responsaveis">
              {responsaveis.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>

            <CardFooter className="flex justify-end gap-4 bg-muted/30 py-6 px-8 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-11 px-8 text-base" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Projeto'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <NewContactModal
        type={modalType}
        open={!!modalType}
        onOpenChange={(open) => !open && setModalType(null)}
        onSuccess={handleSaveNewContact}
      />
    </div>
  )
}
