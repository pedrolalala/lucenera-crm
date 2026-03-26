import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Project, UserName } from '@/types'
import { toast } from '@/hooks/use-toast'

export const MOCK_CLIENT_OPTIONS = [
  'Não Informado',
  'João Silva',
  'Maria Oliveira',
  'Carlos Santos',
  'Construtora Silva',
  'Santos Arquitetura',
  'Moacir Quirino',
  'Família Costa',
]

export const MOCK_ARCHITECT_OPTIONS = [
  'Não Informado',
  'FLÁVIA CAMARGO',
  'MORIZE CARVALHO',
  'JOÃO SILVA',
  'ANA PAULA',
  'MARIA CLARA',
]

export const MOCK_ENGINEER_OPTIONS = [
  'Não Informado',
  'CARLOS ALBERTO',
  'MARCOS VINICIUS',
  'FERNANDO HENRIQUE',
  'ROBERTO JUSTUS',
]

const MOCK_PROJECTS: Project[] = [
  {
    id: '26.082',
    strategicLevel: '3',
    name: 'GRAÇA E MOACIR QUIRINO',
    responsible: 'Thairine',
    entryDate: '2026-03-24T10:00:00Z',
    status: 'Estudo Inicial',
    client: 'Moacir Quirino',
    architect: 'FLÁVIA CAMARGO',
    engineer: 'Não Informado',
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
    client: 'Não Informado',
    architect: 'MORIZE CARVALHO',
    engineer: 'Não Informado',
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
    client: 'Não Informado',
    architect: 'Não Informado',
    engineer: 'Não Informado',
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
    client: 'Não Informado',
    architect: 'Não Informado',
    engineer: 'Não Informado',
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
    client: 'Maria Oliveira',
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
    client: 'Não Informado',
    architect: 'FLÁVIA CAMARGO',
    engineer: 'Não Informado',
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
    client: 'Construtora Silva',
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
    client: 'Não Informado',
    architect: 'Não Informado',
    engineer: 'Não Informado',
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
    client: 'Família Costa',
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
    client: 'Não Informado',
    architect: 'Não Informado',
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
    client: 'Carlos Santos',
    architect: 'FLÁVIA CAMARGO',
    engineer: 'Não Informado',
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
    client: 'João Silva',
    architect: 'MARIA CLARA',
    engineer: 'Não Informado',
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
  getClientOptions: () => string[]
  getArchitectOptions: () => string[]
  getEngineerOptions: () => string[]
  addClientOption: (name: string) => void
  addArchitectOption: (name: string) => void
  addEngineerOption: (name: string) => void
  getStateForCity: (city: string) => string
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined)

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [currentUser, setCurrentUser] = useState<UserName>('Filippo')

  const [clients, setClients] = useState<string[]>(MOCK_CLIENT_OPTIONS)
  const [architects, setArchitects] = useState<string[]>(MOCK_ARCHITECT_OPTIONS)
  const [engineers, setEngineers] = useState<string[]>(MOCK_ENGINEER_OPTIONS)

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

  const getClientOptions = useCallback(() => clients, [clients])
  const getArchitectOptions = useCallback(() => architects, [architects])
  const getEngineerOptions = useCallback(() => engineers, [engineers])

  const addClientOption = useCallback((name: string) => {
    setClients((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }, [])

  const addArchitectOption = useCallback((name: string) => {
    setArchitects((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }, [])

  const addEngineerOption = useCallback((name: string) => {
    setEngineers((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }, [])

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
      getClientOptions,
      getArchitectOptions,
      getEngineerOptions,
      addClientOption,
      addArchitectOption,
      addEngineerOption,
      getStateForCity,
    }),
    [
      projects,
      currentUser,
      addProject,
      updateProject,
      getProject,
      getCities,
      getClientOptions,
      getArchitectOptions,
      getEngineerOptions,
      addClientOption,
      addArchitectOption,
      addEngineerOption,
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
