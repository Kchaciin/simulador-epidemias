// ============================================
// Agente Humano
// Responsable: Kendall Chacín
// ============================================

import { Agent } from './agent.js';

/**
 * Agente humano con rutinas diarias y sistema de estados SEIR.
 */
export class Human extends Agent {
    constructor(id, role, homeNode, position) {
        super(id, 'human', position);
        this.role = role;               // 'student' | 'worker' | 'free'
        this.homeNode = homeNode;       // Nodo residencial asignado
        this.currentNode = homeNode;    // Nodo actual
        this.targetNode = null;         // Nodo destino
        this.inTransit = false;         // Caminando entre nodos
        this.distanceTraveled = 0;      // Progreso en la ruta actual
        this.workNode = null;           // Solo para workers
        
        // Estado de enfermedad
        this.ticksInState = 0;          // Ticks acumulados en el estado actual
        this.isGrave = false;           // Caso grave → va al hospital
    }
}
