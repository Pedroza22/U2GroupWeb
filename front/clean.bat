@echo off
echo Limpiando proyecto Next.js...

REM Terminar procesos de Node.js
taskkill /f /im node.exe 2>nul

REM Eliminar directorios de caché
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Limpiar caché de npm
npm cache clean --force

echo Limpieza completada.
echo Ejecuta: npm run dev 