import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getProjetos, Projeto } from '@/services/projetos'
import { useAuth } from '@/hooks/use-auth'
import type { Database } from '@/lib/supabase/types'

type Contato = Database['public']['Tables']['contatos']['Row']

interface ProjectStoreContextType {
  projects: Projeto[]
  contacts: Contato[]
  loading: boolean
  refreshProjects: () => Promise<void>
  refreshContacts: () => Promise<void>
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined)

// SPEC-043: eventos de realtime chegavam um a um e cada um disparava um
// refetch completo de `projetos`/`contatos` para todos os navegadores
// conectados. Em qualquer sequência de mudanças (ex.: salvar um projeto com
// várias parcelas, ou uma edição em lote) isso multiplicava o mesmo fetch
// pesado várias vezes seguidas. O debounce junta tudo em uma única busca por
// janela de tempo.
const REALTIME_DEBOUNCE_MS = 1500

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Projeto[]>([])
  const [contacts, setContacts] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  // Entrando pela Central (?sso_code), o provider monta ANTES da troca do
  // código virar sessão: a busca inicial saía sem usuário, a RLS devolvia
  // lista vazia e nada buscava de novo — Projetos só aparecia com F5. Agora
  // a carga depende do usuário logado e refaz quando ele fica disponível.
  const { user } = useAuth()
  const userId = user?.id ?? null

  const refreshProjects = useCallback(async () => {
    try {
      const data = await getProjetos()
      setProjects(data || [])
    } catch (e) {
      console.error('Erro ao carregar projetos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshContacts = useCallback(async () => {
    try {
      const { data } = await supabase.from('contatos').select('*').order('nome').limit(5000)
      if (data) setContacts(data)
    } catch (e) {
      console.error('Erro ao carregar contatos:', e)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setProjects([])
      setContacts([])
      setLoading(true)
      return
    }

    setLoading(true)
    refreshProjects()
    refreshContacts()

    let projTimeout: ReturnType<typeof setTimeout> | null = null
    let contTimeout: ReturnType<typeof setTimeout> | null = null

    const debouncedRefreshProjects = () => {
      if (projTimeout) clearTimeout(projTimeout)
      projTimeout = setTimeout(refreshProjects, REALTIME_DEBOUNCE_MS)
    }

    const debouncedRefreshContacts = () => {
      if (contTimeout) clearTimeout(contTimeout)
      contTimeout = setTimeout(refreshContacts, REALTIME_DEBOUNCE_MS)
    }

    const projSub = supabase
      .channel('proj_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projetos' },
        debouncedRefreshProjects,
      )
      .subscribe()

    const contSub = supabase
      .channel('cont_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos' },
        debouncedRefreshContacts,
      )
      .subscribe()

    return () => {
      if (projTimeout) clearTimeout(projTimeout)
      if (contTimeout) clearTimeout(contTimeout)
      supabase.removeChannel(projSub)
      supabase.removeChannel(contSub)
    }
  }, [userId, refreshProjects, refreshContacts])

  const value = useMemo(
    () => ({
      projects,
      contacts,
      loading,
      refreshProjects,
      refreshContacts,
    }),
    [projects, contacts, loading, refreshProjects, refreshContacts],
  )

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>
}

export default function useProjectStore() {
  const context = useContext(ProjectStoreContext)
  if (!context) throw new Error('useProjectStore must be used within a ProjectStoreProvider')
  return context
}
