import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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
      eletricista,
      responsavel,
      data_entrada,
      nivel_estrategico,
    } = body

    if (!Codigo) {
      return new Response(JSON.stringify({ error: 'O campo Codigo é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existing, error: checkError } = await supabase
      .from('Organizacao_projetos')
      .select('Codigo')
      .eq('Codigo', Codigo)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (existing) {
      return new Response(JSON.stringify({ error: 'O Codigo informado já está em uso.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await supabase
      .from('Organizacao_projetos')
      .insert([
        {
          Codigo,
          Projeto,
          Status,
          Cidade,
          Estado,
          arquiteto,
          engenheiro,
          eletricista,
          responsavel,
          data_entrada,
          nivel_estrategico,
        },
      ])
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
