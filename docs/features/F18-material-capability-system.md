# F18 - Shared Material Capability System Plan

Status: 🔄 In Progress

## Objective

Create a shared capability layer that material generators can reuse, so material work scales by composing common building blocks instead of duplicating texture logic per material.

This feature exists to:

1. Order capability work by material coverage and immediate visual payoff
2. Define reusable capability modules for multiple material families
3. Enable parallel streams across capabilities (F18), material authoring (F14), and lighting/calibration support (F17)
4. Make cross-stream touchpoints explicit and schedulable

F18 is not the canonical place to define what a material should look like.
F14 owns material intent, effect presets, and named-material mapping.
F18 owns the reusable building blocks that make those presets possible.

## Scope and Non-Goals

In scope:

- Capability definitions, ownership, and implementation order
- Capability APIs shared by material generators
- Cross-feature touchpoint planning with F14 and F17

Out of scope:

- Full material variant content expansion itself (tracked in F14)
- Full lighting/IBL implementation details (tracked in F17)

## Capability Architecture Direction

Planned common layer location:

- `src/rendering/textures/capabilities/`

Planned usage model:

1. Capability modules generate deterministic masks/maps/overlays from options
2. Family generators compose capabilities in ordered passes
3. Effect presets select capability parameter sets instead of bespoke inline logic
4. Named material presets converge onto proven effect presets rather than bypassing them

Initial capability module targets:

- `RoughnessAuthorityCapability` (C1)
- `MicroGrainCapability` (C3)
- `GlazeLayerCapability` (C5)
- `DepthAttenuationCapability` (C6)
- `MacroBreakupCapability` (C2)
- `EdgeBehaviorCapability` (C4)
- `VeinMaskCapability` (C7)
- `InclusionParticleCapability` (C8)

## Capability Priority Model

Priority is based on:

- Material coverage: how many families/materials immediately benefit
- Distinctiveness lift: how much it reduces material look-alike risk
- Dependency weight: whether later capabilities depend on it
- F17 coupling: whether calibration support must exist first

Priority formula guidance:

- Prioritize high coverage + high distinctiveness + low coupling first
- Defer capabilities requiring F17 milestones unless they unblock major families

Additional prioritization rule:

- A capability should usually be justified by an effect preset that F14 is actively trying to make legible.

## Ordered Capability Backlog

| Order | Capability | ID | Primary Beneficiaries | Why This Order | Stream Owner |
|---|---|---|---|---|---|
| 1 | Roughness authority map | C1 | All families | Foundation for finish separation and stable comparisons | F18 |
| 2 | Material profile contract tests | C9 | All families | Prevents regressions while capabilities roll out | F18 + F14 |
| 3 | Micro-grain anisotropy | C3 | Metal, Plastic, Wood | Fast separation gains for current look-alike dielectrics | F18 |
| 4 | Glaze/clearcoat layering | C5 | Ceramic, Plastic, Resin | Distinguishes ceramic from polymer families | F18 |
| 5 | Internal depth/attenuation (lite) | C6-lite | Resin | Removes flat-gloss resin look early | F18 |
| 6 | Macro normal/bump breakup | C2 | Metal, Stone, Wood, Ceramic | Improves gameplay-distance structure reads | F18 |
| 7 | Edge behavior control | C4 | Metal, Ceramic, Stone | Adds family-specific silhouette/edge realism | F18 |
| 8 | Vein/cellular fracture masks | C7 | Stone/Mineral, Jade/Obsidian | Unlocks mineral family identity | F18 |
| 9 | Inclusion/flake particles | C8 | Resin, Plastic, Stone | Premium variation after baseline separation is stable | F18 |
| 10 | Lighting diagnostic integration | C10 | All families | Cross-cutting validation layer tied to F17 harness | F17 + F18 |

## Capability Phase Tracker

Each capability is tracked in three states:

- `Implementation`: core reusable module exists and is wired in at least one generator
- `Tuning`: family/material-specific parameter ranges are calibrated and documented
- `Validation`: tests and visual checks cover expected behavior and regressions

Status markers:

- `✅ Complete`
- `🔄 In Progress`
- `⏳ Not Started`
- `🚧 Blocked`

| Capability | ID | Implementation | Tuning | Validation | Notes |
|---|---|---|---|---|---|
| Roughness authority map | C1 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared module implemented and used by metal/synthetic/ceramic/stone-mineral; tuning matrix still needed |
| Material profile contract tests | C9 | 🔄 In Progress | 🔄 In Progress | 🔄 In Progress | Existing preset tests present; capability-specific assertions should be expanded |
| Micro-grain anisotropy | C3 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared module implemented and used by metal + synthetic |
| Glaze/clearcoat layering | C5 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared glaze module implemented and used by ceramic + synthetic |
| Internal depth/attenuation (lite) | C6-lite | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared depth module implemented and used by resin path in synthetic family |
| Macro normal/bump breakup | C2 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared breakup module implemented and used by metal/ceramic/stone-mineral |
| Edge behavior control | C4 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared edge module implemented and used by metal/ceramic/synthetic/stone-mineral |
| Vein/cellular fracture masks | C7 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared vein module implemented and used by stone/mineral first pass |
| Inclusion/flake particles | C8 | ✅ Complete | 🔄 In Progress | 🔄 In Progress | Shared inclusion module implemented and used by synthetic/metal/stone-mineral |
| Lighting diagnostic integration | C10 | ⏳ Not Started | ⏳ Not Started | ⏳ Not Started | Depends on F17 M1 harness delivery |

## Current Execution Snapshot (June 2026)

- Capability modules C1-C8 now exist in `src/rendering/textures/capabilities/`.
- First-pass consumption is wired into metal, synthetic/polymer, ceramic, and stone/mineral generators.
- Stone/mineral generator coverage includes `stone`, `obsidian`, `jade`, `marble`, and `granite`.
- Runtime generator coverage now spans all currently selectable body materials (19/19).
- Build passes; tuning and capability-level validation remain active work items.

## Capability-to-Material Adoption Plan

| Material Family | First Required Capabilities | Second-Pass Capabilities | Deferred Capabilities |
|---|---|---|---|
| Synthetic/Polymer | C1, C3, C5 | C6-lite, C8 | C4 |
| Ceramic/Porcelain | C1, C5, C2 | C4 | C8 |
| Metal | C1, C3, C2 | C4, C5 | C8 |
| Stone/Mineral | C1, C7, C2 | C4, C8 | C3 |
| Wood/Organic | C1, C3, C2 | C4 | C8 |
| Transparent Gem/Glass | C1, C6, C5 | C7, C4 | C8 |

## Parallel Stream Model

### Stream A: Capability Platform (F18)

- Implements shared capability modules and API contracts
- Delivers capability tests and reference fixtures

### Stream B: Material Authoring (F14)

- Consumes capability modules in family generators
- Tunes family effect presets first, then maps named materials onto them

### Stream C: Lighting and Calibration Support (F17)

- Provides diagnostic controls and normalized lighting baselines
- Validates capability behavior under stable lighting conditions

## Touchpoints Between Streams

| Touchpoint | Trigger | Required Participants | Output |
|---|---|---|---|
| T1 Capability API freeze | Before each capability implementation starts | F18 + F14 | Stable options interface and default profile |
| T2 Visual baseline capture | After capability integration into first family/effect preset | F14 + F17 | Before/after screenshot matrix under pinned profile |
| T3 Regression gate | Before merging capability-consuming family updates | F18 + F14 | Contract tests updated and passing |
| T4 Lighting sanity gate | Before enabling capabilities relying on env/exposure sensitivity | F17 + F14 | Verified behavior in gameplay and debug-flat |

## F17 Dependency Map (Support Only)

| Capability | F17 Dependency | Dependency Type |
|---|---|---|
| C1, C3, C5 | M1 diagnostics | Recommended |
| C6, C10 | M1 + M2 | Required |
| C2, C4, C7 | M4 lighting profile normalization | Recommended |
| C8 | M2 + M4 | Recommended |

Rule: if a capability has a required dependency, F17 milestone completion is needed before merge; otherwise merge is allowed with explicit risk note.

## Milestones

### Milestone 1: Core Dielectric Capability Kit

Deliver:

- C1, C3, C5, C6-lite, C9
- Adopt in synthetic/polymer and ceramic

Expected outcome:

- Plastic, resin, ceramic become visibly non-overlapping at gameplay distance

Current status:

- Implementation: ✅ complete (first pass)
- Tuning: 🔄 in progress
- Validation: 🔄 in progress

### Milestone 2: Structural Surface Kit

Deliver:

- C2, C4, C7
- Adopt in stone/mineral and wood, refine ceramic and metal usage

Expected outcome:

- Mineral and wood families gain unique structure beyond color

Current status:

- Implementation: ✅ complete (first pass for stone/mineral + wood)
- Tuning: 🔄 in progress
- Validation: 🔄 in progress

### Milestone 3: Premium Variation and Global Validation

Deliver:

- C8, C10
- Enable premium variants with diagnostics-backed validation

Expected outcome:

- Premium looks are additive without destabilizing baseline families

Current status:

- Implementation: 🔄 in progress (C8 primitives active; glass/crystal baseline now wired; C10 not started)
- Tuning: ⏳ not started
- Validation: ⏳ not started

## Acceptance Criteria

1. Capability modules are reusable by at least two families each (except C6-lite, which starts resin-only)
2. F14 family generators consume capabilities instead of duplicating core logic
3. Capability-specific tests guard regressions in profile behavior
4. F17 dependencies are tracked with explicit required/recommended status
5. Parallel stream touchpoints are used at each milestone gate

## Cross-References

- Material rollout and family priorities: `docs/features/F14-material-authoring-plan.md`
- Lighting/calibration support milestones: `docs/features/F17-physical-material-calibration-and-ibl.md`

Signature: A1