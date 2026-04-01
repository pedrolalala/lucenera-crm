import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type Projeto = Database['public']['Tables']['Organizacao_projetos']['Row']

export async function getProjetos() {
  const { data, error } = await supabase
    .from('Organizacao_projetos')
    .select('*')
    .order('Codigo', { ascending: false })

  if (error) throw error
  return data
}

export async function getProjeto(codigo: number) {
  const { data, error } = await supabase
    .from('Organizacao_projetos')
    .select('*')
    .eq('Codigo', codigo)
    .single()

  if (error) throw error
  return data
}
