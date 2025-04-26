export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profile_ranges: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          max_score: number
          min_score: number
          profile: string
          quiz_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_score: number
          min_score: number
          profile: string
          quiz_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_score?: number
          min_score?: number
          profile?: string
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_ranges_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      question_answers: {
        Row: {
          answer: string[] | null
          created_at: string | null
          id: string
          question_id: string | null
          response_id: string | null
        }
        Insert: {
          answer?: string[] | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          response_id?: string | null
        }
        Update: {
          answer?: string[] | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          response_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      question_conditions: {
        Row: {
          created_at: string | null
          dependent_question_id: string | null
          id: string
          operator: Database["public"]["Enums"]["condition_operator"]
          question_id: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          dependent_question_id?: string | null
          id?: string
          operator: Database["public"]["Enums"]["condition_operator"]
          question_id?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          dependent_question_id?: string | null
          id?: string
          operator?: Database["public"]["Enums"]["condition_operator"]
          question_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_conditions_dependent_question_id_fkey"
            columns: ["dependent_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_conditions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          question_id: string | null
          text: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index: number
          question_id?: string | null
          text: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          question_id?: string | null
          text?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          quiz_id: string | null
          required: boolean | null
          text: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index: number
          quiz_id?: string | null
          required?: boolean | null
          text: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          quiz_id?: string | null
          required?: boolean | null
          text?: string
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          completed_at: string | null
          id: string
          is_premium: boolean | null
          profile: string | null
          quiz_id: string | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_premium?: boolean | null
          profile?: string | null
          quiz_id?: string | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_premium?: boolean | null
          profile?: string | null
          quiz_id?: string | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      condition_operator:
        | "equals"
        | "not-equals"
        | "greater-than"
        | "less-than"
        | "contains"
      question_type: "multiple-choice" | "checkbox" | "open-ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      condition_operator: [
        "equals",
        "not-equals",
        "greater-than",
        "less-than",
        "contains",
      ],
      question_type: ["multiple-choice", "checkbox", "open-ended"],
    },
  },
} as const
