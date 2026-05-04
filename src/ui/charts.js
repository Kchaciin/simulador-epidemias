// ============================================
// Gráfica SIR en Tiempo Real (Chart.js)
// Responsable: Jorge Ordoñez
// ============================================

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Configuración Global de Chart.js
Chart.defaults.color = '#a1a1aa';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

const DARK_SCALE_OPTIONS = {
    grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
    ticks: { color: '#a1a1aa', font: { family: "'JetBrains Mono', monospace", size: 10 }, padding: 8 },
    border: { display: false }
};

export class SIRChart {
    constructor(canvasId) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'S', data: [], borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    { label: 'E', data: [], borderColor: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.05)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    { label: 'I', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    { label: 'R', data: [], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.05)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    { label: 'D', data: [], borderColor: '#71717a', backgroundColor: 'rgba(113, 113, 122, 0.05)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 1, borderDash: [4, 4] },
                    { label: 'V', data: [], borderColor: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.05)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 }
                ]
            },
            options: {
                animation: false, // Vital para streaming
                parsing: false,
                normalized: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 17, 24, 0.95)',
                        titleColor: '#e4e4e7',
                        bodyColor: '#a1a1aa',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        titleFont: { family: "'Inter', sans-serif", weight: '600' },
                        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
                    }
                },
                scales: {
                    x: { ...DARK_SCALE_OPTIONS, title: { display: true, text: 'Horas', color: '#52525b', font: { size: 10 } } },
                    y: { ...DARK_SCALE_OPTIONS, beginAtZero: true, title: { display: true, text: 'Agentes', color: '#52525b', font: { size: 10 } } }
                }
            }
        });
    }

    update(stats) {
        const { S, E, I, R, D, V, tick } = stats;
        
        this.chart.data.labels.push(tick);
        this.chart.data.datasets[0].data.push(S);
        this.chart.data.datasets[1].data.push(E);
        this.chart.data.datasets[2].data.push(I);
        this.chart.data.datasets[3].data.push(R);
        this.chart.data.datasets[4].data.push(D);
        this.chart.data.datasets[5].data.push(V);

        const MAX_POINTS = 200;
        if (this.chart.data.labels.length > MAX_POINTS) {
            this.chart.data.labels.shift();
            this.chart.data.datasets.forEach(ds => ds.data.shift());
        }

        this.chart.update('none');
    }

    reset() {
        this.chart.data.labels = [];
        this.chart.data.datasets.forEach(ds => ds.data = []);
        this.chart.update('none');
    }
}
