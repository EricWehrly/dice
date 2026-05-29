# TB-03 — Bag Management

**Phase**: 3  
**Status**: � In Progress  
**Depends on**: TB-01 (Die, Bag), TB-02 (Trick interface, for wiring Decimal Milestone reward)  

**Progress (2026-05-29)**:
- ✅ **M3.1 Die Identity**: `id`, `label`, `active` all implemented on `Die`. `DieSnapshot` serialization type still absent — model fields exist but `toJSON()`/`fromJSON()` stubs not yet added.
- ✅ **M3.3 Earning Dice**: Decimal Milestone die awards wired through `ScoreProgressionTracker`.
- 🔄 **M3.4 Die Selection**: Toggle affordance exists inside `DieModificationPanel` but not as a first-class UI on the roll screen.
- 🔮 **M3.2 Bag UI**: Dedicated bag panel not yet built. Direction has shifted toward a "horde screen" (collection grid + filters) rather than an inline bag panel — deferred until the roll screen becomes crowded.

## Goal

Players can see their bag of dice, earn new dice from tricks, and toggle individual dice in/out of the roll. Die identity is formalized with stable IDs and a serialization format (not yet wired to storage).

Playable checkpoint: roll → earn a die → bag grows → new die appears on canvas → player can exclude a die from next roll.

## Current Assessment

Most of the bag-management behavior is already present, but some of it has been implemented through adjacent systems rather than the original milestone shape. The core bag state, roll filtering, add/remove events, and die selection plumbing are already in place; the main gaps are persistence hooks, a scalable collection UI, and a better way to manage large numbers of dice without forcing the roll screen to do too much.

At the product level, the immediate UI does not need a bag panel yet. The bag becomes visible when the roll screen can no longer comfortably represent the full active set. At that point, the better fit is a horde screen: a spread/grid view of the collection with filters and click-to-add/click-to-remove interactions for moving dice in and out of the bag.

---

## Milestones

### M3.1 — Die Identity & Serialization Format

**Update**: `src/game/Die.ts`

Add to `Die`:
- `id: string` — UUID, assigned at construction, never changes. Already implemented.
- `label: string` — human-readable name (default: `"d6"`, `"d8"`, etc.). Already implemented.
- `active: boolean` — whether this die is included in the current roll (default `true`). Already implemented.

Add serialization stubs:

```typescript
toJSON(): DieSnapshot { ... }     // { id, faceCount, label, active, faceUp }
static fromJSON(s: DieSnapshot): Die { ... }
// TODO: persistence — connect to LocalStorage in FP-1
```

**DieSnapshot type** is still not present in the codebase.

**Reality check**: the model fields are already there, but the snapshot/persistence API has not been added yet.

---

### M3.2 — Bag UI

**Original target**: `src/ui/BagPanel.ts`

This is now a deferred UI milestone rather than an immediate requirement.

Show all dice in the bag as a panel (can be below the trick display). Each die shows:
- Its label (e.g. `"d6"`)
- An active/inactive toggle (checkbox or toggle button)
- Visually distinguish active vs inactive dice

This does **not** replace the Canvas renderer — the Canvas shows the roll result; the Bag Panel shows ownership and selection.

Subscribe to an `'bag:changed'` event (already emitted by `Bag.addDie`, `removeDie`, and `toggleActive`).

**Current direction**: do not surface this panel until the roll screen starts to hit an effective display limit. When that happens, prefer a horde screen over a narrow bag strip. The horde screen should be the first-class collection browser: a spread/grid of dice, filters to narrow what is shown, and click interactions to move dice into or out of the active bag.

**Desired horde screen behavior**:
- Show the full collection as a spread, likely rows and columns rather than a single strip.
- Provide filters so the player can narrow the visible dice set.
- Allow clicking a die to add it to the bag or remove it from the bag.
- Make the bag/horde relationship obvious without making the roll screen carry collection-management UI.

**Implementation note**: the bag panel can still exist eventually, but it should be treated as a fallback or transitional UI, not the main collection surface.

---

### M3.3 — Earning Dice (Decimal Milestone integration)

**Depends on**: TB-02 trick interface and TB-04 Decimal Milestone (M4.3). This milestone is the wiring step.

When the Decimal Milestone trick fires, the game loop should:
1. Create a new `Die` (1d6, default label).
2. Call `bag.addDie(newDie)`.
3. The `'bag:changed'` event re-renders the Bag Panel.

**Where this wiring lives**: `src/game/score/ScoreProgressionTracker.ts` (the current reward owner), not `GameLoop.ts`.

**Note**: Decimal Milestone itself is still described in TB-04, but the bag-side effect is already implemented here: score thresholds add a new `ModifiedDie` through `bag.addDie()`. When persistence lands, this reward path should continue to survive reloads cleanly.

---

### M3.4 — Die Selection

**Update**: `Bag.rollAll()` should only roll dice where `die.active === true`.

Update `DiceCanvasRenderer` to visually dim inactive dice (e.g., reduced opacity or greyed tile) so the player can see which dice are excluded.

Add `Bag.toggleActive(id: string)` and fire `'bag:changed'`.

Compatibility note for deferred partial reroll:
- Keep `Bag.rollAll()` as the default flow.
- Add API shape now so future partial reroll does not require a breaking refactor:

```typescript
rollSelected(selectedIds?: string[]): void
```

If `selectedIds` is omitted, roll all active dice (current behavior). Partial reroll logic is deferred, but this signature keeps the path open.

**Reality check**: the active filter and `toggleActive(id)` already exist, so this milestone is mostly implemented at the model level. The remaining gaps are the inactive-die visual treatment and the optional `rollSelected` API.

**Adjacent direction**: the canvas currently supports toggling lock state by clicking a die tile, which is related but not the same as the active/inactive bag selection described here.

**Scaling note**: this milestone is also where we should be honest about large dice counts. The current roll canvas works for a small collection, but the roadmap should assume that a separate collection surface will eventually be needed once the active roll gets too crowded.

---

## Events Used

| Event | Fired by | Subscribed by |
|-------|----------|--------------|
| `'bag:rolled'` | `Bag.rollAll()` | Canvas renderer, Trick evaluator |
| `'bag:changed'` | `Bag.addDie`, `removeDie`, `toggleActive`, `toggleLocked` | Canvas renderer, score/progress tracking, die-selection UI |

---

## Tests

`tests/game/Bag.test.ts` (update)

- Only active dice are rolled.
- `toggleActive` flips the flag and fires `'bag:changed'`.
- `addDie` sets `active: true` by default.
- `toJSON`/`fromJSON` round-trip preserves all fields.

Most of the behavioral coverage already exists for active filtering, roll events, and toggle behavior; the serialization round-trip test still needs the new snapshot API. Add coverage later for collection filtering and bag/horde transfer behavior once the horde screen exists.

---

## Definition of Done

- [x] Each die has stable `id`, `label`, `active`.
- [ ] `toJSON`/`fromJSON` stubs present with `// TODO: persistence` comment.
- [ ] Bag Panel renders all dice with active/inactive toggle, or an intentional replacement UI is documented.
- [ ] Horde screen renders the full collection as a spread/grid with filters and click-to-add/remove behavior.
- [x] Inactive dice are excluded from `rollAll()`.
- [ ] Inactive dice visually dimmed in Canvas renderer.
- [x] New dice can be added programmatically (for Decimal Milestone wiring in TB-04).
- [ ] Persistence is wired so bag and collection state survive reloads.
