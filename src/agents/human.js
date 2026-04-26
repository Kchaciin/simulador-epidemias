// ============================================
// Agente Humano
// Responsable: Kendall Chacín
// Fuente: Modelado §6.2 — Guía Kendall + §2.2 Rutinas
// ============================================

import { Agent } from './agent.js';
import { SPEEDS, ROUTINES, applyVariance, decideSalida } from '../config/routines.js';

/**
 * Agente humano con rutinas diarias, sistema de estados SEIR
 * y tracking de contagios para R_eff.
 *
 * Roles: 'student' | 'worker' | 'free'
 * Estados: S, E, I, I1, I2, R, D, V, L (L solo en TB)
 */
export class Human extends Agent {
    /**
     * @param {number} id - ID único
     * @param {string} role - 'student' | 'worker' | 'free'
     * @param {Object} homeNode - Nodo residencial asignado (objeto del array NODES)
     * @param {{ lat: number, lng: number }} position - Posición inicial
     */
    constructor(id, role, homeNode, position) {
        super(id, 'human', position);

        // --- Identidad ---
        this.role = role;                   // 'student' | 'worker' | 'free'
        this.homeNode = homeNode;           // Nodo residencial (ref al objeto)

        // --- Ubicación y movimiento ---
        this.currentNode = homeNode;        // Nodo donde está actualmente
        this.targetNode = null;             // Nodo destino (null = estático)
        this.inTransit = false;             // ¿Está caminando entre nodos?
        this.routeProgress = 0;             // Progreso en ruta actual (0.0 → 1.0)
        this.routeDuration = 0;             // Ticks que tarda la ruta actual

        // --- Trabajo (solo workers) ---
        this.workNode = null;               // Nodo de trabajo asignado

        // --- Estado de enfermedad ---
        this.isGrave = false;               // Caso grave → destino forzado Hospital
        this.isQuarantined = false;         // En cuarentena → estático en casa

        // --- Tracking de contagios (para R_eff) ---
        this.contagiosGenerados = 0;        // Cuántos susceptibles infectó este agente
        this.contagiadoPor = null;          // ID del agente que lo contagió (para cadenas)

        // --- Historial de estados (Feature: Foco en Agente) ---
        this.history = [{
            from: null,
            to: 'S',
            tick: 0,
            day: 0
        }];

        // --- Exposición acumulada (solo para TB — modelo SEIRL) ---
        // Map<agente_id, ticks_de_co-presencia>
        // Se limpia cada 48 ticks (agentes muertos) para evitar memory leak
        this.exposure = new Map();

        // --- Tratamiento ---
        this.cureState = null;              // null | 'dots_active' | 'dots_adverse' | 'worsened'
        this.treatmentTicks = 0;            // Ticks acumulados en tratamiento

        // --- Rutina con varianza ---
        // Pre-calcular las horas ajustadas para este agente (se recalculan cada día)
        this._scheduledActions = [];
        this._lastScheduleDay = -1;
    }

    /**
     * Calcula la velocidad actual del agente en km/h.
     * @param {Object} config - Config de la enfermedad activa
     * @returns {number} Velocidad en km/h
     */
    getSpeed(config) {
        if (!this.alive) return 0;
        if (this.isGrave) return SPEEDS.grave;
        if (['I', 'I1', 'I2'].includes(this.state)) {
            return SPEEDS.healthy * (config.v_sick || 0.50);
        }
        return SPEEDS.healthy;
    }

    /**
     * Evalúa qué debe hacer el agente en esta hora según su rutina.
     * Aplica varianza ±1 tick para comportamiento orgánico.
     *
     * @param {number} hour - Hora actual (0-23)
     * @param {number} day - Día actual
     * @param {Object} climate - Estado climático actual
     * @param {Object} config - Config de la enfermedad activa
     * @returns {{ action: string, destination: string|null }} Acción a tomar
     */
    evaluateRoutine(hour, day, climate, config) {
        // Los muertos y cuarentena no se mueven
        if (!this.alive) return { action: 'none', destination: null };
        if (this.isQuarantined) return { action: 'stay', destination: null };

        // Los infectados graves van directo al hospital
        if (this.isGrave && this.state === 'I') {
            return { action: 'move', destination: 'hospital' };
        }

        // Los infectados leves cancelan rutina, se quedan en casa (80%)
        if (this.state === 'I' && !this.isGrave) {
            return { action: 'stay_home', destination: null };
        }

        // Horas de dormir: estático en casa
        if (hour >= 20 || hour < 6) {
            return { action: 'sleep', destination: null };
        }

        // Cuando llueve: buscar nodo cerrado más cercano
        if (climate.isRaining && this.inTransit) {
            return { action: 'seek_shelter', destination: null };
        }

        // Recalcular horario con varianza cada día
        if (this._lastScheduleDay !== day) {
            this._scheduleDay(day);
        }

        // Buscar la acción correspondiente a esta hora
        const scheduled = this._scheduledActions.find(a => a.hour === hour);
        if (!scheduled) return { action: 'none', destination: null };

        // maybe_move para agentes libres
        if (scheduled.action === 'maybe_move') {
            const salir = decideSalida(scheduled.prob_exit, climate.isRaining);
            if (!salir) return { action: 'stay', destination: null };
        }

        // Resolver destino probabilístico
        const dest = this._resolveDestination(scheduled);
        return { action: 'move', destination: dest };
    }

    /**
     * Pre-calcula el horario del día aplicando varianza a cada hora base.
     * @param {number} day - Día actual
     * @private
     */
    _scheduleDay(day) {
        const routine = ROUTINES[this.role] || [];
        this._scheduledActions = routine.map(entry => ({
            ...entry,
            hour: applyVariance(entry.hour, entry.variance || 0)
        }));
        this._lastScheduleDay = day;
    }

    /**
     * Resuelve un destino cuando hay opciones probabilísticas.
     * @param {Object} entry - Entrada de rutina
     * @returns {string} ID del nodo destino
     * @private
     */
    _resolveDestination(entry) {
        const dest = entry.destination;

        // Destino fijo (string)
        if (typeof dest === 'string') {
            if (dest === 'home') return this.homeNode.id;
            if (dest === 'work') return this.workNode?.id || this.homeNode.id;
            return dest;
        }

        // Destino probabilístico (array)
        if (Array.isArray(dest)) {
            const probs = entry.prob || dest.map(() => 1 / dest.length);
            const roll = Math.random();
            let cumulative = 0;
            for (let i = 0; i < dest.length; i++) {
                cumulative += probs[i];
                if (roll < cumulative) {
                    const d = dest[i];
                    if (d === 'home') return this.homeNode.id;
                    if (d === 'work') return this.workNode?.id || this.homeNode.id;
                    return d;
                }
            }
            // Fallback al último
            const last = dest[dest.length - 1];
            return last === 'home' ? this.homeNode.id : last;
        }

        return this.homeNode.id;
    }

    /**
     * Inicia el tránsito hacia un nodo destino.
     * @param {Object} targetNode - Nodo destino (objeto)
     * @param {number} estimatedTicks - Ticks estimados para llegar
     */
    startTransit(targetNode, estimatedTicks) {
        this.targetNode = targetNode;
        this.inTransit = true;
        this.routeProgress = 0;
        this.routeDuration = Math.max(1, estimatedTicks);
    }

    /**
     * Avanza el progreso de ruta por 1 tick.
     * @returns {boolean} true si llegó al destino
     */
    advanceRoute() {
        if (!this.inTransit || !this.targetNode) return false;

        this.routeProgress += 1 / this.routeDuration;

        if (this.routeProgress >= 1.0) {
            // Llegó al destino
            this.currentNode = this.targetNode;
            this.position = { lat: this.targetNode.lat, lng: this.targetNode.lng };
            this.targetNode = null;
            this.inTransit = false;
            this.routeProgress = 0;
            return true;
        }

        // Interpolar posición (lineal por ahora, Daniel usa turf.along() después)
        if (this.currentNode && this.targetNode) {
            const t = this.routeProgress;
            this.position = {
                lat: this.currentNode.lat + (this.targetNode.lat - this.currentNode.lat) * t,
                lng: this.currentNode.lng + (this.targetNode.lng - this.currentNode.lng) * t
            };
        }

        return false;
    }
}
