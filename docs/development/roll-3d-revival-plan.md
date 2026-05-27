# Roll-3D Revival Plan

## Purpose

Reintroduce the old 3D rolling space as a temporary third panel, `roll-3d`, while keeping current `roll` and `mod` behavior stable during transition.

The current redesign shape is still the target contract. The 3D path should be implemented to match that shape, not to replace it with a new one.

## Confirmed Architectural Position

The clarifications below are now treated as ground rules:

- Engine runtime owns render loop, camera lifecycle, and resize handling.
- `roll-3d` is primarily a DOM viewport host for the engine context.
- `roll-3d` remains mounted when hidden; tab switching controls visibility, not teardown.
- `Bag` remains gameplay/inventory state, not scene presence.
- Camera angle and post-throw positioning are tuning controls for readability, not separate rendering architecture concerns.

## Current Alignment

- `Die` now extends engine `Entity` directly.
- `ModifiedDie` extends `Die`, so gameplay dice are also valid engine entities.
- This removes the major identity split between gameplay dice and renderable scene objects.

## Data Model Position

The intended model is:

- `Bag`: collection and roll orchestration data model (inventory/backpack semantics).
- `Die`: scene-capable die entity with rollable face state.
- `ModifiedDie`: gameplay extension of `Die` carrying mods/stats for trick-bag systems.

This means we do not need to create a separate identity type just to render 3D dice.

## Integration Focus (Revised)

The remaining integration risk is not entity identity. It is synchronization of gameplay state and scene representation:

1. Keep `Bag.rollAll()` and `BagRolledEvent` as source of truth for outcomes/history.
2. Ensure visible scene dice map 1:1 to active bag dice by id.
3. Keep lock/active/mod state reflected consistently between UI and scene.
4. Ensure throw input still respects `InputManager` cooldown and inspect gating.

## Revised Implementation Plan

This section is the operational sequence from the current 2D roller to 3D, with explicit checkpoints to compare two approaches:

- `Adapt`: recover and integrate the abandoned 3D path.
- `Rebuild`: implement directly against current engine/runtime surfaces.

At each checkpoint, choose the lower-risk path and continue. Do not commit to one path for the entire effort upfront.

### Phase 1: Stabilize Entity-Based Die Path

- Keep `Die` as an `Entity` base and validate no regressions in roll/state behavior.
- Keep `ModifiedDie` as gameplay extension of `Die`.
- Confirm existing tests and call sites still behave with entity inheritance.

Checkpoint A (Model Readiness):
- Adapt score: how much abandoned code still expects non-entity dice identity.
- Rebuild score: effort to use current `Die`/`ModifiedDie` directly.
- Proceed with whichever path keeps id/state mapping simplest.

### Phase 2: Add `roll-3d` as Viewport Slot

- Add/register a third play tab/screen id: `roll-3d`.
- Mount the engine 3D viewport into that DOM slot.
- Keep the viewport mounted across tab switches; hide/show via screen visibility only.

Checkpoint B (Viewport Integration):
- Adapt score: time to host old 3D viewport cleanly in current tab/screen model.
- Rebuild score: time to stand up equivalent viewport with current context wiring.
- Choose the approach that preserves persistent mount behavior without special-case hacks.

### Phase 3: Wire Bag to Scene Dice

- On initialization, ensure active bag dice have corresponding scene entities/graphics.
- Use die id as stable mapping key for updates.
- On roll events, update scene state/animation from bag outcomes rather than separate random state.

Checkpoint C (State Sync):
- Adapt score: how many bridge layers are required to sync old throw state to `Bag`/events.
- Rebuild score: how quickly scene updates can be driven directly from `BagRolledEvent`.
- Continue with whichever path keeps `Bag` as single source of truth with least translation.

### Phase 4: Restore Throw Presentation

- Re-enable legacy-like throw motion using existing engine path (`ThrowPathFollower` + current throw flow).
- Tune camera profile and post-throw die positions for readability.
- Keep current mod/roll/trick behavior unchanged while presentation shifts to 3D.

Checkpoint D (Visual Parity):
- Adapt score: quality and maintainability of restored throw feel.
- Rebuild score: quality and maintainability of fresh throw implementation.
- Keep the path that reaches parity with fewer one-off exceptions.

### Phase 5: Promote `roll-3d` to Primary Roll Tab

- Once parity is reached, rename/repoint tab so `roll-3d` replaces `roll` behaviorally.
- Keep 2D roll path available temporarily only as fallback until removal is safe.

Checkpoint E (Cutover Readiness):
- Verify parity checklist is green for gameplay, readability, and stability.
- If green, switch primary tab label/routing.
- If not green, keep `roll-3d` as preview and continue iteration.

## Execution Checklist

1. Finish model/property cleanup (`Die`/`ModifiedDie` + `name` standardization).
2. Add persistent `roll-3d` viewport slot and tab wiring.
3. Prove visible/invisible switching with no unmount.
4. Hook scene dice creation/update to bag dice ids.
5. Route roll outcomes through `Bag.rollAll()` only.
6. Restore/tune throw motion and camera profile.
7. Run parity pass against current roll behavior.
8. Promote `roll-3d` to primary roll tab.

## First Implementation Slice (Phase 2 + Phase 3)

This is the immediate vertical slice to start implementing now.

1. Add `roll-3d` tab/button and screen container in `src/index.html`.
2. Register `roll-3d` in `ScreenManager` wiring in `src/index.ts`.
3. Mount `ThreeJSRenderContext` canvas into the `roll-3d` container and keep it mounted.
4. Confirm tab switching only toggles visibility classes (`is-hidden`) and does not destroy context.
5. Build a `dieId -> scene entity/mesh` map for active bag dice.
6. On app init, ensure each active bag die has a mapped scene entity.
7. Subscribe to `BagRolledEvent` and drive scene updates/throw animation from event payload.
8. Add a temporary debug overlay/log that prints bag result vs scene face-up by die id.
9. Declare slice done when one full roll cycle shows exact bag/scene parity for all active dice.

Evaluation gate for this slice:

- If adapting abandoned code requires more than two translation layers to satisfy steps 5-9, switch to rebuild path for this slice.
- If rebuild path cannot restore baseline throw readability within one iteration, retry adapt path only for throw presentation while keeping bag/event wiring from rebuild.

## Acceptance Criteria (Revised)

- `roll-3d` renders from engine 3D context in its DOM slot.
- Tab switching hides/shows the viewport without unmounting it.
- Bag roll outcomes and scene-visible outcomes stay in sync by die id.
- Lock/cooldown/mod behavior remains identical to current gameplay rules.
- Camera and die placement tuning produce readable roll outcomes.
- Promoting `roll-3d` to primary roll mode requires only routing/tab changes, not gameplay rewrites.

## Open Decisions

1. Keep `roll` and `roll-3d` side-by-side for a while, or perform a fast cutover once parity hits?
2. Duration of 2D fallback support after 3D promotion.
3. Whether to move from current `ScreenManager` to fuller shell contracts before or after 3D promotion.

## Validation Plan

- Validate entity inheritance path (`Die`/`ModifiedDie`) through roll/trick/mod flows.
- Validate persistent viewport behavior when switching `roll` / `mod` / `roll-3d` tabs.
- Validate visual parity: throw, settle, readability, and outcome confidence.

## Related Docs

- [F06 - Dice Rolling Screen](../features/F06-dice-rolling-screen.md)
- [F10 - Screen Shell and Navigation](../features/F10-screen-shell-navigation.md)
- [Pivot Roadmap](../active/roadmap-pivot.md)