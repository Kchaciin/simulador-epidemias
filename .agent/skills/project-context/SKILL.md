---
description: Contexto completo del proyecto Simulador de Epidemias - stack, arquitectura, convenciones y documentación de referencia.
---

# Simulador de Epidemias — Contexto del Proyecto

## Descripción

Simulador de epidemias basado en agentes para San Felipe, Yaracuy, Venezuela. Los agentes (personas y mosquitos) se mueven por un mapa real siguiendo rutinas diarias, y la propagación de enfermedades se modela con cadenas de Markov (SEIR/SIRD).

## Stack Tecnológico

- **Bundler:** Vite
- **Lenguaje:** JavaScript vanilla (ES6+, módulos)
- **Mapa:** MapLibre GL JS con estilo CARTO Dark Matter
- **Rendering de agentes:** Canvas overlay sobre MapLibre
- **Rutas:** OSRM (API pública) + Turf.js para interpolación
- **Gráficas:** Chart.js (curvas SIR en tiempo real)
- **Estilos:** CSS vanilla con variables, dark mode, glassmorphism
- **Tipografía:** Inter (Google Fonts)

## Arquitectura

```
src/
├── main.js              # Entry point - inicializa todo
├── config/              # Archivos de datos (NO lógica)
│   ├── diseases.js      # Parámetros de las 4 enfermedades
│   ├── nodes.js         # Coordenadas de los 10 nodos de San Felipe
│   ├── environment.js   # Variables climáticas de Yaracuy
│   ├── treatments.js    # Datos de tratamientos
│   └── routines.js      # Horarios diarios por tipo de agente
├── engine/              # Lógica de simulación (NO UI)
│   ├── simulation.js    # Game loop principal (tick-based)
│   ├── collision.js     # Detección de proximidad y contagio
│   ├── climate.js       # Motor climático (lluvia, temp, humedad)
│   └── pathfinding.js   # Rutas OSRM + movimiento con Turf.js
├── agents/              # Clases de agentes
│   ├── agent.js         # Clase base
│   ├── human.js         # Agente humano (con rutinas)
│   └── mosquito.js      # Agente mosquito (random walk)
├── ui/                  # Interfaz visual
│   ├── map.js           # Inicialización de MapLibre
│   ├── renderer.js      # Canvas overlay para agentes
│   ├── charts.js        # Gráficas SIR con Chart.js
│   ├── dashboard.js     # Contadores y métricas
│   ├── controls.js      # Botones de intervención
│   ├── setup.js         # Pantalla de configuración inicial
│   └── results.js       # Pantalla de resultados
└── styles/              # CSS
    ├── index.css         # Variables, reset, tipografía
    ├── layout.css        # Grid principal
    ├── dashboard.css     # Panel lateral
    ├── controls.css      # Botones y sliders
    └── animations.css    # Transiciones
```

## Principios de diseño

1. **Separación estricta:** `config/` = datos puros, `engine/` = lógica pura (sin DOM), `ui/` = visual (sin lógica de simulación), `agents/` = clases de agentes.
2. **Dark mode siempre.** Fondo `#0a0a0f`, tipografía Inter, glassmorphism en cards.
3. **1 tick = 1 hora simulada.** El game loop avanza 1 hora por tick.
4. **Eventos para comunicación.** `simulation.onTick(callback)` para actualizar UI sin acoplamiento.
5. **No hardcodear parámetros.** Todo viene de `config/diseases.js`.

## Paleta de colores

| Uso | Color |
|---|---|
| Fondo principal | `#0a0a0f` |
| Fondo secundario | `#12121a` |
| Card glassmorphism | `rgba(255, 255, 255, 0.05)` |
| Borde | `rgba(255, 255, 255, 0.08)` |
| Texto | `#e4e4e7` / `#a1a1aa` |
| Acento | `#6366f1` |
| Susceptible (S) | `#4CAF50` |
| Expuesto (E) | `#FFC107` |
| Infectado (I) | `#F44336` |
| Recuperado (R) | `#2196F3` |
| Fallecido (D) | `#9E9E9E` |
| Vacunado (V) | `#9C27B0` |

## Enfermedades soportadas

1. **COVID-19** — Modelo SEIR + D, transmisión aérea por radio
2. **Dengue** — Modelo SEIR Vectorial + D, transmisión por mosquito Aedes aegypti
3. **Fiebre Amarilla** — Modelo SIRD + V con bifurcación (I₁ aguda → I₂ tóxica)
4. **Enfermedad X** — Personalizable por el usuario via formulario

## Documentación del modelo

La documentación completa del modelado está en la carpeta de Obsidian:
`d:\PERSONAL\OBSIDIAN\Cerebro Digital\Universidad\7 Semestre\Simulación y Modelo\Modelado del proyectó\`

Estructura:
- `0. MOC` — Índice central
- `1. Fundamentos/` — Decisiones de diseño y stack
- `2. Entorno/` — Mapa, nodos, rutinas, clima
- `3. Enfermedades/` — Parámetros y lógica de cada virus
- `4. Tratamiento/` — Sistema médico
- `5. Simulación/` — Config, dashboard, fin
- `6. Gestión/` — Plan de trabajo y guías por persona

## Coordenadas del mapa

Centro de San Felipe: `[-68.7425, 10.3399]`, zoom 14.
Estilo: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`

## Convenciones de código

- Módulos ES6 (`import`/`export`)
- Clases para agentes y módulos principales
- camelCase para variables y funciones
- PascalCase para clases
- Comentarios en español
- Commits en español: "Agregar lógica de contagio por radio"
