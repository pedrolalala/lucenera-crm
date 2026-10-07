import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useViewMode } from '@/hooks/use-view-mode'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Zap,
  Search,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Database } from '@/lib/supabase/types'

type ContatoRow = Database['public']['Tables']['contatos']['Row']

export default function Eletricistas() {
  const [eletricistas, setEletricistas] = useState<ContatoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [eletricistaToDelete, setEletricistaToDelete] = useState<ContatoRow | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useViewMode('eletricistas', 'cards')

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cidade: '',
    estado: '',
  })
  const { toast } = useToast()

  const fetchEletricistas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('tipo', 'eletricista')
      .order('nome')
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setEletricistas(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEletricistas()

    const channel = supabase
      .channel('contatos_eletricistas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos', filter: 'tipo=eq.eletricista' },
        () => {
          fetchEletricistas()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // SPEC-044: o deep-link ?view=Nome navega direto para a página cheia.
  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && eletricistas.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = eletricistas.find((e) => e.nome?.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = eletricistas.find((e) => e.nome?.toLowerCase().includes(normalizedView))
      }

      if (match) {
        navigate(`/contatos/eletricistas/${match.id}`, { replace: true })
        return
      }

      setSearchTerm(viewName)
      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, eletricistas, setSearchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome) {
      toast({ title: 'Atenção', description: 'Nome é obrigatório.', variant: 'destructive' })
      return
    }

    const { error } = await supabase.from('contatos').insert([{ ...formData, tipo: 'eletricista' }])
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Eletricista cadastrado com sucesso.' })
      setOpen(false)
      setFormData({ nome: '', telefone: '', email: '', cidade: '', estado: '' })
      fetchEletricistas()
    }
  }

  const handleDelete = async () => {
    if (eletricistaToDelete && eletricistaToDelete.id) {
      const { error } = await supabase.from('contatos').delete().eq('id', eletricistaToDelete.id)
      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Eletricista excluído com sucesso' })
        fetchEletricistas()
      }
      setEletricistaToDelete(null)
    }
  }

  const viewEletricista = (el: ContatoRow) => {
    navigate(`/contatos/eletricistas/${el.id}`)
  }

  const filtered = eletricistas.filter((e) =>
    e.nome?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Eletricistas
          </h1>
          <p className="text-muted-foreground mt-1">Gestão de eletricistas parceiros</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto flex-col sm:flex-row">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto">
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'cards'
                  ? 'bg-white shadow-sm flex-1 sm:flex-none'
                  : 'flex-1 sm:flex-none'
              }
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'table'
                  ? 'bg-white shadow-sm flex-1 sm:flex-none'
                  : 'flex-1 sm:flex-none'
              }
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-2" /> Planilha
            </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Eletricista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Eletricista</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do eletricista ou empresa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Input
                      id="estado"
                      maxLength={2}
                      className="uppercase"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-foreground">Nenhum eletricista encontrado</h3>
              <p className="text-muted-foreground mt-1">
                Ajuste os filtros ou cadastre um novo eletricista.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((el) => (
                <Card
                  key={el.id}
                  className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 flex flex-col animate-fade-in"
                  onClick={() => viewEletricista(el)}
                >
                  <CardHeader className="pb-3 relative">
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          viewEletricista(el)
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEletricistaToDelete(el)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="pr-16">
                      <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {el.nome}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground pt-2">
                    {el.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{el.email}</span>
                      </div>
                    )}
                    {(el.celular || el.telefone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{el.celular || el.telefone}</span>
                      </div>
                    )}
                    {(el.cidade || el.estado) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {[el.cidade, el.estado].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-3 border-t bg-slate-50/50">
                    <Button
                      variant="default"
                      className="w-full shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        viewEletricista(el)
                      }}
                    >
                      Ver Detalhes
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border animate-fade-in">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((el) => (
                    <TableRow
                      key={el.id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => viewEletricista(el)}
                    >
                      <TableCell className="font-medium">{el.nome}</TableCell>
                      <TableCell>{el.telefone || el.celular || '-'}</TableCell>
                      <TableCell>{el.email || '-'}</TableCell>
                      <TableCell>{el.cidade ? `${el.cidade}/${el.estado || '-'}` : '-'}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewEletricista(el)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewEletricista(el)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEletricistaToDelete(el)}
                          title="Excluir"
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!eletricistaToDelete}
        onOpenChange={(open) => !open && setEletricistaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Eletricista</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{eletricistaToDelete?.nome}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
