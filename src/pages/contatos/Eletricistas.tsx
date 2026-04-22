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
import { Label } from '@/components/ui/label'
import { Database } from '@/lib/supabase/types'

type ContatoRow = Database['public']['Tables']['contatos']['Row']

export default function Eletricistas() {
  const [eletricistas, setEletricistas] = useState<ContatoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [viewingEletricista, setViewingEletricista] = useState<ContatoRow | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [cameFromView, setCameFromView] = useState(false)
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
  }, [])

  useEffect(() => {
    const viewName = searchParams.get('view')
    if (viewName && eletricistas.length > 0) {
      const normalizedView = viewName.toLowerCase().trim()
      let match = eletricistas.find((e) => e.nome?.toLowerCase().trim() === normalizedView)
      if (!match) {
        match = eletricistas.find((e) => e.nome?.toLowerCase().includes(normalizedView))
      }

      if (match) {
        setViewingEletricista(match)
        setIsViewModalOpen(true)
        setCameFromView(true)
      } else {
        setSearchTerm(viewName)
      }

      searchParams.delete('view')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, eletricistas, setSearchParams])

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

  const openViewModal = (el: ContatoRow) => {
    setViewingEletricista(el)
    setIsViewModalOpen(true)
    setCameFromView(false)
  }

  const handleCloseViewModal = (open: boolean) => {
    if (!open) {
      setIsViewModalOpen(false)
      if (cameFromView) {
        navigate(-1)
      }
    } else {
      setIsViewModalOpen(true)
    }
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
                  onClick={() => openViewModal(el)}
                >
                  <CardHeader className="pb-3 relative">
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
                        openViewModal(el)
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
                      onClick={() => openViewModal(el)}
                    >
                      <TableCell className="font-medium">{el.nome}</TableCell>
                      <TableCell>{el.telefone || el.celular || '-'}</TableCell>
                      <TableCell>{el.email || '-'}</TableCell>
                      <TableCell>{el.cidade ? `${el.cidade}/${el.estado || '-'}` : '-'}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewModal(el)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
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

      <Dialog open={isViewModalOpen} onOpenChange={handleCloseViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Eletricista</DialogTitle>
          </DialogHeader>
          {viewingEletricista && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 py-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Nome</h4>
                <p className="text-foreground">{viewingEletricista.nome || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Telefone</h4>
                <p className="text-foreground">
                  {viewingEletricista.telefone || viewingEletricista.celular || '-'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">E-mail</h4>
                <p className="text-foreground">{viewingEletricista.email || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Cidade/UF</h4>
                <p className="text-foreground">
                  {viewingEletricista.cidade
                    ? `${viewingEletricista.cidade}/${viewingEletricista.estado || '-'}`
                    : '-'}
                </p>
              </div>
              {viewingEletricista.observacoes && (
                <div className="sm:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Observações</h4>
                  <p className="text-foreground whitespace-pre-wrap">
                    {viewingEletricista.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => handleCloseViewModal(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
