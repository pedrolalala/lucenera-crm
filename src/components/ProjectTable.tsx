import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Projeto, deleteProjeto } from '@/services/projetos'
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
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ProjectTable({ projects }: { projects: Projeto[] }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const displayProjects = projects.filter((p) => !deletedIds.has(p.id))

  const handleDelete = async (id: string) => {
    try {
      await deleteProjeto(id)
      setDeletedIds((prev) => new Set(prev).add(id))
      toast({
        title: 'Projeto deletado',
        description: 'O projeto foi removido com sucesso.',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao deletar',
        description: 'Ocorreu um erro ao tentar deletar o projeto.',
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  if (displayProjects.length === 0)
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
              Valor Total
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-right">Cidade</TableHead>
            <TableHead className="hidden sm:table-cell font-semibold">Estado</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayProjects.map((p) => {
            const valorTotal =
              p.projeto_parcelas?.reduce((acc, current) => acc + Number(current.valor), 0) ||
              Number(p.valor_total) ||
              0

            return (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/projeto/${p.id}`)}
              >
                <TableCell className="font-medium text-foreground">{p.codigo}</TableCell>
                <TableCell>
                  {/* @ts-expect-error - Assuming StrategicBadge accepts string */}
                  <StrategicBadge level={p.nivel_estrategico} />
                </TableCell>
                <TableCell className="font-bold text-foreground" title={p.nome}>
                  {p.nome}
                </TableCell>
                <TableCell
                  className="text-muted-foreground max-w-[150px] truncate"
                  title={p.cliente?.nome || '-'}
                >
                  {p.cliente?.nome ? (
                    <Link
                      to={`/contatos/clientes?view=${encodeURIComponent(p.cliente.nome)}`}
                      className="hover:underline hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.cliente.nome}
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    {p.responsavel?.nome || p.responsavel_nome || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {p.data_entrada ? format(new Date(p.data_entrada), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {/* @ts-expect-error */}
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell
                  className="hidden lg:table-cell max-w-[150px] truncate text-muted-foreground"
                  title={p.arquiteto?.nome || '-'}
                >
                  {p.arquiteto?.nome ? (
                    <Link
                      to={`/contatos/arquitetos?view=${encodeURIComponent(p.arquiteto.nome)}`}
                      className="hover:underline hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.arquiteto.nome}
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell
                  className="hidden xl:table-cell max-w-[150px] truncate text-muted-foreground"
                  title={p.engenheiro?.nome || '-'}
                >
                  {p.engenheiro?.nome ? (
                    <Link
                      to={`/contatos/engenheiros?view=${encodeURIComponent(p.engenheiro.nome)}`}
                      className="hover:underline hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.engenheiro.nome}
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {valorTotal > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                      {formatCurrency(valorTotal)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-medium text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-right">
                  {p.cidade || '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {p.estado || '-'}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar este projeto? Esta ação não pode ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(p.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
