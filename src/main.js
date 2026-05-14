// ============================================
// Main Entry Point — Simulador de Epidemias
// ============================================

// Styles
import './styles/index.css';
import './styles/setup.css';

// UI — Setup (módulo de Ángel)
import { SetupScreen } from './ui/setup.js';

console.log('🦠 Simulador de Epidemias — Yaracuy');
console.log('📍 San Felipe, Venezuela');
console.log('⚡ Motor inicializado');

// ----- Iniciar pantalla de configuración -----
const setup = new SetupScreen('setup-screen');
setup.show();

setup.onStart((config) => {
    console.log('✅ Config recibida:', config);

    // Mostrar pantalla de simulación (cuando el motor esté listo)
    const simScreen = document.getElementById('simulation-screen');
    if (simScreen) simScreen.style.display = 'flex';

    // TODO (Kendall): new Simulation(config)
    // TODO (Daniel): initMap()
    // TODO (Jorge): new Dashboard(), new SIRChart()
});
