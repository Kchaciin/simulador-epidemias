---
name: canvas-rendering
description: Técnicas de rendering en Canvas 2D para el simulador — game loop, dibujo eficiente de agentes, capas, partículas, spatial grid, overlay sobre MapLibre. Usar cuando se trabaje con el Canvas overlay, rendering de agentes, animación de lluvia, o detección visual de colisiones.
---

# Canvas 2D Rendering — Simulador de Epidemias

## Contexto del proyecto

El simulador usa un **Canvas overlay** posicionado sobre el mapa de MapLibre GL JS. El Canvas se encarga de:
- Dibujar cientos de agentes (personas y mosquitos) como círculos coloreados por estado epidemiológico.
- Proyectar coordenadas geográficas (lng/lat) a píxeles del Canvas usando `map.project()`.
- Renderizar partículas de lluvia y efectos climáticos.
- Mostrar radios de contagio (debug) y líneas de movimiento.

**El Canvas NO reemplaza al mapa** — es una capa transparente encima.

---

## Arquitectura del Canvas overlay

### Setup básico

```javascript
// Crear Canvas overlay sincronizado con MapLibre
const canvas = document.createElement('canvas');
canvas.id = 'agent-canvas';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none'; // Clicks pasan al mapa
canvas.style.zIndex = '10';

const mapContainer = document.getElementById('map');
mapContainer.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Sincronizar tamaño con el mapa
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = mapContainer.clientWidth * dpr;
    canvas.height = mapContainer.clientHeight * dpr;
    canvas.style.width = mapContainer.clientWidth + 'px';
    canvas.style.height = mapContainer.clientHeight + 'px';
    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

### Proyección geo → píxel

```javascript
function geoToPixel(lng, lat) {
    const point = map.project([lng, lat]);
    return { x: point.x, y: point.y };
}
```

**IMPORTANTE:** Llamar `map.project()` en cada frame para cada agente. Si el mapa se mueve (pan/zoom), las posiciones se actualizan automáticamente.

---

## Game Loop

### Estructura del loop principal

```javascript
let lastTime = 0;
let tickAccumulator = 0;
const TICK_INTERVAL = 1000; // 1 segundo = 1 hora simulada (configurable)

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 1. Acumular tiempo para ticks de simulación
    tickAccumulator += deltaTime * simulationSpeed;

    // 2. Ejecutar ticks de simulación (lógica, NO render)
    while (tickAccumulator >= TICK_INTERVAL) {
        simulation.tick(); // Avanza 1 hora simulada
        tickAccumulator -= TICK_INTERVAL;
    }

    // 3. Render visual (cada frame, ~60fps)
    render(ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Regla de oro: Separar lógica de render

| Fase | Frecuencia | Qué hace |
|---|---|---|
| **simulation.tick()** | Cada N ms (configurable por velocidad) | Mover agentes, calcular contagios, transiciones de estado |
| **render()** | Cada frame (~16ms a 60fps) | Dibujar agentes, partículas, UI de Canvas |

**NUNCA** hacer cálculos de simulación dentro de `render()`.

---

## Dibujo eficiente de agentes

### Dibujo básico (un agente)

```javascript
function drawAgent(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}
```

### Dibujo por lotes (batched — RECOMENDADO)

**Agrupar agentes por color** y dibujarlos en un solo `beginPath()` reduce las llamadas al Canvas API dramáticamente:

```javascript
function renderAgents(ctx, agents) {
    // Agrupar por estado (color)
    const groups = {};
    for (const agent of agents) {
        const color = getColorForState(agent.state);
        if (!groups[color]) groups[color] = [];
        groups[color].push(agent);
    }

    // Dibujar cada grupo en un solo path
    for (const [color, group] of Object.entries(groups)) {
        ctx.beginPath();
        ctx.fillStyle = color;
        for (const agent of group) {
            const { x, y } = geoToPixel(agent.lng, agent.lat);
            ctx.moveTo(x + agent.radius, y);
            ctx.arc(x, y, agent.radius, 0, Math.PI * 2);
        }
        ctx.fill();
    }
}
```

### Colores por estado epidemiológico

```javascript
const STATE_COLORS = {
    susceptible: '#4ade80',   // Verde menta
    exposed: '#facc15',       // Amarillo cálido
    infected: '#ef4444',      // Rojo
    infected_grave: '#b91c1c', // Rojo oscuro
    recovered: '#38bdf8',     // Azul cielo
    dead: '#71717a',          // Gris zinc
    vaccinated: '#a78bfa',    // Violeta
    mosquito: '#94a3b8',      // Gris azulado
    mosquito_infected: '#fb923c' // Naranja
};

function getColorForState(state) {
    return STATE_COLORS[state] || '#ffffff';
}
```

### Tamaños de agentes

```javascript
const AGENT_RADIUS = {
    human: 3,           // Personas: 3px
    human_infected: 4,  // Infectados: ligeramente más grande
    mosquito: 2,        // Mosquitos: 2px
};
```

---

## Efectos visuales

### Glow para agentes infectados graves

```javascript
function drawInfectedGlow(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fill();
}
```

### Radio de contagio (modo debug)

```javascript
function drawContagionRadius(ctx, x, y, radiusPx) {
    ctx.beginPath();
    ctx.arc(x, y, radiusPx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
}
```

### Partículas de lluvia

```javascript
class RainSystem {
    constructor(count) {
        this.particles = new Float32Array(count * 4); // x, y, speed, opacity
        this.count = count;
        this.active = false;
    }

    init(width, height) {
        for (let i = 0; i < this.count; i++) {
            const offset = i * 4;
            this.particles[offset] = Math.random() * width;       // x
            this.particles[offset + 1] = Math.random() * height;  // y
            this.particles[offset + 2] = 2 + Math.random() * 4;   // speed
            this.particles[offset + 3] = 0.2 + Math.random() * 0.4; // opacity
        }
    }

    update(height) {
        for (let i = 0; i < this.count; i++) {
            const offset = i * 4;
            this.particles[offset + 1] += this.particles[offset + 2]; // y += speed
            if (this.particles[offset + 1] > height) {
                this.particles[offset + 1] = -10;
                this.particles[offset] = Math.random() * this.canvasWidth;
            }
        }
    }

    render(ctx) {
        if (!this.active) return;
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < this.count; i++) {
            const offset = i * 4;
            const x = this.particles[offset];
            const y = this.particles[offset + 1];
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 12);
        }
        ctx.stroke();
    }
}
```

**Usar Float32Array** en lugar de objetos para partículas — mejor cache locality y menos presión de GC.

---

## Optimización de rendimiento

### Reglas

1. **`requestAnimationFrame` siempre.** Nunca `setInterval` para render.
2. **Coordenadas enteras:** `x | 0` o `Math.round(x)` evitan anti-aliasing subpíxel.
3. **Agrupar por color:** Un solo `beginPath()` + `fill()` por grupo de color.
4. **Minimizar cambios de estado del Canvas:** No alternar `fillStyle` constantemente.
5. **Object pooling:** No crear/destruir objetos de agente cada frame. Usar arrays fijos y resetear propiedades.
6. **`clearRect` completo:** Para cientos de agentes, limpiar todo el Canvas es más rápido que dirty rectangles.

### Spatial Grid para colisiones visuales

```javascript
class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    clear() {
        this.cells.clear();
    }

    getKey(x, y) {
        const cx = (x / this.cellSize) | 0;
        const cy = (y / this.cellSize) | 0;
        return `${cx},${cy}`;
    }

    insert(agent, x, y) {
        const key = this.getKey(x, y);
        if (!this.cells.has(key)) this.cells.set(key, []);
        this.cells.get(key).push(agent);
    }

    query(x, y, radius) {
        const results = [];
        const minCx = ((x - radius) / this.cellSize) | 0;
        const maxCx = ((x + radius) / this.cellSize) | 0;
        const minCy = ((y - radius) / this.cellSize) | 0;
        const maxCy = ((y + radius) / this.cellSize) | 0;

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const cell = this.cells.get(`${cx},${cy}`);
                if (cell) results.push(...cell);
            }
        }
        return results;
    }
}
```

**Usar con cellSize = radio de contagio máximo.** Reduce la complejidad de detección de O(n²) a O(n).

### Canvas layers (si es necesario)

Si el rendimiento lo exige, usar múltiples Canvas apilados:

| Capa | z-index | Contenido | Frecuencia de redibujado |
|---|---|---|---|
| Mapa (MapLibre) | 0 | Mapa base | Automático |
| Canvas estático | 5 | Zonas de cuarentena, áreas | Solo cuando cambia |
| Canvas agentes | 10 | Agentes, contagios | Cada frame |
| Canvas partículas | 15 | Lluvia, efectos | Cada frame |

---

## Anti-patrones (NUNCA hacer)

| No hacer | Hacer en su lugar |
|---|---|
| `setInterval(render, 16)` | `requestAnimationFrame(gameLoop)` |
| Crear objetos nuevos cada frame | Object pooling con arrays fijos |
| Un `beginPath` + `fill` por agente | Agrupar por color, un path por grupo |
| `ctx.save()` / `ctx.restore()` en cada agente | Setear estilos una vez por grupo |
| Cálculos de física dentro de render | Separar `tick()` (lógica) y `render()` (visual) |
| Coordenadas con decimales | `x | 0` para coordenadas enteras |
| Comparar todos vs todos para colisión | Spatial Grid o Quadtree |
| `new Agent()` / `delete` frecuente | Reusar objetos, resetear propiedades |
