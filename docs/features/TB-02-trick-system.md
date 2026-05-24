# TB-02 — Trick System (Core / Stateless)

**Phase**: 2  
**Status**: ✅ Complete  
**Depends on**: TB-01 (Die, Bag, `'bag:rolled'` event)  
**Blocks**: TB-03 (Decimal Milestone trick), TB-04 (stateful tricks build on this interface)

**Completed 2026-05-24**: All milestones implemented. Stateless tricks (Of a Kind, Ascending, Prime Distinct) are working. TrickEvaluator fires after each roll, tracking first completions and high scores. Economy resource tracking (mods/cosmetics earned) is wired and simplified to direct Resource API usage. Displayed via TrickCounterPanel.

## Goal

After every roll, evaluate which tricks were achieved and display them. All tricks listed from the start — undiscovered ones show as `???`. First achievement reveals the trick.

This feature covers **stateless tricks only** — tricks that can be evaluated from the current roll alone, with no history. Stateful tricks (streaks, decimal milestones) are TB-04.

Scope slicing for TB-02:
- Implement only known stateless rules (Of a Kind, Ascending, Prime Distinct).
- Defer uncertain combo scoring policy to TB-04.
- Defer uncertain `tracksHighScore=false` trick list to a later trick-expansion pass.

Reward + progression rules in scope:
- First completion of a trick: mark achieved and increment `modsEarned` by +1.
- Maintain a per-trick high score value when that trick tracks high score.
- Increment `cosmeticsEarned` by +1 only when an already-unlocked trick improves its tracked high score.
- Spending remains unrestricted; counters are telemetry.

Playable checkpoint: roll → see "Two of a Kind!" appear in the trick results list.

---

## Milestones

### M2.1 — Trick Interface

**File**: `src/game/Trick.ts`

```typescript
interface TrickResult {
  trick: Trick;
  fired: boolean;
  rollScore: number | null;           // per-trick score for this roll when fired
  isFirstCompletion: boolean;
  isNewHighScore: boolean;
  modTokensEarned: number;            // +1 on first completion, else 0
  cosmeticTokensEarned: number;       // +1 on post-unlock high score increase, else 0
}

interface Trick {
  id: string;                          // stable key, e.g. 'of-a-kind-2'
  name: string;                        // display name
  description: string;
  detect(faces: number[]): boolean;    // stateless tricks only; stateful extend this
  tracksHighScore: boolean;             // false means score/high score intentionally not used
  scoreRoll?(faces: number[]): number;  // required when tracksHighScore=true
}
```

**Notes**:
- `faces` is an array of face-up values from the active dice on this roll (e.g. `[3, 3, 5]`).
- Stateful tricks (TB-04) will need a context argument — plan for extensibility but don't add it now. A second optional parameter or a subtype works fine.
- Tricks are **pure functions** — no side effects in `detect()`.
- Trick registry (list of all registered tricks) lives in `src/game/TrickRegistry.ts`. The registry is what the trick list UI reads from.

---

### M2.2 — Core Stateless Tricks

**File**: `src/game/tricks/` (one file per trick or grouped logically)

#### Of a Kind

```
N or more dice show the same face value.
Variants: Two of a Kind, Three of a Kind, ... up to N = faceCount.
```

Implementation: count frequency map of face values; find max frequency ≥ 2.
Expose as a family: register each variant (2OAK, 3OAK, etc.) separately so each can be individually discovered.

**Start with**: Two of a Kind, Three of a Kind, Four of a Kind.

#### Ascending

```
Any consecutive sequence is valid (e.g. 2,3,4 or 4,5,6), but all active dice must participate.
Duplicates invalidate the trick.
```

Implementation: sort all active values and verify strict +1 steps between neighbors.
If any duplicate exists, fail.
Variants: Small Straight (3 in a row), Large Straight (4+), Full Straight (5+).

Ascending high score: longest successful ascending length reached so far is tracked as `ascendingHighScore`.

**Start with**: Small Straight (3+), Large Straight (4+).

#### Prime Distinct

```
All active faces are distinct and each face value is in the game-prime set.
Game-prime set intentionally includes 1.
```

Implementation:
- Build a set from active faces and fail if duplicates exist.
- Check every face value against a helper `isGamePrime(value)` where `1` returns true.

Scoring:
- Score by participating dice count.

**Start with**: Prime Distinct (single trick, high score tracked).

---

### M2.3 — Trick Evaluator

**File**: `src/game/TrickEvaluator.ts`

```typescript
function evaluateTricks(faces: number[], registry: Trick[]): TrickResult[]
```

- Called by the `'bag:rolled'` event handler in the game loop.
- Returns the full list of results (fired + not fired) so the UI can show `???` for undiscovered tricks and greyed-out names for known but unachieved ones.
- Updates trick progress state:
  - first completion
  - per-trick best score
  - new high score checks
- Applies reward counters:
  - `modsEarned += 1` on first completion
  - `cosmeticsEarned += 1` when `isNewHighScore=true` and `isFirstCompletion=false`
- This is where trick discovery state is checked (see TB-06 for full discovery system; for now, just pass through).

---

### M2.4 — Trick Display

**File**: `src/ui/TrickDisplay.ts`

**Goal**: After each roll, show the trick results beneath (or beside) the dice canvas.

**Layout sketch**:
```
─────────────────────────────
  Two of a Kind  ✓
  Three of a Kind
  Small Straight
  ???
  ???
─────────────────────────────
```

- Tricks that fired this roll: highlighted / checked.
- Known but not fired this roll: normal, unchecked.
- Show achievability marker when known:
  - For **unachieved tricks only**:
    - Achievable now: show `A`
    - Not achievable now: show `N`
    - Unknown/undecidable: leave blank
- For achieved tricks, show stored high score and this-roll result state.
- For achieved tricks with `tracksHighScore=false`, show an explicit marker (e.g. `HS: n/a`).
- Undiscovered: `???` (all tricks start undiscovered until TB-06 wires the full discovery system; for now, start all tricks as "known" so the display works, then TB-06 adds the `???` layer).
- Subscribe to `'bag:rolled'` (same event as renderer).

Add a simple global counters strip in the UI shell:
- `modsEarned`
- `modsSpent`
- `cosmeticsEarned`
- `cosmeticsSpent`

In this feature, both `modsEarned` and `cosmeticsEarned` may move as trick completions/high-score improvements happen.

---

## Trick Registry

**File**: `src/game/TrickRegistry.ts`

The registry is the single source of all tricks. TB-06 adds discovered/undiscovered state to each entry. For now, it's just an ordered array.

```typescript
const TRICKS: Trick[] = [
  ofAKind(2),
  ofAKind(3),
  ofAKind(4),
  smallStraight(),
  largeStraight(),
  primeDistinct(),
  // more added in TB-04 (stateful) and later
];
```

Factory functions (`ofAKind(n)`) avoid copy-pasta for the N-variant trick families.

Per-trick progress state should be tracked alongside the registry entries:

```typescript
interface TrickProgress {
  achieved: boolean;
  bestScore: number | null;
  highScoreTracked: boolean;
}
```

---

## Tests

`tests/game/tricks/`

- `ofAKind(2)` fires on `[1,1,3]`, does not fire on `[1,2,3]`.
- `ofAKind(3)` fires on `[5,5,5]`, does not fire on `[5,5,1]`.
- `smallStraight()` fires on `[1,2,3]`; does not fire on `[3,4,5,1]` because not all dice participate in one strict run.
- ascending fails on duplicates such as `[3,4,4,5]`.
- `largeStraight()` fires on `[1,2,3,4]`; does not fire on 3-length only.
- `primeDistinct()` fires on `[1]` for a lone d6 roll.
- `primeDistinct()` fires on `[2,3,5]`.
- `primeDistinct()` does not fire on `[2,2]` (not distinct).
- `primeDistinct()` does not fire on `[4]` (not game-prime).
- `evaluateTricks` returns results for all registered tricks.
- first completion grants `modTokensEarned = 1` only once.
- high score increase grants `cosmeticTokensEarned = 1` only after first completion.

---

## Definition of Done

- [ ] `Trick` interface and `TrickResult` defined.
- [ ] Of a Kind (2, 3, 4), Straight (Small, Large), and Prime Distinct implemented and tested.
- [ ] `TrickEvaluator` evaluates on every roll.
- [ ] `TrickDisplay` renders results after each roll.
- [ ] First completion grants `modTokensEarned = 1`.
- [ ] High score improvements grant `cosmeticTokensEarned = 1` only after first completion.
- [ ] Achievability marker appears (A/N/blank) for unachieved tricks where rule is known.
- [ ] Per-trick high score is retained/displayed when tracked; non-tracked tricks are explicitly marked.
- [ ] All tricks start as visible-known (no `???` yet — that's TB-06).
