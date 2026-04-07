import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Leia todos os registros de projetos_fechados
    const { data: fechamentos, error: fetchError } = await supabase
      .from('projetos_fechados')
      .select('cod, valor_fechado, data_fechamento')
      .order('data_fechamento', { ascending: true })

    if (fetchError) throw fetchError

    // 2. Agrupe por cod
    const agrupados: Record<string, any[]> = {}
    for (const row of fechamentos || []) {
      if (!row.cod) continue
      const codigo = String(row.cod).trim()
      if (!agrupados[codigo]) {
        agrupados[codigo] = []
      }
      agrupados[codigo].push(row)
    }

    // Fallback: ordenar por data_fechamento (crescente)
    for (const cod in agrupados) {
      agrupados[cod].sort((a, b) => {
        const parseDate = (dStr: string) => {
          if (!dStr) return 0
          if (dStr.includes('/')) {
            const parts = dStr.split('/')
            if (parts.length === 3) {
              return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime()
            }
          }
          return new Date(dStr).getTime() || 0
        }
        return parseDate(a.data_fechamento) - parseDate(b.data_fechamento)
      })
    }

    let projetosAtualizados = 0

    // 3. Para cada código único, mapeie os fechamentos (até 10)
    for (const cod in agrupados) {
      const registros = agrupados[cod]
      const payload: Record<string, any> = {}

      const limite = Math.min(registros.length, 10)
      for (let i = 0; i < limite; i++) {
        const idx = i + 1
        payload[`valor_fechado_${idx}`] = registros[i].valor_fechado
        payload[`data_fechamento_${idx}`] = registros[i].data_fechamento
      }

      // Atualize a linha correspondente em Organizacao_projetos onde Codigo = cod
      const { data: existing } = await supabase
        .from('Organizacao_projetos')
        .select('Codigo')
        .eq('Codigo', Number(cod))
        .limit(1)

      if (existing && existing.length > 0) {
        const { error: updateError } = await supabase
          .from('Organizacao_projetos')
          .update(payload)
          .eq('Codigo', Number(cod))

        if (!updateError) projetosAtualizados++
      } else {
        // Fallback: se não existir, insere o projeto (mantém consistência de dados)
        payload['Codigo'] = Number(cod)
        const { error: insertError } = await supabase.from('Organizacao_projetos').insert([payload])

        if (!insertError) projetosAtualizados++
      }
    }

    // 4. Registre em sync_history
    const mensagemSucesso = 'Sincronização concluída com sucesso'
    const historyPayload = {
      projetos_atualizados: projetosAtualizados,
      status: 'sucesso',
      mensagem: mensagemSucesso,
    }

    await supabase.from('sync_history').insert([historyPayload])

    // 5. Retorne os dados esperados
    return new Response(
      JSON.stringify({
        success: true,
        projetos_atualizados: projetosAtualizados,
        mensagem: mensagemSucesso,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    const errorMsg = error.message || 'Erro desconhecido'
    await supabase.from('sync_history').insert([
      {
        projetos_atualizados: 0,
        status: 'erro',
        mensagem: errorMsg,
      },
    ])

    return new Response(
      JSON.stringify({
        success: false,
        projetos_atualizados: 0,
        mensagem: errorMsg,
        error: error,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
