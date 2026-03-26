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
      architects: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          registration: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      engineers: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          registration: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          architect_id: string | null
          city: string
          client_id: string | null
          created_at: string
          engineer_id: string | null
          entry_date: string
          history: Json
          id: string
          name: string
          responsible: string
          state: string
          status: string
          strategic_level: string
        }
        Insert: {
          architect_id?: string | null
          city: string
          client_id?: string | null
          created_at?: string
          engineer_id?: string | null
          entry_date: string
          history?: Json
          id: string
          name: string
          responsible: string
          state: string
          status: string
          strategic_level: string
        }
        Update: {
          architect_id?: string | null
          city?: string
          client_id?: string | null
          created_at?: string
          engineer_id?: string | null
          entry_date?: string
          history?: Json
          id?: string
          name?: string
          responsible?: string
          state?: string
          status?: string
          strategic_level?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_architect_id_fkey'
            columns: ['architect_id']
            isOneToOne: false
            referencedRelation: 'architects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_engineer_id_fkey'
            columns: ['engineer_id']
            isOneToOne: false
            referencedRelation: 'engineers'
            referencedColumns: ['id']
          },
        ]
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
// Table: architects
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   document: text (nullable)
//   registration: text (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   document: text (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: engineers
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   document: text (nullable)
//   registration: text (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (not null)
//   role: text (not null, default: 'User'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: projects
//   id: text (not null)
//   strategic_level: text (not null)
//   name: text (not null)
//   responsible: text (not null)
//   status: text (not null)
//   entry_date: timestamp with time zone (not null)
//   architect_id: uuid (nullable)
//   engineer_id: uuid (nullable)
//   client_id: uuid (nullable)
//   city: text (not null)
//   state: text (not null)
//   history: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: architects
//   PRIMARY KEY architects_pkey: PRIMARY KEY (id)
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: engineers
//   PRIMARY KEY engineers_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: projects
//   FOREIGN KEY projects_architect_id_fkey: FOREIGN KEY (architect_id) REFERENCES architects(id) ON DELETE SET NULL
//   FOREIGN KEY projects_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
//   FOREIGN KEY projects_engineer_id_fkey: FOREIGN KEY (engineer_id) REFERENCES engineers(id) ON DELETE SET NULL
//   PRIMARY KEY projects_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: architects
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: clients
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: engineers
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: profiles
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: projects
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true

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
