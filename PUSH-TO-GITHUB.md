# Guide Simple : Pousser sur GitHub

## Méthode Simple (Recommandée)

### Étape 1 : Créer le dépôt sur GitHub

1. Allez sur [https://github.com/new](https://github.com/new)
2. Connectez-vous :
   - Email : `tktkadrien@gmail.com`
   - Mot de passe : `Motdepass237`
3. Remplissez :
   - **Repository name** : `laby-stock`
   - **Description** : `Système de gestion de stock professionnel`
   - **Cochez Private** (recommandé) ou Public
   - ⚠️ **NE COCHEZ RIEN D'AUTRE** (pas de README, pas de .gitignore)
4. Cliquez sur **"Create repository"**

### Étape 2 : Copiez l'URL du dépôt

Après avoir créé le dépôt, GitHub vous montrera une page. Copiez l'URL qui ressemble à :
```
https://github.com/VOTRE-USERNAME/laby-stock.git
```

### Étape 3 : Ouvrez un terminal et exécutez ces commandes

**IMPORTANT : Remplacez `VOTRE-URL-GITHUB` par l'URL que vous avez copiée à l'étape 2**

```bash
cd "c:\Users\FAYA COMPUTER\Videos\Gestion de Stock\stock-management"

# Ajouter le dépôt distant
git remote add origin VOTRE-URL-GITHUB

# Exemple :
# git remote add origin https://github.com/tktkadrien/laby-stock.git

# Renommer la branche en main
git branch -M main

# Pousser le code
git push -u origin main
```

### Étape 4 : Entrez vos identifiants GitHub

Quand Git vous demande :
- **Username** : Votre nom d'utilisateur GitHub
- **Password** : Utilisez un **Personal Access Token** (pas votre mot de passe)

#### Comment créer un Personal Access Token :

1. Allez sur [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Donnez un nom : `LABY-STOCK-TOKEN`
4. Cochez **"repo"** (toutes les cases sous repo)
5. Cliquez sur **"Generate token"**
6. **COPIEZ LE TOKEN** (vous ne le verrez qu'une fois!)
7. Utilisez ce token comme mot de passe dans Git

---

## Alternative : Utiliser GitHub Desktop (Plus Facile)

### 1. Télécharger GitHub Desktop
Téléchargez sur [https://desktop.github.com/](https://desktop.github.com/)

### 2. Installer et se connecter
- Installez l'application
- Connectez-vous avec vos identifiants GitHub

### 3. Ajouter le projet
1. Cliquez sur **"File"** > **"Add local repository"**
2. Naviguez vers : `c:\Users\FAYA COMPUTER\Videos\Gestion de Stock\stock-management`
3. Cliquez sur **"Add repository"**

### 4. Publier sur GitHub
1. Cliquez sur **"Publish repository"**
2. Donnez un nom : `laby-stock`
3. Ajoutez une description
4. Choisissez Private ou Public
5. Cliquez sur **"Publish repository"**

✅ **C'est fait !** Votre code est maintenant sur GitHub !

---

## Vérifier que ça a marché

1. Allez sur [https://github.com/VOTRE-USERNAME/laby-stock](https://github.com)
2. Vous devriez voir tous vos fichiers
3. Vous devriez voir le commit "Initial commit: LABY STOCK..."

---

## Commandes Git pour plus tard

### Ajouter de nouveaux changements
```bash
cd "c:\Users\FAYA COMPUTER\Videos\Gestion de Stock\stock-management"

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit
git commit -m "Description de vos modifications"

# Pousser sur GitHub
git push
```

### Voir l'état du dépôt
```bash
git status
```

### Voir l'historique
```bash
git log --oneline
```

---

## En cas de problème

### Problème : "remote origin already exists"
```bash
git remote remove origin
git remote add origin VOTRE-URL-GITHUB
git push -u origin main
```

### Problème : "Authentication failed"
- Utilisez un **Personal Access Token** comme mot de passe
- Voir la section "Comment créer un Personal Access Token" ci-dessus

### Problème : "error: src refspec main does not exist"
```bash
git branch -M main
git push -u origin main
```

---

## Contact Support

Si vous avez toujours des problèmes :
- Documentation GitHub : [https://docs.github.com](https://docs.github.com)
- Support GitHub : [https://support.github.com](https://support.github.com)
