-- ============================================
-- SCHÉMA BASE DE DONNÉES - GESTION DE STOCK
-- Platform: Supabase (PostgreSQL)
-- ============================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABLE: profiles (utilisateurs)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')) DEFAULT 'user',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: warehouses (dépôts/magasins)
-- ============================================
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  phone TEXT,
  manager_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: categories (catégories de produits)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: suppliers (fournisseurs)
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  contact_person TEXT,
  website TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers USING gin(to_tsvector('french', name));

-- ============================================
-- TABLE: products (produits)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Unités et mesures
  unit TEXT NOT NULL DEFAULT 'unit' CHECK (unit IN ('unit', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'box', 'pack')),

  -- Stock management
  min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
  max_stock INTEGER CHECK (max_stock IS NULL OR max_stock >= min_stock),
  reorder_point INTEGER DEFAULT 0 CHECK (reorder_point >= 0),

  -- Pricing
  unit_cost DECIMAL(10,2) DEFAULT 0 CHECK (unit_cost >= 0),
  unit_price DECIMAL(10,2) DEFAULT 0 CHECK (unit_price >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0),

  -- Identification
  barcode TEXT UNIQUE,
  internal_code TEXT,

  -- Media
  image_url TEXT,
  images JSONB DEFAULT '[]',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_perishable BOOLEAN DEFAULT false,
  is_trackable BOOLEAN DEFAULT true,

  -- Champs personnalisés (flexibilité multi-secteur)
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('french', name));
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- ============================================
-- TABLE: stock_levels (niveaux de stock)
-- ============================================
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,

  -- Quantities
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,

  -- Valuation
  total_cost DECIMAL(12,2) DEFAULT 0,
  average_cost DECIMAL(10,2) DEFAULT 0,

  -- Dates
  last_counted_at TIMESTAMPTZ,
  last_movement_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, warehouse_id)
);

CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_stock_product ON stock_levels(product_id);
CREATE INDEX idx_stock_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_stock_low ON stock_levels(product_id, warehouse_id) WHERE available_quantity <= 10;

-- ============================================
-- TABLE: stock_movements (mouvements de stock)
-- ============================================
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,

  -- Type de mouvement
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit', 'transfer', 'adjustment', 'return', 'loss', 'production')),

  -- Quantités
  quantity INTEGER NOT NULL CHECK (quantity != 0),
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,

  -- Coûts
  unit_cost DECIMAL(10,2) CHECK (unit_cost >= 0),
  total_cost DECIMAL(12,2),

  -- Pour les transferts
  from_warehouse_id UUID REFERENCES warehouses(id),
  to_warehouse_id UUID REFERENCES warehouses(id),

  -- Traçabilité
  reference TEXT,
  batch_number TEXT,
  lot_number TEXT,
  serial_number TEXT,
  expiry_date DATE,
  manufacturing_date DATE,

  -- Relations externes
  supplier_id UUID REFERENCES suppliers(id),
  order_reference TEXT,

  -- Documentation
  reason TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]',

  -- Champs personnalisés
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES profiles(id),
  validated_by UUID REFERENCES profiles(id),
  validated_at TIMESTAMPTZ,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_movements_type ON stock_movements(type);
CREATE INDEX idx_movements_date ON stock_movements(created_at DESC);
CREATE INDEX idx_movements_batch ON stock_movements(batch_number) WHERE batch_number IS NOT NULL;
CREATE INDEX idx_movements_expiry ON stock_movements(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_movements_reference ON stock_movements(reference) WHERE reference IS NOT NULL;

-- ============================================
-- TABLE: alerts (alertes de stock)
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,

  -- Type et sévérité
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock', 'negative_stock')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',

  -- Message
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- État
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_note TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_product ON alerts(product_id);
CREATE INDEX idx_alerts_warehouse ON alerts(warehouse_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_unread ON alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- ============================================
-- TABLE: audit_logs (journaux d'audit)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Informations de la modification
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),

  -- Données
  old_data JSONB,
  new_data JSONB,
  changes JSONB,

  -- Contexte utilisateur
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  user_role TEXT,

  -- Contexte technique
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitionnement par mois pour performance (optionnel mais recommandé)
-- CREATE TABLE audit_logs_y2026m01 PARTITION OF audit_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_record ON audit_logs(record_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================
-- TABLE: notifications (notifications temps réel)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Destinataire
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contenu
  type TEXT NOT NULL CHECK (type IN ('alert', 'info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,

  -- Actions
  action_url TEXT,
  action_label TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- État
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Stock complet avec infos produits
CREATE OR REPLACE VIEW v_stock_overview AS
SELECT
  sl.id,
  sl.product_id,
  p.sku,
  p.name AS product_name,
  p.barcode,
  p.unit,
  p.image_url,
  sl.warehouse_id,
  w.name AS warehouse_name,
  w.code AS warehouse_code,
  sl.quantity,
  sl.reserved_quantity,
  sl.available_quantity,
  sl.average_cost,
  sl.total_cost,
  p.min_stock,
  p.reorder_point,
  p.is_active,
  c.name AS category_name,
  s.name AS supplier_name,
  sl.last_movement_at,
  sl.last_counted_at,
  CASE
    WHEN sl.available_quantity <= 0 THEN 'out_of_stock'
    WHEN sl.available_quantity <= p.min_stock THEN 'low_stock'
    WHEN p.max_stock IS NOT NULL AND sl.quantity >= p.max_stock THEN 'overstock'
    ELSE 'normal'
  END AS stock_status
FROM stock_levels sl
JOIN products p ON sl.product_id = p.id
JOIN warehouses w ON sl.warehouse_id = w.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.is_active = true AND w.is_active = true;

-- Vue: Mouvements avec détails
CREATE OR REPLACE VIEW v_movements_details AS
SELECT
  sm.id,
  sm.type,
  sm.quantity,
  sm.unit_cost,
  sm.total_cost,
  sm.reference,
  sm.batch_number,
  sm.expiry_date,
  sm.reason,
  sm.notes,
  sm.created_at,
  sm.is_validated,
  sm.validated_at,
  p.sku,
  p.name AS product_name,
  p.unit,
  w.name AS warehouse_name,
  w.code AS warehouse_code,
  creator.full_name AS created_by_name,
  validator.full_name AS validated_by_name,
  s.name AS supplier_name,
  wf.name AS from_warehouse_name,
  wt.name AS to_warehouse_name
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
JOIN warehouses w ON sm.warehouse_id = w.id
JOIN profiles creator ON sm.created_by = creator.id
LEFT JOIN profiles validator ON sm.validated_by = validator.id
LEFT JOIN suppliers s ON sm.supplier_id = s.id
LEFT JOIN warehouses wf ON sm.from_warehouse_id = wf.id
LEFT JOIN warehouses wt ON sm.to_warehouse_id = wt.id
ORDER BY sm.created_at DESC;

-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Fonction: Créer un mouvement de stock et mettre à jour le niveau
CREATE OR REPLACE FUNCTION create_stock_movement(
  p_product_id UUID,
  p_warehouse_id UUID,
  p_type TEXT,
  p_quantity INTEGER,
  p_unit_cost DECIMAL DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_batch_number TEXT DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL,
  p_supplier_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL,
  p_custom_fields JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_movement_id UUID;
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
  v_stock_level_id UUID;
BEGIN
  -- Récupérer le niveau de stock actuel
  SELECT id, quantity INTO v_stock_level_id, v_current_quantity
  FROM stock_levels
  WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;

  -- Si pas de niveau de stock, en créer un
  IF v_stock_level_id IS NULL THEN
    v_current_quantity := 0;
    INSERT INTO stock_levels (product_id, warehouse_id, quantity)
    VALUES (p_product_id, p_warehouse_id, 0)
    RETURNING id INTO v_stock_level_id;
  END IF;

  -- Calculer la nouvelle quantité
  v_new_quantity := v_current_quantity + p_quantity;

  -- Vérifier que la quantité ne devient pas négative
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Required: %',
      v_current_quantity, ABS(p_quantity);
  END IF;

  -- Créer le mouvement
  INSERT INTO stock_movements (
    product_id, warehouse_id, type, quantity,
    quantity_before, quantity_after,
    unit_cost, total_cost, reference, batch_number,
    expiry_date, supplier_id, reason, notes,
    created_by, custom_fields
  )
  VALUES (
    p_product_id, p_warehouse_id, p_type, p_quantity,
    v_current_quantity, v_new_quantity,
    p_unit_cost, p_unit_cost * ABS(p_quantity), p_reference, p_batch_number,
    p_expiry_date, p_supplier_id, p_reason, p_notes,
    p_created_by, p_custom_fields
  )
  RETURNING id INTO v_movement_id;

  -- Mettre à jour le niveau de stock
  UPDATE stock_levels
  SET
    quantity = v_new_quantity,
    last_movement_at = NOW(),
    average_cost = CASE
      WHEN p_unit_cost IS NOT NULL AND p_quantity > 0
      THEN ((average_cost * quantity) + (p_unit_cost * p_quantity)) / (quantity + p_quantity)
      ELSE average_cost
    END,
    total_cost = CASE
      WHEN p_unit_cost IS NOT NULL AND p_quantity > 0
      THEN total_cost + (p_unit_cost * p_quantity)
      ELSE total_cost
    END
  WHERE id = v_stock_level_id;

  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Générer des alertes automatiques
CREATE OR REPLACE FUNCTION generate_stock_alerts()
RETURNS void AS $$
BEGIN
  -- Nettoyer les anciennes alertes résolues (> 30 jours)
  DELETE FROM alerts
  WHERE is_resolved = true AND resolved_at < NOW() - INTERVAL '30 days';

  -- Alertes de stock faible
  INSERT INTO alerts (product_id, warehouse_id, type, severity, title, message)
  SELECT DISTINCT
    sl.product_id,
    sl.warehouse_id,
    'low_stock',
    'warning',
    'Stock faible: ' || p.name,
    'Le produit ' || p.name || ' (SKU: ' || p.sku || ') a un stock de ' ||
    sl.available_quantity || ' ' || p.unit || ' dans ' || w.name ||
    '. Seuil minimum: ' || p.min_stock || ' ' || p.unit
  FROM stock_levels sl
  JOIN products p ON sl.product_id = p.id
  JOIN warehouses w ON sl.warehouse_id = w.id
  WHERE sl.available_quantity > 0
    AND sl.available_quantity <= p.min_stock
    AND p.is_active = true
    AND w.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM alerts a
      WHERE a.product_id = sl.product_id
        AND a.warehouse_id = sl.warehouse_id
        AND a.type = 'low_stock'
        AND a.is_resolved = false
        AND a.created_at > NOW() - INTERVAL '24 hours'
    );

  -- Alertes de rupture de stock
  INSERT INTO alerts (product_id, warehouse_id, type, severity, title, message)
  SELECT DISTINCT
    sl.product_id,
    sl.warehouse_id,
    'out_of_stock',
    'critical',
    'Rupture de stock: ' || p.name,
    'Le produit ' || p.name || ' (SKU: ' || p.sku || ') est en rupture de stock dans ' || w.name
  FROM stock_levels sl
  JOIN products p ON sl.product_id = p.id
  JOIN warehouses w ON sl.warehouse_id = w.id
  WHERE sl.available_quantity <= 0
    AND p.is_active = true
    AND w.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM alerts a
      WHERE a.product_id = sl.product_id
        AND a.warehouse_id = sl.warehouse_id
        AND a.type = 'out_of_stock'
        AND a.is_resolved = false
        AND a.created_at > NOW() - INTERVAL '24 hours'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNÉES DE TEST (optionnel)
-- ============================================

-- Insérer un entrepôt par défaut
INSERT INTO warehouses (name, code, city, country)
VALUES ('Entrepôt Principal', 'WH-001', 'Paris', 'France');

-- Insérer des catégories par défaut
INSERT INTO categories (name, description, color) VALUES
('Électronique', 'Produits électroniques', '#3b82f6'),
('Alimentaire', 'Produits alimentaires', '#10b981'),
('Fournitures', 'Fournitures de bureau', '#f59e0b'),
('Médical', 'Matériel médical', '#ef4444');

COMMENT ON TABLE products IS 'Table des produits avec support multi-secteur via custom_fields';
COMMENT ON TABLE stock_movements IS 'Historique complet des mouvements de stock';
COMMENT ON TABLE stock_levels IS 'Niveaux de stock actuels par produit et entrepôt';
COMMENT ON TABLE alerts IS 'Système d''alertes automatiques';
