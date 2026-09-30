---
name: Dublin Consulting
description: A transit-map consultancy site on a soft slate ground, near-white ink and one electric cyan.
colors:
  ground: "#000000"
  panel: "#0a0a0a"
  panel-raised: "#121212"
  ink: "#ededed"
  ink-muted: "#a1a1a1"
  hairline: "#1f1f1f"
  rule: "#3d3d3d"
  signal-cyan: "#22d3ee"
  signal-cyan-hover: "#67e8f9"
  on-signal: "#04121a"
  invalid-red: "#b3261e"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 4.4vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "4px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4vw, 48px)"
  section: "clamp(64px, 9vw, 120px)"
  row: "28px"
  gap: "12px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  button-primary-hover:
    backgroundColor: "#ffffff"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  nav-cta:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "9px 20px"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
  tech-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px 10px 12px"
  input:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "13px 14px"
  contact-form:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    padding: "clamp(24px, 4vw, 40px)"
  tile:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
---

# Design System: Dublin Consulting

## Overview

**Creative North Star: "The Transit Map"**

The site is drawn like a metro diagram on an instrument-black field. Each solution is a line, and lines are told apart by stroke pattern (solid, double, dashed, dotted, long-short, hairline, tick), never by hue. Colour is nearly absent: near-white ink on true black, with one electric cyan reserved for the hub, focus, and interactive response. Structure comes from ruled lines and route metaphors (the method is a six-stop route, lists are ruled), not from cards and shadows.

Density is editorial and calm: large tightly-set display type against generous section padding, muted grey supporting copy, and authored vector artwork (in `img/art`) under dark scrims rather than photography or stock icons. Motion is one authored moment (the map is drawn left to right once) plus quiet 12px reveals.

**Key Characteristics:**
- True black ground with two barely-lifted panel tones; no light theme.
- One accent (cyan), used sparingly; ink itself does most of the emphasis.
- Stroke pattern is the identity of each solution line.
- Pills for actions and filter chips; 4px for every container and field.
- Ruled, borderless-card lists: 3px ink rule on top, 1px hairline between rows.

## Colors

A monochrome instrument palette with a single cyan signal.

### Primary
- **Signal Cyan** (`signal-cyan`): the only chromatic colour. Hub label and glow on the map, focus rings (3px), input focus border and 3px halo, hover on nav CTA and chips, chevron on solution hover, form status text, the WhatsApp float, text selection. Hover variant `signal-cyan-hover`. Text on cyan is `on-signal`.

### Neutral
- **Instrument Black** (`ground`): page, navbar, footer.
- **Panel Black** (`panel`) and **Raised Panel** (`panel-raised`): statement band, method field, form, chips, tiles; raised for inputs and the mega-menu.
- **Near-White Ink** (`ink`): headings, body emphasis, primary button fill, map strokes and stations.
- **Muted Grey** (`ink-muted`): body copy under headings, nav links at rest, descriptions.
- **Hairline** (`hairline`) and **Rule** (`rule`): 1px row dividers and section borders; rule for input, chip, and ghost-nav borders.
- **Invalid Red** (`invalid-red`): `:user-invalid` field border only.

### Named Rules
**The One Signal Rule.** Cyan is the sole accent and marks response and focus, never decoration or line identity.
**The Pattern Not Hue Rule.** Solution lines are distinguished by stroke pattern; never assign them colours.

## Typography

**Display Font:** Bricolage Grotesque (Arial Narrow, system-ui fallback)
**Body Font:** Figtree (system-ui fallback)

**Character:** A characterful grotesque with tight negative tracking for headlines against a plain, friendly humanist sans for reading.

### Hierarchy
- **Display** (800, clamp 2.4rem to 3.75rem, 0.98): the home h1; inner-page h1 scales to 4.25rem.
- **Headline** (700, clamp 1.9rem to 3rem, 1.05): section titles; the statement band uses 500 weight at up to 2.6rem, bold for emphasis.
- **Title** (700, clamp 1.3rem to 1.75rem, 1.1): solution names, project names (1.45rem), tile titles (up to 3rem).
- **Body** (400, 1.0625rem, 1.6): running text; lead paragraphs 1.125 to 1.3rem at 1.5, capped near 30 to 34em.
- **Label** (Figtree 500 to 700, 0.9 to 0.95rem): nav, chips, form labels, step and card h3 (h3 is Figtree, 1.2 line-height).

### Named Rules
**The Two Voices Rule.** Bricolage speaks for headings and station names; Figtree does everything else. Do not add a third family.

## Layout

A 1200px container with a fluid gutter (`gutter`, 20 to 48px). Sections breathe with `section` padding (64 to 120px). Two-column splits run 0.8fr / 1.2fr with a sticky heading column at 104px; the hero pairs copy with the transit map. Solutions sit in a two-column grid with the final item spanning full width; the method is a six-column route (four on inner pages) that collapses to three, then to a vertical rail at 640px. Breakpoints: 1024px (columns collapse), 860px (mobile nav, hero stack), 640px (single column; the map swaps station labels for a text legend). Row rhythm is 28px vertical padding per list row.

## Elevation & Depth

Flat by default. Depth is tonal: ground, panel, raised panel, separated by 1px hairlines. The only shadows are the mega-menu drop (`0 18px 40px -18px rgba(0,0,0,.8)`), the cyan glow on the map hub (`drop-shadow(0 0 6px rgba(34,211,238,.7))`), and the input focus halo (`0 0 0 3px rgba(34,211,238,.28)`). A faint white radial glow sits behind the hero map.

### Named Rules
**The Tonal Depth Rule.** Separate surfaces with panel tone and hairlines; shadows are only for floating menus and cyan focus or hub glow.

## Shapes

Two radii only: pill (999px) for buttons, nav CTA, and link chips; 4px for inputs, forms, tech chips, tiles, mega menu, and the nav toggle. Circles for step stations and the WhatsApp float. Solution rows carry no box; a stroke-pattern bar (3 to 11px tall) sits on the row's top edge. Tiles crop authored SVG artwork under a black gradient scrim.

## Components

### Buttons
- **Shape:** pill (999px), 14px 26px padding, Figtree 600 at 1rem.
- **Primary:** near-white fill, black text; hover to pure white.
- **Ghost:** 1.5px ink border, transparent; hover inverts to ink fill with black text.
- **Press:** scale(.97); arrow icon nudges 4px on hover. Hover effects only under `(hover: hover) and (pointer: fine)`.

### Chips
- **Link chip** (pill, panel fill, rule border): hover shifts border to cyan and fill to raised panel.
- **Tech chip** (4px, panel fill) with a ring-station marker before the label.

### Cards / Containers
Lists replace cards. Ruled lists (projects, deliverables, contact, FAQ) use a 3px ink top rule and 1px hairline rows; hover moves row content 8 to 10px right by transform, with no layout shift. The contact form is the one boxed container (panel, rule border, 3px ink top border, 4px radius).

### Inputs / Fields
Raised-panel fill, 1px rule border, 4px radius, 13px 14px padding. Hover brightens border to ink; focus turns border cyan with a 3px cyan halo; cyan caret; invalid border red. Checkbox uses cyan accent.

### Navigation
Sticky black bar, 68px, hairline bottom border. Links Figtree 500 muted grey, ink on hover; outlined pill CTA. A mega-menu (320px, raised panel, 4px) lists solutions with icons. Under 860px it becomes a full-width drop panel behind a 44px toggle.

### Transit Map (signature)
Inline SVG in the hero and a single-line variant on each solution page. Stations are black discs with a 3px ink stroke; the hub is labelled in cyan display type with glow. Hovering a line dims the others to .28 opacity. The map is drawn once by a clip-path wipe (1.1s).

### Stroke-Pattern Bars
Each solution owns a pattern used on its map line, its list row, and its page hero top edge: solid 8px, double 11px, dashed 6px, dotted 6px, long-short 6px, hairline 3px, ticks 8px.

## Do's and Don'ts

### Do:
- **Do** keep the ground true black and reserve cyan for focus, response, and the hub.
- **Do** identify solutions by stroke pattern and reuse the same pattern on map, list, and page.
- **Do** use pills for buttons and link chips and 4px for everything else.
- **Do** build lists as ruled rows (3px ink top rule, 1px hairline) and move hover content with transform.
- **Do** use inline stroke SVG icons and authored SVG artwork from `img/art`.
- **Do** honor `prefers-reduced-motion` and gate hover effects to fine pointers.

### Don't:
- **Don't** colour-code lines or add a second accent hue.
- **Don't** introduce a light theme, gradient text, or drop-shadowed cards.
- **Don't** add a third typeface or set headings in Figtree at display size.
- **Don't** animate layout properties; use transform and opacity.

