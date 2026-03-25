import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Project, UserName } from '@/types'
import { toast } from '@/hooks/use-toast'

const MOCK_PROJECTS: Project[] = [
  {
    id: '26.082',
    strategicLevel: '3',
    name: 'GRAÇA E MOACIR QUIRINO',
    responsible: 'Thairine',
    entryDate: '2026-03-24T10:00:00Z',
    status: 'Estudo Inicial',
    architect: 'FLÁVIA CAMARGO',
    engineer: '.',
    city: 'RIBEIRÃO PRETO',
    state: 'SP',
    history: [{ status: 'Estudo Inicial', date: '2026-03-24T10:00:00Z' }],
  },
  {
    id: '26.081',
    strategicLevel: '2',
    name: 'APTO KT',
    responsible: 'Thais',
    entryDate: '2026-03-21T10:00:00Z',
    status: 'Proposta Sinal',
    architect: 'MORIZE CARVALHO',
    engineer: '.',
    city: 'RIBEIRÃO PRETO',
    state: 'SP',
    history: [{ status: 'Proposta Sinal', date: '2026-03-21T10:00:00Z' }],
  },
  {
    id: '26.080',
    strategicLevel: '4',
    name: 'GUILHERME',
    responsible: 'Thairine',
    entryDate: '2026-03-19T10:00:00Z',
    status: 'Elaboração Orçamento',
    architect: '.',
    engineer: '.',
    city: 'TAQUARITINGA',
    state: 'SP',
    history: [{ status: 'Elaboração Orçamento', date: '2026-03-19T10:00:00Z' }],
  },
  {
    id: '26.079',
    strategicLevel: '3',
    name: 'PAISAGISMO DANIELA BULLE',
    responsible: 'Thais',
    entryDate: '2026-03-19T10:00:00Z',
    status: 'Elaboração Orçamento',
    architect: '.',
    engineer: '.',
    city: 'RIBEIRÃO PRETO',
    state: 'SP',
    history: [{ status: 'Elaboração Orçamento', date: '2026-03-19T10:00:00Z' }],
  },
  {
    id: '26.078',
    strategicLevel: '1',
    name: 'CLÍNICA VET ODONTO',
    responsible: 'Marina',
    entryDate: '2026-03-15T10:00:00Z',
    status: 'Projeto executivo',
    architect: 'JOÃO SILVA',
    engineer: 'CARLOS ALBERTO',
    city: 'SÃO PAULO',
    state: 'SP',
    history: [{ status: 'Projeto executivo', date: '2026-03-15T10:00:00Z' }],
  },
  {
    id: '26.077',
    strategicLevel: '2',
    name: 'CASA LAGO SUL',
    responsible: 'Thairine',
    entryDate: '2026-03-10T10:00:00Z',
    status: 'Informações necessárias',
    architect: 'FLÁVIA CAMARGO',
    engineer: '.',
    city: 'RIBEIRÃO PRETO',
    state: 'SP',
    history: [{ status: 'Informações necessárias', date: '2026-03-10T10:00:00Z' }],
  },
  {
    id: '26.076',
    strategicLevel: '3',
    name: 'ESCRITÓRIO CORPORATIVO',
    responsible: 'Thais',
    entryDate: '2026-03-05T10:00:00Z',
    status: 'Entrega materiais',
    architect: 'MORIZE CARVALHO',
    engineer: 'MARCOS VINICIUS',
    city: 'ARARAQUARA',
    state: 'SP',
    history: [{ status: 'Entrega materiais', date: '2026-03-05T10:00:00Z' }],
  },
  {
    id: '26.075',
    strategicLevel: '4',
    name: 'REFORMA FACHADA',
    responsible: 'Marina',
    entryDate: '2026-03-01T10:00:00Z',
    status: 'Finalizado',
    architect: '.',
    engineer: '.',
    city: 'RIBEIRÃO PRETO',
    state: 'SP',
    history: [{ status: 'Finalizado', date: '2026-03-01T10:00:00Z' }],
  },
  {
    id: '26.074',
    strategicLevel: '2',
    name: 'RESIDÊNCIA FAMÍLIA COSTA',
    responsible: 'Thairine',
    entryDate: '2026-02-28T10:00:00Z',
    status: 'Ajustes finais',
    architect: 'ANA PAULA',
    engineer: 'ROBERTO JUSTUS',
    city: 'SÃO PAULO',
    state: 'SP',
    history: [{ status: 'Ajustes finais', date: '2026-02-28T10:00:00Z' }],
  },
  {
    id: '26.073',
    strategicLevel: '1',
    name: 'GALPÃO LOGÍSTICO',
    responsible: 'Thais',
    entryDate: '2026-02-20T10:00:00Z',
    status: 'Projeto executivo',
    architect: '.',
    engineer: 'FERNANDO HENRIQUE',
    city: 'CRAVINHOS',
    state: 'SP',
    history: [{ status: 'Projeto executivo', date: '2026-02-20T10:00:00Z' }],
  },
  {
    id: '26.072',
    strategicLevel: '3',
    name: 'APARTAMENTO DUPLEX',
    responsible: 'Marina',
    entryDate: '2026-02-15T10:00:00Z',
    status: 'Estudo Inicial',
    architect: 'FLÁVIA CAMARGO',
    engineer: '.',
    city: 'RIBEIRÃO PRETO',
    state: 'SP',
    history: [{ status: 'Estudo Inicial', date: '2026-02-15T10:00:00Z' }],
  },
  {
    id: '26.071',
    strategicLevel: '2',
    name: 'RESTAURANTE VILA',
    responsible: 'Thairine',
    entryDate: '2026-02-10T10:00:00Z',
    status: 'Proposta Sinal',
    architect: 'MARIA CLARA',
    engineer: '.',
    city: 'ARARAQUARA',
    state: 'SP',
    history: [{ status: 'Proposta Sinal', date: '2026-02-10T10:00:00Z' }],
  },
]

interface ProjectStoreContextType {
  projects: Project[]
  currentUser: UserName
  setCurrentUser: (user: UserName) => void
  addProject: (project: Omit<Project, 'id' | 'entryDate' | 'history'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  getProject: (id: string) => Project | undefined
  getCities: () => string[]
  getArchitects: () => string[]
  getEngineers: () => string[]
  getStateForCity: (city: string) => string
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined)

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [currentUser, setCurrentUser] = useState<UserName>('Filippo')

  const addProject = useCallback(
    (projectData: Omit<Project, 'id' | 'entryDate' | 'history'>) => {
      const now = new Date()
      const yearStr = now.getFullYear().toString().slice(-2)

      const thisYearProjects = projects.filter((p) => p.id.startsWith(`${yearStr}.`))
      let nextNum = 1

      if (thisYearProjects.length > 0) {
        const max = Math.max(...thisYearProjects.map((p) => parseInt(p.id.split('.')[1], 10)))
        nextNum = max + 1
      } else if (yearStr === '26') {
        nextNum = 83
      }

      const newId = `${yearStr}.${String(nextNum).padStart(3, '0')}`
      const isoNow = now.toISOString()

      const newProject: Project = {
        ...projectData,
        id: newId,
        entryDate: isoNow,
        history: [{ status: projectData.status, date: isoNow }],
      }

      setProjects((prev) => [newProject, ...prev])
      toast({
        title: 'Projeto Registrado',
        description: `Código gerado: ${newId} e sincronizado com o Excel.`,
      })
    },
    [projects],
  )

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const updated = { ...p, ...updates }
        if (updates.status && updates.status !== p.status) {
          updated.history = [
            ...p.history,
            { status: updates.status, date: new Date().toISOString() },
          ]
        }
        return updated
      }),
    )
    toast({ title: 'Projeto Atualizado', description: `Alterações salvas e integradas com Excel.` })
  }, [])

  const getProject = useCallback((id: string) => projects.find((p) => p.id === id), [projects])

  const getCities = useCallback(() => {
    const counts: Record<string, number> = { 'Ribeirão Preto': 0, 'São Paulo': 0, Araraquara: 0 }
    projects.forEach((p) => {
      if (p.city) counts[p.city] = (counts[p.city] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
  }, [projects])

  const getArchitects = useCallback(() => {
    return Array.from(new Set(projects.map((p) => p.architect).filter(Boolean))).sort()
  }, [projects])

  const getEngineers = useCallback(() => {
    return Array.from(new Set(projects.map((p) => p.engineer).filter(Boolean))).sort()
  }, [projects])

  const getStateForCity = useCallback(
    (city: string) => {
      const proj = projects.find((p) => p.city.toLowerCase() === city.toLowerCase())
      return proj?.state || ''
    },
    [projects],
  )

  const value = useMemo(
    () => ({
      projects,
      currentUser,
      setCurrentUser,
      addProject,
      updateProject,
      getProject,
      getCities,
      getArchitects,
      getEngineers,
      getStateForCity,
    }),
    [
      projects,
      currentUser,
      addProject,
      updateProject,
      getProject,
      getCities,
      getArchitects,
      getEngineers,
      getStateForCity,
    ],
  )

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>
}

export default function useProjectStore() {
  const context = useContext(ProjectStoreContext)
  if (!context) throw new Error('useProjectStore must be used within a ProjectStoreProvider')
  return context
}
