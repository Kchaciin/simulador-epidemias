// ============================================
// Motor Climático
// Responsable: Kendall Chacín
// Fuente: Modelado §2.1 Clima + §3.0 Tabla Maestra §Entorno
// ============================================

import { CLIMATE, getTemperature, getHumidity, evaluateRain } from '../config/environment.js';

/**
 * Motor climático que calcula temperatura, humedad y lluvia
 * cada tick usando curvas sinusoidales calibradas para Yaracuy.
 *
 * Ciclo diurno:
 *   T(h) = 29 + 5 · sin((h-8)·π/12)   → 24°C (5AM) .. 34°C (2PM)
 *   H(h) = 78 - 13 · sin((h-8)·π/12)  → 65%  (2PM) .. 91%  (5AM)
 *   Lluvia: solo 13:00–18:00, probabilidad dividida en ventana
 */
export class ClimateEngine {
    /**
     * @param {string} season - 'dry' | 'wet'
     */
    constructor(season = 'dry') {
        this.season = season;                       // Temporada actual

        // --- Estado climático actual ---
        this.temperature = CLIMATE.T_avg;           // °C
        this.humidity = CLIMATE.H_avg;              // %
        this.isRaining = false;                     // ¿Llueve ahora?

        // --- Temporizador de eclosión de criaderos ---
        // Cuando llueve: se activa un timer de 7 días
        // Al completarse: spawn de mosquitos ×3 durante 5 días
        this.eclosionTimer = 0;                     // Ticks restantes hasta eclosión
        this.eclosionActive = false;                // ¿Spawn elevado activo?
        this.eclosionRemainingTicks = 0;            // Ticks restantes con spawn ×3

        // --- Historial (para Jorge: widget climático) ---
        this.rainDays = 0;                          // Días con lluvia acumulados
        this.lastRainTick = -1;                     // Tick del último evento de lluvia
    }

    /**
     * Actualiza el estado climático para la hora actual.
     * Llamar UNA VEZ por tick al inicio del game loop.
     *
     * @param {number} hour - Hora del día (0-23)
     * @param {number} tick - Tick global de la simulación
     */
    update(hour, tick) {
        // --- Temperatura y humedad sinusoidal ---
        this.temperature = getTemperature(hour);
        this.humidity = getHumidity(hour);

        // --- Evaluación de lluvia ---
        const rainBefore = this.isRaining;
        this.isRaining = evaluateRain(hour, this.season);

        // Si empieza a llover → activar temporizador de eclosión
        if (this.isRaining && !rainBefore) {
            this.lastRainTick = tick;
            // Reiniciar temporizador: 7 días × 24 ticks/día
            this.eclosionTimer = CLIMATE.eclosion_delay_days * 24;
            this.eclosionActive = false;
        }

        // --- Avanzar temporizador de eclosión ---
        if (this.eclosionTimer > 0) {
            this.eclosionTimer--;
            if (this.eclosionTimer === 0 && !this.eclosionActive) {
                // ¡Eclosión! Los criaderos empiezan a producir ×3 durante 5 días
                this.eclosionActive = true;
                this.eclosionRemainingTicks = CLIMATE.eclosion_effect_days * 24;
            }
        }

        // --- Avanzar efecto de eclosión ---
        if (this.eclosionActive && this.eclosionRemainingTicks > 0) {
            this.eclosionRemainingTicks--;
            if (this.eclosionRemainingTicks === 0) {
                this.eclosionActive = false;
            }
        }
    }

    /**
     * Multiplicador de contagio aéreo según clima.
     * Calor exterior reduce la supervivencia de aerosoles.
     *
     * @param {boolean} isClosedSpace - ¿Están en espacio cerrado?
     * @returns {number} K_clima (0.50 si calor+exterior, 1.0 si no)
     */
    getAirborneModifier(isClosedSpace) {
        if (!isClosedSpace && this.temperature > CLIMATE.heat_threshold) {
            return CLIMATE.K_clima_hot_exterior; // 0.50
        }
        return 1.0;
    }

    /**
     * Multiplicador de spawn de mosquitos este tick.
     * Con eclosión activa: ×3 multiplicador sobre el base.
     *
     * @returns {number} Multiplicador de spawn
     */
    getSpawnMultiplier() {
        return this.eclosionActive ? 3.0 : 1.0;
    }

    /**
     * Modificador de mortalidad del mosquito según humedad.
     *
     * @returns {number} Factor (0.70 si húmedo, 1.50 si seco)
     */
    getMosquitoMortalityModifier() {
        if (this.humidity > CLIMATE.humidity_threshold_mosquito) {
            return CLIMATE.K_humidity_mosquito_high; // 0.70 — mosquitos viven más
        }
        return CLIMATE.K_humidity_mosquito_low;      // 1.50 — mayor mortalidad
    }

    /**
     * Retorna el estado climático completo para el dashboard.
     * Jorge usa esto en dashboard.js para actualizar el widget climático.
     *
     * @returns {Object} Estado climático serializable
     */
    getState() {
        return {
            temperature: Math.round(this.temperature * 10) / 10,
            humidity: Math.round(this.humidity),
            isRaining: this.isRaining,
            season: this.season,
            eclosionActive: this.eclosionActive,
            label: this._getLabel()
        };
    }

    /** Etiqueta legible del clima actual */
    _getLabel() {
        if (this.isRaining) return 'Lluvia';
        if (this.temperature > 32) return 'Caluroso';
        if (this.temperature < 26) return 'Fresco';
        return 'Despejado';
    }
}
