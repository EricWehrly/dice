# Trick Bag - Future Roadmap

Items intentionally deferred from the active roadmap. These are real goals but need either more design work, more game experience, or depend on the active roadmap being complete first.

Active roadmap: [roadmap-trick-bag.md](roadmap-trick-bag.md)

---

## FP-1 — Persistence / Save System

**When**: After the game loop (TB-01 through TB-03) is stable and the serialization format defined in M3.1 is proven.

The `Die` and `Bag` models will include a serialization format from M3.1. Connecting that to LocalStorage is the implementation work here.

**Tasks**:
- Wire `Bag.serialize()` / `Bag.deserialize()` to LocalStorage on roll and on tab close.
- Handle migration if the serialization format changes.
- Decide: single save slot or named saves?

---

## FP-2 — Gacha & Token Economy

**When**: After TB-05 (Modification System) gives us a feel for how mods are used and what feels rewarding.

The `modsApplied` and `modsEarned` counters from TB-05/M5.6 give us the data to design the economy retroactively based on play experience. The economy should be designed from that data, not ahead of it.

**Planned mechanics**:
- Single universal modification token (simplest; revisit if strategic depth needs typed tokens).
- Gacha pull: spend a token, receive a random modification weighted by rarity.
- Machine modification: tokens can be spent on the gacha machine itself to skew future pulls.
- Token balance tuning phase after initial playtest.

**Open questions** (answer when the time comes):
- Single token vs typed tokens (cosmetic / stat / randomizer)?
- Does trick combo achievement produce bonus tokens?
- How does the machine modification meta-loop affect long-term balance?

---

## FP-3 — Magnet Modification

**When**: After TB-05's probability resolver architecture is proven on simpler mods.

Magnets are purely **statistical** — no physics simulation. Two dice with magnets have a higher joint probability of landing on faces that face each other. The magnet mod plugs into the same `faceUpProbability` resolver that Weight uses; it just references another die's state.

**Design spike needed**:
- How are two dice "paired" magnetically? Player selects them? Auto-pair on roll?
- Magnet strength values and probability formula.
- UI for showing magnetic relationship between dice.

**Implementation approach**:
- `MagnetModification` takes a reference to another `Die` (or die ID).
- During roll resolution, if the paired die also has a magnet, apply a mutual face-bias toward "adjacent" orientation.
- "Adjacent" is defined statistically as complementary faces (face 1 ↔ face 6, etc.) landing down together.

---

## FP-4 — Brain Modification

**When**: After the game loop is well established and player intent is observable through actual play patterns.

The Brain mod lets a die try to follow a **playbook** — a preferred outcome pattern expressed by the player. Die `strength` stat determines how reliably it follows the playbook.

**Design spike needed** (significant UX work):
- How does the player express a preferred pattern? Drag-to-rank faces? Mark a target outcome? Save a roll as a "favorite"?
- How does strength map to cheating probability?
- What happens when multiple Brain dice conflict?

---

## FP-5 — 3D Rendering Re-integration

**When**: The game is fun and the 2D placeholder is actually frustrating to look at.

The current pivot deliberately drops 3D to unblock gameplay. When re-introduced:
- 2D Canvas renderer and 3D renderer should be swappable behind a `DiceRenderer` interface.
- The engine's `ThreeJSRenderContext` and existing `DiceGraphic` work should be reconnected, not rewritten.
- Screen architecture from `roadmap-pivot.md` becomes relevant again for the Dice Details and Trick List screens.

---

## FP-6 — Scoring & High Scores

**When**: After the trick system has been played enough to understand what "doing well" feels like.

Current decision: no scoring, tricks only. If a score is added later, likely candidates:
- Trick count per session.
- Weighted trick score (harder tricks = more points).
- Streak multipliers.

High score tracking should be added at the same time as persistence (FP-1).

---

## FP-7 — Cosmetics

**When**: After core gameplay loop (TB-01 through TB-06) is stable.

- Faces can carry style tags (non-default cosmetic state).
- Required by the Matching and Flashing trick variants.
- Cosmetic rewards tied to trick achievements or a secondary point pool (TBD).
- Art/style direction: **human decision needed**.

---

## FP-8 — Randomizer Modifications

**When**: After basic stat mods (TB-05) are playtested.

Low priority, interesting design space:
- Odd/even bias
- High/low bias
- Match-neighbor tendency
- Swappable RNG engine (pluggable random source per die)

The swappable RNG architecture should be scaffolded in TB-05/M5.1 so it's injectable later without a refactor.
