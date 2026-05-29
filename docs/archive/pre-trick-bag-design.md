# ARCHIVED: Pre-Trick-Bag Roadmap And Design

**Status**: Parked — not abandoned, not complete  
**Last Updated**: 2026-05-29  
**Context**: This is the previous roadmap/design direction for the dice game — a multiplayer, risk/reward dice-battler with colored dice, special abilities, and a deckbuilding meta-layer. Development went in a different direction by implementing the Trick Bag design instead. This archive preserves the old direction and points to where relevant ideas appear in the current codebase.

---

## Original Design Concept

The game was envisioned as:

- Players roll a **bag of dice** (2–7) to achieve outcomes
- Dice have **colors** with special effects (red = treat one die as d4; green = double a roll)
- Dice have **pip styles** — symbols, animals, numerals — with unique meanings
- **Deckbuilding**: collect dice through gameplay, swap into an active pool
- **Multiplayer/combat**: capture opponent dice, steal the winner's die at round end
- **PVP unlock**: collect a sword, heart, and shield die to unlock PVP mode
- **Scoring**: highest sum after a 3-round match

### Special Abilities (Selected Ideas)

| Ability | Effect |
|---------|--------|
| Acid | Burns away pips from dice |
| Ice | Freezes a die result — immune to effects and theft |
| Fortune/Luck | Alters outcome probabilities |
| Re-roll | Default ability — re-roll a die |
| Temporal | Alters turn order |

---

## Why We Went Around It

The original design had interesting ideas but required significant player infrastructure (multiplayer, complex ability system) before reaching a playable state. Rather than block on that, development pivoted to the **Trick Bag** single-player loop to get a satisfying game loop working first.

The 3D engine migration (F02–F04) was an intermediate phase that was also bypassed — the 3D throw animation work was partially done but not completed as a blocking prerequisite.

---

## Where These Ideas Live Today

### Dice colors with effects
**Not yet implemented.** The most relevant seeds are:
- `docs/features/00-unsorted-tasks.md` — notes on colors as score (RGB value system, `rgb-light-core-mod`)
- `docs/archive/roadmap-archived.md` — future expansion territory
- The pip/material system (`F11`, `F14`) provides the visual foundation for this

### Pip styles (animals, symbols, etc.)
**Partially implemented.** See:
- `docs/features/F11-pip-style-options.md` — circle, hollow-circle, square, diamond, star, heart variants implemented
- `docs/design/Dice tricks.md` — further trick/pip ideas
- `docs/features/TB-TRICK-IDEAS-CANDIDATES.md` — candidate trick ideas, some of which involve pip types

### Die modification / weight
**Implemented.** The core idea of altering die probability is live:
- `src/game/DiceProbability.ts` — probability resolver
- `src/game/mods/DieWeightMod.ts` — weight mod implementation
- `docs/archive/features/TB-05-modification-system.md` — full modification system doc

### Deckbuilding / die collection
**Partially implemented.** The earning + bag mechanics are in place:
- `src/game/Bag.ts` — add/remove dice, active/inactive toggle
- `src/game/score/ScoreProgressionTracker.ts` — earn new dice at score milestones
- `docs/features/TB-03-bag-management.md` — bag management (in progress)
- Future: a "horde screen" is planned for large die collection management (see TB-03 feature doc)

### Ice / lock mechanic
**Partially implemented.** Die locking exists:
- `Die.locked` field on `src/game/Die.ts` — locked die is excluded from re-roll
- `docs/features/TB-07-lock-breaking.md` — lock breaking and tie-break constraints (deferred, design incomplete)
- `docs/archive/roadmap-archived.md` — notes on selector motion animation for lock UI

### PVP / multiplayer
**Not yet designed.** Left in the unsorted tasks:
- `docs/features/00-unsorted-tasks.md` — "unlock and then buy sword, heart, and shield → unlocks pvp"

### Ability system / combos
**Seeds exist.** The trick system is the current expression of special outcomes:
- `src/game/tricks/` — trick evaluator and all trick types
- `docs/archive/features/TB-02-trick-system.md` — trick interface and stateless tricks
- `docs/features/TB-04-stateful-tricks.md` — streaks and history-based tricks
- `docs/features/TB-06-trick-discovery.md` — discovery and reveal progression

### Score and risk/reward
**Implemented (current design).** The trick evaluation loop IS the risk/reward layer:
- `src/game/tricks/TrickEvaluator.ts` — evaluates all tricks per roll
- `src/game/score/ScoreProgressionTracker.ts` — cumulative score + reward logic
- `src/game/resources/GameResources.ts` — mods/cosmetics earned tracking

---

## 3D Engine Migration Work (F02–F04)

This was an intermediate phase (branch: `with-engine`) where the 3D throw animation was being migrated to the engine runtime. It was "gone around" — the trick bag loop works without needing 3D throw completion. The 3D view exists as an optional screen alongside the 2D canvas.

| Feature | Status | Notes |
|---------|--------|-------|
| F02 — Throw Input & Cooldown | 🔄 In Progress | Throw path wired; reset/snap + HUD + tests not done |
| F03 — Inspector Selection | 🚧 Blocked | Raycast + entity mapping done; UI waits on F10 screen shell |
| F04 — Camera Profile | 🔮 Not started | Centralize 3D scene camera defaults |

These are now tracked as optional/future work in `docs/archive/roadmap-archived.md`, which preserves the prior screen architecture plan for if/when the 3D experience is expanded.

---

## Full Original Design Document

See `docs/design/dice_game_design.md` — the original design doc is preserved as-is.
