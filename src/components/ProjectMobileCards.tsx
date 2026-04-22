import { useNavigate } from 'react-router-dom'
import { StatusBadge, StrategicBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { MapPin, User, Calendar, HardHat, CheckCircle2, DollarSign } from 'lucide-react'

export function ProjectMobileCards({
  projects,
  viewMode = 'completa',
}: {
  projects: any[]
  viewMode?: 'resumida' | 'operacional' | 'completa'
}) {
  const navigate = useNavigate()
  if (projects.length === 0)
    return <p className="text-center py-8 text-muted-foreground">Nenhum projeto encontrado.</p>

  const formatDateStr = (dateStr: string | null) => {
    if (!dateStr || dateStr === '—') return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return format(d, 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          onClick={() => navigate(`/projeto/${p.id}`)}
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1 pr-3">
                {viewMode === 'completa' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary">{p.codigo}</span>
                    <StrategicBadge level={p.strategicLevel} />
                  </div>
                )}
                <h3 className="font-bold text-base leading-tight mt-1">{p.name}</h3>
              </div>
            </div>

            <div className="mt-1 mb-1">
              <StatusBadge status={p.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
              {viewMode === 'completa' && (
                <>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-foreground font-medium">{p.responsible}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Entrada: {formatDateStr(p.entryDate)}</span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-1.5 col-span-2">
                <HardHat className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {p.engineer !== 'Não Informado' && p.engineer !== '-'
                    ? p.engineer
                    : 'Engenheiro não informado'}
                </span>
              </div>

              {(viewMode === 'operacional' || viewMode === 'completa') && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="font-medium text-emerald-700">
                    Fechamento: {formatDateStr(p.data_fechamento)}
                  </span>
                </div>
              )}

              {(viewMode === 'operacional' || viewMode === 'completa') && (
                <div className="flex items-center gap-1.5 col-span-2 mt-1 pt-2 border-t border-border">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {p.city} {viewMode === 'completa' ? `- ${p.state}` : ''}
                  </span>
                </div>
              )}

              {viewMode === 'completa' && p.valor_fechado && (
                <div className="flex items-center justify-between col-span-2 mt-1 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <DollarSign className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Valor Total
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {p.valor_fechado}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
