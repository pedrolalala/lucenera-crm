import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ContactSearchComboboxProps {
  tipo: 'cliente' | 'engenheiro' | 'eletricista'
  value: string | null
  selectedName?: string | null
  onChange: (id: string | null, nome: string | null) => void
  placeholder?: string
  className?: string
}

/**
 * SPEC-202: busca o contato no banco conforme digita (mesmo padrão do
 * ArchitectSplitPicker). A lista do useProjectStore vem cortada em 1000
 * linhas pelo PostgREST, então clientes/engenheiros depois da letra ~C
 * nunca apareciam no Select antigo.
 */
export function ContactSearchCombobox({
  tipo,
  value,
  selectedName,
  onChange,
  placeholder = 'Selecione',
  className,
}: ContactSearchComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<{ id: string; nome: string }[]>([])
  const [nomeAtual, setNomeAtual] = useState<string | null>(selectedName || null)

  useEffect(() => {
    if (selectedName) setNomeAtual(selectedName)
  }, [selectedName])

  useEffect(() => {
    if (!open) return
    const fetchContatos = async () => {
      let q = supabase.from('contatos').select('id, nome').eq('tipo', tipo).order('nome')
      if (search) q = q.ilike('nome', `%${search}%`)
      const { data } = await q.limit(50)
      if (data) setOptions(data)
    }
    const timeout = setTimeout(fetchContatos, 300)
    return () => clearTimeout(timeout)
  }, [search, tipo, open])

  const label = tipo

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full max-w-[280px] justify-between h-8 font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{value ? nomeAtual || 'Selecionado' : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Buscar ${label}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum {label} encontrado.</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  value="__nenhum__"
                  onSelect={() => {
                    onChange(null, null)
                    setNomeAtual(null)
                    setOpen(false)
                  }}
                  className="text-muted-foreground"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Nenhum
                </CommandItem>
              )}
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.id}
                  onSelect={() => {
                    onChange(o.id, o.nome)
                    setNomeAtual(o.nome)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', o.id === value ? 'opacity-100' : 'opacity-0')}
                  />
                  {o.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
