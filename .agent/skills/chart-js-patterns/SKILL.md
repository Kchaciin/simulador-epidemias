---
name: chart-js-patterns
description: Patrones de Chart.js para el simulador — curvas SIR en tiempo real, dark theme, actualización dinámica, paleta epidemiológica, sparklines. Usar cuando se trabaje con gráficas, curvas SEIR, métricas en tiempo real, o dashboard de estadísticas.
---

# Chart.js — Patrones para el Simulador de Epidemias

## Contexto del proyecto

El simulador usa **Chart.js** para visualizar:
- **Curvas SIR/SEIR** en tiempo real (líneas que evolucionan con cada tick de simulación).
- **Distribución de estados** (pie/doughnut chart).
- **R₀ efectivo** a lo largo del tiempo.
- **Sparklines** pequeñas en los contadores del dashboard.

Todas las gráficas deben usar la paleta del design system (dark mode, fondo `#0a0a0f`).

---

## Configuración base (dark theme)

### Defaults globales

```javascript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Defaults globales — aplicar UNA VEZ al inicio de la app
Chart.defaults.color = '#a1a1aa';              // text-secondary
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)'; // border-subtle
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.animation.duration = 300;
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
```

### Tema dark para ejes y grid

```javascript
const DARK_SCALE_OPTIONS = {
    grid: {
        color: 'rgba(255, 255, 255, 0.06)',
        drawBorder: false,
    },
    ticks: {
        color: '#a1a1aa',
        font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
        },
        padding: 8,
    },
    border: {
        display: false,
    },
};
```

---

## Curva SIR/SEIR en tiempo real

### Crear el chart

```javascript
function createSIRChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],  // Horas simuladas: [0, 1, 2, ...]
            datasets: [
                {
                    label: 'Susceptibles',
                    data: [],
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,         // Sin puntos para rendimiento
                    borderWidth: 2,
                },
                {
                    label: 'Expuestos',
                    data: [],
                    borderColor: '#facc15',
                    backgroundColor: 'rgba(250, 204, 21, 0.05)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                },
                {
                    label: 'Infectados',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                },
                {
                    label: 'Recuperados',
                    data: [],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                },
                {
                    label: 'Fallecidos',
                    data: [],
                    borderColor: '#71717a',
                    backgroundColor: 'rgba(113, 113, 122, 0.05)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderDash: [4, 4],
                },
            ],
        },
        options: {
            animation: false,          // CRÍTICO: desactivar para streaming
            parsing: false,            // Datos ya parseados, mejor rendimiento
            normalized: true,          // Datos ya normalizados
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#a1a1aa',
                        font: { family: "'Inter', sans-serif", size: 11 },
                        boxWidth: 12,
                        boxHeight: 2,
                        padding: 16,
                        usePointStyle: false,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 17, 24, 0.95)',
                    titleColor: '#e4e4e7',
                    bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: { family: "'Inter', sans-serif", weight: '600' },
                    bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
                    displayColors: true,
                    boxWidth: 8,
                    boxHeight: 8,
                    boxPadding: 4,
                },
            },
            scales: {
                x: {
                    ...DARK_SCALE_OPTIONS,
                    title: {
                        display: true,
                        text: 'Horas simuladas',
                        color: '#52525b',
                        font: { size: 10, weight: '500' },
                    },
                },
                y: {
                    ...DARK_SCALE_OPTIONS,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Agentes',
                        color: '#52525b',
                        font: { size: 10, weight: '500' },
                    },
                },
            },
        },
    });
}
```

### Actualizar con datos en tiempo real

```javascript
// Llamar esto en cada tick de simulación
function updateSIRChart(chart, hour, counts) {
    const { susceptible, exposed, infected, recovered, dead } = counts;

    chart.data.labels.push(hour);
    chart.data.datasets[0].data.push(susceptible);
    chart.data.datasets[1].data.push(exposed);
    chart.data.datasets[2].data.push(infected);
    chart.data.datasets[3].data.push(recovered);
    chart.data.datasets[4].data.push(dead);

    // Limitar a las últimas N horas para rendimiento
    const MAX_POINTS = 200;
    if (chart.data.labels.length > MAX_POINTS) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(ds => ds.data.shift());
    }

    chart.update('none'); // 'none' = sin animación para velocidad
}
```

**IMPORTANTE:**
- `chart.update('none')` — Desactiva la animación de actualización. Obligatorio para streaming en tiempo real.
- `MAX_POINTS` — Limitar puntos para evitar memory leaks y mantener fluidez.
- Nunca recrear el chart. Siempre push data + `update()`.

---

## Doughnut de distribución de estados

```javascript
function createDistributionChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Susceptibles', 'Expuestos', 'Infectados', 'Recuperados', 'Fallecidos'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#4ade80', '#facc15', '#ef4444', '#38bdf8', '#71717a'
                ],
                borderColor: '#0a0a0f',
                borderWidth: 2,
                hoverOffset: 4,
            }],
        },
        options: {
            cutout: '65%',
            animation: { animateRotate: false },
            plugins: {
                legend: { display: false }, // Leyenda custom en HTML
                tooltip: {
                    backgroundColor: 'rgba(17, 17, 24, 0.95)',
                    titleColor: '#e4e4e7',
                    bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    bodyFont: { family: "'JetBrains Mono', monospace" },
                },
            },
        },
    });
}

function updateDistribution(chart, counts) {
    chart.data.datasets[0].data = [
        counts.susceptible,
        counts.exposed,
        counts.infected,
        counts.recovered,
        counts.dead,
    ];
    chart.update('none');
}
```

---

## Sparklines (mini-gráficas en contadores)

Para los contadores del dashboard, usar líneas ultra-mínimas:

```javascript
function createSparkline(canvasId, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: new Array(20).fill(''),
            datasets: [{
                data: new Array(20).fill(0),
                borderColor: color,
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.4,
                fill: {
                    target: 'origin',
                    above: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
                },
            }],
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            scales: {
                x: { display: false },
                y: { display: false, beginAtZero: true },
            },
            elements: {
                line: { borderJoinStyle: 'round' },
            },
        },
    });
}

function updateSparkline(chart, value) {
    chart.data.datasets[0].data.push(value);
    chart.data.datasets[0].data.shift();
    chart.update('none');
}
```

Canvas para sparklines: `<canvas width="80" height="30"></canvas>` — tiny.

---

## Paleta de colores Chart.js ↔ Design System

| Dato | Color del chart | Variable CSS |
|---|---|---|
| Susceptibles | `#4ade80` | `--color-susceptible` |
| Expuestos | `#facc15` | `--color-exposed` |
| Infectados | `#ef4444` | `--color-infected` |
| Graves | `#b91c1c` | `--color-infected-grave` |
| Recuperados | `#38bdf8` | `--color-recovered` |
| Fallecidos | `#71717a` | `--color-dead` |
| Vacunados | `#a78bfa` | `--color-vaccinated` |
| Fondo tooltip | `rgba(17, 17, 24, 0.95)` | ~`--bg-elevated` |
| Grid | `rgba(255, 255, 255, 0.06)` | `--border-subtle` |
| Texto ejes | `#a1a1aa` | `--text-secondary` |

---

## Rendimiento

### Reglas para actualización en tiempo real

1. **`animation: false`** — Obligatorio para streaming. La animación en cada update causa jank.
2. **`chart.update('none')`** — Modo sin animación para updates frecuentes.
3. **`pointRadius: 0`** — Desactivar puntos reduce draw calls significativamente.
4. **Limitar data points** — Máximo ~200 puntos visibles. `shift()` los más viejos.
5. **No recrear charts** — Crear una vez, actualizar con `push()` + `update()`.
6. **`parsing: false` + `normalized: true`** — Evitar parsing interno de Chart.js.

### Destruir charts correctamente

```javascript
// Al cambiar de pantalla o destruir componente
if (chart) {
    chart.destroy();
    chart = null;
}
```

---

## Anti-patrones (NUNCA hacer)

| No hacer | Hacer en su lugar |
|---|---|
| `new Chart()` en cada tick | Crear una vez, actualizar con `chart.update()` |
| `animation: true` en streaming | `animation: false` + `update('none')` |
| Datos sin límite (memory leak) | `MAX_POINTS` + `shift()` para datos antiguos |
| Colores por defecto de Chart.js | Usar paleta del design system |
| Tooltip genérico | Estilizar con fondo dark, fuente mono para números |
| Font del sistema en ejes | JetBrains Mono para números, Inter para texto |
| `ctx.getContext('2d')` sin canvas ref | Siempre obtener por ID o ref al canvas específico |
