import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProjectStoreProvider } from '@/stores/useProjectStore'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import AuthPage from '@/pages/Auth'

import Index from './pages/Index'
import Projetos from './pages/Projetos'
import ProjectNew from './pages/ProjectNew'
import ProjectDetail from './pages/ProjectDetail'
import UpdatePassword from './pages/UpdatePassword'
import Clientes from './pages/contatos/Clientes'
import Arquitetos from './pages/contatos/Arquitetos'
import Engenheiros from './pages/contatos/Engenheiros'
import Usuarios from './pages/Configuracoes/Usuarios'
import Orcamentos from './pages/Orcamentos'
import Configuracoes from './pages/Configuracoes/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando sistema...</div>
      </div>
    )
  }
  if (!user) return <AuthPage />
  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <ProjectStoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/configuracoes/usuarios" element={<Usuarios />} />
            </Route>
            <Route path="/atualizar-senha" element={<UpdatePassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ProjectStoreProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
