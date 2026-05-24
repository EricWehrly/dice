# Trick Bag - Game Implementation Roadmap

Branch: trick-bag
Goal: Implement the "Trick Bag" dice game from scratch using 2D visuals, replacing the current 3D pivot approach.

Feature docs: [TB-01](../features/TB-01-foundation.md), [TB-02](../features/TB-02-trick-system.md), [TB-03](../features/TB-03-bag-management.md), [TB-04](../features/TB-04-stateful-tricks.md), [TB-05](../features/TB-05-modification-system.md), [TB-06](../features/TB-06-trick-discovery.md)

Future scope: [roadmap-trick-bag-future.md](roadmap-trick-bag-future.md)

---

## Product Vision (One Paragraph)

The player holds a **bag of dice**. Each roll of the bag produces a set of results. The player is trying to hit **tricks** — specific outcome patterns like "three of a kind" or "ascending sequence". On first completion of a trick, the player earns a mod token (`modsEarned +1`) and unlocks the trick. Each trick also tracks its own high score, shown in the Trick List. When a trick's high score improves, the player earns a cosmetic token (`cosmeticsEarned +1`). In the current roadmap phase, spending is unrestricted, but the game tracks what was earned and spent for both mods and cosmetics. The core loop is: Roll → Recognize trick → Update per-trick highs → Track earnings → Modify die → Roll better.

---

## Phase Overview

| Phase | Name | Goal | Difficulty |
|-------|------|------|------------|
| 1 | Foundation | Roll dice, see faces, detect tricks | Easy |
| 2 | Trick System | Recognize patterns, display results | Medium |
| 3 | Bag Management | Add/remove dice, earn via tricks | Easy–Medium |
| 4 | Stateful Tricks | Streaks, combos, roll history | Medium |
| 5 | Modification System | Apply mods, affect roll outcomes | Hard |
| 6 | Trick Discovery | `???` progression, unlock on achieve | Medium |

---

## Phase 1 — Foundation (Roll & Display)
**Feature**: [TB-01](../features/TB-01-foundation.md)

**Goal**: The player can click a button, roll all dice in their bag, and see face-up results on a Canvas. Player starts with one 1d6.

### Milestones
- **M1.1 — Die Model**: A die has N faces (default 6), a current face-up value, and can be rolled (random face selected).
- **M1.2 — Bag Model**: A bag holds an ordered collection of dice. Rolling the bag rolls all dice simultaneously.
- **M1.3 — 2D Canvas Render**: Each die renders as a flat tile on Canvas showing face-up value. Simple placeholder; no 3D dependency.
- **M1.4 — Roll Button**: A single interactive element triggers a bag roll and re-renders results.
- **M1.5 — Bootstrap Cleanup**: Bypass current 3D engine bootstrap. Keep engine `Events` system; cut 3D contexts entirely for now.

### What's easy
- Pure data models (Die, Bag) are straightforward TypeScript classes.
- Canvas 2D rendering is minimal — a rectangle and a number per die.

### What's hard
- Identifying the minimal engine surface to keep without pulling in 3D initialization chain.

---

## Phase 2 — Trick System
**Feature**: [TB-02](../features/TB-02-trick-system.md)

**Goal**: After every roll, the game evaluates which tricks were achieved and shows them. All tricks visible from the start as `???` until first achieved.

### Milestones
- **M2.1 — Trick Interface**: A `Trick` is defined by a name, a detector function `(faces: number[]) => boolean`, and a reward spec.
- **M2.2 — Core Stateless Tricks**: Of a Kind, Ascending, Prime Distinct — pure functions, no history required.
- **M2.3 — Trick Display**: Show which tricks fired after a roll. Simple list; `???` for undiscovered.

### Initial stateless trick set

| Trick | Rule |
|-------|------|
| Of a Kind | N dice show same value (2+) |
| Ascending | Sorted faces form consecutive sequence |
| Prime Distinct | All active faces are distinct and in the game-prime set (includes `1`) |

### What's easy
- Stateless tricks are pure functions — trivial to test.
- Trick detector pattern is highly extensible.

### What's deferred to TB-04
- "In a Row" and "Decimal Milestone" (need roll history — Phase 4).
- Combo tricks.
- Matching/Flashing (cosmetic system — future roadmap).

---

## Phase 3 — Bag Management
**Feature**: [TB-03](../features/TB-03-bag-management.md)

**Goal**: The player can view their dice, earn new dice from tricks, and select which dice roll.

### Milestones
- **M3.1 — Die Identity**: Each die has a stable ID, face count, and label. Serialization format defined here (even if persistence is not wired yet).
- **M3.2 — Bag UI**: Show all dice in bag; indicate which are in the active roll set.
- **M3.3 — Earning Dice**: "Decimal Milestone" trick grants a new 1d6. Wire this up.
- **M3.4 — Die Selection**: Player can toggle individual dice in/out of the roll.

### What's easy
- Die identity and serialization are pure data work.

### Persistence note
Persistence (LocalStorage) is **not** in this phase. When M3.1 defines the serialization format, add a `// TODO: persistence` marker so it's easy to wire later.

---

## Phase 4 — Stateful Tricks & Combos
**Feature**: [TB-04](../features/TB-04-stateful-tricks.md)

**Goal**: Support tricks that require roll history (streaks, decimal milestones) and trick combinations.

### Milestones
- **M4.1 — Roll History**: Store a rolling window of previous results alongside the bag state.
- **M4.2 — Streak Tricks**: "In a Row" — same result N times consecutively (starting at 3×).
- **M4.3 — Decimal Milestone**: Total trick-count crossed a decimal threshold → earn a new 1d6.
- **M4.4 — Combo Tricks**: Two-of-a-kind twice in a row through six-of-a-kind six times in a row, etc.

### What's hard
- Combo evaluation order: need to define whether combos suppress component tricks or stack on top.
- Combinatorial explosion of combo variants needs a generative approach rather than hand-writing each.

---

## Phase 5 — Modification System
**Feature**: [TB-05](../features/TB-05-modification-system.md)

**Goal**: Players can freely apply modifications to dice. Track both earned and spent counters for mods and cosmetics (`modsEarned`, `modsSpent`, `cosmeticsEarned`, `cosmeticsSpent`) without enforcing balances.

**Token economy is deferred** — spending is intentionally unrestricted for now. Counters are telemetry for future economy tuning.

### Milestones
- **M5.1 — Modification Interface**: A `Modification` has a type, a target (face or die-level), and an effect on the roll probability resolver.
- **M5.2 — Weight**: Attaches to a face. Uses weighted random to reduce that face's up-probability. UI can show `% up` per face.
- **M5.3 — Die Stats**: `crit` (double-value chance), `multiplier` (expands effective face count). Stats are per-die data.
- **M5.4 — Face Count Expansion**: Adding faces extends current face configurations proportionally.
- **M5.5 — RNG Hook (No Randomizer Design Yet)**: Keep injectable RNG architecture only. Detailed randomizer-mod behavior is deferred.
- **M5.6 — Economy Tracking UI**: Record and display `modsEarned`, `modsSpent`, `cosmeticsEarned`, `cosmeticsSpent` in general UI. No enforcement.

### What's easy
- Weight and stats are straightforward probability math.
- Mod tracking counters are additive bookkeeping.

### What's hard
- Face expansion with proportional config reapplication needs careful index mapping.
- Ensuring per-trick score mappings stay consistent when new tricks are added.

### Deferred to future roadmap
- Magnet (inter-die statistical interaction).
- Brain (player intent / playbook UI).
- Cosmetic reapplication on face expansion.

---

## Phase 6 — Trick Discovery
**Feature**: [TB-06](../features/TB-06-trick-discovery.md)

**Goal**: All tricks are listed in a Trick List UI from the start. Undiscovered tricks show as `???`. First-time achievement reveals the trick name and description.

### Milestones
- **M6.1 — Trick Registry**: Central trick registry with discovered/undiscovered state per trick.
- **M6.2 — Trick List UI**: Screen or panel showing all tricks. `???` for undiscovered; name + last-achieved info for discovered.
- **M6.3 — Discovery Event**: On first achievement of a trick, fire a discovery event → update registry → reveal in UI.

### What's hard
- Trick list display needs enough space to grow as more tricks are added. Layout should not assume a fixed count.

---

## Complexity & Effort Summary

| Item | Effort | Human Input Needed? |
|------|--------|-------------------|
| Die/Bag data model | Low | No |
| Canvas 2D rendering | Low | Style preference |
| Trick detector (stateless) | Low | No |
| Trick detector (stateful) | Medium | No |
| Modification: Weight | Low–Medium | No |
| Modification: Stats | Low | No |
| Modification: Face Expansion | Medium | No |
| Gacha / token economy | Medium | **Yes — balance (future)** |
| Cosmetic system | Medium | **Yes — art/style (future)** |
| Persistence/save system | Low | **Yes — scope decision (future)** |
| Magnet mod | High | Design spike (future) |
| Brain mod | High | **Yes — UX design (future)** |

---

## Decisions Made

| # | Question | Decision |
|---|----------|----------|
| 1 | 2D rendering tech | Canvas. Simple placeholder until 3D returns. |
| 2 | Engine remnants | Keep `Events` system; strip 3D bootstrap. Massage game logic toward engine layer over time. |
| 3 | Starting bag | One 1d6. Adjust later. |
| 4 | Score formula | No scores. Tricks only. |
| 5 | Persistence | Defer; flag with `// TODO: persistence` at serialization boundary. |
| 6 | Token type | No enforcement yet. Track earned/spent counters for mods and cosmetics for future economy tuning. |
| 7 | Trick visibility | All tricks visible as `???` until first achievement. |
| 8 | Scoring vs cosmetics | N/A — no scoring this roadmap. |
| 9 | Magnet scope | Yes, but later and purely statistical (no physics). → future roadmap. |
| 10 | Brain die scope | Defer. → future roadmap. |
| 11 | Bootstrapping deadlock | Accepted for now. Keep one 1d6 start and work through during implementation. |
| 12 | Trick rewards (current scope) | Count as numeric currency only. `modsEarned` increments from trick hits; no gating checks. |
| 13 | Economy display | Show earned/spent for mods and cosmetics in general UI. Spending can exceed earned for now. |
| 14 | Streak identity | "Same roll" = same faces as previous full roll. Requires all dice to be rolled for a streak attempt. |
| 15 | Ascending rule | Any consecutive sequence; all active dice must participate; duplicates invalidate. Ascending length sets high score. |
| 16 | Trick list visibility | Always visible; for unachieved tricks show achievable / not achievable marker when reliably known, else blank. |
| 17 | Crit evaluation | Trick checks run against effective values. |
| 18 | Streak reset policy | Reset on any roll or modification event unless that full roll itself qualifies for continuation. |
| 19 | Mod earning rate | `modsEarned` = +1 on first completion of each trick. |
| 20 | Cosmetic earning rate | +1 only when an already-unlocked trick improves its high score (no cosmetic reward on first unlock). |
| 21 | Partial reroll | Deferred, but architecture must remain compatible. |
| 22 | High score optionality | Some tricks may opt out of high-score tracking; mark them clearly in Trick List/metadata. |
| 23 | Interim layout policy | Default left-play/right-management; allow top/bottom fallback on constrained aspect ratios. |

---

## Current Priority Order

1. 🔮 [TB-01 — Foundation](../features/TB-01-foundation.md)
2. 🔮 [TB-02 — Trick System](../features/TB-02-trick-system.md)
3. 🔮 [TB-03 — Bag Management](../features/TB-03-bag-management.md)
4. 🔮 [TB-04 — Stateful Tricks](../features/TB-04-stateful-tricks.md)
5. 🔮 [TB-05 — Modification System](../features/TB-05-modification-system.md)
6. 🔮 [TB-06 — Trick Discovery](../features/TB-06-trick-discovery.md)

---

## Execution Order

```
TB-01 (Die → Bag → Canvas → Roll button → Bootstrap cleanup)
  → TB-02 (Trick interface → Of a Kind → Ascending → Display)
  → TB-03 (Die identity → Earn dice → Bag UI → Selection)
  → TB-04 (Roll history → Streaks → Decimal milestone → Combos)
  → TB-05 (Mod interface → Weight → Stats → Face expansion → Randomizer → Tracking)
  → TB-06 (Registry → Trick list UI → Discovery event)
```

Playable checkpoints: end of TB-01 (roll + see faces), end of TB-02 (roll + see tricks), end of TB-03 (bag grows over time).

---

## Implementation Readiness Checklist

Before writing production code, lock these so TB-01/TB-02 implementation can move without rework:

- Define canonical event names and payload types in one place (`bag:rolled`, `bag:changed`, `trick:discovered`, `die:selected`, etc.).
- Define the trick metadata contract (`tracksHighScore`, optional `scoreRoll`, achievability evaluator availability).
- Define the Trick List row view-model shape (discovered, firedThisRoll, achievableNow tri-state, bestScore, high-score-tracked marker).
- Define responsive layout breakpoint rule for split vs stack fallback.
- Define initial per-trick score mapping table for currently planned tricks.
- Add one integration test path: roll -> evaluate tricks -> update counters -> update trick list view model.
- Add one deterministic RNG seam used by tests from day one.

Contract files (authoritative source for TB-01/TB-02 implementation):
- `src/game/contracts/TrickContracts.ts`
- `src/game/contracts/TrickListViewModel.ts`

Kickoff implementation order:
1. Create event constants/types in `TrickContracts.ts`.
2. Implement minimal `TrickRegistry` and `TrickEvaluator` against the contract types.
3. Implement `TrickListRowViewModel` mapper and render stubs.
4. Add one integration test: roll -> evaluate -> update counters -> build row view model.

If these are locked first, implementation can proceed feature-by-feature without changing public contracts.

---

## Open Questions (Round 3)

Most prior blockers are now resolved. Remaining questions are implementation-shaping details.

---

### Q1: Per-trick high score metric definitions (TB-02 / TB-06)

Each trick now needs a score metric for high-score tracking. Core TB-02 tricks are straightforward; ambiguous families are deferred.

- Of a Kind: score by matching count (e.g. 4-of-a-kind beats 3-of-a-kind).
- Ascending: score by run length (already decided).
- Prime Distinct: score by participating dice count.
- Combo tricks: score by combo depth or by base trick strength?

TB-02 implementation policy:
- Lock scores for the three core stateless tricks now.
- Defer combo scoring mapping to TB-04 implementation kickoff.

Also define which tricks intentionally set `tracksHighScore = false`.

---

### Q2: Responsive layout breakpoint for split vs stack fallback (TB-01 through TB-05)

Resolved default direction is split layout (left play, right management), with top/bottom fallback for constrained aspect ratios.

Implementation default cutoff (provisional, easy to tune later):
- Use top/bottom fallback when viewport width `< 1100px` **or** viewport aspect ratio `< 1.2`.


---

## File Placement

- Game models (`Die`, `Bag`, `Trick`, `Modification`): `src/game/`
- 2D rendering: `src/rendering/2d/`
- UI components: `src/ui/`
- Tests: `tests/` (mirror structure)
- Feature docs: `docs/features/TB-[N]-[name].md`
