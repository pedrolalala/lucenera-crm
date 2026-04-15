import { useEffect } from 'react'
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
import Eletricistas from './pages/contatos/Eletricistas'
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
