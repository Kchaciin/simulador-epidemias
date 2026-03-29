---
description: Sistema de diseño completo del simulador - paleta, tipografía, componentes, espaciado, animaciones. Estilo inspirado en interfaces de Linux/macOS con estética dark premium.
---

# Design System — Simulador de Epidemias

## Filosofía de diseño

El simulador debe verse como un **centro de control epidemiológico de alta tecnología** — inspirado en dashboards de Linux (KDE Plasma, GNOME), interfaces de macOS, y estética de terminales modernas como Warp o Hyper. El usuario debe sentir que está operando un sistema profesional de monitoreo, no una tarea universitaria.

**Palabras clave del diseño:** Minimalista. Oscuro. Elegante. Inmersivo. Tecnológico. Silencioso.

**NO hacer:** Bordes gruesos, colores chillones, sombras duras, fondos blancos, emojis en la UI, gradientes arcoíris, bordes redondeados excesivos, Comic Sans.

---

## Paleta de colores

### Fondos (capas de profundidad)

```css
--bg-void: #06060a;           /* Capa más profunda, detrás de todo */
--bg-primary: #0a0a0f;        /* Fondo principal de la app */
--bg-elevated: #111118;       /* Cards, paneles, elementos elevados */
--bg-surface: #16161f;        /* Inputs, dropdowns, elementos interactivos */
--bg-hover: #1c1c28;          /* Estado hover de elementos */
```

### Bordes y separadores

```css
--border-subtle: rgba(255, 255, 255, 0.06);   /* Bordes apenas visibles */
--border-default: rgba(255, 255, 255, 0.10);   /* Bordes normales */
--border-strong: rgba(255, 255, 255, 0.16);    /* Bordes de enfoque */
```

### Texto

```css
--text-primary: #e4e4e7;      /* Texto principal — alto contraste */
--text-secondary: #a1a1aa;    /* Etiquetas, descripciones */
--text-muted: #52525b;        /* Texto desactivado, placeholders */
--text-accent: #818cf8;       /* Links, texto destacado */
```

### Colores semánticos (estados epidemiológicos)

```css
--color-susceptible: #4ade80;  /* Verde menta — sano */
--color-exposed: #facc15;      /* Amarillo cálido — incubando */
--color-infected: #ef4444;     /* Rojo — contagioso */
--color-infected-grave: #b91c1c; /* Rojo oscuro — caso grave */
--color-recovered: #38bdf8;    /* Azul cielo — inmune */
--color-dead: #71717a;         /* Gris zinc — fallecido */
--color-vaccinated: #a78bfa;   /* Violeta — protegido */
--color-mosquito: #94a3b8;     /* Gris azulado — vector sano */
--color-mosquito-inf: #fb923c; /* Naranja — vector infectado */
```

### Colores de acción (botones de intervención)

```css
--action-primary: #6366f1;     /* Indigo — acción principal */
--action-primary-hover: #818cf8;
--action-success: #22c55e;     /* Verde — vacunar, curar */
--action-danger: #ef4444;      /* Rojo — fumigar, emergencia */
--action-warning: #f59e0b;     /* Ámbar — cuarentena */
--action-neutral: #64748b;     /* Gris — pausar, detener */
```

### Glow y sombras

```css
--glow-primary: 0 0 20px rgba(99, 102, 241, 0.15);
--glow-success: 0 0 20px rgba(34, 197, 94, 0.15);
--glow-danger: 0 0 20px rgba(239, 68, 68, 0.15);
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
--shadow-dropdown: 0 8px 32px rgba(0, 0, 0, 0.6);
```

---

## Tipografía

### Fuente principal: Inter

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Fuente monoespaciada (para datos numéricos)

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
```

### Escala tipográfica

| Uso | Tamaño | Peso | Font | Ejemplo |
|---|---|---|---|---|
| Título de app | 20px | 600 | Inter | "Simulador de Epidemias" |
| Título de sección | 13px | 600 | Inter | "ESTADÍSTICAS" |
| Etiqueta | 12px | 500 | Inter | "Susceptibles" |
| Valor numérico grande | 28px | 700 | JetBrains Mono | "247" |
| Valor numérico pequeño | 14px | 500 | JetBrains Mono | "R₀ = 2.4" |
| Texto de cuerpo | 13px | 400 | Inter | Descripciones |
| Tooltip / hint | 11px | 400 | Inter | "Presiona para aplicar" |
| Botón | 12px | 600 | Inter | "VACUNAR" |

### Regla de oro

> Los números SIEMPRE se muestran en **JetBrains Mono**. El texto descriptivo SIEMPRE en **Inter**.

---

## Espaciado

Sistema basado en múltiplos de 4px (como Apple HIG):

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Border radius

```css
--radius-sm: 6px;       /* Botones pequeños, badges */
--radius-md: 8px;       /* Botones normales, inputs */
--radius-lg: 12px;      /* Cards, paneles */
--radius-xl: 16px;      /* Modales, pantalla de config */
--radius-full: 9999px;  /* Píldoras, toggles */
```

---

## Componentes

### Card (glassmorphism sutil)

```css
.card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-card);
}
```

**Regla:** El glassmorphism debe ser SUTIL. Si puedes notar que hay blur, es demasiado. El efecto es casi invisible — solo una ligera diferencia con el fondo.

### Botón primario

```css
.btn-primary {
    background: var(--action-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-4);
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background: var(--action-primary-hover);
    box-shadow: var(--glow-primary);
    transform: translateY(-1px);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-primary.active {
    box-shadow: var(--glow-primary), inset 0 0 0 1px rgba(255,255,255,0.1);
}
```

### Botón de intervención (con icono)

```css
.btn-intervention {
    background: var(--bg-surface);
    color: var(--text-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.btn-intervention:hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
    color: var(--text-primary);
}

.btn-intervention.active {
    border-color: var(--action-primary);
    color: var(--action-primary);
    box-shadow: var(--glow-primary);
}
```

### Slider / Range input

```css
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: var(--bg-surface);
    border-radius: var(--radius-full);
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--action-primary);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--bg-primary);
    box-shadow: var(--glow-primary);
    transition: transform 0.15s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}
```

### Toggle switch

```css
.toggle {
    width: 36px;
    height: 20px;
    background: var(--bg-surface);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
}

.toggle.active {
    background: var(--action-primary);
    border-color: var(--action-primary);
}

.toggle::after {
    content: '';
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.toggle.active::after {
    transform: translateX(16px);
}
```

### Contador numérico

```css
.counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3);
}

.counter-value {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;  /* Números de ancho fijo */
}

.counter-label {
    font-family: var(--font-sans);
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    margin-top: var(--space-1);
}
```

### Indicador de R₀

```css
.r-indicator {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 600;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    text-align: center;
    transition: all 0.3s ease;
}

.r-indicator.danger {
    color: var(--color-infected);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.r-indicator.warning {
    color: var(--color-exposed);
    background: rgba(250, 204, 21, 0.1);
    border: 1px solid rgba(250, 204, 21, 0.2);
}

.r-indicator.safe {
    color: var(--color-susceptible);
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.2);
}
```

---

## Animaciones

### Principios

1. **Duración máxima: 300ms.** Nada debe sentirse lento.
2. **Usa `cubic-bezier` para rebotes sutiles**, no `linear`.
3. **Solo anima `transform` y `opacity`** — nunca `width`, `height` ni `top/left` (causan reflow).
4. **Los contadores usan transición numérica**, no aparecen de golpe.

### Transiciones base

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
```

### Fade in de elementos

```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-in {
    animation: fadeIn 0.3s var(--transition-smooth) forwards;
}
```

### Pulse para agentes infectados graves

```css
@keyframes pulse-danger {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}
```

### Efecto de lluvia (partículas CSS)

```css
@keyframes rain {
    from { transform: translateY(-10px); opacity: 0.6; }
    to { transform: translateY(100vh); opacity: 0; }
}

.rain-particle {
    width: 1px;
    height: 12px;
    background: rgba(96, 165, 250, 0.3);
    animation: rain 0.8s linear infinite;
}
```

---

## Layout

### Grid principal

```css
.app-layout {
    display: grid;
    grid-template-rows: 48px 1fr 56px;
    grid-template-columns: 1fr 320px;
    grid-template-areas:
        "header header"
        "map    sidebar"
        "footer footer";
    height: 100vh;
    overflow: hidden;
}

@media (max-width: 768px) {
    .app-layout {
        grid-template-columns: 1fr;
        grid-template-rows: 48px 50vh 1fr 56px;
        grid-template-areas:
            "header"
            "map"
            "sidebar"
            "footer";
    }
}
```

### Header

```css
.header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-4);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-subtle);
}
```

### Sidebar (dashboard)

```css
.sidebar {
    grid-area: sidebar;
    background: var(--bg-elevated);
    border-left: 1px solid var(--border-subtle);
    padding: var(--space-4);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

/* Scrollbar estilizado */
.sidebar::-webkit-scrollbar {
    width: 4px;
}
.sidebar::-webkit-scrollbar-track {
    background: transparent;
}
.sidebar::-webkit-scrollbar-thumb {
    background: var(--border-default);
    border-radius: var(--radius-full);
}
```

---

## Iconografía

No usar librerías de iconos pesadas. Usar caracteres Unicode o SVGs inline mínimos:

| Concepto | Representación |
|---|---|
| Susceptible | Círculo verde `●` |
| Infectado | Círculo rojo `●` |
| Velocidad | `▶` / `⏸` / `⏩` |
| Lluvia | SVG de gota (4 líneas) |
| Temperatura | SVG de termómetro (4 líneas) |
| Vacuna | SVG de jeringa (4 líneas) |

---

## Inspiración visual

El diseño debe evocar estas interfaces:

- **KDE Plasma** — Paneles oscuros con blur sutil, bordes finos
- **macOS Ventura** — Tipografía limpia, espaciado generoso, profundidad de capas
- **Warp Terminal** — Colores vibrantes sobre fondo oscuro profundo
- **GitHub Dark** — Contraste medido, texto legible, jerarquía visual clara
- **Grafana dashboards** — Gráficas sobre fondo negro, contadores numéricos grandes
- **NASA Mission Control** — Profesionalismo extremo, densidad de información controlada

---

## Anti-patrones (NUNCA hacer)

| No hacer | Hacer en su lugar |
|---|---|
| Fondo blanco o gris claro | Fondo `#0a0a0f` siempre |
| Bordes de 2px o más | Bordes de 1px con baja opacidad |
| `border-radius: 20px+` | Máximo 16px en cards, 8px en botones |
| Sombras `box-shadow: 0 0 10px black` | Sombras difuminadas con baja opacidad |
| Colores saturados al 100% | Colores con ligera desaturación para elegancia |
| Texto en negrita por todas partes | Negrita solo en títulos y valores numéricos |
| Gradientes coloridos | Fondos sólidos o gradientes sutiles de oscuro a más oscuro |
| Animaciones de más de 300ms | Transiciones rápidas, 150–300ms máximo |
| `font-size` menor a 10px | Mínimo 10px para legibilidad |
| Espaciado inconsistente | Siempre múltiplos de 4px |
