// ============================================
// Parámetros de Enfermedades
// Responsable: Ángel Colina
// ============================================

/**
 * COVID-19 — Modelo SEIR + D
 * Transmisión aérea por radio de proximidad (acumulativa por ticks)
 * P(contagio) = 1 - (1 - p_base · K_int · K_mask · K_clima)^n
 */
export const COVID_19 = {
    name: 'COVID-19',
    type: 'airborne',
    model: 'SEIR_D',

    // --- Contagio aéreo (modelo acumulativo) ---
    p_base: 0.05,                   // Prob. base por hora de contacto
    r_contagion_m: 1.5,             // Radio de contagio en metros
    r_mask_m: 0.75,                 // Radio con mascarilla (50% del base)
    K_interior: 2.0,                // ×2 en espacio cerrado (is_closed = true)
    K_mask: 0.30,                   // Con mascarillas: prob. reducida al 30%

    // --- Tiempos clínicos ---
    d_inc: 5,                       // Días de incubación E→I (120 ticks)
    d_rec: 14,                      // Días de enfermedad I→R|D (336 ticks)
    alpha: 0.02,                    // Letalidad total: 2% (distribución cuadrática)

    // --- Gravedad y movimiento ---
    p_grave: 0.20,                  // 20% de infectados → caso grave (Hospital)
    v_sick: 0.50,                   // Velocidad infectado: 50% del base (2.5 km/h)

    // --- Intervenciones ---
    q_rate: 0.80,                   // 80% se quedan en casa con cuarentena
    v_coverage: 0.60,               // Cobertura de vacunación configurable

    // --- Config general ---
    has_mosquitoes: false,
    interventions: ['masks', 'quarantine', 'vaccination', 'treatment']
};

/**
 * Dengue — Modelo SEIR Vectorial + D
 * Transmisión por mosquito Aedes aegypti (evento discreto, no acumulativo)
 * El mosquito pica → 1 dado p_mh → falla sin acumular → cooldown 4 ticks
 */
export const DENGUE = {
    name: 'Dengue',
    type: 'vector',
    model: 'SEIR_VECTOR_D',

    // --- Contagio vectorial (evento discreto) ---
    p_mh: 0.50,                     // Prob. contagio Mosquito → Humano por picadura
    p_hm: 0.50,                     // Prob. contagio Humano → Mosquito por picadura

    // --- Tiempos clínicos humanos ---
    d_inc_h: 7,                     // Días incubación humana (168 ticks)
    d_inc_m: 10,                    // Días incubación extrínseca en mosquito (240 ticks)
    d_rec: 7,                       // Días de enfermedad (168 ticks)
    alpha: 0.001,                   // Letalidad 0.1% (Dengue clásico)
    v_sick: 0.50,                   // Velocidad infectado: 50% del base

    // --- Parámetros del mosquito Aedes aegypti ---
    mosquito_life: 20,              // Días de vida promedio
    mosquito_mortality: 0.05,       // Mortalidad diaria (1/20)
    spawn_rate: 3,                  // Mosquitos/día/nodo con agua (base sin lluvia)
    rain_multiplier: 3.0,           // ×3 spawn con lluvia
    eclosion_delay: 7,              // Días para eclosión post-lluvia
    flight_radius_m: 100,           // Radio de vuelo en metros (rango real 50-200m)
    attraction_radius_m: 5,         // Radio detección CO₂ humano en metros
    bite_cooldown_ticks: 4,         // Ticks entre picaduras (24h/4h = 6 máx/día)

    // --- Intervenciones vectoriales ---
    fumigation_efficacy: 0.80,      // 80% de mosquitos eliminados al fumigar
    breeding_reduction: 0.50,       // 50% reducción permanente de spawn rate
    fumigation_cooldown: 72,        // Ticks de cooldown entre fumigaciones (3 días)

    // --- Config general ---
    has_mosquitoes: true,
    interventions: ['fumigation', 'breeding_removal', 'treatment']
};

/**
 * Fiebre Amarilla — Modelo SIRD + V con bifurcación
 * I₁ (aguda, 4 días) → 85% R / 15% I₂ (tóxica, 8 días) → 50% R / 50% D
 * Letalidad total efectiva: 0.15 × 0.50 = 7.5%
 */
export const YELLOW_FEVER = {
    name: 'Fiebre Amarilla',
    type: 'vector',
    model: 'SIRD_V_BIFURCATION',
    p_mh: 0.50,
    v_coverage: 0.60,
    d_inc: 5,                       // días (120 ticks)
    d_acute: 4,                     // días fase aguda (96 ticks)
    d_toxic: 8,                     // días fase tóxica (192 ticks)
    p_acute_to_r: 0.85,             // Evaluada exactamente en tick 96
    p_acute_to_toxic: 0.15,         // El 15% restante entra en I₂
    alpha_toxic: 0.50,              // Letalidad en fase tóxica (cuadrática)
    v_sick: 0.50,                   // Velocidad del infectado: 50% del base
    mosquito_life: 20,              // días de vida del mosquito
    mosquito_mortality: 0.05,       // por día (0.05/24 ≈ 0.002/tick)
    spawn_rate: 3,                  // mosquitos/día/nodo con agua
    rain_multiplier: 3.0,           // ×3 spawn con lluvia
    eclosion_delay: 7,              // días para eclosión post-lluvia
    flight_radius_m: 100,           // metros — radio de vuelo del Aedes
    attraction_radius_m: 5,         // metros — radio de detección CO₂
    bite_cooldown_ticks: 4,         // ticks entre picaduras (24h/4h = 6 max/día)
    fumigation_efficacy: 0.80,
    breeding_reduction: 0.50,
    has_mosquitoes: true,
    interventions: ['vaccination', 'fumigation', 'breeding_removal', 'treatment']
};

/**
 * Tuberculosis — Modelo SEIRL + D
 * Cadena de Markov: S → L(90%) | E(10%), L →(0.002/tick) E → I → R(85%) | D(15%)
 * Estado L = LTBI (Latent Tuberculosis Infection) — portadores sin síntomas
 * Transmisión por exposición acumulada en interiores (≥5h de co-presencia)
 */
export const TUBERCULOSIS = {
    name: 'Tuberculosis',
    type: 'airborne',
    model: 'SEIRL_D',

    // --- Transmisión (modelo de exposición acumulada) ---
    p_base: 0.03,                   // Prob. por tick superado el umbral
    r_contagion_m: 2.0,             // Radio de aerosoles en metros
    t_min_exposure: 5,              // Ticks mínimos de co-presencia (5 horas)
    K_interior: 4.0,                // ×4 en interior sin ventilación
    K_UV: 0.05,                     // Exterior con UV: riesgo al 5%
    K_vent: 0.40,                   // Con ventilación activa: riesgo al 40%
    K_mask: 0.10,                   // N95: reduce al 10% (90% reducción)

    // --- Cadena de Markov SEIRL ---
    f_latente: 0.90,                // 90% de nuevos infectados → L (LTBI)
    p_activacion_ltbi: 0.002,       // Prob. activación LTBI por tick (acelerada para sim)
    d_inc: 60,                      // Días de incubación E→I (1440 ticks)
    d_inc_variance: 0.25,           // ±25% varianza en incubación
    d_pre: 30,                      // Días pre-diagnóstico infecciosos (720 ticks)
    d_pre_factor: 0.50,             // Contagia al 50% de tasa durante d_pre
    d_rec: 180,                     // Días de enfermedad activa sin tratamiento (4320 ticks)

    // --- Mortalidad y gravedad ---
    alpha: 0.15,                    // Letalidad total sin tratamiento: 15% (OMS 2023)
    p_grave: 0.30,                  // Prob. hospitalización
    v_sick: 0.70,                   // Velocidad infectado: 70% del base (fatiga leve)

    // --- Reinfección (modelo SEIRS parcial) ---
    p_reinfection: 0.40,            // Inmunidad parcial: 40% de R puede volver a S

    // --- Vacuna BCG ---
    vaccine_name: 'BCG',
    vaccine_efficacy: 0.70,         // Eficacia BCG contra TB activa
    vaccine_coverage: 0.80,         // Cobertura BCG en Venezuela (MPPS 2022)

    // --- Tratamiento DOTS ---
    treatment: {
        name: 'DOTS',
        description: 'Rifampicina + Isoniazida + Pirazinamida + Etambutol',
        type: 'verified',
        duration_days: 180,         // 4320 ticks
        efficacy_cure: 0.95,        // 95% curación si se completa
        adverse_risk: 0.05,         // 5% toxicidad hepática
        // Reducción progresiva de alpha durante DOTS
        alpha_reduction_phases: [
            { until_tick: 720,  factor: 0.70 },   // Días 1-30:  alpha × 0.70
            { until_tick: 2160, factor: 0.40 },    // Días 31-90: alpha × 0.40
            { until_tick: 4320, factor: 0.10 }     // Días 91-180: alpha × 0.10
        ]
    },

    // --- Config general ---
    has_mosquitoes: false,
    interventions: ['vaccination', 'masks', 'quarantine', 'dots'],
    recommended_speed: 20,          // ×20 para demo (ciclo completo en ~3.6 min)
    recommended_max_days: 365       // Default 365 días para TB
};

/**
 * Diccionario de enfermedades preset
 */
export const PRESET_DISEASES = {
    covid_19: COVID_19,
    dengue: DENGUE,
    yellow_fever: YELLOW_FEVER,
    tuberculosis: TUBERCULOSIS
};

/**
 * Genera un objeto de config para Enfermedad X (v2.0 futuro)
 * @param {Object} formData - Datos del formulario de creación
 */
export function createDiseaseX(formData) {
    return { ...formData, is_custom: true };
}
