import type { Projeto } from '@/services/projetos'

interface SortableProject {
  codigo: string | null
  data_entrada: string | null
}

function isGroupA(codigo: string): boolean {
  return /^\d{2}\.\d+$/.test(codigo)
}

function isGroupB(codigo: string): boolean {
  return codigo.startsWith('COM') || codigo.startsWith('V')
}

function compareGroupA(a: string, b: string): number {
  const [yearA, seqA] = a.split('.').map(Number)
  const [yearB, seqB] = b.split('.').map(Number)

  if (yearA !== yearB) return yearB - yearA
  return seqB - seqA
}

function compareGroupB<T extends SortableProject>(a: T, b: T): number {
  const dateA = a.data_entrada ? new Date(a.data_entrada).getTime() : 0
  const dateB = b.data_entrada ? new Date(b.data_entrada).getTime() : 0
  return dateB - dateA
}

export function sortProjectsByCode<T extends SortableProject>(projects: T[]): T[] {
  const groupA: T[] = []
  const groupB: T[] = []
  const others: T[] = []

  for (const p of projects) {
    const code = (p.codigo ?? '').trim()
    if (code && isGroupA(code)) {
      groupA.push(p)
    } else if (code && isGroupB(code)) {
      groupB.push(p)
    } else {
      others.push(p)
    }
  }

  groupA.sort((a, b) => compareGroupA(a.codigo!, b.codigo!))
  groupB.sort(compareGroupB)
  others.sort(compareGroupB)

  return [...groupA, ...groupB, ...others]
}

export function sortProjetos(projects: Projeto[]): Projeto[] {
  return sortProjectsByCode(projects)
}
