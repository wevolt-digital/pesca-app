// Tipos gerados manualmente para corresponder ao schema do banco.
// Quando o projeto amadurecer, substitua pelo output do `supabase gen types typescript`.

export type SpotType = 'river' | 'lake' | 'ocean' | 'reservoir' | 'fishery'
export type LureType = 'artificial' | 'natural' | 'fly' | 'jig' | 'other'

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          name?: string
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fishing_spots: {
        Row: {
          id: string
          name: string
          lat: number
          lng: number
          city: string
          state: string
          type: SpotType
          rating: number
          total_catches: number
          description: string | null
          added_by: string | null
          photos: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          lat: number
          lng: number
          city: string
          state: string
          type: SpotType
          rating?: number
          total_catches?: number
          description?: string | null
          added_by?: string | null
          photos?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          lat?: number
          lng?: number
          city?: string
          state?: string
          type?: SpotType
          rating?: number
          total_catches?: number
          description?: string | null
          photos?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      fish_species: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      lures: {
        Row: {
          id: string
          name: string
          type: LureType
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: LureType
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          type?: LureType
          description?: string | null
          image_url?: string | null
        }
        Relationships: []
      }
      catches: {
        Row: {
          id: string
          user_id: string
          species_id: string | null
          species_name: string
          weight: number
          length: number | null
          lure_id: string | null
          bait_description: string
          lat: number
          lng: number
          location_name: string
          fishing_spot_id: string | null
          photo_url: string | null
          notes: string | null
          caught_at: string
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          species_id?: string | null
          species_name: string
          weight: number
          length?: number | null
          lure_id?: string | null
          bait_description: string
          lat?: number | null
          lng?: number | null
          location_name: string
          fishing_spot_id?: string | null
          photo_url?: string | null
          notes?: string | null
          caught_at?: string
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          species_id?: string | null
          species_name?: string
          weight?: number
          length?: number | null
          lure_id?: string | null
          bait_description?: string
          lat?: number
          lng?: number
          location_name?: string
          fishing_spot_id?: string | null
          photo_url?: string | null
          notes?: string | null
          caught_at?: string
          likes_count?: number
          comments_count?: number
          updated_at?: string
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
      spot_type: SpotType
      lure_type: LureType
    }
  }
}
