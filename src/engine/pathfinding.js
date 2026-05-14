// ============================================
// Pathfinding y Movimiento
// Responsable: Daniel Bustamante
// ============================================

/**
 * Pre-calcula las 34 rutas usando OSRM.
 * Se ejecuta UNA VEZ al inicio de la simulación.
 * @param {Array} nodes - Array de nodos del mapa
 * @returns {Object} Diccionario de rutas { "origin→destination": [[lng,lat], ...] }
 */
export async function preCalculateRoutes(nodes) {
    // TODO: Llamar a OSRM para cada par de nodos
    // https://router.project-osrm.org/route/v1/foot/{lng1},{lat1};{lng2},{lat2}?geometries=geojson
    return {};
}

/**
 * Retorna la ruta pre-calculada entre dos nodos.
 * @param {string} fromId - ID del nodo origen
 * @param {string} toId - ID del nodo destino
 * @returns {Array} Coordenadas de la ruta [[lng,lat], ...]
 */
export function getRoute(fromId, toId) {
    // TODO: Buscar en el diccionario de rutas
    return [];
}

/**
 * Calcula la posición del agente a lo largo de una ruta.
 * Usa turf.along() para interpolar.
 * @param {Array} routeCoords - Coordenadas de la ruta
 * @param {number} distanceKm - Distancia recorrida
 * @returns {Array} [lng, lat]
 */
export function getPositionAlongRoute(routeCoords, distanceKm) {
    // TODO: Implementar con turf.along()
    return [0, 0];
}

/**
 * Genera un punto aleatorio dentro del radio de un nodo.
 * @param {number} lng - Longitud del centro
 * @param {number} lat - Latitud del centro
 * @param {number} radiusKm - Radio en kilómetros
 * @returns {Array} [lng, lat]
 */
export function randomPointInRadius(lng, lat, radiusKm) {
    // TODO: Implementar con turf.circle() + turf.randomPoint()
    return [lng, lat];
}
