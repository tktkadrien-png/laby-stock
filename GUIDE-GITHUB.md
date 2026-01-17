# Guide de Déploiement sur GitHub

## Étapes pour pousser le projet sur GitHub

### 1. Créer un nouveau dépôt sur GitHub

1. Allez sur [https://github.com](https://github.com)
2. Connectez-vous avec vos identifiants:
   - **Email**: tktkadrien@gmail.com
   - **Mot de passe**: Motdepass237

3. Cliquez sur le bouton **"New"** (ou "+") pour créer un nouveau dépôt

4. Remplissez les informations:
   - **Repository name**: `laby-stock` (ou le nom de votre choix)
   - **Description**: "Système de gestion de stock professionnel avec alertes automatiques, thème dark/light et Supabase"
   - **Visibility**: Public ou Private (selon votre préférence)
   - **⚠️ IMPORTANT**: Ne cochez PAS "Initialize this repository with a README"

5. Cliquez sur **"Create repository"**

### 2. Lier votre projet local au dépôt GitHub

Après avoir créé le dépôt, GitHub vous montrera des commandes. Utilisez celles-ci dans votre terminal:

```bash
cd "c:\Users\FAYA COMPUTER\Videos\Gestion de Stock\stock-management"

# Ajouter le dépôt distant (remplacez YOUR-USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/YOUR-USERNAME/laby-stock.git

# Renommer la branche principale en main (optionnel mais recommandé)
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

**⚠️ Remplacez `YOUR-USERNAME` par votre nom d'utilisateur GitHub réel!**

### 3. Alternative: Utiliser GitHub Desktop

Si vous préférez une interface graphique:

1. Téléchargez et installez [GitHub Desktop](https://desktop.github.com/)
2. Connectez-vous avec vos identifiants GitHub
3. Cliquez sur "Add" > "Add existing repository"
4. Sélectionnez le dossier: `c:\Users\FAYA COMPUTER\Videos\Gestion de Stock\stock-management`
5. Cliquez sur "Publish repository"
6. Choisissez le nom et la visibilité
7. Cliquez sur "Publish repository"

## Informations Git

### Commit actuel
- **Branch**: main
- **Commit**: Initial commit avec toutes les fonctionnalités
- **Fichiers**: 67 fichiers, 18 103 lignes

### Configuration Git actuelle
```bash
user.name = Adrien TK
user.email = tktkadrien@gmail.com
```

## Fonctionnalités incluses dans le commit

✅ Système d'alertes automatiques avec popup et son
✅ Icône cloche avec badge de notifications
✅ Thème clair/sombre avec toggle
✅ Intégration Supabase avec schéma complet
✅ Gestion des catégories, types, produits, entrées, sorties
✅ Paramètres dynamiques temps réel
✅ UI/UX moderne et responsive

## Fichiers sensibles

⚠️ **IMPORTANT**: Le fichier `.env.local` contient vos clés Supabase et n'est PAS inclus dans le dépôt Git grâce au `.gitignore`. C'est normal et recommandé pour la sécurité.

### Variables d'environnement à configurer sur le serveur de production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://emodjmdfmwbhycyfhipp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2RqbWRmbXdiaHljeWZoaXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDE5NjcsImV4cCI6MjA4MzQ3Nzk2N30.O4k-IDbn8AgFv2bbYW9frg-YWWliSUmlgILGhyj5390
```

## Commandes Git utiles

### Voir le statut du dépôt
```bash
git status
```

### Voir l'historique des commits
```bash
git log
```

### Ajouter des modifications futures
```bash
git add .
git commit -m "Description de vos modifications"
git push
```

### Créer une nouvelle branche
```bash
git checkout -b nom-de-la-branche
```

## Support

Pour toute question sur Git ou GitHub:
- [Documentation Git](https://git-scm.com/doc)
- [Documentation GitHub](https://docs.github.com)
- [GitHub Desktop Guide](https://docs.github.com/en/desktop)

## Prochaines étapes recommandées

1. ✅ Pousser le code sur GitHub
2. Configurer Vercel ou Netlify pour le déploiement automatique
3. Ajouter un README.md détaillé avec des captures d'écran
4. Configurer les GitHub Actions pour CI/CD
5. Ajouter des badges au README (build status, license, etc.)
