DO $BODY$
BEGIN
  -- Fix RLS for projetos_fechados table which lacked policies
  DROP POLICY IF EXISTS "authenticated_select_projetos_fechados" ON public.projetos_fechados;
  CREATE POLICY "authenticated_select_projetos_fechados" ON public.projetos_fechados FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "authenticated_insert_projetos_fechados" ON public.projetos_fechados;
  CREATE POLICY "authenticated_insert_projetos_fechados" ON public.projetos_fechados FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_update_projetos_fechados" ON public.projetos_fechados;
  CREATE POLICY "authenticated_update_projetos_fechados" ON public.projetos_fechados FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_delete_projetos_fechados" ON public.projetos_fechados;
  CREATE POLICY "authenticated_delete_projetos_fechados" ON public.projetos_fechados FOR DELETE TO authenticated USING (true);
END $BODY$;

-- Add valor_fechado to Organizacao_projetos
ALTER TABLE public."Organizacao_projetos" ADD COLUMN IF NOT EXISTS valor_fechado text;

-- Backfill existing data
UPDATE public."Organizacao_projetos" op
SET valor_fechado = pf.valor_fechado
FROM public.projetos_fechados pf
WHERE op."Codigo"::text = pf.cod OR replace(op."Codigo"::text, '.', '') = replace(pf.cod, '.', '');

-- Trigger function for projetos_fechados to sync to Organizacao_projetos
CREATE OR REPLACE FUNCTION public.sync_valor_fechado_to_organizacao()
RETURNS trigger AS $BODY$
BEGIN
  UPDATE public."Organizacao_projetos"
  SET valor_fechado = NEW.valor_fechado
  WHERE "Codigo"::text = NEW.cod OR replace("Codigo"::text, '.', '') = replace(NEW.cod, '.', '');
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_valor_fechado_trigger ON public.projetos_fechados;
CREATE TRIGGER sync_valor_fechado_trigger
AFTER INSERT OR UPDATE OF cod, valor_fechado ON public.projetos_fechados
FOR EACH ROW EXECUTE FUNCTION public.sync_valor_fechado_to_organizacao();

-- Trigger function for Organizacao_projetos to pull from projetos_fechados on insert/update
CREATE OR REPLACE FUNCTION public.sync_valor_fechado_from_projetos()
RETURNS trigger AS $BODY$
BEGIN
  IF NEW."Codigo" IS NOT NULL THEN
    NEW.valor_fechado := COALESCE(NEW.valor_fechado, (
      SELECT valor_fechado 
      FROM public.projetos_fechados 
      WHERE cod = NEW."Codigo"::text OR replace(cod, '.', '') = replace(NEW."Codigo"::text, '.', '')
      LIMIT 1
    ));
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_valor_fechado_org_trigger ON public."Organizacao_projetos";
CREATE TRIGGER sync_valor_fechado_org_trigger
BEFORE INSERT OR UPDATE OF "Codigo" ON public."Organizacao_projetos"
FOR EACH ROW EXECUTE FUNCTION public.sync_valor_fechado_from_projetos();
