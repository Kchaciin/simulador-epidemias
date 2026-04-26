// ============================================
// Motor de Simulación — Game Loop Principal
// Responsable: Kendall Chacín
// Fuente: Modelado §5.0 Motor + §6.2 Guía Kendall
// ============================================

import { Human } from '../agents/human.js';
import { Mosquito } from '../agents/mosquito.js';
import { ClimateEngine } from './climate.js';
import { NODES } from '../config/nodes.js';
import { AGENT_DISTRIBUTION, SPEEDS } from '../config/routines.js';
import {
    evaluateAirborneContagion,
    evaluateVectorContagion,
    evaluateQuadratic
} from './collision.js';

let _agentIdCounter = 0;
let _mosquitoIdCounter = 0;

export class Simulation {
    /**
     * @param {Object} config - Config de la enfermedad activa (de diseases.js)
     * @param {Object} options - { population, initialInfected, season, maxDays, speedMultiplier }
     */
    constructor(config, options = {}) {
        this.config = config;
        this.options = {
            population: options.population ?? 100,
            initialInfected: options.initialInfected ?? 3,
            season: options.season ?? 'dry',
            maxDays: options.maxDays ?? 90,
            speedMultiplier: options.speedMultiplier ?? 1,
            vaccinationCoverage: options.vaccinationCoverage ?? 0,
            masksActive: options.masksActive ?? false,
            outbreakZone: options.outbreakZone ?? 'random',
        };

        // --- Estado del reloj ---
        this.tick = 0;
        this.hour = 0;
        this.day = 0;

        // --- Agentes ---
        this.humans = [];
        this.mosquitoes = [];

        // --- Subsistemas ---
        this.climate = new ClimateEngine(this.options.season);

        // --- Estado de intervenciones ---
        this.interventions = {
            masksActive: this.options.masksActive,
            quarantineActive: false,
            fumigationCooldown: 0,
            dotsActive: false,
        };

        // --- Control del loop ---
        this.running = false;
        this._intervalId = null;

        // --- Métricas para R_eff ---
        this._recentContagions = [];   // [{ tick }]
        this._infectedAt = new Map(); // agente_id → tick en que se infectó

        // --- Timeline de eventos (Feature: Timeline) ---
        this.events = [];
        this._firstInfectedEmitted = false;

        // --- Callbacks ---
        this._onTick = null;
        this._onEnd = null;
    }

    // ─────────────────────────────────────────
    // API pública (para Jorge y Daniel)
    // ─────────────────────────────────────────

    onTick(cb) { this._onTick = cb; }
    onEnd(cb)  { this._onEnd = cb; }

    start() {
        this._spawnAgents();
        this._applyInitialVaccination();
        this.running = true;
        this._scheduleLoop();
        this._emitEvent('Inicio de simulación');
    }

    pause()  { this.running = false; clearInterval(this._intervalId); }
    resume() { this.running = true; this._scheduleLoop(); }
    stop()   { this.running = false; clearInterval(this._intervalId); }

    setSpeed(multiplier) {
        this.options.speedMultiplier = multiplier;
        if (this.running) { clearInterval(this._intervalId); this._scheduleLoop(); }
    }

    /** Estadísticas actuales — Jorge las usa en dashboard.js */
    getStats() {
        const counts = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0, L: 0 };
        for (const h of this.humans) counts[h.state] = (counts[h.state] ?? 0) + 1;

        const mosqAlive    = this.mosquitoes.filter(m => m.alive).length;
        const mosqInfected = this.mosquitoes.filter(m => m.alive && m.state === 'I').length;

        return {
            ...counts,
            population: this.humans.filter(h => h.alive).length,
            mosquitoes_alive: mosqAlive,
            mosquitoes_infected: mosqInfected,
            day: this.day,
            hour: this.hour,
            tick: this.tick,
            climate: this.climate.getState(),
            r_eff: this._calcReff(),
            events: this.events,
        };
    }

    /** Array de agentes para renderer.js (Daniel) */
    getAgents()     { return this.humans.filter(h => h.alive); }
    getMosquitoes() { return this.mosquitoes.filter(m => m.alive); }

    // ─────────────────────────────────────────
    // Intervenciones
    // ─────────────────────────────────────────

    applyVaccination(coverage = this.config.v_coverage ?? 0.60) {
        const susceptibles = this.humans.filter(h => h.alive && h.state === 'S');
        const count = Math.floor(susceptibles.length * coverage);
        for (let i = 0; i < count; i++) {
            susceptibles[i].changeState('V', this.tick);
        }
        this._emitEvent(`Vacunación (${Math.round(coverage * 100)}%)`);
    }

    applyQuarantine() {
        this.interventions.quarantineActive = true;
        const rate = this.config.q_rate ?? 0.80;
        for (const h of this.humans) {
            if (!h.alive) continue;
            if (h.role === 'worker' && Math.random() > rate) continue; // esenciales
            h.isQuarantined = Math.random() < rate;
        }
        this._emitEvent('Cuarentena activada');
    }

    applyMasks() {
        this.interventions.masksActive = true;
        this._emitEvent('Mascarillas activadas');
    }

    applyFumigation() {
        if (this.interventions.fumigationCooldown > 0) return;
        const efficacy = this.config.fumigation_efficacy ?? 0.80;
        let killed = 0;
        for (const m of this.mosquitoes) {
            if (m.alive && Math.random() < efficacy) { m.alive = false; killed++; }
        }
        this.interventions.fumigationCooldown = this.config.fumigation_cooldown ?? 72;
        this._emitEvent(`Fumigación (${killed} mosquitos eliminados)`);
    }

    applyBreedingRemoval() {
        // Reduce spawn rate permanentemente — el SpawnEngine lo lee
        this.config._breedingReductionApplied =
            (this.config._breedingReductionApplied ?? 1.0) * (1 - (this.config.breeding_reduction ?? 0.50));
        this._emitEvent('Eliminación de criaderos');
    }

    applyTreatment(type = 'verified') {
        if (type === 'dots' && this.config.model === 'SEIRL_D') {
            this.interventions.dotsActive = true;
            for (const h of this.humans) {
                if (h.alive && h.state === 'I') h.cureState = 'dots_active';
            }
            this._emitEvent('DOTS iniciado');
            return;
        }
        // Tratamiento estándar (evaluarTratamiento)
        const infected = this.humans.filter(h => h.alive && ['I', 'I1', 'I2'].includes(h.state));
        for (const h of infected) this._applyTreatmentToAgent(h, type);
        this._emitEvent(`Tratamiento ${type} aplicado`);
    }

    // ─────────────────────────────────────────
    // Game Loop
    // ─────────────────────────────────────────

    _scheduleLoop() {
        // 1000ms ÷ speedMultiplier = intervalo en ms
        const intervalMs = Math.max(16, Math.round(1000 / this.options.speedMultiplier));
        this._intervalId = setInterval(() => this._runTick(), intervalMs);
    }

    _runTick(forced = false) {
        if (!this.running && !forced) return;

        // 1 — Avanzar reloj
        this.hour++;
        if (this.hour >= 24) { this.hour = 0; this.day++; }
        this.tick++;

        // 2 — Actualizar clima
        this.climate.update(this.hour, this.tick);

        // 3 — Reducir cooldowns
        if (this.interventions.fumigationCooldown > 0) this.interventions.fumigationCooldown--;

        // 4 — Procesar humanos
        this._processHumans();

        // 5 — Procesar mosquitos (solo enfermedades vectoriales)
        if (this.config.has_mosquitoes) {
            this._processMosquitoes();
            this._spawnMosquitoes();
        }

        // 6 — Contagio
        this._processContagion();

        // 7 — Condición de fin
        if (this._checkEndCondition()) return;

        // 8 — Emitir stats
        if (this._onTick) this._onTick(this.getStats());
    }

    // ─────────────────────────────────────────
    // Procesado de humanos por tick
    // ─────────────────────────────────────────

    _processHumans() {
        for (const h of this.humans) {
            if (!h.alive) continue;

            h.ticksInState++;

            // Avanzar ruta si está en tránsito
            if (h.inTransit) h.advanceRoute();

            // Evaluar rutina → ¿debe moverse?
            const { action, destination } = h.evaluateRoutine(
                this.hour, this.day, this.climate.getState(), this.config
            );

            if (action === 'move' && destination && !h.inTransit) {
                const destNode = NODES.find(n => n.id === destination);
                if (destNode) {
                    const speed = h.getSpeed(this.config); // km/h
                    // Estimación simple de ticks: 1 tick = 1h → velocidad ≈ ticks para 1km
                    const ticks = Math.max(1, Math.round(1 / speed));
                    h.startTransit(destNode, ticks);
                }
            }

            // Evaluar transiciones de estado
            this._evaluateStateTransitions(h);

            // DOTS progresivo (solo TB)
            if (h.cureState === 'dots_active') {
                h.treatmentTicks++;
                this._evaluateDOTS(h);
            }
        }
    }

    _evaluateStateTransitions(h) {
        const cfg = this.config;

        switch (h.state) {
            case 'E': {
                // E → I: determinista al tick d_inc × 24
                const incTicks = (cfg.d_inc ?? 5) * 24;
                if (h.ticksInState >= incTicks) {
                    // TB: 90% → L, 10% → I activo
                    if (cfg.model === 'SEIRL_D' && Math.random() < (cfg.f_latente ?? 0.90)) {
                        h.changeState('L', this.tick);
                    } else {
                        h.changeState('I', this.tick);
                        h.isGrave = Math.random() < (cfg.p_grave ?? 0.20);
                        this._infectedAt.set(h.id, this.tick);
                        // Evento: primer infectado sintomático
                        if (!this._firstInfectedEmitted) {
                            this._emitEvent('Primer infectado sintomático');
                            this._firstInfectedEmitted = true;
                        }
                    }
                }
                break;
            }

            case 'L': {
                // L (LTBI) → E: activación espontánea (solo TB)
                if (Math.random() < (cfg.p_activacion_ltbi ?? 0.002)) {
                    h.changeState('E', this.tick);
                }
                break;
            }

            case 'I': {
                const dRec = cfg.d_rec ?? 14;
                // I → D: distribución cuadrática (alpha = prob. total de muerte)
                if (evaluateQuadratic(h.ticksInState, dRec, cfg.alpha ?? 0.02)) {
                    h.changeState('D', this.tick);
                    break;
                }
                // I → R: distribución cuadrática
                // Prob. total de recuperación = 1.0 (certeza eventual)
                // La cuadrática distribuye CUÁNDO ocurre, concentrando al final
                // Solo evalúa si no murió este tick (ya hizo break arriba)
                if (evaluateQuadratic(h.ticksInState, dRec, 1.0)) {
                    h.changeState('R', this.tick);
                    this._trackContagios(h);
                    // TB: 40% de R vuelven a S (inmunidad parcial)
                    if (cfg.model === 'SEIRL_D' && Math.random() < (cfg.p_reinfection ?? 0.40)) {
                        h.changeState('S', this.tick);
                    }
                }
                break;
            }

            case 'I1': {
                // FA Fase aguda → bifurcación al completar d_acute días
                // Usa >= porque ticksInState ya se incrementó antes de llegar aquí
                if (h.ticksInState >= (cfg.d_acute ?? 4) * 24) {
                    if (Math.random() < (cfg.p_acute_to_r ?? 0.85)) {
                        h.changeState('R', this.tick);
                    } else {
                        h.changeState('I2', this.tick);
                    }
                }
                break;
            }

            case 'I2': {
                // FA Fase tóxica — muerte o recuperación con distribución cuadrática
                const dTox = cfg.d_toxic ?? 8;
                if (evaluateQuadratic(h.ticksInState, dTox, cfg.alpha_toxic ?? 0.50)) {
                    h.changeState('D', this.tick);
                } else if (evaluateQuadratic(h.ticksInState, dTox, 1.0)) {
                    h.changeState('R', this.tick);
                }
                break;
            }
        }

        // Limpieza del exposure map de TB cada 48 ticks
        if (this.tick % 48 === 0 && h.exposure.size > 0) {
            for (const [id] of h.exposure) {
                const agent = this.humans.find(a => a.id === id);
                if (!agent || !agent.alive) h.exposure.delete(id);
            }
        }
    }

    // ─────────────────────────────────────────
    // Contagio
    // ─────────────────────────────────────────

    _processContagion() {
        const climateState = this.climate.getState();
        const aliveHumans = this.humans.filter(h => h.alive);
        let newContagions = [];

        if (this.config.type === 'airborne') {
            // Enriquecer climateState con el método getAirborneModifier
            const climateWithMethod = {
                ...climateState,
                getAirborneModifier: (isClosed) => this.climate.getAirborneModifier(isClosed)
            };
            newContagions = evaluateAirborneContagion(
                aliveHumans, this.config, climateWithMethod, this.interventions, this.tick
            );
            for (const { susceptible, infector } of newContagions) {
                // S → E (inicio de incubación)
                const model = this.config.model;
                if (model === 'SEIRL_D') {
                    // TB: va directo a evaluación L/E en _evaluateStateTransitions cuando sea E
                    susceptible.changeState('E', this.tick);
                } else {
                    susceptible.changeState('E', this.tick);
                }
                susceptible.contagiadoPor = infector.id;
                infector.contagiosGenerados++;
                this._recentContagions.push({ tick: this.tick });
            }

        } else if (this.config.type === 'vector') {
            const { humanContagions, mosquitoContagions } = evaluateVectorContagion(
                aliveHumans, this.mosquitoes, this.config, this.tick
            );
            for (const { susceptible, mosquito } of humanContagions) {
                const newState = this.config.model === 'SIRD_V_BIFURCATION' ? 'E' : 'E';
                susceptible.changeState(newState, this.tick);
                this._recentContagions.push({ tick: this.tick });
            }
            for (const { susceptible: mosq } of mosquitoContagions) {
                mosq.changeState('E', this.tick);
            }
        }

        if (newContagions.length > 0 || this._recentContagions.length === 1) {
            const totalContagios = this._recentContagions.length;
            if (totalContagios === 1) this._emitEvent('Primer contagio');
        }
    }

    // ─────────────────────────────────────────
    // Mosquitos
    // ─────────────────────────────────────────

    _processMosquitoes() {
        for (const m of this.mosquitoes) {
            m.tick(this.climate.temperature, this.climate.humidity);
        }
        // Limpiar muertos periódicamente
        if (this.tick % 24 === 0) {
            this.mosquitoes = this.mosquitoes.filter(m => m.alive);
        }
    }

    _spawnMosquitoes() {
        const spawnNodes = NODES.filter(n => n.has_water);
        const baseRate = this.config.spawn_rate ?? 3; // por nodo por día
        const multiplier = this.climate.getSpawnMultiplier();
        const breedingFactor = this.config._breedingReductionApplied ?? 1.0;

        // Spawn diario: una vez al día (tick % 24 === 6)
        if (this.hour !== 6) return;

        const spawnPerNode = Math.round(baseRate * multiplier * breedingFactor);
        for (const node of spawnNodes) {
            for (let i = 0; i < spawnPerNode; i++) {
                const pos = { lat: node.lat, lng: node.lng };
                const mosq = new Mosquito(_mosquitoIdCounter++, pos, this.config);
                mosq.spawnNodeId = node.id;
                this.mosquitoes.push(mosq);
            }
        }
    }

    // ─────────────────────────────────────────
    // DOTS (Tuberculosis)
    // ─────────────────────────────────────────

    _evaluateDOTS(h) {
        const phases = this.config.treatment?.alpha_phases
            ?? [{ max_tick: 720, factor: 0.70 }, { max_tick: 2160, factor: 0.40 }, { max_tick: 4320, factor: 0.10 }];

        const phase = phases.find(p => h.treatmentTicks <= p.max_tick) ?? phases[phases.length - 1];
        const alphaReduced = (this.config.alpha ?? 0.15) * phase.factor;

        // Reevaluar muerte con alpha reducido
        if (evaluateQuadratic(h.ticksInState, this.config.d_rec ?? 180, alphaReduced)) {
            h.changeState('D', this.tick);
            return;
        }
        // Al completar 180 días: 95% curación
        if (h.treatmentTicks >= (this.config.treatment?.duration_days ?? 180) * 24) {
            if (Math.random() < (this.config.treatment?.efficacy_cure ?? 0.95)) {
                h.changeState('R', this.tick);
            }
        }
        // Riesgo adverso (toxicidad hepática)
        const adverseRisk = (this.config.treatment?.adverse_risk ?? 0.05) / 4320;
        if (Math.random() < adverseRisk) {
            h.cureState = 'dots_adverse';
        }
    }

    // ─────────────────────────────────────────
    // Tratamiento estándar (escenarios A-D)
    // ─────────────────────────────────────────

    _applyTreatmentToAgent(h, type) {
        const roll = Math.random();
        if (type === 'verified') {
            if (roll < 0.95) h.changeState('R', this.tick);   // A: cura
            // else B: neutro
        } else {
            // Experimental
            if (roll < 0.70) {
                h.changeState('R', this.tick);                 // A: cura
            } else if (roll < 0.74) {
                h.cureState = 'worsened';                      // C: empeora
                h._r_contagio_activo = (this.config.r_contagion_m ?? 1.5) * 1.5;
                h._p_contagio_activo = (this.config.p_base ?? 0.05) * 1.3;
            } else if (roll < 0.75) {
                h.changeState('D', this.tick);                 // D: muere
            }
            // else B: neutro
        }
    }

    // ─────────────────────────────────────────
    // Spawn inicial
    // ─────────────────────────────────────────

    _spawnAgents() {
        _agentIdCounter = 0;
        const residentialNodes = NODES.filter(n => n.type === 'residential');
        const workerNodes = NODES.filter(n => ['labor', 'educational'].includes(n.type));
        const N = this.options.population;
        const dist = AGENT_DISTRIBUTION;

        const nStudents = Math.round(N * dist.student);
        const nWorkers  = Math.round(N * dist.worker);
        const nFree     = N - nStudents - nWorkers;

        const roles = [
            ...Array(nStudents).fill('student'),
            ...Array(nWorkers).fill('worker'),
            ...Array(nFree).fill('free'),
        ];

        // Distribuir entre nodos residenciales
        roles.forEach((role, i) => {
            const homeNode = residentialNodes[i % residentialNodes.length];
            const pos = _jitter(homeNode.lat, homeNode.lng, homeNode.radius_m);
            const h = new Human(_agentIdCounter++, role, homeNode, pos);

            // Asignar workNode a workers
            if (role === 'worker' && workerNodes.length > 0) {
                const workIdx = Math.random() < 0.60 ? 0 : 1;
                h.workNode = workerNodes[workIdx % workerNodes.length];
            }
            this.humans.push(h);
        });

        // Infectar agentes iniciales
        const outbreakZone = this.options.outbreakZone;
        let candidates = [...this.humans];
        if (outbreakZone !== 'random') {
            const zoneMap = { norte: 'res_norte', sur: 'res_sur', este: 'res_este', oeste: 'res_oeste' };
            const zoneId = zoneMap[outbreakZone];
            if (zoneId) candidates = this.humans.filter(h => h.homeNode.id === zoneId);
        }
        const shuffled = candidates.sort(() => Math.random() - 0.5);
        const count = Math.min(this.options.initialInfected, shuffled.length);
        for (let i = 0; i < count; i++) {
            const firstState = this.config.model === 'SIRD_V_BIFURCATION' ? 'I1' : 'I';
            shuffled[i].changeState(firstState, 0);
            shuffled[i].isGrave = Math.random() < (this.config.p_grave ?? 0.20);
        }
    }

    _applyInitialVaccination() {
        const cov = this.options.vaccinationCoverage;
        if (cov > 0) this.applyVaccination(cov);
    }

    // ─────────────────────────────────────────
    // Condiciones de fin
    // ─────────────────────────────────────────

    _checkEndCondition() {
        // Tiempo límite
        if (this.day >= this.options.maxDays) {
            this._end('tiempo_limite');
            return true;
        }
        // Erradicación
        const active = ['E', 'I', 'I1', 'I2'];
        const hasActive = this.humans.some(h => active.includes(h.state));
        const hasLatent = this.config.model === 'SEIRL_D'
            && this.humans.some(h => h.state === 'L');
        const hasMosqVector = this.config.has_mosquitoes
            && this.mosquitoes.some(m => m.alive && ['E', 'I'].includes(m.state));

        if (!hasActive && !hasLatent && !hasMosqVector) {
            this._end('erradicacion');
            return true;
        }
        // Extinción (todos murieron o están en R/V)
        const anySusceptible = this.humans.some(h => h.alive && h.state === 'S');
        if (!anySusceptible && !hasActive) {
            this._end('extincion');
            return true;
        }
        return false;
    }

    _end(reason) {
        this.running = false;
        clearInterval(this._intervalId);
        this._emitEvent(`Simulación finalizada — ${reason}`);
        if (this._onEnd) this._onEnd({ reason, stats: this.getStats(), summary: this._buildSummary() });
    }

    // ─────────────────────────────────────────
    // R_eff y métricas
    // ─────────────────────────────────────────

    _calcReff() {
        const window = 48; // ticks
        const now = this.tick;
        const recent = this._recentContagions.filter(c => now - c.tick <= window).length;
        const activeAt24h = this.humans.filter(h => {
            const infTick = this._infectedAt.get(h.id);
            return infTick !== undefined && (now - infTick) >= 24;
        }).length;
        if (activeAt24h === 0) return null;
        return Math.round((recent / activeAt24h) * 100) / 100;
    }

    _trackContagios(h) {
        // Ya se registra en contagiosGenerados del infector durante _processContagion
    }

    _buildSummary() {
        const D = this.humans.filter(h => h.state === 'D').length;
        const R = this.humans.filter(h => h.state === 'R').length;
        const totalContagiados = this.humans.filter(h =>
            h.history.some(e => ['E', 'I', 'I1'].includes(e.to))
        ).length;
        const peakI = Math.max(...this.humans.map(h =>
            h.history.filter(e => e.to === 'I' || e.to === 'I1').length > 0 ? 1 : 0
        ));
        return {
            duracion_dias: this.day,
            total_contagiados: totalContagiados,
            total_recuperados: R,
            total_fallecidos: D,
            tasa_mortalidad: totalContagiados > 0 ? (D / totalContagiados) : 0,
            r0_observado: this._calcR0Observado(),
        };
    }

    _calcR0Observado() {
        const finished = this.humans.filter(h =>
            ['R', 'D'].includes(h.state) && h.contagiosGenerados > 0
        );
        if (finished.length === 0) return null;
        const avg = finished.reduce((s, h) => s + h.contagiosGenerados, 0) / finished.length;
        return Math.round(avg * 100) / 100;
    }

    _emitEvent(label) {
        this.events.push({ label, tick: this.tick, day: this.day, hour: this.hour });
    }
}

// Helper: posición con jitter dentro del radio de un nodo
function _jitter(lat, lng, radiusM = 100) {
    const DEG = 0.000009;
    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.random() * radiusM;
    return {
        lat: lat + Math.cos(angle) * dist * DEG,
        lng: lng + Math.sin(angle) * dist * DEG,
    };
}
