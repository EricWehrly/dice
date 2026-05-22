# F02 - Throw Input and Cooldown

Status: 🔄 In Progress

## Goal
Support left-click throw flow using engine entities with cooldown and predictable reset behavior.

## Scope
- Throw input wiring
- InputManager cooldown enforcement
- Throw animation integration
- Reset/snap behavior for previously thrown dice
- Cooldown HUD indicator

## Done
- Thrower init wired into game startup path
- Left-click throw path uses InputManager gate
- createCubeAtCursor spawns entity + enqueues throw path to landing position
- Throw motion moved to entity path follower (engine render loop drives entity.position updates)
- Removed Three.js mesh-only throw path and external animation flag usage for throws

## Remaining
- Implement reset/snap behavior for previously thrown dice on new throw
- Add cooldown HUD visual (clock-sweep circle)
- Add tests for reset and cooldown HUD state transitions

## Acceptance Criteria
- Left-click throws one dice when cooldown allows
- Repeated clicks during cooldown do not throw
- Thrown dice remain visible after throw at landing position
- New throw resets/snap-hides prior throw visuals per current design decision
- Cooldown indicator clearly reflects time remaining

## Parked - Throw Animation (Three.js AnimationMixer)

The parabolic arc + rattle-on-landing animation was prototyped and mostly working,
but does not fit cleanly against the current engine's entity/position model:

- Engine redraws mesh position from `entity.position` every frame — fights animation
- `externalAnimation` flag was added to suppress this, cleared on mixer `finished`
- Position write-back required `as any` cast due to read-only `WorldCoordinate`
- The animation tracks (parabolic, rattle-position, rattle-rotation) work correctly
  in isolation but the contract between game and engine was unclear

**Approach to revisit**: Engine accepts `animationClip?: (graphic: THREE.Object3D) => THREE.AnimationClip`
in `Entity3DConfig`. Game provides the factory; engine owns mixer lifecycle + render-loop update.
This cleanly separates authorship (game defines art, engine runs playback).

Files with the parked animation code: `src/thrower/animate-parabolic.ts`, `src/thrower/animate-rattle.ts`, `src/utils/AnimationSequencer.ts` — deleted as part of simplification but logic is in git history.
