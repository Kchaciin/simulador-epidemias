// ============================================
// Datos de Tratamientos
// Responsable: Ángel Colina
// ============================================

export const TREATMENTS = {
    verified: {
        name: 'Verificado',
        efficacy: 0.90,
        risk: 'none',
        immunity_type: 'total',
        scenarios: ['A', 'B']
    },
    experimental: {
        name: 'Experimental',
        efficacy: 0.25,
        risk: 'high',
        immunity_type: 'partial',
        adverse_prob: 0.15,
        scenarios: ['A', 'B', 'C', 'D']
    },
    none: {
        name: 'Inexistente',
        efficacy: 0,
        risk: 'none',
        scenarios: []
    }
};
