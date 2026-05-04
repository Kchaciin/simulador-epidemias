// ============================================
// Pantalla de Resultados
// Responsable: Jorge Ordoñez
// ============================================

export class ResultsScreen {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if(!this.container) return;
        
        // Estilos base de la pantalla (Modal Overlay)
        this.container.className = 'results-overlay';
        this.container.style.display = 'none'; // Oculto por defecto
    }

    show(stats) {
        // Prevenir NaN o infinitos si la simulación duró muy poco
        const tasaMortalidad = stats.totalInfected > 0 
            ? ((stats.totalDead / stats.totalInfected) * 100).toFixed(1) 
            : 0;

        this.container.innerHTML = `
            <div class="results-modal animate-in">
                <div class="results-header">
                    <h1 class="results-title">Simulación Finalizada</h1>
                    <p class="results-subtitle">Resumen Epidemiológico de San Felipe</p>
                </div>
                
                <div class="results-grid">
                    <div class="result-card">
                        <span class="result-label">Duración Total</span>
                        <span class="result-value font-mono text-primary">${stats.duration} Días</span>
                    </div>
                    
                    <div class="result-card">
                        <span class="result-label">Total Contagiados</span>
                        <span class="result-value font-mono text-e">${stats.totalInfected}</span>
                    </div>

                    <div class="result-card">
                        <span class="result-label">Total Fallecidos</span>
                        <span class="result-value font-mono text-d">${stats.totalDead}</span>
                    </div>

                    <div class="result-card">
                        <span class="result-label">Pico de Infectados</span>
                        <span class="result-value font-mono text-i">${stats.peakInfected}</span>
                        <span class="result-sublabel">Día ${stats.peakDay}</span>
                    </div>

                    <div class="result-card">
                        <span class="result-label">Tasa Mortalidad</span>
                        <span class="result-value font-mono text-i-grave">${tasaMortalidad}%</span>
                    </div>

                    <div class="result-card">
                        <span class="result-label">R₀ Máximo</span>
                        <span class="result-value font-mono text-primary">${stats.maxR0.toFixed(2)}</span>
                    </div>

                    <div class="result-card">
                        <span class="result-label">Recuperados</span>
                        <span class="result-value font-mono text-r">${stats.totalRecovered}</span>
                    </div>
                    
                    <div class="result-card">
                        <span class="result-label">Vacunados</span>
                        <span class="result-value font-mono text-v">${stats.totalVaccinated}</span>
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn-primary" id="btn-restart">
                        Nueva Simulación
                    </button>
                    <button class="btn-intervention" id="btn-export">
                        📄 Exportar PDF
                    </button>
                </div>
            </div>
        `;

        this.container.style.display = 'flex';

        // Lógica de botones
        document.getElementById('btn-restart').addEventListener('click', () => {
            window.location.reload(); // Forma más sencilla de reiniciar por ahora
        });
        
        document.getElementById('btn-export').addEventListener('click', () => {
            alert('En el futuro, esto generará un PDF con el reporte completo.');
        });
    }

    hide() {
        this.container.style.display = 'none';
        this.container.innerHTML = ''; // Limpiar DOM
    }
}
