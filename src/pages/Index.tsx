import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '@/stores/useProjectStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { ProjectTable } from '@/components/ProjectTable'
import { ProjectMobileCards } from '@/components/ProjectMobileCards'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, FilterX } from 'lucide-react'
import { STATUS_OPTIONS, USERS, ProjectStatus, UserName } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

export default function Index() {
  const { projects, currentUser } = useProjectStore()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [responsibleFilter, setResponsibleFilter] = useState<UserName | 'ALL'>('ALL')
  const [nivelFilter, setNivelFilter] = useState<string>('ALL')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [currentUser])

  const userRole = USERS.find((u) => u.name === currentUser)?.role

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (userRole === 'User' && p.responsible !== currentUser) return false
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      if (responsibleFilter !== 'ALL' && p.responsible !== responsibleFilter) return false
      if (nivelFilter !== 'ALL' && p.strategicLevel !== nivelFilter) return false

      if (search) {
        const q = search.toLowerCase()
        return (
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.architect.toLowerCase().includes(q) ||
          p.engineer.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          format(new Date(p.entryDate), 'dd/MM/yyyy').includes(q)
        )
      }
      return true
    })
  }, [projects, currentUser, userRole, search, statusFilter, responsibleFilter, nivelFilter])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setResponsibleFilter('ALL')
    setNivelFilter('ALL')
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Organização Projetos
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhamento centralizado e estratégico de portfólio luminotécnico.
          </p>
        </div>
        <Button
          onClick={() => navigate('/novo')}
          className="w-full sm:w-auto shadow-elevation h-11"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" /> NOVO PROJETO
        </Button>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, projeto, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>

          <div className="lg:col-span-2">
            <Select value={nivelFilter} onValueChange={setNivelFilter}>
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Nível Estrat." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Níveis</SelectItem>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Nível {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-3">
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Select
              value={responsibleFilter}
              onValueChange={(v: any) => setResponsibleFilter(v)}
              disabled={userRole === 'User'}
            >
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Resp.</SelectItem>
                {USERS.filter((u) => u.role === 'User').map((u) => (
                  <SelectItem key={u.name} value={u.name}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-1 flex justify-end h-10 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              title="Limpar Filtros"
              className="w-10 h-10 hover:bg-destructive/10 hover:text-destructive"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : isMobile ? (
        <ProjectMobileCards projects={filteredProjects} />
      ) : (
        <ProjectTable projects={filteredProjects} />
      )}
    </div>
  )
}
