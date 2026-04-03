export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          subtipo: string | null
          tipo: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          subtipo?: string | null
          tipo: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          subtipo?: string | null
          tipo?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_items: {
        Row: {
          created_at: string
          data: string
          generation_id: string | null
          id: string
          notas: string | null
          status: string | null
          tipo: string
          titulo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          generation_id?: string | null
          id?: string
          notas?: string | null
          status?: string | null
          tipo: string
          titulo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          generation_id?: string | null
          id?: string
          notas?: string | null
          status?: string | null
          tipo?: string
          titulo?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_items_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
        ]
      }
      carousels: {
        Row: {
          branding_snapshot: Json | null
          created_at: string
          id: string
          slides: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branding_snapshot?: Json | null
          created_at?: string
          id?: string
          slides?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branding_snapshot?: Json | null
          created_at?: string
          id?: string
          slides?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          specialist: string | null
          titulo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          specialist?: string | null
          titulo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          specialist?: string | null
          titulo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_entries: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          recorrente: boolean | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          recorrente?: boolean | null
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          recorrente?: boolean | null
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          created_at: string
          faturado: number
          id: string
          mes_ano: string
          meta_mensal: number
          produtos_vendidos: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          faturado?: number
          id?: string
          mes_ano: string
          meta_mensal?: number
          produtos_vendidos?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          faturado?: number
          id?: string
          mes_ano?: string
          meta_mensal?: number
          produtos_vendidos?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_settings: {
        Row: {
          created_at: string
          fixed_costs: number
          id: string
          monthly_income_goal: number
          tax_rate: number
          updated_at: string
          user_id: string
          work_days_week: number
          work_hours_day: number
        }
        Insert: {
          created_at?: string
          fixed_costs?: number
          id?: string
          monthly_income_goal?: number
          tax_rate?: number
          updated_at?: string
          user_id: string
          work_days_week?: number
          work_hours_day?: number
        }
        Update: {
          created_at?: string
          fixed_costs?: number
          id?: string
          monthly_income_goal?: number
          tax_rate?: number
          updated_at?: string
          user_id?: string
          work_days_week?: number
          work_hours_day?: number
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          favorito: boolean | null
          id: string
          input_data: Json | null
          output_content: string
          specialist: string
          subtipo: string | null
          tags: string[] | null
          tipo: string
          titulo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          favorito?: boolean | null
          id?: string
          input_data?: Json | null
          output_content: string
          specialist: string
          subtipo?: string | null
          tags?: string[] | null
          tipo: string
          titulo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          favorito?: boolean | null
          id?: string
          input_data?: Json | null
          output_content?: string
          specialist?: string
          subtipo?: string | null
          tags?: string[] | null
          tipo?: string
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      implementation_checklist: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          fase: number
          id: string
          task_key: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          fase: number
          id?: string
          task_key: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          fase?: number
          id?: string
          task_key?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          ticket: number
          tipo_cliente: string | null
          tipo_produto: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          ticket?: number
          tipo_cliente?: string | null
          tipo_produto?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          ticket?: number
          tipo_cliente?: string | null
          tipo_produto?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          arquetipo: string | null
          brand_font_body: string | null
          brand_font_title: string | null
          brand_locked: boolean | null
          brand_logo_url: string | null
          brand_neutral_color: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          brand_style: string | null
          brand_watermark_url: string | null
          created_at: string
          desejo_principal: string | null
          dor_principal: string | null
          email: string | null
          experiencias_marcantes: string | null
          foto_url: string | null
          id: string
          inimigo_comum: string | null
          mecanismo_unico: string | null
          nicho: string | null
          nome: string
          nome_metodo: string | null
          objecoes: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          persona_ideal: string | null
          problema_90_dias: string | null
          promessa_principal: string | null
          sub_nicho: string | null
          tom_voz: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arquetipo?: string | null
          brand_font_body?: string | null
          brand_font_title?: string | null
          brand_locked?: boolean | null
          brand_logo_url?: string | null
          brand_neutral_color?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          brand_style?: string | null
          brand_watermark_url?: string | null
          created_at?: string
          desejo_principal?: string | null
          dor_principal?: string | null
          email?: string | null
          experiencias_marcantes?: string | null
          foto_url?: string | null
          id?: string
          inimigo_comum?: string | null
          mecanismo_unico?: string | null
          nicho?: string | null
          nome: string
          nome_metodo?: string | null
          objecoes?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          persona_ideal?: string | null
          problema_90_dias?: string | null
          promessa_principal?: string | null
          sub_nicho?: string | null
          tom_voz?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arquetipo?: string | null
          brand_font_body?: string | null
          brand_font_title?: string | null
          brand_locked?: boolean | null
          brand_logo_url?: string | null
          brand_neutral_color?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          brand_style?: string | null
          brand_watermark_url?: string | null
          created_at?: string
          desejo_principal?: string | null
          dor_principal?: string | null
          email?: string | null
          experiencias_marcantes?: string | null
          foto_url?: string | null
          id?: string
          inimigo_comum?: string | null
          mecanismo_unico?: string | null
          nicho?: string | null
          nome?: string
          nome_metodo?: string | null
          objecoes?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          persona_ideal?: string | null
          problema_90_dias?: string | null
          promessa_principal?: string | null
          sub_nicho?: string | null
          tom_voz?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_entries: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          paciente_nome: string | null
          produto_id: string | null
          recorrente: boolean | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          paciente_nome?: string | null
          produto_id?: string | null
          recorrente?: boolean | null
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          paciente_nome?: string | null
          produto_id?: string | null
          recorrente?: boolean | null
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_premium_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "elite" | "teste" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "elite", "teste", "user"],
    },
  },
} as const
