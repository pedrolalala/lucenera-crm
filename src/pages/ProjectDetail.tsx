import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjeto, type Projeto } from '@/services/projetos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  User,
  UserCircle,
  Briefcase,
  Loader2,
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getProjeto(Number(id))
      .then(setProjeto)
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
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Projetos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {projeto.Projeto || 'Projeto sem nome'}
            </h1>
            <Badge variant="secondary" className="text-sm">
              #{projeto.Codigo}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Visualizando detalhes completos do projeto</p>
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
              <span className="text-muted-foreground">Status</span>
              <Badge variant={projeto.Status === 'Concluído' ? 'default' : 'secondary'}>
                {projeto.Status || 'Não informado'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Nível Estratégico</span>
              <span className="font-medium">{projeto.nivel_estrategico || 'Não informado'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Data de Entrada</span>
              <span className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {projeto.data_entrada || 'Não informado'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground">Localização</span>
              <span className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {projeto.Cidade || '-'} / {projeto.Estado || '-'}
              </span>
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
              <span className="text-muted-foreground">Responsável Principal</span>
              <span className="font-medium flex items-center gap-2 text-right">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {projeto.responsavel || 'Não definido'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Arquiteto Designado</span>
              <span className="font-medium flex items-center gap-2 text-right">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {projeto.arquiteto || 'Não definido'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-b-transparent">
              <span className="text-muted-foreground">Engenheiro Responsável</span>
              <span className="font-medium flex items-center gap-2 text-right">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {projeto.engenheiro || 'Não definido'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
