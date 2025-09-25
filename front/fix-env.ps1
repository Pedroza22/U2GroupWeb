# Script para corregir el archivo .env.local
$envContent = @"
NEXT_DISABLE_FILE_TRACING=1

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Rb6okFKGZAnibj3dR4FU4Qn1CVmwJgmrJceKOJiDYb8OXfpvRpAmiGcBHU3g6mTaAPemCjVJAvCSHV5kHC1sB3G00ELkY2F7Z

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
"@

# Escribir el contenido corregido al archivo
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -Force

Write-Host "Archivo .env.local corregido exitosamente"
Write-Host "Clave de Stripe configurada en una sola linea" 