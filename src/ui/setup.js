// ============================================
// Pantalla de Configuración Inicial
// Responsable: Ángel Colina
// ============================================

/**
 * Pantalla de setup antes de iniciar la simulación.
 * Sliders de población, clima, enfermedad, etc.
 */
export class SetupScreen {
    constructor(containerId) {
        // TODO: Crear formulario con sliders y botones
    }

    /** Muestra la pantalla de configuración */
    show() {
        // TODO: Mostrar el formulario
    }

    /** Oculta la pantalla */
    hide() {
        // TODO: Ocultar y mostrar la simulación
    }

    /**
     * Callback cuando el usuario presiona "Iniciar Simulación".
     * @param {Function} callback - Recibe el objeto de config
     */
    onStart(callback) {
        // TODO: Al presionar el botón, validar y llamar callback(config)
    }
}
