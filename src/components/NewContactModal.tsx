import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  email: z
    .string()
    .email('Email inválido')
    .or(z.literal(''))
    .nullable()
    .transform((v) => v || null),
  telefone: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v || null),
})

export type ContactType = 'cliente' | 'arquiteto' | 'engenheiro' | 'eletricista'

interface Props {
  type: ContactType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: any) => void
}

const TITLES: Record<string, string> = {
  cliente: 'Novo Cliente',
  arquiteto: 'Novo Arquiteto',
  engenheiro: 'Novo Engenheiro',
  eletricista: 'Novo Eletricista',
}

export function NewContactModal({ type, open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', email: '', telefone: '' },
  })

  useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!type) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contatos')
        .insert([{ ...values, tipo: type }])
        .select()
        .single()
      if (error) throw error
      toast({ title: 'Contato criado com sucesso!' })
      onSuccess(data)
    } catch (err: any) {
      toast({ title: 'Erro ao criar contato', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
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
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
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
                      <Input placeholder="email@exemplo.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : `Salvar ${entity}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
