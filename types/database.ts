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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'user'
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'manager' | 'user'
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'user'
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          city: string | null
          country: string | null
          phone: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          city?: string | null
          country?: string | null
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          city?: string | null
          country?: string | null
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          color: string
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          code: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          country: string | null
          contact_person: string | null
          website: string | null
          notes: string | null
          rating: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          contact_person?: string | null
          website?: string | null
          notes?: string | null
          rating?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          contact_person?: string | null
          website?: string | null
          notes?: string | null
          rating?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category_id: string | null
          supplier_id: string | null
          unit: string
          min_stock: number
          max_stock: number | null
          reorder_point: number
          unit_cost: number
          unit_price: number
          tax_rate: number
          barcode: string | null
          internal_code: string | null
          image_url: string | null
          images: Json
          is_active: boolean
          is_perishable: boolean
          is_trackable: boolean
          custom_fields: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category_id?: string | null
          supplier_id?: string | null
          unit?: string
          min_stock?: number
          max_stock?: number | null
          reorder_point?: number
          unit_cost?: number
          unit_price?: number
          tax_rate?: number
          barcode?: string | null
          internal_code?: string | null
          image_url?: string | null
          images?: Json
          is_active?: boolean
          is_perishable?: boolean
          is_trackable?: boolean
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category_id?: string | null
          supplier_id?: string | null
          unit?: string
          min_stock?: number
          max_stock?: number | null
          reorder_point?: number
          unit_cost?: number
          unit_price?: number
          tax_rate?: number
          barcode?: string | null
          internal_code?: string | null
          image_url?: string | null
          images?: Json
          is_active?: boolean
          is_perishable?: boolean
          is_trackable?: boolean
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      stock_levels: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          quantity: number
          reserved_quantity: number
          available_quantity: number
          total_cost: number
          average_cost: number
          last_counted_at: string | null
          last_movement_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          quantity?: number
          reserved_quantity?: number
          total_cost?: number
          average_cost?: number
          last_counted_at?: string | null
          last_movement_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          quantity?: number
          reserved_quantity?: number
          total_cost?: number
          average_cost?: number
          last_counted_at?: string | null
          last_movement_at?: string
          updated_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'return' | 'loss' | 'production'
          quantity: number
          quantity_before: number
          quantity_after: number
          unit_cost: number | null
          total_cost: number | null
          from_warehouse_id: string | null
          to_warehouse_id: string | null
          reference: string | null
          batch_number: string | null
          lot_number: string | null
          serial_number: string | null
          expiry_date: string | null
          manufacturing_date: string | null
          supplier_id: string | null
          order_reference: string | null
          reason: string | null
          notes: string | null
          attachments: Json
          custom_fields: Json
          created_by: string
          validated_by: string | null
          validated_at: string | null
          is_validated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'return' | 'loss' | 'production'
          quantity: number
          quantity_before: number
          quantity_after: number
          unit_cost?: number | null
          total_cost?: number | null
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          reference?: string | null
          batch_number?: string | null
          lot_number?: string | null
          serial_number?: string | null
          expiry_date?: string | null
          manufacturing_date?: string | null
          supplier_id?: string | null
          order_reference?: string | null
          reason?: string | null
          notes?: string | null
          attachments?: Json
          custom_fields?: Json
          created_by: string
          validated_by?: string | null
          validated_at?: string | null
          is_validated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          type?: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'return' | 'loss' | 'production'
          quantity?: number
          quantity_before?: number
          quantity_after?: number
          unit_cost?: number | null
          total_cost?: number | null
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          reference?: string | null
          batch_number?: string | null
          lot_number?: string | null
          serial_number?: string | null
          expiry_date?: string | null
          manufacturing_date?: string | null
          supplier_id?: string | null
          order_reference?: string | null
          reason?: string | null
          notes?: string | null
          attachments?: Json
          custom_fields?: Json
          created_by?: string
          validated_by?: string | null
          validated_at?: string | null
          is_validated?: boolean
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          product_id: string | null
          warehouse_id: string | null
          type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'overstock' | 'negative_stock'
          severity: 'info' | 'warning' | 'critical'
          title: string
          message: string
          is_read: boolean
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resolution_note: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'overstock' | 'negative_stock'
          severity?: 'info' | 'warning' | 'critical'
          title: string
          message: string
          is_read?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_note?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          type?: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'overstock' | 'negative_stock'
          severity?: 'info' | 'warning' | 'critical'
          title?: string
          message?: string
          is_read?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_note?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'alert' | 'info' | 'success' | 'warning' | 'error'
          title: string
          message: string
          icon: string | null
          action_url: string | null
          action_label: string | null
          metadata: Json
          is_read: boolean
          read_at: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'alert' | 'info' | 'success' | 'warning' | 'error'
          title: string
          message: string
          icon?: string | null
          action_url?: string | null
          action_label?: string | null
          metadata?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'alert' | 'info' | 'success' | 'warning' | 'error'
          title?: string
          message?: string
          icon?: string | null
          action_url?: string | null
          action_label?: string | null
          metadata?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
