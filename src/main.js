// ============================================
// Entry Point — Simulador de Epidemias
// Responsable: Kendall Chacín
// ============================================

import './styles/index.css';

import { COVID_19, DENGUE, YELLOW_FEVER, TUBERCULOSIS, PRESET_DISEASES } from './config/diseases.js';
import { NODES } from './config/nodes.js';
import { Simulation } from './engine/simulation.js';
import { runTests } from './engine/tests.js';

// ─────────────────────────────────────────────────────
// En desarrollo: exponer al window para pruebas en consola
// ─────────────────────────────────────────────────────
if (import.meta.env.DEV) {
    // Acceso rápido a configs
    window.DISEASES = PRESET_DISEASES;
    window.NODES    = NODES;

    /**
     * Crea y arranca una simulación de prueba desde la consola.
     * Uso:
     *   sim = window.crearSim('covid_19')
     *   sim = window.crearSim('tuberculosis', { population: 50, initialInfected: 2 })
     */
    window.crearSim = (diseaseKey = 'covid_19', options = {}) => {
        const config = PRESET_DISEASES[diseaseKey];
        if (!config) {
            console.error(`❌ Enfermedad no encontrada: "${diseaseKey}"`);
            console.log('Opciones válidas:', Object.keys(PRESET_DISEASES).join(', '));
            return null;
        }
        const sim = new Simulation(config, {
            population: 50,
            initialInfected: 3,
            season: 'wet',
            maxDays: 90,
            speedMultiplier: 1,
            ...options
        });
        window.sim = sim;

        // Loguear cada tick en modo debug
        sim.onTick(stats => {
            if (stats.tick % 24 === 0) { // Solo una vez por día
                const r = stats.r_eff !== null ? `R_eff=${stats.r_eff}` : 'R_eff=--';
                console.log(
                    `📅 Día ${stats.day} | S=${stats.S} E=${stats.E} I=${stats.I} R=${stats.R} D=${stats.D} V=${stats.V}` +
                    (config.model === 'SEIRL_D' ? ` L=${stats.L}` : '') +
                    ` | ${r} | T=${stats.climate.temperature}°C`
                );
            }
        });

        sim.onEnd(result => {
            console.log('');
            console.log('🏁 ─── SIMULACIÓN FINALIZADA ─── 🏁');
            console.log(`  Motivo:          ${result.reason}`);
            console.log(`  Duración:        ${result.summary.duracion_dias} días`);
            console.log(`  Contagiados:     ${result.summary.total_contagiados}`);
            console.log(`  Recuperados:     ${result.summary.total_recuperados}`);
            console.log(`  Fallecidos:      ${result.summary.total_fallecidos}`);
            console.log(`  Tasa mortalidad: ${(result.summary.tasa_mortalidad * 100).toFixed(2)}%`);
            if (result.summary.r0_observado !== null)
                console.log(`  R₀ observado:    ${result.summary.r0_observado}`);
        });

        console.log(`🦠 Simulación creada — ${config.name}`);
        console.log('  Comandos disponibles:');
        console.log('    sim.start()              → Arrancar');
        console.log('    sim.pause() / resume()   → Pausa / Continuar');
        console.log('    sim.setSpeed(5)          → Cambiar velocidad (×5)');
        console.log('    sim.getStats()           → Ver estadísticas actuales');
        console.log('    sim.getAgents()          → Ver array de agentes');
        console.log('    sim.applyVaccination()   → Vacunar');
        console.log('    sim.applyMasks()         → Activar mascarillas');
        console.log('    sim.applyQuarantine()    → Activar cuarentena');
        if (config.has_mosquitoes) {
            console.log('    sim.applyFumigation()    → Fumigar mosquitos');
        }
        if (config.model === 'SEIRL_D') {
            console.log('    sim.applyTreatment("dots") → Iniciar DOTS');
            console.log('  ⚠️  TB necesita ×10 mínimo: sim.setSpeed(10)');
        }
        return sim;
    };

    // Ejecutar tests automáticamente al cargar en DEV
    runTests();

    console.log('');
    console.log('🦠 Simulador de Epidemias — Yaracuy / San Felipe');
    console.log('────────────────────────────────────────────────');
    console.log('  Inicio rápido:');
    console.log('    sim = crearSim("covid_19")');
    console.log('    sim.start()');
    console.log('');
    console.log('  Otras enfermedades:');
    console.log('    crearSim("dengue")');
    console.log('    crearSim("yellow_fever")');
    console.log('    crearSim("tuberculosis", { maxDays: 365 })');
}
