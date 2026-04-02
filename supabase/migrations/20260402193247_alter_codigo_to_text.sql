-- 1. Drop dependent policies to safely alter the column type
DROP POLICY IF EXISTS "authenticated_delete_projetos" ON public."Organizacao_projetos";
DROP POLICY IF EXISTS "authenticated_insert_projetos" ON public."Organizacao_projetos";
DROP POLICY IF EXISTS "authenticated_select_projetos" ON public."Organizacao_projetos";
DROP POLICY IF EXISTS "authenticated_update_projetos" ON public."Organizacao_projetos";

-- 2. Alter column type to TEXT so it can accept alphanumeric values like "xx2" or formatted strings like "26.083"
ALTER TABLE public."Organizacao_projetos" ALTER COLUMN "Codigo" TYPE TEXT USING "Codigo"::TEXT;

-- 3. Recreate the policies exactly as they were
CREATE POLICY "authenticated_delete_projetos" ON public."Organizacao_projetos"
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_insert_projetos" ON public."Organizacao_projetos"
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_select_projetos" ON public."Organizacao_projetos"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_update_projetos" ON public."Organizacao_projetos"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
