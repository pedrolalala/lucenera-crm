import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import useProjectStore from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/StatusBadge'
import { STATUS_OPTIONS, USERS, ProjectStatus } from '@/types'
import { ArrowLeft, Save, Clock, Info, CheckCircle2, FileSpreadsheet } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  responsible: z.enum(['Marina', 'Thairine', 'Thais'] as const),
  status: z.enum(STATUS_OPTIONS as [string, ...string[]]),
  architect: z.string().min(2, 'Nome do arquiteto é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido'),
})

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProject, updateProject, currentUser } = useProjectStore()
  const [isSaving, setIsSaving] = useState(false)

  const project = id ? getProject(id) : undefined
  const userRole = USERS.find((u) => u.name === currentUser)?.role
  const isEditable = project && (userRole === 'Admin' || project.responsible === currentUser)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || '',
      responsible: (project?.responsible as any) || 'Marina',
      status: project?.status || 'Estudo inicial',
      architect: project?.architect || '',
      city: project?.city || '',
      state: project?.state || 'SP',
    },
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        responsible: project.responsible as any,
        status: project.status,
        architect: project.architect,
        city: project.city,
        state: project.state,
      })
    }
  }, [project, form])

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Info className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Projeto não encontrado</h2>
        <p className="text-muted-foreground">
          O projeto com código {id} não existe ou você não tem acesso.
        </p>
        <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
      </div>
    )
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isEditable) return
    setIsSaving(true)

    // Simulating delay for saving and Excel integration
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simulate Excel integration possibility of failure (1 in 10 chance)
    const excelSuccess = Math.random() > 0.1

    updateProject(project.id, values)

    if (excelSuccess) {
      toast({
        title: 'Alterações Salvas',
        description: 'Projeto atualizado e planilha Excel sincronizada com sucesso.',
        action: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      })
    } else {
      toast({
        title: 'Atenção: Falha na Integração',
        description:
          'Os dados foram salvos localmente, mas houve um erro ao sincronizar com o Excel.',
        variant: 'destructive',
        action: <FileSpreadsheet className="h-5 w-5" />,
      })
    }

    setIsSaving(false)
  }

  // Watch status to change badge color live
  const currentFormStatus = form.watch('status') as ProjectStatus

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        {!isEditable && (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Visualização Apenas (Somente {project.responsible} ou Admin podem editar)
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <span className="text-primary">{project.id}</span>
            <span className="text-muted-foreground/30">|</span>
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Data de entrada:{' '}
            {format(new Date(project.entryDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="md:ml-auto">
          <StatusBadge status={currentFormStatus} className="text-sm px-4 py-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <Card className="lg:col-span-2 shadow-sm border-t-2 border-t-primary">
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
            <CardDescription>
              Atualize as informações operacionais e o status atual do projeto.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projeto</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="responsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <Select
                          disabled={!isEditable}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USERS.filter((u) => u.role === 'User').map((user) => (
                              <SelectItem key={user.name} value={user.name}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fase Atual (Status)</FormLabel>
                        <Select
                          disabled={!isEditable}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="architect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arquiteto Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          disabled={!isEditable}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BRAZIL_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              {isEditable && (
                <div className="px-6 py-4 bg-muted/20 border-t flex justify-end">
                  <Button type="submit" disabled={isSaving} className="min-w-[150px]">
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full animate-spin bg-white/40" />
                        Salvando...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </Card>

        {/* Right Column - Timeline */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Histórico de Status
            </CardTitle>
            <CardDescription>Acompanhamento de fases do projeto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 border-l-2 border-muted ml-3 mt-2">
              {project.history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div key={index} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={entry.status} className="w-fit" />
                      <time className="text-sm text-muted-foreground mt-1 font-mono">
                        {format(new Date(entry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </time>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
