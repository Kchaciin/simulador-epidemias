// ============================================
// Clase Base de Agente
// Responsable: Kendall Chacín
// Fuente: Modelado §6.2 — Guía Kendall (Motor)
// ============================================

/**
 * Clase base para todos los agentes del simulador.
 * Human y Mosquito heredan de esta clase.
 *
 * Propiedades compartidas:
 * - id, type, state, position, speed, alive
 * - color (getter computado según estado)
 * - radius (getter computado para el renderer)
 */
export class Agent {
    /**
     * @param {number} id - Identificador único del agente
     * @param {string} type - 'human' | 'mosquito'
     * @param {{ lat: number, lng: number }} position - Posición inicial
     */
    constructor(id, type, position) {
        this.id = id;
        this.type = type;               // 'human' | 'mosquito'
        this.state = 'S';               // Estado epidemiológico actual
        this.position = { ...position }; // { lat, lng } — copia defensiva
        this.alive = true;

        // Ticks acumulados en el estado actual
        // Usado para distribución cuadrática de muerte/recuperación
        this.ticksInState = 0;
    }

    /**
     * Cambia el estado del agente y resetea el contador de ticks.
     * Registra el cambio en el historial si existe (Human).
     * @param {string} newState - Nuevo estado ('S','E','I','I1','I2','R','D','V','L')
     * @param {number} tick - Tick actual de la simulación
     */
    changeState(newState, tick = 0) {
        const oldState = this.state;
        this.state = newState;
        this.ticksInState = 0;

        // Si es un agente humano con historial, registrar
        if (this.history) {
            this.history.push({
                from: oldState,
                to: newState,
                tick: tick,
                day: Math.floor(tick / 24)
            });
        }

        // Si murió, marcarlo
        if (newState === 'D') {
            this.alive = false;
        }
    }

    /**
     * Color hexadecimal según estado epidemiológico.
     * Usado por renderer.js para dibujar en el Canvas overlay.
     *
     * Paleta del modelado (§2. Gráficas y Métricas):
     *   S  = Verde        | E  = Amarillo      | I  = Rojo
     *   I1 = Rojo (aguda) | I2 = Naranja (tóx.) | R  = Azul
     *   D  = Gris oscuro  | V  = Morado        | L  = Gris azulado
     */
    get color() {
        const palette = {
            'S':  '#4CAF50',    // Verde — Susceptible
            'E':  '#FFC107',    // Amarillo — Expuesto (incubando)
            'I':  '#F44336',    // Rojo — Infectado activo
            'I1': '#F44336',    // Rojo — FA Fase aguda
            'I2': '#FF6D00',    // Naranja — FA Fase tóxica
            'R':  '#2196F3',    // Azul — Recuperado
            'D':  '#616161',    // Gris oscuro — Fallecido
            'V':  '#9C27B0',    // Morado — Vacunado
            'L':  '#78909C'     // Gris azulado — Portador latente LTBI (solo TB)
        };
        return palette[this.state] || '#FFFFFF';
    }

    /**
     * Radio visual en píxeles para el renderer.
     * Infectados activos se dibujan 1px más grande para mayor visibilidad.
     */
    get radius() {
        if (this.type === 'mosquito') return 2;
        return ['I', 'I1', 'I2'].includes(this.state) ? 5 : 4;
    }
}
