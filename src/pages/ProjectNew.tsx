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
  SelectSeparator,
} from '@/components/ui/select'
import { USERS } from '@/types'
import { ArrowLeft, Sparkles, Building2, HardHat, User, Plus, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { NewContactModal, ContactType } from '@/components/NewContactModal'

const NEW_STATUS_OPTIONS = [
  'Estudo Inicial',
  'Elaboração Orçamento',
  'Proposta Sinal',
  'Contrato de Projeto',
  'Emissão Projeto Executivo',
  'Ajustes Finais',
  'Obra Finalizada',
  'Venda DocuSign',
  'Não Fechou',
]

const formSchema = z.object({
  codigo: z.string().min(1, 'O campo Código é obrigatório'),
  name: z.string().min(2, 'Obrigatório'),
  strategicLevel: z.enum(['1', '2', '3', '4']),
  responsible: z.string().min(1, 'Obrigatório'),
  status: z.string().min(1, 'Obrigatório'),
  client: z.string().min(1, 'Obrigatório'),
  architect: z.string().min(1, 'Obrigatório'),
  engineer: z.string().min(1, 'Obrigatório'),
  electrician: z.string().optional(),
  city: z.string().min(2, 'Obrigatório'),
  state: z.string().length(2, 'Inválido'),
})

export default function ProjectNew() {
  const navigate = useNavigate()
  const store = useProjectStore() as any
  const { getCities, getStateForCity, addProject } = useProjectStore()

  const [modalType, setModalType] = useState<ContactType | null>(null)

  const [clientsDb, setClientsDb] = useState<{ id: string; nome: string }[]>([])
  const [architectsDb, setArchitectsDb] = useState<{ id: string; nome: string }[]>([])
  const [engineersDb, setEngineersDb] = useState<{ id: string; nome: string }[]>([])
  const [electriciansDb, setElectriciansDb] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    supabase
      .from('clientes_crm')
      .select('cod_cliente, nm_cliente')
      .order('nm_cliente')
      .then(({ data }) =>
        setClientsDb(
          data
            ?.map((d) => ({ id: String(d.cod_cliente), nome: d.nm_cliente || '' }))
            .filter((d) => d.nome) || [],
        ),
      )

    supabase
      .from('Arquitetos_empresas_crm')
      .select('codigo_do_arquiteto, "Nome do Arquiteto"')
      .order('"Nome do Arquiteto"')
      .then(({ data }) =>
        setArchitectsDb(
          data
            ?.map((d) => ({
              id: String(d.codigo_do_arquiteto),
              nome: d['Nome do Arquiteto'] || '',
            }))
            .filter((d) => d.nome) || [],
        ),
      )

    supabase
      .from('engenheiro_crm')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setEngineersDb(data?.map((d) => ({ id: d.id, nome: d.nome })) || []))

    supabase
      .from('eletricistas_crm')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setElectriciansDb(data?.map((d) => ({ id: d.id, nome: d.nome })) || []))
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      name: '',
      strategicLevel: '3',
      client: 'Não Informado',
      architect: 'Não Informado',
      engineer: 'Não Informado',
      electrician: 'Não Informado',
      city: '',
      state: 'SP',
      status: 'Estudo Inicial',
    },
  })

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        Codigo: v.codigo,
        Projeto: v.name,
        nivel_estrategico: v.strategicLevel,
        responsavel: v.responsible,
        Status: v.status,
        arquiteto: v.architect !== 'Não Informado' ? v.architect : null,
        engenheiro: v.engineer !== 'Não Informado' ? v.engineer : null,
        eletricista: v.electrician !== 'Não Informado' ? v.electrician : null,
        Cidade: v.city,
        Estado: v.state,
        data_entrada: new Date().toISOString(),
      }

      const { data: result, error } = await supabase.functions.invoke('salvar-projeto', {
        body: payload,
      })

      if (error) throw error
      if (result?.error) throw new Error(result.error)

      try {
        // Recarrega automaticamente a lista de projetos após o status 200
        await supabase.from('Organizacao_projetos').select('*')

        if (typeof store.fetchProjects === 'function') {
          await store.fetchProjects()
        } else {
          addProject({
            id: String(v.codigo),
            name: v.name,
            strategicLevel: v.strategicLevel as any,
            responsible: v.responsible as any,
            status: v.status as any,
            client: v.client,
            architect: v.architect,
            engineer: v.engineer,
            city: v.city,
            state: v.state,
            electrician: v.electrician,
          })
        }
      } catch (e) {
        // Ignorar erro do store caso ocorra
      }

      toast({ title: 'Projeto criado com sucesso!' })
      navigate('/projetos')
    } catch (err: any) {
      toast({ title: 'Erro ao salvar projeto', description: err.message, variant: 'destructive' })
    }
  }

  const handleSaveNewContact = async (values: { name: string; email?: string; phone?: string }) => {
    try {
      if (modalType === 'client') {
        const { data, error } = await supabase
          .from('clientes_crm')
          .insert([
            {
              nm_cliente: values.name,
              email_cliente: values.email || '',
              tel_cliente: values.phone || '',
            },
          ])
          .select('cod_cliente, nm_cliente')
          .single()

        if (error) throw error
        if (data) {
          setClientsDb((p) =>
            [...p, { id: String(data.cod_cliente), nome: data.nm_cliente || '' }].sort((a, b) =>
              a.nome.localeCompare(b.nome),
            ),
          )
          form.setValue('client', values.name)
          toast({ title: 'Cliente criado com sucesso!' })
        }
      } else if (modalType === 'architect') {
        const { data, error } = await supabase
          .from('Arquitetos_empresas_crm')
          .insert([
            {
              'Nome do Arquiteto': values.name,
              Email: values.email || '',
              Telefone: values.phone || '',
            },
          ])
          .select('codigo_do_arquiteto, "Nome do Arquiteto"')
          .single()

        if (error) throw error
        if (data) {
          setArchitectsDb((p) =>
            [
              ...p,
              { id: String(data.codigo_do_arquiteto), nome: data['Nome do Arquiteto'] || '' },
            ].sort((a, b) => a.nome.localeCompare(b.nome)),
          )
          form.setValue('architect', values.name)
          toast({ title: 'Arquiteto criado com sucesso!' })
        }
      } else if (modalType === 'engineer') {
        const { data, error } = await supabase
          .from('engenheiro_crm')
          .insert([{ nome: values.name, email: values.email || '', telefone: values.phone || '' }])
          .select('id, nome')
          .single()

        if (error) throw error
        if (data) {
          setEngineersDb((p) =>
            [...p, { id: data.id, nome: data.nome }].sort((a, b) => a.nome.localeCompare(b.nome)),
          )
          form.setValue('engineer', values.name)
          toast({ title: 'Engenheiro criado com sucesso!' })
        }
      } else if (modalType === 'electrician') {
        const { data, error } = await supabase
          .from('eletricistas_crm')
          .insert([{ nome: values.name, email: values.email || '', telefone: values.phone || '' }])
          .select('id, nome')
          .single()

        if (error) throw error
        if (data) {
          setElectriciansDb((p) =>
            [...p, { id: data.id, nome: data.nome }].sort((a, b) => a.nome.localeCompare(b.nome)),
          )
          form.setValue('electrician', values.name)
          toast({ title: 'Eletricista criado com sucesso!' })
        }
      }
      setModalType(null)
    } catch (err: any) {
      toast({ title: 'Erro ao criar contato', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
                      <Input placeholder="Ex: 26083" className="h-11 text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
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
                name="strategicLevel"
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
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Responsável <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USERS.filter((u) => u.role === 'User').map((u) => (
                          <SelectItem key={u.name} value={u.name}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 p-5 bg-muted/20 rounded-lg border">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="h-4 w-4" /> Cliente
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Não Informado">Não Informado</SelectItem>
                          {clientsDb.map((o) => (
                            <SelectItem key={o.id} value={o.nome}>
                              {o.nome}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <div
                            role="button"
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-medium text-primary outline-none hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalType('client')
                            }}
                          >
                            <Plus className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" />{' '}
                            Novo Cliente
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="architect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" /> Arquiteto
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Não Informado">Não Informado</SelectItem>
                          {architectsDb.map((o) => (
                            <SelectItem key={o.id} value={o.nome}>
                              {o.nome}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <div
                            role="button"
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-medium text-primary outline-none hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalType('architect')
                            }}
                          >
                            <Plus className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" />{' '}
                            Novo Arquiteto
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engineer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <HardHat className="h-4 w-4" /> Engenheiro
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Não Informado">Não Informado</SelectItem>
                          {engineersDb.map((o) => (
                            <SelectItem key={o.id} value={o.nome}>
                              {o.nome}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <div
                            role="button"
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-medium text-primary outline-none hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalType('engineer')
                            }}
                          >
                            <Plus className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" />{' '}
                            Novo Engenheiro
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="electrician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4" /> Eletricista
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'Não Informado'}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Não Informado">Não Informado</SelectItem>
                          {electriciansDb.map((o) => (
                            <SelectItem key={o.id} value={o.nome}>
                              {o.nome}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <div
                            role="button"
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-medium text-primary outline-none hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalType('electrician')
                            }}
                          >
                            <Plus className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" />{' '}
                            Novo Eletricista
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="city"
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
                            if (s) form.setValue('state', s)
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
                  name="state"
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

            <CardFooter className="flex justify-end gap-4 bg-muted/30 py-6 px-8 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-11 px-8 text-base">
                Salvar Projeto
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
