export type UserRole = 'admin' | 'gerente' | 'operador' | 'funcionario' | 'viewer'

export type ProjectStatus =
  | 'Estudo Inicial'
  | 'Proposta Sinal'
  | 'Elaboração Orçamento'
  | 'Informações necessárias'
  | 'Projeto executivo'
  | 'Entrega materiais'
  | 'Ajustes finais'
  | 'Finalizado'
  | 'Arquivado'

export const STATUS_OPTIONS: ProjectStatus[] = [
  'Estudo Inicial',
  'Proposta Sinal',
  'Elaboração Orçamento',
  'Informações necessárias',
  'Projeto executivo',
  'Entrega materiais',
  'Ajustes finais',
  'Finalizado',
  'Arquivado',
]
