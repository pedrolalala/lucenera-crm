// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      Arquitetos_empresas_crm: {
        Row: {
          Bairro: string | null
          Celular: string | null
          CEP: string | null
          Cidade: string | null
          codigo_do_arquiteto: number | null
          'CPF/CNPJ': string | null
          data_de_nascimento: string | null
          Email: string | null
          endereço: string | null
          Estado: string | null
          'Nome da Empresa': string | null
          'Nome do Arquiteto': string | null
          numero_de_arquitetos: number | null
          Observacoes: string | null
          RG: string | null
          Telefone: string | null
        }
        Insert: {
          Bairro?: string | null
          Celular?: string | null
          CEP?: string | null
          Cidade?: string | null
          codigo_do_arquiteto?: number | null
          'CPF/CNPJ'?: string | null
          data_de_nascimento?: string | null
          Email?: string | null
          endereço?: string | null
          Estado?: string | null
          'Nome da Empresa'?: string | null
          'Nome do Arquiteto'?: string | null
          numero_de_arquitetos?: number | null
          Observacoes?: string | null
          RG?: string | null
          Telefone?: string | null
        }
        Update: {
          Bairro?: string | null
          Celular?: string | null
          CEP?: string | null
          Cidade?: string | null
          codigo_do_arquiteto?: number | null
          'CPF/CNPJ'?: string | null
          data_de_nascimento?: string | null
          Email?: string | null
          endereço?: string | null
          Estado?: string | null
          'Nome da Empresa'?: string | null
          'Nome do Arquiteto'?: string | null
          numero_de_arquitetos?: number | null
          Observacoes?: string | null
          RG?: string | null
          Telefone?: string | null
        }
        Relationships: []
      }
      clientes_crm: {
        Row: {
          br_cliente: string | null
          cep_cliente: string | null
          cid_cliente: string | null
          cod_cliente: number | null
          completo: string | null
          email_cliente: string | null
          email_financeiro: string | null
          end_cliente: string | null
          fax_cliente: string | null
          nm_cliente: string | null
          obs_cliente: string | null
          tel_cliente: string | null
          uf_cliente: string | null
        }
        Insert: {
          br_cliente?: string | null
          cep_cliente?: string | null
          cid_cliente?: string | null
          cod_cliente?: number | null
          completo?: string | null
          email_cliente?: string | null
          email_financeiro?: string | null
          end_cliente?: string | null
          fax_cliente?: string | null
          nm_cliente?: string | null
          obs_cliente?: string | null
          tel_cliente?: string | null
          uf_cliente?: string | null
        }
        Update: {
          br_cliente?: string | null
          cep_cliente?: string | null
          cid_cliente?: string | null
          cod_cliente?: number | null
          completo?: string | null
          email_cliente?: string | null
          email_financeiro?: string | null
          end_cliente?: string | null
          fax_cliente?: string | null
          nm_cliente?: string | null
          obs_cliente?: string | null
          tel_cliente?: string | null
          uf_cliente?: string | null
        }
        Relationships: []
      }
      eletricistas_crm: {
        Row: {
          cidade: string | null
          created_at: string
          email: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      engenheiro_crm: {
        Row: {
          created_at: string
          email: string | null
          empresa: string | null
          endereco_comercial: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco_comercial?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco_comercial?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      Organizacao_projetos: {
        Row: {
          arquiteto: string | null
          Cidade: string | null
          Codigo: number | null
          data_entrada: string | null
          eletricista: string | null
          engenheiro: string | null
          Estado: string | null
          id: number
          nivel_estrategico: string | null
          Projeto: string | null
          responsavel: string | null
          Status: string | null
        }
        Insert: {
          arquiteto?: string | null
          Cidade?: string | null
          Codigo?: number | null
          data_entrada?: string | null
          eletricista?: string | null
          engenheiro?: string | null
          Estado?: string | null
          id?: number
          nivel_estrategico?: string | null
          Projeto?: string | null
          responsavel?: string | null
          Status?: string | null
        }
        Update: {
          arquiteto?: string | null
          Cidade?: string | null
          Codigo?: number | null
          data_entrada?: string | null
          eletricista?: string | null
          engenheiro?: string | null
          Estado?: string | null
          id?: number
          nivel_estrategico?: string | null
          Projeto?: string | null
          responsavel?: string | null
          Status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user: {
        Args: {
          p_email: string
          p_name: string
          p_password: string
          p_role: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: Arquitetos_empresas_crm
//   codigo_do_arquiteto: bigint (nullable)
//   Nome do Arquiteto: text (nullable)
//   endereço: text (nullable)
//   Bairro: text (nullable)
//   CEP: text (nullable)
//   Cidade: text (nullable)
//   Estado: text (nullable)
//   data_de_nascimento: text (nullable)
//   Telefone: text (nullable)
//   Celular: text (nullable)
//   RG: text (nullable)
//   CPF/CNPJ: text (nullable)
//   Nome da Empresa: text (nullable)
//   numero_de_arquitetos: bigint (nullable)
//   Observacoes: text (nullable)
//   Email: text (nullable)
// Table: Organizacao_projetos
//   Codigo: bigint (nullable)
//   nivel_estrategico: text (nullable)
//   Projeto: text (nullable)
//   responsavel: text (nullable)
//   data_entrada: text (nullable)
//   Status: text (nullable)
//   arquiteto: text (nullable)
//   engenheiro: text (nullable)
//   Cidade: text (nullable)
//   Estado: text (nullable)
//   eletricista: text (nullable)
//   id: bigint (not null, default: nextval('"Organizacao_projetos_id_seq"'::regclass))
// Table: clientes_crm
//   cod_cliente: bigint (nullable)
//   nm_cliente: text (nullable)
//   end_cliente: text (nullable)
//   br_cliente: text (nullable)
//   cep_cliente: text (nullable)
//   cid_cliente: text (nullable)
//   uf_cliente: text (nullable)
//   tel_cliente: text (nullable)
//   fax_cliente: text (nullable)
//   obs_cliente: text (nullable)
//   email_cliente: text (nullable)
//   email_financeiro: text (nullable)
//   completo: text (nullable)
// Table: eletricistas_crm
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   telefone: text (nullable)
//   email: text (nullable)
//   cidade: text (nullable)
//   estado: text (nullable)
//   observacoes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: engenheiro_crm
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   tipo: text (nullable)
//   email: text (nullable)
//   telefone: text (nullable)
//   empresa: text (nullable)
//   endereco_comercial: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: Organizacao_projetos
//   PRIMARY KEY Organizacao_projetos_pkey: PRIMARY KEY (id)
// Table: eletricistas_crm
//   PRIMARY KEY eletricistas_crm_pkey: PRIMARY KEY (id)
// Table: engenheiro_crm
//   PRIMARY KEY engenheiro_crm_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: Arquitetos_empresas_crm
//   Policy "authenticated_delete_arquitetos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_arquitetos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_arquitetos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_arquitetos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: Organizacao_projetos
//   Policy "authenticated_delete_projetos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_projetos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_projetos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_projetos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clientes_crm
//   Policy "authenticated_delete_clientes" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_clientes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_clientes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_clientes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: eletricistas_crm
//   Policy "authenticated_delete_eletricistas" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_eletricistas" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_eletricistas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_eletricistas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: engenheiro_crm
//   Policy "authenticated_delete_engenheiros" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_engenheiros" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_engenheiros" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_engenheiros" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION create_user(text, text, text, text)
//   CREATE OR REPLACE FUNCTION public.create_user(p_email text, p_password text, p_name text, p_role text)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     new_user_id uuid;
//     is_admin boolean;
//   BEGIN
//     -- Verify caller is an Admin
//     SELECT role = 'Admin' INTO is_admin FROM public.profiles WHERE id = auth.uid();
//     IF NOT is_admin THEN
//       RAISE EXCEPTION 'Apenas administradores podem criar novos usuários.';
//     END IF;
//
//     -- Check for existing email
//     IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
//       RAISE EXCEPTION 'Um usuário com este e-mail já existe.';
//     END IF;
//
//     new_user_id := gen_random_uuid();
//
//     -- Bypass Supabase API to insert user directly (allows smaller passwords and avoids Edge Functions)
//     INSERT INTO auth.users (
//       id, instance_id, email, encrypted_password, email_confirmed_at,
//       created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
//       is_super_admin, role, aud,
//       confirmation_token, recovery_token, email_change_token_new,
//       email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
//     ) VALUES (
//       new_user_id, '00000000-0000-0000-0000-000000000000', p_email,
//       crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW(),
//       '{"provider": "email", "providers": ["email"]}',
//       json_build_object('name', p_name),
//       false, 'authenticated', 'authenticated',
//       '', '', '', '', '', NULL, '', '', ''
//     );
//
//     INSERT INTO public.profiles (id, email, name, role)
//     VALUES (new_user_id, p_email, p_name, p_role);
//
//     RETURN new_user_id;
//   END;
//   $function$
//
