import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export interface ArquitetoSplit {
  arquiteto_id: string
  nome: string
  percentual: number
}

interface ArchitectSplitPickerProps {
  value: ArquitetoSplit[]
  onChange: (next: ArquitetoSplit[]) => void
  onCreateNew?: () => void
  disabled?: boolean
}

/** Redistribui os percentuais igualmente entre todas as linhas (soma=100%). */
export function redistribuirPercentuais(lista: ArquitetoSplit[]): ArquitetoSplit[] {
  if (lista.length === 0) return lista
  const base = Math.floor((100 / lista.length) * 100) / 100
  const resto = Math.round((100 - base * lista.length) * 100) / 100
  return lista.map((item, idx) => ({
    ...item,
    percentual: idx === lista.length - 1 ? Math.round((base + resto) * 100) / 100 : base,
  }))
}

/**
 * Seletor múltiplo de arquitetos com percentual de divisão de lucro.
 * Ao adicionar/remover uma linha, redistribui os percentuais igualmente
 * (soma sempre fecha 100% por padrão); o usuário edita à mão se quiser
 * desigual. Reusado em ProjectNew.tsx/ProjectDetail.tsx (projeto) — a
 * validação de soma=100% em si fica a cargo do schema Zod do formulário
 * pai (esse componente só exibe o estado, não bloqueia nada sozinho).
 */
export function ArchitectSplitPicker({
  value,
  onChange,
  onCreateNew,
  disabled,
}: ArchitectSplitPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    const fetchArquitetos = async () => {
      // SPEC-044: registros com empresa_id preenchido são "pessoas" de uma
      // empresa de arquitetura — o projeto sempre vincula à empresa, nunca
      // a uma pessoa isolada dela.
      let q = supabase
        .from('contatos')
        .select('id, nome')
        .eq('tipo', 'arquiteto')
        .is('empresa_id', null)
        .order('nome')
      if (search) q = q.ilike('nome', `%${search}%`)
      const { data } = await q.limit(100)
      if (data) setOptions(data)
    }
    const timeout = setTimeout(fetchArquitetos, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const soma = value.reduce((acc, a) => acc + (Number(a.percentual) || 0), 0)
  const somaOk = value.length === 0 || Math.abs(soma - 100) < 0.01

  const handleAdd = (arquiteto: { id: string; nome: string }) => {
    if (value.some((v) => v.arquiteto_id === arquiteto.id)) {
      setOpen(false)
      return
    }
    onChange(
      redistribuirPercentuais([
        ...value,
        { arquiteto_id: arquiteto.id, nome: arquiteto.nome, percentual: 0 },
      ]),
    )
    setOpen(false)
  }

  const handleRemove = (arquitetoId: string) => {
    onChange(redistribuirPercentuais(value.filter((v) => v.arquiteto_id !== arquitetoId)))
  }

  const handlePercentualChange = (arquitetoId: string, novoPercentual: number) => {
    onChange(
      value.map((v) => (v.arquiteto_id === arquitetoId ? { ...v, percentual: novoPercentual } : v)),
    )
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-11 font-normal text-muted-foreground"
          >
            Adicionar arquiteto...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Buscar arquiteto..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>Nenhum arquiteto encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem key={o.id} value={o.id} onSelect={() => handleAdd(o)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.some((v) => v.arquiteto_id === o.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {o.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onCreateNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        onCreateNew()
                      }}
                      className="text-primary font-medium cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Arquiteto
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item) => (
            <div key={item.arquiteto_id} className="flex items-center gap-2">
              <span className="flex-1 text-sm truncate">{item.nome}</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0.01}
                  max={100}
                  step={0.01}
                  value={item.percentual}
                  disabled={disabled}
                  onChange={(e) =>
                    handlePercentualChange(item.arquiteto_id, parseFloat(e.target.value) || 0)
                  }
                  className="h-9 w-24 text-right"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => handleRemove(item.arquiteto_id)}
                className="h-9 w-9 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <p className={cn('text-xs font-medium', somaOk ? 'text-emerald-600' : 'text-destructive')}>
            Soma dos percentuais: {soma.toFixed(2)}%{!somaOk && ' — precisa ser exatamente 100%'}
          </p>
        </div>
      )}
    </div>
  )
}
