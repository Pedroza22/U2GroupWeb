Write-Host "Limpiando cache de Next.js..." -ForegroundColor Green

# Limpiar cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "✓ Cache eliminado" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Host "✓ Cache de node_modules eliminado" -ForegroundColor Green
}

Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green
npm run dev 