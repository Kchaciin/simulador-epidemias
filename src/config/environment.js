// ============================================
// Variables Climáticas de Yaracuy
// Responsable: Ángel Colina
// Fuente: Modelado §2.1 Clima + §3.0 Tabla Maestra
// ============================================

/**
 * Constantes climáticas para el ciclo diurno sinusoidal
 * Calibradas para San Felipe, Yaracuy — Sierra de Aroa
 */
export const CLIMATE = {
    // --- Temperatura: ciclo sinusoidal ---
    // T(h) = T_avg + A_T * sin((h - 8) * π / 12)
    // Resultado: 24°C a las 5AM, 34°C a las 2PM
    T_avg: 29,                      // Temperatura promedio (°C)
    T_amplitude: 5,                 // Amplitud de variación (°C)
    T_min: 24,                      // Mínimo diario (5:00 AM)
    T_max: 34,                      // Máximo diario (2:00 PM)
    T_phase_offset: 8,              // Desfase de fase en horas (pico a las 2PM)

    // --- Humedad: ciclo sinusoidal INVERSO a temperatura ---
    // H(h) = H_avg - A_H * sin((h - 8) * π / 12)
    // Resultado: 91% a las 5AM, 65% a las 2PM
    H_avg: 78,                      // Humedad promedio (%)
    H_amplitude: 13,                // Amplitud de variación (%)
    H_min: 65,                      // Mínimo diario (2:00 PM — más calor)
    H_max: 91,                      // Máximo diario (5:00 AM — más frío)

    // --- Lluvia: solo en ventana convectiva tropical ---
    rain_window_start: 13,          // Hora inicio (1:00 PM)
    rain_window_end: 18,            // Hora fin (6:00 PM)
    rain_prob_dry: 0.10,            // Prob. lluvia diaria en temporada de sequía
    rain_prob_wet: 0.50,            // Prob. lluvia diaria en temporada de lluvias

    // --- Umbrales (⚠️ DOS umbrales de humedad distintos) ---
    // Umbral de CALOR: afecta aerosoles COVID en exterior
    heat_threshold: 30,             // °C — sobre esto, K_clima = 0.50 (COVID exterior)

    // Umbral de HUMEDAD para mosquitos: afecta mortalidad del vector
    humidity_threshold_mosquito: 75, // % — H > 75% = mosquitos viven más (Dengue, FA)

    // Umbral de HUMEDAD para aerosoles: afecta radio de contagio COVID
    humidity_threshold_aerosol: 80,  // % — H > 80% en exterior = radio COVID aumenta

    // --- Eclosión de mosquitos post-lluvia ---
    eclosion_delay_days: 7,         // Días hasta que criaderos producen mosquitos
    eclosion_effect_days: 5,        // Días que dura el efecto (spawn ×3)

    // --- Impacto en contagio por clima ---
    K_clima_hot_exterior: 0.50,     // Reducción de contagio aéreo con T>30 en exterior
    K_humidity_mosquito_low: 1.5,   // Mortalidad mosquito aumentada con H<75%
    K_humidity_mosquito_high: 0.70, // Mortalidad mosquito reducida con H>75%

    // --- Comportamiento de agentes bajo lluvia ---
    rain_exit_modifier: 0.30        // Agentes libres: prob_salir × 0.30 si llueve
};

/**
 * Funciones de cálculo climático (sinusoidal)
 * Usadas por ClimateEngine.update(hour) en engine/climate.js
 */

/** Temperatura en °C para una hora dada del día */
export function getTemperature(hour) {
    return CLIMATE.T_avg + CLIMATE.T_amplitude * Math.sin(
        (hour - CLIMATE.T_phase_offset) * Math.PI / 12
    );
}

/** Humedad en % para una hora dada del día (inversa a temperatura) */
export function getHumidity(hour) {
    return CLIMATE.H_avg - CLIMATE.H_amplitude * Math.sin(
        (hour - CLIMATE.T_phase_offset) * Math.PI / 12
    );
}

/**
 * Evalúa si llueve en esta hora
 * @param {number} hour - Hora del día (0-23)
 * @param {string} season - 'dry' | 'wet'
 * @returns {boolean}
 */
export function evaluateRain(hour, season) {
    // Solo llueve entre 13:00 y 18:00 (convectiva tropical)
    if (hour < CLIMATE.rain_window_start || hour > CLIMATE.rain_window_end) {
        return false;
    }
    const dailyProb = season === 'wet' ? CLIMATE.rain_prob_wet : CLIMATE.rain_prob_dry;
    const windowHours = CLIMATE.rain_window_end - CLIMATE.rain_window_start;
    const hourlyProb = dailyProb / windowHours;
    return Math.random() < hourlyProb;
}
