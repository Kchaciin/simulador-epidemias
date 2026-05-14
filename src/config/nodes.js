// ============================================
// Nodos del Mapa de San Felipe
// Responsable: Ángel Colina
// ============================================

/**
 * Coordenadas reales de San Felipe, Yaracuy
 * Cada nodo tiene: id, nombre, tipo, coordenadas, capacidad, propiedades
 */
export const NODES = [
    {
        id: 'res_norte',
        name: 'Urb. La Fuente / Sta. Rosa',
        type: 'residential',
        lat: 10.3470,
        lng: -68.7400,
        capacity: 30,
        is_closed: true,
        has_water: true,
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
        has_water: true,
        radius_m: 200
    },
    {
        id: 'res_este',
        name: 'Urb. San José',
        type: 'residential',
        lat: 10.3390,
        lng: -68.7350,
        capacity: 30,
        is_closed: true,
        has_water: true,
        radius_m: 200
    },
    {
        id: 'res_oeste',
        name: 'Barrio Yurubí',
        type: 'residential',
        lat: 10.3400,
        lng: -68.7500,
        capacity: 30,
        is_closed: true,
        has_water: true,
        radius_m: 200
    },
    {
        id: 'uney',
        name: 'UNEY',
        type: 'educational',
        lat: 10.3440,
        lng: -68.7370,
        capacity: 60,
        is_closed: true,
        has_water: false,
        radius_m: 150
    },
    {
        id: 'gobernacion',
        name: 'Gobernación de Yaracuy',
        type: 'labor',
        lat: 10.3410,
        lng: -68.7440,
        capacity: 40,
        is_closed: true,
        has_water: false,
        radius_m: 100
    },
    {
        id: 'mercado',
        name: 'Mercado Municipal',
        type: 'public',
        lat: 10.3380,
        lng: -68.7420,
        capacity: 50,
        is_closed: false,
        has_water: true,
        radius_m: 120
    },
    {
        id: 'plaza',
        name: 'Plaza Bolívar',
        type: 'public',
        lat: 10.3395,
        lng: -68.7435,
        capacity: 40,
        is_closed: false,
        has_water: false,
        radius_m: 80
    },
    {
        id: 'hospital',
        name: 'Hospital Central',
        type: 'health',
        lat: 10.3360,
        lng: -68.7460,
        capacity: 30,
        is_closed: true,
        has_water: false,
        radius_m: 100
    },
    {
        id: 'terminal',
        name: 'Terminal de Pasajeros',
        type: 'transit',
        lat: 10.3350,
        lng: -68.7380,
        capacity: 50,
        is_closed: false,
        has_water: true,
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
