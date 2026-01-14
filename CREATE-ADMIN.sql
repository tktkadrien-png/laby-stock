-- ============================================
-- CREER L'UTILISATEUR ADMIN
-- ============================================
-- Copie et colle ce fichier dans Supabase SQL Editor
-- APRES avoir execute FIX-RLS-POLICIES.sql
-- ============================================

-- 1. Supprimer l'admin s'il existe deja
DELETE FROM auth.users WHERE email = 'labyaounde@gmail.com';
DELETE FROM public.users WHERE email = 'labyaounde@gmail.com';

-- 2. Creer l'utilisateur admin dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'labyaounde@gmail.com',
  crypt('Motdepass237', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 3. Creer le profil admin dans public.users
INSERT INTO public.users (id, email, full_name, role)
SELECT
  id,
  'labyaounde@gmail.com',
  'Administrateur',
  'admin'
FROM auth.users
WHERE email = 'labyaounde@gmail.com';

-- 4. Verification - Afficher l'admin cree
SELECT
  u.email,
  u.full_name,
  u.role,
  u.created_at
FROM public.users u
WHERE u.email = 'labyaounde@gmail.com';

-- ============================================
-- FIN - Admin cree avec succes!
-- Email: labyaounde@gmail.com
-- Password: Motdepass237
-- Role: admin (acces total)
-- ============================================
