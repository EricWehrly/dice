# TB-01 — Foundation

**Phase**: 1  
**Status**: 🔮 Not started  
**Depends on**: nothing (first feature)  
**Blocks**: TB-02, TB-03

## Goal

The player opens the page and can roll a bag of dice. No 3D, no engine 3D bootstrap, no prior game logic. One 1d6 in the bag. Canvas renders each die as a tile showing its face-up number. A roll button re-rolls everything.

Temporary layout policy for implementation:
- Default: left play / right management split.
- Fallback: top / bottom stacking for constrained aspect ratios.

Playable checkpoint: page loads → click Roll → see numbers change.

---

## Milestones

### M1.5 — Bootstrap Cleanup (do first)

**Goal**: Page loads without 3D engine initialization. Engine `Events` system is available.

**Tasks**:
- Audit `src/index.ts` for what's needed vs 3D-specific.
- Remove `ThreeJSRenderContext`, `ThreeCam`, `DiceGraphic`, `initThrower`, and THREE.js imports from the entrypoint.
- Verify `Events` from `engine/js/events` can be imported standalone without triggering 3D context construction.
- If engine's `main.ts` / `Game` constructor pulls in 3D contexts automatically, bypass or replace it with a minimal game loop that just calls `Events` and a tick function.
- Page should load to a blank canvas (or placeholder) with no console errors.

**Gotcha**: The engine bootstrap (`Game`, `Loop`) may auto-register ThreeJS contexts. Check `engine/js/main.ts` and `engine/js/Loop.ts` before removing — may need a lightweight alternative entry.

---

### M1.1 — Die Model

**File**: `src/game/Die.ts`

```typescript
// Sketch — implement to spec, not to this exactly
class Die {
  readonly id: string;           // stable UUID
  readonly faceCount: number;    // default 6
  faceUp: number;                // 1-indexed, current result

  roll(): void                   // sets faceUp to random face
  // TODO: persistence — expose toJSON() / fromJSON() here (wire later)
}
```

**Notes**:
- `faceCount` should be immutable after construction (face expansion is a mod in TB-05).
- `faceUp` must always be in range `[1, faceCount]`.
- No weighted probability yet — plain `Math.random()`. Weighted random is introduced in TB-05.
- Include a `// TODO: persistence` comment on `toJSON`/`fromJSON` stubs so TB-03/M3.1 knows where to pick up.

**Tests**: `tests/game/Die.test.ts`
- Rolls always produce a valid face.
- Face count is respected.

---

### M1.2 — Bag Model

**File**: `src/game/Bag.ts`

```typescript
class Bag {
  readonly dice: Die[];

  rollAll(): void               // rolls every die in the bag
  addDie(die: Die): void
  removeDie(id: string): void
  // TODO: persistence — toJSON() / fromJSON() stubs
}
```

**Notes**:
- Default construction creates one 1d6.
- `rollAll()` should fire an engine `Events` event (e.g. `'bag:rolled'`) so the renderer and trick system can subscribe without coupling to Bag.
- Active/inactive die selection is added in TB-03; for now all dice roll.

**Tests**: `tests/game/Bag.test.ts`
- `rollAll()` rolls every die.
- `addDie` / `removeDie` work correctly.
- `'bag:rolled'` event fires on roll.

---

### M1.3 — 2D Canvas Renderer

**File**: `src/rendering/2d/DiceCanvasRenderer.ts`

**Goal**: Render each die in the bag as a simple square tile on a `<canvas>` element. Show the face-up number, centered. This is a placeholder — don't over-engineer.

```
┌───┐  ┌───┐  ┌───┐
│ 4 │  │ 1 │  │ 6 │
└───┘  └───┘  └───┘
```

**Implementation approach**:
- One canvas element in `index.html`.
- Renderer subscribes to `'bag:rolled'` event and redraws.
- Each tile: filled rect + centered text. Consistent tile size (e.g. 80×80px), 16px gap.
- Wrap in rows if the bag grows beyond canvas width.

**Notes**:
- No animation yet. Frame is drawn once per roll event.
- Canvas size should be responsive or at minimum large enough for ~10 dice.
- Style: dark background, light tile, white number. Exact values TBD / easy to tweak.

---

### M1.4 — Roll Button

**File**: `src/ui/RollButton.ts` (or inline in `src/index.ts` if trivial)

**Goal**: A single `<button>Roll</button>` calls `bag.rollAll()`. That's it.

**Notes**:
- Button should be disabled briefly after click if we add cooldown later; don't add it now.
- Wire up in `src/index.ts` after bag and renderer are initialized.
- Keep handler shape compatible with future partial reroll by routing through a `rollSelected(selectedIds?: string[])`-style API (currently called with no `selectedIds`, meaning full roll).

---

## Integration

`src/index.ts` after cleanup:

```typescript
import Events from '../engine/js/events';
import { Bag } from './game/Bag';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';

const bag = new Bag();
const renderer = new DiceCanvasRenderer(document.getElementById('dice-canvas') as HTMLCanvasElement, bag);

document.getElementById('roll-btn')!.addEventListener('click', () => bag.rollAll());
```

`src/index.html` needs a `<canvas id="dice-canvas">` and `<button id="roll-btn">Roll</button>`.

---

## Definition of Done

- [ ] Page loads with no console errors, no 3D initialization.
- [ ] One 1d6 is visible on the canvas.
- [ ] Clicking Roll changes the displayed number.
- [ ] Engine `Events` is imported and `'bag:rolled'` fires on roll.
- [ ] Unit tests pass for Die and Bag.
