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
    console.log('[salvar-projeto] Iniciando processamento da requisição')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('[salvar-projeto] Lendo corpo da requisição...')
    const body = await req.json()
    console.log('[salvar-projeto] Payload recebido:', body)

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
      console.warn('[salvar-projeto] Validação falhou: Campo Codigo ausente.')
      return new Response(JSON.stringify({ error: 'O campo Codigo é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!Projeto || String(Projeto).trim() === '') {
      console.warn('[salvar-projeto] Validação falhou: Campo Projeto ausente.')
      return new Response(JSON.stringify({ error: 'O campo Projeto é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!Status || String(Status).trim() === '') {
      console.warn('[salvar-projeto] Validação falhou: Campo Status ausente.')
      return new Response(JSON.stringify({ error: 'O campo Status é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!Cidade || String(Cidade).trim() === '') {
      console.warn('[salvar-projeto] Validação falhou: Campo Cidade ausente.')
      return new Response(JSON.stringify({ error: 'O campo Cidade é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!Estado || String(Estado).trim() === '') {
      console.warn('[salvar-projeto] Validação falhou: Campo Estado ausente.')
      return new Response(JSON.stringify({ error: 'O campo Estado é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // CORREÇÃO: O frontend pode estar enviando o código formatado com a máscara (ex: "12.345"),
    // mas a coluna Codigo na tabela Organizacao_projetos é do tipo numérico (bigint).
    // Precisamos limpar a formatação antes de prosseguir para evitar erro 500 do banco de dados.
    let codigoNumerico = Codigo
    if (typeof Codigo === 'string') {
      console.log(`[salvar-projeto] Convertendo Codigo formatado '${Codigo}' para numérico`)
      codigoNumerico = Number(Codigo.replace(/\D/g, ''))
    }

    console.log(`[salvar-projeto] Verificando existência do Codigo: ${codigoNumerico}`)
    const { data: existing, error: checkError } = await supabase
      .from('Organizacao_projetos')
      .select('Codigo')
      .eq('Codigo', codigoNumerico)
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[salvar-projeto] Erro ao consultar banco (checkError):', checkError)
      throw checkError
    }

    if (existing) {
      console.warn(
        `[salvar-projeto] Validação falhou: Codigo ${codigoNumerico} já existe no banco.`,
      )
      return new Response(JSON.stringify({ error: 'O Codigo informado já está em uso.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payloadInsercao = {
      Codigo: codigoNumerico,
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
    }

    console.log('[salvar-projeto] Confirmando formato dos dados antes do INSERT:')
    console.log(JSON.stringify(payloadInsercao, null, 2))

    console.log('[salvar-projeto] Iniciando inserção com os dados:', payloadInsercao)
    const { data, error } = await supabase
      .from('Organizacao_projetos')
      .insert([payloadInsercao])
      .select()
      .single()

    if (error) {
      console.error('[salvar-projeto] Erro ao tentar inserir no banco (insert error):', error)
      throw error
    }

    console.log('[salvar-projeto] Inserção concluída com sucesso:', data)
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[salvar-projeto] Exceção capturada (catch):', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
