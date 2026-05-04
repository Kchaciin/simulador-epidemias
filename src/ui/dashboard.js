// ============================================
// Dashboard (Contadores y Métricas)
// Responsable: Jorge Ordoñez
// ============================================

export class Dashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.renderInitialHTML();
        
        // Referencias a elementos DOM
        this.counters = {
            s: document.getElementById('counter-s-val'),
            e: document.getElementById('counter-e-val'),
            i: document.getElementById('counter-i-val'),
            r: document.getElementById('counter-r-val'),
            d: document.getElementById('counter-d-val'),
            v: document.getElementById('counter-v-val')
        };
        
        this.segments = {
            s: document.getElementById('segment-s'),
            e: document.getElementById('segment-e'),
            i: document.getElementById('segment-i'),
            r: document.getElementById('segment-r'),
            d: document.getElementById('segment-d'),
            v: document.getElementById('segment-v')
        };
        
        this.rIndicator = document.getElementById('r-indicator');
        this.rIndicatorValue = document.getElementById('r-indicator-val');
    }

    renderInitialHTML() {
        this.container.innerHTML = `
            <div class="card animate-in">
                <div class="card-header">
                    <h2 class="card-title">Población Global</h2>
                    <span class="text-xs font-mono" id="sim-time">Día 0 | 00:00</span>
                </div>
                
                <div class="counters-grid">
                    <div class="counter highlight-success">
                        <span class="counter-value text-s" id="counter-s-val">0</span>
                        <span class="counter-label">Susceptibles</span>
                    </div>
                    <div class="counter highlight-warning">
                        <span class="counter-value text-e" id="counter-e-val">0</span>
                        <span class="counter-label">Expuestos</span>
                    </div>
                    <div class="counter highlight-danger">
                        <span class="counter-value text-i" id="counter-i-val">0</span>
                        <span class="counter-label">Infectados</span>
                    </div>
                    <div class="counter">
                        <span class="counter-value text-r" id="counter-r-val">0</span>
                        <span class="counter-label">Recuperados</span>
                    </div>
                    <div class="counter">
                        <span class="counter-value text-d" id="counter-d-val">0</span>
                        <span class="counter-label">Fallecidos</span>
                    </div>
                    <div class="counter">
                        <span class="counter-value text-v" id="counter-v-val">0</span>
                        <span class="counter-label">Vacunados</span>
                    </div>
                </div>

                <div class="proportion-bar-wrapper">
                    <div class="proportion-bar">
                        <div class="proportion-segment segment-s" id="segment-s" style="width: 100%"></div>
                        <div class="proportion-segment segment-e" id="segment-e" style="width: 0%"></div>
                        <div class="proportion-segment segment-i" id="segment-i" style="width: 0%"></div>
                        <div class="proportion-segment segment-r" id="segment-r" style="width: 0%"></div>
                        <div class="proportion-segment segment-d" id="segment-d" style="width: 0%"></div>
                        <div class="proportion-segment segment-v" id="segment-v" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="r-indicator-wrapper">
                    <span class="r-indicator-label">R₀ Efectivo (24h)</span>
                    <div class="r-indicator safe" id="r-indicator">
                        <span id="r-indicator-val">0.00</span>
                    </div>
                </div>
            </div>

            <div class="card animate-in">
                <div class="card-header">
                    <h2 class="card-title">Curva Epidémica</h2>
                </div>
                <div class="chart-container">
                    <canvas id="sir-chart"></canvas>
                </div>
            </div>
            
            <div class="card animate-in">
                <div class="card-header">
                    <h2 class="card-title">Intervenciones</h2>
                </div>
                <div class="interventions-grid" id="interventions-container">
                    <!-- Los botones se inyectan desde controls.js -->
                </div>
            </div>
        `;
    }

    update(stats) {
        // Actualizar contadores numéricos
        this.counters.s.textContent = stats.S;
        this.counters.e.textContent = stats.E;
        this.counters.i.textContent = stats.I;
        this.counters.r.textContent = stats.R;
        this.counters.d.textContent = stats.D;
        this.counters.v.textContent = stats.V;

        // Actualizar barra de proporción
        const total = stats.S + stats.E + stats.I + stats.R + stats.D + stats.V;
        if (total > 0) {
            this.segments.s.style.width = `${(stats.S / total) * 100}%`;
            this.segments.e.style.width = `${(stats.E / total) * 100}%`;
            this.segments.i.style.width = `${(stats.I / total) * 100}%`;
            this.segments.r.style.width = `${(stats.R / total) * 100}%`;
            this.segments.d.style.width = `${(stats.D / total) * 100}%`;
            this.segments.v.style.width = `${(stats.V / total) * 100}%`;
        }

        // Actualizar R0
        this.rIndicatorValue.textContent = stats.R0.toFixed(2);
        this.rIndicator.className = 'r-indicator';
        if (stats.R0 > 1.5) this.rIndicator.classList.add('danger');
        else if (stats.R0 > 1.0) this.rIndicator.classList.add('warning');
        else this.rIndicator.classList.add('safe');
        
        // Reloj simulado
        document.getElementById('sim-time').textContent = `Día ${Math.floor(stats.tick / 24)} | ${String(stats.tick % 24).padStart(2, '0')}:00`;
    }

    showResults(finalStats) {
        // TODO: Mostrar métricas de resumen
        console.log("Simulación finalizada", finalStats);
    }
}
