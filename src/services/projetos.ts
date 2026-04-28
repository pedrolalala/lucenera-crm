import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type ProjetoParcela = Database['public']['Tables']['projeto_parcelas']['Row']

export type Projeto = Database['public']['Tables']['projetos']['Row'] & {
  cliente?: { nome: string } | null
  arquiteto?: { nome: string } | null
  responsavel?: { nome: string } | null
  engenheiro?: { nome: string } | null
  projeto_parcelas?: ProjetoParcela[]
}

export async function getProjetos() {
  const { data, error } = await supabase
    .from('projetos')
    .select(`
      *,
      cliente:cliente_id(nome),
      arquiteto:arquiteto_id(nome),
      responsavel:responsavel_id(nome),
      engenheiro:responsavel_obra_id(nome),
      projeto_parcelas(*)
    `)
    .order('codigo', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Projeto[]
}

export async function getProjeto(id: string) {
  const { data, error } = await supabase
    .from('projetos')
    .select(`
      *,
      cliente:cliente_id(nome),
      arquiteto:arquiteto_id(nome),
      responsavel:responsavel_id(nome),
      engenheiro:responsavel_obra_id(nome),
      projeto_parcelas(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) throw new Error('Projeto não encontrado')
  return data as Projeto
}

export async function updateProjetoById(
  id: string,
  data: Partial<Database['public']['Tables']['projetos']['Update']>,
) {
  const { data: result, error } = await supabase.from('projetos').update(data).eq('id', id).select()

  if (error) throw error
  return result?.[0] || null
}

export async function deleteProjeto(id: string) {
  const { error } = await supabase.from('projetos').delete().eq('id', id)
  if (error) throw error
}

export async function saveProjetoParcelas(
  projetoId: string,
  parcelas: Partial<ProjetoParcela>[],
  originalIds: string[],
) {
  const currentIds = parcelas.map((p) => p.id).filter(Boolean) as string[]
  const toDelete = originalIds.filter((id) => !currentIds.includes(id))

  if (toDelete.length > 0) {
    const { error } = await supabase.from('projeto_parcelas').delete().in('id', toDelete)
    if (error) throw error
  }

  for (const p of parcelas) {
    if (p.id) {
      const { id, created_at, projeto_id, ...updateData } = p
      const { error } = await supabase.from('projeto_parcelas').update(updateData).eq('id', id)
      if (error) throw error
    } else {
      const { id, created_at, ...insertData } = p
      const { error } = await supabase
        .from('projeto_parcelas')
        .insert({ ...insertData, projeto_id: projetoId } as any)
      if (error) throw error
    }
  }
}

export async function updateProjetoEdge(id: string, data: any) {
  const { data: result, error } = await supabase.functions.invoke('update-project', {
    body: { id, ...data },
  })

  if (error) throw error
  if (result?.error) throw new Error(result.error)

  return result?.data
}
