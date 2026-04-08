import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { UserPlus, ShieldAlert, Users, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Usuarios() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('User')
  const [isLoading, setIsLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<any[]>([])

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_crm' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setUsuarios(data)
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: userId, error } = await supabase.rpc('create_user', {
        p_email: email,
        p_name: name,
        p_password: password,
        p_role: role,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!userId) {
        throw new Error('Falha ao obter ID do usuário criado.')
      }

      toast({
        title: 'Usuário criado com sucesso!',
        description: `O usuário ${name} foi cadastrado no banco de dados com acesso ao sistema.`,
      })

      setEmail('')
      setName('')
      setPassword('')
      fetchUsuarios()
    } catch (err: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: err.message || 'Verifique se você tem permissão de administrador.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja remover este usuário da lista (o acesso via Auth pode ser mantido)?',
      )
    )
      return

    try {
      const { error } = await supabase
        .from('usuarios_crm' as any)
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Usuário removido',
        description: 'O registro foi apagado do banco de dados.',
      })
      fetchUsuarios()
    } catch (err: any) {
      toast({
        title: 'Erro ao remover usuário',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários do Sistema</h1>
        <p className="text-muted-foreground mt-2">Gerencie os acessos e dados da equipe no CRM.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Novo Usuário
            </CardTitle>
            <CardDescription>
              Crie uma conta para um novo membro da equipe. Apenas administradores podem realizar
              esta ação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Pedro Henrique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="pedro@lucenera.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha Inicial</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="User">Usuário Padrão</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Criando e Salvando...' : 'Criar Usuário'}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldAlert className="h-3 w-3 text-amber-500" />
                  <span>Acesso imediato e registro na tabela usuarios_crm</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe Cadastrada (usuarios_crm)
            </CardTitle>
            <CardDescription>
              Lista de todos os usuários gerenciados de forma centralizada pelo banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado na tabela usuarios_crm.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {user.nome?.substring(0, 2).toUpperCase() || 'US'}
                              </AvatarFallback>
                            </Avatar>
                            {user.nome}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'Admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
