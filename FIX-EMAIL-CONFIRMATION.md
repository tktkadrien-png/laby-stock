# 🔧 FIX: Désactiver Email Confirmation Supabase

## ❌ PROBLÈME
Erreur "new row violates row-level security policy" lors du signup

## ✅ SOLUTION

### Étape 1: Désactiver Email Confirmation

1. Va sur: https://supabase.com/dashboard/project/emodjmdfmwbhycyfhipp/auth/providers
2. Scroll vers le bas jusqu'à **"Email Auth"**
3. Trouve **"Confirm email"**
4. **DÉSACTIVE** cette option (toggle OFF)
5. Clique **Save**

### Étape 2: Tester

1. Retourne sur http://localhost:3000
2. Va sur "S'inscrire"
3. Crée un compte test
4. ✅ Ça devrait marcher!

### Étape 3: Login Admin

1. Va sur "Se connecter"
2. Email: `labyaounde@gmail.com`
3. Password: `Motdepass237`
4. ✅ Accès total au site

---

## 📸 OÙ TROUVER L'OPTION

Dans Supabase Dashboard:
```
Settings → Authentication → Providers → Email → Confirm email: [OFF]
```

---

## 🎯 POURQUOI?

Avec "Confirm email" activé:
- Supabase crée l'utilisateur mais ne le confirme pas
- RLS bloque l'insertion dans public.users car l'email n'est pas confirmé
- Tu reçois l'erreur de "row-level security policy"

Avec "Confirm email" désactivé:
- L'utilisateur est immédiatement confirmé
- RLS accepte l'insertion
- ✅ Tout fonctionne!

---

## ⚠️ NOTE DE SÉCURITÉ

En production, tu pourrais vouloir réactiver l'email confirmation.
Pour l'instant, pour le développement, c'est mieux de le désactiver.
