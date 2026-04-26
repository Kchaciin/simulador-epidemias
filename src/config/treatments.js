// ============================================
// Datos de Tratamientos por Enfermedad
// Responsable: Ángel Colina
// Fuente: Modelado §4 — Tratamiento
// ============================================

/**
 * Clasificación de tratamientos:
 * - Verificado: Aprobado, eficacia predecible (80-95%), sin escenarios C/D
 * - Experimental: Impredecible (10-60%), puede desencadenar escenarios C/D
 * - Inexistente: Sin tratamiento disponible (solo Disease Builder v2.0)
 */

// ============================================
// COVID-19 — Tratamientos
// ============================================
export const COVID_TREATMENTS = {
    vaccine: {
        name: 'Vacuna ARNm',
        type: 'verified',
        application: 'preventive',     // S → V
        efficacy: 0.95,                // P_A: 95% éxito
        p_neutral: 0.05,              // P_B: 5% sin efecto
        p_worsen: 0,                  // P_C: 0% (verificado)
        p_lethal: 0,                  // P_D: 0% (verificado)
        immunity_type: 'total',
        scenarios: ['A', 'B']
    },
    antiviral: {
        name: 'Antiviral + Soporte',
        type: 'experimental',
        application: 'reactive',       // I → R (si funciona)
        efficacy: 0.70,                // P_A: 70% éxito
        p_neutral: 0.25,              // P_B: 25% sin efecto
        p_worsen: 0.04,               // P_C: 4% empeora
        p_lethal: 0.01,               // P_D: 1% letalidad inducida
        immunity_type: 'total',
        // Efectos del Escenario C
        worsen_radius_factor: 1.5,     // Radio de contagio × 1.5
        worsen_prob_factor: 1.3,       // Prob. de contagio × 1.3
        scenarios: ['A', 'B', 'C', 'D']
    }
};

// ============================================
// Dengue — Tratamientos
// ============================================
export const DENGUE_TREATMENTS = {
    supportive: {
        name: 'Soporte (Solución Salina Normal)',
        type: 'verified',
        application: 'reactive',
        efficacy: 0.90,                // P_A: 90% éxito
        p_neutral: 0.10,              // P_B: 10% sin efecto
        p_worsen: 0,
        p_lethal: 0,
        immunity_type: 'total',
        scenarios: ['A', 'B']
    }
};

// ============================================
// Fiebre Amarilla — Tratamientos
// ============================================
export const YELLOW_FEVER_TREATMENTS = {
    vaccine: {
        name: 'Vacuna 17D (Antiamarílica)',
        type: 'verified',
        application: 'preventive',     // S → V
        efficacy: 0.99,                // P_A: 99% éxito
        p_neutral: 0.01,
        p_worsen: 0,
        p_lethal: 0,
        immunity_type: 'total',
        scenarios: ['A', 'B']
    },
    antiviral_exp: {
        name: 'Antiviral Experimental',
        type: 'experimental',
        application: 'reactive',
        efficacy: 0.60,                // P_A: 60% éxito
        p_neutral: 0.25,              // P_B: 25% sin efecto
        p_worsen: 0.10,               // P_C: 10% empeora
        p_lethal: 0.05,               // P_D: 5% letalidad
        immunity_type: 'total',
        worsen_radius_factor: 1.5,
        worsen_prob_factor: 1.3,
        scenarios: ['A', 'B', 'C', 'D']
    }
};

// ============================================
// Tuberculosis — Tratamientos
// ============================================
export const TB_TREATMENTS = {
    bcg: {
        name: 'Vacuna BCG',
        type: 'verified',
        application: 'preventive',     // S → V (BCG)
        efficacy: 0.70,                // 70% eficacia contra TB activa
        p_neutral: 0.30,
        p_worsen: 0,
        p_lethal: 0,
        immunity_type: 'total',
        scenarios: ['A', 'B']
    },
    dots: {
        name: 'DOTS (Tratamiento Directamente Observado)',
        type: 'verified',
        application: 'reactive',       // Tratamiento crónico para I activos
        is_chronic: true,              // ← Flag especial: NO es dado único
        duration_days: 180,            // 4320 ticks
        efficacy_cure: 0.95,           // 95% curación si se completa
        adverse_risk: 0.05,            // 5% toxicidad hepática
        description: 'Rifampicina + Isoniazida + Pirazinamida + Etambutol',

        /**
         * Reducción progresiva de alpha (tasa de letalidad) durante DOTS:
         *   Días  1-30  (ticks 0-720):    alpha × 0.70 (reducción 30%)
         *   Días 31-90  (ticks 721-2160):  alpha × 0.40 (reducción 60%)
         *   Días 91-180 (ticks 2161-4320): alpha × 0.10 (reducción 90%)
         */
        alpha_phases: [
            { max_tick: 720,  factor: 0.70 },
            { max_tick: 2160, factor: 0.40 },
            { max_tick: 4320, factor: 0.10 }
        ],

        scenarios: ['A', 'B']          // Verificado → nunca C ni D
    }
};

// ============================================
// Mapa de tratamientos por enfermedad
// ============================================
export const TREATMENTS_BY_DISEASE = {
    covid_19: COVID_TREATMENTS,
    dengue: DENGUE_TREATMENTS,
    yellow_fever: YELLOW_FEVER_TREATMENTS,
    tuberculosis: TB_TREATMENTS
};

// ============================================
// Escenarios de resultado (referencia)
// ============================================
export const SCENARIOS = {
    A: { name: 'Funciona',        icon: '✅', description: 'El tratamiento cumple su objetivo' },
    B: { name: 'No funciona',     icon: '⚪', description: 'Placebo — el virus sigue su curso' },
    C: { name: 'Empeora',         icon: '⚠️', description: 'Radio y prob. de contagio aumentan' },
    D: { name: 'Letalidad',       icon: '☠️', description: 'El agente muere inmediatamente' }
};
