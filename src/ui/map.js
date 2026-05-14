// ============================================
// Inicialización del Mapa (MapLibre GL JS)
// Responsable: Daniel Bustamante
// ============================================

// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import { NODES, MAP_CENTER, MAP_ZOOM, NODE_COLORS } from '../config/nodes.js';

/**
 * Inicializa MapLibre GL JS con CARTO Dark Matter.
 * @param {string} containerId - ID del div contenedor
 * @returns {Object} Instancia del mapa
 */
export function initMap(containerId) {
    // TODO: Inicializar MapLibre con dark mode
    // const map = new maplibregl.Map({
    //     container: containerId,
    //     style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    //     center: MAP_CENTER,
    //     zoom: MAP_ZOOM,
    //     attributionControl: false
    // });
    // return map;
}

/**
 * Coloca los nodos como círculos semi-transparentes en el mapa.
 * @param {Object} map - Instancia de MapLibre
 * @param {Array} nodes - Array de nodos
 */
export function addNodeMarkers(map, nodes) {
    // TODO: Añadir GeoJSON source + circle layer
}
