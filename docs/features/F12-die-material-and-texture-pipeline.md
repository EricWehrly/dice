# F12 - Die Material and Texture Pipeline

Status: 🔄 In Progress

## Goal
Move the 3D die presentation from geometry-added pips toward texture-driven materials, with `MeshPhysicalMaterial` as the primary rendering target and a lower-risk fallback path when the physical-material slice is not stable enough yet.

## Current Anchors
- `src/rendering/DiceGraphic.ts` now resolves a material preset, applies generated d6 textures, and still falls back locally if the physical-material slice fails.
- The current 3D scene already has basic lighting, so material and pip changes are visible immediately.
- d6 is the correct first target because cube faces are easy to address independently.

## Working Direction
We are intentionally trying `MeshPhysicalMaterial` first.

That does not mean doing the fanciest version first. It means:
- use the physical-material API now
- keep the first texture payload extremely simple
- fall back quickly if the first slice is unstable

This keeps the implementation aligned with the long-term rendering target without forcing us to solve every surface-detail problem up front.

## Rendering Strategy Decision

### Primary target
`MeshPhysicalMaterial` on d6 with generated face textures.

Why:
- it keeps the material contract aligned with the premium end-state
- it lets us layer in clearcoat, transmission, and other richer features later
- it avoids doing a full `MeshStandardMaterial` texture pass and then reworking that material contract again

### Fallback path
If the physical-material slice throws, renders incorrectly, or proves too unstable for the current scene, fall back to:
1. `MeshStandardMaterial` with the existing solid-color setup
2. existing pip geometry rendering

This fallback is gameplay-first. The roll scene must remain usable even if the texture/material experiment is incomplete.

## Implementation Shape

### Simplest first
Build the smallest d6-only slice that proves the pipeline.

Scope:
- generate one texture per d6 face using canvas
- apply those textures to cube-face materials
- use `MeshPhysicalMaterial` with conservative values
- skip bump, normal, roughness, and env-map work for now
- keep non-d6 dice on the current pip-geometry path

Success criteria:
- the d6 visibly renders texture-driven pips
- the scene still rolls correctly
- the new path can fail back to the old one without breaking gameplay

### Current status

- d6 texture-driven rendering is in place
- body material and pip material can differ independently
- the renderer has local fallback behavior for unstable material paths
- reusable texture/material contracts are already extracted

### Achievable next
The next slice is the first surface-detail pass for the physical-material pipeline.

Scope:
- add bump or normal support derived from the same face drawing data
- add roughness tuning or roughness maps
- add a small preset layer for surface response, such as `plastic`, `glossy`, `engraved`
- verify the same generated face data can drive more than just flat color textures

Success criteria:
- the same texture pipeline feeds multiple material properties
- surface response changes are visible under current lighting
- the renderer contract remains d6-first and does not destabilize other dice

### Fancy last
After the simpler texture/material path is proven, move into premium rendering work.

Scope:
- environment/reflection tuning
- clearcoat and clearcoat roughness presets
- transmission / attenuation experiments for resin or glass-like dice
- iridescence, emissive accents, or novelty presets
- non-d6 texture strategies where geometry and UV constraints justify the effort

Success criteria:
- at least one premium preset looks materially better than the baseline physical-material pass
- premium rendering remains optional, not required for the default rolling scene

## How We Should Proceed

1. Keep the current d6 material path stable and observable.
2. Add a first surface-detail layer that changes how the pips/faces read under lighting.
3. Keep explicit fallback behavior in the renderer rather than spreading failure handling across the rest of the app.
4. Only after surface-detail is stable, spend time on premium-lighting/material polish.

The constraint is simple: no fancy material work before we have one small texture-driven d6 actually surviving the current rolling screen.

## Implementation Milestones

### Milestone 1: d6 physical-material proof of life
Goal: prove that texture-driven d6 rendering works at all using `MeshPhysicalMaterial`.

Deliverables:
- d6 face texture generator
- per-face material assignment for cube geometry
- `MeshPhysicalMaterial` baseline values
- explicit fallback to the current solid-material + pip path

Acceptance criteria:
- d6 renders from generated textures
- non-d6 dice remain on the current path
- failures do not break the rolling screen

### Milestone 2: reusable texture/material contracts
Goal: make the first slice maintainable instead of one-off.

Deliverables:
- typed texture-generation options
- reusable material preset/options model
- clearer separation between face drawing and material assembly

Acceptance criteria:
- texture generation can evolve without rewriting `DiceGraphic`
- material tuning is data-driven enough to iterate safely

Status: ✅ complete

### Milestone 3: first surface-detail pass
Goal: move from flat printed faces toward visible surface response.

Deliverables:
- bump or normal-map generation
- roughness tuning or roughness map support
- first preset comparisons under current lighting

Acceptance criteria:
- pips read as more than flat paint
- lighting changes produce visible material differences

Status: 🔮 next

### Milestone 4: premium rendering track
Goal: unlock the high-end looks that justify `MeshPhysicalMaterial`.

Deliverables:
- clearcoat-based glossy presets
- transmission/resin experiments
- env-map or reflection strategy where it materially improves the result

Acceptance criteria:
- at least one preset clearly outperforms the simpler baseline visually
- premium looks remain optional and isolated from baseline gameplay rendering

## Suggested File/Module Shape
- `src/rendering/textures/DieFaceTextureAtlas.ts`
- `src/rendering/textures/DieMaterialPreset.ts`
- `src/rendering/textures/DieTextureTypes.ts`
- `src/rendering/DiceGraphic.ts`

## Risks
- `MeshPhysicalMaterial` may not look better than the current path until lighting and surface maps improve.
- d6 is straightforward, but non-d6 support should not be forced into the first slice.
- Canvas texture quality will depend on enough resolution and consistent face drawing.
- Fallback behavior must stay local to the renderer so this feature cannot break throw gameplay.

## Current Implementation Order
1. d6-only `MeshPhysicalMaterial` proof of life
2. reusable texture/material contracts
3. bump/roughness surface detail
4. premium lighting/material features

## Acceptance Summary
- The renderer tries `MeshPhysicalMaterial` first.
- d6 can render from generated textures.
- Failures fall back to the current path.
- The implementation order stays simplest first, achievable next, fancy last.