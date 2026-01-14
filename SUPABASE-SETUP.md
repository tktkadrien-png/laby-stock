# 🚀 Guide de Configuration Supabase - StockLab Pro

## Étape 1: Créer un Projet Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter avec le compte: **tktkadrien@gmail.com**
3. Cliquer sur "New Project"
4. Remplir les informations:
   - **Name**: `stocklab-pro`
   - **Database Password**: Choisir un mot de passe fort (le noter!)
   - **Region**: Choisir la région la plus proche
5. Cliquer sur "Create new project"
6. Attendre que le projet soit créé (~2 minutes)

## Étape 2: Exécuter le Schéma de la Base de Données

1. Dans le projet Supabase, aller dans **SQL Editor** (menu de gauche)
2. Cliquer sur "+ New query"
3. Copier tout le contenu du fichier `supabase-schema-complete.sql`
4. Coller dans l'éditeur SQL
5. Cliquer sur **Run** (ou Ctrl+Enter)
6. Vérifier qu'il n'y a pas d'erreurs

## Étape 3: Exécuter les Politiques RLS

1. Toujours dans **SQL Editor**
2. Cliquer sur "+ New query"
3. Copier tout le contenu du fichier `supabase-rls-complete.sql`
4. Coller dans l'éditeur
5. Cliquer sur **Run**
6. Vérifier qu'il n'y a pas d'erreurs

## Étape 4: Activer l'Authentification par Email

1. Aller dans **Authentication** > **Providers** (menu de gauche)
2. S'assurer que **Email** est activé
3. Dans **Email Auth**, configurer:
   - ✅ Enable email provider
   - ✅ Confirm email (désactiver pour le développement)
4. Sauvegarder

## Étape 5: Configurer l'URL de Redirection

1. Aller dans **Authentication** > **URL Configuration**
2. Ajouter dans **Redirect URLs**:
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```
3. Sauvegarder

## Étape 6: Récupérer les Clés API

1. Aller dans **Settings** > **API** (menu de gauche)
2. Noter les informations suivantes:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Une très longue clé qui commence par `eyJ...`

## Étape 7: Configurer le fichier .env.local

1. Créer le fichier `.env.local` à la racine du projet
2. Ajouter les variables suivantes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

3. Remplacer les valeurs par celles copiées à l'étape 6
4. Sauvegarder le fichier

## Étape 8: Créer l'Utilisateur Admin

L'utilisateur admin sera créé automatiquement lors de la première inscription via l'interface, mais vous pouvez le créer manuellement:

1. Aller dans **Authentication** > **Users**
2. Cliquer sur "Add user"
3. Entrer:
   - **Email**: `labyaounde@gmail.com`
   - **Password**: `Motdepass237`
   - **Auto Confirm User**: ✅ Cocher
4. Cliquer sur "Create user"
5. Aller dans **SQL Editor** et exécuter:

```sql
-- Créer le profil admin
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 'Administrateur', 'admin'
FROM auth.users
WHERE email = 'labyaounde@gmail.com'
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

## Étape 9: Vérification

1. Aller dans **Table Editor** (menu de gauche)
2. Vérifier que les tables suivantes existent:
   - ✅ users
   - ✅ categories
   - ✅ types
   - ✅ conditionnements
   - ✅ stock
   - ✅ entrees
   - ✅ sorties
   - ✅ historique_couts

3. Vérifier les données initiales:
   - Dans `categories`: Réactif, Consommable, Équipement
   - Dans `types`: Chimique, Biologique, Médical, etc.
   - Dans `conditionnements`: Flacon, Boîte, Carton, etc.

## Étape 10: Tester l'Application

1. Redémarrer le serveur Next.js:
   ```bash
   npm run dev
   ```

2. Ouvrir [http://localhost:3000](http://localhost:3000)

3. Créer un compte test (gestionnaire)

4. Se déconnecter et se reconnecter avec `labyaounde@gmail.com` / `Motdepass237` (admin)

## 🎉 C'est Terminé!

Votre application StockLab Pro est maintenant connectée à Supabase et prête à être utilisée!

## 🔒 Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Admin a accès complet (labyaounde@gmail.com)
- ✅ Gestionnaires ont accès limité (pas de dashboard ni d'alertes)
- ✅ Authentification sécurisée avec JWT
- ✅ Mots de passe hashés automatiquement

## 📊 Rôles

### Admin (labyaounde@gmail.com)
- ✅ Dashboard
- ✅ Alertes
- ✅ Inventaire complet
- ✅ Entrées
- ✅ Sorties
- ✅ Historique des coûts
- ✅ Gestion des utilisateurs

### Gestionnaire (autres utilisateurs)
- ❌ Dashboard
- ❌ Alertes
- ✅ Inventaire (lecture seule sauf ajout)
- ✅ Entrées
- ✅ Sorties
- ❌ Historique des coûts
