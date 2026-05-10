---
name: The Library
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#414845'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717975'
  outline-variant: '#c0c8c3'
  surface-tint: '#3c6658'
  primary: '#033327'
  on-primary: '#ffffff'
  primary-container: '#1f4a3d'
  on-primary-container: '#8cb9a8'
  inverse-primary: '#a3d0bf'
  secondary: '#7b5800'
  on-secondary: '#ffffff'
  secondary-container: '#fdc34d'
  on-secondary-container: '#715000'
  tertiary: '#2e2d29'
  on-tertiary: '#ffffff'
  tertiary-container: '#44433e'
  on-tertiary-container: '#b2b0a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#beecda'
  primary-fixed-dim: '#a3d0bf'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#244e41'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#f7bd48'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#e6e2db'
  tertiary-fixed-dim: '#c9c6c0'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#484742'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Literata
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Literata
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  max-width-content: 800px
---

## Brand & Style

This design system centers on a **Scholar-Tactile** aesthetic, blending the intellectual rigor of a vintage Oxford reading room with the streamlined utility of modern productivity software. The brand personality is scholarly, focused, and timeless—designed to evoke the quiet, industrious atmosphere of a physical archive.

The visual style is a sophisticated hybrid of **Minimalism** and **Tactile/Skeuomorphic** influences. Rather than modern shadows or glass effects, depth is communicated through material-accurate color shifts and thin, "inked" borders. The interface prioritizes long-form reading and deep focus, using traditional editorial layouts to make digital workspace features feel like an evolving manuscript or a personal collection of rare books.

## Colors

The color palette is strictly informed by organic materials: parchment, heavy ink, and library architectural details. 

- **Parchment (#FAF6EF)**: Used for the primary canvas. Pure white is strictly prohibited to reduce eye strain and maintain the vintage feel.
- **Elevated Panels (#F5EFE0)**: A slightly darker, warmer tone used for sidebars, cards, and modal backdrops to create subtle hierarchy.
- **Deep Forest Green (#1F4A3D)**: The primary action color, used for buttons, active states, and primary brand markers.
- **Gilt Gold (#B8860B)**: Reserved for highlights, citations, and "premium" intellectual markers.
- **Ink (#1A1A1A)**: The universal text color, providing high legibility against parchment backgrounds.
- **Aged Paper (#D4C9A8)**: The structural color used for all UI borders and dividers.

## Typography

This design system utilizes a classic serif-driven hierarchy to reinforce its academic roots. 

**Playfair Display** is used for all headings, lending a sense of history and elegance to the page structure. **Literata** (chosen for its excellent on-screen readability and "bookish" feel) handles all body text and UI labels. **JetBrains Mono** is reserved for technical citations and code blocks, mimicking the look of typewritten notes or archival cataloging codes.

Typography should favor generous line heights to ensure comfortable reading sessions. Mobile scales should reduce display sizes by approximately 20% to maintain vertical rhythm on narrower screens.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach for document views and a **Fluid Sidebar** approach for navigation. To mimic the experience of reading a book, the primary content container is capped at 800px width, centered on the screen with wide margins.

- **Grid:** A 12-column system is used for dashboard layouts, while single-column layouts are preferred for the workspace.
- **Rhythm:** A 4px baseline grid ensures consistent vertical alignment.
- **Desktop:** Features a persistent left-hand "Shelf" (sidebar) for navigation.
- **Mobile:** The "Shelf" collapses into a bottom sheet, and margins are reduced to 16px to maximize reading area.

## Elevation & Depth

In this design system, depth is achieved through **structural outlines and tonal shifts** rather than shadows. 

1.  **Borders:** All interactive or elevated elements (cards, menus, buttons) use a solid 1px border in **Aged Paper (#D4C9A8)**.
2.  **Layers:** Higher-level elements, such as modals or flyouts, use the **Elevated Panels (#F5EFE0)** background color.
3.  **Active Depth:** When an item is clicked or "pressed," it does not sink; instead, its border thickness remains the same while the background color shifts slightly deeper to indicate a physical press.
4.  **No Shadows:** Standard box-shadows are strictly avoided to maintain the flat, parchment-like aesthetic.

## Shapes

The shape language is conservative and restrained, reflecting traditional bookbinding and furniture. 

- **Buttons & Small Elements:** Use a 4px radius, providing a hint of softness without feeling overly modern or "bubbly."
- **Cards & Workspace Panels:** Use an 8px radius to frame content comfortably.
- **Inputs:** Maintain sharp corners on the top with a distinct 1px underline, mimicking a ledger entry line.

## Components

### Buttons
Primary buttons are solid **Forest Green** with Ink-colored text (or Parchment for high contrast). Secondary buttons use an **Aged Paper** border with a transparent background. All buttons use the 4px radius.

### Inputs & Forms
Inputs are styled as "ledger lines." They feature no background or side borders, only a 1px bottom border in **Ink**. On focus, the border transitions to **Gilt Gold**.

### Cards
Cards use the **Elevated Panels** background with an 8px radius and a 1px **Aged Paper** border. Header sections within cards are separated by a 1px horizontal rule.

### Icons
- **System Icons:** Thin-stroke, 1.5pt weight.
- **Specialty Icons:** The "Open-book" SVG is used for study sessions. The "Garden" feature uses hand-drawn, organic plant SVGs in **Forest Green** to represent growth and knowledge accumulation.

### Lists & Navigation
Navigation items in the sidebar use a subtle **Gilt Gold** left-border treatment when active. List items use horizontal dividers rather than boxes to maintain a clean, manuscript feel.