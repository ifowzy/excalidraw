# Fowzy Design System & Theme Specifications

This document defines the exact visual identity, color palette, typography, border mathematics, shadow geometry, component tokens, and subpage templates for **fowzy.site**. Use this reference whenever creating new subpages, case studies, or UI modules to ensure pixel-perfect consistency across the entire site.

---

## 1. Core Color Palette

### Primary Canvas & Neutrals
| Token Name | Hex / Class | Usage |
| :--- | :--- | :--- |
| **Root Background** | `#FAFAFA` / `bg-[#FAFAFA]` | Base viewport canvas background for all pages |
| **Card / Surface White** | `#FFFFFF` / `bg-white` | Content blocks, panels, containers, modals |
| **Ink Black (Borders & Text)**| `#000000` / `border-black`, `text-black` | All neobrutalist borders, primary headers, hard drop-shadows |
| **Muted Grey Surface** | `#F8F8F8` / `bg-[#F8F8F8]` | Image placeholders, table headers, code card backgrounds |
| **Secondary Input Grey** | `#F3F3F5` / `bg-[#F3F3F5]` | Input fields, search bars, nested containers |
| **Subtle Border/Divider** | `rgba(0, 0, 0, 0.1)` | Subtle internal separators (when black is too heavy) |

### Signature Neobrutalist Accent Colors
| Accent Name | Hex Code | Tailwind Equivalent | Purpose & Component Usage |
| :--- | :--- | :--- | :--- |
| **Cyber Canary Yellow** | `#FFE66D` | `bg-[#FFE66D]` | Default text selection (`::selection`), featured gradients, primary tags, grayscale toggle inactive |
| **Vibrant Coral Red** | `#FF6B6B` | `bg-[#FF6B6B]` | Hero emphasis text, chaos/friction tags, destruction/warning markers, decorative circles |
| **Sunset Orange** | `#FF7F50` | `bg-[#FF7F50]` | Navigation CTA ("Design Process"), primary action buttons |
| **Mint Teal** | `#4ECDC4` | `bg-[#4ECDC4]` | Navigation ("Map"), clarity/solution tags, positive KPI metrics |
| **Soft Seafoam Green** | `#95E1D3` | `bg-[#95E1D3]` | Secondary background cards, success state badges, decorative geometric floaters |
| **Electric System Blue** | `#2563EB` | `bg-[#2563EB]` | External links, technical architecture splines, system diagram markers |
| **Pastel Lavender** | `#D4A5FF` | `bg-[#D4A5FF]` | Version badges, experimental playground items, category tag variation |

### Theme Gradients
- **Featured Card Gradient**: `bg-gradient-to-br from-[#FFE66D] via-[#4ECDC4] to-[#FF6B6B]`
- **Featured Tag Gradient**: `bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D]`
- **Hero Title Accent**: `text-[#FF6B6B]`

---

## 2. Typography System

All Google Fonts are preloaded in `/src/styles/fonts.css`.

| Role | Font Family | Weights | CSS / Tailwind Declaration | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Headings & Display** | `Bricolage Grotesque` | `700`, `800`, `900` | `font-['Bricolage_Grotesque'] font-black` | H1, H2, H3 titles, page headers, logo |
| **Body & Longform** | `Host Grotesk` / `Bricolage Grotesque` | `400`, `500`, `600` | `font-sans leading-relaxed text-black` | Paragraphs, case study narratives, bullet lists |
| **Code & Technical Mono** | `Roboto Mono` | `400`, `500`, `700` | `font-mono` / `style={{ fontFamily: 'Roboto Mono, monospace' }}` | Badges, tags, metric counters, timestamps, breadcrumbs, button labels |
| **Handwritten Annotations** | `Caveat` | `600`, `700` | `font-['Caveat'] text-xl sm:text-2xl` | Editorial callouts, designer notes, playful scribbles |

### Type Hierarchy Scale
- **Display Hero H1**: `text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95]`
- **Section H2**: `text-2xl sm:text-4xl md:text-5xl font-black tracking-tight`
- **Card H3**: `text-xl sm:text-2xl md:text-3xl font-black`
- **Subheaders**: `text-lg sm:text-xl font-bold`
- **Body Regular**: `text-base sm:text-lg leading-relaxed text-black/90`
- **Tags & Metadata**: `text-xs sm:text-sm font-mono font-bold uppercase tracking-wider`

---

## 3. Neobrutalist Geometry & Shadow Math

The visual identity relies on **high-contrast black borders** paired with **zero-blur directional drop-shadows** and **tactile hover offsets**.

### Border Scale
- **Hero Containers & Major Cards**: `border-[3px] sm:border-[4px] border-black`
- **Buttons, Navbars & Input Fields**: `border-[2px] sm:border-[3px] border-black`
- **Small Badges & Nested Dividers**: `border-[2px] border-black`

### Hard Shadow & Hover Translation Matrix
```css
/* Standard Button / Interactive Chip */
box-shadow: 4px 4px 0px 0px #000000;
/* Class: shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] */

/* Hover Behavior: moves up-left by 2px to 4px and expands shadow */
hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]

/* Deep Card Hover (Major Project Cards) */
hover:translate-x-[-6px] hover:translate-y-[-6px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
```

### Corner Radius Rules
- **Standard Cards & Buttons**: Strictly **`rounded-none`** (0px border-radius) for true neobrutalism.
- **Pills / Circles (Exceptions)**: `rounded-full` is used exclusively for the Grayscale Mode toggle, decorative floating geometric balls, and status dots.

---

## 4. Reusable UI Components & Tokens

### A. Primary Action Button
```tsx
<button className="flex items-center gap-2 px-6 py-3 bg-[#FF7F50] text-black font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer font-mono text-sm sm:text-base uppercase tracking-wider">
  <span>Explore Case Study</span>
  <ArrowRight size={18} className="stroke-[3]" />
</button>
```

### B. Secondary / Category Button
```tsx
<button className="flex items-center gap-2 px-6 py-3 bg-[#4ECDC4] text-black font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer font-mono text-sm sm:text-base uppercase tracking-wider">
  <span>Service Design</span>
</button>
```

### C. Standard Neobrutalist Card
```tsx
<div className="bg-white border-[3px] sm:border-[4px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
  {/* Category Tag */}
  <span className="inline-block px-3 py-1 mb-4 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider border-[2px] border-black">
    B2B Platform
  </span>

  <h3 className="text-2xl font-black mb-3">Project Title</h3>
  <p className="text-base leading-relaxed text-black/80">
    Summary description of the work and outcome.
  </p>
</div>
```

### D. Featured Hero / Spotlight Card
```tsx
<div className="bg-gradient-to-br from-[#FFE66D] via-[#4ECDC4] to-[#FF6B6B] border-[4px] border-black p-2 sm:p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
  <div className="bg-white/95 backdrop-blur-sm border-[3px] border-black p-6 sm:p-8">
    <div className="inline-block px-3 py-1 bg-black text-white font-mono text-xs font-black uppercase mb-4">
      ⭐ Featured Case Study
    </div>
    <h2 className="text-3xl font-black mb-4">Tactful CX Studio</h2>
    <p className="text-lg leading-relaxed mb-6">Designing the conversational intelligence pipeline.</p>
  </div>
</div>
```

### E. Metric / KPI Callout Block
```tsx
<div className="border-[3px] border-black bg-[#FFE66D] p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
  <div className="text-3xl sm:text-4xl font-black font-mono text-black">4.8x</div>
  <div className="text-xs font-bold font-mono uppercase tracking-wider text-black/80 mt-1">
    Conversion Velocity
  </div>
</div>
```

---

## 5. Global Top Navbar & Footer Specifications

To ensure subdomain pages (or any decoupled micro-frontend / subpage) feel like a unified part of **fowzy.site**, always replicate the exact fixed Navbar and expressive Footer patterns.

### A. Top Navigation Bar (`Navigation.tsx`)

The navigation bar is **fixed to the viewport top** with a high `z-index: 50`, solid white background (`#FFFFFF`), a bold black bottom border (`3px` mobile, `4px` desktop), and a max container constraint of `1440px`.

#### Key Navigation Tokens
- **Container**: `fixed top-0 left-0 right-0 z-50 bg-white border-b-[3px] sm:border-b-[4px] border-black`
- **Inner Wrapper**: `max-w-[1440px] mx-auto px-4 sm:px-8 py-3 sm:py-6 flex items-center justify-between`
- **Logo**: `font-['Bricolage_Grotesque'] text-xl sm:text-2xl font-black tracking-tight text-black` with hover spring scaling (`scale: 1.05`)
- **Grayscale Toggle Button**:
  - Circle `rounded-full`, `w-8 h-8 sm:w-11 sm:h-11`, `border-[2px] sm:border-[3px] border-black`
  - Inactive State: `bg-[#FFE66D] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFEAA7]`
  - Active State: `bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800`
- **Primary Nav CTA ("Design Process")**:
  - Background: `bg-[#FF7F50]` (Sunset Orange)
  - Style: `border-[2px] sm:border-[3px] border-black font-bold px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base`
  - Hover: `hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- **Secondary Nav CTA ("Map")**:
  - Background: `bg-[#4ECDC4]` (Mint Teal)
  - Style: `border-[2px] sm:border-[3px] border-black font-bold px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base`
  - Hover: `hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`

---

### B. Global Footer (`Footer.tsx`)

The footer provides high-contrast call-to-action cards, animated floating decorative shapes, social connection buttons with heavy 8px hard drop shadows, and the signature Retro Game Boy navigator.

#### Key Footer Tokens
- **Container**: `py-24 px-4 sm:px-8 max-w-[1440px] mx-auto text-center`
- **Hero Title**: `text-4xl sm:text-5xl md:text-6xl font-black mb-12` with gentle infinite breathing scale (`[1, 1.02, 1]` over 3s)
- **Social Action Buttons**:
  - `border-[4px] border-black font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-6px] hover:translate-y-[-6px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
  - Email Button: `bg-[#FF6B6B]` (Coral Red)
  - LinkedIn Button: `bg-[#4A90E2]` (LinkedIn Electric Blue)
  - Figma Button: `bg-[#FFE66D]` (Cyber Canary Yellow)
- **Floating Geometric Accents**:
  - Seafoam Square (`bg-[#95E1D3]` `border-[4px] border-black` w-16 h-16, rotating 360° & vertical bobbing)
  - Coral Circle (`bg-[#FF6B6B]` `rounded-full` `border-[4px] border-black` w-12 h-12, pulsing scale & horizontal bobbing)
- **Copyright Monospace Line**: `font-mono text-sm opacity-60 mt-12` (`© 2026 Islam Fowzy | hello@fowzy.site`)

---

## 7. Grayscale Mode Rules
- The global layout supports a **Grayscale Mode Toggle** in the navigation bar.
- Any background or container you build will automatically adapt cleanly to monochrome.
- **Media Preservation**: When adding real project screenshots, Figma prototypes, or product demo videos, add the class **`preserve-color`** to the container/image so it remains in full color when users toggle grayscale mode.

---

## 8. Quick Copy-Paste Class Quick Reference
- Canvas background: `bg-[#FAFAFA]`
- Neobrutalist card: `bg-white border-[3px] sm:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`
- Yellow Accent: `bg-[#FFE66D]`
- Coral Accent: `bg-[#FF6B6B]`
- Orange CTA: `bg-[#FF7F50]`
- Teal Accent: `bg-[#4ECDC4]`
- Mint/Seafoam: `bg-[#95E1D3]`
- Monospace label: `font-mono text-xs font-bold uppercase tracking-wider`
- Bold heading: `font-['Bricolage_Grotesque'] font-black tracking-tight`
