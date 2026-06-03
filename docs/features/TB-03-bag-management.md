# TB-03 — Bag Management & Collection Field Limits

**Phase**: 3  
**Status**: 🔄 In Progress  
**Depends on**: TB-01 (Die, Bag), TB-02 (Trick interface, for wiring Decimal Milestone reward)  

**Last Updated**: 2026-06-02

**Progress (2026-06-02 - Implementation Sprint)**:
- ✅ **M3.1 Die Identity**: `id`, `label` implemented on `Die`.
- ✅ **M3.2 Equipped Dice Limit**: `DiceEquipmentBag` superclass created with full API (equip, unequip, toggleEquipped, getEquippedDice, rollAll override). Auto-equip logic in index.ts, first 6 dice equipped on startup.
- ✅ **M3.5 Horde Screen**: 3D grid scene created (HorseScene.ts), setupHorseScreen.ts wiring complete, horde-mode tab added to HTML, index.ts integration done. Aesthetic: trophy room (dark bg, warm lighting, materials showcase).
- ✅ **M3.4 Canvas Visual**: DiceCanvasRenderer updated to show only equipped dice (with fallback for non-equipped bags).
- 🔄 **M3.3 Earning Dice**: Need to wire ScoreProgressionTracker to auto-equip new dice; deferred to next sprint for integration testing.
- 🔮 **M3.4 Lock Badges**: Lock visual indicators in canvas and horde scenes not yet implemented; deferred to next sprint.
- 🔮 **Tests**: Unit tests for DiceEquipmentBag, HorseScene, and integration tests needed.

## Goal

Players collect unlimited dice (earning them from tricks) but can only equip a limited number (6) to field for rolling. They need:
1. A **field limit** enforcing max 6 equipped dice.
2. A **horde screen** (new tab): 3D grid view showing all collected dice with equip/unequip affordances.
3. **Modification parity**: Click any die in horde to modify it (same panel as roll screen).

Playable checkpoint:
- Roll → earn dice → exceed 6 → see them in horde tab.
- Horde shows all dice in a grid, highlighting equipped vs. unequipped.
- Click to equip/unequip (respects 6-die limit).
- Click a die to modify (reuses `DieModificationPanel`).
- Switch tabs back to roll → only equipped dice shown and rolled.

## Current Assessment

**Existing bag system**:
- `Bag.dice[]` holds all owned dice.
- `die.locked` gates reroll behavior within the currently fielded set.
- `Bag.rollAll()` currently rolls all unlocked dice in the bag.
- `BAG_CHANGED` event fires on add/remove/toggle.

**What's missing**:
1. **Equipped vs. owned distinction**: Need equipped state (max 6 subset) as the fielding gate.
2. **Superclass separation**: New `DiceEquipmentBag` superclass to cleanly separate equipped logic from base `Bag`.
3. **Horde screen UI**: Separate 3D scene as a new tab with grid layout, arrow-key navigation, click-to-select.
4. **Persistence**: Deferred to FP-1 (persistence feature); will be explicitly signed off separately when that feature is planned.

---

## Milestones

### M3.1 — Die Identity ✅

**Status**: Implemented.

**Current**: `Die` has `id` (UUID), `label` (d6/d8), `faceCount`, `faceUp`, plus materials/styles.

**Reality check**: All fields present; serialization stubs are **not** required for TB-03. Any snapshot work is deferred to FP-1 (persistence feature).

**Tests**: Existing coverage sufficient.

---

### M3.2 — Equipped Dice Limit & `DiceEquipmentBag` Superclass

**New class structure**: `src/game/DiceEquipmentBag.ts`

```typescript
export class DiceEquipmentBag extends Bag {
    readonly equippedIds: string[] = [];
    readonly EQUIPPED_LIMIT = 6;

    isEquipped(dieId: string): boolean {
        return this.equippedIds.includes(dieId);
    }

    equip(dieId: string): boolean {
        if (this.equippedIds.length >= this.EQUIPPED_LIMIT) {
            return false; // Limit reached
        }
        if (!this.equippedIds.includes(dieId)) {
            this.equippedIds.push(dieId);
            this.raiseBagChanged();
        }
        return true;
    }

    unequip(dieId: string): void {
        const idx = this.equippedIds.indexOf(dieId);
        if (idx >= 0) {
            this.equippedIds.splice(idx, 1);
            this.raiseBagChanged();
        }
    }

    toggleEquipped(dieId: string): boolean {
        if (this.isEquipped(dieId)) {
            this.unequip(dieId);
            return false; // Now unequipped
        } else {
            return this.equip(dieId); // Returns true if equip succeeded, false if limit hit
        }
    }

    getEquippedDice(): Die[] {
        return this.dice.filter(d => this.isEquipped(d.id));
    }

    override rollAll(): number[] {
        // Only roll equipped, unlocked dice
        const equippedDice = this.getEquippedDice();
        const unlockedEquippedDice = equippedDice.filter((die) => !die.locked);
        this.applyLaneOrdering();

        unlockedEquippedDice.forEach((die) => {
            die.roll();
        });

        const faceResults = Object.freeze(
            equippedDice.map((die) => new DieFaceResult(die.faceUp, { rolled: !die.locked }))
        );
        const faces = faceResults.map((faceResult) => faceResult.computed_value);

        this.rollHistory.push(faceResults);

        Events.RaiseEvent<BagRolledEvent>(TrickEvents.BAG_ROLLED, {
            faces,
            faceResults,
            diceIds: equippedDice.map((die) => die.id),
            rollHistory: this.rollHistory,
        });

        return faces;
    }
}
```

**Rationale for superclass**:
- Clean separation of concerns: `Bag` remains simple (add/remove), `DiceEquipmentBag` adds field-limit logic.
- Future-proof: if game ever needs multiple bag types (e.g., storage bag vs. fielded bag), this structure scales.
- Behavioral override: `rollAll()` uses equipped as the roll eligibility gate, and `locked` remains the per-roll gate.

**Update `src/index.ts`**:
- Change `const bag = new Bag()` to `const bag = new DiceEquipmentBag()`.
- All existing roll/event logic continues to work (interface unchanged from caller perspective).

**Behavior**:
- New dice are added to collection but **not automatically equipped**.
- Caller (horde screen or earn-dice logic) must explicitly `equip(id)` to add to field. 
- `toggleEquipped()` returns false if equip-attempt fails due to limit.

**Tests**:
- ✅ `equip()` rejects when limit (6) reached; returns false.
- ✅ `getEquippedDice()` returns only equipped dice.
- ✅ `rollAll()` only rolls equipped, unlocked dice.
- ✅ Equip/unequip fire `BAG_CHANGED`.
- ✅ Adding a die does not auto-equip (caller controls).

---

### M3.3 — Earning Dice (Updated for Equipped)

**Status**: Already implemented; update behavior.

When Decimal Milestone fires:
1. Create new `Die`.
2. Call `bag.addDie(newDie)`.
3. **NEW**: If `bag.equip(newDie.id)` succeeds, die is equipped. Otherwise, toast: "Collection full, unequip a die to add this one."
4. Fire `BAG_CHANGED`.

**Behavior**: New earned dice auto-equip only if room available. If 6 are already equipped, the new die enters the collection unequipped (player must manually equip via horde screen).

**Update**: `src/game/score/ScoreProgressionTracker.ts`

```typescript
if (this.bag.equip(newDie.id)) {
    // Auto-equipped; fire event if desired
} else {
    // Show toast or feedback: collection full
    console.log('Collection full; new die unequipped');
}
```

**Tests**:
- ✅ First 6 earned dice auto-equip.
- ✅ 7th earned die does not auto-equip; lands unequipped.
- ✅ `BAG_CHANGED` fires either way.

---

### M3.4 — Canvas Visual Treatment (Die Selection)

**Update**: `src/rendering/2d/DiceCanvasRenderer.ts`

The canvas shows only equipped dice:
- Only render equipped dice.
- Dim or badge locked dice (lock icon or reduced opacity).
- Clicking a die still opens mod panel.

**Behavior**:
- Unequipped dice do **not** appear on the roll canvas.
- Only equipped dice are shown.

**Tests**:
- ✅ Only equipped dice render on canvas.
- ✅ Locked dice show lock visual indicator.

---

### M3.5 — Horde Screen (New 3D Collection Browser Tab)

**Architecture**: New tab in `ScreenManager` (alongside `roll`, `mod` tabs).

**Target**: `src/rendering/3d/scenes/HordeScene.ts` (new)  
**UI Integration**: `src/utils/ScreenManager.ts` — register `"horde"` tab.

#### Overview

A separate 3D scene showing all owned dice in a grid layout (rows and columns). Player can:
- Browse the collection.
- See which dice are equipped vs. unequipped (visual highlight or badge).
- Click a die to open its modification panel.
- Use arrow keys to navigate between dice (shift focus/highlight).
- Equip/unequip dice in modify panel (with "limit reached" feedback).
- Switch back to roll tab (no return button needed; tab system handles it).

#### Design Details

**Aesthetic: Trophy Room**:
- Environment: Warm, polished wooden shelving or displaycase, dim museum-like lighting with subtle spotlights on dice.
- Background: Dark, neutral tone to make materials (brass, gold, obsidian, ceramic, etc.) shine.
- Lighting: Mix of key light (3-point or museum exhibit style) to show off die materials and finishes.
- Use existing material catalog: brass, silver, gold, obsidian, ceramic, resin, plastic with various finishes (polished, hammered, plain) already defined.
- Visual hierarchy: Equipped dice get a subtle gold or warm highlight; unequipped dice neutral; locked state shows a subtle badge.

**Layout**:
- Grid of dice arranged in rows and columns (e.g., 6 per row) on virtual shelves or a 3D grid.
- Each die renders as a 3D object (reuses `DiceGraphic` rendering engine).
- Camera framing: **Decision made**: Fit all owned dice in one viewport (zoom out as needed for now).
- Environmental backdrop: Shelving or display case to reinforce collection/trophy aesthetic.

**Navigation**:
- **Mouse**: Click on a die to open its modification panel.
- **Keyboard (Arrow Keys)**: Navigate to adjacent dice (shift focus/highlight).
  - Up/Down: Change row.
  - Left/Right: Change column.
  - Wrap around at edges (right at end of row → leftmost die in next row, etc.).

**Die States (Visual)**:
- **Unequipped**: Full color and opacity.
- **Equipped**: Subtle highlight or ring around die (e.g., gold outline or slight glow).
- **Locked** (per-session): Secondary lock badge or overlay (note: lock toggling remains on roll canvas; horde shows lock state but does not toggle it).
- **Focused/Selected** (by arrow keys): Larger zoom orbit or highlight effect.

**Interaction**:
- **Click Die**: Opens `DieModificationPanel` overlaid or in a modal.
- **Modify Panel**:
  - Shows die name, materials, equipment status.
  - Includes **equip/unequip toggle button**.
  - Equip respects 6-die limit; shows inline error if rejected.
  - Decision made: **Modification panel is modal overlay** (reuses existing panel component).
- **Close Panel**: Returns focus to horde grid.
- **Arrow keys in grid**: Navigate between dice.

**Tab Switching**:
- Switch to `"roll"` tab: Closes horde, returns to roll canvas showing only equipped dice.
- Switch to `"horde"` tab: Opens horde grid showing all owned dice.
- No "return" button; tabs are first-class UI surfaces.

#### Implementation Notes

- Reuse `DiceGraphic` rendering (same 3D model/material system as roll scene).
- Grid layout: Simple `Coordinate3D` matrix (e.g., `row * cols + col` for position).
- Arrow-key listener: Subscribe to window or `InputManager` if available. Only enabled when horde tab is focused.
- Modification panel: Reuse existing `DieModificationPanel` component; pass `DiceEquipmentBag` instance for equip/unequip calls.
- Events: Reuse `BAG_CHANGED` for all mutations.

**Lock state behavior**: 
- Horde displays lock badges for informational purposes.
- Lock toggling happens only on roll canvas (per-session state, not collection state).
- Comment in code: `// TODO: lock state is transient per-session; consider moving to persistent die state if needed later`.

**Tests**:
- ✅ Horde scene renders all owned dice in grid layout.
- ✅ Arrow navigation cycles through focused dice.
- ✅ Click to open modify panel.
- ✅ Equip/unequip toggle in panel succeeds when room available, shows error when limit reached.
- ✅ Closing panel returns focus to grid.
- ✅ Switching to roll tab shows only equipped dice on canvas.

---

## Events Used

| Event | Fired by | Subscribed by |
|-------|----------|--------------|
| `BAG_ROLLED` | `DiceEquipmentBag.rollAll()` | Canvas renderer, Trick evaluator |
| `BAG_CHANGED` | `Bag.addDie`, `removeDie`, `toggleLocked` + `DiceEquipmentBag.equip`, `unequip`, `toggleEquipped` | Canvas renderer, score tracking, horde screen, die-selection UI |

---

## Tests (Summary)

**`tests/game/DiceEquipmentBag.test.ts`** (new):
- ✅ `equip()` rejects when limit (6) reached; returns false.
- ✅ `getEquippedDice()` returns only equipped dice.
- ✅ `rollAll()` only rolls equipped, unlocked dice.
- ✅ `toggleEquipped()` auto-equips or unequips; returns success bool.
- ✅ New die added but not auto-equipped by default.
- ✅ Auto-equip on earn works for first 6, fails on 7th.

**`tests/rendering/3d/HordeScene.test.ts`** (new):
- ✅ Scene renders all owned dice in grid.
- ✅ Arrow navigation cycles through dice.
- ✅ Click opens modify panel.
- ✅ Equip/unequip toggle in panel with limit enforcement.
- ✅ Tab switch shows only equipped on roll canvas.

---

## Definition of Done

### M3.2 (Equipped Limit & DiceEquipmentBag)
- [x] `DiceEquipmentBag` superclass created with `equippedIds`, `equip()`, `unequip()`, `toggleEquipped()`.
- [x] `DiceEquipmentBag.getEquippedDice()` returns only equipped.
- [x] `DiceEquipmentBag.rollAll()` uses `getEquippedDice()` (overrides base `Bag`).
- [x] Limit (6) enforced; `equip()` returns boolean.
- [x] `src/index.ts` uses `DiceEquipmentBag` instead of `Bag`.
- [x] First 6 dice auto-equipped on startup for testing.
- [ ] Tests pass (equip limit, roll filtering, event firing).

### M3.3 (Earning Dice)
- [ ] Earned dice auto-equip if room; else stay unequipped.
- [ ] Optional toast feedback when collection full.
- [ ] Tests confirm auto-equip behavior (first 6 succeed, 7th unequipped).
- [ ] ScoreProgressionTracker wired for auto-equip on earn.

### M3.4 (Canvas Visual Treatment)
- [x] Only equipped dice render on 2D roll canvas (with duck-typing fallback).
- [ ] Locked dice show visual lock badge/indicator.
- [ ] Tests confirm rendering logic.

### M3.5 (Horde Screen Tab)
- [x] Horde scene renders all owned dice in grid layout (HorseScene.ts created).
- [x] Arrow-key navigation works (cycles through dice).
- [x] Horde tab added to HTML (horde-mode-btn, horde-screen container).
- [x] setupHorseScreen.ts wires scene to ScreenManager and mod panel.
- [x] 12 varied test dice created on startup for visual variety.
- [x] Trophy room aesthetic in progress (dark background, warm lighting setup).
- [ ] Click die opens modification modal (integration test pending).
- [ ] Equip/unequip toggle in modification modal with limit enforcement (integration test pending).
- [ ] Tab switch back to roll shows only equipped dice on canvas (logic in place, E2E test pending).
- [ ] Lock state displays as badge but cannot be toggled in horde (visual implementation deferred).
- [ ] Full test coverage for grid layout, navigation, equip logic, panel integration, tab switching.

---

## Persistence & Future Work

**Deferred to FP-1** (Persistence Feature, explicitly signed off later):
- Serialization snapshots (`DieSnapshot`, `BagSnapshot`).
- LocalStorage / cloud save/load logic.
- Restore `equippedIds` and die state on reload.

**Note**: TB-03 is runtime-only. When persistence arrives, it will add serialization and restore logic but will not change the core equipped/bag mechanics defined here.

---

**Signature**: O2, A1, L1 (TB-03 finalized with DiceEquipmentBag separation, horde tab, deferred persistence, 2026-06-02)
