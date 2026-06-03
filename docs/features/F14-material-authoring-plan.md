# F14 - Material Family Authoring and Texture Implementation Plan

Status: 🔄 In Progress (Execution + Tuning)

## Objective

Drive material authoring from implemented capabilities toward visually distinct, production-ready families by:

1. Grouping materials by reusable material type families
2. Defining family-first generator strategy so one base algorithm can produce multiple variants
3. Estimating effort versus visual payoff to prioritize "best bang for buck"
4. Defining preview and acceptance workflow while tuning and expanding texture coverage

## Current State (Already in Place)

- Runtime supports independent body and pip materials
- 19 materials are wired in presets: plastic, wood, stone, ceramic, resin, brass, steel, gold, silver, bronze, copper, iron, titanium, obsidian, jade, marble, granite, glass, crystal
- Texture generator registry exists with fallback to color-only rendering
- Generators are registered for 16 materials (all metals, synthetic/polymer, ceramic, and stone/mineral)
- Three materials still rely on fallback texture rendering: wood, glass, crystal
- Shared capabilities C1-C8 are implemented and consumed by active generator families

This document now tracks execution status and next implementation chunks, not only planning intent.

## Family-First Material Strategy

The next phase should be implemented by material families, not by isolated named materials.

### Why Family-First

- Reuse: one family generator can produce several marketable variants
- Consistency: finish responses behave similarly within a family
- Speed: variant creation becomes parameter tuning, not full reimplementation
- Maintainability: fewer core algorithms to test and optimize

### Family Model

| Family | Current Materials In Family | Immediate Variants We Can Derive | Core Procedural Signals |
|---|---|---|---|
| Metal | brass, steel | gold, silver, bronze, copper, iron | directional brush noise, edge wear, spec breakup |
| Stone/Mineral | stone, obsidian, jade | granite, slate, basalt, marble, soapstone | cellular noise, cracks, vein masks, grain breakup |
| Wood/Organic | wood | oak, walnut, maple, cherry, ebony | ring/grain fields, knots, anisotropic streaks |
| Ceramic/Porcelain | ceramic | porcelain, terracotta, glazed clay, raku-like | smooth base, glaze pooling, fine speckle |
| Transparent Gem/Glass | glass, crystal | smoky quartz, amethyst-like tint, frosted glass | transmission tint, edge brightening, internal noise |
| Synthetic/Polymer | plastic, resin | matte ABS, glossy acrylic, translucent resin, glitter resin | flat base, micro-noise, optional inclusions |

## Proposed Generator Architecture Direction

Keep current registry contracts. Add implementation in this sequence:

1. Build one base generator per family.
2. Add family parameter presets for named variants.
3. Route existing named materials to family presets.
4. Add net-new named materials by reusing family presets.

Example intent for metal family (documentation only):

- One metal generator handles spec and brushing patterns
- Gold versus silver versus brass differ mostly by hue/value/roughness ranges and patina mask settings

Current implementation note:

- All metal selections currently in runtime (`brass`, `steel`, `gold`, `silver`, `bronze`, `copper`, `iron`, `titanium`) have generator support.
- Stone/mineral selections (`stone`, `obsidian`, `jade`, `marble`, `granite`) have generator support and vein/macro breakup capabilities.
- Wood/organic and transparent gem/glass now have first-pass generator coverage.
- Remaining implementation focus is quality tuning and visual identity separation (especially marble/granite/jade/wood/crystal).

## Brainstorm: Additional Materials by Family

These are candidates for content expansion once family generators exist.

| Family | Candidate Materials |
|---|---|
| Metal | gold, silver, bronze, copper, iron, titanium, blackened steel, patina brass |
| Stone/Mineral | granite, marble, slate, basalt, limestone, sandstone, malachite |
| Wood/Organic | oak, walnut, maple, cherry, mahogany, ebony, bamboo |
| Ceramic/Porcelain | porcelain white, terracotta, crackle glaze, celadon-inspired, matte stoneware |
| Transparent Gem/Glass | clear glass, frosted glass, smoky crystal, rose crystal, emerald-like gem |
| Synthetic/Polymer | matte plastic, glossy plastic, pearlescent plastic, translucent resin, glitter resin |
| Novelty/Advanced Later | lava rock glow, carbon fiber, mother-of-pearl, opal-like iridescence |

## Comparative Estimates (Procedural Generation)

Scoring uses a 1-5 scale:

- `Impact`: visual distinctiveness in gameplay camera
- `Reuse`: how many variants can share the same generator core
- `Complexity`: implementation and tuning effort
- `Risk`: rendering/perf risk under current pipeline
- `BangForBuck`: `(Impact + Reuse) / (Complexity + Risk)`

Higher `BangForBuck` should generally be prioritized.

| Family | Impact | Reuse | Complexity | Risk | BangForBuck | Initial Estimate | Notes |
|---|---:|---:|---:|---:|---:|---|---|
| Metal | 5 | 5 | 3 | 2 | 2.00 | 1.5-2.5 days | Best early leverage for gold/silver/brass/copper from one core |
| Stone/Mineral | 4 | 5 | 3 | 2 | 1.80 | 1.5-2.5 days | Crack/vein masks scale well to many variants |
| Wood/Organic | 4 | 4 | 3 | 2 | 1.60 | 1.5-2.0 days | Strong visual gain; moderate tuning time for believable grain |
| Ceramic/Porcelain | 3 | 4 | 2 | 1 | 2.33 | 1.0-1.5 days | Easiest quality win; subtle but clean look |
| Synthetic/Polymer | 3 | 4 | 2 | 1 | 2.33 | 1.0-1.5 days | Low risk and very controllable for fallback-safe rollout |
| Transparent Gem/Glass | 4 | 3 | 5 | 4 | 0.78 | 3.0-5.0 days | High difficulty in current non-raytraced context; defer |
| Novelty/Advanced Later | 5 | 2 | 5 | 5 | 0.58 | 4.0-6.0 days | Great polish track, weak near-term ROI |

## F17 Lighting Utility Rank (Least -> Most Useful)

This ranking is specifically for F17 calibration work (exposure, environment response, clearcoat, roughness-map authority), not only for content ROI.

1. Novelty/Advanced Later
2. Transparent Gem/Glass
3. Wood/Organic
4. Stone/Mineral
5. Ceramic/Porcelain
6. Synthetic/Polymer
7. Metal

Why this ordering for F17:

- Metal remains the strongest stress test for highlight stability and IBL coherence.
- Synthetic/Polymer is the next most useful dielectric comparator because it isolates roughness and clearcoat behavior without metalness-driven extremes.
- Ceramic/Porcelain remains high utility for diffuse-to-gloss transitions, but has fewer currently mapped runtime materials.

### Recommended Priority by Value

1. Ceramic/Porcelain family (fast win, low risk)
2. Synthetic/Polymer family (fast win, low risk)
3. Metal family (highest leverage for named premium variants)
4. Stone/Mineral family (broad thematic range)
5. Wood/Organic family (good impact, medium tuning cost)
6. Transparent Gem/Glass family (after baseline pipeline is stable)
7. Novelty/Advanced effects (post-MVP polish)

### Implementation Note (Current Pass)

- Implemented first-pass shared capability modules (C1-C8) and wired them into active generator families.
- Added/updated family generator support for `plastic`, `resin`, `ceramic`, `stone`, `obsidian`, `jade`, `marble`, `granite`, `wood`, `glass`, and `crystal` using shared capability composition.
- Updated preset surface overrides for `plastic`, `resin`, and `ceramic` to improve dielectric comparison quality during F17 tuning.
- Capability implementation/tuning/validation status now tracked in `docs/features/F18-material-capability-system.md`.

## Capability Library and Material Usage Map

The next planning dimension is capability-first delivery. Instead of asking "which material next," ask "which reusable capability unlocks the most materials with physically convincing separation."

Canonical capability planning now lives in `docs/features/F18-material-capability-system.md`.
This section remains as an at-a-glance material-side reference.

### Capability Definitions

| Capability ID | Capability | What It Enables | Primary Material Families |
|---|---|---|---|
| C1 | Roughness authority map | Stable finish separation (plain/etched/polished/hammered) | All |
| C2 | Macro normal/bump breakup | Surface depth at gameplay distance | Metal, Stone, Wood, Ceramic |
| C3 | Micro-grain anisotropy | Distinguishes brushed/sanded/manufactured surfaces | Metal, Plastic, Wood |
| C4 | Edge wear / edge brightening control | Readable silhouette + believable wear or glaze edge behavior | Metal, Ceramic, Stone |
| C5 | Glaze/clearcoat layering | Fired ceramic and glossy polymer separation | Ceramic, Plastic, Resin |
| C6 | Internal depth / attenuation field | Resin, glass, crystal depth instead of flat gloss | Resin, Transparent Gem/Glass |
| C7 | Vein/cellular fracture masks | Mineral and stone identity beyond color shifts | Stone/Mineral, Jade/Obsidian |
| C8 | Inclusion/flake particles | Glitter resin, metallic flake plastics, mineral spark | Resin, Plastic, Stone |
| C9 | Material profile contract tests | Prevent drift and collapse between materials | All |
| C10 | Lighting diagnostic harness integration | Repeatable tuning under F17 controls (exposure/env/light ratios) | All |

### Capability-to-Family Matrix (New Planning Dimension)

Legend: `P0` required for first convincing version, `P1` strong differentiator, `P2` optional premium.

| Family | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Metal | P0 | P0 | P0 | P1 | P1 | - | - | P2 | P0 | P0 |
| Synthetic/Polymer | P0 | P1 | P0 | P2 | P0 | P1 | - | P1 | P0 | P0 |
| Ceramic/Porcelain | P0 | P1 | - | P1 | P0 | - | - | P2 | P0 | P0 |
| Stone/Mineral | P0 | P0 | - | P1 | - | - | P0 | P1 | P0 | P0 |
| Wood/Organic | P0 | P0 | P0 | P1 | - | - | - | P2 | P0 | P0 |
| Transparent Gem/Glass | P0 | P1 | - | P1 | P1 | P0 | P1 | P1 | P0 | P0 |
| Novelty/Advanced Later | P1 | P1 | P1 | P1 | P1 | P1 | P1 | P0 | P0 | P0 |

### Current Capability Status (June 2026)

| Capability ID | Status | Notes |
|---|---|---|
| C1 | 🔄 Partial | Implemented across active generator families; still needs tuning matrix by family/finish |
| C2 | 🔄 Partial | Implemented and active in metal/ceramic/stone-mineral; tuning still uneven |
| C3 | 🔄 Partial | Implemented and active in metal + synthetic; needs stronger wood-ready profile later |
| C4 | 🔄 Partial | Implemented and active in metal/ceramic/synthetic/stone-mineral; needs tighter per-family shaping |
| C5 | 🔄 Partial | Implemented and active in ceramic + synthetic; ceramic glaze depth still shallow |
| C6 | 🔄 Partial | Implemented as resin-first depth attenuation; not yet expanded to glass/crystal |
| C7 | 🔄 Partial | Implemented and active in stone/mineral; realism tuning remains |
| C8 | 🔄 Partial | Implemented in active families; still light-touch and not yet premium-grade |
| C9 | 🔄 Partial | Contract tests exist but should expand to capability checks |
| C10 | ❌ Not Started | F17 diagnostic harness not yet available in runtime |

## Capability-First Roadmap (F14 Primary, F17 Support)

This roadmap keeps F14 as the driver and uses F17 as a support lane for calibration and validation.

Detailed capability ordering, stream ownership, and touchpoint gating are tracked in `docs/features/F18-material-capability-system.md`.

### Wave A: Dielectric Separation Baseline (Immediate)

Goal: make plastic, resin, and ceramic visually non-overlapping at gameplay distance.

- F14 scope:
	- C1 polish for dielectric families
	- C3 for plastic (anisotropic micro-grain)
	- C5 for ceramic (glaze behavior beyond flat highlight)
	- C6-lite for resin (simple depth/attenuation field)
	- C9 tests: dielectric separation assertions
- F17 support items to schedule/mark:
	- M1 diagnostic toggles for roughness/bump/env isolation
	- M4 baseline lighting profile pinning for gameplay/debug-flat

### Wave B: Mineral/Wood Identity Pass

Goal: move stone and wood from color fallback toward true texture identity.

- F14 scope:
	- C7 for stone/mineral masks
	- C2 + C3 for wood grain/ring structure
	- C4 for edge behavior differences (stone vs wood)
	- C9 tests: family identity checks at gameplay distance
- F17 support items:
	- M2 controlled IBL baseline for consistency across camera angles

### Wave C: Transparent and Premium Materials

Goal: unlock crystal/glass/resin premium looks after baseline stability.

- F14 scope:
	- C6 full depth/attenuation
	- C5 layered clearcoat/refraction-adjacent constraints
	- C8 inclusion particles for selected premium variants
	- C9 tests for clipping/washout regressions
- F17 support items:
	- M2 and M4 finalized defaults before enabling premium looks
	- M5 specialty track can consume C6/C8 directly once stable

## F17 Cross-Feature Tracking (Support Lane)

Use this as a lightweight checkoff list when F14 work needs calibration support.

- [ ] F17-M1: Runtime diagnostic harness available for A/B (roughness/bump/env/clearcoat)
- [ ] F17-M2: PMREM/HDR IBL baseline enabled with fallback intact
- [ ] F17-M3: Polished response rebalance complete for metal sanity baseline
- [ ] F17-M4: Lighting profile normalization pinned for gameplay + debug-flat
- [ ] F17-M5: Specialty track gated until Waves A-B are stable

Planning rule: F14 can proceed without all F17 items complete, but any capability marked `P0` for current wave should have the relevant F17 support item either completed or explicitly risk-accepted.

For required-vs-recommended dependency classification per capability, see `docs/features/F18-material-capability-system.md`.

## Execution Wave Plan (Updated)

### Wave 1 (Fast, High Certainty) - ✅ Completed

- Ceramic/Porcelain base generator
- Synthetic/Polymer base generator
- Metal generator family pass (including expanded metal set)

Estimated wave duration: 4-6 implementation days including preview/test passes.

### Wave 2 (Content Expansion) - ✅ Completed (First Pass)

- Stone/Mineral base generator with `stone`, `obsidian`, `jade`, `marble`, `granite` implemented
- Wood/Organic generator first pass implemented (`wood`)
- Expanded metals are implemented but still need visual contract tightening for stronger identity separation

Estimated wave duration: 3-5 implementation days including tuning.

### Wave 3 (Advanced Look Development) - 🔄 Started (Baseline)

- Transparent Gem/Glass base generator (`glass`, `crystal`) first pass implemented
- Optional novelty materials (opal-like, carbon fiber, pearl)

Estimated wave duration: 4-7 implementation days with iteration risk.

## Texture Preview and Validation Workflow

The implementation pass should be guided by a strict preview loop.

### Per Family Preview Checklist

1. Preview baseline family material under all finish profiles.
2. Preview at gameplay camera distance and close-up camera distance.
3. Confirm pip readability on light body and dark body combinations.
4. Compare at least 3 variants from the same family side-by-side.
5. Verify no UV drift/cropping across rapid material swaps.
6. Capture screenshots for plain, etched, polished, hammered variants.

### Acceptance Gate Per Family

- At least one variant is clearly distinguishable at gameplay distance.
- Finish profiles are visibly different, not only color-shifted.
- Switching materials does not regress roll performance or stability.
- Fallback path remains visually acceptable if generator is absent.

## Technical Constraints (Carry Forward)

- Keep `DieFaceTextureAtlas.ts` UV mapping contract unchanged
- Preserve die orientation mapping and probability model behavior
- Keep generator execution synchronous during material creation
- Maintain fallback to color-only rendering when no generator exists
- Keep `DieMaterialPreset.ts` as source of truth for fallback palette values

## Current Deliverables Remaining

1. Strengthen stone/mineral identity tuning (marble veining contrast, granite breakup scale, jade depth/readability)
2. Tune wood grain readability at gameplay distance and avoid over-uniform streaking
3. Tune glass/crystal separation and depth response before enabling F17 lighting calibration
4. Expand focused capability-level test coverage (especially C6/C7/C8 behavior deltas)
5. Capture/update screenshot matrix for all active families and finishes under a pinned lighting profile

### Stone/Material Assumptions To Validate During Tuning

1. Stone/mineral currently shares one structural pass recipe with mostly color-driven divergence; material-specific structure parameters are still light-touch.
2. Marble currently uses the same vein-mask family primitive as other minerals, which can under-read as classic marbling at gameplay distance.
3. Surface profile tables and generator roughness-map values are maintained in separate places, so drift checks are needed when tuning finishes.
4. Physical-material response currently treats all non-metal families similarly for bump/env defaults, so stone/ceramic/wood/glass distinction is primarily map-driven until F17 diagnostics are enabled.

## Exit Criteria for F14 Completion

- All currently selectable body materials have generator-backed identity (no fallback-only materials left)
- Family differences are distinguishable at gameplay distance across `plain/etched/polished/hammered`
- Capability-level regressions are covered by automated tests for active families
- Visual baseline captures exist for each implemented family under a pinned gameplay profile
- Remaining premium-only looks are explicitly marked as optional/post-F14

Signature: A1
