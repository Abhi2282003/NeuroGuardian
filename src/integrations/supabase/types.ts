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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_results: {
        Row: {
          activity_key: string
          created_at: string | null
          duration_sec: number | null
          features: Json | null
          id: string
          notes: string | null
          quality_flags: Json | null
          raw_payload: Json | null
          score: number | null
          session_id: string | null
        }
        Insert: {
          activity_key: string
          created_at?: string | null
          duration_sec?: number | null
          features?: Json | null
          id?: string
          notes?: string | null
          quality_flags?: Json | null
          raw_payload?: Json | null
          score?: number | null
          session_id?: string | null
        }
        Update: {
          activity_key?: string
          created_at?: string | null
          duration_sec?: number | null
          features?: Json | null
          id?: string
          notes?: string | null
          quality_flags?: Json | null
          raw_payload?: Json | null
          score?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string | null
          id: string
          meta: Json | null
          session_id: string | null
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          session_id?: string | null
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          session_id?: string | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          alert_id: string | null
          counsellor_id: string
          created_at: string
          id: string
          message: string
          responded_at: string | null
          status: Database["public"]["Enums"]["alert_status"]
          student_id: string
        }
        Insert: {
          alert_id?: string | null
          counsellor_id: string
          created_at?: string
          id?: string
          message: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          student_id: string
        }
        Update: {
          alert_id?: string | null
          counsellor_id?: string
          created_at?: string
          id?: string
          message?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "high_risk_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_check_ins: {
        Row: {
          check_date: string
          created_at: string
          id: string
          mood: number
          notes: string | null
          sleep_hours: number
          stress: number
          user_id: string
        }
        Insert: {
          check_date?: string
          created_at?: string
          id?: string
          mood: number
          notes?: string | null
          sleep_hours: number
          stress: number
          user_id: string
        }
        Update: {
          check_date?: string
          created_at?: string
          id?: string
          mood?: number
          notes?: string | null
          sleep_hours?: number
          stress?: number
          user_id?: string
        }
        Relationships: []
      }
      high_risk_alerts: {
        Row: {
          age_range: string
          created_at: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          risk_level: Database["public"]["Enums"]["risk_level_type"]
          score: number | null
          source: string
          user_id: string
        }
        Insert: {
          age_range: string
          created_at?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          risk_level: Database["public"]["Enums"]["risk_level_type"]
          score?: number | null
          source: string
          user_id: string
        }
        Update: {
          age_range?: string
          created_at?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level_type"]
          score?: number | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number | null
          consent_flags: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          mrn: string | null
          name: string
          phone: string | null
          sex: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          consent_flags?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mrn?: string | null
          name: string
          phone?: string | null
          sex?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          consent_flags?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mrn?: string | null
          name?: string
          phone?: string | null
          sex?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "available_counsellors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          condition: Database["public"]["Enums"]["condition_type"] | null
          created_at: string | null
          id: string
          locale: string | null
          name: string
          organization: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          condition?: Database["public"]["Enums"]["condition_type"] | null
          created_at?: string | null
          id: string
          locale?: string | null
          name: string
          organization?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          condition?: Database["public"]["Enums"]["condition_type"] | null
          created_at?: string | null
          id?: string
          locale?: string | null
          name?: string
          organization?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_summaries: {
        Row: {
          disorder_key: Database["public"]["Enums"]["disorder_type"]
          id: string
          rationale: Json | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          score: number | null
          session_id: string | null
          stage_label: string | null
          updated_at: string | null
        }
        Insert: {
          disorder_key: Database["public"]["Enums"]["disorder_type"]
          id?: string
          rationale?: Json | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          score?: number | null
          session_id?: string | null
          stage_label?: string | null
          updated_at?: string | null
        }
        Update: {
          disorder_key?: Database["public"]["Enums"]["disorder_type"]
          id?: string
          rationale?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          score?: number | null
          session_id?: string | null
          stage_label?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_messages: {
        Row: {
          connection_request_id: string
          created_at: string
          id: string
          message: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          connection_request_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          connection_request_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_messages_connection_request_id_fkey"
            columns: ["connection_request_id"]
            isOneToOne: false
            referencedRelation: "connection_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_by: string | null
          device_info: Json | null
          id: string
          location: string | null
          offline_flag: boolean | null
          patient_id: string | null
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          device_info?: Json | null
          id?: string
          location?: string | null
          offline_flag?: boolean | null
          patient_id?: string | null
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          device_info?: Json | null
          id?: string
          location?: string | null
          offline_flag?: boolean | null
          patient_id?: string | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "available_counsellors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_messages: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          feedback: string | null
          id: string
          message: string
          target_risk_level: Database["public"]["Enums"]["risk_level_type"]
          template_name: string
          volunteer_id: string
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          message: string
          target_risk_level: Database["public"]["Enums"]["risk_level_type"]
          template_name: string
          volunteer_id: string
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          message?: string
          target_risk_level?: Database["public"]["Enums"]["risk_level_type"]
          template_name?: string
          volunteer_id?: string
        }
        Relationships: []
      }
      volunteer_trust_scores: {
        Row: {
          approved_messages: number | null
          id: string
          rejected_messages: number | null
          trusted: boolean | null
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          approved_messages?: number | null
          id?: string
          rejected_messages?: number | null
          trusted?: boolean | null
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          approved_messages?: number | null
          id?: string
          rejected_messages?: number | null
          trusted?: boolean | null
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      available_counsellors: {
        Row: {
          active_connections: number | null
          id: string | null
          name: string | null
          organization: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_status: "pending" | "accepted" | "declined" | "expired"
      app_role: "admin" | "doctor" | "health_worker" | "patient" | "volunteer"
      condition_type:
        | "student_mental_health"
        | "parkinsons"
        | "alzheimers"
        | "other_neurological"
      disorder_type: "parkinson" | "alzheimer" | "epilepsy"
      risk_level: "low" | "moderate" | "high"
      risk_level_type: "low" | "moderate" | "high" | "severe"
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
      alert_status: ["pending", "accepted", "declined", "expired"],
      app_role: ["admin", "doctor", "health_worker", "patient", "volunteer"],
      condition_type: [
        "student_mental_health",
        "parkinsons",
        "alzheimers",
        "other_neurological",
      ],
      disorder_type: ["parkinson", "alzheimer", "epilepsy"],
      risk_level: ["low", "moderate", "high"],
      risk_level_type: ["low", "moderate", "high", "severe"],
    },
  },
} as const
