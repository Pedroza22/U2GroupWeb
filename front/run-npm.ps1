# Script para ejecutar npm con la ruta completa
param(
    [Parameter(Position=0)]
    [string]$Command = "run dev"
)

# Ruta completa a npm
$npmPath = "C:\Program Files\nodejs\npm.cmd"

# Ejecutar el comando
& $npmPath $Command.Split(" ") 