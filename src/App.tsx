import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProjectStoreProvider } from '@/stores/useProjectStore'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'

// SPEC-123: code-splitting por rota (mesmo padrão já em produção no RH,
// dashboard-rh-lucenera-5fe9c/src/App.tsx) — antes todas as páginas eram
// importadas de forma estática aqui, então o JS de toda tela do CRM
// entrava no bundle inicial mesmo que o usuário só visitasse uma.
const AuthPage = lazy(() => import('@/pages/Auth'))
const Index = lazy(() => import('./pages/Index'))
const Projetos = lazy(() => import('./pages/Projetos'))
const ProjectNew = lazy(() => import('./pages/ProjectNew'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'))
const Clientes = lazy(() => import('./pages/contatos/Clientes'))
const Arquitetos = lazy(() => import('./pages/contatos/Arquitetos'))
const Engenheiros = lazy(() => import('./pages/contatos/Engenheiros'))
const Eletricistas = lazy(() => import('./pages/contatos/Eletricistas'))
const Fornecedores = lazy(() => import('./pages/contatos/Fornecedores'))
const ContatoDetail = lazy(() => import('./pages/contatos/ContatoDetail'))
const Usuarios = lazy(() => import('./pages/Configuracoes/Usuarios'))
const Orcamentos = lazy(() => import('./pages/Orcamentos'))
const Configuracoes = lazy(() => import('./pages/Configuracoes/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Carregando sistema...</div>
  </div>
)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, hasAccess, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando sistema...</div>
      </div>
    )
  }
  if (!user) return <AuthPage />
  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center space-y-3">
          <h1 className="text-lg font-semibold">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta não tem permissão para acessar o CRM. Fale com um administrador se acredita
            que isso é um engano.
          </p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

const App = () => {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        typeof event.reason.message === 'string' &&
        (event.reason.message.includes('MetaMask') || event.reason.message.includes('ethereum'))
      ) {
        event.preventDefault()
      }
    }

    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        typeof event.message === 'string' &&
        (event.message.includes('MetaMask') || event.message.includes('ethereum'))
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <ProjectStoreProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/projetos" element={<Projetos />} />
                  <Route path="/novo" element={<ProjectNew />} />
                  <Route path="/projeto/:id" element={<ProjectDetail />} />
                  <Route path="/contatos/clientes" element={<Clientes />} />
                  <Route path="/contatos/arquitetos" element={<Arquitetos />} />
                  <Route path="/contatos/engenheiros" element={<Engenheiros />} />
                  <Route path="/contatos/eletricistas" element={<Eletricistas />} />
                  <Route path="/contatos/fornecedores" element={<Fornecedores />} />
                  <Route path="/contatos/:tipoPlural/:id" element={<ContatoDetail />} />
                  <Route path="/orcamentos" element={<Orcamentos />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/configuracoes/usuarios" element={<Usuarios />} />
                </Route>
                <Route path="/atualizar-senha" element={<UpdatePassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </ProjectStoreProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
