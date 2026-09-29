---
name: ui-ux-pro-max
description: >-
  Provides comprehensive UI/UX design intelligence, typography hierarchy, color harmonic systems,
  spacing scales, accessible contrast standards, and responsive web component guidelines.
  Use this skill whenever designing or developing user interfaces, landing pages, or web layouts.
---

# UI/UX Pro Max: Design Intelligence & Standards

This skill guides the agent in crafting high-conversion, visually striking, and technically solid web designs, avoiding generic AI tropes.

---

## 1. Anti-AI Design Biases (What NOT to Do)

- **Avoid the generic AI look**: Do NOT use over-saturated purple/pink neon gradients everywhere.
- **Avoid low-contrast text**: Do NOT use `#666` or `#888` on dark backgrounds. Ensure minimum WCAG AA contrast (4.5:1 for body, 3:1 for large headers).
- **Avoid cluttered cards**: Don't cram every feature into identical cards with generic circular icons.
- **Avoid floaty layouts**: Give elements clear grounding, structural alignment, and purposeful hierarchy.

---

## 2. Spacing & Sizing Scale (8-Point Grid)

Use multiples of 8px (or 4px for fine-tuning) for margin, padding, and gaps:

| Token | Pixels | Tailwind | Primary Usage |
| :--- | :--- | :--- | :--- |
| `2xs` | 4px | `p-1` / `gap-1` | Badges, micro tags, borders |
| `xs` | 8px | `p-2` / `gap-2` | Icon button padding, small chip gap |
| `sm` | 12px | `p-3` / `gap-3` | Compact card padding, button padding |
| `md` | 16px | `p-4` / `gap-4` | Standard card inner spacing, list gaps |
| `lg` | 24px | `p-6` / `gap-6` | Major card padding, modal content padding |
| `xl` | 32px | `p-8` / `gap-8` | Section inner spacing |
| `2xl` | 48px | `py-12` | Grid gaps, small section dividers |
| `3xl` | 64px-96px | `py-16` / `py-24` | Hero section padding, major landing blocks |

---

## 3. Typography Pairing & Hierarchy

### Typographic Hierarchy Rules
1. **Hero Display (H1)**: 48px - 72px (font-extrabold or font-black, tight tracking `-0.03em`).
2. **Section Headings (H2)**: 32px - 44px (font-bold, tracking `-0.02em`).
3. **Sub-headings (H3)**: 20px - 24px (font-semibold).
4. **Body Text**: 16px (1rem), line-height `1.6` to `1.7` (`leading-relaxed`), text color at least 85% opacity.
5. **Labels / Overlines**: 12px - 14px (uppercase, tracking `0.1em`, font-semibold, muted color).

---

## 4. Layout Architecture for Landing Pages

Every high-performance landing page should follow this rhythmic flow:

1. **Header / Navbar**: Sticky or fixed, backdrop-blur (`backdrop-blur-md bg-black/60`), logo, primary links, high-contrast CTA button.
2. **Hero Section**:
   - Compelling value proposition headline.
   - 2-line supporting subtext.
   - Primary CTA (e.g. "Agendar Consulta / Orçamento") + Secondary CTA (e.g. "Conhecer Projetos").
   - Trust proof (e.g. "+15 anos de pista", "+500 motores preparados", "Dinamômetro calibrado").
3. **Services / Capabilities Grid**: Asymmetric or 3-column layout highlighting key competencies.
4. **Visual Proof / Showcase**: High-res imagery, before & after dyno charts, project vehicle spotlight.
5. **Workflow / Methodology**: 3 to 4 clear steps of how the client interacts with the business.
6. **Social Proof & Testimonials**: Real customer reviews, vehicle models worked on.
7. **Final High-Conversion CTA**: Direct contact via WhatsApp with pre-filled message, address, and Google Maps pin.
8. **Footer**: Clean legal, social links, location, and operating hours.

---

## 5. Accessibility & Micro-Interactions

- Always define `:hover`, `:focus-visible`, and `:active` states.
- Maintain smooth transitions: `transition-all duration-300 ease-out`.
- Add interactive cues like subtle border glows (`hover:border-zinc-500`), subtle scale (`hover:-translate-y-1`), and active state feedback.
- Accessible keyboard navigation: every interactive element must have a visible focus ring (`focus-visible:ring-2 focus-visible:ring-white`).
