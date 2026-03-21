import { useNavigate } from 'react-router-dom'
import { Project } from '@/types'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExternalLink } from 'lucide-react'

interface ProjectTableProps {
  projects: Project[]
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const navigate = useNavigate()

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card border-dashed">
        <p className="text-muted-foreground font-medium">Nenhum projeto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[100px] font-semibold">CÓDIGO</TableHead>
            <TableHead className="font-semibold">PROJETO</TableHead>
            <TableHead className="font-semibold">RESPONSÁVEL</TableHead>
            <TableHead className="font-semibold">STATUS</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">DATA ENTRADA</TableHead>
            <TableHead className="font-semibold hidden xl:table-cell">ARQUITETO RESP.</TableHead>
            <TableHead className="font-semibold hidden md:table-cell text-right">LOCAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/projeto/${project.id}`)}
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {project.id}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              </TableCell>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.responsible}</TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {format(new Date(project.entryDate), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="hidden xl:table-cell truncate max-w-[150px]">
                {project.architect}
              </TableCell>
              <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                {project.city}/{project.state}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
