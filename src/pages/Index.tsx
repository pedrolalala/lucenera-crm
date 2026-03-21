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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, Search, FilterX } from 'lucide-react'
import { STATUS_OPTIONS, USERS, ProjectStatus, UserName } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { projects, currentUser } = useProjectStore()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [responsibleFilter, setResponsibleFilter] = useState<UserName | 'ALL'>('ALL')
  const [onlyBudget, setOnlyBudget] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [currentUser]) // Simulate network loading when user switches

  const userRole = USERS.find((u) => u.name === currentUser)?.role

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // RBAC filtering
      if (userRole === 'User' && p.responsible !== currentUser) return false

      // Toggle "Orçamento"
      if (onlyBudget && p.status !== 'Orçamento') return false

      // Standard filters
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      if (responsibleFilter !== 'ALL' && p.responsible !== responsibleFilter) return false

      // Global search
      if (search) {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.architect.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [projects, currentUser, userRole, search, statusFilter, responsibleFilter, onlyBudget])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setResponsibleFilter('ALL')
    setOnlyBudget(false)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projetos</h2>
          <p className="text-muted-foreground text-sm">
            {userRole === 'Admin'
              ? 'Acompanhamento global de projetos.'
              : 'Seus projetos atribuídos.'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/novo')}
          className="w-full sm:w-auto shadow-elevation"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, ID, arquiteto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="bg-background">
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

          <div className="md:col-span-3">
            <Select
              value={responsibleFilter}
              onValueChange={(v: any) => setResponsibleFilter(v)}
              disabled={userRole === 'User'}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Responsáveis</SelectItem>
                {USERS.filter((u) => u.role === 'User').map((u) => (
                  <SelectItem key={u.name} value={u.name}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1 flex justify-end md:justify-center h-10 items-center">
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar Filtros">
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t">
          <Switch id="budget-mode" checked={onlyBudget} onCheckedChange={setOnlyBudget} />
          <Label
            htmlFor="budget-mode"
            className="font-medium cursor-pointer flex items-center gap-2"
          >
            Modo Orçamento
            {onlyBudget && (
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </Label>
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
