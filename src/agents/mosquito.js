// ============================================
// Agente Mosquito
// Responsable: Kendall Chacín
// ============================================

import { Agent } from './agent.js';

/**
 * Agente mosquito (Aedes aegypti).
 * Se mueve con random walk, puede infectar y ser infectado.
 */
export class Mosquito extends Agent {
    constructor(id, spawnPosition) {
        super(id, 'mosquito', spawnPosition);
        this.spawnPosition = { ...spawnPosition }; // Punto de nacimiento
        this.ticksAlive = 0;                       // Edad en ticks
        this.ticksInState = 0;                     // Ticks en estado actual
        this.biteCooldown = 0;                     // Ticks restantes antes de picar otra vez
    }
}
