/**
 * Supabase database types (extend as you add tables).
 * Generate with: npx supabase gen types typescript --project-id YOUR_REF > types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          avatar: string | null
          currency_preference: string
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          avatar?: string | null
          currency_preference?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          avatar?: string | null
          currency_preference?: string
          created_at?: string
        }
      }
      // Add other table types as needed
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
