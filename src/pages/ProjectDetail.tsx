import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import useProjectStore from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { StatusBadge, StrategicBadge } from '@/components/StatusBadge'
import { STATUS_OPTIONS, USERS, ProjectStatus } from '@/types'
import { ArrowLeft, Save, Clock, Info, CheckCircle2, Building, HardHat } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(2, 'Obrigatório'),
  strategicLevel: z.enum(['1', '2', '3', '4']),
  responsible: z.enum(['Marina', 'Thairine', 'Thais']),
  status: z.enum(STATUS_OPTIONS as [string, ...string[]]),
  architect: z.string().min(1, 'Obrigatório'),
  engineer: z.string().min(1, 'Obrigatório'),
  city: z.string().min(2, 'Obrigatório'),
  state: z.string().length(2, 'Inválido'),
})

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getProject,
    updateProject,
    currentUser,
    getCities,
    getArchitects,
    getEngineers,
    getStateForCity,
  } = useProjectStore()
  const [isSaving, setIsSaving] = useState(false)

  const project = id ? getProject(id) : undefined
  const userRole = USERS.find((u) => u.name === currentUser)?.role
  const isEditable = project && (userRole === 'Admin' || project.responsible === currentUser)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: project
      ? {
          name: project.name,
          strategicLevel: project.strategicLevel,
          responsible: project.responsible as any,
          status: project.status,
          architect: project.architect,
          engineer: project.engineer,
          city: project.city,
          state: project.state,
        }
      : undefined,
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        strategicLevel: project.strategicLevel,
        responsible: project.responsible as any,
        status: project.status,
        architect: project.architect,
        engineer: project.engineer,
        city: project.city,
        state: project.state,
      })
    }
  }, [project, form])

  if (!project)
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Info className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Projeto não encontrado</h2>
        <Button onClick={() => navigate('/')} className="mt-6">
          Voltar ao Início
        </Button>
      </div>
    )

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isEditable) return
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    updateProject(project.id, values)
    toast({
      title: 'Alterações Salvas',
      description: 'Integração com Excel concluída e dados atualizados.',
      action: <CheckCircle2 className="text-emerald-500 h-5 w-5" />,
    })
    setIsSaving(false)
  }

  const currentStatus = form.watch('status') as ProjectStatus
  const currentLevel = form.watch('strategicLevel') as '1' | '2' | '3' | '4'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        {!isEditable && (
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border font-medium">
            Visualização Apenas
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded font-bold tracking-wider">
              {project.id}
            </span>
            <StrategicBadge level={currentLevel} className="text-sm px-4 py-1" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Data de Entrada:{' '}
            <span className="text-foreground">
              {format(new Date(project.entryDate), "dd/MM/yyyy 'às' HH:mm")}
            </span>
          </p>
        </div>
        <div className="md:ml-auto pt-2">
          <StatusBadge status={currentStatus} className="text-sm px-5 py-2 text-center" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-elevation border-t-2 border-t-primary">
          <CardHeader className="bg-muted/20 border-b pb-5">
            <CardTitle>Edição do Projeto</CardTitle>
            <CardDescription>
              Modifique os dados operacionais. Código e Data de Entrada são imutáveis.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Projeto</FormLabel>
                      <FormControl>
                        <Input className="h-10 font-medium" {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strategicLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível Estratégico</FormLabel>
                      <Select
                        disabled={!isEditable}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              Nível {n}
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
                      <FormLabel>Status</FormLabel>
                      <Select
                        disabled={!isEditable}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
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
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USERS.filter((u) => u.role === 'User').map((u) => (
                            <SelectItem key={u.name} value={u.name}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1" />
                <FormField
                  control={form.control}
                  name="architect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" /> Arquiteto Responsável
                      </FormLabel>
                      <FormControl>
                        <Input
                          list="architects"
                          className="h-10"
                          {...field}
                          disabled={!isEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <HardHat className="h-4 w-4" /> Engenheiro Responsável
                      </FormLabel>
                      <FormControl>
                        <Input
                          list="engineers"
                          className="h-10"
                          {...field}
                          disabled={!isEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="sm:col-span-2 grid grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            list="cities"
                            className="h-10"
                            {...field}
                            disabled={!isEditable}
                            onChange={(e) => {
                              field.onChange(e)
                              const s = getStateForCity(e.target.value)
                              if (s) form.setValue('state', s)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            className="h-10 uppercase"
                            maxLength={2}
                            {...field}
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <datalist id="cities">
                {getCities().map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <datalist id="architects">
                {getArchitects().map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
              <datalist id="engineers">
                {getEngineers().map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
              {isEditable && (
                <div className="px-6 py-5 bg-muted/30 border-t flex justify-end">
                  <Button type="submit" disabled={isSaving} className="px-8 h-11 text-base">
                    {isSaving ? (
                      'Salvando & Sincronizando...'
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

        <Card className="shadow-sm h-fit sticky top-24">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" /> Histórico de Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 border-l-2 border-primary/20 ml-3 mt-2">
              {project.history
                .slice()
                .reverse()
                .map((entry, i) => (
                  <div key={i} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                    <div className="flex flex-col gap-1.5">
                      <StatusBadge status={entry.status} className="w-fit shadow-sm" />
                      <time className="text-xs text-muted-foreground font-mono bg-muted/50 w-fit px-2 py-0.5 rounded">
                        {format(new Date(entry.date), 'dd/MM/yyyy HH:mm')}
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
