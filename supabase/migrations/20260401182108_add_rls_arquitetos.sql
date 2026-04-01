-- Fix RLS for Arquitetos_empresas_crm
DROP POLICY IF EXISTS "authenticated_select_arquitetos" ON public."Arquitetos_empresas_crm";
CREATE POLICY "authenticated_select_arquitetos" ON public."Arquitetos_empresas_crm"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_arquitetos" ON public."Arquitetos_empresas_crm";
CREATE POLICY "authenticated_insert_arquitetos" ON public."Arquitetos_empresas_crm"
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_arquitetos" ON public."Arquitetos_empresas_crm";
CREATE POLICY "authenticated_update_arquitetos" ON public."Arquitetos_empresas_crm"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_arquitetos" ON public."Arquitetos_empresas_crm";
CREATE POLICY "authenticated_delete_arquitetos" ON public."Arquitetos_empresas_crm"
  FOR DELETE TO authenticated USING (true);
