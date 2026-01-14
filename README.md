# 📦 StockPro - Système de Gestion de Stock Moderne

Application web complète de gestion de stock avec Next.js 15 + Supabase

## 🚀 Installation Rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer Supabase
1. Mettre à jour `.env.local` avec votre clé API Supabase
2. Exécuter `supabase-schema.sql` dans Supabase Dashboard
3. Exécuter `supabase-rls.sql` dans Supabase Dashboard

### 3. Lancer l'application
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[GUIDE-INSTALLATION.md](GUIDE-INSTALLATION.md)** - Guide complet d'installation
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - Architecture technique
- **[../README-COMPLET.md](../README-COMPLET.md)** - Documentation complète
- **[../PROCHAINES-ETAPES.md](../PROCHAINES-ETAPES.md)** - Prochaines étapes

## 🛠️ Stack Technique

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **UI**: Tailwind CSS + Shadcn/ui
- **State**: Zustand + React Query
- **Charts**: Recharts

## 📁 Structure

```
stock-management/
├── app/                    # Pages Next.js (App Router)
├── components/             # Composants React
├── lib/
│   ├── supabase/          # Configuration Supabase
│   ├── db/                # Queries et mutations
│   └── utils/             # Utilitaires
├── types/                 # Types TypeScript
├── stores/                # Zustand stores
├── .env.local            # Variables d'environnement (À CONFIGURER!)
├── middleware.ts         # Middleware auth/routing
└── supabase-*.sql        # Migrations SQL
```

## ⚠️ Important

**Avant de lancer l'app, assurez-vous de :**
1. Avoir mis à jour `.env.local` avec votre clé Supabase
2. Avoir exécuté les migrations SQL dans Supabase
3. Avoir installé toutes les dépendances

## 🔗 Liens Utiles

- Supabase Dashboard: https://supabase.com/dashboard
- Next.js Docs: https://nextjs.org/docs
- Shadcn/ui: https://ui.shadcn.com
