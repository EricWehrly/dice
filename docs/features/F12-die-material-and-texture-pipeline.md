# F12 - Die Material and Texture Pipeline

Status: 🔮 Planned

## Goal
Move the 3D die presentation from geometry-added pips toward texture-driven materials so the rolling screen can support faster visual iteration, richer material looks, and a cleaner path to premium dice styles.

## Current Anchors
- The 3D roll screen exists as `#roll-3d-screen` in `src/index.html`.
- `src/index.ts` already initializes the 3D throw scene.
- `src/rendering/DiceGraphic.ts` currently creates a `MeshStandardMaterial` and then adds pips as separate geometry via `PipUtils.addPips(...)`.

## Why Texture-Driven Faces
- Face appearance becomes data-driven instead of mesh-composition-driven.
- Pip shape, color, engraving, wear, glow, and novelty styles can all come from the same authoring pipeline.
- Texture generation can be shared between 2D previews, mod panels, and 3D rendering.
- Materials can evolve from simple painted plastic to polished resin, translucent, metallic, or enchanted looks without rewriting die geometry code.

## Rendering Choices

### Option A: Keep pip geometry, improve materials
Use the existing pip mesh approach and add better lighting/material tuning.

Pros:
- Lowest implementation risk
- Works with current geometry immediately
- Good for quick visual improvement

Cons:
- Pip style iteration stays slower
- Harder to share with 2D renderer
- More awkward for engraved/printed/symbol-heavy face variants

### Option B: Texture-driven face atlas on `MeshStandardMaterial`
Generate a canvas texture atlas for die faces and feed it into material maps.

Pros:
- Fastest real path to textured dice
- Supports painted pips and printed symbols well
- Compatible with physically based lighting through `MeshStandardMaterial`
- Good balance of speed and future flexibility

Cons:
- UV work is straightforward for d6, less trivial for d8/d12/d20
- Engraved depth is only faked unless paired with bump/normal data

### Option C: Texture-driven face atlas on `MeshPhysicalMaterial`
Same texture pipeline as Option B, but target more advanced physical material features.

Pros:
- Best path for premium-looking dice
- Supports clearcoat, transmission, sheen, iridescence, specular tuning, attenuation
- Better long-term path for resin, lacquer, glassy, magical, or metallic dice

Cons:
- More tuning complexity
- Higher runtime/rendering cost than standard material
- Still needs a fallback/basic mode for quick iteration

### Option D: Custom shader pipeline
Own the entire surface response and pip projection path.

Pros:
- Maximum visual control
- Best long-term ceiling

Cons:
- Too far above current needs
- Highest implementation and debugging cost
- Not the right first texture milestone

## Recommendation

### Quick path to ship soon
Start with Option B on d6 only:
- Generate a face atlas with `CanvasTexture`
- Feed that atlas into `MeshStandardMaterial.map`
- Keep current `MeshStandardMaterial` lighting flow
- Add an optional bump map generated from the same face atlas
- Keep pip geometry as fallback for non-d6 dice until UV/material support is ready

This gets a visible texture onto the die quickly while preserving the current throw flow.

### Best long-term visual target
Design the pipeline so materials can graduate to `MeshPhysicalMaterial` without redoing texture generation.

That means the texture/model layer should think in terms of:
- `baseColor` / diffuse
- `normal` or `bump`
- `roughness`
- optional `metalness`
- optional `ao`
- optional `emissive`
- optional physical extensions such as `clearcoat`, `transmission`, `iridescence`

If we do that, we can start simple and later offer:
- painted plastic dice
- glossy casino dice
- engraved stone dice
- translucent resin dice
- metallic or arcane novelty dice

## Material Feature Matrix

### Basic useful set
- `map` (`baseColor` / diffuse)
- `bumpMap` or `normalMap`
- `roughness`

### Strong medium-term set
- `map`
- `normalMap`
- `roughnessMap`
- `aoMap`
- environment map / scene reflections

### Premium set
- `MeshPhysicalMaterial`
- clearcoat + clearcoat roughness
- transmission / attenuation for translucent dice
- iridescence or sheen for stylized fantasy looks
- environment lighting tuned for dice closeups

## Important Geometry/UV Constraint
The quick path should explicitly target d6 first.

Reason:
- Cube UV mapping and per-face texture assignment are simple and predictable.
- d8/d12/d20 support should be planned, but not required for the first textured milestone.
- For non-d6 dice, keep the current pip-geometry or solid-color material path until face texturing is designed per geometry.

## Implementation Milestones

### Milestone 1: Texture generation foundation
Goal: create a reusable face-texture generator independent from Three.js material wiring.

Deliverables:
- New texture-generation module for die face atlases
- Config model for face count, fore/background colors, pip style, optional bevel/engrave settings
- Output format suitable for both 2D preview and Three.js texture upload

Acceptance criteria:
- A generated atlas can render d6 face pips into a canvas/image source
- Pip style can be changed without changing die mesh code

### Milestone 2: Basic textured d6 material
Goal: apply generated textures to the 3D d6 using current lighting.

Deliverables:
- `CanvasTexture` or equivalent upload path
- `MeshStandardMaterial.map` integration on d6
- Keep current non-d6 fallback intact

Acceptance criteria:
- d6 shows texture-driven pips instead of geometry-added pips
- Roll scene still renders and lights correctly

### Milestone 3: Surface detail maps
Goal: add tactile surface response so the die reads as a real object, not a flat decal.

Deliverables:
- Bump or normal-map generation path from pip/engrave data
- Roughness tuning or roughness map support
- Material presets such as `plastic`, `polished`, `engraved`

Acceptance criteria:
- Lighting visibly reacts to surface treatment differences
- Pip engraving/embossing reads under directional light

### Milestone 4: Material preset system
Goal: make style choices a game feature instead of hardcoded rendering tweaks.

Deliverables:
- Material preset model shared with upgrade/customization flows
- Presets for at least `plastic`, `matte`, and `glossy`
- Hooks for novelty styles later

Acceptance criteria:
- Die appearance can change through data/config rather than direct material edits
- 2D/3D preview language stays aligned

### Milestone 5: Premium physical rendering track
Goal: enable best-looking dice for closeups and premium styles.

Deliverables:
- Optional `MeshPhysicalMaterial` path
- Env-map/reflection tuning
- Optional translucent or lacquered material experiments

Acceptance criteria:
- At least one premium preset clearly exceeds the baseline look
- The advanced path remains optional and does not block basic gameplay rendering

## Suggested File/Module Shape
- `src/rendering/textures/DieFaceTextureAtlas.ts`
- `src/rendering/textures/DieMaterialPreset.ts`
- `src/rendering/textures/DieTextureTypes.ts`
- `src/rendering/DiceGraphic.ts` updated to choose material strategy
- Optional: shared drawing primitives extracted from existing pip/tile renderers

## Risks
- Non-cube dice will need geometry-specific UV and face-orientation handling.
- Bump maps can look weak if face contrast/shading data is not authored carefully.
- Texture resolution can become blurry if the atlas size is too small for close camera shots.
- Physical materials look bad without stronger environment lighting than the current scene provides.

## Proposed Build Order
1. d6 face-atlas generator
2. textured d6 on `MeshStandardMaterial`
3. bump/roughness support
4. preset system
5. optional `MeshPhysicalMaterial` upgrade path

## Acceptance Summary
- The d6 can render from generated textures.
- The texture pipeline supports more than color alone.
- The architecture leaves room for richer physical-material rendering later.