// ============================================
// Pantalla de Configuración Inicial
// Responsable: Ángel Colina
// ============================================

import { COVID_19, DENGUE, YELLOW_FEVER, createDiseaseX } from '../config/diseases.js';
import { NODES } from '../config/nodes.js';

const DISEASES = {
    covid:  COVID_19,
    dengue: DENGUE,
    fa:     YELLOW_FEVER,
    x:      null
};

const PRESETS_X = {
    gripe:    { name:'Gripe Agresiva',    type:'airborne', p_base:0.40, r_contagion:1.5, d_inc:2,  d_rec:7,  alpha:0.01, p_grave:0.10, v_sick:0.70, cure_state:'none' },
    plaga:    { name:'Plaga Mortal',      type:'airborne', p_base:0.15, r_contagion:1.5, d_inc:7,  d_rec:21, alpha:0.40, p_grave:0.30, v_sick:0.40, cure_state:'none' },
    vector:   { name:'Vector Tropical',   type:'vector',   p_base:0.45, r_contagion:1.5, d_inc:5,  d_rec:10, alpha:0.03, p_grave:0.10, v_sick:0.60, cure_state:'none' },
    contacto: { name:'Contacto Social',   type:'contact',  p_base:0.20, r_contagion:0.8, d_inc:10, d_rec:30, alpha:0.02, p_grave:0.05, v_sick:0.80, cure_state:'none' },
    pandemia: { name:'Pandemia Express',  type:'airborne', p_base:0.70, r_contagion:2.0, d_inc:1,  d_rec:5,  alpha:0.005,p_grave:0.05, v_sick:0.90, cure_state:'none' }
};

export class SetupScreen {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this._callback  = null;
        this._selected  = 'covid';
        this._render();
    }

    show() {
        this.container.style.display = 'flex';
        this.container.classList.add('setup-enter');
        setTimeout(() => this.container.classList.remove('setup-enter'), 400);
    }

    hide() {
        this.container.style.display = 'none';
    }

    onStart(callback) {
        this._callback = callback;
    }

    // ---- render principal ----
    _render() {
        this.container.innerHTML = `
        <div class="setup-bg"></div>
        <div class="setup-panel">
            <!-- HEADER -->
            <div class="setup-header">
                <div class="setup-logo">🦠</div>
                <h1 class="setup-title">Simulador de Epidemias</h1>
                <p class="setup-subtitle">San Felipe, Yaracuy · Modelo basado en agentes</p>
            </div>

            <!-- ENFERMEDAD -->
            <section class="setup-section">
                <label class="setup-label">Enfermedad</label>
                <div class="disease-btns" id="disease-btns">
                    <button class="disease-btn active" data-disease="covid" id="btn-covid">
                        <span class="disease-icon">🫁</span>
                        <span>COVID-19</span>
                        <small>SEIR+D · Aéreo</small>
                    </button>
                    <button class="disease-btn" data-disease="dengue" id="btn-dengue">
                        <span class="disease-icon">🦟</span>
                        <span>Dengue</span>
                        <small>SEIR Vectorial</small>
                    </button>
                    <button class="disease-btn" data-disease="fa" id="btn-fa">
                        <span class="disease-icon">⚠️</span>
                        <span>Fiebre Amarilla</span>
                        <small>SIRD+V · Bifurcación</small>
                    </button>
                    <button class="disease-btn" data-disease="x" id="btn-x">
                        <span class="disease-icon">🧬</span>
                        <span>Enfermedad X</span>
                        <small>Personalizable</small>
                    </button>
                </div>
            </section>

            <!-- SLIDERS PRINCIPALES -->
            <section class="setup-section setup-grid">
                ${this._slider('population',    'Población total',        100, 30,  300, 1,   'agentes')}
                ${this._slider('initial_inf',   'Infectados iniciales',   3,   1,   10,  1,   'agentes')}
                ${this._slider('temperature',   'Temperatura',            28,  24,  35,  0.5, '°C')}
                ${this._slider('humidity',      'Humedad relativa',       80,  60,  95,  1,   '%')}
                ${this._slider('vaccination',   'Vacunación previa',      0,   0,   80,  5,   '%')}
                ${this._slider('max_days',      'Días máximos',           90,  30,  180, 5,   'días')}
            </section>

            <!-- FILA SECUNDARIA -->
            <section class="setup-section setup-row">
                <div class="setup-field">
                    <label class="setup-label">Zona del brote</label>
                    <select class="setup-select" id="outbreak-zone">
                        <option value="random">🎲 Aleatoria</option>
                        <option value="res_norte">Norte — Urb. La Fuente</option>
                        <option value="res_sur">Sur — Barrio El Carmen</option>
                        <option value="res_este">Este — Urb. San José</option>
                        <option value="res_oeste">Oeste — Barrio Yurubí</option>
                    </select>
                </div>
                <div class="setup-field">
                    <label class="setup-label">Temporada</label>
                    <div class="toggle-row" id="season-toggle">
                        <button class="toggle-btn active" data-val="dry" id="btn-dry">☀️ Sequía</button>
                        <button class="toggle-btn"        data-val="wet" id="btn-wet">🌧️ Lluvias</button>
                    </div>
                </div>
                <div class="setup-field" id="masks-field">
                    <label class="setup-label">Mascarillas (COVID)</label>
                    <div class="toggle-row" id="masks-toggle">
                        <button class="toggle-btn active" data-val="false" id="btn-masks-off">❌ No</button>
                        <button class="toggle-btn"        data-val="true"  id="btn-masks-on">✅ Sí</button>
                    </div>
                </div>
            </section>

            <!-- ENFERMEDAD X -->
            <section class="setup-section" id="disease-x-section" style="display:none;">
                <label class="setup-label">🧬 Configurar Enfermedad X</label>

                <div class="x-presets">
                    <span class="setup-label" style="font-size:11px;margin-bottom:6px;display:block;">Presets rápidos</span>
                    <div class="preset-btns">
                        ${Object.entries(PRESETS_X).map(([k,p])=>`<button class="preset-btn" data-preset="${k}">${p.name}</button>`).join('')}
                    </div>
                </div>

                <div class="setup-grid" style="margin-top:16px;">
                    <div class="setup-field" style="grid-column:1/-1;">
                        <label class="setup-label">Nombre del virus</label>
                        <input class="setup-input" id="x-name" type="text" maxlength="30" placeholder="Ej: Virus Z" autocomplete="off">
                        <span class="field-error" id="x-name-error"></span>
                    </div>
                    <div class="setup-field" style="grid-column:1/-1;">
                        <label class="setup-label">Tipo de transmisión</label>
                        <div class="toggle-row">
                            <button class="toggle-btn active" data-xtype="airborne" id="xtype-airborne">💨 Aéreo</button>
                            <button class="toggle-btn"        data-xtype="vector"   id="xtype-vector">🦟 Vectorial</button>
                            <button class="toggle-btn"        data-xtype="contact"  id="xtype-contact">🤝 Contacto</button>
                        </div>
                    </div>
                    ${this._slider('x_p_base',   'Probabilidad de contagio', 0.30, 0.01, 0.90, 0.01, '/hora', 2)}
                    ${this._slider('x_r',        'Radio de contagio',        1.5,  0.5,  3.0,  0.1,  'm',    1)}
                    ${this._slider('x_d_inc',    'Incubación',               5,    1,    21,   1,    'días')}
                    ${this._slider('x_d_rec',    'Duración enfermedad',      10,   2,    30,   1,    'días')}
                    ${this._slider('x_alpha',    'Letalidad',                0.05, 0.00, 0.50, 0.01, '',     2)}
                    ${this._slider('x_p_grave',  'Prob. caso grave',         0.15, 0.00, 0.50, 0.01, '',     2)}
                    ${this._slider('x_v_sick',   'Velocidad del enfermo',    0.50, 0.20, 1.00, 0.05, 'x',    2)}
                </div>

                <div id="x-vector-fields" style="display:none;margin-top:12px;">
                    <div class="setup-grid">
                        ${this._slider('x_mosq_init',  'Mosquitos iniciales',   50,  10,  200, 5,   '')}
                        ${this._slider('x_spawn_rate', 'Tasa de spawn',         3,   1,   10,  1,   '/día')}
                        ${this._slider('x_d_inc_m',    'Incubación extrínseca', 10,  3,   15,  1,   'días')}
                        ${this._slider('x_mosq_life',  'Vida del mosquito',     20,  5,   30,  1,   'días')}
                    </div>
                </div>

                <div class="setup-field" style="margin-top:12px;">
                    <label class="setup-label">Estado de la cura</label>
                    <div class="toggle-row">
                        <button class="toggle-btn active" data-cure="none"         id="cure-none">❌ Inexistente</button>
                        <button class="toggle-btn"        data-cure="experimental" id="cure-exp">⚗️ Experimental</button>
                        <button class="toggle-btn"        data-cure="verified"     id="cure-ver">✅ Verificada</button>
                    </div>
                </div>

                <div class="x-warnings" id="x-warnings" style="display:none;"></div>
                <div class="field-error" id="x-global-error" style="margin-top:8px;"></div>
            </section>

            <!-- BOTÓN INICIAR -->
            <div class="setup-footer">
                <button class="btn-start" id="btn-start">
                    <span>Iniciar Simulación</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
        </div>`;

        this._bindEvents();
        this._updateSliderDisplays();
    }

    // ---- helpers de UI ----
    _slider(id, label, def, min, max, step, unit = '', decimals = 0) {
        return `
        <div class="setup-field">
            <label class="setup-label" for="${id}">${label}
                <span class="slider-value" id="${id}-val">${def}${unit}</span>
            </label>
            <input class="setup-slider" id="${id}" type="range"
                   min="${min}" max="${max}" step="${step}" value="${def}"
                   data-unit="${unit}" data-dec="${decimals}">
        </div>`;
    }

    _updateSliderDisplays() {
        this.container.querySelectorAll('.setup-slider').forEach(sl => {
            const val   = parseFloat(sl.value);
            const dec   = parseInt(sl.dataset.dec || 0);
            const unit  = sl.dataset.unit || '';
            const label = document.getElementById(`${sl.id}-val`);
            if (label) label.textContent = val.toFixed(dec) + unit;
        });
    }

    // ---- eventos ----
    _bindEvents() {
        // Sliders live update
        this.container.querySelectorAll('.setup-slider').forEach(sl => {
            sl.addEventListener('input', () => {
                const val  = parseFloat(sl.value);
                const dec  = parseInt(sl.dataset.dec || 0);
                const unit = sl.dataset.unit || '';
                const lbl  = document.getElementById(`${sl.id}-val`);
                if (lbl) lbl.textContent = val.toFixed(dec) + unit;
            });
        });

        // Botones de enfermedad
        this.container.querySelectorAll('[data-disease]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('[data-disease]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._selected = btn.dataset.disease;
                const xSec     = document.getElementById('disease-x-section');
                const masksFld = document.getElementById('masks-field');
                xSec.style.display    = this._selected === 'x'     ? 'block' : 'none';
                masksFld.style.display = this._selected === 'covid' ? 'flex'  : 'none';
            });
        });

        // Toggle season
        this.container.querySelectorAll('#season-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => this._toggleGroup('#season-toggle', btn));
        });

        // Toggle masks
        this.container.querySelectorAll('#masks-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => this._toggleGroup('#masks-toggle', btn));
        });

        // Tipo de transmisión X
        this.container.querySelectorAll('[data-xtype]').forEach(btn => {
            btn.addEventListener('click', () => {
                this._toggleGroup('[data-xtype]', btn, true);
                const isVector = btn.dataset.xtype === 'vector';
                document.getElementById('x-vector-fields').style.display = isVector ? 'block' : 'none';
            });
        });

        // Cura X
        this.container.querySelectorAll('[data-cure]').forEach(btn => {
            btn.addEventListener('click', () => this._toggleGroup('[data-cure]', btn, true));
        });

        // Presets X
        this.container.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => this._applyPreset(btn.dataset.preset));
        });

        // Botón iniciar
        document.getElementById('btn-start').addEventListener('click', () => this._handleStart());
    }

    _toggleGroup(selector, activeBtn, byParent = false) {
        const scope = byParent ? activeBtn.closest('.toggle-row, [data-xtype]')?.parentElement : this.container;
        const btns  = byParent
            ? activeBtn.closest('div').querySelectorAll('.toggle-btn')
            : (scope || this.container).querySelectorAll(`${selector} .toggle-btn`);
        btns.forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    _applyPreset(key) {
        const p = PRESETS_X[key];
        if (!p) return;
        const set = (id, val) => { const el = document.getElementById(id); if (el) { el.value = val; el.dispatchEvent(new Event('input')); } };
        document.getElementById('x-name').value = p.name;
        set('x_p_base',  p.p_base);
        set('x_r',       p.r_contagion);
        set('x_d_inc',   p.d_inc);
        set('x_d_rec',   p.d_rec);
        set('x_alpha',   p.alpha);
        set('x_p_grave', p.p_grave);
        set('x_v_sick',  p.v_sick);

        // tipo
        this.container.querySelectorAll('[data-xtype]').forEach(b => b.classList.remove('active'));
        const typeBtn = this.container.querySelector(`[data-xtype="${p.type}"]`);
        if (typeBtn) {
            typeBtn.classList.add('active');
            document.getElementById('x-vector-fields').style.display = p.type === 'vector' ? 'block' : 'none';
        }
        document.getElementById('x-global-error').textContent = '';
        document.getElementById('x-warnings').style.display = 'none';
    }

    // ---- leer valores ----
    _val(id)        { return parseFloat(document.getElementById(id)?.value ?? 0); }
    _str(id)        { return document.getElementById(id)?.value?.trim() ?? ''; }
    _activeSel(sel) { return this.container.querySelector(`${sel} .toggle-btn.active`)?.dataset; }

    // ---- validación y generación de config ----
    _handleStart() {
        const btn  = document.getElementById('btn-start');
        btn.disabled = true;
        setTimeout(() => btn.disabled = false, 2000);

        // Config base
        const base = {
            population:       this._val('population'),
            initial_infected: this._val('initial_inf'),
            outbreak_zone:    document.getElementById('outbreak-zone')?.value,
            season:           this._activeSel('#season-toggle')?.val ?? 'dry',
            temperature:      this._val('temperature'),
            humidity:         this._val('humidity'),
            vaccination:      this._val('vaccination') / 100,
            max_days:         this._val('max_days'),
            masks_active:     (this._activeSel('#masks-toggle')?.val === 'true')
        };

        let disease;
        if (this._selected === 'x') {
            const result = this._buildDiseaseX();
            if (!result.ok) { btn.disabled = false; return; }
            disease = result.disease;
        } else {
            disease = DISEASES[this._selected];
        }

        if (this._callback) {
            this._callback({ ...base, disease });
        }
        this.hide();
    }

    _buildDiseaseX() {
        const nameEl   = document.getElementById('x-name');
        const errName  = document.getElementById('x-name-error');
        const errGlob  = document.getElementById('x-global-error');
        const warnBox  = document.getElementById('x-warnings');

        errName.textContent = '';
        errGlob.textContent = '';
        warnBox.style.display = 'none';

        const name    = this._str('x-name');
        const typeBtn = this.container.querySelector('[data-xtype].active');
        const type    = typeBtn?.dataset?.xtype ?? 'airborne';
        const d_inc   = this._val('x_d_inc');
        const d_rec   = this._val('x_d_rec');
        const alpha   = this._val('x_alpha');
        const p_base  = this._val('x_p_base');
        const cureBtn = this.container.querySelector('[data-cure].active');
        const cure    = cureBtn?.dataset?.cure ?? 'none';

        // Validaciones bloqueantes
        const reserved = ['COVID-19','Dengue','Fiebre Amarilla'];
        if (!name) { errName.textContent = 'Dale un nombre a tu virus'; nameEl?.focus(); return { ok:false }; }
        if (reserved.some(r => r.toLowerCase() === name.toLowerCase())) {
            errName.textContent = 'Ese nombre ya existe'; nameEl?.focus(); return { ok:false };
        }
        if (d_inc >= d_rec) { errGlob.textContent = 'La incubación no puede durar más que la enfermedad'; return { ok:false }; }
        if (alpha > 0.50)   { errGlob.textContent = 'Letalidad mayor al 50% hace que el virus se extinga solo'; return { ok:false }; }

        // Advertencias
        const warns = [];
        if (alpha > 0.30 && p_base > 0.50) warns.push('⚠️ Un virus así se extinguiría antes de propagarse.');
        if (d_inc > 14)  warns.push('ℹ️ 14+ días de incubación es inusualmente largo.');
        if (d_rec < 3)   warns.push('ℹ️ Menos de 3 días es difícil de observar.');
        if (warns.length) {
            warnBox.innerHTML = warns.map(w => `<div class="warn-item">${w}</div>`).join('');
            warnBox.style.display = 'block';
        }

        const formData = {
            name,
            type,
            model: type === 'airborne' ? 'SEIR_D' : type === 'vector' ? 'SEIR_VECTOR_D' : 'SIR_D',
            p_base,
            r_contagion: this._val('x_r'),
            d_inc,
            d_rec,
            alpha,
            p_grave:   this._val('x_p_grave'),
            v_sick:    this._val('x_v_sick'),
            cure_state: cure,
            has_mosquitoes: type === 'vector',
            interventions: type === 'airborne'
                ? ['masks','quarantine','vaccination','treatment']
                : type === 'vector'
                    ? ['fumigation','breeding_removal','vaccination','treatment']
                    : ['quarantine','vaccination','treatment']
        };

        if (type === 'vector') {
            formData.mosquito_initial  = this._val('x_mosq_init');
            formData.spawn_rate        = this._val('x_spawn_rate');
            formData.d_inc_m           = this._val('x_d_inc_m');
            formData.mosquito_life     = this._val('x_mosq_life');
            formData.mosquito_mortality = 1 / formData.mosquito_life;
            formData.rain_multiplier   = 3.0;
            formData.flight_radius     = 50;
            formData.attraction_radius = 20;
            formData.bite_cooldown     = 6;
            formData.fumigation_efficacy  = 0.80;
            formData.breeding_reduction   = 0.50;
        }

        return { ok: true, disease: createDiseaseX(formData) };
    }
}
