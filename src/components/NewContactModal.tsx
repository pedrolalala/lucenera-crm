import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useCepLookup, useCnpjLookup } from '@/hooks/use-document-lookup'
import {
  clientSchema,
  clientFormDefaultValues,
  ClientFormFields,
  type ClientFormValues,
} from '@/components/ClientFormFields'

const schema = z.object({
  nome: z.string().trim().min(2, 'Nome é obrigatório'),
  email: z
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
})

// Pedido do usuário (2026-08-16): "Novo Engenheiro" abria com poucas
// informações (só nome/telefone/email) — precisa de CPF/CNPJ (com o mesmo
// processo de busca automática já usado no cadastro de Cliente) e endereço
// completo. Aplicado também a Arquiteto pelo mesmo motivo/consistência —
// os dois já têm cpf_cnpj/rg previstos em ContatoDetail.tsx, só faltavam
// aqui no cadastro rápido. Eletricista não entra nesse grupo: seu cadastro
// completo (ContatoDetail) nunca teve CPF/CNPJ nem endereço estruturado,
// então adicionar aqui criaria dado invisível em outro lugar do sistema.
const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional()

const optionalUf = z
  .string()
  .trim()
  .toUpperCase()
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional()

const professionalSchema = z.object({
  nome: z.string().trim().min(2, 'Nome é obrigatório'),
  nome_empresa: optionalText,
  email: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido'),
  telefone: optionalText,
  celular: optionalText,
  cpf_cnpj: optionalText,
  rg: optionalText,
  cep: optionalText,
  endereco: optionalText,
  numero: optionalText,
  complemento: optionalText,
  bairro: optionalText,
  cidade: optionalText,
  estado: optionalUf,
  ativo: z.boolean().default(true),
})
type ProfessionalFormValues = z.infer<typeof professionalSchema>

const professionalFormDefaultValues: ProfessionalFormValues = {
  nome: '',
  nome_empresa: '',
  email: '',
  telefone: '',
  celular: '',
  cpf_cnpj: '',
  rg: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  ativo: true,
}

export type ContactType = 'cliente' | 'arquiteto' | 'engenheiro' | 'eletricista'

interface Props {
  type: ContactType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: any) => void
}

const TITLES: Record<string, string> = {
  cliente: 'Novo Cliente',
  arquiteto: 'Novo Arquiteto',
  engenheiro: 'Novo Engenheiro',
  eletricista: 'Novo Eletricista',
}

function ProfessionalFormFields({ form }: { form: ReturnType<typeof useForm<ProfessionalFormValues>> }) {
  const { buscar: buscarCep, loading: loadingCep } = useCepLookup()
  const { buscar: buscarCnpj, loading: loadingCnpj } = useCnpjLookup()
  const numeroRef = useRef<HTMLInputElement>(null)

  const buscarEndereco = (cepValue: string) => {
    buscarCep(
      cepValue,
      (endereco) => {
        form.setValue('endereco', endereco.logradouro, { shouldDirty: true })
        form.setValue('bairro', endereco.bairro, { shouldDirty: true })
        form.setValue('cidade', endereco.cidade, { shouldDirty: true })
        form.setValue('estado', endereco.uf, { shouldDirty: true })
        numeroRef.current?.focus()
      },
      (message) => toast({ title: 'CEP', description: message }),
    )
  }

  const buscarDadosPorCnpj = (cpfCnpjValue: string) => {
    buscarCnpj(
      cpfCnpjValue,
      (dados) => {
        if (!form.getValues('nome')) {
          form.setValue('nome', dados.razaoSocial, { shouldDirty: true })
        }
        if (!form.getValues('nome_empresa')) {
          form.setValue('nome_empresa', dados.nomeFantasia, { shouldDirty: true })
        }
        if (dados.logradouro && !form.getValues('endereco')) {
          form.setValue('endereco', dados.logradouro, { shouldDirty: true })
        }
        if (dados.bairro && !form.getValues('bairro')) {
          form.setValue('bairro', dados.bairro, { shouldDirty: true })
        }
        if (dados.cidade && !form.getValues('cidade')) {
          form.setValue('cidade', dados.cidade, { shouldDirty: true })
        }
        if (dados.uf && !form.getValues('estado')) {
          form.setValue('estado', dados.uf, { shouldDirty: true })
        }
        if (dados.cep && !form.getValues('cep')) {
          form.setValue('cep', dados.cep, { shouldDirty: true })
        }
      },
      (message) => toast({ title: 'CNPJ', description: message }),
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
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
          <FormItem>
            <FormLabel>Empresa / Escritório</FormLabel>
            <FormControl>
              <Input placeholder="Empresa / Escritório" {...field} value={field.value || ''} />
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
        name="cpf_cnpj"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              CPF / CNPJ
              {loadingCnpj && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Buscando...
                </span>
              )}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Documento"
                {...field}
                value={field.value || ''}
                disabled={loadingCnpj}
                onChange={(e) => {
                  field.onChange(e)
                  buscarDadosPorCnpj(e.target.value)
                }}
              />
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
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              CEP
              {loadingCep && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Buscando...
                </span>
              )}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="00000-000"
                {...field}
                value={field.value || ''}
                disabled={loadingCep}
                onChange={(e) => {
                  field.onChange(e)
                  buscarEndereco(e.target.value)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="numero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input
                placeholder="Número"
                {...field}
                value={field.value || ''}
                ref={(el) => {
                  field.ref(el)
                  ;(numeroRef as React.MutableRefObject<HTMLInputElement | null>).current = el
                }}
              />
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
              <Input placeholder="SP" maxLength={2} {...field} value={field.value || ''} />
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
              <Input placeholder="Rua" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="complemento"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Sala, Andar..." {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function NewContactModal({ type, open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const isCliente = type === 'cliente'
  const isProfessional = type === 'arquiteto' || type === 'engenheiro'

  const simpleForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', email: '', telefone: '' },
  })

  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: clientFormDefaultValues,
  })

  const professionalForm = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: professionalFormDefaultValues,
  })

  useEffect(() => {
    if (open) {
      simpleForm.reset()
      clientForm.reset(clientFormDefaultValues)
      professionalForm.reset(professionalFormDefaultValues)
    }
  }, [open, simpleForm, clientForm, professionalForm])

  const insertContact = async (
    values: z.infer<typeof schema> | ClientFormValues | ProfessionalFormValues,
  ) => {
    if (!type) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contatos')
        .insert([{ ...values, tipo: type, created_by: user?.id }])
        .select()
        .single()
      if (error) throw error
      toast({ title: 'Contato criado com sucesso!' })
      onSuccess(data)
    } catch (err: any) {
      if (err.code === '23505' && err.message?.includes('cpf_cnpj')) {
        toast({
          title: 'Erro ao criar',
          description: 'Já existe um cadastro com este CPF/CNPJ.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Erro ao criar contato', description: err.message, variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmitSimple = (values: z.infer<typeof schema>) =>
    insertContact({ ...values, ativo: true })
  const onSubmitClient = (values: ClientFormValues) => insertContact(values)
  const onSubmitProfessional = (values: ProfessionalFormValues) => insertContact(values)

  const handleFormError = (errors: any) => {
    console.error('Form validation errors:', errors)
    toast({
      title: 'Erro de validação',
      description: 'Por favor, preencha os campos obrigatórios corretamente.',
      variant: 'destructive',
    })
  }

  const title = type ? TITLES[type] : ''
  const entity = title.split(' ')[1] || ''

  if (isCliente) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...clientForm}>
            <form
              onSubmit={clientForm.handleSubmit(onSubmitClient, handleFormError)}
              className="space-y-4"
            >
              <ClientFormFields form={clientForm} />
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  if (isProfessional) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicioná-lo ao sistema e vinculá-lo ao projeto.
            </DialogDescription>
          </DialogHeader>
          <Form {...professionalForm}>
            <form
              onSubmit={professionalForm.handleSubmit(onSubmitProfessional, handleFormError)}
              className="space-y-4"
            >
              <ProfessionalFormFields form={professionalForm} />
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : `Salvar ${entity}`}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Adicione um novo cadastro rapidamente para vinculá-lo ao projeto.
          </DialogDescription>
        </DialogHeader>
        <Form {...simpleForm}>
          <form
            onSubmit={simpleForm.handleSubmit(onSubmitSimple, handleFormError)}
            className="space-y-4"
          >
            <FormField
              control={simpleForm.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={simpleForm.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={simpleForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : `Salvar ${entity}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
