-- ============================================
-- LABY STOCK - SCHÉMA DE BASE DE DONNÉES
-- Version: 1.0
-- Date: 2026-01-14
-- ============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: roles
-- Description: Rôles et permissions des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT roles_nom_check CHECK (char_length(nom) >= 3)
);

-- Index pour recherche rapide
CREATE INDEX idx_roles_nom ON roles(nom);

-- Données par défaut
INSERT INTO roles (nom, description, permissions) VALUES
('Admin', 'Administrateur système avec tous les droits', '["all"]'::jsonb),
('Manager', 'Gestionnaire avec droits de validation', '["read", "write", "validate"]'::jsonb),
('User', 'Utilisateur standard avec droits limités', '["read", "write"]'::jsonb)
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- TABLE: users
-- Description: Utilisateurs du système
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    telephone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_active ON users(active);

-- ============================================
-- TABLE: categories
-- Description: Catégories de produits
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    couleur VARCHAR(7) DEFAULT '#1E40AF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT categories_nom_check CHECK (char_length(nom) >= 2),
    CONSTRAINT categories_code_check CHECK (char_length(code) >= 2 AND code = UPPER(code)),
    CONSTRAINT categories_couleur_check CHECK (couleur ~* '^#[0-9A-F]{6}$')
);

-- Index
CREATE INDEX idx_categories_nom ON categories(nom);
CREATE INDEX idx_categories_code ON categories(code);

-- ============================================
-- TABLE: types
-- Description: Types de produits liés aux catégories
-- ============================================
CREATE TABLE IF NOT EXISTS types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    categorie_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT types_nom_categorie_unique UNIQUE(nom, categorie_id),
    CONSTRAINT types_code_check CHECK (char_length(code) >= 2 AND code = UPPER(code))
);

-- Index
CREATE INDEX idx_types_categorie_id ON types(categorie_id);
CREATE INDEX idx_types_nom ON types(nom);

-- ============================================
-- TABLE: fournisseurs
-- Description: Fournisseurs de produits
-- ============================================
CREATE TABLE IF NOT EXISTS fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(20) NOT NULL,
    adresse TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL,
    pays VARCHAR(100) DEFAULT 'Cameroun',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fournisseurs_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index
CREATE INDEX idx_fournisseurs_nom ON fournisseurs(nom);
CREATE INDEX idx_fournisseurs_ville ON fournisseurs(ville);

-- ============================================
-- TABLE: produits
-- Description: Produits en stock
-- ============================================
CREATE TABLE IF NOT EXISTS produits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    categorie_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type_id UUID NOT NULL REFERENCES types(id) ON DELETE RESTRICT,
    description TEXT,
    prix_unitaire DECIMAL(15, 2) NOT NULL DEFAULT 0,
    quantite_totale INTEGER NOT NULL DEFAULT 0,
    quantite_cartons INTEGER NOT NULL DEFAULT 0,
    pieces_par_carton INTEGER NOT NULL DEFAULT 1,
    unite VARCHAR(50) DEFAULT 'Unité',
    seuil_minimum INTEGER NOT NULL DEFAULT 10,
    date_peremption DATE,
    lot VARCHAR(100),
    emplacement VARCHAR(100) DEFAULT 'Magasin Principal',
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT produits_prix_check CHECK (prix_unitaire >= 0),
    CONSTRAINT produits_quantite_check CHECK (quantite_totale >= 0),
    CONSTRAINT produits_cartons_check CHECK (quantite_cartons >= 0),
    CONSTRAINT produits_pieces_check CHECK (pieces_par_carton > 0),
    CONSTRAINT produits_seuil_check CHECK (seuil_minimum >= 0)
);

-- Index pour améliorer les performances
CREATE INDEX idx_produits_nom ON produits(nom);
CREATE INDEX idx_produits_code ON produits(code);
CREATE INDEX idx_produits_categorie_id ON produits(categorie_id);
CREATE INDEX idx_produits_type_id ON produits(type_id);
CREATE INDEX idx_produits_fournisseur_id ON produits(fournisseur_id);
CREATE INDEX idx_produits_date_peremption ON produits(date_peremption);
CREATE INDEX idx_produits_quantite_totale ON produits(quantite_totale);

-- ============================================
-- TABLE: entrees
-- Description: Entrées de stock
-- ============================================
CREATE TABLE IF NOT EXISTS entrees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
    quantite INTEGER NOT NULL,
    cartons INTEGER NOT NULL DEFAULT 0,
    prix_unitaire DECIMAL(15, 2) NOT NULL,
    valeur_totale DECIMAL(15, 2) NOT NULL,
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
    date_entree DATE NOT NULL DEFAULT CURRENT_DATE,
    lot VARCHAR(100),
    date_peremption DATE,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT entrees_quantite_check CHECK (quantite > 0),
    CONSTRAINT entrees_cartons_check CHECK (cartons >= 0),
    CONSTRAINT entrees_prix_check CHECK (prix_unitaire >= 0),
    CONSTRAINT entrees_valeur_check CHECK (valeur_totale >= 0)
);

-- Index
CREATE INDEX idx_entrees_produit_id ON entrees(produit_id);
CREATE INDEX idx_entrees_fournisseur_id ON entrees(fournisseur_id);
CREATE INDEX idx_entrees_user_id ON entrees(user_id);
CREATE INDEX idx_entrees_date_entree ON entrees(date_entree);

-- ============================================
-- TABLE: sorties
-- Description: Sorties de stock
-- ============================================
CREATE TABLE IF NOT EXISTS sorties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
    quantite INTEGER NOT NULL,
    cartons INTEGER NOT NULL DEFAULT 0,
    valeur_unitaire DECIMAL(15, 2) NOT NULL,
    valeur_totale DECIMAL(15, 2) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    date_sortie DATE NOT NULL DEFAULT CURRENT_DATE,
    motif VARCHAR(255) NOT NULL,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT sorties_quantite_check CHECK (quantite > 0),
    CONSTRAINT sorties_cartons_check CHECK (cartons >= 0),
    CONSTRAINT sorties_valeur_check CHECK (valeur_unitaire >= 0),
    CONSTRAINT sorties_valeur_totale_check CHECK (valeur_totale >= 0)
);

-- Index
CREATE INDEX idx_sorties_produit_id ON sorties(produit_id);
CREATE INDEX idx_sorties_user_id ON sorties(user_id);
CREATE INDEX idx_sorties_date_sortie ON sorties(date_sortie);
CREATE INDEX idx_sorties_validated_by ON sorties(validated_by);

-- ============================================
-- TABLE: alertes
-- Description: Alertes système (stock faible, péremption, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS alertes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('stock_faible', 'rupture', 'peremption', 'perime')),
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    niveau VARCHAR(10) NOT NULL DEFAULT 'info' CHECK (niveau IN ('info', 'warning', 'danger')),
    lu BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_alertes_produit_id ON alertes(produit_id);
CREATE INDEX idx_alertes_type ON alertes(type);
CREATE INDEX idx_alertes_niveau ON alertes(niveau);
CREATE INDEX idx_alertes_lu ON alertes(lu);
CREATE INDEX idx_alertes_created_at ON alertes(created_at DESC);

-- ============================================
-- TABLE: parametres
-- Description: Paramètres utilisateur
-- ============================================
CREATE TABLE IF NOT EXISTS parametres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    langue VARCHAR(10) DEFAULT 'fr',
    devise VARCHAR(10) DEFAULT 'FCFA',
    format_date VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    fuseau_horaire VARCHAR(50) DEFAULT 'Africa/Douala',
    notifications_email BOOLEAN DEFAULT true,
    notifications_stock_faible BOOLEAN DEFAULT true,
    notifications_peremption BOOLEAN DEFAULT true,
    seuil_stock_faible INTEGER DEFAULT 10,
    jours_avant_peremption INTEGER DEFAULT 30,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    son_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_parametres_user_id ON parametres(user_id);

-- ============================================
-- TABLE: audit_logs
-- Description: Journal d'audit pour traçabilité
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- TRIGGERS: Mise à jour automatique des timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_types_updated_at BEFORE UPDATE ON types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fournisseurs_updated_at BEFORE UPDATE ON fournisseurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parametres_updated_at BEFORE UPDATE ON parametres
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS: Génération automatique d'alertes
-- ============================================

-- Fonction pour créer des alertes de stock faible
CREATE OR REPLACE FUNCTION check_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Supprimer les anciennes alertes pour ce produit
    DELETE FROM alertes
    WHERE produit_id = NEW.id
    AND type IN ('stock_faible', 'rupture');

    -- Rupture de stock
    IF NEW.quantite_totale = 0 THEN
        INSERT INTO alertes (type, produit_id, titre, message, niveau)
        VALUES (
            'rupture',
            NEW.id,
            'Rupture de stock',
            'Le produit "' || NEW.nom || '" est en rupture de stock',
            'danger'
        );
    -- Stock faible
    ELSIF NEW.quantite_totale <= NEW.seuil_minimum AND NEW.quantite_totale > 0 THEN
        INSERT INTO alertes (type, produit_id, titre, message, niveau)
        VALUES (
            'stock_faible',
            NEW.id,
            'Stock faible',
            'Le produit "' || NEW.nom || '" a un stock faible (' || NEW.quantite_totale || ' unités restantes)',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_stock_alerts
AFTER INSERT OR UPDATE OF quantite_totale, seuil_minimum ON produits
FOR EACH ROW
EXECUTE FUNCTION check_stock_alerts();

-- Fonction pour créer des alertes de péremption
CREATE OR REPLACE FUNCTION check_expiration_alerts()
RETURNS TRIGGER AS $$
DECLARE
    jours_restants INTEGER;
    seuil_jours INTEGER := 30;
BEGIN
    -- Récupérer le seuil depuis les paramètres (par défaut 30 jours)
    SELECT COALESCE(MIN(jours_avant_peremption), 30) INTO seuil_jours FROM parametres;

    -- Supprimer les anciennes alertes de péremption pour ce produit
    DELETE FROM alertes
    WHERE produit_id = NEW.id
    AND type IN ('peremption', 'perime');

    IF NEW.date_peremption IS NOT NULL THEN
        jours_restants := NEW.date_peremption - CURRENT_DATE;

        -- Produit périmé
        IF jours_restants < 0 THEN
            INSERT INTO alertes (type, produit_id, titre, message, niveau)
            VALUES (
                'perime',
                NEW.id,
                'Produit périmé',
                'Le produit "' || NEW.nom || '" est périmé depuis ' || ABS(jours_restants) || ' jours',
                'danger'
            );
        -- Proche de la péremption
        ELSIF jours_restants <= seuil_jours THEN
            INSERT INTO alertes (type, produit_id, titre, message, niveau)
            VALUES (
                'peremption',
                NEW.id,
                'Péremption proche',
                'Le produit "' || NEW.nom || '" expire dans ' || jours_restants || ' jours',
                'warning'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_expiration_alerts
AFTER INSERT OR UPDATE OF date_peremption ON produits
FOR EACH ROW
EXECUTE FUNCTION check_expiration_alerts();

-- ============================================
-- TRIGGERS: Mise à jour automatique du stock
-- ============================================

-- Fonction pour mettre à jour le stock après une entrée
CREATE OR REPLACE FUNCTION update_stock_after_entree()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE produits
    SET
        quantite_totale = quantite_totale + NEW.quantite,
        quantite_cartons = quantite_cartons + NEW.cartons,
        prix_unitaire = NEW.prix_unitaire,
        date_peremption = COALESCE(NEW.date_peremption, date_peremption),
        lot = COALESCE(NEW.lot, lot),
        updated_at = NOW()
    WHERE id = NEW.produit_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_after_entree
AFTER INSERT ON entrees
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_entree();

-- Fonction pour mettre à jour le stock après une sortie
CREATE OR REPLACE FUNCTION update_stock_after_sortie()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE produits
    SET
        quantite_totale = quantite_totale - NEW.quantite,
        quantite_cartons = quantite_cartons - NEW.cartons,
        updated_at = NOW()
    WHERE id = NEW.produit_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_after_sortie
AFTER INSERT ON sorties
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_sortie();

-- ============================================
-- FONCTION: Vérification quotidienne des alertes de péremption
-- ============================================

CREATE OR REPLACE FUNCTION check_all_expiration_alerts()
RETURNS void AS $$
DECLARE
    produit RECORD;
    jours_restants INTEGER;
    seuil_jours INTEGER := 30;
BEGIN
    -- Récupérer le seuil depuis les paramètres
    SELECT COALESCE(MIN(jours_avant_peremption), 30) INTO seuil_jours FROM parametres;

    -- Vérifier tous les produits avec date de péremption
    FOR produit IN SELECT * FROM produits WHERE date_peremption IS NOT NULL LOOP
        jours_restants := produit.date_peremption - CURRENT_DATE;

        -- Supprimer les anciennes alertes
        DELETE FROM alertes
        WHERE produit_id = produit.id
        AND type IN ('peremption', 'perime');

        -- Produit périmé
        IF jours_restants < 0 THEN
            INSERT INTO alertes (type, produit_id, titre, message, niveau)
            VALUES (
                'perime',
                produit.id,
                'Produit périmé',
                'Le produit "' || produit.nom || '" est périmé depuis ' || ABS(jours_restants) || ' jours',
                'danger'
            );
        -- Proche de la péremption
        ELSIF jours_restants <= seuil_jours THEN
            INSERT INTO alertes (type, produit_id, titre, message, niveau)
            VALUES (
                'peremption',
                produit.id,
                'Péremption proche',
                'Le produit "' || produit.nom || '" expire dans ' || jours_restants || ' jours',
                'warning'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorties ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour les utilisateurs authentifiés
CREATE POLICY "Users can view all data" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view roles" ON roles FOR SELECT USING (true);

CREATE POLICY "Users can view categories" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage categories" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.nom IN ('Admin', 'Manager')
    )
);

CREATE POLICY "Users can view types" ON types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage types" ON types FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.nom IN ('Admin', 'Manager')
    )
);

CREATE POLICY "Users can view fournisseurs" ON fournisseurs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage fournisseurs" ON fournisseurs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.nom IN ('Admin', 'Manager')
    )
);

CREATE POLICY "Users can view produits" ON produits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage produits" ON produits FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view entrees" ON entrees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create entrees" ON entrees FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view sorties" ON sorties FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create sorties" ON sorties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Managers can validate sorties" ON sorties FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.nom IN ('Admin', 'Manager')
    )
);

CREATE POLICY "Users can view alertes" ON alertes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update alertes" ON alertes FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own parametres" ON parametres FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own parametres" ON parametres FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- FIN DU SCHÉMA
-- ============================================
