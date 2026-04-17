DO $$
BEGIN
  -- 1. Drop the old foreign key constraint that incorrectly pointed to contatos
  ALTER TABLE public.projetos DROP CONSTRAINT IF EXISTS projetos_responsavel_id_fkey;

  -- 2. Clean up existing invalid responsavel_id (set to NULL if they don't exist in usuarios)
  UPDATE public.projetos
  SET responsavel_id = NULL
  WHERE responsavel_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = public.projetos.responsavel_id);

  -- 3. Add the new foreign key constraint pointing to usuarios
  BEGIN
    ALTER TABLE public.projetos ADD CONSTRAINT projetos_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.usuarios(id);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 4. Update the trigger function to fetch the name from usuarios instead of contatos
CREATE OR REPLACE FUNCTION public.sync_responsavel_nome()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.responsavel_id IS NOT NULL THEN
    SELECT nome INTO NEW.responsavel_nome
    FROM public.usuarios WHERE id = NEW.responsavel_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. Fix propagate_contato_nome to no longer update projetos.responsavel_nome
CREATE OR REPLACE FUNCTION public.propagate_contato_nome()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.nome IS NOT DISTINCT FROM NEW.nome THEN
    RETURN NEW;
  END IF;

  UPDATE public.separacoes
  SET cliente    = NEW.nome,
      updated_at = NOW()
  WHERE cliente_id = NEW.id;

  RETURN NEW;
END;
$function$;

-- 6. Create trigger on usuarios to update projetos.responsavel_nome
CREATE OR REPLACE FUNCTION public.propagate_usuario_nome()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.nome IS NOT DISTINCT FROM NEW.nome THEN
    RETURN NEW;
  END IF;

  UPDATE public.projetos
  SET responsavel_nome = NEW.nome,
      updated_at       = NOW()
  WHERE responsavel_id = NEW.id;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_propagate_usuario_nome ON public.usuarios;
CREATE TRIGGER trg_propagate_usuario_nome
 AFTER UPDATE OF nome ON public.usuarios
 FOR EACH ROW EXECUTE FUNCTION public.propagate_usuario_nome();
