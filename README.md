# 🦠 Simulador de Epidemias — San Felipe, Yaracuy

Simulador de epidemias basado en agentes que modela la propagación de enfermedades infecciosas sobre el mapa real de San Felipe, Venezuela.

## Enfermedades simuladas

| Enfermedad | Modelo | Transmisión |
|---|---|---|
| COVID-19 | SEIR + D | Aérea (radio de proximidad) |
| Dengue | SEIR Vectorial + D | Vectorial (mosquito *Aedes aegypti*) |
| Fiebre Amarilla | SIRD + V | Vectorial con bifurcación |
| Enfermedad X | Personalizable | Configurable por el usuario |

## Stack

- **Vite** — Bundler
- **MapLibre GL JS** — Mapa vectorial con WebGL
- **Chart.js** — Gráficas SIR en tiempo real
- **Turf.js** — Geometría espacial y rutas
- **JavaScript vanilla** — Motor de simulación

## Setup

```bash
# Clonar el repositorio
git clone https://github.com/Kchaciin/simulador-epidemias.git
cd simulador-epidemias

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Se abre automáticamente en `http://localhost:5173`

## Estructura

```
src/
├── config/     → Datos de enfermedades, nodos, clima, rutinas
├── engine/     → Motor de simulación, colisiones, clima
├── agents/     → Clases Agent, Human, Mosquito
├── ui/         → Mapa, renderer, gráficas, dashboard, controles
└── styles/     → Design system, layout, animaciones
```

## Equipo

| Nombre | Módulo |
|---|---|
| Kendall Chacín | Motor de simulación |
| Daniel Bustamante | Mapa y movimiento |
| Jorge Ordoñez | Dashboard y gráficas |
| Ángel Colina | Configuración y datos |

## Licencia

MIT
