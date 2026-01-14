import { Database } from './database'

// Types des tables
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Warehouse = Database['public']['Tables']['warehouses']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type StockLevel = Database['public']['Tables']['stock_levels']['Row']
export type StockMovement = Database['public']['Tables']['stock_movements']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Types Insert
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type WarehouseInsert = Database['public']['Tables']['warehouses']['Insert']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type StockLevelInsert = Database['public']['Tables']['stock_levels']['Insert']
export type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert']
export type AlertInsert = Database['public']['Tables']['alerts']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Types Update
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type WarehouseUpdate = Database['public']['Tables']['warehouses']['Update']
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']
export type StockLevelUpdate = Database['public']['Tables']['stock_levels']['Update']
export type StockMovementUpdate = Database['public']['Tables']['stock_movements']['Update']
export type AlertUpdate = Database['public']['Tables']['alerts']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// Types utilitaires
export type UserRole = 'admin' | 'manager' | 'user'

export type MovementType =
  | 'entry'
  | 'exit'
  | 'transfer'
  | 'adjustment'
  | 'return'
  | 'loss'
  | 'production'

export type AlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired'
  | 'overstock'
  | 'negative_stock'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export type NotificationType = 'alert' | 'info' | 'success' | 'warning' | 'error'

// Types étendus avec relations
export type ProductWithRelations = Product & {
  category?: Category | null
  supplier?: Supplier | null
}

export type StockLevelWithProduct = StockLevel & {
  product: Product
  warehouse: Warehouse
}

export type StockMovementWithRelations = StockMovement & {
  product: Product
  warehouse: Warehouse
  from_warehouse?: Warehouse | null
  to_warehouse?: Warehouse | null
  supplier?: Supplier | null
  created_by_profile: Profile
  validated_by_profile?: Profile | null
}

export type AlertWithRelations = Alert & {
  product?: Product | null
  warehouse?: Warehouse | null
}

// Types pour les formulaires
export type ProductFormData = Omit<ProductInsert, 'id' | 'created_at' | 'updated_at' | 'created_by'>

export type MovementFormData = Omit<
  StockMovementInsert,
  'id' | 'created_at' | 'quantity_before' | 'quantity_after' | 'created_by'
>

// Types pour les filtres
export interface ProductFilter {
  search?: string
  category_id?: string
  supplier_id?: string
  is_active?: boolean
  is_perishable?: boolean
}

export interface StockFilter {
  search?: string
  warehouse_id?: string
  category_id?: string
  low_stock_only?: boolean
}

export interface MovementFilter {
  type?: MovementType
  product_id?: string
  warehouse_id?: string
  from_date?: string
  to_date?: string
}

// Types pour les statistiques
export interface DashboardStats {
  total_products: number
  total_stock_value: number
  low_stock_items: number
  out_of_stock_items: number
  total_movements_today: number
  total_warehouses: number
}

export interface StockByCategory {
  category_name: string
  total_quantity: number
  total_value: number
  product_count: number
}

export interface MovementsByType {
  type: MovementType
  count: number
  total_quantity: number
}

export interface LowStockProduct {
  product: Product
  warehouse: Warehouse
  current_stock: number
  min_stock: number
  reorder_point: number
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
