# 🚀 GUIDE D'INSTALLATION COMPLET - StockPro

Ce guide vous accompagne étape par étape pour installer et configurer votre système de gestion de stock.

---

## ✅ ÉTAPE 1 : Récupérer les clés API Supabase

### 1.1 Se connecter à Supabase
1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Se connecter avec : **tktkadrien@gmail.com**
3. Sélectionner le projet : **tktkadrien-png**

### 1.2 Récupérer les clés API
1. Cliquer sur l'icône **Settings** (engrenage) dans la sidebar
2. Cliquer sur **API**
3. Vous verrez :
   - **Project URL** : `https://tktkadrien-png.supabase.co`
   - **anon/public key** : Une longue clé commençant par `eyJ...`

4. **COPIEZ** la clé `anon/public` (clic sur l'icône copier)

### 1.3 Mettre à jour le fichier `.env.local`
1. Ouvrir le fichier `.env.local` dans `stock-management/`
2. Remplacer `YOUR_ANON_KEY_HERE` par votre vraie clé
3. Sauvegarder le fichier

Le fichier doit ressembler à :
```env
NEXT_PUBLIC_SUPABASE_URL=https://tktkadrien-png.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...votre-vraie-clé-ici...
NEXT_PUBLIC_APP_NAME=StockPro
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## ✅ ÉTAPE 2 : Exécuter les migrations SQL dans Supabase

### 2.1 Ouvrir l'éditeur SQL
1. Dans Supabase Dashboard, cliquer sur **SQL Editor** dans la sidebar
2. Cliquer sur **+ New query**

### 2.2 Exécuter le schéma principal
1. Ouvrir le fichier `supabase-schema.sql`
2. **TOUT SÉLECTIONNER** (Ctrl+A) et **COPIER** (Ctrl+C)
3. **COLLER** dans l'éditeur SQL de Supabase
4. Cliquer sur **RUN** (ou F5)
5. ✅ Vous devriez voir : "Success. No rows returned"

### 2.3 Exécuter les politiques RLS
1. Créer une **nouvelle query**
2. Ouvrir le fichier `supabase-rls.sql`
3. **TOUT SÉLECTIONNER** et **COPIER**
4. **COLLER** dans l'éditeur SQL
5. Cliquer sur **RUN**
6. ✅ Vous devriez voir : "Success. No rows returned"

### 2.4 Vérifier que tout est OK
1. Cliquer sur **Table Editor** dans la sidebar
2. Vous devriez voir toutes ces tables :
   - ✅ profiles
   - ✅ products
   - ✅ categories
   - ✅ warehouses
   - ✅ suppliers
   - ✅ stock_levels
   - ✅ stock_movements
   - ✅ alerts
   - ✅ audit_logs
   - ✅ notifications

---

## ✅ ÉTAPE 3 : Installer les dépendances Node.js

### 3.1 Ouvrir le terminal
- Dans VSCode : `Ctrl + ù` (ou `View > Terminal`)
- Ou utiliser PowerShell/CMD

### 3.2 Aller dans le dossier du projet
```bash
cd "c:\Users\FAYA COMPUTER\Videos\Gestion de Stock\stock-management"
```

### 3.3 Option A : Utiliser le script automatique (RECOMMANDÉ)
```bash
.\install-dependencies.bat
```

Ce script va installer automatiquement tout ce dont vous avez besoin !

### 3.4 Option B : Installation manuelle
Si le script ne fonctionne pas, installez manuellement :

```bash
# Dépendances Supabase
npm install @supabase/supabase-js @supabase/ssr

# State management
npm install zustand @tanstack/react-query @tanstack/react-query-devtools

# Formulaires et validation
npm install react-hook-form @hookform/resolvers zod

# UI et utilitaires
npm install lucide-react recharts date-fns
npm install class-variance-authority clsx tailwind-merge

# Composants Radix UI (pour Shadcn)
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-label @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-popover
npm install @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-alert-dialog
```

⏱️ **Temps d'installation** : 5-10 minutes selon votre connexion

---

## ✅ ÉTAPE 4 : Créer un bucket Storage pour les images (OPTIONNEL)

### 4.1 Créer le bucket
1. Dans Supabase Dashboard, cliquer sur **Storage**
2. Cliquer sur **Create a new bucket**
3. Nom du bucket : `product-images`
4. **Public bucket** : ❌ NON (laisser décoché pour la sécurité)
5. Cliquer sur **Create bucket**

### 4.2 Configurer les politiques Storage
1. Cliquer sur le bucket `product-images`
2. Aller dans **Policies**
3. Les politiques sont déjà configurées dans `supabase-rls.sql` ✅

---

## ✅ ÉTAPE 5 : Lancer l'application

### 5.1 Démarrer le serveur de développement
```bash
npm run dev
```

### 5.2 Ouvrir dans le navigateur
- Ouvrir [http://localhost:3000](http://localhost:3000)
- Vous devriez voir la page d'accueil Next.js

---

## ✅ ÉTAPE 6 : Créer votre premier utilisateur

### 6.1 Aller sur la page d'inscription
- Ouvrir [http://localhost:3000/register](http://localhost:3000/register)
- **OU** : Créer manuellement dans Supabase

### 6.2 Créer un admin via Supabase Dashboard
1. Dans Supabase, aller sur **Authentication**
2. Cliquer sur **Add user** > **Create new user**
3. Remplir :
   - Email : `admin@stockpro.com`
   - Password : `Admin123!`
   - **Auto Confirm User** : ✅ OUI
4. Cliquer sur **Create user**

### 6.3 Mettre à jour le rôle en admin
1. Aller sur **Table Editor** > **profiles**
2. Trouver votre utilisateur (créé automatiquement par le trigger)
3. Modifier le champ `role` : `admin`
4. Sauvegarder

---

## ✅ ÉTAPE 7 : Insérer des données de test (OPTIONNEL)

### 7.1 Créer un entrepôt de test
Dans SQL Editor :
```sql
INSERT INTO warehouses (name, code, city, country)
VALUES ('Entrepôt Paris', 'WH-PARIS', 'Paris', 'France');
```

### 7.2 Créer des catégories de test
```sql
INSERT INTO categories (name, description, color) VALUES
('Électronique', 'Produits électroniques', '#3b82f6'),
('Alimentaire', 'Produits alimentaires', '#10b981'),
('Fournitures', 'Fournitures de bureau', '#f59e0b'),
('Médical', 'Matériel médical', '#ef4444');
```

### 7.3 Créer un fournisseur de test
```sql
INSERT INTO suppliers (name, code, email, phone, city, country)
VALUES
('TechSupply', 'SUP-TECH', 'contact@techsupply.fr', '0123456789', 'Lyon', 'France');
```

### 7.4 Créer des produits de test
```sql
INSERT INTO products (sku, name, description, unit, min_stock, unit_cost, unit_price, category_id)
SELECT
  'SKU-' || generate_series,
  'Produit Test ' || generate_series,
  'Description du produit ' || generate_series,
  'unit',
  10,
  9.99,
  19.99,
  (SELECT id FROM categories LIMIT 1)
FROM generate_series(1, 20);
```

---

## 🎯 PROCHAINES ÉTAPES

Maintenant que tout est installé, vous pouvez :

1. **Développer l'interface** :
   - Page de login
   - Dashboard
   - Gestion des produits
   - Gestion du stock

2. **Personnaliser** :
   - Modifier le thème dans `app/globals.css`
   - Ajouter votre logo
   - Personnaliser les composants

3. **Tester** :
   - Créer des produits
   - Enregistrer des mouvements de stock
   - Consulter les statistiques

---

## 🐛 DÉPANNAGE

### Erreur : "Invalid API key"
✅ Vérifier que la clé dans `.env.local` est correcte
✅ Redémarrer le serveur : `Ctrl+C` puis `npm run dev`

### Erreur : "relation does not exist"
✅ Vérifier que les migrations SQL ont été exécutées dans Supabase
✅ Vérifier qu'il n'y a pas d'erreurs dans SQL Editor

### Erreur : "npm install" échoue
✅ Vérifier que Node.js est bien installé : `node --version`
✅ Supprimer `node_modules` et `package-lock.json` puis réessayer

### Erreur : Port 3000 déjà utilisé
✅ Changer le port : `npm run dev -- -p 3001`

### Les changements ne s'appliquent pas
✅ Redémarrer le serveur de développement
✅ Vider le cache du navigateur : `Ctrl+Shift+R`

---

## 📞 BESOIN D'AIDE ?

- 📖 Documentation Next.js : [https://nextjs.org/docs](https://nextjs.org/docs)
- 📖 Documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)
- 💬 Discord Supabase : [https://discord.supabase.com](https://discord.supabase.com)

---

## ✅ CHECKLIST FINALE

Avant de commencer le développement, vérifiez que :

- [ ] Le fichier `.env.local` contient les bonnes clés
- [ ] Les migrations SQL ont été exécutées sans erreur
- [ ] Toutes les tables apparaissent dans Table Editor
- [ ] Les dépendances npm sont installées
- [ ] Le serveur démarre sans erreur (`npm run dev`)
- [ ] La page [http://localhost:3000](http://localhost:3000) s'affiche
- [ ] Un utilisateur admin a été créé
- [ ] Des données de test ont été insérées (optionnel)

---

**🎉 Félicitations ! Votre environnement est prêt !**

Vous pouvez maintenant commencer à développer votre application de gestion de stock moderne.

---

**Créé avec ❤️ pour une installation simple et rapide**
