@echo off
echo Limpiando cache de Next.js...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Iniciando servidor de desarrollo...
npm run dev 