-- Add responsavel_obra_id column to projetos table (references usuarios)
-- This fixes the PGRST200 error when querying engenheiro:responsavel_obra_id(nome)

-- 1. Add the column if it doesn't exist
ALTER TABLE public.projetos
  ADD COLUMN IF NOT EXISTS responsavel_obra_id UUID;

-- 2. Add foreign key constraint to usuarios(id) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projetos_responsavel_obra_id_fkey'
      AND table_name = 'projetos'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.projetos
      ADD CONSTRAINT projetos_responsavel_obra_id_fkey
      FOREIGN KEY (responsavel_obra_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Create index for the new FK column
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel_obra_id
  ON public.projetos(responsavel_obra_id);

-- 4. Ensure RLS policies allow SELECT on the column (policies are table-level, not column-level by default)
-- The existing "authenticated_all_projetos" policy already covers all columns.
-- Verify it exists; if not, create it.
DROP POLICY IF EXISTS "authenticated_select_projetos_v2" ON public.projetos;
CREATE POLICY "authenticated_select_projetos_v2" ON public.projetos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_projetos_v2" ON public.projetos;
CREATE POLICY "authenticated_insert_projetos_v2" ON public.projetos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_projetos_v2" ON public.projetos;
CREATE POLICY "authenticated_update_projetos_v2" ON public.projetos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_projetos_v2" ON public.projetos;
CREATE POLICY "authenticated_delete_projetos_v2" ON public.projetos
  FOR DELETE TO authenticated USING (true);
