---
name: Organic Biospheric Dashboard
colors:
  surface: '#e9ffec'
  surface-dim: '#c7e0cc'
  surface-bright: '#e9ffec'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e1fae5'
  surface-container: '#dbf4df'
  surface-container-high: '#d5efd9'
  surface-container-highest: '#d0e9d4'
  on-surface: '#0b2013'
  on-surface-variant: '#424843'
  inverse-surface: '#203527'
  inverse-on-surface: '#def7e2'
  outline: '#737972'
  outline-variant: '#c2c8c1'
  surface-tint: '#4a6452'
  primary: '#486250'
  on-primary: '#ffffff'
  primary-container: '#607b67'
  on-primary-container: '#f6fff5'
  inverse-primary: '#b1ceb7'
  secondary: '#5a605c'
  on-secondary: '#ffffff'
  secondary-container: '#dee4df'
  on-secondary-container: '#606662'
  tertiary: '#4f6054'
  on-tertiary: '#ffffff'
  tertiary-container: '#68796c'
  on-tertiary-container: '#f6fff5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ccead2'
  primary-fixed-dim: '#b1ceb7'
  on-primary-fixed: '#072012'
  on-primary-fixed-variant: '#334c3b'
  secondary-fixed: '#dee4df'
  secondary-fixed-dim: '#c2c8c3'
  on-secondary-fixed: '#171d1a'
  on-secondary-fixed-variant: '#424845'
  tertiary-fixed: '#d5e7d7'
  tertiary-fixed-dim: '#b9cbbc'
  on-tertiary-fixed: '#101f15'
  on-tertiary-fixed-variant: '#3b4a3f'
  background: '#e9ffec'
  on-background: '#0b2013'
  surface-variant: '#d0e9d4'
typography:
  display-lg:
    fontFamily: manrope
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 54px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: manrope
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 42px
    letterSpacing: -0.02em
  display-md:
    fontFamily: manrope
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 42px
    letterSpacing: -0.02em
  display-md-mobile:
    fontFamily: manrope
    fontSize: 28px
    fontWeight: '300'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0em
  title-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: manrope
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-desktop: 1.5rem
  margin-desktop: 2.5rem
  margin-mobile: 1rem
---

## Brand & Style

This design system embodies an organic minimalist and biophilic ethos, calibrated specifically for eco-technologies, sustainable monitoring systems, environmental IoT, and high-end sensory wellness dashboards. It bridges physical hardware tranquility with digital precision, inspired by industrial water-harvesting interfaces and quiet scientific instrumentation.

The visual style is characterized by:
- **Organic Soft Minimalist Foundation**: Uncluttered spatial pacing paired with chalky, warm neutral canvas tones (`#f0f2ee` and `#f4f4f2`) replacing sterile digital whites.
- **Biophilic Translucency & Frosted Glass**: Soft botanical sage tones spanning from delicate mist to deep spruce green, rendered with translucent layered finishes, frosted card backdrops, and fine gauge rings.
- **Sculptural Tactility**: Smooth, pebble-like radiuses, continuous circular orbital layouts, and tactile dark-charcoal pill actions (`#1e2421`) that ground the delicate light interface with deliberate tactile weight.
- **Quiet Typography**: Extremely light, airy display numerals coupled with crisp, understated technical geometric sans typography.

## Colors

The color palette centers on botanical sage hues balanced by warm off-white mineral tones and weighted with carbon charcoal.

### Palette Architecture
- **Primary (`#6d8874`)**: Balanced mid-tone sage green. Serves as the primary active indicator, key gauge fill, chart trajectories, and focal accents.
- **Secondary (`#1e2421`)**: Deep carbon-forest charcoal. Anchors high-priority actions, pill toggles, primary CTA backgrounds, and active state switchbars.
- **Tertiary (`#b5c7b8`)**: Pale mist sage. Used for frosted container backdrops, segmented curved selector controls, secondary chart series, and ring tracks.
- **Neutral (`#8ea693`)**: Weathered herb tone. Bridges text hierarchy, inactive metric units, secondary glyphs, and mid-level status accents.

### Surface Canvas & Tonal Tokens
- **Canvas Base**: `#f0f2ee` (Warm limestone grey-white).
- **Surface Card (Opaque)**: `#f7f8f6`.
- **Surface Tinted Frosted Card**: `rgba(181, 199, 184, 0.38)` with `backdrop-filter: blur(24px)`.
- **Deep Accent Frosted Panel**: `rgba(109, 136, 116, 0.65)` with `backdrop-filter: blur(32px)`.
- **Text Primary**: `#1e2421` (Soft charcoal carbon).
- **Text Secondary / Unit**: `#6d7870` (Subdued olive-grey).
- **Text Muted / Ticks**: `#9da99e` (Pale botanical tint).
- **Border / Subtle Rings**: `rgba(110, 136, 116, 0.18)` and dotted indicator rings `rgba(30, 36, 33, 0.25)`.

## Typography

Typography relies on `manrope` across all levels to retain clean, geometric purity and balanced openness. Numerical readouts rely on thin (`300`) weights to provide architectural elegance rather than aggressive tabular heaviness.

- **Display Numbers (`display-lg`, `display-md`)**: Used for live sensor readings (such as solar intensity, volume, temperature, and percentage ratios). Numerical digits are set light and spacious; accompanying unit labels (`W/m3`, `L`, `C`, `%`) are positioned alongside at `body-md` or `label-md` in muted tones.
- **Labels & Status Badges (`label-sm`)**: Set with increased letter-spacing (`+0.04em`) to maintain legibility at tiny scale inside status pills, orbital nodes, and graph legends.
- **Headings & Titles**: Keep weights moderate (`400` to `500`) to sustain an airy, clinical, yet warm atmosphere.

## Layout & Spacing

The layout is built upon a 12-column adaptive grid designed around central circular focal points and surrounding telemetry panels.

### Structural Flow
- **Top Metrics Bar**: Horizontal fluid span running across the upper viewport, grouping key atmospheric indicators with ample symmetrical spacing.
- **Triptych Dashboard Layout (Desktop)**:
  - **Left Rail (3-4 cols)**: System storage summary, modular list items, device cards, and emergency controls.
  - **Center Stage (4-5 cols)**: Radial focus area containing the primary orbital sphere, satellite node bubbles, arc selector buttons, and lower floating dock controls.
  - **Right Telemetry Panel (3-4 cols)**: Translucent, frosted sage vertical container presenting detailed line graphs, production volume histories, and secondary contextual adjustments.
- **Responsive Adaptations**:
  - **Desktop (>= 1280px)**: 3-column split view with absolute alignment around the orbital hub.
  - **Tablet (768px - 1279px)**: 2-column stacking with telemetry rail collapsing beneath the primary circular overview.
  - **Mobile (< 768px)**: Single column linear hierarchy. The central orbital node scales down to `260px` diameter, with peripheral satellite nodes converted into an interactive horizontal swipe carousel.

## Elevation & Depth

Visual hierarchy is established without heavy dark drop shadows. Instead, depth is produced through a combination of tonal layered surfaces, ambient tinted diffusions, and frosted refraction.

- **Level 0 (Base Canvas)**: `#f0f2ee` matte flat plane.
- **Level 1 (Subtle Inset / Outlined Cards)**: `#f7f8f6` with a delicate outer border: `1px solid rgba(110, 136, 116, 0.14)` and an ambient shadow: `0 4px 20px -2px rgba(60, 75, 65, 0.04)`.
- **Level 2 (Translucent Frosted Greenery)**: Surface fill `rgba(181, 199, 184, 0.42)`, `backdrop-filter: blur(28px) -webkit-backdrop-filter: blur(28px)`, with an internal top-lit border `1px solid rgba(255, 255, 255, 0.5)` and a diffused tinted cast `0 12px 32px -4px rgba(45, 65, 52, 0.08)`.
- **Level 3 (Tactile Charcoal Elements)**: Solid `#1e2421` buttons and docks with soft dark diffusion: `0 8px 24px -4px rgba(30, 36, 33, 0.3)`.
- **Level 4 (Spherical & Radial Volumes)**: Rendered using multi-stop radial gradients (e.g. from `#dce6de` at the illuminated center to `#8ea693` at the outer perimeter) combined with fine inset highlights to create physical dome dimensionality.

## Shapes

The shape system is heavily curved and organic, defined by pill geometries, circular discs, and ultra-rounded containers (`roundedness: 3`).

- **Macro Containers & Cards**: Feature `rounded-xl` (1.5rem to 2rem) corner radiuses, softening edge boundaries and mimicking molded bio-hardware.
- **Interactive Controls & Chips**: Fully pill-shaped (`border-radius: 9999px`).
- **Data Nodes & Orbital Elements**: Strictly `50%` spherical or circular discs.
- **Radial Segment Controls**: Curved arc wedges that follow the circumference of the central status sphere.

## Components

### Buttons & Pill Controls
- **Primary Pill Action**: Background `#1e2421`, text `#f7f8f6`, `border-radius: 9999px`, padding `10px 24px`. On hover, surface shifts to `#2a322e` with slight scale elevation (`1.02`).
- **Secondary Glass Action**: Background `rgba(255, 255, 255, 0.6)`, border `1px solid rgba(110, 136, 116, 0.2)`, text `#1e2421`.
- **Danger / Stop Action**: Charcoal pill housing with inline squared stop icon badge in `#f7f8f6`.

### Cards & Side Panels
- **Standard Metric Card**: Light limestone tone (`#f7f8f6`), `28px` corner radius, hairline outline `rgba(110, 136, 116, 0.15)`.
- **Telemetry Frosted Panel**: Tinted translucent backdrop (`rgba(181, 199, 184, 0.45)`), rounded to `32px`, integrated close icon at top right, and white translucent internal divider lines (`rgba(255, 255, 255, 0.3)`).

### Gauge & Chart Elements
- **Radial Semicircle Meter**: Pale dotted circumferential guide ring, filled with continuous radial gradient (`#95ad9b` to `#627c69`), displaying central volumetric value.
- **Sparklines & Production Graphs**: Soft semi-transparent white curve overlaying faint vertical frequency bars (`rgba(255, 255, 255, 0.5)`), with glowing focal coordinate points and pill-shaped tooltips (`rgba(30, 36, 33, 0.7)`).

### Orbital Satellite Nodes
- **Sub-pod Bubbles**: Small circular disks (`48px` to `72px`) tinted in pale mist tones (`rgba(240, 242, 238, 0.85)`), displaying pod identifiers and battery/capacity micro-badges floating tangent to the primary center sphere.

### Lists & Modular Rows
- **Device Status Rows**: Subtle dividerless flex items with muted gear and dropdown arrows, battery indicators, and tiny monospace status tags (`Active`, `49%`).