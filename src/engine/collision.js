// ============================================
// Detección de Proximidad y Contagio
// Responsable: Kendall Chacín
// Fuente: Modelado §3.0 Tabla Maestra — Probabilidades de contagio
//         §5.0 Motor de Enfermedades — Tipos de transmisión
// ============================================

/**
 * Calcula la distancia en metros entre dos coordenadas geográficas.
 * Algoritmo: Haversine (preciso para distancias cortas en escala urbana).
 *
 * @param {number} lat1 @param {number} lng1
 * @param {number} lat2 @param {number} lng2
 * @returns {number} Distancia en metros
 */
export function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180)
        * Math.cos(lat2 * Math.PI / 180)
        * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * ¿Están dos agentes dentro de un radio en metros?
 *
 * @param {Agent} a
 * @param {Agent} b
 * @param {number} radiusM - Radio en metros
 * @returns {boolean}
 */
export function isInRange(a, b, radiusM) {
    return haversineMeters(
        a.position.lat, a.position.lng,
        b.position.lat, b.position.lng
    ) <= radiusM;
}

// ============================================
// TIPO 1 — Contagio aéreo (COVID, TB)
// Modelo acumulativo por ticks de exposición
// P(contagio) = 1 - (1 - p_tick)^n
// ============================================

/**
 * Evalúa el contagio aéreo entre un Susceptible y todos los Infectados.
 * Modelo: P = 1 - (1 - p_base · K_int · K_mask · K_clima)^n
 *
 * n = ticksJuntos (ticks acumulados dentro del radio)
 * Nota TB: solo evalúa cuando n >= config.t_min_exposure (5 ticks)
 *
 * @param {Human[]} humans - Todos los humanos vivos
 * @param {Object} config - Config de la enfermedad
 * @param {Object} climate - Estado climático actual { isRaining, temperature, humidity }
 * @param {Object} interventions - { masksActive, quarantineActive }
 * @param {number} tick - Tick actual
 * @returns {Array<{ susceptible: Human, infector: Human }>} Lista de contagios ocurridos
 */
export function evaluateAirborneContagion(humans, config, climate, interventions, tick) {
    const newContagions = [];
    const masksActive = interventions?.masksActive ?? false;

    // Filtrar agentes relevantes (vivos, no muertos)
    const susceptibles = humans.filter(h => h.alive && h.state === 'S');
    const infected = humans.filter(h => h.alive && ['I', 'I1', 'I2'].includes(h.state));

    if (susceptibles.length === 0 || infected.length === 0) return newContagions;

    // Radio activo según mascarillas
    const radiusM = masksActive
        ? (config.r_mask_m ?? config.r_contagion_m * 0.5)
        : config.r_contagion_m;

    for (const s of susceptibles) {
        const sNode = s.currentNode;

        for (const inf of infected) {
            // Deben estar en el mismo nodo o muy cerca
            if (!_sameOrAdjacentLocation(s, inf, radiusM)) continue;

            // ---- Modificadores de la fórmula ----

            // K_int: multiplicador interior
            const K_int = (sNode?.is_closed) ? (config.K_interior ?? 2.0) : 1.0;

            // K_mask: reducción por mascarillas
            const K_mask = masksActive ? (config.K_mask ?? 0.30) : 1.0;

            // K_clima: calor exterior reduce aerosoles
            const K_clima = climate.getAirborneModifier
                ? climate.getAirborneModifier(sNode?.is_closed)
                : 1.0;

            // ---- TB: modelo de exposición acumulada ----
            if (config.model === 'SEIRL_D') {
                // Solo en interiores (TB no se contagia eficientemente en exterior)
                if (!sNode?.is_closed) continue;

                // K_UV = 0.05 si exterior (no aplica aquí ya que solo interior)
                const K_vent = sNode?.has_ventilation ? (config.K_vent ?? 0.40) : 1.0;

                // Acumular ticks de co-presencia
                const prev = s.exposure.get(inf.id) ?? 0;
                const accumulated = prev + 1;
                s.exposure.set(inf.id, accumulated);

                // Solo evaluar si supera umbral mínimo (5 horas)
                if (accumulated < (config.t_min_exposure ?? 5)) continue;

                const p_tick = (config.p_base ?? 0.03) * K_int * K_vent;
                if (Math.random() < p_tick) {
                    newContagions.push({ susceptible: s, infector: inf });
                    s.exposure = new Map(); // Resetear exposición al infectarse
                    break; // Un susceptible solo puede infectarse una vez por tick
                }

            } else {
                // ---- COVID / estándar: acumulativo por ticks ----
                // Usamos ticksJuntos = 1 por diseño simplificado
                // (el modelo completo acumula con ticksJuntos real, lo refinamos en Fase 2)
                const p_tick = (config.p_base ?? 0.05) * K_int * K_mask * K_clima;

                if (Math.random() < p_tick) {
                    newContagions.push({ susceptible: s, infector: inf });
                    break;
                }
            }
        }
    }

    return newContagions;
}

// ============================================
// TIPO 2 — Contagio vectorial (Dengue, FA)
// Evento discreto: 1 dado por picadura
// ============================================

/**
 * Evalúa el contagio vectorial entre mosquitos y humanos.
 * El mosquito pica → 1 dado con p_mh → falla sin acumular.
 * Cooldown: el mosquito no puede volver a picar por bite_cooldown_ticks.
 *
 * También evalúa la dirección inversa: humano infectado → mosquito sano.
 *
 * @param {Human[]} humans - Humanos vivos
 * @param {Mosquito[]} mosquitoes - Mosquitos vivos
 * @param {Object} config - Config de la enfermedad (DENGUE o YELLOW_FEVER)
 * @param {number} tick - Tick actual
 * @returns {{ humanContagions: Array, mosquitoContagions: Array }}
 */
export function evaluateVectorContagion(humans, mosquitoes, config, tick) {
    const humanContagions = [];
    const mosquitoContagions = [];

    const liveMosquitoes = mosquitoes.filter(m => m.alive && m.canBite());
    const susceptibleHumans = humans.filter(h => h.alive && h.state === 'S');
    const infectedHumans = humans.filter(h => h.alive && ['I', 'I1', 'I2'].includes(h.state));
    const susceptibleMosquitoes = mosquitoes.filter(m => m.alive && m.state === 'S');

    const attractionR = config.attraction_radius_m ?? 5;

    // --- Mosquito infectado → Humano susceptible ---
    for (const mosq of liveMosquitoes) {
        if (mosq.state !== 'I') continue;

        for (const human of susceptibleHumans) {
            if (!isInRange(mosq, human, attractionR)) continue;

            // Evento discreto: 1 dado
            if (Math.random() < (config.p_mh ?? 0.50)) {
                humanContagions.push({ susceptible: human, mosquito: mosq });
                mosq.registerBite();
                break; // Un mosquito pica 1 humano por vez
            } else {
                // Falla → cooldown igual (el mosquito se "agotó" intentando)
                mosq.registerBite();
                break;
            }
        }
    }

    // --- Humano infectado → Mosquito susceptible ---
    for (const mosq of susceptibleMosquitoes) {
        for (const human of infectedHumans) {
            if (!isInRange(mosq, human, attractionR)) continue;

            if (Math.random() < (config.p_hm ?? 0.50)) {
                mosquitoContagions.push({ susceptible: mosq, infector: human });
                break;
            }
        }
    }

    return { humanContagions, mosquitoContagions };
}

// ============================================
// Función de mortalidad/recuperación (Cuadrática)
// Usada desde simulation.js para I → R|D
// ============================================

/**
 * Evalúa transición estocástica con distribución cuadrática.
 * El riesgo se concentra al FINAL de la enfermedad (modelo realista).
 *
 * f(t) = 3·(t/T)²/T   donde T = d_rec × 24
 * P(transición en tick t) = prob_total × f(t)
 *
 * @param {number} ticksInState - Ticks acumulados en el estado actual
 * @param {number} dRecDays - Duración total de recuperación en días
 * @param {number} probTotal - Probabilidad total acumulada (ej: 0.02 para muerte)
 * @returns {boolean} true si ocurre la transición este tick
 */
export function evaluateQuadratic(ticksInState, dRecDays, probTotal) {
    const T = dRecDays * 24;    // Total en ticks
    if (T <= 0 || ticksInState <= 0) return false;
    const f_t = 3 * Math.pow(ticksInState / T, 2) / T;
    return Math.random() < (probTotal * f_t);
}

// ============================================
// Helper privado
// ============================================

/**
 * ¿Están dos agentes en la misma ubicación relevante para contagio?
 * Usa radio en metros si están en tránsito, o mismo nodo si están estáticos.
 */
function _sameOrAdjacentLocation(a, b, radiusM) {
    // Si ambos están en el mismo nodo, son vecinos epidemiológicos
    if (a.currentNode && b.currentNode && a.currentNode.id === b.currentNode.id) {
        return true;
    }
    // Si están en tránsito cerca el uno del otro
    return isInRange(a, b, radiusM);
}
