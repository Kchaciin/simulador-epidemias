// ============================================
// Parámetros de Enfermedades
// Responsable: Ángel Colina
// ============================================

/**
 * COVID-19 — Modelo SEIR + D
 * Transmisión aérea por radio de proximidad
 */
export const COVID_19 = {
    name: 'COVID-19',
    type: 'airborne',
    model: 'SEIR_D',
    p_base: 0.05,
    r_contagion: 1.5,
    r_mask: 0.75,
    mask_reduction: 0.70,
    d_inc: 5,
    d_rec: 14,
    alpha: 0.02,
    p_grave: 0.20,
    v_sick: 0.50,
    q_rate: 0.80,
    v_coverage: 0.60,
    has_mosquitoes: false,
    interventions: ['masks', 'quarantine', 'vaccination', 'treatment']
};

/**
 * Dengue — Modelo SEIR Vectorial + D
 * Transmisión por mosquito Aedes aegypti
 */
export const DENGUE = {
    name: 'Dengue',
    type: 'vector',
    model: 'SEIR_VECTOR_D',
    p_mh: 0.50,
    p_hm: 0.50,
    d_inc_h: 7,
    d_inc_m: 10,
    d_rec: 7,
    alpha: 0.001,
    mosquito_life: 20,
    mosquito_mortality: 0.05,
    spawn_rate: 3,
    rain_multiplier: 3.0,
    eclosion_delay: 7,
    flight_radius: 50,
    attraction_radius: 20,
    bite_cooldown: 6,
    fumigation_efficacy: 0.80,
    breeding_reduction: 0.50,
    has_mosquitoes: true,
    interventions: ['fumigation', 'breeding_removal', 'treatment']
};

/**
 * Fiebre Amarilla — Modelo SIRD + V con bifurcación
 * I₁ (aguda) → 85% R / 15% I₂ (tóxica) → 50% R / 50% D
 */
export const YELLOW_FEVER = {
    name: 'Fiebre Amarilla',
    type: 'vector',
    model: 'SIRD_V_BIFURCATION',
    p_mh: 0.50,
    v_coverage: 0.60,
    d_inc: 5,
    d_acute: 4,
    d_toxic: 8,
    p_acute_to_r: 0.85,
    p_acute_to_toxic: 0.15,
    alpha_toxic: 0.50,
    mosquito_life: 20,
    mosquito_mortality: 0.05,
    spawn_rate: 3,
    rain_multiplier: 3.0,
    eclosion_delay: 7,
    flight_radius: 50,
    attraction_radius: 20,
    bite_cooldown: 6,
    fumigation_efficacy: 0.80,
    breeding_reduction: 0.50,
    has_mosquitoes: true,
    interventions: ['vaccination', 'fumigation', 'breeding_removal', 'treatment']
};

/**
 * Genera un objeto de config para Enfermedad X
 * @param {Object} formData - Datos del formulario de creación
 */
export function createDiseaseX(formData) {
    return { ...formData, is_custom: true };
}
