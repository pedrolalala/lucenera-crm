import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type ProjetoParcela = Database['public']['Tables']['projeto_parcelas']['Row']

export type Projeto = Database['public']['Tables']['projetos']['Row'] & {
  cliente?: { nome: string } | null
  arquiteto?: { nome: string } | null
  responsavel?: { nome: string } | null
  engenheiro?: { nome: string } | null
  projeto_parcelas?: ProjetoParcela[]
  ano_fechamento?: string | null
  mes_fechamento?: string | null
  data_fechamento?: string | null
}

export async function getProjetos() {
  let allData: Projeto[] = []
  let from = 0
  const step = 1000
  let hasMore = true

  const { data: fechamentoData } = await supabase
    .from('vw_dashboard_crm_fechamento')
    .select('id, ano_fechamento, mes_fechamento, data_fechamento')

  const fechamentoMap = new Map()
  if (fechamentoData) {
    fechamentoData.forEach((f) => {
      if (f.id) fechamentoMap.set(f.id, f)
    })
  }

  while (hasMore) {
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
      .order('data_entrada', { ascending: false, nullsFirst: false })
      .order('codigo', { ascending: false })
      .range(from, from + step - 1)

    if (error) {
      // Fallback: if engenheiro relationship fails, retry without it
      if (error.code === 'PGRST200') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('projetos')
          .select(`
            *,
            cliente:cliente_id(nome),
            arquiteto:arquiteto_id(nome),
            responsavel:responsavel_id(nome),
            projeto_parcelas(*)
          `)
          .order('data_entrada', { ascending: false, nullsFirst: false })
          .order('codigo', { ascending: false })
          .range(from, from + step - 1)

        if (fallbackError) throw fallbackError
        if (fallbackData && fallbackData.length > 0) {
          const mappedData = fallbackData.map((d: any) => {
            const f = fechamentoMap.get(d.id)
            return {
              ...d,
              engenheiro: null,
              ano_fechamento: f?.ano_fechamento || null,
              mes_fechamento: f?.mes_fechamento || null,
              data_fechamento: f?.data_fechamento || null,
            }
          }) as Projeto[]
          allData = [...allData, ...mappedData]
          if (fallbackData.length < step) {
            hasMore = false
          } else {
            from += step
          }
        } else {
          hasMore = false
        }
        continue
      }
      throw error
    }

    if (error) throw error

    if (data && data.length > 0) {
      const mappedData = data.map((d: any) => {
        const f = fechamentoMap.get(d.id)
        return {
          ...d,
          ano_fechamento: f?.ano_fechamento || null,
          mes_fechamento: f?.mes_fechamento || null,
          data_fechamento: f?.data_fechamento || null,
        }
      }) as Projeto[]

      allData = [...allData, ...mappedData]
      if (data.length < step) {
        hasMore = false
      } else {
        from += step
      }
    } else {
      hasMore = false
    }
  }

  return allData
}

export async function getProjeto(id: string) {
  let data: any = null
  let error: any = null

  const result = await supabase
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

  data = result.data
  error = result.error

  // Fallback: if engenheiro relationship fails, retry without it
  if (error && error.code === 'PGRST200') {
    const fallback = await supabase
      .from('projetos')
      .select(`
        *,
        cliente:cliente_id(nome),
        arquiteto:arquiteto_id(nome),
        responsavel:responsavel_id(nome),
        projeto_parcelas(*)
      `)
      .eq('id', id)
      .single()

    data = fallback.data
    error = fallback.error
  }

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
  // SPEC-004: parcelas geradas pela aprovação de orçamento (orcamento_id
  // preenchido) não podem ser alteradas nem excluídas pelo editor manual de
  // projeto. O filtro `.is('orcamento_id', null)` nas queries abaixo é a
  // proteção de fato — vale mesmo que o chamador esqueça de filtrar antes.
  const currentIds = parcelas.map((p) => p.id).filter(Boolean) as string[]
  const toDelete = originalIds.filter((id) => !currentIds.includes(id))

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('projeto_parcelas')
      .delete()
      .in('id', toDelete)
      .is('orcamento_id', null)
    if (error) throw error
  }

  for (const p of parcelas) {
    if (p.orcamento_id) continue

    const payload = {
      numero_parcela: p.numero_parcela,
      valor: p.valor,
      status: p.status || 'pendente',
      data_vencimento: p.data_vencimento || null,
      data_pagamento: p.data_pagamento || null,
      valor_pago: p.valor_pago || null,
      forma_pagamento: p.forma_pagamento || null,
      juros: p.juros || 0,
      multa: p.multa || 0,
      desconto: p.desconto || 0,
      descricao: p.descricao || null,
      observacoes: p.observacoes || null,
    }

    if (p.id) {
      const { error } = await supabase
        .from('projeto_parcelas')
        .update(payload)
        .eq('id', p.id)
        .is('orcamento_id', null)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('projeto_parcelas')
        .insert({ ...payload, projeto_id: projetoId } as any)
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
