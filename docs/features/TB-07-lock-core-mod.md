# TB-07 — Face Style / Body Style Split for Lock

**Status**: 🔄 In Progress (re-evaluated against current branch state)  
**Depends on**: TB-05 modification flow, current face-style draft plumbing, and the in-progress 3D branch

---

## Current State

The branch already has:

- draft face-style state in the modification panel
- an installed-mod model that can carry a single installed modification slot
- roll-screen lock toggling in game state
- a shared 2D tile renderer that can be extended for lock glyphs

What is still missing is the distinction between **face style** and **body style** in the UI/model flow, so the lock can occupy the face-style/equipment slot cleanly.

---

## Goal

1. Split modification choice into face style vs body style.
2. Make lock the initial face-style option.
3. Treat lock as the die's equipment-style face icon, not a separate button.
4. Render a lock glyph directly where a pip would normally draw.
5. Keep the lock toggle interaction as a tap/click on the die tile.

---

## Visual Direction

The lock is a pip-style glyph.

- Locked icon: closed shackle.
- Unlocked icon: raised/open shackle.
- The glyph should be larger and clearer than the first pass.
- The shackle bar should be thicker by a few pixels so it reads at tile size.
- The icon should still sit in the pip layout, not in a corner badge or separate control.

---

## Milestones

### M7.1 — Introduce Face Style vs Body Style

Files:
- src/ui/DieModificationPanel.ts
- src/ui/DieModificationPanelTemplate.ts
- src/ui/DieModificationTypes.ts
- src/game/ModifiedDie.ts

Tasks:
1. Separate modification state into face-style and body-style lanes.
2. Keep the existing install flow compatible with the current model shape.
3. Ensure the face-style selector is enabled for the lock path.
4. Leave body-style plumbing in place for future expansion without forcing it into the first lock slice.

Acceptance:
- UI can distinguish face style from body style.
- Lock is available as the face-style option for now.

---

### M7.2 — Add Lock as the Face Style

Files:
- src/ui/DieModificationTypes.ts
- src/ui/DieModificationPanelTemplate.ts

Tasks:
1. Add lock to the available face styles.
2. Make it the only active lock-related style for this pass.
3. Surface the selected style description in the panel if helpful to the player.

Acceptance:
- Lock can be selected as a style in the UI.
- The UI does not require the old core-mod concept for the first lock implementation.

---

### M7.3 — Render Lock as a Pip Glyph

Files:
- src/rendering/2d/DieFaceTileRenderer.ts

Tasks:
1. Add a lock pip style that renders where pips normally render.
2. Implement locked and unlocked variants by moving the shackle/opening portion up and down.
3. Thicken the shackle and scale the glyph up for readability.

Acceptance:
- A lock-style die visibly renders a padlock-like pip.
- The locked/unlocked difference is legible from the icon itself.

---

### M7.4 — Tap-to-Lock Behavior on the Roll Canvas

Files:
- src/rendering/2d/DiceCanvasRenderer.ts
- src/game/Bag.ts

Tasks:
1. Use die tile hit-testing to toggle lock state.
2. Keep the lock toggle on die tap, not a separate button.
3. Preserve the current reroll skip behavior for locked dice.

Acceptance:
- Clicking/tapping the die toggles lock/unlock.
- Locked dice do not reroll until unlocked.

---

### M7.5 — Integration Test Across UI, Model, and Roll Flow

File:
- tests/integration/lock-face-style-flow.test.ts (new)

Coverage:
1. Select lock face style in the modification UI.
2. Install it and confirm the die model stores the style.
3. Confirm the renderer draws the lock glyph.
4. Tap the die to lock.
5. Roll and confirm the locked die is skipped.
6. Tap again to unlock and confirm it rerolls.

Systems included:
- modification UI state and install path
- die model style persistence
- shared tile renderer glyph selection
- roll canvas tap handling
- bag roll behavior

---

## Definition of Done

- [ ] Face style and body style are distinct in the modification flow.
- [ ] Lock is available as a face-style option.
- [ ] Lock renders as a readable pip glyph.
- [ ] Locked and unlocked states are visually distinct.
- [ ] Tapping a die toggles lock/unlock.
- [ ] Locked dice skip reroll; unlocked dice reroll.
- [ ] Integration test covers the full install → render → tap → reroll chain.

---

## Incremental Commit Slices

Suggested order once implementation begins:

1. Update UI/model for face style vs body style separation.
2. Add lock as the selectable face style.
3. Render lock as a pip glyph, including locked/unlocked variants.
4. Wire tap-to-lock behavior on the roll canvas.
5. Add integration coverage.

---

## Deferred

- Lock breaking behavior (same-face internal roll breaks lock): see [TB-07-lock-breaking.md](./TB-07-lock-breaking.md).
- Session-based lock reset: depends on a future session/round model.

---

## Appendix A — Parked Core-Mod Direction

This older direction remains intentionally preserved for reference:

- Lock as a core mod installed per die.
- Lock UI gated on the core mod existing.
- Core-mod descriptions in the UI.

It is not the active path for this phase, but it is still valuable context if we need to revisit equipment-slot semantics later.
