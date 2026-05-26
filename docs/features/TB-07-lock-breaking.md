# F12 — Lock Breaking

**Status**: 🔮 Future

---

## Goal

Locks on dice are not permanent. When a locked die is internally re-rolled and the result happens to match the value it was locked to, the realization that the luck "ran out" breaks the lock. This introduces tension and decision-making: holding a locked value has a risk, and that risk grows with each roll.

---

## Core Mechanic

When the player rolls:

1. Every active die is rolled internally — including locked ones.
2. A **locked die is still re-rolled** in the background, but its face-up value is only changed if the roll produces a different result.
3. If the internal roll lands on the **same face** the die was locked to, the die's **lock breaks** and the new face-up value is shown.

This means:
- Locking a 6 on a d6 has a 1-in-6 chance of breaking each roll.
- Locking a 1 on a d6 has the same risk — luck doesn't discriminate.
- The chance of surviving a lock diminishes over time at `(1 - 1/faceCount)^n` per n rolls.

---

## Implementation Plan

### Step 1 — Internal Roll on Lock Attempt

Modify `Bag.rollAll()` (or a dedicated helper) so that locked dice are passed to `die.roll()` as usual, but the result is evaluated:

```typescript
if (die.locked) {
    const internalRoll = die.roll();
    if (internalRoll === die.faceUp) {
        // Lock breaks — faceUp already updated by roll()
        die.locked = false;
    } else {
        // Lock holds — restore the locked value
        die.faceUp = lockedValue;
    }
}
```

> Note: `die.roll()` currently mutates `faceUp`. The implementation may need to capture `faceUp` before calling `roll()` rather than calling `roll()` for side-effects.

### Step 2 — Surface Lock Break to Player

A lock breaking should be visually distinct from a normal re-roll:

- Brief flash / highlight on the tile that broke.
- Consider a `DIE_LOCK_BROKEN` event so other systems (score, tricks) can react if needed.

### Step 3 — Lock Reset (separate feature / prerequisite: session model)

Locks can also be cleared explicitly when the player starts a new round or resets roll history. This requires a session/round concept that does not yet exist. Track as a separate dependency.

See `F13 — Session / Roll Reset` (to be written when prerequisites are clearer).

---

## Design Notes

- The rule is clean and communicable: *"Roll the same face and your lock pops."*
- It rewards skilled play (pick locked values that are less likely to appear on that specific die).
- With the probability model (F05), players can see exactly how risky their lock is before committing.
- Fragile locks create interesting decisions around the upgrade screen: a high-face-count die is harder to break a lock on.

---

## Acceptance Criteria

- [ ] Locked dice are internally rolled on each `rollAll()`.
- [ ] If the internal roll matches the locked value, the lock breaks and the new face is shown.
- [ ] If the internal roll differs, `faceUp` stays at the locked value.
- [ ] A `DIE_LOCK_BROKEN` event is raised when a lock breaks, carrying the die id.
- [ ] The roll-screen visually distinguishes a lock break from a normal roll outcome.
- [ ] Locked value is preserved in `die.lockedValue` (or equivalent) separate from `faceUp` so the comparison survives the `roll()` mutation.
