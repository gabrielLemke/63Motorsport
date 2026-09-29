---
name: antigravity-design-expert
description: >-
  Specialized in engineering high-performance, modern, interactive web interfaces with Tailwind CSS,
  dark-mode aesthetics, micro-interactions, responsive layouts, and clean frontend components.
  Activate when building web frontends, landing pages, or interactive dashboards.
---

# Antigravity Design Expert: Interactive Frontend Engineering

This skill equips the agent with patterns and component recipes to build modern, sleek, and high-performance websites with a premium aesthetic.

---

## 1. Dark Aesthetic & Surface Depth

Modern dark themes are never pure flat `#000000` everywhere. Use layered depth:

- **Base Canvas (Level 0)**: `#090A0C` or `#0B0C10` (Dark background).
- **Surface Elevation 1 (Cards, Sections)**: `#121318` with subtle border `border border-white/[0.08]`.
- **Surface Elevation 2 (Dropdowns, Modals, Hovered Cards)**: `#1B1C22` with border `border-white/[0.12]`.
- **Glassmorphism / Glass Panels**: `bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl`.
- **Inner Accent Glows**: Subtle ambient gradients using radial gradients:
  `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-transparent to-transparent`.

---

## 2. Interactive Component Patterns

### Button System
- **Primary CTA**: High-contrast, sharp or slightly rounded:
  `inline-flex items-center justify-center px-6 py-3 font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)]`
- **Secondary Ghost**:
  `inline-flex items-center justify-center px-6 py-3 font-semibold text-zinc-300 bg-zinc-900/60 border border-zinc-700/80 rounded-lg hover:bg-zinc-800 hover:text-white transition-all`
- **Action Pulse Badge**:
  `inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 rounded-full`

### Modern Bento Grid / Showcase Cards
```html
<div class="group relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 transition-all duration-300 hover:border-zinc-600 hover:-translate-y-1">
  <div class="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
  <!-- Card Header with Icon -->
  <div class="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-white mb-6 group-hover:border-zinc-500 transition-colors">
    <!-- SVG Icon -->
  </div>
  <h3 class="text-xl font-bold text-white mb-2">Service Title</h3>
  <p class="text-zinc-400 text-sm leading-relaxed mb-6">Service description and technical value.</p>
  <div class="flex items-center text-sm font-semibold text-white group-hover:translate-x-1 transition-transform">
    Saiba mais &rarr;
  </div>
</div>
```

---

## 3. Performance & Responsive Guidelines

- **Mobile First**: Design from 375px up to 1440px+ (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Touch Targets**: Minimum 44x44px for buttons and interactive links on mobile.
- **Images & Media**: Always specify `aspect-ratio`, `object-cover`, and `loading="lazy"` for project galleries.
- **Icons**: Use clean inline SVGs or Lucide icons with consistent stroke-width (1.75px or 2px).
