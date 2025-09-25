@echo off
echo ========================================
echo LIMPIEZA COMPLETA DEL PROYECTO NEXT.JS
echo ========================================

echo.
echo 1. Terminando procesos de Node.js...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. Eliminando directorio .next...
if exist .next (
    rmdir /s /q .next
    echo    ✓ Directorio .next eliminado
) else (
    echo    - Directorio .next no encontrado
)

echo.
echo 3. Eliminando node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    ✓ node_modules eliminado
) else (
    echo    - node_modules no encontrado
)

echo.
echo 4. Limpiando caché de npm...
npm cache clean --force
echo    ✓ Caché de npm limpiado

echo.
echo 5. Eliminando archivos de lock...
if exist package-lock.json del /f package-lock.json
if exist pnpm-lock.yaml del /f pnpm-lock.yaml
if exist yarn.lock del /f yarn.lock
echo    ✓ Archivos de lock eliminados

echo.
echo 6. Reinstalando dependencias...
npm install --legacy-peer-deps
echo    ✓ Dependencias reinstaladas

echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora puedes ejecutar: npm run dev
echo.
pause 