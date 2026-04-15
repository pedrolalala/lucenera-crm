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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()

    const {
      Codigo,
      Projeto,
      Status,
      Cidade,
      Estado,
      arquiteto,
      engenheiro,
      responsavel,
      data_entrada,
      nivel_estrategico,
    } = body

    if (!Codigo || String(Codigo).trim() === '') {
      return new Response(JSON.stringify({ error: 'O campo Código é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!Projeto || String(Projeto).trim() === '') {
      return new Response(JSON.stringify({ error: 'O campo Projeto é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let arquiteto_id = null
    if (arquiteto) {
      const { data: arq } = await supabase
        .from('contatos')
        .select('id')
        .eq('nome', arquiteto)
        .eq('tipo', 'arquiteto')
        .maybeSingle()
      if (arq) arquiteto_id = arq.id
    }

    let responsavel_obra_id = null
    if (engenheiro) {
      const { data: eng } = await supabase
        .from('contatos')
        .select('id')
        .eq('nome', engenheiro)
        .eq('tipo', 'engenheiro')
        .maybeSingle()
      if (eng) responsavel_obra_id = eng.id
    }

    let responsavel_id = null
    if (responsavel) {
      const { data: resp } = await supabase
        .from('contatos')
        .select('id')
        .eq('nome', responsavel)
        .maybeSingle()
      if (resp) responsavel_id = resp.id
    }

    const payloadInsercao = {
      codigo: String(Codigo).trim(),
      nome: Projeto,
      status: Status || 'Estudo Inicial',
      cidade: Cidade,
      estado: Estado,
      arquiteto_id,
      responsavel_obra_id,
      responsavel_id,
      responsavel_nome: responsavel || null,
      data_entrada: data_entrada || null,
      nivel_estrategico: nivel_estrategico || null,
    }

    const { data, error } = await supabase
      .from('projetos')
      .insert([payloadInsercao])
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
