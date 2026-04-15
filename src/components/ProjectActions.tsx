import { MoreHorizontal, FileText, CheckCircle2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Projeto } from '@/services/projetos'
import { useToast } from '@/hooks/use-toast'
import { updateProjetoById } from '@/services/projetos'

interface ProjectActionsProps {
  projeto: Projeto
  onChange: () => void
}

export function ProjectActions({ projeto, onChange }: ProjectActionsProps) {
  const { toast } = useToast()

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(projeto.codigo)
    toast({
      title: 'Código copiado',
      description: 'Código do projeto copiado para a área de transferência.',
    })
  }

  const markAsComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateProjetoById(projeto.id, { status: 'Concluído' })
      toast({ title: 'Sucesso', description: 'Projeto marcado como concluído.' })
      onChange()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o projeto.',
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onClick={copyCode}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar código
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {projeto.status !== 'Concluído' &&
          projeto.status !== 'Completo' &&
          projeto.status !== 'Finalizado' && (
            <DropdownMenuItem onClick={markAsComplete}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
              Marcar como concluído
            </DropdownMenuItem>
          )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            window.open(`/projeto/${projeto.id}`, '_blank')
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          Ver em nova aba
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
