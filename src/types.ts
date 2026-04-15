export type UserRole = 'admin' | 'gerente' | 'operador' | 'funcionario' | 'viewer'

export type ProjectStatus =
  | 'Estudo Inicial'
  | 'Proposta Sinal'
  | 'Elaboração Orçamento'
  | 'Ajustes finais'
  | 'Projeto executivo'
  | 'Entrega materiais'
  | 'Finalizado'
  | 'Arquivado'

export type ContatoTipo = 'cliente' | 'arquiteto' | 'engenheiro' | 'eletricista'

export interface Projeto {
  id: string
  codigo: string
  nome: string
  nivel_estrategico: '1' | '2' | '3' | '4' | null
  status: ProjectStatus | null
  cliente_id: string | null
  arquiteto_id: string | null
  responsavel_id: string | null
  responsavel_obra_id: string | null
  valor_total: number | null
  data_vencimento: string | null
  total_parcelas: number | null
  forma_pagamento: string | null
}

export interface Contato {
  id: string
  tipo: ContatoTipo
  nome: string
  nome_empresa: string | null
  cpf_cnpj: string | null
  email: string | null
  telefone: string | null
  celular: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  especialidade: string | null
}

export interface Parcela {
  id: string
  projeto_id: string
  numero_parcela: number
  valor: number
  data_vencimento: string | null
  data_pagamento: string | null
  valor_pago: number | null
  status: string | null
  forma_pagamento: string | null
}

export interface Usuario {
  id: string
  email: string
  nome: string
  role: UserRole | null
}

// Keep legacy types exported so other files don't break completely if not updated yet
export type UserName = 'Filippo' | 'Mariane' | 'Marina' | 'Thairine' | 'Thais'

export const USERS: { name: UserName; role: UserRole }[] = [
  { name: 'Filippo', role: 'admin' },
  { name: 'Mariane', role: 'admin' },
  { name: 'Marina', role: 'funcionario' },
  { name: 'Thairine', role: 'funcionario' },
  { name: 'Thais', role: 'funcionario' },
]

export const STATUS_OPTIONS: ProjectStatus[] = [
  'Estudo Inicial',
  'Proposta Sinal',
  'Elaboração Orçamento',
  'Ajustes finais',
  'Projeto executivo',
  'Entrega materiais',
  'Finalizado',
  'Arquivado',
]

export interface ProjectHistoryItem {
  status: ProjectStatus
  date: string
}

export interface Project {
  id: string
  strategicLevel: '1' | '2' | '3' | '4'
  name: string
  responsible: UserName
  status: ProjectStatus
  entryDate: string
  client: string
  architect: string
  engineer: string
  electrician?: string
  city: string
  state: string
  history: ProjectHistoryItem[]
}
