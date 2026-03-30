---
name: maplibre-patterns
description: Patrones de MapLibre GL JS para el simulador — inicialización con CARTO Dark, nodos GeoJSON, zonas de cuarentena, interacción con Canvas overlay, controles custom. Usar cuando se trabaje con el mapa, capas, markers, polígonos, o interacciones geográficas.
---

# MapLibre GL JS — Patrones para el Simulador de Epidemias

## Contexto del proyecto

El simulador usa **MapLibre GL JS** con el estilo **CARTO Dark Matter** para renderizar el mapa de San Felipe, Yaracuy, Venezuela. Sobre el mapa hay un **Canvas overlay** donde se dibujan los agentes.

- **Centro del mapa:** `[-68.7425, 10.3399]` (San Felipe)
- **Zoom:** 14
- **Estilo:** `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`

**MapLibre maneja el mapa.** El Canvas overlay (ver skill `canvas-rendering`) maneja los agentes.

---

## Inicialización del mapa

### Setup básico

```javascript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-68.7425, 10.3399],
    zoom: 14,
    minZoom: 12,
    maxZoom: 18,
    attributionControl: false,
    antialias: true,
    fadeDuration: 0,    // Sin fade en tiles para UI más responsive
});

// Atribución custom (más discreta)
map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
```

### Esperar a que el mapa cargue

```javascript
map.on('load', () => {
    // Aquí agregar capas, sources, y configurar Canvas overlay
    initCanvasOverlay();
    addNodeMarkers();
    addQuarantineZones();
});
```

**SIEMPRE** esperar el evento `'load'` antes de agregar capas o sources.

---

## Nodos de San Felipe (puntos de interés)

### Agregar nodos como GeoJSON source

```javascript
function addNodeMarkers() {
    // Source con los 10 nodos del mapa
    map.addSource('nodes', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: nodes.map(node => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [node.lng, node.lat],
                },
                properties: {
                    id: node.id,
                    name: node.name,
                    type: node.type,  // 'hospital', 'mercado', 'residencia', etc.
                },
            })),
        },
    });

    // Capa de círculos para nodos
    map.addLayer({
        id: 'nodes-circle',
        type: 'circle',
        source: 'nodes',
        paint: {
            'circle-radius': 6,
            'circle-color': [
                'match', ['get', 'type'],
                'hospital', '#ef4444',
                'mercado', '#facc15',
                'residencia', '#4ade80',
                'escuela', '#38bdf8',
                'iglesia', '#a78bfa',
                '#6366f1'  // default
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#0a0a0f',
            'circle-opacity': 0.8,
        },
    });

    // Etiquetas de nodos
    map.addLayer({
        id: 'nodes-label',
        type: 'symbol',
        source: 'nodes',
        layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold'],
            'text-size': 11,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
            'text-allow-overlap': false,
        },
        paint: {
            'text-color': '#a1a1aa',
            'text-halo-color': '#0a0a0f',
            'text-halo-width': 1,
        },
    });
}
```

**Usar capas WebGL** (`circle`, `symbol`) en lugar de `maplibregl.Marker` para los nodos — mucho más eficiente.

---

## Zonas de cuarentena (polígonos)

### Agregar zona de cuarentena dinámica

```javascript
function addQuarantineZones() {
    // Source vacío — se llena cuando se activa cuarentena
    map.addSource('quarantine-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
    });

    // Capa de relleno
    map.addLayer({
        id: 'quarantine-fill',
        type: 'fill',
        source: 'quarantine-zones',
        paint: {
            'fill-color': 'rgba(239, 68, 68, 0.08)',
            'fill-outline-color': 'rgba(239, 68, 68, 0.3)',
        },
    });

    // Capa de borde
    map.addLayer({
        id: 'quarantine-border',
        type: 'line',
        source: 'quarantine-zones',
        paint: {
            'line-color': '#ef4444',
            'line-width': 2,
            'line-dasharray': [4, 4],
            'line-opacity': 0.6,
        },
    });
}

// Activar cuarentena en un área
function setQuarantineZone(polygon) {
    map.getSource('quarantine-zones').setData({
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [polygon],  // [[lng, lat], [lng, lat], ...]
            },
            properties: { active: true },
        }],
    });
}

// Desactivar cuarentena
function clearQuarantineZones() {
    map.getSource('quarantine-zones').setData({
        type: 'FeatureCollection',
        features: [],
    });
}
```

---

## Interacción con el Canvas overlay

### Sincronizar Canvas con movimiento del mapa

```javascript
// Redibujar Canvas cuando el mapa se mueve
map.on('move', () => {
    renderAgents(); // Re-render porque las coordenadas píxel cambian
});

map.on('zoom', () => {
    renderAgents();
});
```

### Proyección de coordenadas

```javascript
// Geo → Píxel (para dibujar en Canvas)
function geoToPixel(lng, lat) {
    return map.project([lng, lat]); // Retorna { x, y }
}

// Píxel → Geo (para clicks en Canvas)
function pixelToGeo(x, y) {
    return map.unproject([x, y]); // Retorna LngLat
}
```

### Click en agentes (a través del Canvas)

```javascript
canvas.style.pointerEvents = 'none'; // Default: clicks pasan al mapa

// Para detectar clicks en agentes, escuchar en el mapa
map.on('click', (e) => {
    const { x, y } = e.point;
    const clickedAgent = findAgentAtPixel(x, y, agents);
    if (clickedAgent) {
        showAgentPopup(clickedAgent, e.lngLat);
    }
});

function findAgentAtPixel(x, y, agents) {
    for (const agent of agents) {
        const pos = geoToPixel(agent.lng, agent.lat);
        const dx = pos.x - x;
        const dy = pos.y - y;
        if (dx * dx + dy * dy <= agent.radius * agent.radius + 16) {
            return agent;
        }
    }
    return null;
}
```

---

## Popups

### Popup de agente

```javascript
function showAgentPopup(agent, lngLat) {
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        className: 'agent-popup',
        maxWidth: '200px',
        offset: 10,
    });

    popup.setLngLat(lngLat)
        .setHTML(`
            <div class="popup-content">
                <div class="popup-state" style="color: ${getColorForState(agent.state)}">
                    ● ${agent.state.toUpperCase()}
                </div>
                <div class="popup-info">
                    <span>ID: ${agent.id}</span>
                    <span>Edad: ${agent.age}</span>
                </div>
            </div>
        `)
        .addTo(map);
}
```

### CSS para popups (dark theme)

```css
.maplibregl-popup-content {
    background: rgba(17, 17, 24, 0.95) !important;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 12px;
    color: #e4e4e7;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.maplibregl-popup-tip {
    border-top-color: rgba(17, 17, 24, 0.95) !important;
}

.maplibregl-popup-close-button {
    color: #a1a1aa;
    font-size: 16px;
    padding: 4px 8px;
}
```

---

## Rutas con Turf.js

### Interpolar movimiento de agente a lo largo de una ruta

```javascript
import * as turf from '@turf/turf';

// Dada una ruta (LineString de OSRM), obtener posición del agente
function getAgentPosition(route, progress) {
    // progress: 0.0 a 1.0
    const totalLength = turf.length(route, { units: 'meters' });
    const point = turf.along(route, totalLength * progress, { units: 'meters' });
    return point.geometry.coordinates; // [lng, lat]
}
```

### Crear LineString desde waypoints

```javascript
function createRoute(waypoints) {
    return turf.lineString(waypoints.map(wp => [wp.lng, wp.lat]));
}
```

---

## Controles del mapa

### Deshabilitar interacciones durante simulación rápida

```javascript
function lockMapInteraction() {
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
}

function unlockMapInteraction() {
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
}
```

### Centrar en un nodo

```javascript
function flyToNode(node) {
    map.flyTo({
        center: [node.lng, node.lat],
        zoom: 16,
        duration: 800,
        essential: true,
    });
}
```

---

## Estilización adicional del mapa

### Ocultar labels innecesarios del estilo base

```javascript
map.on('load', () => {
    // Ocultar POI labels que no son relevantes
    const layersToHide = [
        'poi_label',
        'poi_z16',
        'poi_z15',
    ];

    for (const layerId of layersToHide) {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
    }
});
```

### Ajustar opacidad del mapa para que los agentes resalten

```javascript
// Hacer el mapa base más oscuro para que los agentes se vean mejor
map.on('load', () => {
    const bgLayers = ['background', 'landcover', 'landuse'];
    for (const layerId of bgLayers) {
        if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'fill-opacity', 0.5);
        }
    }
});
```

---

## Anti-patrones (NUNCA hacer)

| No hacer | Hacer en su lugar |
|---|---|
| `new maplibregl.Marker()` para cada agente | Canvas overlay para agentes (cientos de DOM nodes = crash) |
| Agregar capas antes de `map.on('load')` | Esperar el evento `'load'` |
| Recrear sources en cada update | `source.setData()` para actualizar |
| Mover agentes con markers DOM | Proyectar con `map.project()` y dibujar en Canvas |
| Ignorar `devicePixelRatio` | Escalar Canvas por DPR para pantallas HiDPI |
| Olvidar re-render en `map.on('move')` | Sincronizar Canvas con cada movimiento del mapa |
| `map.addImage()` sin fallback | Verificar si la imagen ya existe antes de agregar |
| `flyTo` con duración larga durante simulación | `jumpTo` para movimientos instantáneos, `flyTo` solo para interacción del usuario |
