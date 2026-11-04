# Visual Design System Specification

## 1. Aesthetic Identity & Philosophy

The visual identity is defined as **Editorial Academic Minimalist with Technical Documentation Precision**.

It evokes the tactile, intellectually refined feel of a prestige educational publishing house or literary review (e.g., editorial book bindings, warm paper tones, deliberate serif headings) combined with the rigorous clarity of modern developer documentation and linear system architectures (e.g., monospace taxonomy slugs, `/01` numbered section headers, hairline borders, and pill tags).

### Core Visual Tenets

- **Warm Paper Canvas (Light) vs. Deep Slate Obsidian (Dark):** Never use sterile `#FFFFFF` as the base page background in light mode; use warm alabaster/cream. In dark mode, avoid pure `#000000`; use a warm deep obsidian/slate tone.
- **Typographic Dialectic:** High-contrast pairing between an authoritative editorial display font (Serif or refined Grotesque) and a hyper-legible, geometric sans-serif for functional data, punctuated by monospace technical accents.
- **Indexical Taxonomy (`/01 ·`, `/slug`):** Systematic use of path slashes (`/`), numerical indexes (`/01`, `/02`), and middle dots (`·`) to organize sections and items.
- **Hairline Tactility:** Structure is created through crisp `1px` borders and subtle container contrasts rather than heavy elevation drops or blurry drop shadows.

---

## 2. Color Palette & Dark Mode Interpolation

The system relies on semantic CSS custom properties designed for seamless transitions between light (warm book paper) and dark (deep academic slate) modes.

### 2.1 Color Tokens & Mapping Table

| Semantic Token            | Light Mode Value                 | Dark Mode Value                     | Purpose / Application                     |
| :------------------------ | :------------------------------- | :---------------------------------- | :---------------------------------------- |
| `--bg-canvas`             | `#FBF9F5` (Warm Alabaster/Cream) | `#0E1013` (Deep Obsidian Slate)     | Main page background                      |
| `--bg-surface`            | `#FFFFFF` (Pure White)           | `#15181E` (Elevated Charcoal Slate) | Primary card containers, panels           |
| `--bg-surface-subtle`     | `#F4F1EA` (Muted Parchment)      | `#1D212A` (Secondary Card/Tile)     | Inset panels, filter bars, code blocks    |
| `--bg-surface-hover`      | `#EFECE4` (Soft Sand Hover)      | `#252B36` (Elevated Slate Hover)    | Hover state on cards & list items         |
| `--border-subtle`         | `#EAE6DC` (Soft Hairline)        | `#232731` (Subtle Dark Hairline)    | Card borders, horizontal rules            |
| `--border-strong`         | `#D5CFBF` (Defined Border)       | `#363C4A` (Highlighted Hairline)    | Active inputs, focused cards, dividers    |
| `--text-primary`          | `#16171A` (Near Black Charcoal)  | `#F3F4F6` (Crisp Chalk White)       | Main titles, primary data text            |
| `--text-secondary`        | `#54575F` (Neutral Zinc)         | `#9CA3AF` (Muted Cool Gray)         | Descriptions, excerpts, body copy         |
| `--text-muted`            | `#82858E` (Editorial Muted)      | `#6B7280` (Dimmed Meta Gray)        | Timestamp, read times, slug prefixes      |
| `--accent-primary`        | `#B45309` (Warm Amber/Bronze)    | `#F59E0B` (Luminous Amber Gold)     | Primary actions, key callouts, highlights |
| `--accent-primary-subtle` | `rgba(180, 83, 9, 0.08)`         | `rgba(245, 158, 11, 0.12)`          | Pill badges, highlight background         |
| `--accent-secondary`      | `#1E3A8A` (Academic Navy)        | `#60A5FA` (Electric Sky Blue)       | Technical categories, secondary links     |
| `--badge-neutral-bg`      | `#EFECE4`                        | `#222631`                           | Generic taxonomy badges                   |
| `--badge-neutral-text`    | `#4B4E55`                        | `#CBD5E1`                           | Generic taxonomy badge labels             |

### 2.2 Complete CSS Variable Definition

```css
:root {
  /* Light Mode (Tactile Editorial Paper) */
  --bg-canvas: #fbf9f5;
  --bg-surface: #ffffff;
  --bg-surface-subtle: #f4f1ea;
  --bg-surface-hover: #efece4;
  --border-subtle: #eae6dc;
  --border-strong: #d5cfbf;

  --text-primary: #16171a;
  --text-secondary: #54575f;
  --text-muted: #82858e;

  --accent-primary: #b45309;
  --accent-primary-hover: #92400e;
  --accent-primary-subtle: rgba(180, 83, 9, 0.08);
  --accent-secondary: #1e3a8a;

  --badge-neutral-bg: #efece4;
  --badge-neutral-text: #4b4e55;

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-hover:
    0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
}

[data-theme="dark"],
.dark {
  /* Dark Mode (Deep Obsidian Technical Slate) */
  --bg-canvas: #0e1013;
  --bg-surface: #15181e;
  --bg-surface-subtle: #1d212a;
  --bg-surface-hover: #252b36;
  --border-subtle: #232731;
  --border-strong: #363c4a;

  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  --accent-primary: #f59e0b;
  --accent-primary-hover: #fbbf24;
  --accent-primary-subtle: rgba(245, 158, 11, 0.14);
  --accent-secondary: #60a5fa;

  --badge-neutral-bg: #222631;
  --badge-neutral-text: #cbd5e1;

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-hover: 0 10px 28px -4px rgba(0, 0, 0, 0.45);
}
```

---

## 3. Typography Hierarchy & Font Roles

The typography utilizes three distinct font families to build depth and structure:

1. **Display / Headline:** High-contrast Serif or Neo-Grotesque with character (e.g., `Newsreader`, `Fraunces`, `Playfair Display`, or high-weight `Plus Jakarta Sans`).
2. **Body / Interface:** Clean, legible, humanist/geometric sans-serif (e.g., `Plus Jakarta Sans`, `Inter`, or `system-ui`).
3. **Monospace / Metadata:** Precision mono font for indexes, slugs, metrics, and timestamps (e.g., `JetBrains Mono`, `Fira Code`, or `ui-monospace`).

### Scale & Application Guide

| Level              | Font Family               | Size                 | Weight    | Line Height | Letter Spacing | Example Use                              |
| :----------------- | :------------------------ | :------------------- | :-------- | :---------- | :------------- | :--------------------------------------- |
| **Display Hero**   | Display Serif / Grotesque | `2.5rem – 3.75rem`   | 700 / 800 | 1.1         | `-0.03em`      | Primary title ("Entender, não decorar.") |
| **Section Title**  | Sans or Display Serif     | `1.75rem – 2.25rem`  | 700       | 1.2         | `-0.02em`      | Section headings, modal titles           |
| **Card Title**     | Sans-Serif                | `1.125rem – 1.35rem` | 600 / 700 | 1.3         | `-0.015em`     | Entity title, card headline              |
| **Body Primary**   | Sans-Serif                | `0.95rem – 1.0rem`   | 400       | 1.6         | `0`            | Excerpts, descriptions, documentation    |
| **Monospace Slug** | Monospace                 | `0.75rem – 0.825rem` | 500       | 1.0         | `+0.04em`      | `/01 · Section`, `/slug`, metadata       |
| **Stat Counter**   | Sans-Serif (Tabular)      | `2.0rem – 2.75rem`   | 700       | 1.0         | `-0.02em`      | Numbers: "177", "200+", "1.987"          |
| **Stat Label**     | Sans or Monospace         | `0.75rem`            | 500 / 600 | 1.2         | `+0.05em`      | "Artigos", "Exercícios", "Vídeos"        |

---

## 4. Layout, Grid & Spatial Conventions

### Container & Margins

- **Max Container Width:** `1200px` (or `80rem` for widescreen reading).
- **Page Padding:** `px-4 sm:px-6 lg:px-8` (fluid guttering).
- **Section Spacing:** Generous vertical rhythm (`py-16` or `py-20`), creating distinct editorial "chapters".

### Grid Systems

- **Catalog / Card Grid:**
  - Mobile: `1 column`
  - Tablet (`md`): `2 columns`
  - Desktop (`lg`): `3 columns`
  - Gap: `1.5rem` (`gap-6`) or `2rem` (`gap-8`).
- **Metric / Ribbon Strip:**
  - Horizontal inline flex with divider ticks (`border-r`) or a 3-4 column balanced strip.

---

## 5. Component Anatomy & Visual Signatures

### 5.1 The Editorial Top Navigation Bar

- **Positioning:** Sticky top (`sticky top-0 z-50`) with backdrop blur (`backdrop-blur-md`).
- **Background:** Semi-transparent canvas tone (`rgba(var(--bg-canvas), 0.85)`).
- **Border:** `1px` solid `--border-subtle` running along the bottom edge.
- **Brand Wordmark:** High-contrast bold typography (`font-semibold tracking-tight`), paired with a small subtle subtitle or badge (`· Blog`).
- **Nav Links:** Understated text with subtle hover color transition; dropdowns feature a small caret (`▼` / `10px`).
- **Right CTA:** High-contrast pill or rounded rectangle button.

### 5.2 Section Header Pattern (`/0x · Pattern`)

Sections follow an indexing convention:

```html
<header class="mb-8">
  <div
    class="flex items-center gap-2 font-mono text-xs text-muted tracking-wider uppercase mb-2"
  >
    <span class="text-accent-primary font-semibold">/01</span>
    <span>·</span>
    <span>Áreas e objetivos</span>
  </div>
  <h2 class="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
    Escolha por onde aprofundar.
  </h2>
  <p class="text-secondary text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
    Descrição contextual concisa em tom editorial.
  </p>
</header>
```

### 5.3 Topic / Catalog Exploration Card

Cards feature a clean white (light) or elevated slate (dark) surface framed by a hairline border:

- **Card Container:**
  - Border: `1px solid var(--border-subtle)`.
  - Border Radius: `12px` to `16px` (`rounded-xl` or `rounded-2xl`).
  - Background: `var(--bg-surface)`.
  - Padding: `1.5rem` (`p-6`).
  - Transition: `transition-all duration-200 ease-out`.
  - Hover Effect: Subtle upward shift (`translate-y-[-2px]`), border shifts to `var(--border-strong)`, and shadow deepens to `var(--shadow-hover)`.
- **Top Badge / Kicker:**
  - Category breadcrumb with monospace slug on the left (`/slug`) or pill badge on the right.
- **Title & Description:**
  - Bold title (`font-bold text-lg text-primary`).
  - 2 to 3 lines of contextual body copy with relaxed line-height.
- **Inner Tag Chips / Sub-list:**
  - Small pills (`text-xs px-2.5 py-1 rounded-md bg-surface-subtle text-secondary font-medium hover:text-primary transition-colors`).
- **Card Footer:**
  - Metadata row separated by `·` dots (e.g., `07 mai 2026 · 12 min`).

### 5.4 Metric Strip / Counter Ribbon

A structured row displaying aggregate numbers:

- Large tabular figures (`text-3xl sm:text-4xl font-extrabold font-mono text-primary`).
- Small uppercase or title-case label below (`text-xs uppercase tracking-widest text-muted`).
- Minimalist vertical border dividing the metrics (`border-r border-subtle`).

### 5.5 Action Buttons & Interactive States

- **Primary Button:**
  - Background: `var(--text-primary)` (Dark charcoal in light mode, Off-white in dark mode) OR `var(--accent-primary)`.
  - Text: Contrast inverse (`var(--bg-canvas)` or pure white).
  - Shape: Rounded (`rounded-lg` or `rounded-full`).
  - Padding: `px-5 py-2.5`.
  - Typography: `text-sm font-semibold tracking-normal`.
- **Outline / Ghost Button:**
  - Border: `1px solid var(--border-strong)`.
  - Background: Transparent; hover fills to `var(--bg-surface-hover)`.
  - Text: `var(--text-primary)`.
- **Text Link with Arrow:**
  - Inline link ending with `→` that translates right by `2px` to `4px` on hover (`group-hover:translate-x-1 transition-transform`).

---

## 6. Micro-Interactions & Decorative Signatures

1. **Typographic Glyphs:**
   - Slash prefix: `/` highlighted in accent color before keywords, categories, and section markers.
   - Middle dot separator: `·` with spacing (`mx-2 text-muted`) for inline metadata.
   - Downward scroll indicator: `↓ O que você quer encontrar hoje?` set in muted sans/mono.
2. **Hairline Inset Dividers:**
   - Avoid chunky borders; use `1px` lines with soft opacity (`border-t border-subtle`).
3. **Smooth Theme Transition:**
   - Apply CSS transition globally for dark mode toggling:
     ```css
     body,
     .theme-transition {
       transition:
         background-color 0.25s ease,
         border-color 0.25s ease,
         color 0.25s ease;
     }
     ```

---

## 7. Tailwind CSS Configuration Reference

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          subtle: "var(--bg-surface-subtle)",
          hover: "var(--bg-surface-hover)",
        },
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          primary: "var(--accent-primary)",
          "primary-hover": "var(--accent-primary-hover)",
          "primary-subtle": "var(--accent-primary-subtle)",
          secondary: "var(--accent-secondary)",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Playfair Display", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        card: "14px",
        chip: "6px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-hover)",
      },
    },
  },
  plugins: [],
};
```

---

## 8. Archetype Layout Skeleton

```html
<div class="min-h-screen bg-canvas text-content-primary font-sans antialiased">
  <!-- Sticky Nav -->
  <nav
    class="sticky top-0 z-50 backdrop-blur-md bg-canvas/85 border-b border-border-subtle"
  >
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="font-bold text-lg tracking-tight">BRAND NAME</span>
        <span class="text-xs font-mono text-content-muted">/ ARCHIVE</span>
      </div>
      <div class="flex items-center gap-4">
        <!-- Theme Switcher -->
        <button
          class="p-2 text-content-secondary hover:text-content-primary rounded-lg border border-border-subtle"
        >
          ☀ / ☾
        </button>
        <button
          class="px-4 py-2 text-xs font-semibold rounded-lg bg-content-primary text-canvas hover:opacity-90 transition"
        >
          Action Button
        </button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <main class="max-w-6xl mx-auto px-6 py-16 sm:py-24">
    <div class="max-w-3xl">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-xs font-mono text-accent-primary mb-6"
      >
        <span>system identifier</span>
        <span>·</span>
        <span>edition 2026</span>
      </div>
      <h1
        class="text-4xl sm:text-6xl font-extrabold tracking-tight text-content-primary leading-[1.08] mb-6 font-serif"
      >
        Title statement with editorial weight.
      </h1>
      <p class="text-lg sm:text-xl text-content-secondary leading-relaxed mb-8">
        Subtext explaining the mission or purpose with calm, articulate
        typography and high readability.
      </p>

      <!-- Metric Strip -->
      <div
        class="grid grid-cols-3 border-y border-border-subtle py-6 my-10 gap-4"
      >
        <div>
          <div
            class="text-3xl sm:text-4xl font-extrabold font-mono text-content-primary"
          >
            128
          </div>
          <div class="text-xs uppercase tracking-wider text-content-muted mt-1">
            Total Entries
          </div>
        </div>
        <div class="border-l border-border-subtle pl-4 sm:pl-8">
          <div
            class="text-3xl sm:text-4xl font-extrabold font-mono text-content-primary"
          >
            42
          </div>
          <div class="text-xs uppercase tracking-wider text-content-muted mt-1">
            Active Branches
          </div>
        </div>
        <div class="border-l border-border-subtle pl-4 sm:pl-8">
          <div
            class="text-3xl sm:text-4xl font-extrabold font-mono text-content-primary"
          >
            99.4%
          </div>
          <div class="text-xs uppercase tracking-wider text-content-muted mt-1">
            Stability Index
          </div>
        </div>
      </div>
    </div>

    <!-- Section 01 -->
    <section class="mt-16">
      <header class="mb-8">
        <div
          class="flex items-center gap-2 font-mono text-xs text-content-muted tracking-wider uppercase mb-2"
        >
          <span class="text-accent-primary font-bold">/01</span>
          <span>·</span>
          <span>Section Taxonomy</span>
        </div>
        <h2
          class="text-2xl sm:text-3xl font-bold tracking-tight text-content-primary"
        >
          Structured Index Grid
        </h2>
      </header>

      <!-- Card Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Interactive Card -->
        <article
          class="p-6 rounded-card bg-surface border border-border-subtle hover:border-border-strong hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span
                class="font-mono text-xs text-accent-primary bg-accent-primary-subtle px-2 py-0.5 rounded"
                >/category-tag</span
              >
              <span class="text-xs text-content-muted">sub-badge</span>
            </div>
            <h3 class="text-lg font-bold text-content-primary mb-2">
              Entity Headline
            </h3>
            <p class="text-sm text-content-secondary leading-relaxed mb-6">
              Concise summary describing the attributes and characteristics of
              this entity item.
            </p>
          </div>
          <div
            class="pt-4 border-t border-border-subtle flex items-center justify-between"
          >
            <span class="text-xs text-content-muted font-mono"
              >v6.12 · rolling</span
            >
            <span
              class="text-xs font-semibold text-content-primary hover:text-accent-primary transition-colors"
            >
              Details →
            </span>
          </div>
        </article>
      </div>
    </section>
  </main>
</div>
```
