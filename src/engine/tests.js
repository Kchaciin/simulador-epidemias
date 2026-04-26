// ============================================
// Mini Test Runner — Motor de Simulación
// Responsable: Kendall Chacín
// Solo corre en modo DEV (import.meta.env.DEV)
// ============================================

import { Simulation } from './simulation.js';
import { COVID_19, DENGUE, YELLOW_FEVER, TUBERCULOSIS } from '../config/diseases.js';
import { evaluateQuadratic, haversineMeters } from './collision.js';

// ─────────────────────────────────────────────────────
// Utilidades internas del runner
// ─────────────────────────────────────────────────────

let _passed = 0;
let _failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        _passed++;
    } else {
        console.warn(`  ❌ FALLA: ${label}`);
        _failed++;
    }
}

function assertApprox(value, min, max, label) {
    assert(value >= min && value <= max, `${label} → got ${value} (expected ${min}–${max})`);
}

/**
 * Corre la simulación n ticks de forma SÍNCRONA (sin setTimeout).
 * Usa _runTick() directamente para tests deterministas.
 */
function runTicks(sim, n) {
    for (let i = 0; i < n; i++) sim._runTick(true);
}

// ─────────────────────────────────────────────────────
// Suite de tests
// ─────────────────────────────────────────────────────

export function runTests() {
    if (!import.meta.env.DEV) return;

    _passed = 0;
    _failed = 0;

    console.log('');
    console.log('🧪 ─── Tests del Motor de Simulación ───────────────');

    test_haversine();
    test_quadratic();
    test_spawn();
    test_stats();
    test_covid_transition();
    test_fa_bifurcation();
    test_interventions();
    test_endCondition();

    console.log('────────────────────────────────────────────────────');
    const icon = _failed === 0 ? '🟢' : '🔴';
    console.log(`${icon} ${_passed} pasaron, ${_failed} fallaron`);
    if (_failed > 0) {
        console.warn('  ⚠️  Hay tests fallando — revisar la lógica del motor.');
    }
    console.log('');
}

// ─────────────────────────────────────────────────────
// Test 1: Haversine
// ─────────────────────────────────────────────────────
function test_haversine() {
    console.log('\n📐 Test 1: Distancia Haversine');

    // Hospital → Plaza Bolívar (San Felipe) ≈ 2.1 km aproximado
    const dist = haversineMeters(10.3553, -68.7517, 10.3403, -68.7358);
    assertApprox(dist, 1500, 3000, 'Hospital → Plaza ≈ 1.5–3 km');

    // Mismo punto → 0 metros
    const zero = haversineMeters(10.34, -68.74, 10.34, -68.74);
    assert(zero < 0.01, 'Mismo punto → 0 metros');
}

// ─────────────────────────────────────────────────────
// Test 2: Distribución cuadrática
// ─────────────────────────────────────────────────────
function test_quadratic() {
    console.log('\n📐 Test 2: Distribución cuadrática (estadística)');

    // Con probTotal=1.0 y T=10 días (240 ticks), la cuadrática concentra
    // transiciones AL FINAL. Partimos al 50% del periodo (tick 120):
    //   ∫₀^0.5T = (0.5)³ = 12.5% temprano
    //   ∫₀.₅T^T = 87.5% tardío
    // Con 2000 trials la señal es abrumadora
    let lateTransitions = 0;
    let earlyTransitions = 0;
    const trials = 2000;
    for (let i = 0; i < trials; i++) {
        for (let t = 1; t <= 240; t++) {
            if (evaluateQuadratic(t, 10, 1.0)) {
                if (t > 120) lateTransitions++; else earlyTransitions++;
                break;
            }
        }
    }
    // Con el corte al 50%, lateTransitions debe ser ~7× mayor que earlyTransitions
    assert(
        lateTransitions > earlyTransitions * 2,
        `Cuadrática concentra riesgo al final: tardías=${lateTransitions} vs tempranas=${earlyTransitions}`
    );


    // Con probTotal=0.0 nunca ocurre
    let noTransitions = 0;
    for (let t = 1; t <= 240; t++) {
        if (evaluateQuadratic(t, 10, 0.0)) noTransitions++;
    }
    assert(noTransitions === 0, 'P=0.0 nunca transiciona');
}

// ─────────────────────────────────────────────────────
// Test 3: Spawn de agentes
// ─────────────────────────────────────────────────────
function test_spawn() {
    console.log('\n👥 Test 3: Spawn de agentes');

    const sim = new Simulation(COVID_19, { population: 100, initialInfected: 3 });
    sim._spawnAgents();

    assert(sim.humans.length === 100, '100 humanos spawneados');

    const students = sim.humans.filter(h => h.role === 'student');
    const workers  = sim.humans.filter(h => h.role === 'worker');
    const free     = sim.humans.filter(h => h.role === 'free');
    assertApprox(students.length, 35, 45, 'Estudiantes ~40%');
    assertApprox(workers.length,  35, 45, 'Workers ~40%');
    assertApprox(free.length,     15, 25, 'Libres ~20%');

    // Todos empiezan vivos
    assert(sim.humans.every(h => h.alive), 'Todos los agentes están vivos al inicio');

    // Infectados iniciales tienen estado I
    const infected = sim.humans.filter(h => h.state === 'I');
    assert(infected.length === 3, '3 infectados iniciales con estado I');

    // Todos tienen posición válida
    const valid = sim.humans.every(h =>
        h.position.lat > 10 && h.position.lat < 11 &&
        h.position.lng > -69 && h.position.lng < -68
    );
    assert(valid, 'Todas las posiciones están en San Felipe (lat/lng válidos)');
}

// ─────────────────────────────────────────────────────
// Test 4: getStats() cuenta correctamente
// ─────────────────────────────────────────────────────
function test_stats() {
    console.log('\n📊 Test 4: getStats() contabiliza estados');

    const sim = new Simulation(COVID_19, { population: 50, initialInfected: 5 });
    sim._spawnAgents();

    const stats = sim.getStats();
    assert(stats.I === 5, `5 infectados iniciales → stats.I = ${stats.I}`);
    assert(stats.S === 45, `45 susceptibles → stats.S = ${stats.S}`);
    assert(stats.E === 0, 'Sin expuestos al inicio');
    assert(stats.R === 0, 'Sin recuperados al inicio');
    assert(stats.D === 0, 'Sin fallecidos al inicio');
    assert(stats.day === 0 && stats.hour === 0, 'Reloj en día 0, hora 0');
    assert(stats.population === 50, 'Población viva = 50');
}

// ─────────────────────────────────────────────────────
// Test 5: Transición COVID E → I
// ─────────────────────────────────────────────────────
function test_covid_transition() {
    console.log('\n🦠 Test 5: Transición E → I (COVID-19, d_inc = 5 días)');

    const sim = new Simulation(COVID_19, { population: 20, initialInfected: 0 });
    sim._spawnAgents();
    sim.running = true; // Necesario para que _runTick procese agentes

    // Forzar 1 agente a estado E
    const agent = sim.humans[0];
    agent.changeState('E', 0);
    assert(agent.state === 'E', 'Agente forzado a E');
    assert(agent.ticksInState === 0, 'ticksInState reseteado a 0');

    // Correr exactamente d_inc × 24 ticks = 120 ticks
    runTicks(sim, 120);

    assert(
        agent.state === 'I' || agent.state === 'L',
        `Después de 120 ticks: estado = ${agent.state} (esperado I o L)`
    );

    // Verificar que ticksInState se reseteó al cambiar estado
    assert(agent.ticksInState < 120, 'ticksInState reseteado al transicionar');
}

// ─────────────────────────────────────────────────────
// Test 6: Bifurcación Fiebre Amarilla I1 → R / I2
// ─────────────────────────────────────────────────────
function test_fa_bifurcation() {
    console.log('\n🔀 Test 6: Bifurcación FA I₁ → R (85%) / I₂ (15%)');

    const RUNS = 200;
    let toR = 0;
    let toI2 = 0;

    for (let r = 0; r < RUNS; r++) {
        const sim = new Simulation(YELLOW_FEVER, { population: 5, initialInfected: 0 });
        sim._spawnAgents();

        const agent = sim.humans[0];
        agent.changeState('I1', 0);

        // Correr exactamente d_acute × 24 = 96 ticks
        runTicks(sim, 96);

        if (agent.state === 'R') toR++;
        else if (agent.state === 'I2') toI2++;
    }

    const rateR  = toR / RUNS;
    const rateI2 = toI2 / RUNS;

    assertApprox(rateR,  0.75, 0.95, `FA I₁→R ≈ 85%  (got ${Math.round(rateR*100)}%)`);
    assertApprox(rateI2, 0.05, 0.25, `FA I₁→I₂ ≈ 15% (got ${Math.round(rateI2*100)}%)`);
}

// ─────────────────────────────────────────────────────
// Test 7: Intervenciones básicas
// ─────────────────────────────────────────────────────
function test_interventions() {
    console.log('\n💊 Test 7: Intervenciones');

    // Vacunación
    const sim = new Simulation(COVID_19, { population: 100, initialInfected: 0 });
    sim._spawnAgents();

    const sBefore = sim.humans.filter(h => h.state === 'S').length;
    sim.applyVaccination(0.60);
    const vAfter = sim.humans.filter(h => h.state === 'V').length;
    assertApprox(vAfter, 50, 70, `Vacunación 60% → ~60 vacunados (got ${vAfter})`);

    // Cuarentena
    const sim2 = new Simulation(COVID_19, { population: 100, initialInfected: 5 });
    sim2._spawnAgents();
    sim2.applyQuarantine();
    const quarantined = sim2.humans.filter(h => h.isQuarantined).length;
    assertApprox(quarantined, 60, 90, `Cuarentena 80% → >60 en cuarentena (got ${quarantined})`);

    // Mascarillas
    const sim3 = new Simulation(COVID_19, { population: 50, initialInfected: 0 });
    sim3._spawnAgents();
    sim3.applyMasks();
    assert(sim3.interventions.masksActive === true, 'Mascarillas activadas correctamente');

    // Fumigación (Dengue)
    const sim4 = new Simulation(DENGUE, { population: 30, initialInfected: 0 });
    sim4._spawnAgents();
    // Añadir mosquitos manualmente
    for (let i = 0; i < 20; i++) {
        sim4.mosquitoes.push({ alive: true, state: 'S', id: i });
    }
    sim4.applyFumigation();
    const mosqAlive = sim4.mosquitoes.filter(m => m.alive).length;
    assertApprox(mosqAlive, 0, 8, `Fumigación 80% → ≤8 mosquitos vivos (got ${mosqAlive})`);
}

// ─────────────────────────────────────────────────────
// Test 8: Condición de fin — erradicación
// ─────────────────────────────────────────────────────
function test_endCondition() {
    console.log('\n🏁 Test 8: Condición de fin — erradicación');

    const sim = new Simulation(COVID_19, {
        population: 10,
        initialInfected: 0,
        maxDays: 5
    });
    sim._spawnAgents();

    // Sin infectados: la simulación debe terminar por erradicación inmediatamente
    sim.running = true;
    let endCalled = false;
    sim.onEnd(result => { endCalled = result.reason; });

    // Correr hasta que detecte el fin
    for (let t = 0; t < 200; t++) {
        sim._runTick();
        if (!sim.running) break;
    }

    assert(
        endCalled === 'erradicacion' || endCalled === 'tiempo_limite',
        `Fin detectado correctamente: ${endCalled}`
    );
}
