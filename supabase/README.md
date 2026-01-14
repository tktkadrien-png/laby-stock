# Installation du Schéma Supabase

## Étapes d'installation

1. **Accédez au Dashboard Supabase**
   - URL: https://supabase.com/dashboard/project/tktkadrien-png
   - Email: tktkadrien@gmail.com
   - Password: Motdepass237

2. **Ouvrez l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

3. **Exécutez le schéma**
   - Copiez tout le contenu du fichier `schema.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter le script

4. **Vérification**
   - Allez dans "Table Editor" pour voir toutes les tables créées
   - Vérifiez que les tables suivantes existent:
     - `roles`
     - `users`
     - `categories`
     - `types`
     - `fournisseurs`
     - `produits`
     - `entrees`
     - `sorties`
     - `alertes`
     - `parametres`
     - `audit_logs`

## Fonctionnalités du schéma

### Tables principales
- **roles**: Rôles utilisateurs (Admin, Manager, User)
- **users**: Utilisateurs du système
- **categories**: Catégories de produits
- **types**: Types de produits liés aux catégories
- **fournisseurs**: Fournisseurs de produits
- **produits**: Produits en stock
- **entrees**: Entrées de stock
- **sorties**: Sorties de stock
- **alertes**: Alertes système (stock faible, péremption)
- **parametres**: Paramètres utilisateur
- **audit_logs**: Journal d'audit

### Triggers automatiques
- Mise à jour automatique des timestamps (`updated_at`)
- Génération automatique d'alertes de stock faible/rupture
- Génération automatique d'alertes de péremption
- Mise à jour automatique du stock après entrée/sortie

### Sécurité
- Row Level Security (RLS) activé sur toutes les tables
- Policies définies par rôle
- Contraintes d'intégrité sur toutes les données

### Indexes
- Indexes sur toutes les colonnes de recherche fréquentes
- Optimisation des performances des requêtes

## Fonctions utiles

### Vérifier toutes les alertes de péremption
```sql
SELECT check_all_expiration_alerts();
```

Cette fonction peut être exécutée quotidiennement via un CRON job.

## Configuration de l'application

Les variables d'environnement sont déjà configurées dans `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé publique anonyme

## Support

Pour toute question, consultez la documentation Supabase:
- https://supabase.com/docs
