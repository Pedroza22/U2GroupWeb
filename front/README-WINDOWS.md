# Solución de Problemas en Windows

## Error de Enlaces Simbólicos

Si encuentras el error:
```
[Error: EINVAL: invalid argument, readlink 'C:\...\.next\server\pages']
```

### Solución 1: Usar Scripts de Limpieza

```bash
# Opción A: Usar npm script
npm run dev:clean

# Opción B: Usar script PowerShell
.\start-dev.ps1

# Opción C: Usar script Batch
start-dev.bat
```

### Solución 2: Limpieza Manual

```bash
# Eliminar carpeta .next
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Eliminar cache de node_modules
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Iniciar servidor
npm run dev
```

### Solución 3: Ejecutar como Administrador

1. Abrir PowerShell como **Administrador**
2. Navegar al proyecto
3. Ejecutar: `npm run dev`

### Solución 4: Habilitar Enlaces Simbólicos

```powershell
# Ejecutar como administrador
fsutil behavior set SymlinkEvaluation L2L:1 R2R:1 L2R:1 R2L:1
```

### Solución 5: Usar WSL (Recomendado)

1. Instalar WSL2
2. Abrir terminal WSL
3. Navegar al proyecto
4. Ejecutar: `npm run dev`

## Scripts Disponibles

- `npm run dev` - Inicio normal
- `npm run dev:clean` - Limpieza + inicio
- `npm run clean` - Solo limpieza
- `.\start-dev.ps1` - Script PowerShell
- `start-dev.bat` - Script Batch

## Configuración Optimizada

El archivo `next.config.mjs` ya incluye configuraciones para evitar problemas con enlaces simbólicos en Windows. 