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
    const { id, ...updates } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'O campo id (Codigo) é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const mappedUpdates: any = {}
    if (updates.Projeto !== undefined) mappedUpdates.nome = updates.Projeto
    if (updates.Status !== undefined) mappedUpdates.status = updates.Status
    if (updates.Cidade !== undefined) mappedUpdates.cidade = updates.Cidade
    if (updates.Estado !== undefined) mappedUpdates.estado = updates.Estado
    if (updates.Data_Entrada !== undefined) mappedUpdates.data_entrada = updates.Data_Entrada
    if (updates.Nivel_Estrategico !== undefined)
      mappedUpdates.nivel_estrategico = updates.Nivel_Estrategico
    if (updates.Responsavel !== undefined) mappedUpdates.responsavel_nome = updates.Responsavel

    const { data, error } = await supabase
      .from('projetos')
      .update(mappedUpdates)
      .eq('codigo', String(id))
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
