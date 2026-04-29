CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_active_projects integer;
  v_completed_this_month integer;
  v_total_value numeric;
  v_clients_count integer;
  v_architects_count integer;
  v_engineers_count integer;
BEGIN
  -- Active projects count
  SELECT COUNT(*) INTO v_active_projects
  FROM public.projetos
  WHERE status::text NOT IN ('Finalizado', 'Arquivado', 'Não fechou')
     OR status IS NULL;
  
  -- Completed this month count
  SELECT COUNT(*) INTO v_completed_this_month
  FROM public.projetos
  WHERE status::text = 'Finalizado'
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Total Value: Sum of parcelas or valor_total
  SELECT COALESCE(SUM(
    CASE 
      WHEN p_parcelas.total_parcelas > 0 THEN p_parcelas.total_parcelas
      ELSE COALESCE(p.valor_total, 0)
    END
  ), 0) INTO v_total_value
  FROM public.projetos p
  LEFT JOIN (
    SELECT projeto_id, SUM(valor) as total_parcelas
    FROM public.projeto_parcelas
    GROUP BY projeto_id
  ) p_parcelas ON p.id = p_parcelas.projeto_id;

  -- Contatos counts
  SELECT COUNT(*) INTO v_clients_count FROM public.contatos WHERE tipo = 'cliente';
  SELECT COUNT(*) INTO v_architects_count FROM public.contatos WHERE tipo = 'arquiteto';
  SELECT COUNT(*) INTO v_engineers_count FROM public.contatos WHERE tipo = 'engenheiro';

  RETURN json_build_object(
    'activeProjects', COALESCE(v_active_projects, 0),
    'completedThisMonth', COALESCE(v_completed_this_month, 0),
    'totalValue', COALESCE(v_total_value, 0),
    'clientsCount', COALESCE(v_clients_count, 0),
    'architectsCount', COALESCE(v_architects_count, 0),
    'engineersCount', COALESCE(v_engineers_count, 0)
  );
END;
$;
