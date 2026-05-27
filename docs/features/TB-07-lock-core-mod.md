# TB-07 — Lock Pip Style and Tap-to-Lock

**Status**: 🔄 In Progress (revised plan)  
**Depends on**: TB-05 UI and die modification flow

---

## Revision Summary

This feature is now pip-style-first, not core-mod-gated for the first implementation pass.

The lock should be represented as a die pip style and toggled directly by tapping/clicking the die tile on the roll canvas.

The previous core-mod approach is preserved in this file as a parked direction (see Appendix A).

---

## Goal

1. Unlock pip style selection in the die modification UI.
2. Add a lock style to the available styles (and make it the only active style option for now).
3. When lock style is chosen on a die, that die renders a lock icon where pips normally draw.
4. Tapping the die tile toggles lock state on/off.
5. Locked and unlocked states should both use lock-shaped icons, with the shackle position indicating state.

---

## Visual Direction

The lock icon is a pip glyph, not a separate button or corner badge.

- Locked icon: closed shackle.
- Unlocked icon: raised/open shackle.
- Increase lock glyph readability versus the first attempt:
	- make overall lock glyph larger
	- increase shackle stroke thickness by a few pixels
	- keep keyhole/body proportions clear at small tile sizes

---

## Milestones

### M7.1 — Enable Face Style Control in UI

Files:
- src/ui/DieModificationPanelTemplate.ts
- src/ui/DieModificationPanel.ts
- src/ui/DieModificationTypes.ts

Tasks:
1. Un-disable the face style select in the panel.
2. Keep options intentionally narrow for now: lock style only.
3. Ensure draft state updates and install flow persists the selected style onto the die model.

Acceptance:
- User can choose lock style in the panel.
- Install persists style and re-render reflects it.

---

### M7.2 — Add Lock Style to Renderer Contract

Files:
- src/rendering/2d/DieFaceTileRenderer.ts
- related style/model mapping points in UI render pipeline

Tasks:
1. Add lock style as a supported pip style.
2. Draw lock icon at pip center positions (same pipeline as other pip glyphs).
3. Provide two lock variants:
	 - lock-closed (for locked state)
	 - lock-open (for unlocked state when style is lock)
4. Increase shackle thickness and glyph size to improve readability.

Acceptance:
- Lock-style dice visibly render lock pip glyphs.
- Locked vs unlocked state is legible from icon shape alone.

---

### M7.3 — Tap-to-Lock Interaction on Die Tile

Files:
- src/rendering/2d/DiceCanvasRenderer.ts
- src/game/Bag.ts

Tasks:
1. Use die tile hit-testing for lock toggle interaction.
2. Remove dependency on lock buttons/signals for interaction.
3. Keep `toggleLocked` behavior as the state authority.

Acceptance:
- Clicking/tapping a die toggles lock on/off.
- Locked dice still skip reroll in current roll logic.

---

### M7.4 — Integration Test Across Systems

File:
- tests/integration/lock-pip-style-flow.test.ts (new)

End-to-end flow to cover:
1. Select and install lock style in modification UI model path.
2. Roll renderer displays lock glyph for that die.
3. Tap die toggles locked state.
4. Locked die does not reroll.
5. Tap again unlocks; die rerolls on next roll.

Systems included:
- Die modification UI state and install path
- Die model style persistence
- Canvas renderer glyph selection/state mapping
- Bag lock state and roll behavior

---

## Definition of Done

- [ ] Face style select is enabled in UI.
- [ ] Lock is available as the active style option (only option for now).
- [ ] Lock glyph draws as a pip and is readable at tile size.
- [ ] Locked and unlocked icons are distinct via shackle position.
- [ ] Die tile tap toggles lock state.
- [ ] Locked dice skip reroll; unlocked dice reroll.
- [ ] Integration test validates the full style-install plus lock-toggle plus reroll flow.

---

## Incremental Commit Slices

Suggested commit order once implementation starts:

1. Renderer-only lock glyph improvements (closed/open variants, thicker shackle, larger glyph).
2. UI style select enablement and lock style wiring.
3. Die-tap interaction wiring and cleanup of obsolete lock button behavior.
4. Integration test.

---

## Deferred

- Lock breaking behavior (same-face internal roll breaks lock): see TB-07-lock-breaking.md.
- Session-based lock reset: depends on future session/round model.

---

## Appendix A — Parked Core-Mod Direction (kept for later)

Original idea retained:

- Lock is a core mod installed per die.
- Dice without Lock core mod cannot be locked.
- Core-mod descriptions shown in UI.
- Lock UI availability gated by presence of installed core mod.

This approach is intentionally parked, not deleted, and can be restored if pip-style-first proves weaker in playtests.
