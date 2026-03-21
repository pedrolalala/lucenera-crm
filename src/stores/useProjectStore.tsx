import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Project, UserName, USERS } from '@/types'
import { toast } from '@/hooks/use-toast'

const MOCK_PROJECTS: Project[] = [
  {
    id: 'LUC-001',
    name: 'Residência Villa Lobos',
    responsible: 'Marina',
    status: 'Orçamento',
    entryDate: '2023-09-15T10:00:00Z',
    architect: 'Studio Arthur Casas',
    city: 'São Paulo',
    state: 'SP',
    history: [
      { status: 'Estudo inicial', date: '2023-09-15T10:00:00Z' },
      { status: 'Orçamento', date: '2023-10-01T14:30:00Z' },
    ],
  },
  {
    id: 'LUC-002',
    name: 'Corporate Faria Lima',
    responsible: 'Thairine',
    status: 'Finalizado',
    entryDate: '2023-08-01T09:15:00Z',
    architect: 'Aflalo/Gasperini',
    city: 'São Paulo',
    state: 'SP',
    history: [
      { status: 'Estudo inicial', date: '2023-08-01T09:15:00Z' },
      { status: 'Projeto definitivo', date: '2023-09-10T11:00:00Z' },
      { status: 'Finalizado', date: '2023-11-20T16:45:00Z' },
    ],
  },
  {
    id: 'LUC-003',
    name: 'Casa de Campo Boa Vista',
    responsible: 'Thais',
    status: 'Anteprojeto',
    entryDate: '2024-01-10T08:30:00Z',
    architect: 'Bernardes Arquitetura',
    city: 'Porto Feliz',
    state: 'SP',
    history: [{ status: 'Estudo inicial', date: '2024-01-10T08:30:00Z' }],
  },
]

interface ProjectStoreContextType {
  projects: Project[]
  currentUser: UserName
  setCurrentUser: (user: UserName) => void
  addProject: (project: Omit<Project, 'id' | 'entryDate' | 'history'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  getProject: (id: string) => Project | undefined
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined)

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [currentUser, setCurrentUser] = useState<UserName>('Filippo')

  const addProject = useCallback(
    (projectData: Omit<Project, 'id' | 'entryDate' | 'history'>) => {
      const newId = `LUC-${String(projects.length + 1).padStart(3, '0')}`
      const now = new Date().toISOString()

      const newProject: Project = {
        ...projectData,
        id: newId,
        entryDate: now,
        history: [{ status: projectData.status, date: now }],
      }

      setProjects((prev) => [newProject, ...prev])
      toast({
        title: 'Projeto Salvo com Sucesso',
        description: `O projeto ${newId} foi registrado e sincronizado.`,
      })
    },
    [projects.length],
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

  const value = useMemo(
    () => ({
      projects,
      currentUser,
      setCurrentUser,
      addProject,
      updateProject,
      getProject,
    }),
    [projects, currentUser, addProject, updateProject, getProject],
  )

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>
}

export default function useProjectStore() {
  const context = useContext(ProjectStoreContext)
  if (!context) throw new Error('useProjectStore must be used within a ProjectStoreProvider')
  return context
}
