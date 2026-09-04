---
name: 音格 · 中古音韵反射矩阵
description: A dense archival workbench for comparing stable Middle Chinese slots across reflex layers.
colors:
  paper: "#f6f7f4"
  paper-raised: "#ffffff"
  paper-muted: "#eceeeb"
  paper-blue: "#edf2f5"
  ink: "#171b1d"
  ink-secondary: "#42494d"
  ink-tertiary: "#6d7578"
  missing-ink: "#626a6d"
  rule: "#d4d8d4"
  rule-strong: "#b9c0bc"
  mineral-blue: "#245a72"
  mineral-blue-deep: "#173f52"
  mineral-blue-pale: "#dce9ee"
  mineral-blue-wash: "#eef5f7"
  provenance-warning: "#8a4a32"
  focus-blue: "#1f6f93"
typography:
  display:
    fontFamily: '"Charis SIL", "Doulos SIL", "Noto Sans", sans-serif'
    fontSize: "21px"
    fontWeight: 650
  headline:
    fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 720
    letterSpacing: "-0.01em"
  title:
    fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "12px"
    fontWeight: 700
  body:
    fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "12px"
    fontWeight: 400
  label:
    fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "9px"
    fontWeight: 400
    letterSpacing: "0.05em"
  data-character:
    fontFamily: '"Noto Serif CJK SC", "Source Han Serif SC", serif'
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1
  mono:
    fontFamily: 'ui-monospace, "SFMono-Regular", Consolas, monospace'
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.06em"
rounded:
  square: "0"
  segmented-state: "2px"
  compact: "3px"
  control: "4px"
components:
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 11px"
    height: "34px"
  button-layer-active:
    backgroundColor: "{colors.mineral-blue}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.body}"
    rounded: "{rounded.compact}"
    padding: "0 9px"
    height: "31px"
  input-search:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "38px"
  select-filter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.compact}"
    padding: "0 28px 0 9px"
    height: "30px"
  matrix-cell:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "7px 8px 6px"
    height: "76px"
  matrix-cell-selected:
    backgroundColor: "{colors.mineral-blue-pale}"
    textColor: "{colors.mineral-blue-deep}"
    rounded: "{rounded.square}"
    padding: "7px 8px 6px"
    height: "76px"
---

# Design System: 音格 · 中古音韵反射矩阵

## Overview

**Creative North Star: "The Archival Registration Table"**

The shipped interface behaves like a working table in a phonology archive: cool paper fields, ink-black evidence, mineral-blue registration marks, and ruled coordinates. It is intentionally dense and rectilinear. The matrix is the primary object; header, layer rail, controls, and the attached detail leaf exist to orient or inspect it rather than compete with it.

Its visual thesis is stable coordinates with replaceable registration layers. Changing dialect or Sino-Japanese readings changes the cell contents and active layer state without changing the Middle Chinese X/Y skeleton. Desktop keeps the matrix and evidence leaf in one working plane; narrow screens retain the full scrollable matrix and move that same evidence leaf into an edge-to-edge bottom sheet.

**Key Characteristics:**
- Cool archival paper rather than warm lifestyle neutrals.
- Ink-first data with mineral blue reserved for active, selected, aligned, and focused states.
- Hairline rules, square data cells, and restrained control radii instead of detached dashboard cards.
- A compact bilingual hierarchy built for repeated scholarly scanning.
- Persistent provenance language that labels all shipped demo content as illustrative and unreviewed.

## Colors

The palette is a cool paper-and-ink system with one mineral-blue state family; the frontmatter values are the normative source.

### Primary
- **Mineral Blue** (`mineral-blue`): filled active layer buttons, representative-character selection, tone plots, connectors, and decisive borders.
- **Deep Mineral Blue** (`mineral-blue-deep`): active text, IPA emphasis, slot IDs, and dark provenance/context fields.
- **Pale Mineral Blue** (`mineral-blue-pale`): selected-cell fills and small alternate-reading badges.
- **Mineral Wash** (`mineral-blue-wash`): hover and current-node surfaces where a filled accent would be too loud.

### Neutral
- **Archival Paper** (`paper`): the main matrix and control canvas.
- **Raised Paper** (`paper-raised`): header, populated cells, controls, and table rows. This is the system's only pure-white token.
- **Muted Paper** (`paper-muted`): coordinate fields, legends, table headers, and footer strips.
- **Blue Paper** (`paper-blue`): layer context, evidence headers, and reconstruction summaries.
- **Archive Ink** (`ink`): primary labels and research data.
- **Secondary Ink** (`ink-secondary`): controls and explanatory copy.
- **Tertiary Ink** (`ink-tertiary`): metadata, captions, inactive tabs, and table labels.
- **Missing Ink** (`missing-ink`): the explicit “未收” state, darkened enough to remain legible without implying available evidence.
- **Rule / Strong Rule** (`rule`, `rule-strong`): cell divisions and major section boundaries. Structure comes from these lines, not shadowed cards.

### Semantic
- **Provenance Warning** (`provenance-warning`): the unreviewed-demo status in the evidence footer; it is not a general decorative accent.
- **Focus Blue** (`focus-blue`): the global keyboard focus outline.

**The Blue-Is-State Rule.** Mineral blue marks a current layer, selected slot, aligned record, focus target, or plotted relationship; it is not ambient decoration.

**The Honest-Provenance Rule.** Illustrative phonology values remain visibly labeled as interface examples and unreviewed data in both the global strip and evidence footer.

## Typography

**Display Font:** Charis SIL / Doulos SIL / Noto Sans fallback for enlarged IPA and reconstructions.

**Body Font:** Noto Sans CJK SC / Source Han Sans SC / Microsoft YaHei fallback for interface language.

**Character Font:** Noto Serif CJK SC / Source Han Serif SC fallback for representative and member characters.

**Label/Mono Font:** ui-monospace / SFMono-Regular / Consolas fallback for IDs, schema labels, and positional readouts.

**Character:** Sans-serif interface text stays compact and neutral; serif CJK glyphs identify the lexical object; the dedicated IPA stack protects phonetic legibility; monospaced metadata makes coordinates and provenance feel indexed rather than decorative.

### Hierarchy
- **Display** (650, 21px): the selected slot's full reconstruction in the evidence header; detailed reconstruction strips use 18px.
- **Headline** (720, 16px, -0.01em): the product title. On narrow screens it drops to 14px rather than wrapping.
- **Title** (700, 12px): section headings and emphasized panel labels.
- **Body** (400, 12px): controls and primary cell readings; matrix metadata descends to 8–10px to preserve scan density.
- **Data Character** (650, 18px, 1 line-height): the lexical anchor inside a cell; the evidence-leaf character expands to 29px.
- **Label** (400, 8–10px, selective 0.05–0.08em tracking): coordinate captions, layer groups, state labels, and provenance metadata.
- **Mono** (400, 8–11px): slot IDs, schema text, and the X/Y/Z position readout. Numeric and IPA displays use tabular figures where implemented.

**The Three-Script Rule.** Use sans for interface language, serif for CJK evidence characters, and the IPA/mono stacks only for phonetic or indexed data; do not collapse all three into one generic face.

## Layout

The desktop shell fills `100dvh`, hides document overflow, and stacks five fixed bands above the research plane: 24px provenance, 68px header, 98px layer workbench, 54px toolbar, then the remaining matrix/detail region. The main research surface is a two-column grid with a flexible matrix and a 382px attached evidence leaf; at 1180px the leaf narrows to 332px and secondary header labels are reduced.

The matrix itself is deliberately wider than the viewport. Five sticky Y-coordinate columns use 64px, 58px, 44px, 44px, and 44px widths so one complete 110px initial column remains visible on narrow screens; each Middle Chinese initial column is 110px. The 34px superheader and 60px initial header remain sticky while the full plane scrolls in both directions. Rows are virtualized and switch between 76px comfortable and 58px compact density without changing coordinates. When selection changes, the matrix reveals both the selected row and selected initial column. Horizontal reveal is immediate and deterministic; reduced-motion preference still collapses other transitions.

At 900px and below, the matrix takes the full research width and the evidence leaf becomes a fixed bottom sheet up to 82dvh / 720px. At 680px and below, the shell bands compress to 21px, 104px, 84px, and 50px; the header becomes two rows, the search spans the full second row, action labels and nonessential legends hide, and the bottom sheet grows to 88dvh. The matrix dimensions and horizontal scrolling are retained rather than converted to cards or stripped of axes.

**The Coordinate-Persistence Rule.** Responsive layouts may compress chrome and relocate details, but they never reorder, summarize away, or replace the full X/Y matrix.

## Elevation & Depth

The system is flat by default. Tonal paper changes and one-pixel rules establish hierarchy; selection uses an inset mineral-blue registration line. The compact-density selected button alone uses a low structural shadow (`0 1px 2px rgb(28 38 34 / .12)`), while the mobile evidence sheet uses an upward separation shadow (`0 -14px 42px rgb(31 45 40 / .18)`). No other at-rest cards float.

### Shadow Vocabulary
- **Pressed Density State** (`0 1px 2px rgb(28 38 34 / .12)`): gives the selected compact/comfortable icon a slight mechanical seat.
- **Evidence Sheet Separation** (`0 -14px 42px rgb(31 45 40 / .18)`): distinguishes the open mobile sheet from the matrix beneath it.
- **Selected Registration** (`inset 0 0 0 1px var(--accent)`): aligns selection without changing grid dimensions.

**The Evidence-Lift Rule.** Shadow is reserved for the overlaid mobile evidence sheet or a tiny pressed control state; ordinary data regions stay ruled and flat.

Motion is short and functional: cells transition in 130ms, layer states in 140ms, controls in 160ms, and the mobile evidence sheet in 190ms with a restrained cubic-bezier curve. Loading cells pulse in stepped 900ms intervals. Reduced-motion preference collapses animation and transition duration to 0.01ms and disables smooth scrolling.

## Shapes

The form language is rectilinear. Matrix cells, coordinate bands, the evidence leaf, segment strips, tab rows, and character tables use square corners. Standard controls use the small control radius (4px); layer buttons and filter selects use 3px; segmented density states use 2px. The only circle is the 6px aligned-status dot. Tone contours use square line caps and mitered joins, reinforcing the measured, plotted character.

Borders are structural rather than ornamental: regular rules divide cells, strong rules divide bands, and selected content adds a mineral-blue outline or bottom registration line. There are no pills, oversized rounded cards, or decorative clipping masks.

**The Ruled-Plane Rule.** If content belongs to the same coordinate or evidence structure, separate it with a shared rule or paper tone rather than wrapping it in another rounded card.

## Components

### Provenance Bar
- A 24px deep-mineral strip leads the desktop and remains 21px on mobile.
- Tiny monospaced text places preview/schema metadata at the edges and the unreviewed-data warning at the center; mobile hides the redundant left label but retains the warning and schema version.

### Header, Search, and Actions
- The bilingual lockup pairs a 38px square split ink/paper mark with a 16px title and 10px tracked English subtitle; the mark becomes 32px and the subtitle hides on mobile.
- Search is a 38px paper field with a strong rule, 4px radius, leading icon, and an enter-key cap. `:focus-within` changes the rule to mineral blue and the surface to raised paper.
- Secondary and icon actions are 34px high, lightly ruled, and 4px rounded. Hover shifts to muted paper, active moves down 1px, and keyboard focus uses the shared 2px focus outline with a 2px offset.

### Layer Rail
- A blue-paper context block anchors the current layer; grouped buttons continue in a horizontally scrollable rail.
- Inactive buttons are transparent. Hover adds a translucent raised-paper registration surface and strong rule; active buttons fill mineral blue, reverse to raised-paper text, and expose `aria-pressed`.
- Layer changes alter the Z registration only; the matrix coordinates and scroll surface remain visually stable.

### Filters and Density Control
- Native selects sit in 30px paper fields with compact corners and a positioned chevron. The clear action is a text link, underlined only on hover, and visibly muted when disabled.
- The density control is a two-icon segmented field. Its active state combines darker color, raised paper, and the only small control shadow; both options expose text alternatives and `aria-pressed`.

### Matrix and Phonology Cells
- The matrix uses semantic grid, row, rowheader, columnheader, and gridcell roles with explicit row/column counts. Sticky nested row coordinates and column initials preserve orientation during scrolling.
- A comfortable cell is 76px high with 7px 8px 6px padding; compact mode is 58px high with 5px 7px padding. Each cell aligns a serif representative character, mono slot ID, reading/IPA line, and compact metadata.
- Hover uses mineral wash; selection combines pale mineral fill, deep text, an inset registration line, and `aria-selected`. Empty reflex cells say “未收” in dedicated missing-state ink; impossible coordinates use a ruled void with a dash. Alternate readings get a small count badge.
- Loading replaces cell content with three stepped-pulse registration bars. The matrix has explicit, centered empty and error states; the error action is the only filled retry button.

### Evidence Leaf and Tabs
- Desktop attaches the evidence leaf at the right edge; mobile reuses it as an edge-to-edge bottom sheet with a visible close button. While closed on mobile, the sheet is hidden and noninteractive rather than merely translated off-screen.
- Opening the mobile sheet moves focus to Close; Tab and Shift+Tab cycle within it, Escape closes it, and focus returns to the invoking control. The sheet's internal evidence column scrolls independently.
- The header aligns slot ID/status, a 52px square representative-character tile, enlarged IPA, and category summary. Three equal tabs share rules; active state uses darker type plus a 2px mineral registration line, not a filled pill.
- Detail content is organized as ruled definition grids, four-part segment strips, reflex tables, and a linear development chain. Comparison rows render every reflex rather than silently selecting the first: reading layer, IPA, kana/romaji or tone category/value, and sandhi condition remain visible. The development view adds a ruled multi-reading register when the active layer has alternatives.
- The leaf always ends with a visible provenance footer stating that the interface data is illustrative and unreviewed.

### Tone Contour
- The full plot is 116px by 70px; its compact in-cell form renders at 32px by 19px from a 44px by 26px view box.
- Mineral-blue polylines and outlined points sit on pale horizontal guides. The SVG receives an accessible five-degree-value label; missing data renders the text “调值待补”.

### Accessibility Behavior
- Buttons, selects, and inputs share a visible 2px keyboard outline; grid cells move the outline inward so it remains legible within the ruled plane.
- Selection, active tabs, and missing data use shape, text, fill, border, or explicit wording in addition to color. Search and icon-only controls have accessible names; decorative icons are hidden where implemented.
- The matrix and comparison table expose semantic roles, live search summaries use `aria-live`, errors use `role="alert"`, and reduced-motion preference is honored globally.
- Mobile sheet focus is contained while open and restored on close; hidden sheet controls cannot receive pointer or keyboard interaction.

## Do's and Don'ts

### Do:
- **Do** preserve the matrix as the dominant working plane and keep Middle Chinese coordinates fixed when the active reflex layer changes.
- **Do** use mineral blue only for active, selected, aligned, focused, or plotted relationships.
- **Do** use one-pixel rules and paper-tone shifts to group dense information before considering elevation.
- **Do** keep serif CJK characters, IPA forms, slot IDs, reading layers, tone categories, tone values, and sandhi conditions visually distinct and separately legible.
- **Do** retain explicit “示例 / 未经校勘 / 资料待补” language anywhere illustrative or missing data appears.
- **Do** preserve semantic grid/table roles, accessible names, selected-cell reveal, focus containment/restoration, visible focus, and reduced-motion behavior when extending components.

### Don't:
- **Don't** turn the workbench into a dashboard of detached rounded cards, metric tiles, or decorative charts.
- **Don't** use gradients, glass blur, glow borders, pill controls, or large soft shadows; they contradict the shipped archival material.
- **Don't** use mineral blue as a broad decorative background or introduce a second competing accent family.
- **Don't** collapse the mobile matrix into cards or hide phonological dimensions; keep the full scrollable coordinate plane and move details to the sheet.
- **Don't** present illustrative values as cited scholarship, discard alternate reflex rows, or remove the persistent provenance warnings.
- **Don't** enlarge every label to consumer-app proportions; preserve the compact hierarchy while maintaining focus, contrast, and zoom legibility.
