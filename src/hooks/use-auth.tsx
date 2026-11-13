import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { consumeCodeFromUrl } from '@/lib/cross-system-auth'
import { getUsuarioRoleCached } from '@/lib/usuario-role-cache'

interface AuthContextType {
  user: User | null
  session: Session | null
  hasAccess: boolean | null
  // SPEC-266: tem só o módulo 'fornecedores' do CRM (vê apenas a aba Fornecedores)
  somenteFornecedores: boolean
  // SPEC-292: abas liberadas quando NÃO tem o CRM inteiro (null = todas). Ex.: ['fornecedores','clientes']
  modulosPermitidos: string[] | null
  role: string | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [somenteFornecedores, setSomenteFornecedores] = useState(false)
  const [modulosPermitidos, setModulosPermitidos] = useState<string[] | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // SPEC-069: este app só checava estar logado, sem nenhuma permissão
  // granular do Hub. Consulta a mesma RPC que o Hub usa (hub_pode_executar,
  // SPEC-006) para o sistema inteiro ('crm', sem módulo/ação específicos).
  useEffect(() => {
    if (!user?.id) {
      setHasAccess(null)
      setSomenteFornecedores(false)
      setModulosPermitidos(null)
      return
    }
    const checar = (modulo: string | null) =>
      supabase.rpc('hub_pode_executar', {
        p_usuario_id: user.id,
        p_system_slug: 'crm',
        p_modulo_chave: modulo,
        p_acao: null,
      })
    // SPEC-266: permissão do sistema inteiro (modulo null) OU só do módulo 'fornecedores'
    Promise.all([checar(null), checar('fornecedores'), checar('clientes')]).then(([completo, forn, cli]) => {
      const temCompleto = Boolean(completo.data)
      const mods = [forn.data ? 'fornecedores' : null, cli.data ? 'clientes' : null].filter(Boolean) as string[]
      setHasAccess(temCompleto || mods.length > 0)
      setSomenteFornecedores(!temCompleto && mods.length === 1 && mods[0] === 'fornecedores')
      setModulosPermitidos(temCompleto ? null : mods)
    })
  }, [user?.id])

  // Role base (admin/gerente/operador/...) — usado pra gates simples de UI
  // (ex.: mostrar/esconder o botão de cadastrar funcionário, que exige
  // admin/gerente via RLS). RLS de usuarios já libera SELECT da própria
  // linha pra authenticated.
  useEffect(() => {
    if (!user?.id) {
      setRole(null)
      return
    }
    // SPEC-123: cache compartilhado com useSistemasPermitidos.ts — evita
    // duplicar esta mesma query de rede a cada carregamento de página.
    getUsuarioRoleCached(user.id).then(setRole)
  }, [user?.id])

  useEffect(() => {
    let mounted = true
    let initialized = false

    // Acesso vindo da Central chega com ?sso_code na URL. onAuthStateChange
    // dispara um evento inicial com a sessão que já existia ANTES da troca
    // desse código terminar (normalmente nula, numa aba nova) — se esse
    // evento resolvesse "loading" pra false direto, o app achava que
    // ninguém tinha logado antes da troca terminar, "bugando" o clique
    // vindo da Central. Por isso a resolução real só acontece depois do
    // consumeCodeFromUrl + getSession abaixo.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted || !initialized) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })

    consumeCodeFromUrl('crm')
      .catch(() => {})
      .finally(() => {
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
          if (!mounted) return
          initialized = true
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setLoading(false)
        })
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        hasAccess,
        somenteFornecedores,
        modulosPermitidos,
        role,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
