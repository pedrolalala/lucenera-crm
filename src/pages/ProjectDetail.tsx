import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjeto, updateProjetoById, type Projeto } from '@/services/projetos'
import { Constants } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import useProjectStore from '@/stores/useProjectStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  User,
  UserCircle,
  Briefcase,
  Loader2,
  Zap,
  Edit2,
  Save,
  X,
  DollarSign,
  HardHat,
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { contacts } = useProjectStore()

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Projeto>>({})

  useEffect(() => {
    if (!id) return
    getProjeto(id)
      .then((data) => {
        setProjeto(data)
        setEditForm(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/projetos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Projetos
        </Button>
      </div>
    )
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(projeto)
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    if (!projeto.id) return
    setSaving(true)
    try {
      const payload = {
        codigo: editForm.codigo,
        nome: editForm.nome,
        status: editForm.status || null,
        nivel_estrategico: editForm.nivel_estrategico || null,
        data_entrada: editForm.data_entrada || null,
        cidade: editForm.cidade,
        estado: editForm.estado,
        responsavel_id: editForm.responsavel_id,
        cliente_id: editForm.cliente_id,
        arquiteto_id: editForm.arquiteto_id,
        responsavel_obra_id: editForm.responsavel_obra_id,
      } as any

      await updateProjetoById(projeto.id, payload)

      const updated = await getProjeto(projeto.id)
      setProjeto(updated)
      setEditForm(updated)
      setIsEditing(false)
      toast({ title: 'Projeto atualizado com sucesso' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Projeto, value: string | null) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR')
  }

  const clientes = contacts.filter((c) => c.tipo === 'cliente')
  const arquitetos = contacts.filter((c) => c.tipo === 'arquiteto')
  const engenheiros = contacts.filter((c) => c.tipo === 'engenheiro')
  const outros = contacts.filter((c) => c.tipo === 'outro')

  const valorTotal =
    projeto.projeto_parcelas?.reduce((acc, p) => acc + Number(p.valor), 0) ||
    Number(projeto.valor_total) ||
    0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projetos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <Input
                  value={editForm.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="h-10 text-2xl font-bold max-w-[400px]"
                />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight">
                  {projeto.nome || 'Projeto sem nome'}
                </h1>
              )}
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground font-medium">#</span>
                  <Input
                    value={editForm.codigo || ''}
                    onChange={(e) => handleChange('codigo', e.target.value.replace(/[^\d.]/g, ''))}
                    onBlur={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '')
                      if (onlyNumbers.length >= 3) {
                        handleChange('codigo', `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`)
                      }
                    }}
                    className="h-8 w-24 text-sm"
                  />
                </div>
              ) : (
                <Badge variant="secondary" className="text-sm">
                  #{projeto.codigo}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Visualizando detalhes completos do projeto</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Projeto
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Status</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.status || ''}
                    onValueChange={(v) => handleChange('status', v)}
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.projeto_status.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={projeto.status === 'Finalizado' ? 'default' : 'secondary'}>
                    {projeto.status || 'Não informado'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Nível Estratégico</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.nivel_estrategico || 'null'}
                    onValueChange={(v) =>
                      handleChange('nivel_estrategico', v === 'null' ? null : v)
                    }
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {Constants.public.Enums.projeto_nivel.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium">
                    {projeto.nivel_estrategico || 'Não informado'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Data de Entrada</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.data_entrada?.split('T')[0] || ''}
                    onChange={(e) => handleChange('data_entrada', e.target.value)}
                    className="h-8 max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(projeto.data_entrada)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Valor Fechado</span>
              <div className="w-2/3 flex justify-end">
                <span className="font-medium flex items-center gap-2 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(valorTotal)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground w-1/3">Localização</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2 max-w-[250px]">
                    <Input
                      value={editForm.cidade || ''}
                      onChange={(e) => handleChange('cidade', e.target.value)}
                      className="h-8"
                      placeholder="Cidade"
                    />
                    <Input
                      value={editForm.estado || ''}
                      onChange={(e) => handleChange('estado', e.target.value)}
                      className="h-8 w-16"
                      placeholder="UF"
                    />
                  </div>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.cidade || '-'} / {projeto.estado || '-'}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Responsável Principal</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.responsavel_id || 'null'}
                    onValueChange={(v) => handleChange('responsavel_id', v === 'null' ? null : v)}
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {outros.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.responsavel?.nome || projeto.responsavel_nome || 'Não definido'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Cliente</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.cliente_id || 'null'}
                    onValueChange={(v) => handleChange('cliente_id', v === 'null' ? null : v)}
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.cliente?.nome ? (
                      <Link
                        to={`/contatos/clientes?view=${encodeURIComponent(projeto.cliente.nome)}`}
                        className="text-primary hover:underline"
                      >
                        {projeto.cliente.nome}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Arquiteto Designado</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.arquiteto_id || 'null'}
                    onValueChange={(v) => handleChange('arquiteto_id', v === 'null' ? null : v)}
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {arquitetos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.arquiteto?.nome ? (
                      <Link
                        to={`/contatos/arquitetos?view=${encodeURIComponent(projeto.arquiteto.nome)}`}
                        className="text-primary hover:underline"
                      >
                        {projeto.arquiteto.nome}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground w-1/3">Engenheiro Responsável</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Select
                    value={editForm.responsavel_obra_id || 'null'}
                    onValueChange={(v) =>
                      handleChange('responsavel_obra_id', v === 'null' ? null : v)
                    }
                  >
                    <SelectTrigger className="h-8 max-w-[200px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {engenheiros.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <HardHat className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {projeto.engenheiro?.nome ? (
                      <Link
                        to={`/contatos/engenheiros?view=${encodeURIComponent(projeto.engenheiro.nome)}`}
                        className="text-primary hover:underline"
                      >
                        {projeto.engenheiro.nome}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Parcelas do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projeto.projeto_parcelas && projeto.projeto_parcelas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[80px]">Nº</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Pago</TableHead>
                      <TableHead className="text-right">Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...projeto.projeto_parcelas]
                      .sort((a, b) => a.numero_parcela - b.numero_parcela)
                      .map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.numero_parcela}</TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            {formatCurrency(Number(p.valor))}
                          </TableCell>
                          <TableCell>{formatDate(p.data_vencimento)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                p.status === 'paga'
                                  ? 'default'
                                  : p.status === 'atrasada'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            {p.valor_pago ? formatCurrency(Number(p.valor_pago)) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDate(p.data_pagamento)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border rounded-md bg-muted/20">
                Nenhuma parcela cadastrada para este projeto.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
