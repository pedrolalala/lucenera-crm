import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjeto, updateProjetoEdge, type Projeto } from '@/services/projetos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
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
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Projeto>>({})

  useEffect(() => {
    if (!id) return
    getProjeto(Number(id))
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
    if (!projeto.Codigo) return
    setSaving(true)
    try {
      await updateProjetoEdge(projeto.Codigo, editForm)
      setProjeto({ ...projeto, ...editForm })
      setIsEditing(false)
      toast({ title: 'Projeto atualizado com sucesso' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Projeto, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const getVal = (field: keyof Projeto, fallbackField?: string) => {
    if (isEditing) return editForm[field] || ''
    return projeto[field] || (fallbackField ? (projeto as any)[fallbackField] : '') || ''
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projetos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {projeto.Projeto || 'Projeto sem nome'}
              </h1>
              <Badge variant="secondary" className="text-sm">
                #
                {projeto.Codigo !== undefined && projeto.Codigo !== null
                  ? Number(projeto.Codigo).toLocaleString('pt-BR', {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })
                  : projeto.Codigo}
              </Badge>
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
              <div className="w-2/3 text-right flex justify-end">
                {isEditing ? (
                  <Input
                    value={getVal('Status', 'status')}
                    onChange={(e) => handleChange('Status', e.target.value)}
                    className="h-8 max-w-[200px] text-right"
                  />
                ) : (
                  <Badge
                    variant={getVal('Status', 'status') === 'Concluído' ? 'default' : 'secondary'}
                  >
                    {getVal('Status', 'status') || 'Não informado'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Nível Estratégico</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Input
                    value={getVal('Nivel_Estrategico', 'nivel_estrategico')}
                    onChange={(e) => handleChange('Nivel_Estrategico', e.target.value)}
                    className="h-8 max-w-[200px] text-right"
                  />
                ) : (
                  <span className="font-medium">
                    {getVal('Nivel_Estrategico', 'nivel_estrategico') || 'Não informado'}
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
                    value={getVal('Data_Entrada', 'data_entrada')}
                    onChange={(e) => handleChange('Data_Entrada', e.target.value)}
                    className="h-8 max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {getVal('Data_Entrada', 'data_entrada') || 'Não informado'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Valor Fechado</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Input
                    value={getVal('valor_fechado')}
                    onChange={(e) => handleChange('valor_fechado', e.target.value)}
                    className="h-8 max-w-[200px] text-right"
                    placeholder="R$ 0,00"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {getVal('valor_fechado') || 'Não informado'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground w-1/3">Localização</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2 max-w-[250px]">
                    <Input
                      value={getVal('Cidade')}
                      onChange={(e) => handleChange('Cidade', e.target.value)}
                      className="h-8"
                      placeholder="Cidade"
                    />
                    <Input
                      value={getVal('Estado')}
                      onChange={(e) => handleChange('Estado', e.target.value)}
                      className="h-8 w-16"
                      placeholder="UF"
                    />
                  </div>
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {getVal('Cidade') || '-'} / {getVal('Estado') || '-'}
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
                  <Input
                    value={getVal('Responsavel', 'responsavel')}
                    onChange={(e) => handleChange('Responsavel', e.target.value)}
                    className="h-8 max-w-[200px] text-right"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {getVal('Responsavel', 'responsavel') || 'Não definido'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Cliente</span>
              <div className="w-2/3 flex justify-end">
                <span className="font-medium flex items-center gap-2 text-right">
                  <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {(projeto as any).cliente && (projeto as any).cliente !== 'Não Informado' ? (
                    <Link
                      to={`/contatos/clientes?view=${encodeURIComponent((projeto as any).cliente)}`}
                      className="text-primary hover:underline"
                    >
                      {(projeto as any).cliente}
                    </Link>
                  ) : (
                    'Não definido'
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Arquiteto Designado</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Input
                    value={getVal('Arquiteto_Responsavel', 'arquiteto')}
                    onChange={(e) => handleChange('Arquiteto_Responsavel', e.target.value)}
                    className="h-8 max-w-[200px] text-right"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {getVal('Arquiteto_Responsavel', 'arquiteto') &&
                    getVal('Arquiteto_Responsavel', 'arquiteto') !== 'Não Informado' ? (
                      <Link
                        to={`/contatos/arquitetos?view=${encodeURIComponent(getVal('Arquiteto_Responsavel', 'arquiteto'))}`}
                        className="text-primary hover:underline"
                      >
                        {getVal('Arquiteto_Responsavel', 'arquiteto')}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground w-1/3">Engenheiro Responsável</span>
              <div className="w-2/3 flex justify-end">
                {isEditing ? (
                  <Input
                    value={getVal('Responsavel_da_Obra', 'engenheiro')}
                    onChange={(e) => handleChange('Responsavel_da_Obra', e.target.value)}
                    className="h-8 max-w-[200px] text-right"
                  />
                ) : (
                  <span className="font-medium flex items-center gap-2 text-right">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {getVal('Responsavel_da_Obra', 'engenheiro') &&
                    getVal('Responsavel_da_Obra', 'engenheiro') !== 'Não Informado' ? (
                      <Link
                        to={`/contatos/engenheiros?view=${encodeURIComponent(getVal('Responsavel_da_Obra', 'engenheiro'))}`}
                        className="text-primary hover:underline"
                      >
                        {getVal('Responsavel_da_Obra', 'engenheiro')}
                      </Link>
                    ) : (
                      'Não definido'
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground w-1/3">Eletricista</span>
              <div className="w-2/3 flex justify-end">
                <span className="font-medium flex items-center gap-2 text-right">
                  <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {(projeto as any).eletricista &&
                  (projeto as any).eletricista !== 'Não Informado' ? (
                    <Link
                      to={`/contatos/eletricistas?view=${encodeURIComponent((projeto as any).eletricista)}`}
                      className="text-primary hover:underline"
                    >
                      {(projeto as any).eletricista}
                    </Link>
                  ) : (
                    'Não definido'
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
