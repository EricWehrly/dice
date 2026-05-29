# TB-04 — Stateful Tricks & Combos

**Phase**: 4  
**Status**: � In Progress  
**Depends on**: TB-02 (Trick interface), TB-03 (Die serialization stubs)

**Progress (2026-05-29)**:
- ✅ **M4.1 Roll History**: Implemented as `RecordHistory<readonly DieFaceResult[]>` in `src/game/RecordHistory.ts`. Owned by `Bag`, passed to `TrickEvaluator` via `BAG_ROLLED` event. Capped at 20 records; immutable record storage.
- ✅ **M4.2 Streak Tricks**: `InARow` trick in `src/game/tricks/InARow.ts` — evaluates streak length from roll history. Fires from `TrickEvaluator` on each roll.
- ✅ **M4.3 Decimal Milestone**: `ScoreProgressionTracker` in `src/game/score/ScoreProgressionTracker.ts` handles cumulative roll scoring and magnitude unlock, integrated with `ScoreUpdatedEvent`. (Note: implementation is through score tracking rather than a pure trick-count counter — design evolved during implementation.)
- 🔮 **Combo tricks**: Not yet started.

---

## Milestones

### M4.1 — Roll History

**File**: `src/game/RollHistory.ts`

```typescript
interface RollRecord {
  timestamp: number;
  faces: number[];              // only active dice, in bag order
  tricksAchieved: string[];     // trick IDs that fired this roll
}

class RollHistory {
  readonly records: RollRecord[];  // most recent last
  push(record: RollRecord): void;
  last(n: number): RollRecord[];   // returns the N most recent records
  // cap at a reasonable window (e.g. 20) — old records dropped
}
```

**Notes**:
- `RollHistory` is owned by the game loop, not by `Bag`.
- After `evaluateTricks()` runs, a `RollRecord` is assembled and pushed to history.
- Stateful tricks receive a `RollHistory` reference via the evaluator context.

**Update `TrickEvaluator`** to accept an optional `RollHistory` and pass it to tricks that need it. Stateless tricks ignore it.

---

### M4.2 — Streak Tricks ("In a Row")

**Concept**: The same full face result appears N times consecutively.

**Initial variants**: 3 in a row, 4 in a row, 5 in a row.

**Detection**: Look at the last N full-roll records in `RollHistory`. A streak continues only if each record has the same face list as the prior record under current trick evaluation values.

Default comparison:
- Same dice count
- Same ordered values list

`sameRoll(a, b)` should be a dedicated helper so partial reroll can later swap strategy without rewriting streak logic.

**Full-roll requirement**: a streak attempt is valid only on turns where all active dice were rolled. Partial reroll (future feature) does not count toward streak continuation.

**Reset policy**:
- Any modification applied to any die resets streak history.
- Any roll event that does not satisfy streak continuation resets the current streak chain.

**Combos with Of a Kind**: "Three of a Kind, twice in a row" is a combo trick (see M4.4).

---

### M4.3 — Decimal Milestone

**Concept**: Player achieves tricks (any trick). When cumulative trick count crosses 10, 100, 1000, etc., they earn a new 1d6.

**State needed**: `GameLoop` (or a `ProgressTracker`) tracks `totalTricksAchieved: number`.

**Detection**: After evaluating tricks, increment counter by number of tricks that fired. Check if the counter has crossed a new decade boundary (`Math.floor(Math.log10(count))` changed). If so, fire `'milestone:decimal'` event.

**Reward**: `'milestone:decimal'` listener in the game loop calls `bag.addDie(new Die())` (wired in TB-03/M3.3).

---

### M4.4 — Combo Tricks

**Concept**: A combo trick is a composed trick that requires two simpler tricks across consecutive rolls.

**Examples from design doc**:
- Two of a Kind, twice in a row
- Three of a Kind, three times in a row
- Generalized: "X of a Kind, X times in a row" up to six of a kind six times

**Implementation approach**:
- Define a `ComboTrick` builder: `comboTrick(base: Trick, count: number)` which checks `RollHistory` for the base trick firing in each of the last `count` rolls.
- Register each combo in the trick registry separately so they can be individually discovered.
- Combos **stack** on top of component tricks (both fire), rather than suppressing them.

**Generative registration** (to avoid hand-writing each):
```typescript
for (let n = 2; n <= 6; n++) {
  registry.add(comboTrick(ofAKind(n), n));   // "N of a kind, N times in a row"
}
```

**What's hard**: Evaluation order — ensure combo tricks are evaluated after their component tricks have fired in the current pass. Run stateless tricks first, then stateful, then combos.

---

## Tests

`tests/game/tricks/`

- Streak(3): fires when last 3 full-roll face lists are identical; doesn't fire when only 2 match.
- Streak(3): does not fire on first 2 rolls (insufficient history).
- Streak resets when a die modification is applied between rolls.
- Streak ignores partial reroll attempts (when future API is used) and requires full-roll records.
- Decimal Milestone: `totalTricksAchieved` increments correctly; event fires at 10, 100, not at 5, 11.
- ComboTrick: fires when base trick fired in each of last N rolls; doesn't fire if any gap.

---

## Definition of Done

- [ ] `RollHistory` stores roll records and feeds stateful trick evaluations.
- [ ] "In a Row" (3×, 4×, 5×) implemented and tested.
- [ ] Decimal Milestone fires at 10, 100, 1000 etc. and grants a new 1d6.
- [ ] Combo tricks (N of a Kind × N) generatively registered.
- [ ] Evaluation order: stateless → stateful → combos.
