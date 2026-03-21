import { useNavigate } from 'react-router-dom'
import { Project } from '@/types'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, User, Calendar } from 'lucide-react'

export function ProjectMobileCards({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()

  if (projects.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Nenhum projeto encontrado.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="cursor-pointer hover:border-primary/50 transition-colors active:scale-[0.98]"
          onClick={() => navigate(`/projeto/${project.id}`)}
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{project.id}</p>
                <h3 className="font-bold text-base leading-tight">{project.name}</h3>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">{project.responsible}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(project.entryDate), 'dd/MM/yy', { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">
                  {project.city} - {project.state}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
