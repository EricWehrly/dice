# TB-05 — Modification System

**Phase**: 5  
**Status**: 🔮 Not started  
**Depends on**: TB-03 (Die identity, face count), TB-04 (tricks fire before mods are earned)  
**Blocks**: TB-06 only loosely (discovery is independent)

## Goal

Players can freely apply modifications to individual dice, changing their roll probabilities and statistics. No token enforcement yet — spending is free. Track earned/spent counters for both mods and cosmetics for future economy design.

---

## Core Architecture Decision: Probability Resolver

All modifications that affect face-up probability feed into a **resolver** on each die. The resolver is called during `roll()` to produce a weighted face selection, rather than every mod directly mutating state.

```typescript
interface FaceWeights {
  [faceIndex: number]: number;  // weight for each face (higher = more likely up)
}

interface ProbabilityResolver {
  resolve(die: Die, mods: Modification[]): FaceWeights;
}
```

This keeps mods composable and makes future additions (Magnet, Brain) natural extensions.

**Injectable RNG**: `Die.roll()` should accept an optional RNG function for testability:
```typescript
roll(rng: () => number = Math.random): void
```
This keeps future randomizer options possible without locking in a specific randomizer-mod design now.

---

## Milestones

### M5.1 — Modification Interface

**File**: `src/game/Modification.ts`

```typescript
interface Modification {
  id: string;
  type: string;       // e.g. 'weight', 'stat-crit', 'face-expand'
  target: 'face' | 'die';
  faceIndex?: number; // only for face-targeted mods
  // each mod type extends this with its own fields
}
```

**Mod Storage**: Modifications live on the `Die` object as `die.modifications: Modification[]`.

**Resolver wiring**: `Die.roll()` passes itself and its mods to the `ProbabilityResolver` to get face weights, then samples from that distribution.

---

### M5.2 — Weight Modification

**Type**: `'weight'`, target: `'face'`

Adds mass to a specific face, increasing the chance that face lands **down** (reducing face-up probability for that face).

```typescript
interface WeightMod extends Modification {
  type: 'weight';
  target: 'face';
  faceIndex: number;  // 0-indexed
  grams: number;      // affects magnitude of probability reduction
}
```

**Probability formula**: Each face starts with weight 1. A WeightMod on face F reduces F's weight by `grams * WEIGHT_FACTOR` (tune the constant). Weights are normalized to sum to 1 for sampling.

**UI**: Die detail view shows `% up` per face (derived from normalized weights). Optionally show delta when a mod is being applied.

---

### M5.3 — Die Stats

**Update**: `src/game/Die.ts`

Add stat fields:

```typescript
interface DieStats {
  crit: number;         // 0.0–1.0 chance to double the face-up value on a roll
  multiplier: number;   // multiplies effective face count (default 1.0)
  strength: number;     // reserved for Brain mod (FP-4), no effect yet
}
```

**Crit**: After `roll()` resolves a face, apply a crit check: if `Math.random() < die.stats.crit`, the effective value for this roll is `faceUp * 2`. **The `faceUp` field does not change** — crit is an *effective value* for trick evaluation, not stored state.

Introduce a `RollResult` wrapper:
```typescript
interface RollResult {
  die: Die;
  faceUp: number;       // raw face
  effectiveValue: number;  // after crit / multiplier
}
```

Pass `RollResult[]` to trick evaluators instead of bare `number[]`. Trick checks run against `effectiveValue`.

**Multiplier**: Expands effective face count. A `multiplier: 2` on a d6 means effective values are sampled from a d12-equivalent distribution. Implementation: after resolving face (1–faceCount), if a probabilistic check for multiplier rolls additional hits, the effective value is `faceUp + faceCount` (stacking). Cap at reasonable level.

---

### M5.4 — Face Count Expansion

Players can increase `faceCount` on a die from 6 → 8 → 10 → 12 → 20.

**Mechanics**:
- When face count increases, new faces are added after the existing ones.
- Existing `WeightMod` face indices remain valid (they refer to original faces by index).
- New faces start with default weight 1.

**Implementation**:
- `Die.expandFaces(newCount: number)`: validates `newCount > faceCount`, updates `faceCount`.
- `faceUp` is re-clamped to `[1, newCount]` if needed.
- No cosmetic reapplication in this feature (deferred to FP-7).

---

### M5.5 — Randomizer Modifications (stretch)

**Only if** M5.1–M5.4 are complete and time allows.

Keep this scoped to infrastructure only in current roadmap:
- RNG swapping support remains injectable for testing and future experimentation.
- Do not lock in odd/even or high/low behavior design yet.

---

### M5.6 — Mod Tracking

**File**: `src/game/ProgressTracker.ts` (or add to GameLoop state)

```typescript
interface ModCounters {
  modsEarned: number;       // +1 on first completion of each trick
  modsSpent: number;        // +1 per mod application, no balance checks
  cosmeticsEarned: number;  // +1 on post-unlock high-score improvements for tracked tricks
  cosmeticsSpent: number;   // +1 per cosmetic spend, no balance checks
}
```

- `modsEarned` increments once on first completion of each trick.
- `cosmeticsEarned` increments only when an already-achieved trick improves a tracked high score.
- Tricks with `tracksHighScore=false` never contribute to `cosmeticsEarned`.
- These counters are display-only for now. No enforcement, no affordability checks.
- Show these counters in a global UI strip visible during normal play.

---

## Mod Application UI

**File**: `src/ui/DieModPanel.ts`

A simple panel that appears when a die is selected (click on a tile in the Bag Panel or Canvas). Shows:
- Current face weights (% up per face)
- Current stats
- Controls to add a WeightMod (select face, enter grams) or bump a stat

This doesn't need to be fancy — a small inline form is fine.

Die selection: clicking a die tile fires a `'die:selected'` event with the die's ID. `DieModPanel` subscribes and updates.

---

## Tests

`tests/game/`

- `ProbabilityResolver`: WeightMod on face 0 reduces face 0's normalized weight.
- Crit: effective value doubles when crit triggers; `faceUp` field unchanged.
- Face expansion: new faces added; existing mods unaffected.
- `modsEarned` increments when tricks fire.
- `modsSpent` and `cosmeticsSpent` increment on respective spend actions even if they exceed earned totals.
- `cosmeticsEarned` does not increment on first unlock, even if that roll establishes initial high score.

---

## Definition of Done

- [ ] `Modification` interface and `ProbabilityResolver` in place.
- [ ] `WeightMod` applies weighted random face selection.
- [ ] `DieStats` with `crit` and `multiplier` implemented; `RollResult` used by trick evaluators.
- [ ] Face count expansion works for standard die progressions.
- [ ] `ModCounters` (`modsEarned`, `modsSpent`, `cosmeticsEarned`, `cosmeticsSpent`) tracked and displayed globally.
- [ ] `DieModPanel` allows applying mods to a selected die.
- [ ] Injectable RNG on `Die.roll()` for testability.
