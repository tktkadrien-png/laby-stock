@echo off
echo ====================================
echo Installation des dependances
echo ====================================
echo.

cd /d "%~dp0"

echo [1/5] Installation des dependances Supabase...
call npm install @supabase/supabase-js @supabase/ssr

echo.
echo [2/5] Installation des dependances de state management...
call npm install zustand @tanstack/react-query @tanstack/react-query-devtools

echo.
echo [3/5] Installation des dependances de formulaires et validation...
call npm install react-hook-form @hookform/resolvers zod

echo.
echo [4/5] Installation des dependances UI...
call npm install lucide-react recharts date-fns
call npm install class-variance-authority clsx tailwind-merge
call npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
call npm install @radix-ui/react-select @radix-ui/react-label @radix-ui/react-tabs
call npm install @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-popover
call npm install @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-alert-dialog

echo.
echo [5/5] Installation des dependances de developpement...
call npm install -D @types/node

echo.
echo ====================================
echo Installation terminee avec succes!
echo ====================================
echo.
echo Prochaines etapes:
echo 1. Mettez a jour le fichier .env.local avec vos cles Supabase
echo 2. Executez les migrations SQL dans Supabase Dashboard
echo 3. Lancez: npm run dev
echo.
pause
