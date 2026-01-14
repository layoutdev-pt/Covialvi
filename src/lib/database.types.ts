export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin' | 'super_admin';
export type PropertyStatus = 'draft' | 'published' | 'archived';
export type BusinessType = 'sale' | 'rent' | 'transfer';
export type PropertyNature = 'apartment' | 'house' | 'land' | 'commercial' | 'warehouse' | 'office' | 'garage' | 'shop';
export type ConstructionStatus = 'new' | 'used' | 'under_construction' | 'to_recover' | 'renovated';
export type LeadStatus = 'new' | 'contacted' | 'visit_scheduled' | 'negotiation' | 'closed' | 'lost';
export type VisitStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          email_verified: boolean;
          marketing_consent: boolean;
          alerts_consent: boolean;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          email_verified?: boolean;
          marketing_consent?: boolean;
          alerts_consent?: boolean;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          email_verified?: boolean;
          marketing_consent?: boolean;
          alerts_consent?: boolean;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          reference: string;
          title: string;
          slug: string;
          description: string | null;
          business_type: BusinessType;
          nature: PropertyNature;
          status: PropertyStatus;
          price: number | null;
          price_on_request: boolean;
          district: string | null;
          municipality: string | null;
          parish: string | null;
          address: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          gross_area: number | null;
          useful_area: number | null;
          land_area: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          floors: number | null;
          typology: string | null;
          construction_status: ConstructionStatus | null;
          construction_year: number | null;
          energy_certificate: string | null;
          equipment: string[] | null;
          extras: string[] | null;
          surrounding_area: string[] | null;
          video_url: string | null;
          virtual_tour_url: string | null;
          brochure_url: string | null;
          featured: boolean;
          views_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          title: string;
          slug: string;
          description?: string | null;
          business_type: BusinessType;
          nature: PropertyNature;
          status?: PropertyStatus;
          price?: number | null;
          price_on_request?: boolean;
          district?: string | null;
          municipality?: string | null;
          parish?: string | null;
          address?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          gross_area?: number | null;
          useful_area?: number | null;
          land_area?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          floors?: number | null;
          typology?: string | null;
          construction_status?: ConstructionStatus | null;
          construction_year?: number | null;
          energy_certificate?: string | null;
          equipment?: string[] | null;
          extras?: string[] | null;
          surrounding_area?: string[] | null;
          video_url?: string | null;
          virtual_tour_url?: string | null;
          brochure_url?: string | null;
          featured?: boolean;
          views_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          business_type?: BusinessType;
          nature?: PropertyNature;
          status?: PropertyStatus;
          price?: number | null;
          price_on_request?: boolean;
          district?: string | null;
          municipality?: string | null;
          parish?: string | null;
          address?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          gross_area?: number | null;
          useful_area?: number | null;
          land_area?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          floors?: number | null;
          typology?: string | null;
          construction_status?: ConstructionStatus | null;
          construction_year?: number | null;
          energy_certificate?: string | null;
          equipment?: string[] | null;
          extras?: string[] | null;
          surrounding_area?: string[] | null;
          video_url?: string | null;
          virtual_tour_url?: string | null;
          brochure_url?: string | null;
          featured?: boolean;
          views_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          alt: string | null;
          order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          alt?: string | null;
          order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          alt?: string | null;
          order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
      };
      property_floor_plans: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          title: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          title?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          title?: string | null;
          order?: number;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
      visits: {
        Row: {
          id: string;
          property_id: string;
          user_id: string | null;
          lead_id: string | null;
          scheduled_at: string;
          status: VisitStatus;
          notes: string | null;
          internal_notes: string | null;
          assigned_to: string | null;
          confirmed_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id?: string | null;
          lead_id?: string | null;
          scheduled_at: string;
          status?: VisitStatus;
          notes?: string | null;
          internal_notes?: string | null;
          assigned_to?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string | null;
          lead_id?: string | null;
          scheduled_at?: string;
          status?: VisitStatus;
          notes?: string | null;
          internal_notes?: string | null;
          assigned_to?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          source: string | null;
          status: LeadStatus;
          assigned_to: string | null;
          property_id: string | null;
          message: string | null;
          tags: string[] | null;
          custom_fields: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          source?: string | null;
          status?: LeadStatus;
          assigned_to?: string | null;
          property_id?: string | null;
          message?: string | null;
          tags?: string[] | null;
          custom_fields?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          source?: string | null;
          status?: LeadStatus;
          assigned_to?: string | null;
          property_id?: string | null;
          message?: string | null;
          tags?: string[] | null;
          custom_fields?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crm_notes: {
        Row: {
          id: string;
          lead_id: string;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string | null;
          user_agent: string | null;
          last_active_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ip_address?: string | null;
          user_agent?: string | null;
          last_active_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          last_active_at?: string;
          created_at?: string;
        };
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filters: Json;
          alerts_enabled: boolean;
          last_alert_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          filters: Json;
          alerts_enabled?: boolean;
          last_alert_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          filters?: Json;
          alerts_enabled?: boolean;
          last_alert_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          link: string | null;
          read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          title: string;
          message?: string | null;
          link?: string | null;
          read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          link?: string | null;
          read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      google_tokens: {
        Row: {
          id: string;
          user_id: string;
          access_token: string;
          refresh_token: string | null;
          scope: string | null;
          token_type: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          access_token: string;
          refresh_token?: string | null;
          scope?: string | null;
          token_type?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          scope?: string | null;
          token_type?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      property_status: PropertyStatus;
      business_type: BusinessType;
      property_nature: PropertyNature;
      construction_status: ConstructionStatus;
      lead_status: LeadStatus;
      visit_status: VisitStatus;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
