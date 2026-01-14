@echo off
echo Nettoyage et redemarrage...

REM Tuer tous les processus node
taskkill /F /IM node.exe 2>nul

REM Attendre 2 secondes
timeout /t 2 /nobreak >nul

REM Supprimer .next
if exist .next rmdir /s /q .next
if exist .next\dev\lock del /f .next\dev\lock

REM Demarrer le serveur
npm run dev
