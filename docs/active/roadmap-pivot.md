# Dice Game - Pivot Roadmap (Screen Architecture)

Branch: pivot-screen-architecture-plan
Purpose: build 4 presentation-agnostic screens and implement them through existing engine frameworks (Events, render contexts, UIElement/Menu, RenderLayer controls), not app-level DOM overlays.

Feature docs: [F05](../features/F05-die-face-up-probability-model.md), [F06](../features/F06-dice-rolling-screen.md), [F07](../features/F07-dice-upgrading-screen.md), [F08](../features/F08-dice-details-screen.md), [F09](../features/F09-trick-list-screen.md), [F10](../features/F10-screen-shell-navigation.md)
Related context: [F03 - Inspector Selection and Deferred UI](../features/F03-inspector-selection.md)

## Architecture Principle

Screens are **pure presentation components** with no knowledge of how they're displayed (modals, screen switches, overlays, etc.). The **Screen Shell** is a presentation adapter that wraps screens and handles navigation and lifecycle. This inversion keeps screens simple and reusable.

## Engine-Native Constraint

Screen orchestration must be built on engine primitives already present in this repo:
- Event routing through `Events`
- Visual 3D rendering through `ThreeJSRenderContext`
- UI composition through `UIElement`/`Menu` rendered via `DomRenderingContext`
- Visibility/pause policy through `RenderLayer` and context/layer enablement

No direct app-owned DOM trees for screen switching in the final implementation path.

## Product Target

Arrive at 4 player-facing screens that can later be presented either:
- as full screen switches, or
- as modal overlays above a persistent main scene.

Target screens:
- Dice Rolling
- Dice Upgrading
- Dice Details (orbit cam + full property list)
- Trick List (accomplishments/logbook)

## Current Priority Order

1. 🔮 [F05 - Die Face Up-Probability Model](../features/F05-die-face-up-probability-model.md) (pure data layer)
2. 🔮 [F10 - Screen Shell and Navigation](../features/F10-screen-shell-navigation.md) (engine adapter contracts)
3. 🔮 [F06 - Dice Rolling Screen](../features/F06-dice-rolling-screen.md) (screen implementation)
4. 🔮 [F07 - Dice Upgrading Screen](../features/F07-dice-upgrading-screen.md) (screen implementation)
5. 🔮 [F08 - Dice Details Screen](../features/F08-dice-details-screen.md) (screen implementation)
6. 🔮 [F09 - Trick List Screen](../features/F09-trick-list-screen.md) (screen implementation)

## Status Summary

- Existing throw flow and scene rendering provide a usable base for Dice Rolling.
- Inspector concepts overlap strongly with Dice Details, but prior implementation was deferred.
- Probability-of-up per face is a new model requirement.
- Screens should be presentation-agnostic; presentation strategy (screen switch vs modal) is applied by shell, not built into screens.

## Dependency Flow

```
F05 (Probability Model)
   ↓
F10 (Engine Screen Shell Adapter)
   ↓
F06/F07/F08/F09 (Pure Screen Specs + Engine UI Bindings) ← F05
   ↓
Runtime integration in Events + RenderContexts
```

Screens consume probability data but have **no coupling to presentation choice**.
Shell owns navigation and delegates rendering through engine UI/renderer systems.

## Foundation Tasks Before Feature Buildout

1. Define screen navigation events in engine event list and typed payloads.
2. Define one shell state source for active screen and selected die context.
3. Define layer policy for each screen:
- Which render contexts stay active
- Which layers are enabled/disabled
- Whether gameplay updates continue
4. Define UI mounting strategy via UIElement/Menu zones, not manual document overlays.

## State Ownership

- Probability data: owned by F05 model, derived from die state.
- Screen view-models: produced by shell selectors and passed to screen binders.
- Navigation/lifecycle: owned by F10 shell adapter and event contracts.

## Phase 1 Delivery Goal

Engine-native shell + one fully wired screen switch path:
- rolling screen remains active baseline
- one additional screen displayed through engine UI system
- no direct app-owned DOM overlay for screen orchestration
- probability model contract available to both screens

## Future Expansion

Once F10 shell is working, modal presentation becomes a presentation-layer decision: swap the shell adapter, not the screens.

## Planned Mods (not yet implemented)

| Mod | Status | Notes |
|-----|--------|-------|
| Weight (1.0–2.5g) | ✅ Active | Face-targeted; shifts probability toward weighted face |
| Brain | 🔮 Future | AI-assisted adaptive weighting; adjusts per-face weights based on usage patterns. See `src/ui/DieModificationTypes.ts` for placeholder comment. |

## Style And Naming Intent (Planned)

- Default die style should be `plastic` for the upgrading/modification flow.
- In the modification screen, the default die label should read `plastic d6`.
- This is a documentation-only intent for now; implementation is intentionally deferred.
