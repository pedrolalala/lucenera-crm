import { useNavigate, Link } from 'react-router-dom'
import { Project } from '@/types'
import { StatusBadge, StrategicBadge } from '@/components/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export function ProjectTable({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()

  if (projects.length === 0)
    return (
      <div className="p-8 text-center border rounded-lg bg-card shadow-subtle text-muted-foreground font-medium">
        Nenhum projeto encontrado para os filtros selecionados.
      </div>
    )

  return (
    <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[80px] font-semibold">Codigo</TableHead>
            <TableHead className="font-semibold">Nível Estratégico</TableHead>
            <TableHead className="font-semibold min-w-[200px]">Projeto</TableHead>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Responsável</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Data Entrada</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="hidden lg:table-cell font-semibold min-w-[150px]">
              Arquiteto
            </TableHead>
            <TableHead className="hidden xl:table-cell font-semibold min-w-[150px]">
              Engenheiro
            </TableHead>
            <TableHead className="hidden xl:table-cell font-semibold min-w-[150px]">
              Valor Fechado
            </TableHead>
            <TableHead className="hidden xl:table-cell font-semibold min-w-[150px]">
              Eletricista
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-right">Cidade</TableHead>
            <TableHead className="hidden sm:table-cell font-semibold">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow
              key={p.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/projeto/${p.id}`)}
            >
              <TableCell className="font-medium text-foreground">{p.id}</TableCell>
              <TableCell>
                <StrategicBadge level={p.strategicLevel} />
              </TableCell>
              <TableCell className="font-bold text-foreground" title={p.name}>
                {p.name}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[150px] truncate" title={p.client}>
                {p.client !== 'Não Informado' && p.client !== '-' ? (
                  <Link
                    to={`/contatos/clientes?view=${encodeURIComponent(p.client)}`}
                    className="hover:underline hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.client}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  {p.responsible}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {format(new Date(p.entryDate), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                <StatusBadge status={p.status} />
              </TableCell>
              <TableCell
                className="hidden lg:table-cell max-w-[150px] truncate text-muted-foreground"
                title={p.architect}
              >
                {p.architect !== 'Não Informado' && p.architect !== '-' ? (
                  <Link
                    to={`/contatos/arquitetos?view=${encodeURIComponent(p.architect)}`}
                    className="hover:underline hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.architect}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell
                className="hidden xl:table-cell max-w-[150px] truncate text-muted-foreground"
                title={p.engineer}
              >
                {p.engineer !== 'Não Informado' && p.engineer !== '-' ? (
                  <Link
                    to={`/contatos/engenheiros?view=${encodeURIComponent(p.engineer)}`}
                    className="hover:underline hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.engineer}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {(p as any).valor_fechado ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                    {(p as any).valor_fechado}
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium text-sm">-</span>
                )}
              </TableCell>
              <TableCell
                className="hidden xl:table-cell max-w-[150px] truncate text-muted-foreground"
                title={(p as any).eletricista || (p as any).electrician}
              >
                {((p as any).eletricista || (p as any).electrician) &&
                ((p as any).eletricista || (p as any).electrician) !== 'Não Informado' &&
                ((p as any).eletricista || (p as any).electrician) !== '-' ? (
                  <Link
                    to={`/contatos/eletricistas?view=${encodeURIComponent((p as any).eletricista || (p as any).electrician)}`}
                    className="hover:underline hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(p as any).eletricista || (p as any).electrician}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-right">
                {p.city}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {p.state}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
