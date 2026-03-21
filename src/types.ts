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
  | 'Estudo inicial'
  | 'Anteprojeto'
  | 'Projeto definitivo'
  | 'Orçamento'
  | 'Projeto executivo'
  | 'Entrega materiais'
  | 'Ajustes finais'
  | 'Finalizado'

export const STATUS_OPTIONS: ProjectStatus[] = [
  'Estudo inicial',
  'Anteprojeto',
  'Projeto definitivo',
  'Orçamento',
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
  name: string
  responsible: UserName
  status: ProjectStatus
  entryDate: string
  architect: string
  city: string
  state: string
  history: ProjectHistoryItem[]
}
