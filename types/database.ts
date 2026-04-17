// Auto-generated from Supabase schema  do not edit by hand.
// Regenerate with: supabase gen types typescript --project-id lvtfgpujbyionrinapmr
// Or via Supabase MCP: mcp__supabase__generate_typescript_types

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      document_analyses: {
        Row: {
          analysis_version: number | null
          created_at: string | null
          document_id: string
          document_type_detected: string | null
          follow_up_date: string | null
          id: string
          key_findings: Json | null
          llm_model_used: string | null
          llm_tokens_used: number | null
          medications_found: Json | null
          raw_llm_response: string | null
          recommendations: Json | null
          risk_flags: Json | null
          summary: string
          terms_explained: Json | null
          updated_at: string | null
          user_id: string
          values_out_of_range: Json | null
        }
        Insert: {
          analysis_version?: number | null
          created_at?: string | null
          document_id: string
          document_type_detected?: string | null
          follow_up_date?: string | null
          id?: string
          key_findings?: Json | null
          llm_model_used?: string | null
          llm_tokens_used?: number | null
          medications_found?: Json | null
          raw_llm_response?: string | null
          recommendations?: Json | null
          risk_flags?: Json | null
          summary: string
          terms_explained?: Json | null
          updated_at?: string | null
          user_id: string
          values_out_of_range?: Json | null
        }
        Update: {
          analysis_version?: number | null
          created_at?: string | null
          document_id?: string
          document_type_detected?: string | null
          follow_up_date?: string | null
          id?: string
          key_findings?: Json | null
          llm_model_used?: string | null
          llm_tokens_used?: number | null
          medications_found?: Json | null
          raw_llm_response?: string | null
          recommendations?: Json | null
          risk_flags?: Json | null
          summary?: string
          terms_explained?: Json | null
          updated_at?: string | null
          user_id?: string
          values_out_of_range?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_analyses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          doctor_name: string | null
          document_date: string | null
          document_type: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          hospital_name: string | null
          id: string
          ocr_confidence: number | null
          ocr_engine: string | null
          ocr_text: string | null
          processing_status: string | null
          profile_id: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doctor_name?: string | null
          document_date?: string | null
          document_type: string
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          hospital_name?: string | null
          id?: string
          ocr_confidence?: number | null
          ocr_engine?: string | null
          ocr_text?: string | null
          processing_status?: string | null
          profile_id: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          doctor_name?: string | null
          document_date?: string | null
          document_type?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          hospital_name?: string | null
          id?: string
          ocr_confidence?: number | null
          ocr_engine?: string | null
          ocr_text?: string | null
          processing_status?: string | null
          profile_id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      family_profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_group: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          family_group_id: string
          full_name: string
          gender: string | null
          height_cm: number | null
          id: string
          is_active: boolean | null
          known_conditions: string[] | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_group?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_group_id: string
          full_name: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          known_conditions?: string[] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_group?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_group_id?: string
          full_name?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          known_conditions?: string[] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "family_profiles_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_values: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          profile_id: string
          reference_range_high: number | null
          reference_range_low: number | null
          status: string | null
          test_category: string | null
          test_date: string
          test_name: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          profile_id: string
          reference_range_high?: number | null
          reference_range_low?: number | null
          status?: string | null
          test_category?: string | null
          test_date: string
          test_name: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          profile_id?: string
          reference_range_high?: number | null
          reference_range_low?: number | null
          status?: string | null
          test_category?: string | null
          test_date?: string
          test_name?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_values_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_values_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          action: string
          action_time: string | null
          created_at: string | null
          id: string
          medication_id: string
          notes: string | null
          scheduled_time: string
          user_id: string
        }
        Insert: {
          action: string
          action_time?: string | null
          created_at?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          scheduled_time: string
          user_id: string
        }
        Update: {
          action?: string
          action_time?: string | null
          created_at?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          scheduled_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          prescribing_doctor: string | null
          profile_id: string
          reminder_enabled: boolean | null
          reminder_times: string[] | null
          source_document_id: string | null
          start_date: string | null
          status: string | null
          timing: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          prescribing_doctor?: string | null
          profile_id: string
          reminder_enabled?: boolean | null
          reminder_times?: string[] | null
          source_document_id?: string | null
          start_date?: string | null
          status?: string | null
          timing?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          prescribing_doctor?: string | null
          profile_id?: string
          reminder_enabled?: boolean | null
          reminder_times?: string[] | null
          source_document_id?: string | null
          start_date?: string | null
          status?: string | null
          timing?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          profile_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          channel?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          profile_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          profile_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          condition_tags: string[] | null
          created_at: string | null
          doctor_name: string | null
          id: string
          medication_count: number | null
          prescription_date: string | null
          profile_id: string
          user_id: string
        }
        Insert: {
          condition_tags?: string[] | null
          created_at?: string | null
          doctor_name?: string | null
          id?: string
          medication_count?: number | null
          prescription_date?: string | null
          profile_id: string
          user_id: string
        }
        Update: {
          condition_tags?: string[] | null
          created_at?: string | null
          doctor_name?: string | null
          id?: string
          medication_count?: number | null
          prescription_date?: string | null
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preventive_reminders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          is_completed: boolean | null
          linked_document_id: string | null
          profile_id: string
          recurrence_months: number | null
          reminder_type: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean | null
          linked_document_id?: string | null
          profile_id: string
          recurrence_months?: number | null
          reminder_type: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean | null
          linked_document_id?: string | null
          profile_id?: string
          recurrence_months?: number | null
          reminder_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventive_reminders_linked_document_id_fkey"
            columns: ["linked_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_reminders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_memberships: {
        Row: {
          created_at: string
          family_group_id: string
          is_self: boolean
          profile_id: string
          relationship: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_group_id: string
          is_self?: boolean
          profile_id: string
          relationship: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_group_id?: string
          is_self?: boolean
          profile_id?: string
          relationship?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_memberships_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          device_info: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          device_info?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          device_info?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_links: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          include_lab_trends: boolean | null
          include_medications: boolean | null
          include_timeline: boolean | null
          is_revoked: boolean | null
          last_viewed_at: string | null
          pin_hash: string | null
          profile_id: string
          share_token: string
          shared_document_ids: string[] | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          include_lab_trends?: boolean | null
          include_medications?: boolean | null
          include_timeline?: boolean | null
          is_revoked?: boolean | null
          last_viewed_at?: string | null
          pin_hash?: string | null
          profile_id: string
          share_token?: string
          shared_document_ids?: string[] | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          include_lab_trends?: boolean | null
          include_medications?: boolean | null
          include_timeline?: boolean | null
          is_revoked?: boolean | null
          last_viewed_at?: string | null
          pin_hash?: string | null
          profile_id?: string
          share_token?: string
          shared_document_ids?: string[] | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          metadata: Json | null
          profile_id: string
          severity: string | null
          source_document_id: string | null
          source_medication_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          metadata?: Json | null
          profile_id: string
          severity?: string | null
          source_document_id?: string | null
          source_medication_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          profile_id?: string
          severity?: string | null
          source_document_id?: string | null
          source_medication_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_source_medication_id_fkey"
            columns: ["source_medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          created_at:         string | null
          id:                 string
          invalid_uploads:    number
          is_blocked:         boolean
          successful_uploads: number
          updated_at:         string | null
          user_id:            string
        }
        Insert: {
          created_at?:         string | null
          id?:                 string
          invalid_uploads?:    number
          is_blocked?:         boolean
          successful_uploads?: number
          updated_at?:         string | null
          user_id:             string
        }
        Update: {
          created_at?:         string | null
          id?:                 string
          invalid_uploads?:    number
          is_blocked?:         boolean
          successful_uploads?: number
          updated_at?:         string | null
          user_id?:            string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_successful_upload: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_invalid_upload: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_shared_link: {
        Args: { token: string }
        Returns: {
          created_at: string | null
          expires_at: string
          id: string
          include_lab_trends: boolean | null
          include_medications: boolean | null
          include_timeline: boolean | null
          is_revoked: boolean | null
          last_viewed_at: string | null
          pin_hash: string | null
          profile_id: string
          share_token: string
          shared_document_ids: string[] | null
          user_id: string
          view_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "shared_links"
          isOneToOne: false
          isSetofReturn: true
        }
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
    Enums: {},
  },
} as const
