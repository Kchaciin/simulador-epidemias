// ============================================
// Rutinas Diarias de Agentes
// Responsable: Ángel Colina
// Fuente: Modelado §2.2 — Rutinas y Horarios de Agentes
// ============================================

/**
 * Rutinas horarias por tipo de agente.
 * Cada entrada define: hora base, varianza (±ticks), acción y destino.
 * El motor aplica varianza con: hora_base + Math.floor(Math.random() * 3) - 1
 */
export const ROUTINES = {
    student: [
        { hour: 6,  variance: 1, action: 'move',  destination: 'uney' },
        { hour: 12, variance: 0, action: 'move',  destination: ['mercado', 'plaza'], prob: [0.5, 0.5] },
        { hour: 13, variance: 0, action: 'move',  destination: 'uney' },
        { hour: 17, variance: 1, action: 'move',  destination: ['plaza', 'home'], prob: [0.3, 0.7] },
        { hour: 19, variance: 1, action: 'move',  destination: 'home' }
    ],
    worker: [
        { hour: 6,  variance: 1, action: 'move',  destination: ['gobernacion', 'mercado'], prob: [0.6, 0.4] },
        { hour: 12, variance: 0, action: 'move',  destination: ['mercado', 'plaza'], prob: [0.5, 0.5] },
        { hour: 13, variance: 0, action: 'move',  destination: 'work' },
        { hour: 17, variance: 1, action: 'move',  destination: ['mercado', 'home'], prob: [0.2, 0.8] },
        { hour: 19, variance: 1, action: 'move',  destination: 'home' }
    ],
    free: [
        { hour: 8,  variance: 1, action: 'maybe_move', prob_exit: 0.60, destination: ['mercado', 'plaza'], prob: [0.4, 0.6] },
        { hour: 11, variance: 1, action: 'move', destination: 'home' },
        { hour: 14, variance: 1, action: 'maybe_move', prob_exit: 0.40, destination: ['plaza', 'terminal'], prob: [0.5, 0.5] },
        { hour: 17, variance: 1, action: 'move', destination: 'home' }
    ]
};

/**
 * Velocidades de agentes en km/h
 * El pathfinding usa turf.along(ruta, distanciaKm) para mover el agente.
 * Velocidad del infectado es variable: SPEEDS.healthy * config.v_sick
 *   - COVID/Dengue/FA: 5.0 × 0.50 = 2.5 km/h
 *   - TB:              5.0 × 0.70 = 3.5 km/h
 *   - Grave:           5.0 × 0.30 = 1.5 km/h
 */
export const SPEEDS = {
    healthy: 5.0,       // km/h — caminata rápida urbana (5000 m/tick)
    grave: 1.5,         // km/h — se dirige al hospital (1500 m/tick)
};

/**
 * Distribución de tipos de agentes en la población
 */
export const AGENT_DISTRIBUTION = {
    student: 0.40,
    worker: 0.40,
    free: 0.20
};

/**
 * Aplica varianza a una hora base
 * @param {number} baseHour - Hora base del evento
 * @param {number} variance - Varianza en ticks (±variance)
 * @returns {number} Hora ajustada (clamped a 0-23)
 */
export function applyVariance(baseHour, variance) {
    if (variance === 0) return baseHour;
    const delta = Math.floor(Math.random() * (2 * variance + 1)) - variance;
    return Math.max(0, Math.min(23, baseHour + delta));
}

/**
 * Decide si un agente Libre sale de su casa (con modificador de lluvia)
 * @param {number} baseProbability - Prob. base de salida (0.60 o 0.40)
 * @param {boolean} isRaining - ¿Está lloviendo?
 * @returns {boolean}
 */
export function decideSalida(baseProbability, isRaining) {
    const prob = isRaining ? baseProbability * 0.30 : baseProbability;
    return Math.random() < prob;
}
