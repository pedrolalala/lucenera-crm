import { cn } from '@/lib/utils'
import { ProjectStatus } from '@/types'

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors: Record<string, string> = {
    'Estudo Inicial':
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    'Proposta Sinal':
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    'Elaboração Orçamento':
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
    'Não Fechou':
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
    'Obra Finalizada':
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800',
    'Emissão Projeto Executivo':
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
    'Venda DocuSign':
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800',
    'Ajustes Finais':
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    'Contrato de Projeto':
      'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800',
  }

  const defaultColor =
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-300 whitespace-nowrap',
        colors[status] || defaultColor,
        className,
      )}
    >
      {status}
    </span>
  )
}

export function StrategicBadge({
  level,
  className,
}: {
  level: '1' | '2' | '3' | '4'
  className?: string
}) {
  const colors = {
    '1': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
    '2': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    '3': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    '4': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm shrink-0 whitespace-nowrap',
        colors[level],
        className,
      )}
    >
      Nível {level}
    </span>
  )
}
