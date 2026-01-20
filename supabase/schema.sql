-- ============================================
-- LABY STOCK - SCHÉMA SIMPLIFIÉ POUR SUPABASE
-- Version: 2.0 (Sans authentification)
-- ============================================

-- Supprimer les tables existantes si nécessaire (ATTENTION: perte de données)
-- DROP TABLE IF EXISTS alertes CASCADE;
-- DROP TABLE IF EXISTS sorties CASCADE;
-- DROP TABLE IF EXISTS entrees CASCADE;
-- DROP TABLE IF EXISTS produits CASCADE;
-- DROP TABLE IF EXISTS types CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS fournisseurs CASCADE;
-- DROP TABLE IF EXISTS parametres CASCADE;

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    couleur VARCHAR(20) DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: types
-- ============================================
CREATE TABLE IF NOT EXISTS types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    categorie_associee VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: fournisseurs
-- ============================================
CREATE TABLE IF NOT EXISTS fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Cameroun',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: produits
-- ============================================
CREATE TABLE IF NOT EXISTS produits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    categorie VARCHAR(255),
    type VARCHAR(255),
    fournisseur VARCHAR(255),
    quantite_totale INTEGER DEFAULT 0,
    quantite_cartons INTEGER DEFAULT 0,
    unites_par_carton INTEGER DEFAULT 1,
    unites_libres INTEGER DEFAULT 0,
    prix_unitaire DECIMAL(15, 2) DEFAULT 0,
    unite VARCHAR(50) DEFAULT 'unité',
    emplacement VARCHAR(255),
    date_reception DATE,
    date_peremption DATE,
    lot VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: entrees
-- ============================================
CREATE TABLE IF NOT EXISTS entrees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
    produit_nom VARCHAR(255) NOT NULL,
    quantite INTEGER NOT NULL,
    prix_unitaire DECIMAL(15, 2),
    fournisseur VARCHAR(255),
    numero_lot VARCHAR(100),
    date_peremption DATE,
    notes TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: sorties
-- ============================================
CREATE TABLE IF NOT EXISTS sorties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
    produit_nom VARCHAR(255) NOT NULL,
    quantite INTEGER NOT NULL,
    motif VARCHAR(255),
    destinataire VARCHAR(255),
    notes TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: alertes
-- ============================================
CREATE TABLE IF NOT EXISTS alertes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
    produit_nom VARCHAR(255),
    titre VARCHAR(255) NOT NULL,
    message TEXT,
    niveau VARCHAR(20) DEFAULT 'info',
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: parametres
-- ============================================
CREATE TABLE IF NOT EXISTS parametres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cle VARCHAR(100) NOT NULL,
    valeur TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_fournisseur ON produits(fournisseur);
CREATE INDEX IF NOT EXISTS idx_entrees_produit_id ON entrees(produit_id);
CREATE INDEX IF NOT EXISTS idx_sorties_produit_id ON sorties(produit_id);
CREATE INDEX IF NOT EXISTS idx_alertes_lu ON alertes(lu);

-- ============================================
-- TRIGGER: Mise à jour automatique updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_types_updated_at ON types;
CREATE TRIGGER update_types_updated_at BEFORE UPDATE ON types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fournisseurs_updated_at ON fournisseurs;
CREATE TRIGGER update_fournisseurs_updated_at BEFORE UPDATE ON fournisseurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produits_updated_at ON produits;
CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY - Permettre accès public
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorties ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;

-- Policies pour accès public (anon)
DROP POLICY IF EXISTS "Allow public access to categories" ON categories;
CREATE POLICY "Allow public access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to types" ON types;
CREATE POLICY "Allow public access to types" ON types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to fournisseurs" ON fournisseurs;
CREATE POLICY "Allow public access to fournisseurs" ON fournisseurs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to produits" ON produits;
CREATE POLICY "Allow public access to produits" ON produits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to entrees" ON entrees;
CREATE POLICY "Allow public access to entrees" ON entrees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to sorties" ON sorties;
CREATE POLICY "Allow public access to sorties" ON sorties FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to alertes" ON alertes;
CREATE POLICY "Allow public access to alertes" ON alertes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to parametres" ON parametres;
CREATE POLICY "Allow public access to parametres" ON parametres FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Paramètres par défaut
-- ============================================
INSERT INTO parametres (cle, valeur) VALUES
    ('langue', 'fr'),
    ('devise', 'FCFA'),
    ('format_date', 'DD/MM/YYYY'),
    ('fuseau_horaire', 'Africa/Douala'),
    ('seuil_stock_faible', '10'),
    ('jours_avant_peremption', '30'),
    ('notifications_email', 'true'),
    ('notifications_stock_faible', 'true'),
    ('notifications_peremption', 'true'),
    ('theme_couleur', 'blue')
ON CONFLICT DO NOTHING;
