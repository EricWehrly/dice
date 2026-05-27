# TB-07 — Lock as a Core Mod

**Status**: 🔄 In Progress  
**Depends on**: TB-05 (core mod infrastructure already in `ModifiedDie`, `DieModificationPanel`)

---

## Goal

"Lock" is not a universal ability — it is a capability a die earns by having its **Lock core mod** installed. Unmodified dice cannot be locked. The mod panel UI already has a core-mod slot; this feature wires it up for Lock specifically.

---

## What is a Core Mod?

Core mods occupy the physical center of the die — its core. Unlike face weight mods (which bias individual face probabilities), core mods change the die's fundamental behavior during a roll session. A die can hold **one core mod at a time**; installing a second replaces the first.

The Lock core mod gives the die the ability to be held between rolls.

---

## Milestones

### M7.1 — Register Lock as a Core Mod

**Files**: `src/ui/DieModificationTypes.ts`

- Add `{ value: 'lock', label: 'Lock', description: 'Hold this die between rolls. Its face is preserved until the lock breaks.' }` to `AVAILABLE_CORE_MODS`.
- Add a `description` field to the core mod type shape so the UI can display it.
- Remove or demote the placeholder `brain` entry if it is not yet backed by behavior (or keep it disabled until TB-08).

---

### M7.2 — Display Core Mod Description in the Mod Panel

**Files**: `src/ui/DieModificationPanelTemplate.ts` (or equivalent render method)

- When a core mod is selected (draft or installed), show its description text below or beside the select.
- When no core mod is selected, show a short generic prompt: *"Core mods change how a die behaves during play."*
- Keep this read-only for the inspector view; description changes with the selected option via normal change-event wiring.

---

### M7.3 — Un-disable the Core Mod Select and Enable Install

**Files**: `src/ui/DieModificationPanel.ts`, `src/ui/DieModificationPanelTemplate.ts`

The core-mod select is currently disabled (TB-05 left it as a placeholder). Steps:

1. Remove the `disabled` attribute from the core-mod `<select>`.
2. Ensure the existing `draftCoreMod` state and change-handler already work (they should — they just weren't persisted).
3. The **Install** button should be enabled whenever `draftCoreMod !== 'none'` (consistent with how face mods enable it today).
4. On install, call `die.addCoreMod('lock')` via `ModifiedDie.addCoreMod()`. This already exists.
5. Raise `TrickEvents.BAG_CHANGED` after install so the roll screen re-renders.

> **Constraint**: `ModifiedDie.coreMods` is a plain array — guard against duplicate installs (same id already present) in `addCoreMod()` or in the panel's install handler.

---

### M7.4 — Gate Lock Button on the Lock Core Mod

**Files**: `src/rendering/2d/DiceCanvasRenderer.ts`

Currently the LOCK / UNLOCK button is drawn for every die. Change the condition:

```typescript
const hasLockMod = die.coreMods?.some((m) => m.id === 'lock') ?? false;
```

- If `hasLockMod` is false: draw nothing in the button zone.
- If `hasLockMod` is true: draw the LOCK / UNLOCK button as today.
- Clicking the button zone on a die without the mod should be a no-op.

Also update `Bag.toggleLocked()` to be a no-op if the die lacks the lock core mod, as a defensive second layer.

---

### M7.5 — Integration Test

**File**: `tests/integration/lock-core-mod.test.ts` (new)

Covers the cross-system chain:

| # | What | Systems touched |
|---|------|-----------------|
| 1 | A die without the Lock mod cannot be locked via `toggleLocked` | `Bag`, `ModifiedDie` |
| 2 | Installing the Lock core mod via `addCoreMod('lock')` persists to `die.coreMods` | `ModifiedDie` |
| 3 | After install, `toggleLocked` succeeds and `die.locked` toggles | `Bag`, `ModifiedDie`, `Die` |
| 4 | `rollAll()` skips re-rolling a locked die with the mod installed | `Bag` |
| 5 | `rollAll()` **does** re-roll the die once the lock is cleared | `Bag` |

---

## Definition of Done

- [ ] `AVAILABLE_CORE_MODS` includes `lock` with a `description` field.
- [ ] Core mod descriptions render in the mod panel.
- [ ] Core mod select is enabled; Install wires through to `die.addCoreMod('lock')`.
- [ ] Lock / Unlock button only appears on dice with the Lock core mod installed.
- [ ] Uninstalling the mod or changing to another means the lock button doesn't work and won't render (test).
- [ ] `toggleLocked` is a no-op for dice without the mod (defensive guard).
- [ ] Integration test covers the full install → lock → reroll chain.

---

## Deferred

- **Lock breaking** (internal re-roll, same-face breaks the lock) — see [TB-07-lock-breaking.md](./TB-07-lock-breaking.md).
- **Lock reset via session** — depends on a session/round model not yet designed.
- **Brain core mod** — separate feature, TB-08 candidate.
