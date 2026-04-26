// ============================================
// Nodos del Mapa de San Felipe
// Responsable: Ángel Colina
// ============================================

/**
 * Coordenadas reales de San Felipe, Yaracuy
 * Cada nodo tiene: id, nombre, tipo, coordenadas, capacidad, propiedades
 */
export const NODES = [
    // ============================================
    // Nodos residenciales (4) — Spawn de agentes
    // ============================================
    {
        id: 'res_norte',
        name: 'Urb. La Fuente / Sta. Rosa',
        type: 'residential',
        lat: 10.3470,
        lng: -68.7400,
        capacity: 30,
        is_closed: true,
        has_water: true,           // Cauchos y pipotes — criadero potencial
        has_ventilation: false,
        radius_m: 200
    },
    {
        id: 'res_sur',
        name: 'Barrio El Carmen',
        type: 'residential',
        lat: 10.3330,
        lng: -68.7430,
        capacity: 30,
        is_closed: true,
        has_water: true,           // Recipientes abandonados
        has_ventilation: false,
        radius_m: 200
    },
    {
        id: 'res_este',
        name: 'Urb. El Pedregal',
        type: 'residential',
        lat: 10.3400,
        lng: -68.7340,
        capacity: 25,
        is_closed: true,
        has_water: false,
        has_ventilation: false,
        radius_m: 180
    },
    {
        id: 'res_oeste',
        name: 'Sector La Independencia',
        type: 'residential',
        lat: 10.3380,
        lng: -68.7530,
        capacity: 25,
        is_closed: true,
        has_water: true,           // Vegetación y cunetas
        has_ventilation: false,
        radius_m: 200
    },

    // ============================================
    // Nodos educativos y laborales (3)
    // ============================================
    {
        id: 'uney',
        name: 'UNEY (Universidad)',
        type: 'educational',
        lat: 10.3182,
        lng: -68.7473,
        capacity: 40,
        is_closed: true,
        has_water: false,
        has_ventilation: false,    // Aulas sin A/C
        radius_m: 150
    },
    {
        id: 'gobernacion',
        name: 'Gobernación de Yaracuy',
        type: 'labor',
        lat: 10.3403,
        lng: -68.7358,
        capacity: 20,
        is_closed: true,
        has_water: false,
        has_ventilation: false,
        radius_m: 80
    },
    {
        id: 'mercado',
        name: 'Mercado Municipal',
        type: 'public',
        lat: 10.3300,
        lng: -68.7468,
        capacity: 35,
        is_closed: false,          // Espacio abierto/semi-abierto
        has_water: true,           // Drenajes y desagües — criadero
        has_ventilation: false,
        radius_m: 100
    },

    // ============================================
    // Nodos de servicios (2)
    // ============================================
    {
        id: 'hospital',
        name: 'Hospital Central Dr. Plácido Rodríguez',
        type: 'health',
        lat: 10.3553,
        lng: -68.7517,
        capacity: 15,
        is_closed: true,
        has_water: false,
        has_ventilation: true,     // ✅ ÚNICO nodo con ventilación → K_vent = 0.40
        radius_m: 120
    },
    {
        id: 'plaza',
        name: 'Plaza Bolívar de San Felipe',
        type: 'public',
        lat: 10.3403,
        lng: -68.7358,
        capacity: 50,
        is_closed: false,          // Espacio abierto
        has_water: true,           // Fuente y macetas — criadero
        has_ventilation: false,
        radius_m: 80
    },

    // ============================================
    // Nodo de tránsito (1)
    // ============================================
    {
        id: 'terminal',
        name: 'Terminal de Pasajeros',
        type: 'transit',
        lat: 10.3233,
        lng: -68.7503,
        capacity: 20,
        is_closed: true,
        has_water: false,
        has_ventilation: false,
        radius_m: 100
    }
];

/** Centro del mapa */
export const MAP_CENTER = [-68.7425, 10.3399];
export const MAP_ZOOM = 14;

/** Colores por tipo de nodo */
export const NODE_COLORS = {
    residential: 'rgba(66, 133, 244, 0.2)',
    educational: 'rgba(251, 188, 4, 0.2)',
    labor: 'rgba(251, 188, 4, 0.2)',
    health: 'rgba(52, 168, 83, 0.2)',
    public: 'rgba(156, 39, 176, 0.2)',
    transit: 'rgba(255, 255, 255, 0.15)'
};
