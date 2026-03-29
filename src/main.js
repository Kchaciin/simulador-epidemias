// ============================================
// Main Entry Point — Simulador de Epidemias
// ============================================

// Config
// import { COVID_19, DENGUE, YELLOW_FEVER } from './config/diseases.js';
// import { NODES } from './config/nodes.js';
// import { CLIMATE } from './config/environment.js';
// import { ROUTINES } from './config/routines.js';

// Engine
// import { Simulation } from './engine/simulation.js';

// UI
// import { initMap } from './ui/map.js';
// import { Renderer } from './ui/renderer.js';
// import { SIRChart } from './ui/charts.js';
// import { Dashboard } from './ui/dashboard.js';
// import { Controls } from './ui/controls.js';
// import { SetupScreen } from './ui/setup.js';

// Styles
import './styles/index.css';

console.log('🦠 Simulador de Epidemias — Yaracuy');
console.log('📍 San Felipe, Venezuela');
console.log('⚡ Motor inicializado');

// TODO: Descomentar imports a medida que cada módulo esté listo
// El flujo será:
// 1. SetupScreen.show() → usuario configura
// 2. SetupScreen.onStart(config) → se crea Simulation(config)
// 3. simulation.onTick(stats => { chart.update(stats); dashboard.update(stats); renderer.draw(agents); })
// 4. simulation.onEnd(stats => dashboard.showResults(stats))
