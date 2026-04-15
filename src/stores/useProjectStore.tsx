import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getProjetos, Projeto } from '@/services/projetos'
import type { Database } from '@/lib/supabase/types'

type Contato = Database['public']['Tables']['contatos']['Row']

interface ProjectStoreContextType {
  projects: Projeto[]
  contacts: Contato[]
  refreshProjects: () => Promise<void>
  refreshContacts: () => Promise<void>
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined)

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Projeto[]>([])
  const [contacts, setContacts] = useState<Contato[]>([])

  const refreshProjects = useCallback(async () => {
    try {
      const data = await getProjetos()
      setProjects(data || [])
    } catch (e) {
      console.error('Erro ao carregar projetos:', e)
    }
  }, [])

  const refreshContacts = useCallback(async () => {
    try {
      const { data } = await supabase.from('contatos').select('*').order('nome')
      if (data) setContacts(data)
    } catch (e) {
      console.error('Erro ao carregar contatos:', e)
    }
  }, [])

  useEffect(() => {
    refreshProjects()
    refreshContacts()

    const projSub = supabase
      .channel('proj_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projetos' }, refreshProjects)
      .subscribe()

    const contSub = supabase
      .channel('cont_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contatos' }, refreshContacts)
      .subscribe()

    return () => {
      supabase.removeChannel(projSub)
      supabase.removeChannel(contSub)
    }
  }, [refreshProjects, refreshContacts])

  const value = useMemo(
    () => ({
      projects,
      contacts,
      refreshProjects,
      refreshContacts,
    }),
    [projects, contacts, refreshProjects, refreshContacts],
  )

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>
}

export default function useProjectStore() {
  const context = useContext(ProjectStoreContext)
  if (!context) throw new Error('useProjectStore must be used within a ProjectStoreProvider')
  return context
}
