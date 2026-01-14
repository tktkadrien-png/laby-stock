-- ========================================
-- ROW LEVEL SECURITY (RLS) - STOCKLAB PRO
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditionnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_couts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES: users
-- ========================================

-- Tout le monde peut lire les utilisateurs
DROP POLICY IF EXISTS "Lecture publique users" ON public.users;
CREATE POLICY "Lecture publique users"
  ON public.users FOR SELECT
  USING (true);

-- Seulement les admins peuvent créer des utilisateurs
DROP POLICY IF EXISTS "Admin peut créer users" ON public.users;
CREATE POLICY "Admin peut créer users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les utilisateurs peuvent modifier leur propre profil
DROP POLICY IF EXISTS "Users peuvent modifier leur profil" ON public.users;
CREATE POLICY "Users peuvent modifier leur profil"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ========================================
-- POLICIES: categories, types, conditionnements
-- ========================================

-- Lecture publique
DROP POLICY IF EXISTS "Lecture publique categories" ON public.categories;
CREATE POLICY "Lecture publique categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lecture publique types" ON public.types;
CREATE POLICY "Lecture publique types"
  ON public.types FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lecture publique conditionnements" ON public.conditionnements;
CREATE POLICY "Lecture publique conditionnements"
  ON public.conditionnements FOR SELECT
  USING (true);

-- Seulement admin peut modifier
DROP POLICY IF EXISTS "Admin peut modifier categories" ON public.categories;
CREATE POLICY "Admin peut modifier categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin peut modifier types" ON public.types;
CREATE POLICY "Admin peut modifier types"
  ON public.types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin peut modifier conditionnements" ON public.conditionnements;
CREATE POLICY "Admin peut modifier conditionnements"
  ON public.conditionnements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES: stock
-- ========================================

-- Lecture pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Lecture stock authentifiés" ON public.stock;
CREATE POLICY "Lecture stock authentifiés"
  ON public.stock FOR SELECT
  TO authenticated
  USING (true);

-- Insertion pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Insertion stock authentifiés" ON public.stock;
CREATE POLICY "Insertion stock authentifiés"
  ON public.stock FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Mise à jour pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Update stock authentifiés" ON public.stock;
CREATE POLICY "Update stock authentifiés"
  ON public.stock FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Suppression seulement pour admin
DROP POLICY IF EXISTS "Delete stock admin" ON public.stock;
CREATE POLICY "Delete stock admin"
  ON public.stock FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES: entrees
-- ========================================

-- Lecture pour tous authentifiés
DROP POLICY IF EXISTS "Lecture entrees authentifiés" ON public.entrees;
CREATE POLICY "Lecture entrees authentifiés"
  ON public.entrees FOR SELECT
  TO authenticated
  USING (true);

-- Insertion pour tous authentifiés
DROP POLICY IF EXISTS "Insertion entrees authentifiés" ON public.entrees;
CREATE POLICY "Insertion entrees authentifiés"
  ON public.entrees FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin peut tout faire
DROP POLICY IF EXISTS "Admin peut modifier entrees" ON public.entrees;
CREATE POLICY "Admin peut modifier entrees"
  ON public.entrees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES: sorties
-- ========================================

-- Lecture pour tous authentifiés
DROP POLICY IF EXISTS "Lecture sorties authentifiés" ON public.sorties;
CREATE POLICY "Lecture sorties authentifiés"
  ON public.sorties FOR SELECT
  TO authenticated
  USING (true);

-- Insertion pour tous authentifiés
DROP POLICY IF EXISTS "Insertion sorties authentifiés" ON public.sorties;
CREATE POLICY "Insertion sorties authentifiés"
  ON public.sorties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin peut tout faire
DROP POLICY IF EXISTS "Admin peut modifier sorties" ON public.sorties;
CREATE POLICY "Admin peut modifier sorties"
  ON public.sorties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES: historique_couts
-- ========================================

-- Lecture seulement pour admin
DROP POLICY IF EXISTS "Lecture historique admin" ON public.historique_couts;
CREATE POLICY "Lecture historique admin"
  ON public.historique_couts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insertion automatique via triggers
DROP POLICY IF EXISTS "Insertion historique auto" ON public.historique_couts;
CREATE POLICY "Insertion historique auto"
  ON public.historique_couts FOR INSERT
  TO authenticated
  WITH CHECK (true);
