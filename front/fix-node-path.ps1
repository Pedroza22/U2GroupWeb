# Script para agregar Node.js al PATH permanentemente
Write-Host "Agregando Node.js al PATH del sistema..." -ForegroundColor Green

# Obtener el PATH actual del usuario
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Verificar si Node.js ya está en el PATH
if ($currentPath -like "*nodejs*") {
    Write-Host "Node.js ya está en el PATH" -ForegroundColor Yellow
} else {
    # Agregar Node.js al PATH
    $newPath = $currentPath + ";C:\Program Files\nodejs"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Node.js agregado al PATH exitosamente" -ForegroundColor Green
}

Write-Host "Reinicia tu terminal para que los cambios tomen efecto" -ForegroundColor Cyan 