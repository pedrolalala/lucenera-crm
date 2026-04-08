import { useState, useEffect } from 'react'
import { MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { updateProjetoById, deleteProjeto, type Projeto } from '@/services/projetos'
import { useToast } from '@/hooks/use-toast'

interface ProjectActionsProps {
  projeto: Projeto
  onChange: () => void
}

export function ProjectActions({ projeto, onChange }: ProjectActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Projeto>>(projeto)
  const { toast } = useToast()

  useEffect(() => {
    if (isEditOpen) {
      setFormData(projeto)
    }
  }, [isEditOpen, projeto])

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      setLoading(true)
      if (!formData.Codigo) {
        toast({ title: 'Erro: Código é obrigatório', variant: 'destructive' })
        return
      }

      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined),
      )
      delete cleanData.id

      await updateProjetoById(projeto.id, cleanData)
      toast({ title: 'Projeto atualizado com sucesso' })
      setIsEditOpen(false)
      onChange()
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao atualizar',
        description: error?.message || 'Ocorreu um erro ao salvar as alterações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      if (!projeto.Codigo) return
      await deleteProjeto(projeto.Codigo)
      toast({ title: 'Projeto excluído com sucesso' })
      setIsDeleteOpen(false)
      onChange()
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Editar Projeto</SheetTitle>
            <SheetDescription>
              Faça alterações nas informações do projeto aqui. Clique em salvar quando terminar.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSave} className="flex flex-col h-[calc(100vh-8rem)]">
            <ScrollArea className="flex-1 pr-4 mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="Codigo">Código</Label>
                  <Input
                    id="Codigo"
                    value={
                      formData.Codigo !== undefined && formData.Codigo !== null
                        ? Number(formData.Codigo).toLocaleString('pt-BR', {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })
                        : ''
                    }
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/\D/g, '')
                      if (!numbersOnly) {
                        setFormData({
                          ...formData,
                          Codigo: null,
                        })
                        return
                      }
                      const numericVal = parseInt(numbersOnly, 10) / 1000
                      setFormData({
                        ...formData,
                        Codigo: numericVal,
                      })
                    }}
                    placeholder="0,000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="Projeto">Nome do Projeto</Label>
                  <Input
                    id="Projeto"
                    value={formData.Projeto || ''}
                    onChange={(e) => setFormData({ ...formData, Projeto: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="Status">Status</Label>
                  <Input
                    id="Status"
                    value={formData.Status || ''}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel_estrategico">Nível Estratégico</Label>
                  <Input
                    id="nivel_estrategico"
                    value={formData.nivel_estrategico || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel_estrategico: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsavel">Responsável (Interno)</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel || ''}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arquiteto">Arquiteto</Label>
                  <Input
                    id="arquiteto"
                    value={formData.arquiteto || ''}
                    onChange={(e) => setFormData({ ...formData, arquiteto: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="engenheiro">Engenheiro</Label>
                  <Input
                    id="engenheiro"
                    value={formData.engenheiro || ''}
                    onChange={(e) => setFormData({ ...formData, engenheiro: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eletricista">Eletricista</Label>
                  <Input
                    id="eletricista"
                    value={formData.eletricista || ''}
                    onChange={(e) => setFormData({ ...formData, eletricista: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="Cidade">Cidade</Label>
                    <Input
                      id="Cidade"
                      value={formData.Cidade || ''}
                      onChange={(e) => setFormData({ ...formData, Cidade: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="Estado">Estado</Label>
                    <Input
                      id="Estado"
                      value={formData.Estado || ''}
                      onChange={(e) => setFormData({ ...formData, Estado: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4 mb-4 sm:mb-0">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o projeto{' '}
              <strong className="text-foreground">{projeto.Projeto}</strong> e removerá seus dados
              do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
