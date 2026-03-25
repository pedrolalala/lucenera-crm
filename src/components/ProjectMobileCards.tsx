import { useNavigate } from 'react-router-dom'
import { Project } from '@/types'
import { StatusBadge, StrategicBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { MapPin, User, Calendar, HardHat } from 'lucide-react'

export function ProjectMobileCards({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()
  if (projects.length === 0)
    return <p className="text-center py-8 text-muted-foreground">Nenhum projeto encontrado.</p>

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
          onClick={() => navigate(`/projeto/${p.id}`)}
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary">{p.id}</span>
                  <StrategicBadge level={p.strategicLevel} />
                </div>
                <h3 className="font-bold text-base leading-tight mt-2">{p.name}</h3>
              </div>
            </div>

            <div className="mt-1 mb-1">
              <StatusBadge status={p.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="truncate text-foreground font-medium">{p.responsible}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(p.entryDate), 'dd/MM/yy')}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <HardHat className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {p.engineer} | {p.architect}
                </span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {p.city} - {p.state}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
