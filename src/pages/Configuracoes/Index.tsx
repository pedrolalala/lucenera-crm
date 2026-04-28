import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'
import { Shield, Users, Settings, Terminal, Activity, Key, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Configuracoes() {
  const [equipe, setEquipe] = useState<any[]>([])

  useEffect(() => {
    const fetchEquipe = async () => {
      const { data } = await supabase.from('usuarios').select('*').limit(5)
      if (data) setEquipe(data)
    }
    fetchEquipe()
  }, [])

  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <Tabs defaultValue="login" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="login" className="flex items-center gap-2 py-2.5">
            <Key className="h-4 w-4" />
            <span className="truncate">Login</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2 py-2.5">
            <Shield className="h-4 w-4" />
            <span className="truncate">Painel Admin</span>
          </TabsTrigger>
          <TabsTrigger value="equipe" className="flex items-center gap-2 py-2.5">
            <Users className="h-4 w-4" />
            <span className="truncate">Equipe</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2 py-2.5">
            <Settings className="h-4 w-4" />
            <span className="truncate">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="flex items-center gap-2 py-2.5">
            <Activity className="h-4 w-4" />
            <span className="truncate">Auditoria</span>
          </TabsTrigger>
          <TabsTrigger
            value="devzone"
            className="flex items-center gap-2 py-2.5 text-red-600 dark:text-red-400 data-[state=active]:text-red-700"
          >
            <Terminal className="h-4 w-4" />
            <span className="truncate">Dev Zone</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Login e Segurança */}
        <TabsContent value="login" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Login e Segurança</CardTitle>
              <CardDescription>
                Gerencie suas credenciais de acesso, senha e métodos de autenticação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 border-b pb-4">
                <h4 className="text-sm font-medium">Senha atual</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Sua senha foi atualizada recentemente e está segura.
                </p>
                <Button variant="outline" size="sm">
                  Alterar Senha
                </Button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Autenticação em duas etapas (2FA)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Adicione uma camada extra de segurança à sua conta exigindo um código de
                  verificação.
                </p>
                <Button variant="outline" size="sm">
                  Configurar 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Painel Administrativo */}
        <TabsContent value="admin" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription>
                Visão geral de licenças, integrações e infraestrutura do CRM.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Plano Enterprise</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sua licença atual permite usuários e armazenamento de projetos ilimitados.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Gerenciar Assinatura
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Status das Integrações</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li className="flex justify-between">
                      <span>Supabase Auth</span>{' '}
                      <span className="text-green-600 font-medium">Online</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Banco de Dados</span>{' '}
                      <span className="text-green-600 font-medium">Online</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Storage de Arquivos</span>{' '}
                      <span className="text-green-600 font-medium">Online</span>
                    </li>
                  </ul>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver Status Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Gestão de Equipe */}
        <TabsContent value="equipe" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Equipe</CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema, permissões e convites para novos membros.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {equipe.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Equipe Recente</h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {equipe.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                          {user.nome?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">{user.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="text-xs px-2 py-1 bg-muted rounded-full font-medium">
                          {user.role || 'viewer'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/30">
                <Users className="h-10 w-10 text-primary/60 mb-3" />
                <h3 className="text-base font-semibold tracking-tight">Módulo de Usuários</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md">
                  Acesse o painel completo de gestão de usuários para adicionar novos membros à
                  equipe, editar papéis e revogar acessos.
                </p>
                <Button asChild variant="default">
                  <Link to="/configuracoes/usuarios" className="flex items-center gap-2">
                    Acessar Gestão Completa <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Configurações do Sistema */}
        <TabsContent value="sistema" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Ajustes globais da plataforma, informações da empresa e preferências regionais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="shadow-none border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Atualize a logomarca, razão social, CNPJ e endereço para constar nos
                      orçamentos e relatórios gerados.
                    </p>
                    <Button variant="outline" size="sm">
                      Editar Dados
                    </Button>
                  </CardContent>
                </Card>
                <Card className="shadow-none border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preferências Regionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configuração de fuso horário, moeda padrão (BRL) e formato de datas aplicados
                      em toda a plataforma.
                    </p>
                    <Button variant="outline" size="sm">
                      Ajustar Preferências
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Logs de Auditoria */}
        <TabsContent value="auditoria" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria e Atividades</CardTitle>
              <CardDescription>
                Registro histórico de ações realizadas pelos usuários para monitoramento e
                transparência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {[
                  { user: 'Filippo', action: 'Sessão iniciada', time: 'Há 5 minutos' },
                  {
                    user: 'Admin',
                    action: 'Status do Projeto "Residência Silva" alterado para Concluído',
                    time: 'Há 2 horas',
                  },
                  {
                    user: 'Admin',
                    action: 'Novo cliente "Construtora Alfa" cadastrado',
                    time: 'Há 1 dia',
                  },
                  {
                    user: 'Filippo',
                    action: 'Exportação de relatório mensal em PDF',
                    time: 'Há 2 dias',
                  },
                  {
                    user: 'Sistema',
                    action: 'Backup semanal automático concluído',
                    time: 'Há 4 dias',
                  },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded-md transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Usuário: <span className="font-medium">{log.user}</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                      {log.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Carregar histórico completo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 6. Dev Zone */}
        <TabsContent value="devzone" className="space-y-4 animate-fade-in">
          <Card className="border-red-500/30 bg-red-500/5 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Terminal className="h-5 w-5" />
                DEV ZONE - Área de Desenvolvimento
              </CardTitle>
              <CardDescription className="text-red-900/60 dark:text-red-200/60 font-medium">
                Atenção: Área restrita a administradores técnicos e desenvolvedores. Alterações
                nestas configurações podem afetar a estabilidade da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border border-red-500/20 rounded-lg bg-background/80 backdrop-blur-sm">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span> Layout e Tema
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Substituição de variáveis CSS globais e customizações de layout avançadas.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Abrir Editor UI
                  </Button>
                </div>

                <div className="p-4 border border-red-500/20 rounded-lg bg-background/80 backdrop-blur-sm">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span> Webhooks & API
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Gerenciamento de chaves de API, webhooks e endpoints externos.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Gerenciar API
                  </Button>
                </div>

                <div className="p-4 border border-red-500/20 rounded-lg bg-background/80 backdrop-blur-sm">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> Feature Flags
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Ativação de funcionalidades experimentais (Beta) para testes de A/B.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Configurar Flags
                  </Button>
                </div>

                <div className="p-4 border border-red-500/20 rounded-lg bg-background/80 backdrop-blur-sm">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span> Cache de Sistema
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Invalidação forçada do cache do navegador e refetch de queries ativas.
                  </p>
                  <Button variant="destructive" size="sm" className="w-full">
                    Limpar Todo o Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
