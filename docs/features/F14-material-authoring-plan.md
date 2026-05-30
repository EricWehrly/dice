# F14 - Material Family Authoring and Texture Implementation Plan

Status: 🔄 Planning Update (Documentation Only)

## Objective

Prepare an implementation-ready plan for procedural material textures by:

1. Grouping materials by reusable material type families
2. Defining family-first generator strategy so one base algorithm can produce multiple variants
3. Estimating effort versus visual payoff to prioritize "best bang for buck"
4. Defining preview and acceptance workflow before writing any new texture code

## Current State (Already in Place)

- Runtime supports independent body and pip materials
- 11 materials are wired in presets: plastic, wood, stone, ceramic, resin, brass, steel, obsidian, jade, glass, crystal
- Texture generator registry exists with fallback to color-only rendering
- `PlasticMaterialGenerator` is the baseline generator implementation

This document focuses on what to build next, not on changing runtime architecture.

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

- Brass and steel are the only actively implemented metal selections right now.
- Future metals such as gold, silver, bronze, copper, iron, and titanium stay on the roadmap, but should not become selectable until each has a distinct texture treatment that reads as real metal rather than a flat recolor.

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

### Recommended Priority by Value

1. Ceramic/Porcelain family (fast win, low risk)
2. Synthetic/Polymer family (fast win, low risk)
3. Metal family (highest leverage for named premium variants)
4. Stone/Mineral family (broad thematic range)
5. Wood/Organic family (good impact, medium tuning cost)
6. Transparent Gem/Glass family (after baseline pipeline is stable)
7. Novelty/Advanced effects (post-MVP polish)

## Ready-to-Implement Wave Plan

### Wave 1 (Fast, High Certainty)

- Ceramic/Porcelain base generator
- Synthetic/Polymer base generator
- Metal generator refinement for brass and steel as the first fully convincing metal looks

Estimated wave duration: 4-6 implementation days including preview/test passes.

### Wave 2 (Content Expansion)

- Stone/Mineral base generator with stone, granite, slate, obsidian variants
- Wood/Organic base generator with wood, oak, walnut variants
- Additional metal variants only after they have individually convincing visual identity: gold, silver, bronze, copper, iron, titanium

Estimated wave duration: 3-5 implementation days including tuning.

### Wave 3 (Advanced Look Development)

- Transparent Gem/Glass base generator
- Optional novelty materials (opal-like, carbon fiber, pearl)

Estimated wave duration: 4-7 implementation days with iteration risk.

## Texture Preview and Validation Workflow (No Code Yet)

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

## Deliverables for First Implementation Pass

No code changes are requested in this planning turn. The next implementation turn should produce:

1. Family generator implementations for Wave 1
2. Variant presets for at least 2-4 named materials per completed family
3. Preview screenshot set per family and finish profile
4. Focused tests around generator output stability
5. F14 doc updates marking completed families and adding tuning notes

## Exit Criteria for This Planning Update

- Material families are defined and mapped to current materials
- Additional material brainstorm is captured in family groups
- Comparative procedural estimates are documented for prioritization
- A practical implementation and preview workflow is documented
- Document is ready for a code implementation pass next
