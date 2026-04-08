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
    .limit(1)

  if (error) throw error
  if (!data || data.length === 0) throw new Error('Projeto não encontrado')
  return data[0]
}

export async function updateProjeto(codigo: number, data: Partial<Projeto>) {
  const { data: result, error } = await supabase
    .from('Organizacao_projetos')
    .update(data)
    .eq('Codigo', codigo)
    .select()

  if (error) throw error
  return result?.[0] || null
}

export async function updateProjetoById(id: number, data: Partial<Projeto>) {
  const { data: result, error } = await supabase
    .from('Organizacao_projetos')
    .update(data)
    .eq('id', id)
    .select()

  if (error) throw error
  return result?.[0] || null
}

export async function deleteProjeto(codigo: number) {
  const { error } = await supabase.from('Organizacao_projetos').delete().eq('Codigo', codigo)

  if (error) throw error
}

export async function updateProjetoEdge(codigo: number, data: Partial<Projeto>) {
  const { data: result, error } = await supabase.functions.invoke('update-project', {
    body: { id: codigo, ...data },
  })

  if (error) throw error
  if (result?.error) throw new Error(result.error)

  return result?.data
}
