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
    }

    renderButtons() {
        this.container.innerHTML = `
            <button class="btn-intervention type-vaccine" id="btn-vaccine">
                <span>💉</span> Vacunar (60%)
            </button>
            <button class="btn-intervention type-mask" id="btn-mask">
                <span>😷</span> Mascarillas
            </button>
            <button class="btn-intervention type-quarantine" id="btn-quarantine">
                <span>🏠</span> Cuarentena
            </button>
            <button class="btn-intervention type-fumigate" id="btn-fumigate">
                <span>🧪</span> Fumigar
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
}
