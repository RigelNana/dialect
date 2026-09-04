# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite, pnpm, TanStack Router, TanStack Query, Zustand, CSS Grid, TanStack Virtual, Tailwind CSS, shadcn/ui primitives, SVG/D3 for charts, Dexie for IndexedDB, Web Workers with Comlink, Vitest, Testing Library, Playwright, Storybook, ESLint, and Prettier. The first shipped surface may use the smallest working subset while preserving these boundaries.

## Users

Primary users are historical phonologists, dialectologists, Sino-Japanese researchers, and students comparing Middle Chinese categories with modern reflexes. They work by scanning large correspondence tables, switching readings, selecting a slot, and tracing evidence from category to reflex.

## Product Purpose

Create a research-oriented two-dimensional phonological database and visualization. Middle Chinese phonological slots are the stable units. Characters are representatives and members of slots. Modern Sinitic varieties and Sino-Japanese readings are historical reflex layers projected onto the same slot matrix.

Success means a researcher can scan the Middle Chinese matrix, switch reflex layers without losing position, inspect IPA and tone, and open one slot to see complete category, character, reflex, development, source, and note information.

## Positioning

One stable slot matrix connects Middle Chinese structure, modern dialect reflexes, and Sino-Japanese borrowing layers. The interface changes the Z-axis layer while preserving the X/Y coordinates, so comparisons stay spatially legible even when hundreds of layers are added.

## Operating Context

The main screen is a dense, full-width matrix. X is Middle Chinese initial. Y is 攝 / 韻 / 等 / 呼 / 調, displayed as separate nested fields. The active Z layer is selected from Middle Chinese, dialect, reading-register, and Sino-Japanese layers. Researchers search characters, filter category dimensions, compare layers, and inspect a selected slot in a separate modal detail page without permanently reducing the matrix workspace.

## Capabilities and Constraints

- Stable slot IDs such as C001 are the primary identity.
- Middle Chinese data includes 攝, 韻, 等, 呼, 重紐 when applicable, initial, voicing, aspiration, tone category, segmental reconstruction, complete reconstruction, reconstruction system, representative character, and member characters.
- Middle Chinese tone is 平、上、去、入 only. No invented five-degree value.
- Modern reflexes store initial, medial, nucleus, coda, IPA, historical tone source, modern tone category, citation tone, sandhi tone, tone value, reading layer, and sandhi condition.
- One slot may have multiple reflexes in one language through literary, colloquial, new/old literary, popular, exceptional, or sandhi readings.
- Sino-Japanese is a reflex layer and includes 呉音, 漢音, 唐音, and 慣用音, with historical form, historical kana, modern kana, romanization, IPA, borrowing layer, estimated period, and later Japanese changes.
- First release modules: Middle Chinese matrix, IPA/reconstruction display, reflex-layer switching, tone category plus value, 呉音/漢音/唐音 layers, and complete slot details.
- Later modules: filters, map, timeline, literary/colloquial analysis, sound-change rules, sources, character lookup, sound-change queries, multi-layer comparison, and CSV/Excel/JSON export.
- Large datasets must load by layer rather than as one global JSON file. Grid rendering must support row and column virtualization.
- Unicode text is normalized with NFC where normalization is needed. NFKC must not be applied globally because research-significant character distinctions and IPA combining marks must survive.
- Dialect layers currently contain 120 attested reading records imported from seven named 古音小镜 language points across 70 representative characters. Missing records remain explicitly unfilled. Middle Chinese reconstructions and Sino-Japanese layers remain illustrative until separately sourced.

## Evidence on Hand

The user supplied the complete domain model, six first-release modules, target technical stack, and slot examples. Dialect evidence is now imported from 古音小镜’s public “音节（不含声调）” query for points A004, A030, A069, A100, A260, Y0565, and Y1109, retrieved 2026-09-04 with a 400ms request interval. 古音小镜 warns that its point tables are automatically segmented and unreviewed. Its original content is declared CC BY 4.0, while underlying language-point records may have third-party rights; every imported record therefore retains its point ID, source URL, warning, and rights note. Middle Chinese reconstruction and Sino-Japanese bibliography remain unresolved and must not be presented as sourced scholarship.

## Product Principles

1. Slot before character: every interaction preserves the phonological slot as the primary unit.
2. Stable coordinates: layer changes never alter matrix structure or scroll position.
3. Decomposed evidence: segments, tone categories, values, sources, and reading layers remain separately queryable.
4. Dense but legible: optimize for repeated scholarly scanning rather than dashboard decoration.
5. Honest provenance: clearly distinguish illustrative data, reconstruction systems, citations, and unresolved evidence.

## Accessibility & Inclusion

The matrix uses semantic grid roles, keyboard-selectable cells, visible focus, sufficient contrast, and labels that do not depend on color alone. IPA, CJK text, and tone contours must remain readable at common desktop zoom levels. Reduced motion is supported. Mobile collapses the research matrix into a usable horizontal viewport with persistent slot details rather than hiding dimensions.
