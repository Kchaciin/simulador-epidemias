// ============================================
// Main Entry Point — Simulador de Epidemias
// ============================================

// Config (Por implementar por otros devs)
// import { COVID_19, DENGUE, YELLOW_FEVER } from './config/diseases.js';
// import { NODES } from './config/nodes.js';
// import { CLIMATE } from './config/environment.js';
// import { ROUTINES } from './config/routines.js';

// Engine (Por implementar)
// import { Simulation } from './engine/simulation.js';

// UI
// import { initMap } from './ui/map.js';
// import { Renderer } from './ui/renderer.js';
// import { SetupScreen } from './ui/setup.js';

import { SIRChart } from './ui/charts.js';
import { Dashboard } from './ui/dashboard.js';
import { Controls } from './ui/controls.js';
import { Timeline } from './ui/timeline.js';
import { ResultsScreen } from './ui/results.js';

// Styles
import './styles/index.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/controls.css';
import './styles/animations.css';
import './styles/results.css';

console.log('🦠 Simulador de Epidemias — Yaracuy');
console.log('📍 San Felipe, Venezuela');

// Forzar visualización del layout principal (ocultar setup por ahora para ver el dashboard)
document.getElementById('simulation-screen').style.display = 'grid';
document.getElementById('setup-screen').style.display = 'none';

// Inicializar Módulos de Jorge (UI)
const dashboard = new Dashboard('sidebar');
const controls = new Controls('interventions-container');
const chart = new SIRChart('sir-chart');
const timeline = new Timeline('map-container');
const resultsScreen = new ResultsScreen('results-screen');

console.log('⚡ Dashboard inicializado con datos mockeados');

// Inyectar botón de prueba para terminar simulación en el panel de intervenciones
const finishBtn = document.createElement('button');
finishBtn.className = 'btn-intervention'; // Usar la misma clase que los otros botones
finishBtn.innerHTML = '<span>🏁</span> Terminar (Test)';
finishBtn.style.borderColor = 'var(--color-i)'; // Borde rojo tenue para destacar
finishBtn.style.color = 'var(--color-i)';

// Esperar a que los módulos se hayan montado
setTimeout(() => {
    document.getElementById('interventions-container').appendChild(finishBtn);
}, 100);


// ==========================================
// MOCK DATA LOOP PARA PROBAR ANIMACIONES
// (Esto se reemplazará cuando engine/simulation.js esté listo)
// ==========================================

let mockTick = 0;
let mockStats = {
    S: 290, E: 5, I: 5, R: 0, D: 0, V: 0,
    R0: 2.5,
    tick: 0
};

// Eventos iniciales
timeline.emitEvent('Inicio del brote simulado', 0);

const loop = setInterval(() => {
    mockTick++;
    mockStats.tick = mockTick;
    
    // Simular progresión SEIR
    if (mockTick % 5 === 0 && mockStats.S > 0) {
        const contagios = Math.floor(Math.random() * 3);
        mockStats.S = Math.max(0, mockStats.S - contagios);
        mockStats.E += contagios;
    }
    
    if (mockTick % 8 === 0 && mockStats.E > 0) {
        mockStats.E--;
        mockStats.I++;
        if (mockStats.I === 20 && !timeline.events.find(e => e.label === 'Brote supera 20 infectados activos')) {
            timeline.emitEvent('Brote supera 20 infectados activos', mockTick);
        }
    }
    
    if (mockTick % 20 === 0 && mockStats.I > 0) {
        mockStats.I--;
        if (Math.random() > 0.1) mockStats.R++;
        else {
            mockStats.D++;
            if (mockStats.D === 1 && !timeline.events.find(e => e.label === 'Primera muerte registrada')) {
                timeline.emitEvent('Primera muerte registrada', mockTick);
                document.getElementById('counter-d-val').parentElement.classList.add('pulse-alert');
            }
        }
    }

    // Variar R0 suavemente
    mockStats.R0 = Math.max(0.5, mockStats.R0 + (Math.random() - 0.5) * 0.1);

    // Actualizar UI
    dashboard.update(mockStats);
    chart.update(mockStats);
}, 200); // 5 ticks por segundo para ver cómo fluye rápido

// Finalizar simulación
finishBtn.addEventListener('click', () => {
    clearInterval(loop);
    // Generar fake stats finales
    const finalStats = {
        duration: Math.floor(mockTick / 24),
        totalInfected: 125,
        totalDead: mockStats.D,
        peakInfected: 42,
        peakDay: 12,
        maxR0: 3.1,
        totalRecovered: mockStats.R,
        totalVaccinated: mockStats.V
    };
    resultsScreen.show(finalStats);
});

