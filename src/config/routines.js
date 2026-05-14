// ============================================
// Rutinas Diarias de Agentes
// Responsable: Ángel Colina
// ============================================

export const ROUTINES = {
    student: [
        { hour: 6, action: 'move', destination: 'uney' },
        { hour: 12, action: 'move', destination: ['mercado', 'plaza'], prob: [0.5, 0.5] },
        { hour: 13, action: 'move', destination: 'uney' },
        { hour: 17, action: 'move', destination: ['plaza', 'home'], prob: [0.3, 0.7] },
        { hour: 19, action: 'move', destination: 'home' }
    ],
    worker: [
        { hour: 6, action: 'move', destination: ['gobernacion', 'mercado'], prob: [0.6, 0.4] },
        { hour: 12, action: 'move', destination: ['mercado', 'plaza'], prob: [0.5, 0.5] },
        { hour: 13, action: 'move', destination: 'work' },
        { hour: 17, action: 'move', destination: ['mercado', 'home'], prob: [0.2, 0.8] },
        { hour: 19, action: 'move', destination: 'home' }
    ],
    free: [
        { hour: 8, action: 'maybe_move', prob: 0.6, destination: ['mercado', 'plaza'], prob_dest: [0.4, 0.6] },
        { hour: 11, action: 'move', destination: 'home' },
        { hour: 14, action: 'maybe_move', prob: 0.4, destination: ['plaza', 'terminal'], prob_dest: [0.5, 0.5] },
        { hour: 17, action: 'move', destination: 'home' }
    ]
};

export const SPEEDS = {
    healthy: 50,
    exposed: 50,
    infected: 25,
    grave: 15,
    recovered: 50,
    vaccinated: 50
};

export const AGENT_DISTRIBUTION = {
    student: 0.40,
    worker: 0.40,
    free: 0.20
};
