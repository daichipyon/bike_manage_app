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
      residents: {
        Row: {
          id: number
          name: string
          room_number: string
          contact_info: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          room_number: string
          contact_info?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          room_number?: string
          contact_info?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      bicycle_slots: {
        Row: {
          id: number
          slot_code: string
          location: string
          resident_id: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slot_code: string
          location: string
          resident_id?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slot_code?: string
          location?: string
          resident_id?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      stickers: {
        Row: {
          id: number
          slot_id: number
          sticker_number: string
          issued_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slot_id: number
          sticker_number: string
          issued_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slot_id?: number
          sticker_number?: string
          issued_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      violation_logs: {
        Row: {
          id: number
          location: string
          memo: string | null
          photo_url: string | null
          reported_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          location: string
          memo?: string | null
          photo_url?: string | null
          reported_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          location?: string
          memo?: string | null
          photo_url?: string | null
          reported_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: number
          resident_id: number
          month: string
          amount: number
          paid_at: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          resident_id: number
          month: string
          amount: number
          paid_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          resident_id?: number
          month?: string
          amount?: number
          paid_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}