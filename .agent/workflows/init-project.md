---
description: Workflow para inicializar el proyecto Vite con todas las dependencias y estructura de carpetas.
---

# Inicializar Proyecto

// turbo-all

1. Inicializar Vite en el directorio actual:
```
npm create vite@latest ./ -- --template vanilla
```

2. Instalar las 3 dependencias de producción:
```
npm install maplibre-gl chart.js @turf/turf
```

3. Crear la estructura de carpetas:
```
mkdir src\config src\engine src\agents src\ui src\styles public\fonts
```

4. Verificar que el proyecto corre:
```
npm run dev
```
