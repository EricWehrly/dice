# TB-09 - Pip Face Slot and Symbol Library

Status: 🔮 Planned

Depends on:
- TB-08 `faceStyle` slot contract
- TB-07 lock-as-face-style direction
- F11 pip-shape rendering surface

## Goal

Define an implementation-ready contract for a dedicated pip-face modification slot that supports symbol-based face rendering, starting with:

1. `lock`
2. `x`
3. `clover`

This document is planning-only. No runtime behavior changes are required in this pass.

## Why This Is Separate

Current docs partially cover this:
- F11 covers shape rendering direction.
- TB-07 covers lock visual behavior.
- TB-08 covers named equipment slots.

What is missing is one shared spec that combines slot semantics and symbol catalog policy into a single implementation target.

## Scope

In scope:
- Face-symbol slot naming and ownership.
- Symbol catalog for lock/x/clover and fallback behavior.
- Renderer contract in 2D now, with 3D parity notes.
- UI install/replace/remove flow for the face-symbol slot.
- Event and test expectations.

Out of scope:
- New game rules for all symbols beyond lock behavior already covered in TB-07/TB-07 lock-breaking.
- Full texture/material polish from F12/F14.
- Economy balancing for symbol unlock cadence.

## Slot Contract

Use the TB-08 lane naming and treat this as the `faceStyle` lane.

Recommended normalized shape:

```ts
type FaceStyleId = 'none' | 'circle' | 'lock' | 'x' | 'clover';

interface FaceStyleSlotState {
  faceStyle: FaceStyleId;
}
```

Rules:
- One equipped face style per die.
- Installing a face style replaces the previous face style.
- `none` removes the equipped symbol style and returns to default circle behavior.
- Gameplay-affecting and purely visual effects remain separate concerns:
  - `mod` lane handles probability/physics mechanics.
  - `faceStyle` lane handles face icon rendering and icon-linked interactions.

## Symbol Catalog v1

### `circle`
- Default baseline style.
- Scoring fallback identity for symbol faces unless a specific mechanic overrides it.

### `lock`
- Renders padlock glyph in pip positions.
- Supports locked/unlocked visual variants.
- Interaction semantics remain owned by TB-07 + lock-breaking follow-up.

### `x`
- Renders an `x` glyph in pip positions.
- First implementation is visual-only unless a dedicated mechanic doc extends it.

### `clover`
- Renders four-leaf clover glyph in pip positions.
- First implementation is visual-only unless a dedicated mechanic doc extends it.

## Rendering Contract

Primary renderer touchpoint:
- `src/rendering/2d/DieFaceTileRenderer.ts`

Expectations:
- Symbol selection is driven by `faceStyle` slot state.
- Face-value layout logic remains separate from glyph drawing logic.
- Numeral fallback for dense faces remains valid per F11 readability rules.
- If a symbol id is unknown, render `circle` as safe fallback.

3D parity note:
- F12/F14 path should consume the same symbol id contract so 2D/3D views do not diverge semantically.

## UI Contract

Primary UI touchpoints:
- `src/ui/DieModificationTypes.ts`
- `src/ui/DieModificationPanelTemplate.ts`
- `src/ui/DieModificationPanel.ts`

Behavior:
- Face style selector includes `none`, `lock`, `x`, `clover`.
- Install action writes to `faceStyle` lane only.
- Replace semantics are explicit in UI copy/preview.
- Remove semantics are represented by selecting `none`.

## Event Contract

When face style changes, fire a die-equipment changed event with enough detail to know the lane changed to `faceStyle`.

Minimum payload shape (illustrative):

```ts
interface DieEquipmentChangedEvent {
  dieId: string;
  slot: 'mod' | 'faceStyle' | 'bodyStyle';
  previous: string | null;
  next: string | null;
}
```

## Test Plan

1. Unit: face-style id validation and fallback behavior.
2. Unit: glyph dispatch for `lock`, `x`, `clover` in tile renderer.
3. Integration: UI install/replace/remove flow for face style slot.
4. Integration: roll canvas respects lock interactions while other symbols remain visual-only.
5. Regression: unknown face-style id falls back to circle rendering without crash.

## Milestones

### M9.1 - Catalog and Type Contract
- Add/align `FaceStyleId` and selector values.
- Ensure storage + event payloads carry lane-specific change data.

### M9.2 - Renderer Glyph Additions
- Add `x` and `lock` glyph support if missing.
- Verify `clover` alignment and readability at target tile sizes.

### M9.3 - Panel Flow and Replace Semantics
- Wire selector + install path to `faceStyle` lane.
- Confirm `none` uninstall path.

### M9.4 - Lock Interaction Validation
- Ensure lock-specific interaction path remains tied to `lock` face style.
- Confirm no accidental lock behavior for `x`/`clover`.

### M9.5 - Test Coverage
- Land targeted unit and integration tests listed above.

## Acceptance Criteria

- [ ] One authoritative slot lane (`faceStyle`) controls pip-face symbol rendering.
- [ ] Catalog includes `lock`, `x`, and `clover`.
- [ ] Unknown symbol ids fail safely to `circle`.
- [ ] UI can install, replace, and remove face styles.
- [ ] Lock behavior remains isolated to `lock` style only.
- [ ] Tests cover contract, rendering dispatch, and install flow.

## Implementation Entry Points

- Start from TB-08 slot contract and event payloads.
- Reuse F11 shape guidance for readability and fallback policy.
- Reuse TB-07 for lock visual + interaction expectations.
