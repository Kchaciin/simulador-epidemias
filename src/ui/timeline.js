// ============================================
// Timeline de Eventos
// Responsable: Jorge Ordoñez
// ============================================

export class Timeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Crear contenedor overlay para el timeline
        this.timelineEl = document.createElement('div');
        this.timelineEl.className = 'timeline-overlay';
        this.container.appendChild(this.timelineEl);

        this.events = [];
    }

    /**
     * Emite un nuevo evento y lo dibuja en el timeline
     * @param {string} label - El nombre del evento (ej: "Primer contagio")
     * @param {number} tick - Tick actual de la simulación
     */
    emitEvent(label, tick) {
        const day = Math.floor(tick / 24);
        this.events.push({ label, tick, day });
        this.render();
    }

    render() {
        this.timelineEl.innerHTML = '';

        this.events.forEach((evt, index) => {
            const eventHtml = `
                <div class="timeline-event animate-in" style="animation-delay: 0ms">
                    <span class="timeline-day">Día ${evt.day}</span>
                    <span class="timeline-separator">|</span>
                    <span class="timeline-label">▸ ${evt.label}</span>
                </div>
            `;
            this.timelineEl.insertAdjacentHTML('beforeend', eventHtml);
        });

        // Scroll automático al último evento
        this.timelineEl.scrollLeft = this.timelineEl.scrollWidth;
    }

    clear() {
        this.events = [];
        this.render();
    }
}
