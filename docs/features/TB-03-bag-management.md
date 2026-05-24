# TB-03 — Bag Management

**Phase**: 3  
**Status**: 🔮 Not started  
**Depends on**: TB-01 (Die, Bag), TB-02 (Trick interface, for wiring Decimal Milestone reward)  
**Blocks**: TB-04 (roll history needs stable die identity)

## Goal

Players can see their bag of dice, earn new dice from tricks, and toggle individual dice in/out of the roll. Die identity is formalized with stable IDs and a serialization format (not yet wired to storage).

Playable checkpoint: roll → earn a die → bag grows → new die appears on canvas → player can exclude a die from next roll.

---

## Milestones

### M3.1 — Die Identity & Serialization Format

**Update**: `src/game/Die.ts`

Add to `Die`:
- `id: string` — UUID, assigned at construction, never changes.
- `label: string` — human-readable name (default: `"d6"`, `"d8"`, etc.). Player-editable in a future feature.
- `active: boolean` — whether this die is included in the current roll (default `true`).

Add serialization stubs:

```typescript
toJSON(): DieSnapshot { ... }     // { id, faceCount, label, active, faceUp }
static fromJSON(s: DieSnapshot): Die { ... }
// TODO: persistence — connect to LocalStorage in FP-1
```

**DieSnapshot type** defined in `src/game/types.ts`.

---

### M3.2 — Bag UI

**File**: `src/ui/BagPanel.ts`

Show all dice in the bag as a panel (can be below the trick display). Each die shows:
- Its label (e.g. "d6")
- An active/inactive toggle (checkbox or toggle button)
- Visually distinguish active vs inactive dice

This does **not** replace the Canvas renderer — the Canvas shows the roll result; the Bag Panel shows ownership and selection.

Subscribe to an `'bag:changed'` event (add this event to `Bag` when `addDie`/`removeDie`/`toggleActive` are called).

---

### M3.3 — Earning Dice (Decimal Milestone integration)

**Depends on**: TB-02 trick interface and TB-04 Decimal Milestone (M4.3). This milestone is the wiring step.

When the Decimal Milestone trick fires, the game loop should:
1. Create a new `Die` (1d6, default label).
2. Call `bag.addDie(newDie)`.
3. The `'bag:changed'` event re-renders the Bag Panel.

**Where this wiring lives**: `src/game/GameLoop.ts` (or whatever tick/event handler owns trick rewards).

**Note**: Decimal Milestone itself is implemented in TB-04. This milestone is the bag side of that wiring.

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

---

## Events Used

| Event | Fired by | Subscribed by |
|-------|----------|--------------|
| `'bag:rolled'` | `Bag.rollAll()` | Canvas renderer, Trick evaluator |
| `'bag:changed'` | `Bag.addDie`, `removeDie`, `toggleActive` | Bag Panel UI, Canvas renderer |

---

## Tests

`tests/game/Bag.test.ts` (update)

- Only active dice are rolled.
- `toggleActive` flips the flag and fires `'bag:changed'`.
- `addDie` sets `active: true` by default.
- `toJSON`/`fromJSON` round-trip preserves all fields.

---

## Definition of Done

- [ ] Each die has stable `id`, `label`, `active`.
- [ ] `toJSON`/`fromJSON` stubs present with `// TODO: persistence` comment.
- [ ] Bag Panel renders all dice with active/inactive toggle.
- [ ] Inactive dice are excluded from `rollAll()`.
- [ ] Inactive dice visually dimmed in Canvas renderer.
- [ ] New dice can be added programmatically (for Decimal Milestone wiring in TB-04).
