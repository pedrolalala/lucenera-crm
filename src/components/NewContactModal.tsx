import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'Telefone é obrigatório'),
})

export type ContactType = 'client' | 'architect' | 'engineer' | 'electrician'

interface Props {
  type: ContactType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (values: { name: string; email?: string; phone?: string }) => void
}

const TITLES: Record<string, string> = {
  client: 'Novo Cliente',
  architect: 'Novo Arquiteto',
  engineer: 'Novo Engenheiro',
  electrician: 'Novo Eletricista',
}

export function NewContactModal({ type, open, onOpenChange, onSuccess }: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  const onSubmit = (values: z.infer<typeof schema>) => {
    onSuccess(values)
  }

  const title = type ? TITLES[type] : ''
  const entity = title.split(' ')[1] || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Adicione um novo cadastro rapidamente para vinculá-lo ao projeto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar {entity}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
