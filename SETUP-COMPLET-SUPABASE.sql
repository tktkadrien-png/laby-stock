-- ============================================
-- SETUP COMPLET SUPABASE - EXECUTE TOUT EN UNE FOIS
-- ============================================
-- Copie TOUT ce fichier et colle dans Supabase SQL Editor
-- Puis clique RUN
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- SUPPRIMER LES TABLES SI ELLES EXISTENT
-- ========================================
DROP TABLE IF EXISTS public.historique_couts CASCADE;
DROP TABLE IF EXISTS public.sorties CASCADE;
DROP TABLE IF EXISTS public.entrees CASCADE;
DROP TABLE IF EXISTS public.stock CASCADE;
DROP TABLE IF EXISTS public.conditionnements CASCADE;
DROP TABLE IF EXISTS public.types CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ========================================
-- TABLE: users (Profils utilisateurs)
-- ========================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'gestionnaire',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: categories
-- ========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.categories (nom) VALUES
  ('Réactif'),
  ('Consommable'),
  ('Équipement');

-- ========================================
-- TABLE: types
-- ========================================
CREATE TABLE public.types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.types (nom) VALUES
  ('Chimique'),
  ('Biologique'),
  ('Médical'),
  ('Consommable de laboratoire'),
  ('Équipement scientifique');

-- ========================================
-- TABLE: conditionnements
-- ========================================
CREATE TABLE public.conditionnements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.conditionnements (nom) VALUES
  ('Flacon'),
  ('Boîte'),
  ('Carton'),
  ('Tube'),
  ('Sachet'),
  ('Unité');

-- ========================================
-- TABLE: stock
-- ========================================
CREATE TABLE public.stock (
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
-- TABLE: entrees
-- ========================================
CREATE TABLE public.entrees (
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
-- TABLE: sorties
-- ========================================
CREATE TABLE public.sorties (
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
-- TABLE: historique_couts
-- ========================================
CREATE TABLE public.historique_couts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_operation TEXT NOT NULL,
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
-- INDEXES
-- ========================================
CREATE INDEX idx_stock_user_id ON public.stock(user_id);
CREATE INDEX idx_stock_date_peremption ON public.stock(date_peremption);
CREATE INDEX idx_entrees_stock_id ON public.entrees(stock_id);
CREATE INDEX idx_sorties_stock_id ON public.sorties(stock_id);
CREATE INDEX idx_historique_date ON public.historique_couts(date_operation);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_updated_at
  BEFORE UPDATE ON public.stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

CREATE TRIGGER trigger_calculate_stock_actuel
  BEFORE INSERT OR UPDATE ON public.stock
  FOR EACH ROW
  EXECUTE FUNCTION calculate_stock_actuel();

-- ========================================
-- RLS POLICIES
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditionnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_couts ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policies pour categories, types, conditionnements
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read types"
  ON public.types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read conditionnements"
  ON public.conditionnements FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour stock
CREATE POLICY "Authenticated can read stock"
  ON public.stock FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert stock"
  ON public.stock FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update stock"
  ON public.stock FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete stock"
  ON public.stock FOR DELETE
  TO authenticated
  USING (true);

-- Policies pour entrees
CREATE POLICY "Authenticated can read entrees"
  ON public.entrees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert entrees"
  ON public.entrees FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies pour sorties
CREATE POLICY "Authenticated can read sorties"
  ON public.sorties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert sorties"
  ON public.sorties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies pour historique
CREATE POLICY "Authenticated can read historique"
  ON public.historique_couts FOR SELECT
  TO authenticated
  USING (true);

-- ========================================
-- CREER L'ADMIN
-- ========================================

-- Supprimer l'admin s'il existe
DELETE FROM auth.users WHERE email = 'labyaounde@gmail.com';

-- Creer l'admin dans auth.users
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'labyaounde@gmail.com',
    crypt('Motdepass237', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Creer le profil dans public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new_user_id, 'labyaounde@gmail.com', 'Administrateur', 'admin');
END $$;

-- ========================================
-- VERIFICATION
-- ========================================
SELECT
  u.email,
  u.full_name,
  u.role,
  'SUCCESS - Admin created!' as status
FROM public.users u
WHERE u.email = 'labyaounde@gmail.com';
