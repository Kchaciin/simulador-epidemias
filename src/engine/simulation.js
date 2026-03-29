// ============================================
// Motor de Simulación
// Responsable: Kendall Chacín
// ============================================

/**
 * Motor principal del simulador.
 * Gestiona el game loop, transiciones de estado y eventos.
 */
export class Simulation {
    constructor(config) {
        this.config = config;
        this.agents = [];
        this.mosquitoes = [];
        this.day = 0;
        this.hour = 0;
        this.tick = 0;
        this.running = false;
        this.speed = 1;

        // Callbacks
        this._onTick = null;
        this._onEnd = null;
    }

    /** Registra callback que se ejecuta cada tick */
    onTick(callback) { this._onTick = callback; }

    /** Registra callback que se ejecuta al finalizar */
    onEnd(callback) { this._onEnd = callback; }

    /** Retorna estadísticas actuales */
    getStats() {
        // TODO: Implementar conteo real de estados
        return {
            S: 0, E: 0, I: 0, R: 0, D: 0, V: 0,
            day: this.day,
            hour: this.hour,
            population: this.agents.length,
            mosquitoes_alive: this.mosquitoes.length,
            mosquitoes_infected: 0
        };
    }

    /** Retorna los agentes humanos vivos */
    getAgents() { return this.agents.filter(a => a.alive); }

    /** Retorna los mosquitos vivos */
    getMosquitoes() { return this.mosquitoes.filter(m => m.alive); }

    // --- Intervenciones ---
    applyVaccination(coverage) { /* TODO */ }
    applyQuarantine() { /* TODO */ }
    applyMasks() { /* TODO */ }
    applyFumigation() { /* TODO */ }
    applyBreedingRemoval() { /* TODO */ }
    applyTreatment(type) { /* TODO */ }

    // --- Control ---
    start() { /* TODO */ }
    pause() { this.running = false; }
    resume() { this.running = true; }
    setSpeed(multiplier) { this.speed = multiplier; }
    stop() { this.running = false; }
}
