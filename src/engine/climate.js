// ============================================
// Motor Climático
// Responsable: Kendall Chacín
// ============================================

import { CLIMATE } from '../config/environment.js';

/**
 * Motor climático que evalúa lluvia, temperatura y humedad cada tick.
 */
export class ClimateEngine {
    constructor(season = 'dry') {
        this.season = season;           // 'dry' | 'wet'
        this.temperature = CLIMATE.base_temp;
        this.humidity = CLIMATE.base_humidity;
        this.isRaining = false;
        this.eclosionTimer = 0;         // Temporizador de eclosión (ticks)
    }

    /** Evaluar el clima para este tick */
    update(hour) {
        // TODO: Implementar variación de temperatura por hora
        // TODO: Evaluar probabilidad de lluvia
        // TODO: Gestionar temporizador de eclosión
    }

    /** Retorna el multiplicador de contagio según clima */
    getContagionModifier() {
        // TODO: Calor + exterior = ×0.5, humedad alta = ×0.7
        return 1.0;
    }

    /** Retorna el multiplicador de mortalidad del mosquito */
    getMosquitoMortalityModifier() {
        // TODO: Humedad alta = ×0.7, humedad baja = ×1.5
        return 1.0;
    }

    /** Retorna el multiplicador de spawn de mosquitos */
    getSpawnMultiplier() {
        // TODO: Con lluvia reciente = ×3, sin lluvia = ×1
        return 1.0;
    }
}
