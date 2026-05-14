// ============================================
// Gráfica SIR en Tiempo Real (Chart.js)
// Responsable: Jorge Ordoñez
// ============================================

// import { Chart } from 'chart.js/auto';

/**
 * Gráfica de líneas SIR/SEIR actualizable por tick.
 */
export class SIRChart {
    constructor(canvasId) {
        // TODO: Inicializar Chart.js con líneas S, E, I, R, D, V
        // TODO: Colores del design system
        // TODO: animation: false para rendimiento
    }

    /**
     * Agrega un punto de datos a la gráfica.
     * @param {Object} stats - { S, E, I, R, D, V, day }
     */
    update(stats) {
        // TODO: Push datos y llamar chart.update('none')
    }

    /** Limpia la gráfica para una nueva simulación */
    reset() {
        // TODO: Vaciar datasets
    }
}
