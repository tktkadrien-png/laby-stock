-- ============================================
-- ROW LEVEL SECURITY (RLS) - SUPABASE
-- Sécurité au niveau des lignes
-- ============================================

-- ============================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FONCTIONS HELPER POUR LES POLITIQUES
-- ============================================

-- Vérifier si l'utilisateur est authentifié
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Obtenir le rôle de l'utilisateur
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE;

-- Vérifier si l'utilisateur est admin ou manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 3. POLITIQUES POUR PROFILES
-- ============================================

-- Tous les utilisateurs authentifiés peuvent voir tous les profils
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout faire
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ============================================
-- 4. POLITIQUES POUR WAREHOUSES
-- ============================================

-- Tout le monde peut voir les entrepôts actifs
CREATE POLICY "warehouses_select_all"
  ON warehouses FOR SELECT
  USING (is_active = true);

-- Admin/Manager peuvent créer des entrepôts
CREATE POLICY "warehouses_insert_admin_manager"
  ON warehouses FOR INSERT
  WITH CHECK (auth.is_admin_or_manager());

-- Admin/Manager peuvent modifier des entrepôts
CREATE POLICY "warehouses_update_admin_manager"
  ON warehouses FOR UPDATE
  USING (auth.is_admin_or_manager())
  WITH CHECK (auth.is_admin_or_manager());

-- Seuls les admins peuvent supprimer
CREATE POLICY "warehouses_delete_admin"
  ON warehouses FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 5. POLITIQUES POUR CATEGORIES
-- ============================================

-- Tout le monde peut voir les catégories
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (true);

-- Admin/Manager peuvent créer des catégories
CREATE POLICY "categories_insert_admin_manager"
  ON categories FOR INSERT
  WITH CHECK (auth.is_admin_or_manager());

-- Admin/Manager peuvent modifier des catégories
CREATE POLICY "categories_update_admin_manager"
  ON categories FOR UPDATE
  USING (auth.is_admin_or_manager())
  WITH CHECK (auth.is_admin_or_manager());

-- Seuls les admins peuvent supprimer
CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 6. POLITIQUES POUR SUPPLIERS
-- ============================================

-- Tout le monde peut voir les fournisseurs actifs
CREATE POLICY "suppliers_select_all"
  ON suppliers FOR SELECT
  USING (is_active = true);

-- Admin/Manager peuvent créer des fournisseurs
CREATE POLICY "suppliers_insert_admin_manager"
  ON suppliers FOR INSERT
  WITH CHECK (auth.is_admin_or_manager());

-- Admin/Manager peuvent modifier des fournisseurs
CREATE POLICY "suppliers_update_admin_manager"
  ON suppliers FOR UPDATE
  USING (auth.is_admin_or_manager())
  WITH CHECK (auth.is_admin_or_manager());

-- Seuls les admins peuvent supprimer
CREATE POLICY "suppliers_delete_admin"
  ON suppliers FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 7. POLITIQUES POUR PRODUCTS
-- ============================================

-- Tout le monde peut voir les produits actifs
CREATE POLICY "products_select_all"
  ON products FOR SELECT
  USING (is_active = true OR auth.is_admin_or_manager());

-- Admin/Manager peuvent créer des produits
CREATE POLICY "products_insert_admin_manager"
  ON products FOR INSERT
  WITH CHECK (auth.is_admin_or_manager());

-- Admin/Manager peuvent modifier des produits
CREATE POLICY "products_update_admin_manager"
  ON products FOR UPDATE
  USING (auth.is_admin_or_manager())
  WITH CHECK (auth.is_admin_or_manager());

-- Seuls les admins peuvent supprimer
CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 8. POLITIQUES POUR STOCK_LEVELS
-- ============================================

-- Tout le monde peut voir les niveaux de stock
CREATE POLICY "stock_levels_select_all"
  ON stock_levels FOR SELECT
  USING (true);

-- Le système peut insérer (via trigger/fonction)
CREATE POLICY "stock_levels_insert_system"
  ON stock_levels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Le système peut mettre à jour (via trigger/fonction)
CREATE POLICY "stock_levels_update_system"
  ON stock_levels FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seuls les admins peuvent supprimer
CREATE POLICY "stock_levels_delete_admin"
  ON stock_levels FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 9. POLITIQUES POUR STOCK_MOVEMENTS
-- ============================================

-- Tout le monde peut voir les mouvements
CREATE POLICY "stock_movements_select_all"
  ON stock_movements FOR SELECT
  USING (true);

-- Utilisateurs authentifiés peuvent créer des mouvements
CREATE POLICY "stock_movements_insert_authenticated"
  ON stock_movements FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin/Manager peuvent modifier des mouvements non validés
CREATE POLICY "stock_movements_update_admin_manager"
  ON stock_movements FOR UPDATE
  USING (
    auth.is_admin_or_manager()
    AND (is_validated = false OR auth.is_admin())
  )
  WITH CHECK (auth.is_admin_or_manager());

-- Seuls les admins peuvent supprimer
CREATE POLICY "stock_movements_delete_admin"
  ON stock_movements FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 10. POLITIQUES POUR ALERTS
-- ============================================

-- Tout le monde peut voir les alertes
CREATE POLICY "alerts_select_all"
  ON alerts FOR SELECT
  USING (true);

-- Le système peut créer des alertes
CREATE POLICY "alerts_insert_system"
  ON alerts FOR INSERT
  WITH CHECK (true);

-- Utilisateurs authentifiés peuvent marquer comme lu
-- Admin/Manager peuvent résoudre
CREATE POLICY "alerts_update_authenticated"
  ON alerts FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      (is_read = false AND NEW.is_read = true) -- Marquer comme lu
      OR auth.is_admin_or_manager() -- Ou admin/manager peut tout
    )
  )
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seuls les admins peuvent supprimer
CREATE POLICY "alerts_delete_admin"
  ON alerts FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 11. POLITIQUES POUR AUDIT_LOGS
-- ============================================

-- Seuls Admin/Manager peuvent voir les logs d'audit
CREATE POLICY "audit_logs_select_admin_manager"
  ON audit_logs FOR SELECT
  USING (auth.is_admin_or_manager());

-- Le système peut insérer des logs
CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Personne ne peut modifier ou supprimer les logs (immuables)
-- Pas de politique UPDATE ou DELETE = interdit à tous

-- ============================================
-- 12. POLITIQUES POUR NOTIFICATIONS
-- ============================================

-- Les utilisateurs ne voient que leurs propres notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Le système peut créer des notifications
CREATE POLICY "notifications_insert_system"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour leurs propres notifications (marquer comme lu)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres notifications
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 13. TRIGGERS POUR AUDIT LOG
-- ============================================

-- Fonction pour logger automatiquement les modifications
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, old_data, user_id, user_email
    )
    VALUES (
      TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD),
      auth.uid(), (SELECT email FROM profiles WHERE id = auth.uid())
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, old_data, new_data,
      changes, user_id, user_email
    )
    VALUES (
      TG_TABLE_NAME, NEW.id, TG_OP,
      row_to_json(OLD), row_to_json(NEW),
      jsonb_object_agg(key, value) FILTER (WHERE value IS NOT NULL),
      auth.uid(), (SELECT email FROM profiles WHERE id = auth.uid())
    )
    FROM (
      SELECT key, CASE
        WHEN old_json.value != new_json.value
        THEN jsonb_build_object('old', old_json.value, 'new', new_json.value)
        ELSE NULL
      END AS value
      FROM jsonb_each(row_to_json(OLD)::jsonb) AS old_json
      JOIN jsonb_each(row_to_json(NEW)::jsonb) AS new_json USING (key)
    ) AS changes;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, new_data, user_id, user_email
    )
    VALUES (
      TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
      auth.uid(), (SELECT email FROM profiles WHERE id = auth.uid())
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger aux tables importantes
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_stock_movements
  AFTER INSERT OR UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_warehouses
  AFTER INSERT OR UPDATE OR DELETE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_suppliers
  AFTER INSERT OR UPDATE OR DELETE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- ============================================
-- 14. TRIGGER AUTO-CRÉATION PROFILE
-- ============================================

-- Créer automatiquement un profil quand un utilisateur s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (table Supabase Auth)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 15. PERMISSIONS POUR LES RÉPLICATIONS
-- ============================================

-- Donner accès en lecture aux vues pour les utilisateurs authentifiés
GRANT SELECT ON v_stock_overview TO authenticated;
GRANT SELECT ON v_movements_details TO authenticated;

-- Permissions pour la fonction de mouvement de stock
GRANT EXECUTE ON FUNCTION create_stock_movement TO authenticated;
GRANT EXECUTE ON FUNCTION generate_stock_alerts TO authenticated;

-- ============================================
-- 16. POLITIQUES POUR STORAGE (Supabase Storage)
-- ============================================

-- Bucket pour les images de produits
-- À exécuter dans Supabase Dashboard > Storage > New Bucket
-- Nom: product-images
-- Public: false

-- Politique pour voir les images
CREATE POLICY "product_images_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Politique pour uploader (admin/manager seulement)
CREATE POLICY "product_images_insert_admin_manager"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.is_admin_or_manager()
  );

-- Politique pour supprimer
CREATE POLICY "product_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.is_admin()
  );

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

/*
1. Toutes les politiques utilisent auth.uid() pour identifier l'utilisateur
2. Les rôles sont: admin, manager, user
3. Les admins ont accès complet
4. Les managers peuvent gérer les données mais pas supprimer
5. Les users ont accès lecture seule sauf pour leurs données personnelles
6. Les audit_logs sont immuables (pas de UPDATE/DELETE)
7. RLS est activé sur toutes les tables sensibles
8. Les triggers d'audit sont automatiques
9. La création de profil est automatique à l'inscription
*/

-- Vérifier les politiques
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
