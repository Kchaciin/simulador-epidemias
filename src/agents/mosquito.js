// ============================================
// Agente Mosquito (Aedes aegypti)
// Responsable: Kendall Chacín
// Fuente: Modelado §3.2 Dengue — Ciclo de Vida del Mosquito
//         §3.0 Tabla Maestra — Parámetros del mosquito
// ============================================

import { Agent } from './agent.js';

/**
 * Agente mosquito Aedes aegypti.
 * Se mueve con random walk dentro de su radio de vuelo.
 * Puede infectar humanos (picadura) y ser infectado por humanos.
 *
 * Estados: 'S' (sano) | 'E' (incubando) | 'I' (infectado)
 * No existen estados R, D naturales — muere por mortalidad diaria.
 */
export class Mosquito extends Agent {
    /**
     * @param {number} id - ID único
     * @param {{ lat: number, lng: number }} spawnPosition - Punto de nacimiento (criadero)
     * @param {Object} config - Config de la enfermedad activa (Dengue o FA)
     */
    constructor(id, spawnPosition, config) {
        super(id, 'mosquito', spawnPosition);

        this.state = 'S';                               // 'S' | 'E' | 'I'

        // --- Origen ---
        this.spawnPosition = { ...spawnPosition };      // Criadero de origen
        this.spawnNodeId = null;                        // ID del nodo criadero

        // --- Ciclo de vida ---
        this.ticksAlive = 0;                            // Edad en ticks (desde spawn)
        this.biteCooldown = 0;                          // Ticks restantes antes de picar

        // --- Parámetros del config de enfermedad ---
        // Todos en metros según Tabla Maestra
        this.flightRadiusM = config.flight_radius_m ?? 100;      // Radio de vuelo (m)
        this.attractionRadiusM = config.attraction_radius_m ?? 5; // Radio detección CO₂ (m)
        this.biteCooldownMax = config.bite_cooldown_ticks ?? 4;   // Cooldown entre picaduras
        this.incubationTicks = (config.d_inc_m ?? 10) * 24;      // Ticks de incubación E→I
        this.dailyMortality = config.mosquito_mortality ?? 0.05;  // Mortalidad diaria
    }

    /**
     * Color visual en el Canvas según estado.
     * Sobreescribe el getter de Agent con colores propios del mosquito.
     */
    get color() {
        return this.state === 'I' ? '#FF5722' : '#BDBDBD'; // Naranja infectado / Gris sano
    }

    /** Radio visual siempre 2px para mosquitos */
    get radius() { return 2; }

    /**
     * Evalúa si el mosquito muere este tick por mortalidad natural.
     * La humedad alta reduce la mortalidad (mosquitos viven más con H > 75%).
     *
     * @param {number} humidity - Humedad actual (%)
     * @param {number} humidityThreshold - Umbral de humedad para mosquitos (75%)
     * @returns {boolean} true si muere este tick
     */
    evaluateNaturalDeath(humidity, humidityThreshold = 75) {
        // Mortalidad diaria → por tick
        const mortalityPerTick = this.dailyMortality / 24;

        // Modificador de humedad:
        //   H > 75% → mosquitos viven más (×0.70)
        //   H ≤ 75% → mortalidad aumentada (×1.50)
        const humidityMod = humidity > humidityThreshold ? 0.70 : 1.50;

        return Math.random() < (mortalityPerTick * humidityMod);
    }

    /**
     * Evalúa la maduración de E → I (incubación extrínseca completada).
     * Determinista: ocurre exactamente al tick d_inc_m × 24 (con varianza opcional).
     *
     * La temperatura acelera la incubación:
     *   T > 30°C → incubación 15% más rápida
     *
     * @param {number} temperature - Temperatura actual (°C)
     * @returns {boolean} true si transicionó a I
     */
    evaluateIncubation(temperature) {
        if (this.state !== 'E') return false;

        // Temperatura acelera el ciclo del virus dentro del mosquito
        const tempMod = temperature > 30 ? 0.85 : 1.0;
        const adjustedIncubation = Math.round(this.incubationTicks * tempMod);

        if (this.ticksInState >= adjustedIncubation) {
            this.changeState('I');
            return true;
        }
        return false;
    }

    /**
     * ¿Puede picar ahora? (cooldown agotado)
     * @returns {boolean}
     */
    canBite() {
        return this.alive && this.state === 'I' && this.biteCooldown === 0;
    }

    /**
     * Registra una picadura y activa el cooldown.
     * Debe llamarse después de confirmar contagio.
     */
    registerBite() {
        this.biteCooldown = this.biteCooldownMax;
    }

    /**
     * Mueve el mosquito con random walk dentro de su radio de vuelo.
     * Permanece cerca del criadero de origen (no viaja más de flight_radius_m).
     *
     * El desplazamiento por tick simula ~2-5 m de vuelo errático.
     * La conversión a coordenadas: 1° lat ≈ 111km → 1m ≈ 0.000009°
     */
    randomWalk() {
        if (!this.alive) return;

        // Desplazamiento aleatorio pequeño (~2–5 metros por tick)
        const stepM = 2 + Math.random() * 3;
        const DEG_PER_METER = 0.000009;

        const angle = Math.random() * 2 * Math.PI;
        const newLat = this.position.lat + Math.cos(angle) * stepM * DEG_PER_METER;
        const newLng = this.position.lng + Math.sin(angle) * stepM * DEG_PER_METER;

        // Comprobar que no se aleja más de flight_radius_m del criadero
        const distFromSpawn = haversineMeters(
            this.spawnPosition.lat, this.spawnPosition.lng,
            newLat, newLng
        );

        if (distFromSpawn <= this.flightRadiusM) {
            this.position.lat = newLat;
            this.position.lng = newLng;
        }
        // Si se pasaría del límite, simplemente no se mueve este tick
    }

    /**
     * Avanza el estado interno del mosquito por 1 tick.
     * Llamar desde el game loop principal.
     *
     * @param {number} temperature - Temperatura actual
     * @param {number} humidity - Humedad actual
     * @returns {{ died: boolean, matured: boolean }}
     */
    tick(temperature, humidity) {
        if (!this.alive) return { died: false, matured: false };

        this.ticksAlive++;
        this.ticksInState++;

        // Reducir cooldown de picadura
        if (this.biteCooldown > 0) this.biteCooldown--;

        // Mortalidad natural
        if (this.evaluateNaturalDeath(humidity)) {
            this.alive = false;
            return { died: true, matured: false };
        }

        // Maduración E → I
        const matured = this.evaluateIncubation(temperature);

        // Movimiento
        this.randomWalk();

        return { died: false, matured };
    }
}

/**
 * Distancia en metros entre dos coordenadas (Haversine).
 * Función auxiliar local para no crear dependencia circular con collision.js
 */
function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Radio Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180)
        * Math.cos(lat2 * Math.PI / 180)
        * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
