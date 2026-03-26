export type UserRole = 'Admin' | 'User'
export type UserName = 'Filippo' | 'Mariane' | 'Marina' | 'Thairine' | 'Thais'

export const USERS: { name: UserName; role: UserRole }[] = [
  { name: 'Filippo', role: 'Admin' },
  { name: 'Mariane', role: 'Admin' },
  { name: 'Marina', role: 'User' },
  { name: 'Thairine', role: 'User' },
  { name: 'Thais', role: 'User' },
]

export type ProjectStatus =
  | 'Estudo Inicial'
  | 'Proposta Sinal'
  | 'Elaboração Orçamento'
  | 'Informações necessárias'
  | 'Projeto executivo'
  | 'Entrega materiais'
  | 'Ajustes finais'
  | 'Finalizado'

export const STATUS_OPTIONS: ProjectStatus[] = [
  'Estudo Inicial',
  'Proposta Sinal',
  'Elaboração Orçamento',
  'Informações necessárias',
  'Projeto executivo',
  'Entrega materiais',
  'Ajustes finais',
  'Finalizado',
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
  city: string
  state: string
  history: ProjectHistoryItem[]
}
