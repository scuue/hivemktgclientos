export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TeamRole = 'manager' | 'editor' | 'scripting';

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
          ads_per_month: number | null
          package: string | null
          monthly_reporting_canva_link: string | null
          reminders: string | null
          is_recurring: boolean
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
          ads_per_month?: number | null
          package?: string | null
          monthly_reporting_canva_link?: string | null
          reminders?: string | null
          is_recurring?: boolean
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
          ads_per_month?: number | null
          package?: string | null
          monthly_reporting_canva_link?: string | null
          reminders?: string | null
          is_recurring?: boolean
          recurring_interval?: 'monthly' | 'quarterly' | 'semi-annually' | null
          last_recurring_update?: string | null
          shoot_date?: string | null
          shoot_status?: 'not_booked' | 'booked' | 'completed'
          shoot_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar_url?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          role?: string | null
          created_at?: string
        }
      }
      client_team_assignments: {
        Row: {
          id: string
          client_id: string
          user_id: string
          role: TeamRole
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          role: TeamRole
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          role?: TeamRole
          created_at?: string
        }
      }
      monthly_content_plans: {
        Row: {
          id: string
          client_id: string
          month: string
          posts_planned: number
          ads_planned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          month: string
          posts_planned?: number
          ads_planned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          month?: string
          posts_planned?: number
          ads_planned?: number
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

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type ClientTeamAssignment = Database['public']['Tables']['client_team_assignments']['Row'];
export type ClientTeamAssignmentInsert = Database['public']['Tables']['client_team_assignments']['Insert'];
export type ClientTeamAssignmentUpdate = Database['public']['Tables']['client_team_assignments']['Update'];

export type MonthlyContentPlan = Database['public']['Tables']['monthly_content_plans']['Row'];
export type MonthlyContentPlanInsert = Database['public']['Tables']['monthly_content_plans']['Insert'];
export type MonthlyContentPlanUpdate = Database['public']['Tables']['monthly_content_plans']['Update'];

export interface ClientWithTeam extends Client {
  manager?: User;
  editors: User[];
  scripting: User[];
}
