// ============================================
// Controles de Intervención
// Responsable: Jorge Ordoñez
// ============================================

export class Controls {
    constructor(containerId, simulation) {
        this.container = document.getElementById(containerId);
        if(!this.container) return; // Si aún no se ha renderizado el dashboard

        this.renderButtons();
        this.setupSpeedControls();
        
        // Enfermedad por defecto (se cambiará desde main.js)
        this.setDiseaseMode('COVID-19'); 
    }

    renderButtons() {
        // Renderizamos tódos los botones posibles, y luego css/js los ocultan
        this.container.innerHTML = `
            <button class="btn-intervention type-vaccine" id="btn-vaccine" data-disease="ALL">
                <span>💉</span> Vacunar
            </button>
            <button class="btn-intervention type-mask" id="btn-mask" data-disease="COVID-19,TB">
                <span>😷</span> Mascarillas
            </button>
            <button class="btn-intervention type-quarantine" id="btn-quarantine" data-disease="COVID-19">
                <span>🏠</span> Cuarentena
            </button>
            <button class="btn-intervention type-fumigate" id="btn-fumigate" data-disease="DENGUE,YELLOW_FEVER">
                <span>🧪</span> Fumigar
            </button>
            <button class="btn-intervention type-vector" id="btn-clean-water" data-disease="DENGUE,YELLOW_FEVER">
                <span>🚫</span> Sin Criaderos
            </button>
            <button class="btn-intervention type-treatment" id="btn-dots" data-disease="TB">
                <span>💊</span> DOTS (TB)
            </button>
            <button class="btn-intervention type-research" id="btn-cure" data-disease="ALL">
                <span>📊</span> Cura Experimental
            </button>
        `;

        // Añadir toggle behavior
        const buttons = this.container.querySelectorAll('.btn-intervention');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                // TODO: Emitir evento al motor de simulación
            });
        });
    }

    setupSpeedControls() {
        const footer = document.getElementById('footer');
        if(!footer) return;
        
        footer.innerHTML = `
            <div class="speed-controls">
                <button class="btn-speed" data-speed="0">⏸</button>
                <button class="btn-speed" data-speed="0.5">×0.5</button>
                <button class="btn-speed active" data-speed="1">×1</button>
                <button class="btn-speed" data-speed="2">×2</button>
                <button class="btn-speed" data-speed="5">×5</button>
                <button class="btn-speed fast" data-speed="10">×10</button>
                <button class="btn-speed fast speed-extreme" data-speed="20" style="display:none">×20</button>
            </div>
        `;

        const speedBtns = footer.querySelectorAll('.btn-speed');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // TODO: Emitir evento de cambio de velocidad
            });
        });
    }

    setDiseaseMode(disease) {
        // Filtrar botones de intervención
        const buttons = this.container.querySelectorAll('.btn-intervention');
        buttons.forEach(btn => {
            const allowedDiseases = btn.getAttribute('data-disease').split(',');
            if (allowedDiseases.includes('ALL') || allowedDiseases.includes(disease)) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
                btn.classList.remove('active'); // Apagar si estaba activo
            }
        });

        // Filtrar velocidades extremas (TB necesita x10 y x20 porque dura meses)
        const footer = document.getElementById('footer');
        if (footer) {
            const extremeSpeedBtn = footer.querySelector('.speed-extreme');
            if (extremeSpeedBtn) {
                extremeSpeedBtn.style.display = (disease === 'TB') ? 'block' : 'none';
            }
        }
    }
}
