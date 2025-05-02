
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
          email: string
          name?: string
          credits?: number
          email_verified?: boolean
          subscription?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          avatar_url?: string
          subscription_end_date?: string
          subscription_status?: string
          refreshed_at?: string
        }
        Insert: {
          id?: string
          email: string
          name?: string
          credits?: number
          email_verified?: boolean
          subscription?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          avatar_url?: string
          subscription_end_date?: string
          subscription_status?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          credits?: number
          email_verified?: boolean
          subscription?: string
          updated_at?: string
          last_login?: string
          avatar_url?: string
          subscription_end_date?: string
          subscription_status?: string
          refreshed_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: number
          name: string
          description?: string
          price: number
          period: string
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          price: number
          period: string
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          period?: string
          features?: string[] | null
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_id: number
          start_date: string
          end_date: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: number
          start_date: string
          end_date: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: number
          start_date?: string
          end_date?: string
          status?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: string
          description: string
          payment_at: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status: string
          description: string
          payment_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: string
          description?: string
          payment_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
        }
      }
      system_configurations: {
        Row: {
          id: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          status: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          status: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          status?: 'draft' | 'published' | 'archived'
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name?: string
          last_name?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string
          last_name?: string
          bio?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          bio?: string
          updated_at?: string
        }
      }
      verification_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          type: 'email_verification' | 'password_reset'
          expires_at: string
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          type: 'email_verification' | 'password_reset'
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          type?: 'email_verification' | 'password_reset'
          expires_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      article_status: 'draft' | 'published' | 'archived'
    }
    CompositeTypes: {}
  }
}
