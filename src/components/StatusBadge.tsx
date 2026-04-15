import { Badge } from '@/components/ui/badge'
import {
  ShieldAlert,
  Zap,
  Compass,
  Star,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export function StrategicBadge({ level }: { level: string | number }) {
  const strLevel = String(level)
  switch (strLevel) {
    case '1':
      return (
        <Badge variant="destructive" className="flex items-center gap-1 shadow-sm">
          <ShieldAlert className="h-3 w-3" /> Nível 1
        </Badge>
      )
    case '2':
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100 shadow-sm"
        >
          <Zap className="h-3 w-3" /> Nível 2
        </Badge>
      )
    case '3':
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-sm"
        >
          <Compass className="h-3 w-3" /> Nível 3
        </Badge>
      )
    case '4':
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-slate-600 shadow-sm">
          <Star className="h-3 w-3 text-slate-400" /> Nível 4
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-slate-500 shadow-sm">
          -
        </Badge>
      )
  }
}

export function StatusBadge({ status }: { status: string }) {
  if (!status) return <Badge variant="outline">-</Badge>

  switch (status.toLowerCase()) {
    case 'estudo inicial':
      return (
        <Badge
          variant="secondary"
          className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100"
        >
          <Circle className="mr-1 h-3 w-3 fill-current opacity-50" /> {status}
        </Badge>
      )
    case 'proposta sinal':
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100"
        >
          <Star className="mr-1 h-3 w-3" /> {status}
        </Badge>
      )
    case 'elaboração orçamento':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
        >
          <Clock className="mr-1 h-3 w-3" /> {status}
        </Badge>
      )
    case 'projeto executivo':
    case 'informações necessárias':
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <Compass className="mr-1 h-3 w-3" /> {status}
        </Badge>
      )
    case 'entrega materiais':
    case 'ajustes finais':
      return (
        <Badge
          variant="secondary"
          className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
        >
          <Zap className="mr-1 h-3 w-3" /> {status}
        </Badge>
      )
    case 'finalizado':
    case 'concluído':
    case 'completo':
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shadow-sm">
          <CheckCircle2 className="mr-1 h-3 w-3" /> {status}
        </Badge>
      )
    case 'arquivado':
    case 'não fechou':
      return (
        <Badge variant="destructive" className="shadow-sm">
          <AlertCircle className="mr-1 h-3 w-3" /> {status}
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
