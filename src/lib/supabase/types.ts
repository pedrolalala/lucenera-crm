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
          Arquiteto_Responsavel: string | null
          Arquivado: string | null
          Caminho: string | null
          Cidade: string | null
          Codigo: string | null
          Data_Entrada: string | null
          data_fechamento_1: string | null
          data_fechamento_10: string | null
          data_fechamento_2: string | null
          data_fechamento_3: string | null
          data_fechamento_4: string | null
          data_fechamento_5: string | null
          data_fechamento_6: string | null
          data_fechamento_7: string | null
          data_fechamento_8: string | null
          data_fechamento_9: string | null
          Estado: string | null
          id: number
          Nivel_Estrategico: string | null
          Projeto: string | null
          Responsavel: string | null
          Responsavel_da_Obra: string | null
          Status: string | null
          Tipo_de_Item: string | null
          valor_fechado: string | null
          valor_fechado_1: string | null
          valor_fechado_10: string | null
          valor_fechado_2: string | null
          valor_fechado_3: string | null
          valor_fechado_4: string | null
          valor_fechado_5: string | null
          valor_fechado_6: string | null
          valor_fechado_7: string | null
          valor_fechado_8: string | null
          valor_fechado_9: string | null
        }
        Insert: {
          Arquiteto_Responsavel?: string | null
          Arquivado?: string | null
          Caminho?: string | null
          Cidade?: string | null
          Codigo?: string | null
          Data_Entrada?: string | null
          data_fechamento_1?: string | null
          data_fechamento_10?: string | null
          data_fechamento_2?: string | null
          data_fechamento_3?: string | null
          data_fechamento_4?: string | null
          data_fechamento_5?: string | null
          data_fechamento_6?: string | null
          data_fechamento_7?: string | null
          data_fechamento_8?: string | null
          data_fechamento_9?: string | null
          Estado?: string | null
          id?: never
          Nivel_Estrategico?: string | null
          Projeto?: string | null
          Responsavel?: string | null
          Responsavel_da_Obra?: string | null
          Status?: string | null
          Tipo_de_Item?: string | null
          valor_fechado?: string | null
          valor_fechado_1?: string | null
          valor_fechado_10?: string | null
          valor_fechado_2?: string | null
          valor_fechado_3?: string | null
          valor_fechado_4?: string | null
          valor_fechado_5?: string | null
          valor_fechado_6?: string | null
          valor_fechado_7?: string | null
          valor_fechado_8?: string | null
          valor_fechado_9?: string | null
        }
        Update: {
          Arquiteto_Responsavel?: string | null
          Arquivado?: string | null
          Caminho?: string | null
          Cidade?: string | null
          Codigo?: string | null
          Data_Entrada?: string | null
          data_fechamento_1?: string | null
          data_fechamento_10?: string | null
          data_fechamento_2?: string | null
          data_fechamento_3?: string | null
          data_fechamento_4?: string | null
          data_fechamento_5?: string | null
          data_fechamento_6?: string | null
          data_fechamento_7?: string | null
          data_fechamento_8?: string | null
          data_fechamento_9?: string | null
          Estado?: string | null
          id?: never
          Nivel_Estrategico?: string | null
          Projeto?: string | null
          Responsavel?: string | null
          Responsavel_da_Obra?: string | null
          Status?: string | null
          Tipo_de_Item?: string | null
          valor_fechado?: string | null
          valor_fechado_1?: string | null
          valor_fechado_10?: string | null
          valor_fechado_2?: string | null
          valor_fechado_3?: string | null
          valor_fechado_4?: string | null
          valor_fechado_5?: string | null
          valor_fechado_6?: string | null
          valor_fechado_7?: string | null
          valor_fechado_8?: string | null
          valor_fechado_9?: string | null
        }
        Relationships: []
      }
      projetos_fechados: {
        Row: {
          arquiteto: string | null
          causa_pagamento: string | null
          cliente: string | null
          cod: string | null
          coluna1: string | null
          data: string | null
          data_fechamento: string | null
          forma_pagamento: string | null
          projetista: string | null
          valor_fechado: string | null
        }
        Insert: {
          arquiteto?: string | null
          causa_pagamento?: string | null
          cliente?: string | null
          cod?: string | null
          coluna1?: string | null
          data?: string | null
          data_fechamento?: string | null
          forma_pagamento?: string | null
          projetista?: string | null
          valor_fechado?: string | null
        }
        Update: {
          arquiteto?: string | null
          causa_pagamento?: string | null
          cliente?: string | null
          cod?: string | null
          coluna1?: string | null
          data?: string | null
          data_fechamento?: string | null
          forma_pagamento?: string | null
          projetista?: string | null
          valor_fechado?: string | null
        }
        Relationships: []
      }
      sync_history: {
        Row: {
          created_at: string | null
          data_sincronizacao: string | null
          id: number
          mensagem: string | null
          projetos_atualizados: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data_sincronizacao?: string | null
          id?: never
          mensagem?: string | null
          projetos_atualizados?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data_sincronizacao?: string | null
          id?: never
          mensagem?: string | null
          projetos_atualizados?: number | null
          status?: string | null
        }
        Relationships: []
      }
      usuarios_crm: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          role?: string | null
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
//   Codigo: text (nullable)
//   Nivel_Estrategico: text (nullable)
//   Projeto: text (nullable)
//   Responsavel: text (nullable)
//   Data_Entrada: text (nullable)
//   Status: text (nullable)
//   Arquiteto_Responsavel: text (nullable)
//   Responsavel_da_Obra: text (nullable)
//   Cidade: text (nullable)
//   Estado: text (nullable)
//   Arquivado: text (nullable)
//   Tipo_de_Item: text (nullable)
//   Caminho: text (nullable)
//   valor_fechado: text (nullable)
//   valor_fechado_1: text (nullable)
//   data_fechamento_1: text (nullable)
//   valor_fechado_2: text (nullable)
//   data_fechamento_2: text (nullable)
//   valor_fechado_3: text (nullable)
//   data_fechamento_3: text (nullable)
//   valor_fechado_4: text (nullable)
//   data_fechamento_4: text (nullable)
//   valor_fechado_5: text (nullable)
//   data_fechamento_5: text (nullable)
//   valor_fechado_6: text (nullable)
//   data_fechamento_6: text (nullable)
//   valor_fechado_7: text (nullable)
//   data_fechamento_7: text (nullable)
//   valor_fechado_8: text (nullable)
//   data_fechamento_8: text (nullable)
//   valor_fechado_9: text (nullable)
//   data_fechamento_9: text (nullable)
//   valor_fechado_10: text (nullable)
//   data_fechamento_10: text (nullable)
//   id: bigint (not null)
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
// Table: projetos_fechados
//   cod: text (nullable)
//   cliente: text (nullable)
//   coluna1: text (nullable)
//   data: text (nullable)
//   projetista: text (nullable)
//   valor_fechado: text (nullable)
//   causa_pagamento: text (nullable)
//   forma_pagamento: text (nullable)
//   data_fechamento: text (nullable)
//   arquiteto: text (nullable)
// Table: sync_history
//   id: bigint (not null)
//   data_sincronizacao: timestamp without time zone (nullable, default: now())
//   projetos_atualizados: integer (nullable)
//   status: text (nullable)
//   mensagem: text (nullable)
//   created_at: timestamp without time zone (nullable, default: now())
// Table: usuarios_crm
//   id: uuid (not null)
//   email: text (not null)
//   nome: text (nullable)
//   role: text (nullable, default: 'User'::text)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: Organizacao_projetos
//   PRIMARY KEY Organizacao_projetos_pkey: PRIMARY KEY (id)
// Table: eletricistas_crm
//   PRIMARY KEY eletricistas_crm_pkey: PRIMARY KEY (id)
// Table: engenheiro_crm
//   PRIMARY KEY engenheiro_crm_pkey: PRIMARY KEY (id)
// Table: sync_history
//   PRIMARY KEY sync_history_pkey: PRIMARY KEY (id)
// Table: usuarios_crm
//   FOREIGN KEY usuarios_crm_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_crm_pkey: PRIMARY KEY (id)

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
// Table: projetos_fechados
//   Policy "authenticated_delete_projetos_fechados" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_projetos_fechados" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_projetos_fechados" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_projetos_fechados" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: sync_history
//   Policy "Allow all" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: usuarios_crm
//   Policy "admin_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_crm usuarios_crm_1   WHERE ((usuarios_crm_1.id = auth.uid()) AND (usuarios_crm_1.role = 'Admin'::text))))
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION create_user(text, text, text, text)
//   CREATE OR REPLACE FUNCTION public.create_user(p_email text, p_name text, p_password text, p_role text)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     new_user_id uuid;
//     is_admin boolean;
//   BEGIN
//     -- Verify caller is an Admin using usuarios_crm
//     is_admin := EXISTS (
//       SELECT 1
//       FROM public.usuarios_crm
//       WHERE id = auth.uid() AND role = 'Admin'
//     );
//
//     -- Fallback if the user is not admin and the table is not empty (for bootstrap)
//     IF NOT is_admin AND EXISTS (SELECT 1 FROM public.usuarios_crm) THEN
//       RAISE EXCEPTION 'Apenas administradores podem criar novos usuários.';
//     END IF;
//
//     -- Check for existing email in auth.users
//     IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
//       RAISE EXCEPTION 'Um usuário com este e-mail já existe na base de autenticação.';
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
//       new_user_id, '00000000-0000-0000-0000-000000000000'::uuid, p_email,
//       crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW(),
//       '{"provider": "email", "providers": ["email"]}'::jsonb,
//       json_build_object('name', p_name)::jsonb,
//       false, 'authenticated', 'authenticated',
//       '', '', '', '', '', NULL, '', '', ''
//     );
//
//     -- Insert into usuarios_crm automatically (using ON CONFLICT to avoid errors with the trigger)
//     INSERT INTO public.usuarios_crm (id, email, nome, role)
//     VALUES (new_user_id, p_email, p_name, p_role)
//     ON CONFLICT (id) DO UPDATE
//     SET nome = EXCLUDED.nome, role = EXCLUDED.role;
//
//     RETURN new_user_id;
//   END;
//   $function$
//
// FUNCTION handle_new_auth_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios_crm (id, email, nome, role)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
//       'User'
//     )
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION sync_valor_fechado_from_projetos()
//   CREATE OR REPLACE FUNCTION public.sync_valor_fechado_from_projetos()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NEW."Codigo" IS NOT NULL THEN
//       NEW.valor_fechado := COALESCE(NEW.valor_fechado, (
//         SELECT valor_fechado
//         FROM public.projetos_fechados
//         WHERE cod = NEW."Codigo"::text OR replace(cod, '.', '') = replace(NEW."Codigo"::text, '.', '')
//         LIMIT 1
//       ));
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION sync_valor_fechado_to_organizacao()
//   CREATE OR REPLACE FUNCTION public.sync_valor_fechado_to_organizacao()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     UPDATE public."Organizacao_projetos"
//     SET valor_fechado = NEW.valor_fechado
//     WHERE "Codigo"::text = NEW.cod OR replace("Codigo"::text, '.', '') = replace(NEW.cod, '.', '');
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: Organizacao_projetos
//   sync_valor_fechado_org_trigger: CREATE TRIGGER sync_valor_fechado_org_trigger BEFORE INSERT OR UPDATE OF "Codigo" ON public."Organizacao_projetos" FOR EACH ROW EXECUTE FUNCTION sync_valor_fechado_from_projetos()
// Table: projetos_fechados
//   sync_valor_fechado_trigger: CREATE TRIGGER sync_valor_fechado_trigger AFTER INSERT OR UPDATE OF cod, valor_fechado ON public.projetos_fechados FOR EACH ROW EXECUTE FUNCTION sync_valor_fechado_to_organizacao()
