// ============================================
// Clase Base de Agente
// Responsable: Kendall Chacín
// ============================================

/**
 * Clase base para todos los agentes del simulador.
 * Human y Mosquito heredan de esta clase.
 */
export class Agent {
    constructor(id, type, position) {
        this.id = id;
        this.type = type;           // 'human' | 'mosquito'
        this.state = 'S';           // 'S','E','I','I1','I2','R','D','V'
        this.position = position;   // { lat, lng }
        this.speed = 50;            // px/tick
        this.alive = true;
    }

    /** Color hexadecimal según estado (para el renderer) */
    get color() {
        const colors = {
            'S': '#4ade80',
            'E': '#facc15',
            'I': '#ef4444',
            'I1': '#ef4444',
            'I2': '#fb923c',
            'R': '#38bdf8',
            'D': '#71717a',
            'V': '#a78bfa'
        };
        return colors[this.state] || '#ffffff';
    }

    /** Radio visual en píxeles */
    get radius() {
        return this.type === 'mosquito' ? 2 : 4;
    }
}
