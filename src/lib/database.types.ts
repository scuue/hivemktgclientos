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
      clients: {
        Row: {
          id: string
          client_name: string
          due_date: string
          notes: string | null
          contract_renewal_date: string | null
          content_due_date: string | null
          posts_per_month: number | null
          package: string | null
          monthly_reporting_canva_link: string | null
          reminders: string | null
          recurring_enabled: boolean
          recurring_interval: 'monthly' | 'quarterly' | 'semi-annually' | null
          last_recurring_update: string | null
          shoot_date: string | null
          shoot_status: 'not_booked' | 'booked' | 'completed'
          shoot_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          due_date: string
          notes?: string | null
          contract_renewal_date?: string | null
          content_due_date?: string | null
          posts_per_month?: number | null
          package?: string | null
          monthly_reporting_canva_link?: string | null
          reminders?: string | null
          recurring_enabled?: boolean
          recurring_interval?: 'monthly' | 'quarterly' | 'semi-annually' | null
          last_recurring_update?: string | null
          shoot_date?: string | null
          shoot_status?: 'not_booked' | 'booked' | 'completed'
          shoot_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          due_date?: string
          notes?: string | null
          contract_renewal_date?: string | null
          content_due_date?: string | null
          posts_per_month?: number | null
          package?: string | null
          monthly_reporting_canva_link?: string | null
          reminders?: string | null
          recurring_enabled?: boolean
          recurring_interval?: 'monthly' | 'quarterly' | 'semi-annually' | null
          last_recurring_update?: string | null
          shoot_date?: string | null
          shoot_status?: 'not_booked' | 'booked' | 'completed'
          shoot_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
