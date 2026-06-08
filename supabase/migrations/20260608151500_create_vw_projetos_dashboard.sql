-- View vw_projetos_dashboard
CREATE OR REPLACE VIEW public.vw_projetos_dashboard AS
SELECT
  p.id,
  p.codigo,
  p.nome,
  p.status,
  p.nivel_estrategico,
  p.data_entrada,
  p.cidade,
  p.estado,
  p.arquivado,
  p.responsavel_id,
  p.responsavel_nome,
  u.email AS responsavel_email,
  p.cliente_id,
  c.nome AS cliente_nome,
  c.tipo AS cliente_tipo,
  p.arquiteto_id,
  a.nome AS arquiteto_nome,
  p.empresa_id,
  e.nome AS empresa_nome,
  e.codigo AS empresa_codigo,
  p.area_do_projeto,
  p.area_do_projeto ->> 'tipo'::text AS tipo_projeto,
  p.created_at,
  p.updated_at
FROM
  public.projetos p
  LEFT JOIN public.usuarios u ON p.responsavel_id = u.id
  LEFT JOIN public.contatos c ON p.cliente_id = c.id
  LEFT JOIN public.contatos a ON p.arquiteto_id = a.id
  LEFT JOIN public.empresas e ON p.empresa_id = e.id
WHERE
  p.arquivado = false
ORDER BY
  p.created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.vw_projetos_dashboard TO authenticated;
GRANT SELECT ON public.vw_projetos_dashboard TO service_role;
