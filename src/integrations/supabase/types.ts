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
      access_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          name: string
          organization: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          organization?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          checked_in_by: string | null
          created_at: string
          event_id: string
          guest_id: string
          id: string
        }
        Insert: {
          checked_in_by?: string | null
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
        }
        Update: {
          checked_in_by?: string | null
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
            referencedColumns: ["id"]
          },
        ]
      }
      drink_tickets: {
        Row: {
          created_at: string
          event_guest_id: string | null
          event_id: string
          guest_id: string | null
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
          redemption_method: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          event_guest_id?: string | null
          event_id: string
          guest_id?: string | null
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          redemption_method?: string | null
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          event_guest_id?: string | null
          event_id?: string
          guest_id?: string | null
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          redemption_method?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "drink_tickets_event_guest_id_fkey"
            columns: ["event_guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drink_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drink_tickets_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drink_tickets_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_guestbook_entries: {
        Row: {
          approved: boolean
          created_at: string
          event_id: string
          guest_name: string
          id: string
          message: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          event_id: string
          guest_name: string
          id?: string
          message: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          event_id?: string
          guest_name?: string
          id?: string
          message?: string
        }
        Relationships: []
      }
      event_guests: {
        Row: {
          created_at: string
          event_id: string
          full_name: string | null
          guest_id: string | null
          id: string
          invited_email: string
          notes: string | null
          phone_number: string | null
          plus_one_allowed: boolean
          plus_one_count: number
          rsvp_message: string | null
          rsvp_responded_at: string | null
          rsvp_status: string
          rsvp_token: string
          tier: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          full_name?: string | null
          guest_id?: string | null
          id?: string
          invited_email: string
          notes?: string | null
          phone_number?: string | null
          plus_one_allowed?: boolean
          plus_one_count?: number
          rsvp_message?: string | null
          rsvp_responded_at?: string | null
          rsvp_status?: string
          rsvp_token?: string
          tier?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          full_name?: string | null
          guest_id?: string | null
          id?: string
          invited_email?: string
          notes?: string | null
          phone_number?: string | null
          plus_one_allowed?: boolean
          plus_one_count?: number
          rsvp_message?: string | null
          rsvp_responded_at?: string | null
          rsvp_status?: string
          rsvp_token?: string
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_guests_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_messages: {
        Row: {
          body: string
          channel: string
          created_at: string
          created_by: string | null
          event_id: string
          id: string
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_photos: {
        Row: {
          approved: boolean
          created_at: string
          event_id: string
          guest_name: string | null
          id: string
          image_url: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          event_id: string
          guest_name?: string | null
          id?: string
          image_url: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          event_id?: string
          guest_name?: string | null
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      event_prompt_responses: {
        Row: {
          created_at: string
          event_id: string
          guest_name: string
          id: string
          prompt_id: string
          prompt_label: string
          response: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_name: string
          id?: string
          prompt_id: string
          prompt_label: string
          response: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_name?: string
          id?: string
          prompt_id?: string
          prompt_label?: string
          response?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          builder_config: Json
          capacity: number | null
          contact_host_email: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          enable_nfc: boolean
          enable_qr: boolean
          ends_at: string | null
          event_page_config: Json
          id: string
          organizer_id: string
          reminder_days: number[] | null
          rsvp_cutoff_at: string | null
          slug: string | null
          starts_at: string
          status: string
          test_mode: boolean
          tier: string
          title: string
          updated_at: string
          venue: string | null
          visibility: string
        }
        Insert: {
          builder_config?: Json
          capacity?: number | null
          contact_host_email?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          enable_nfc?: boolean
          enable_qr?: boolean
          ends_at?: string | null
          event_page_config?: Json
          id?: string
          organizer_id: string
          reminder_days?: number[] | null
          rsvp_cutoff_at?: string | null
          slug?: string | null
          starts_at: string
          status?: string
          test_mode?: boolean
          tier?: string
          title: string
          updated_at?: string
          venue?: string | null
          visibility?: string
        }
        Update: {
          builder_config?: Json
          capacity?: number | null
          contact_host_email?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          enable_nfc?: boolean
          enable_qr?: boolean
          ends_at?: string | null
          event_page_config?: Json
          id?: string
          organizer_id?: string
          reminder_days?: number[] | null
          rsvp_cutoff_at?: string | null
          slug?: string | null
          starts_at?: string
          status?: string
          test_mode?: boolean
          tier?: string
          title?: string
          updated_at?: string
          venue?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_tags: {
        Row: {
          active: boolean
          created_at: string
          event_id: string
          id: string
          payload_id: string
          station_label: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          event_id: string
          id?: string
          payload_id: string
          station_label: string
        }
        Update: {
          active?: boolean
          created_at?: string
          event_id?: string
          id?: string
          payload_id?: string
          station_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      seating_assignments: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string
          id: string
          seating_table_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          seating_table_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          seating_table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_assignments_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_assignments_seating_table_id_fkey"
            columns: ["seating_table_id"]
            isOneToOne: false
            referencedRelation: "seating_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_tables: {
        Row: {
          created_at: string
          event_id: string
          id: string
          label: string
          seat_count: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          label: string
          seat_count?: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          label?: string
          seat_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "seating_tables_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string
          event_id: string
          id: string
          role: string
          staff_email: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          role?: string
          staff_email?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          role?: string
          staff_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ticket_redemptions: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string
          id: string
          method: string
          redeemed_by: string | null
          station_label: string | null
          ticket_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          method: string
          redeemed_by?: string | null
          station_label?: string | null
          ticket_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          method?: string
          redeemed_by?: string | null
          station_label?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_redemptions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_redemptions_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_redemptions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "drink_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_items: {
        Row: {
          created_at: string
          event_id: string
          id: string
          kind: string
          starts_at: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          kind?: string
          starts_at?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          kind?: string
          starts_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_drink_units: {
        Row: {
          created_at: string
          event_id: string
          guest_pass_id: string
          id: string
          metadata: Json
          public_code: string
          redeemed_at: string | null
          redemption_method: string | null
          redemption_station_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_pass_id: string
          id?: string
          metadata?: Json
          public_code?: string
          redeemed_at?: string | null
          redemption_method?: string | null
          redemption_station_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_pass_id?: string
          id?: string
          metadata?: Json
          public_code?: string
          redeemed_at?: string | null
          redemption_method?: string | null
          redemption_station_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tt_drink_units_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tt_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_drink_units_guest_pass_id_fkey"
            columns: ["guest_pass_id"]
            isOneToOne: false
            referencedRelation: "tt_guest_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_events: {
        Row: {
          created_at: string
          id: string
          is_test: boolean
          name: string
          slug: string
          tap_station_mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_test?: boolean
          name: string
          slug: string
          tap_station_mode?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean
          name?: string
          slug?: string
          tap_station_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      tt_guest_passes: {
        Row: {
          created_at: string
          display_name: string
          event_id: string
          guest_email: string | null
          id: string
          manual_code: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          event_id: string
          guest_email?: string | null
          id?: string
          manual_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          event_id?: string
          guest_email?: string | null
          id?: string
          manual_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tt_guest_passes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tt_events"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_intents: {
        Row: {
          created_at: string
          event_id: string
          expires_at: string
          guest_pass_id: string
          id: string
          metadata: Json
          redeemed_at: string | null
          station_id: string | null
          status: string
          tapped_at: string | null
          ticket_unit_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          expires_at: string
          guest_pass_id: string
          id?: string
          metadata?: Json
          redeemed_at?: string | null
          station_id?: string | null
          status?: string
          tapped_at?: string | null
          ticket_unit_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          expires_at?: string
          guest_pass_id?: string
          id?: string
          metadata?: Json
          redeemed_at?: string | null
          station_id?: string | null
          status?: string
          tapped_at?: string | null
          ticket_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tt_intents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tt_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_intents_guest_pass_id_fkey"
            columns: ["guest_pass_id"]
            isOneToOne: false
            referencedRelation: "tt_guest_passes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_intents_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "tt_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_intents_ticket_unit_id_fkey"
            columns: ["ticket_unit_id"]
            isOneToOne: false
            referencedRelation: "tt_drink_units"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_redemptions: {
        Row: {
          device_info: Json
          event_id: string
          guest_pass_id: string
          id: string
          metadata: Json
          method: string
          redeemed_at: string
          redeemed_by: string | null
          result: string
          station_id: string | null
          ticket_unit_id: string | null
        }
        Insert: {
          device_info?: Json
          event_id: string
          guest_pass_id: string
          id?: string
          metadata?: Json
          method: string
          redeemed_at?: string
          redeemed_by?: string | null
          result: string
          station_id?: string | null
          ticket_unit_id?: string | null
        }
        Update: {
          device_info?: Json
          event_id?: string
          guest_pass_id?: string
          id?: string
          metadata?: Json
          method?: string
          redeemed_at?: string
          redeemed_by?: string | null
          result?: string
          station_id?: string | null
          ticket_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tt_redemptions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tt_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_redemptions_guest_pass_id_fkey"
            columns: ["guest_pass_id"]
            isOneToOne: false
            referencedRelation: "tt_guest_passes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_redemptions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "tt_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tt_redemptions_ticket_unit_id_fkey"
            columns: ["ticket_unit_id"]
            isOneToOne: false
            referencedRelation: "tt_drink_units"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_stations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_active: boolean
          name: string
          slug: string
          station_secret_hash: string
          station_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          station_secret_hash: string
          station_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          station_secret_hash?: string
          station_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tt_stations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tt_events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tier_access: {
        Row: {
          assigned_by: string | null
          created_at: string
          email: string | null
          id: string
          max_tier: string
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          max_tier?: string
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          max_tier?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tier_access_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tier_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wrapped_summaries: {
        Row: {
          created_at: string
          custom_note: string | null
          event_id: string
          id: string
          is_published: boolean
          summary: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_note?: string | null
          event_id: string
          id?: string
          is_published?: boolean
          summary?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_note?: string | null
          event_id?: string
          id?: string
          is_published?: boolean
          summary?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wrapped_summaries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _tt_expire_stale: { Args: { _pass_id: string }; Returns: undefined }
      _tt_lock_one_unit: { Args: { _pass_id: string }; Returns: string }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_broadcasts_by_token: { Args: { _token: string }; Returns: Json }
      get_guest_pass_by_token: { Args: { _token: string }; Returns: Json }
      get_rsvp_by_token: { Args: { _token: string }; Returns: Json }
      get_wrapped_by_token: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_ticket: {
        Args: { _method: string; _station_label?: string; _token: string }
        Returns: Json
      }
      submit_rsvp: {
        Args: {
          _full_name?: string
          _message?: string
          _phone_number?: string
          _plus_one_count?: number
          _status: string
          _token: string
        }
        Returns: Json
      }
      tt_add_units: {
        Args: { _count: number; _pass_id: string }
        Returns: Json
      }
      tt_cancel_intent: { Args: { _intent_id: string }; Returns: Json }
      tt_confirm_intent: { Args: { _intent_id: string }; Returns: Json }
      tt_create_intent: { Args: { _pass_id: string }; Returns: Json }
      tt_get_bartender_state: { Args: { _event_slug: string }; Returns: Json }
      tt_get_pass_state: { Args: { _pass_id: string }; Returns: Json }
      tt_redeem_manual: { Args: { _manual_code: string }; Returns: Json }
      tt_redeem_qr: { Args: { _pass_id: string }; Returns: Json }
      tt_reject_intent: { Args: { _intent_id: string }; Returns: Json }
      tt_reset_demo: { Args: never; Returns: Json }
      tt_seed_demo: { Args: never; Returns: Json }
      tt_set_mode: { Args: { _event_id: string; _mode: string }; Returns: Json }
      tt_tap_station: {
        Args: {
          _pass_id: string
          _station_secret: string
          _station_slug: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "guest" | "bartender" | "host_admin" | "organizer" | "admin"
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
      app_role: ["guest", "bartender", "host_admin", "organizer", "admin"],
    },
  },
} as const
