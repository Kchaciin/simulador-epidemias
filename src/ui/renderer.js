// ============================================
// Canvas Overlay para Rendering de Agentes
// Responsable: Daniel Bustamante
// ============================================

/**
 * Renderer que dibuja agentes sobre el mapa usando Canvas 2D.
 */
export class Renderer {
    constructor(canvasId, map) {
        // TODO: Obtener contexto 2D del canvas
        // TODO: Sincronizar tamaño con el mapa
        // TODO: Re-dibujar al mover/zoom el mapa
    }

    /**
     * Dibuja todos los agentes humanos.
     * @param {Human[]} agents - Array de agentes vivos
     */
    drawAgents(agents) {
        // TODO: Para cada agente, convertir {lat,lng} a píxeles con map.project()
        // TODO: Dibujar círculo del color correspondiente al estado
    }

    /**
     * Dibuja todos los mosquitos.
     * @param {Mosquito[]} mosquitoes - Array de mosquitos vivos
     */
    drawMosquitoes(mosquitoes) {
        // TODO: Igual que drawAgents pero con radio 2px
    }

    /** Limpia el canvas */
    clear() {
        // TODO: ctx.clearRect(0, 0, width, height)
    }
}
