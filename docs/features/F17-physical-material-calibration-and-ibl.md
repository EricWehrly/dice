# F17 - Physical Material Calibration and IBL Upgrade Plan

Status: 🔄 Planned Support Lane (Partial groundwork in place)

## Objective
Realign the dice rendering effort around a stable, incremental path to physically-based materials that look good in the rolling scene without swinging between dark crushed metal and washed-out highlights.

This feature defines a controlled rollout for:
1. material response calibration
2. image-based lighting (IBL) using PMREM/HDR sources
3. clearcoat and specialty finish tracks

## Why This Feature Exists
Current behavior shows a pendulum:
- before recent changes: polished metals could read too dark
- after response and lighting experiments: polished and other finishes can appear too washed out

Recent tuning improved polished streak artifacts, but broad color washout is still not reliably controlled. The current setup is using a procedural environment and manually tuned light stack, which is useful for experimentation but not yet robust enough for consistent physical material reads.

## Current Baseline in This Repository
- Physical material assembly is in [src/rendering/materials/PhysicalD6Material.ts](src/rendering/materials/PhysicalD6Material.ts).
- Scene lighting and environment setup is in [src/rendering/lighting.ts](src/rendering/lighting.ts).
- Material presets are in [src/rendering/textures/DieMaterialPreset.ts](src/rendering/textures/DieMaterialPreset.ts).
- Metal finish overlays and roughness maps are in [src/rendering/textures/generators/MetalMaterialGenerator.ts](src/rendering/textures/generators/MetalMaterialGenerator.ts).

Important current note:
- The physical material path currently forces environment contribution off via envMapIntensity override in [src/rendering/materials/PhysicalD6Material.ts](src/rendering/materials/PhysicalD6Material.ts). This is useful as a temporary isolation switch, but it blocks meaningful IBL validation.

## Current Reality Snapshot (June 2026)

- A procedural canvas environment is present in [src/rendering/lighting.ts](src/rendering/lighting.ts), but PMREM/HDR IBL is not yet implemented.
- Material generators and roughness maps are active across metal, synthetic/polymer, ceramic, and stone/mineral families.
- `envMapIntensity` is currently clamped to `0` in [src/rendering/materials/PhysicalD6Material.ts](src/rendering/materials/PhysicalD6Material.ts), so environment-response tuning remains blocked by design.
- No runtime diagnostic harness exists yet for roughness/bump/env/clearcoat toggles.
- Polished-response adjustments have been started in generator and preset tuning, but no formal F17 tuning gate has been completed.

## Milestone Progress Snapshot

- F17-M1 Diagnostic harness: ⏳ Not Started
- F17-M2 PMREM/HDR IBL baseline: ⏳ Not Started
- F17-M3 Polished response rebalance: 🔄 In Progress
- F17-M4 Lighting profile normalization: 🔄 In Progress (ad hoc tuning only)
- F17-M5 Specialty track: ⏳ Not Started

## Reference Direction from Three.js Examples
The linked examples consistently show three common ingredients for good physical materials:

1. Tone mapping and exposure are explicit runtime controls.
2. Environment lighting is PMREM/HDR-backed, not only procedural canvas gradients.
3. Material parameters are tuned with interactive controls and compared side by side.

Relevant source references:
- lights + physical response: webgl_lights_physical
- PMREM-backed FastHDR environments: webgl_materials_envmaps_fasthdr
- clearcoat workflows and layered normals: webgl_materials_physical_clearcoat
- dynamic reflection path (optional premium): webgl_materials_cubemap_dynamic
- refraction baseline (legacy approach, useful for concept): webgl_materials_cubemap_refraction
- subsurface scattering (future track only): webgl_materials_subsurface_scattering

## Non-Goals for F17
- No full postprocessing stack migration.
- No subsurface scattering implementation in this feature.
- No broad non-d6 rendering contract rewrite.
- No attempt to ship all premium looks at once.

## Implementation Strategy (Incremental)

### Milestone 1: Controlled Diagnostic Harness
Goal: make visual tuning reproducible instead of guess-driven.

Deliverables:
- A runtime debug profile object for material diagnostics in roll 3D.
- Toggles for per-die and global switches:
  - useRoughnessMap
  - useBumpMap
  - useEnv
  - useClearcoat
- Scalar controls:
  - exposure
  - environmentIntensity
  - key/fill/hemi multipliers
  - polishedBumpScaleOverride
- Optional quick preset buttons:
  - baseline
  - dark-safe
  - bright-safe

Primary files:
- [src/rendering/materials/PhysicalD6Material.ts](src/rendering/materials/PhysicalD6Material.ts)
- [src/rendering/lighting.ts](src/rendering/lighting.ts)
- [src/index.ts](src/index.ts)

Acceptance criteria:
- One-click A/B isolation of roughness, bump, and environment contributions.
- Visual changes occur immediately without reload.
- No behavior change when diagnostics are disabled.

### Milestone 2: IBL Foundation via PMREM/HDR
Goal: replace fragile procedural-only environment dependence with stable PMREM-backed IBL.

Deliverables:
- Load at least one PMREM-processed HDR environment.
- Assign scene.environment from PMREM output.
- Keep procedural environment as explicit fallback path.
- Re-enable environment contribution in physical material path behind a controlled default.

Primary files:
- [src/rendering/lighting.ts](src/rendering/lighting.ts)
- [src/rendering/materials/PhysicalD6Material.ts](src/rendering/materials/PhysicalD6Material.ts)

Acceptance criteria:
- Material highlights remain coherent across camera motion.
- Metals react to environment in a controllable way.
- Fallback still renders when HDR assets fail.

### Milestone 3: Polished Response Rebalance
Goal: remove pendulum behavior for polished finishes.

Deliverables:
- Clamp polished presets to mid-range defaults that avoid both extremes.
- Flatten polished bump profile further where needed.
- Keep brass-vs-steel gloss ordering and gold high-metalness contract intact.
- Add a polished-specific response test matrix.

Primary files:
- [src/rendering/textures/DieMaterialPreset.ts](src/rendering/textures/DieMaterialPreset.ts)
- [src/rendering/textures/generators/MetalMaterialGenerator.ts](src/rendering/textures/generators/MetalMaterialGenerator.ts)
- [src/tests/rendering/DieMaterialPreset.test.ts](src/tests/rendering/DieMaterialPreset.test.ts)

Acceptance criteria:
- Polished no longer clips to dark or bright extremes under default rig.
- 3, 5, and 6 pip faces no longer show strong directional streak artifacts.
- Existing preset contract tests pass.

### Milestone 4: Lighting Rig Normalization
Goal: tune direct lights around the new IBL baseline rather than compensating for missing environment fidelity.

Deliverables:
- Rebalance ambient/hemi/key/fill/rim as ratios, not ad hoc values.
- Optional support for profile sets: gameplay, cinematic, debug-flat.
- Document light intent and expected range.

Primary file:
- [src/rendering/lighting.ts](src/rendering/lighting.ts)

Acceptance criteria:
- Finish differences remain visible under gameplay profile.
- Shadows and saturation remain readable.
- No global washout at default exposure.

### Milestone 5: Specialty Material Track (After Stability)
Goal: unlock premium looks once baseline is stable.

Candidates:
- clearcoat normal layering (golf-ball-like and bowling-ball-like looks)
- refractive/resin variants with physically plausible limits
- jade/stone texture pass inspired by random-uv style breakup

Acceptance criteria:
- At least one specialty preset clearly outperforms baseline visually.
- Premium presets remain optional and isolated.

## Knob Matrix for Future Tuning
Use this matrix as the first-stop checklist when visuals regress.

- Too washed out:
  - lower exposure
  - lower clearcoat
  - raise clearcoatRoughness
  - raise roughnessMap baseline for polished
  - reduce hemi/fill ratio

- Too dark/crushed:
  - increase exposure slightly
  - raise environmentIntensity
  - reduce bumpScale for polished
  - lower key shadow aggressiveness (bias/normalBias tune)
  - reduce directional overlay contrast in polished atlas

- Weird pip streaking:
  - reduce polished brushAlpha/crossAlpha/sweepAlpha
  - reduce or disable polished sweep pass
  - reduce polished bumpScale
  - verify roughness map and bump map color space/data range

- Material differences invisible:
  - re-enable environment contribution and verify PMREM source
  - check roughness map is authoritative only once
  - verify scalar map color space remains linear

## Testing and Validation Plan
- Automated:
  - preset contract tests in [src/tests/rendering/DieMaterialPreset.test.ts](src/tests/rendering/DieMaterialPreset.test.ts)
  - rendering pipeline tests in [src/tests/rendering/](src/tests/rendering/)
- Manual visual matrix:
  - materials: brass, steel, gold, silver
  - finishes: plain, etched, polished, hammered
  - camera views: frontal, high angle, low angle
  - lighting profiles: gameplay and debug-flat

Validation checklist:
- no extreme bright clipping under default profile
- no extreme dark collapse for polished silver
- pip readability preserved on 3/5/6
- differences between finishes remain obvious at gameplay distance

## Risks
- PMREM/HDR assets may increase startup complexity if not cached and fallback-safe.
- Over-tuning polished can make finishes converge and lose identity.
- Lighting profile drift can hide regressions if not pinned to default values in tests/docs.

## Success Definition
F17 is successful when:
1. polished metal remains stable in a middle response band
2. environment response is controlled by PMREM/HDR IBL plus explicit knobs
3. gameplay defaults look good without requiring manual live tuning
4. specialty materials can be added incrementally without re-breaking baseline

## Follow-Up Opportunities
- texture-authoring presets for golf ball and bowling ball looks via clearcoat normal layers
- jade and stone premium presets using layered procedural breakup
- optional future feature for subsurface-style looks where it is materially justified

Signature: A1
