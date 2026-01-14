-- ============================================
-- FIX RLS POLICIES - CORRECTION RECURSION INFINIE
-- ============================================
-- Copie et colle ce fichier dans Supabase SQL Editor
-- ============================================

-- 1. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DROP POLICY IF EXISTS "Lecture users" ON public.users;
DROP POLICY IF EXISTS "Insertion users" ON public.users;
DROP POLICY IF EXISTS "Modification users" ON public.users;
DROP POLICY IF EXISTS "Lecture categories" ON public.categories;
DROP POLICY IF EXISTS "Lecture types" ON public.types;
DROP POLICY IF EXISTS "Lecture conditionnements" ON public.conditionnements;
DROP POLICY IF EXISTS "Lecture stock" ON public.stock;
DROP POLICY IF EXISTS "Insertion stock" ON public.stock;
DROP POLICY IF EXISTS "Modification stock" ON public.stock;
DROP POLICY IF EXISTS "Suppression stock" ON public.stock;
DROP POLICY IF EXISTS "Lecture entrees" ON public.entrees;
DROP POLICY IF EXISTS "Insertion entrees" ON public.entrees;
DROP POLICY IF EXISTS "Lecture sorties" ON public.sorties;
DROP POLICY IF EXISTS "Insertion sorties" ON public.sorties;
DROP POLICY IF EXISTS "Lecture historique admin" ON public.historique_couts;

-- 2. ACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditionnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_couts ENABLE ROW LEVEL SECURITY;

-- 3. POLITIQUES POUR LA TABLE USERS (SANS RECURSION)
-- Permettre la lecture de son propre profil
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Permettre l'insertion lors du signup
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Permettre la modification de son propre profil
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. POLITIQUES POUR CATEGORIES, TYPES, CONDITIONNEMENTS (LECTURE PUBLIQUE)
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

-- 5. POLITIQUES POUR LE STOCK
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
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete stock"
  ON public.stock FOR DELETE
  TO authenticated
  USING (true);

-- 6. POLITIQUES POUR LES ENTREES
CREATE POLICY "Authenticated can read entrees"
  ON public.entrees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert entrees"
  ON public.entrees FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. POLITIQUES POUR LES SORTIES
CREATE POLICY "Authenticated can read sorties"
  ON public.sorties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert sorties"
  ON public.sorties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. POLITIQUES POUR L'HISTORIQUE DES COUTS (ADMIN SEULEMENT)
-- Pour l'instant, on permet la lecture à tous les utilisateurs authentifiés
-- On filtrera côté frontend selon le rôle
CREATE POLICY "Authenticated can read historique"
  ON public.historique_couts FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FIN DES POLITIQUES RLS
-- ============================================
