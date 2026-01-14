-- ========================================
-- SCHEMA COMPLET STOCKLAB PRO
-- ========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: users (Profils utilisateurs)
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'gestionnaire', -- 'admin' ou 'gestionnaire'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: categories
-- ========================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales
INSERT INTO public.categories (nom) VALUES
  ('Réactif'),
  ('Consommable'),
  ('Équipement')
ON CONFLICT (nom) DO NOTHING;

-- ========================================
-- TABLE: types
-- ========================================
CREATE TABLE IF NOT EXISTS public.types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales
INSERT INTO public.types (nom) VALUES
  ('Chimique'),
  ('Biologique'),
  ('Médical'),
  ('Consommable de laboratoire'),
  ('Équipement scientifique')
ON CONFLICT (nom) DO NOTHING;

-- ========================================
-- TABLE: conditionnements
-- ========================================
CREATE TABLE IF NOT EXISTS public.conditionnements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales
INSERT INTO public.conditionnements (nom) VALUES
  ('Flacon'),
  ('Boîte'),
  ('Carton'),
  ('Tube'),
  ('Sachet'),
  ('Unité')
ON CONFLICT (nom) DO NOTHING;

-- ========================================
-- TABLE: stock (Inventaire principal)
-- ========================================
CREATE TABLE IF NOT EXISTS public.stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  categorie_id UUID REFERENCES public.categories(id),
  type_id UUID REFERENCES public.types(id),
  conditionnement_id UUID REFERENCES public.conditionnements(id),
  fournisseur TEXT NOT NULL,
  numero_lot TEXT NOT NULL,
  date_reception DATE NOT NULL,
  date_peremption DATE NOT NULL,
  quantite_recue INTEGER NOT NULL DEFAULT 0,
  quantite_utilisee INTEGER NOT NULL DEFAULT 0,
  stock_actuel INTEGER NOT NULL DEFAULT 0,
  emplacement TEXT,
  prix_unitaire NUMERIC(10, 2) NOT NULL DEFAULT 0,
  est_en_carton BOOLEAN DEFAULT FALSE,
  unite_par_carton INTEGER,
  cartons_actuels INTEGER DEFAULT 0,
  unites_libres INTEGER DEFAULT 0,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: entrees (Entrées de stock)
-- ========================================
CREATE TABLE IF NOT EXISTS public.entrees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_id UUID REFERENCES public.stock(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10, 2) NOT NULL,
  montant_total NUMERIC(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
  date_entree TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id),
  user_name TEXT NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: sorties (Sorties de stock)
-- ========================================
CREATE TABLE IF NOT EXISTS public.sorties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_id UUID REFERENCES public.stock(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10, 2) NOT NULL,
  montant_total NUMERIC(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
  date_sortie TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id),
  user_name TEXT NOT NULL,
  motif TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: historique_couts (Historique des coûts)
-- ========================================
CREATE TABLE IF NOT EXISTS public.historique_couts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_operation TEXT NOT NULL, -- 'entree' ou 'sortie'
  stock_id UUID REFERENCES public.stock(id) ON DELETE SET NULL,
  produit_nom TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10, 2) NOT NULL,
  montant_total NUMERIC(10, 2) NOT NULL,
  date_operation TIMESTAMP WITH TIME ZONE NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES pour optimisation
-- ========================================
CREATE INDEX IF NOT EXISTS idx_stock_user_id ON public.stock(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_date_peremption ON public.stock(date_peremption);
CREATE INDEX IF NOT EXISTS idx_entrees_stock_id ON public.entrees(stock_id);
CREATE INDEX IF NOT EXISTS idx_entrees_user_id ON public.entrees(user_id);
CREATE INDEX IF NOT EXISTS idx_sorties_stock_id ON public.sorties(stock_id);
CREATE INDEX IF NOT EXISTS idx_sorties_user_id ON public.sorties(user_id);
CREATE INDEX IF NOT EXISTS idx_historique_date ON public.historique_couts(date_operation);

-- ========================================
-- TRIGGERS pour auto-update
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur stock
DROP TRIGGER IF EXISTS update_stock_updated_at ON public.stock;
CREATE TRIGGER update_stock_updated_at
  BEFORE UPDATE ON public.stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger sur users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FONCTION: Calculer stock actuel
-- ========================================
CREATE OR REPLACE FUNCTION calculate_stock_actuel()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stock_actuel = NEW.quantite_recue - NEW.quantite_utilisee;

  -- Si produit en carton
  IF NEW.est_en_carton AND NEW.unite_par_carton > 0 THEN
    NEW.cartons_actuels = FLOOR(NEW.stock_actuel / NEW.unite_par_carton);
    NEW.unites_libres = NEW.stock_actuel % NEW.unite_par_carton;
  ELSE
    NEW.cartons_actuels = 0;
    NEW.unites_libres = NEW.stock_actuel;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_stock_actuel ON public.stock;
CREATE TRIGGER trigger_calculate_stock_actuel
  BEFORE INSERT OR UPDATE ON public.stock
  FOR EACH ROW
  EXECUTE FUNCTION calculate_stock_actuel();

-- ========================================
-- FONCTION: Ajouter à l'historique des coûts
-- ========================================
CREATE OR REPLACE FUNCTION add_to_historique_couts()
RETURNS TRIGGER AS $$
DECLARE
  v_produit_nom TEXT;
  v_type_operation TEXT;
BEGIN
  -- Déterminer le type d'opération
  IF TG_TABLE_NAME = 'entrees' THEN
    v_type_operation = 'entree';
  ELSE
    v_type_operation = 'sortie';
  END IF;

  -- Récupérer le nom du produit
  SELECT nom INTO v_produit_nom FROM public.stock WHERE id = NEW.stock_id;

  -- Insérer dans l'historique
  INSERT INTO public.historique_couts (
    type_operation,
    stock_id,
    produit_nom,
    quantite,
    prix_unitaire,
    montant_total,
    date_operation,
    user_name
  ) VALUES (
    v_type_operation,
    NEW.stock_id,
    v_produit_nom,
    NEW.quantite,
    NEW.prix_unitaire,
    NEW.quantite * NEW.prix_unitaire,
    COALESCE(NEW.date_entree, NEW.date_sortie, NOW()),
    NEW.user_name
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_historique_entrees ON public.entrees;
CREATE TRIGGER trigger_historique_entrees
  AFTER INSERT ON public.entrees
  FOR EACH ROW
  EXECUTE FUNCTION add_to_historique_couts();

DROP TRIGGER IF EXISTS trigger_historique_sorties ON public.sorties;
CREATE TRIGGER trigger_historique_sorties
  AFTER INSERT ON public.sorties
  FOR EACH ROW
  EXECUTE FUNCTION add_to_historique_couts();

-- ========================================
-- DONNÉES DE TEST
-- ========================================

-- Utilisateur admin
INSERT INTO public.users (email, full_name, role) VALUES
  ('labyaounde@gmail.com', 'Administrateur', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Gestionnaire test
INSERT INTO public.users (email, full_name, role) VALUES
  ('gestionnaire@test.com', 'Gestionnaire Test', 'gestionnaire')
ON CONFLICT (email) DO NOTHING;
