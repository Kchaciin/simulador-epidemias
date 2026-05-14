// ============================================
// Detección de Proximidad y Contagio
// Responsable: Kendall Chacín
// ============================================

/**
 * Evalúa si dos agentes están dentro del radio de contagio.
 * @param {Agent} a - Primer agente
 * @param {Agent} b - Segundo agente
 * @param {number} radius - Radio en píxeles
 * @returns {boolean}
 */
export function isInRange(a, b, radius) {
    // TODO: Implementar cálculo de distancia entre coordenadas
    return false;
}

/**
 * Evalúa todos los posibles contagios entre agentes.
 * @param {Human[]} agents - Array de agentes humanos
 * @param {Object} config - Config de la enfermedad
 */
export function evaluateContagion(agents, config) {
    // TODO: Implementar lógica de contagio por proximidad
}

/**
 * Evalúa contagio vectorial (mosquito ↔ humano).
 * @param {Human[]} agents
 * @param {Mosquito[]} mosquitoes
 * @param {Object} config
 */
export function evaluateVectorContagion(agents, mosquitoes, config) {
    // TODO: Implementar contagio por colisión de hitboxes
}
