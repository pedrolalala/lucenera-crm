import { useRef } from 'react'
import * as z from 'zod'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { useCepLookup, useCnpjLookup } from '@/hooks/use-document-lookup'

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

export const clientSchema = z.object({
  nome: z.string().trim().min(2, 'Nome é obrigatório'),
  nome_empresa: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  // SPEC-061 (2026-08-05): e-mail passa a ser obrigatório no formulário —
  // decisão do usuário. A coluna `contatos.email` no banco continua
  // nullable (não quebra dados legados/importações sem e-mail).
  email: z
    .string()
    .trim()
    .min(1, 'E-mail é obrigatório')
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido'),
  email_financeiro: z
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
  celular: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  cpf_cnpj: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  rg: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  endereco: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  // Pedido do usuário (2026-08-16): o bloco de endereço principal nunca
  // teve "Número" separado (só entrega/cobrança tinham) — "Rua, Número,
  // Complemento" ficava tudo junto no campo Endereço. Agora tem campo
  // próprio, igual aos outros dois blocos.
  numero: optionalText,
  // SPEC-061: campo "Complemento" nos 3 blocos de endereço — hoje só
  // existia numero_entrega/numero_cobranca, sem complemento em nenhum.
  complemento: optionalText,
  bairro: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  cep: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  cidade: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  estado: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  data_nascimento: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  ativo: z.boolean().default(true),
  // SPEC-052 (achado 2026-08-04): distinto de regime_apuracao, confirmado por
  // print do sistema de referência do usuário.
  tipo_cliente: optionalText,
  inscricao_estadual: optionalText,
  // SPEC-052: campo de texto livre por enquanto — o print de referência do Vinicius com
  // as opções exatas do regime tributário nunca chegou. Trocar para Select fixo quando as
  // opções forem confirmadas.
  regime_apuracao: optionalText,
  // SPEC-064: rótulo Ribeirão/São Paulo, só visualização.
  perfil: optionalText,
  cep_entrega: optionalText,
  endereco_entrega: optionalText,
  numero_entrega: optionalText,
  complemento_entrega: optionalText,
  bairro_entrega: optionalText,
  cidade_entrega: optionalText,
  estado_entrega: optionalUf,
  cep_cobranca: optionalText,
  endereco_cobranca: optionalText,
  numero_cobranca: optionalText,
  complemento_cobranca: optionalText,
  bairro_cobranca: optionalText,
  cidade_cobranca: optionalText,
  estado_cobranca: optionalUf,
})

export type ClientFormValues = z.infer<typeof clientSchema>

export const clientFormDefaultValues: ClientFormValues = {
  nome: '',
  nome_empresa: '',
  email: '',
  email_financeiro: '',
  telefone: '',
  celular: '',
  cpf_cnpj: '',
  rg: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: '',
  data_nascimento: '',
  observacoes: '',
  ativo: true,
  tipo_cliente: '',
  inscricao_estadual: '',
  regime_apuracao: '',
  perfil: '',
  cep_entrega: '',
  endereco_entrega: '',
  numero_entrega: '',
  complemento_entrega: '',
  bairro_entrega: '',
  cidade_entrega: '',
  estado_entrega: '',
  cep_cobranca: '',
  endereco_cobranca: '',
  numero_cobranca: '',
  complemento_cobranca: '',
  bairro_cobranca: '',
  cidade_cobranca: '',
  estado_cobranca: '',
}

interface Props {
  form: UseFormReturn<ClientFormValues>
}

/**
 * Conjunto completo de campos de cadastro de cliente (padrão único usado
 * tanto pela página de Clientes quanto pelo cadastro rápido em Novo Projeto).
 */
export function ClientFormFields({ form }: Props) {
  const { buscar: buscarCep, loading: loadingCep } = useCepLookup()
  const { buscar: buscarCnpj, loading: loadingCnpj } = useCnpjLookup()
  const enderecoRef = useRef<HTMLInputElement>(null)
  const numeroRef = useRef<HTMLInputElement>(null)
  const numeroEntregaRef = useRef<HTMLInputElement>(null)
  const numeroCobrancaRef = useRef<HTMLInputElement>(null)

  // Busca automática de CEP (ViaCEP + fallback BrasilAPI, ver cepService).
  // Preenche apenas o bloco de endereço (principal/entrega/cobrança)
  // correspondente ao CEP digitado, sem cruzar dados entre blocos. Os três
  // blocos têm campo "Número" próprio — o foco depois do CEP vai pra lá.
  const buscarEnderecoBloco = (
    cepValue: string,
    keys: {
      endereco: keyof ClientFormValues
      bairro: keyof ClientFormValues
      cidade: keyof ClientFormValues
      estado: keyof ClientFormValues
    },
    focusRef: React.RefObject<HTMLInputElement>,
  ) => {
    buscarCep(
      cepValue,
      (endereco) => {
        form.setValue(keys.endereco, endereco.logradouro, { shouldDirty: true })
        form.setValue(keys.bairro, endereco.bairro, { shouldDirty: true })
        form.setValue(keys.cidade, endereco.cidade, { shouldDirty: true })
        form.setValue(keys.estado, endereco.uf, { shouldDirty: true })
        focusRef.current?.focus()
      },
      (message) => toast({ title: 'CEP', description: message }),
    )
  }

  // Busca automática de CNPJ (BrasilAPI + fallback ReceitaWS, ver
  // cnpjService). Só preenche nome / nome da empresa se os campos ainda
  // estiverem vazios, para não sobrescrever algo já digitado pelo usuário.
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
            <FormLabel>
              Nome e Razão Social <span className="text-destructive">*</span>
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
          <FormItem>
            <FormLabel>Nome Fantasia</FormLabel>
            <FormControl>
              <Input placeholder="Nome Fantasia" {...field} value={field.value || ''} />
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
            <FormLabel>
              E-mail <span className="text-destructive">*</span>
            </FormLabel>
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
        name="email_financeiro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail Financeiro</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="financeiro@exemplo.com"
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
      {/* SPEC-096: Tipo Cliente sobe pra logo após CPF/CNPJ (antes de
          RG/IE), e RG+IE ficam adjacentes (antes o Tipo Cliente entrava
          entre os dois, quebrando o pareamento visual no grid de 2
          colunas). */}
      <FormField
        control={form.control}
        name="tipo_cliente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo Cliente</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="consumidor">Consumidor</SelectItem>
                <SelectItem value="nao_contribuinte">Não Contribuinte</SelectItem>
                <SelectItem value="industria">Indústria</SelectItem>
                <SelectItem value="revendedor">Revendedor</SelectItem>
              </SelectContent>
            </Select>
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
        name="inscricao_estadual"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inscrição Estadual</FormLabel>
            <FormControl>
              <Input placeholder="Inscrição Estadual" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="regime_apuracao"
        render={({ field }) => (
          <FormItem>
            {/* SPEC-052: opções confirmadas pelo usuário em 2026-08-04 (Simples
                Nacional e Regime Normal), migration com CHECK já aplicada. */}
            <FormLabel>Regime de Apuração</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                <SelectItem value="regime_normal">Regime Normal</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="perfil"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Perfil</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ribeirao">Ribeirão</SelectItem>
                <SelectItem value="sao_paulo">São Paulo</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value || ''} />
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
                  buscarEnderecoBloco(
                    e.target.value,
                    {
                      endereco: 'endereco',
                      bairro: 'bairro',
                      cidade: 'cidade',
                      estado: 'estado',
                    },
                    numeroRef,
                  )
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
        name="endereco"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input
                placeholder="Rua"
                {...field}
                value={field.value || ''}
                ref={(el) => {
                  field.ref(el)
                  ;(enderecoRef as React.MutableRefObject<HTMLInputElement | null>).current = el
                }}
              />
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
              <Input placeholder="Apto, Bloco, Sala..." {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="sm:col-span-2 pt-2 border-t mt-2">
        <h4 className="text-sm font-semibold text-foreground mb-3 mt-4">Endereço de Entrega</h4>
      </div>
      <FormField
        control={form.control}
        name="cep_entrega"
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
                  buscarEnderecoBloco(
                    e.target.value,
                    {
                      endereco: 'endereco_entrega',
                      bairro: 'bairro_entrega',
                      cidade: 'cidade_entrega',
                      estado: 'estado_entrega',
                    },
                    numeroEntregaRef,
                  )
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="numero_entrega"
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
                  ;(
                    numeroEntregaRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = el
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="complemento_entrega"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Apto, Bloco, Sala..." {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="endereco_entrega"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Rua, Número, Complemento" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bairro_entrega"
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
        name="cidade_entrega"
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
        name="estado_entrega"
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

      <div className="sm:col-span-2 pt-2 border-t mt-2">
        <h4 className="text-sm font-semibold text-foreground mb-3 mt-4">Endereço de Cobrança</h4>
      </div>
      <FormField
        control={form.control}
        name="cep_cobranca"
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
                  buscarEnderecoBloco(
                    e.target.value,
                    {
                      endereco: 'endereco_cobranca',
                      bairro: 'bairro_cobranca',
                      cidade: 'cidade_cobranca',
                      estado: 'estado_cobranca',
                    },
                    numeroCobrancaRef,
                  )
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="numero_cobranca"
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
                  ;(
                    numeroCobrancaRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = el
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="complemento_cobranca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Apto, Bloco, Sala..." {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="endereco_cobranca"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Rua, Número, Complemento" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bairro_cobranca"
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
        name="cidade_cobranca"
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
        name="estado_cobranca"
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
        name="observacoes"
        render={({ field }) => (
          <FormItem className="sm:col-span-2 pt-2 border-t mt-2">
            <FormLabel className="mt-4 block">Observações</FormLabel>
            <FormControl>
              <Input placeholder="Observações adicionais" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ativo"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Status de Atividade</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(v === 'true')}
              value={field.value ? 'true' : 'false'}
            >
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
