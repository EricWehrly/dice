# TB-06 — Trick Discovery

**Phase**: 6  
**Status**: 🔮 Not started  
**Depends on**: TB-02 (Trick Registry, TrickDisplay), TB-04 (full trick set including stateful)  
**Blocks**: nothing (final polish feature in this roadmap)

## Goal

All tricks are visible in the Trick List from the start, but undiscovered tricks show as `???`. The first time a trick fires, it is "discovered" — the name and description reveal permanently.

---

## Milestones

### M6.1 — Trick Registry with Discovery State

**Update**: `src/game/TrickRegistry.ts`

Add per-trick discovery state:

```typescript
interface TrickEntry {
  trick: Trick;
  discovered: boolean;
  achievableNow: boolean | null;   // true = achievable, false = not achievable, null = unknown
  bestScore: number | null;        // retained per-trick high score when tracked
  tracksHighScore: boolean;        // false means show explicit untracked marker
}

class TrickRegistry {
  private entries: Map<string, TrickEntry>;

  register(trick: Trick): void;
  discover(id: string): void;       // marks as discovered, fires 'trick:discovered' event
  isDiscovered(id: string): boolean;
  all(): TrickEntry[];
}
```

- All tricks start with `discovered: false`.
- `discover()` is idempotent (calling on already-discovered trick does nothing).
- Fires `'trick:discovered'` event with the trick ID — subscribers can show a notification.

**Note**: Discovery state is in-memory only for now. Persistence wired in FP-1.

---

### M6.2 — Trick List UI

**Update**: `src/ui/TrickDisplay.ts`

Replace the simple post-roll result list with a persistent Trick List panel.

Layout:

```
TRICKS
──────────────────────────────
  ✓  Two of a Kind   (HS: 4)   ← discovered, fired last roll
    Three of a Kind (HS: 3)   ← discovered, not fired last roll
    Momentum       (HS: n/a)  ← discovered, high score intentionally untracked
  A  ???                       ← unachieved, currently achievable
  N  ???                       ← unachieved, not currently achievable
    ???                       ← unachieved, achievability unknown
──────────────────────────────
```

**States per row**:
- **Undiscovered**: show `???` only. No name, no description.
- **Discovered, fired this roll**: highlighted (bold, color, checkmark — whatever reads clearly).
- **Discovered, not fired this roll**: normal display.
- **High score**: for discovered tricks, display retained per-trick high score (`HS`) when tracked.
- **Untracked score marker**: show `HS: n/a` for tricks that intentionally do not track high score.
- **Achievability marker**:
  - Only for unachieved tricks
  - `A` when achievable now
  - `N` when not achievable now
  - blank when unknown / undecidable from current state

The panel should handle an arbitrary number of tricks without layout breakage.

---

### M6.3 — Discovery Event & Notification

When `'trick:discovered'` fires, show a brief notification to the player:

```
  ✨ New trick unlocked: Three of a Kind!
```

A simple overlay or status message that auto-dismisses after 2–3 seconds. No animation required. The important thing is it's not silent.

**Where this lives**: `src/ui/NotificationBanner.ts` (a simple timed text display). Reusable for any future notification needs.

---

## Integration with TrickEvaluator

**Update**: `src/game/TrickEvaluator.ts`

After evaluating tricks, for each trick that fired:
1. Check if `registry.isDiscovered(trick.id)`.
2. If not, call `registry.discover(trick.id)`.

The evaluator already has access to the registry (pass it in at construction or call time).

---

## Tests

`tests/game/TrickRegistry.test.ts`

- All tricks start undiscovered.
- `discover()` marks discovered; `'trick:discovered'` event fires.
- `discover()` called twice does not fire event a second time.
- `all()` returns all entries in registration order.

---

## Definition of Done

- [ ] `TrickRegistry` tracks discovered state per trick.
- [ ] `TrickEvaluator` calls `registry.discover()` on first-time trick fires.
- [ ] Trick List UI shows `???` for undiscovered tricks.
- [ ] Trick List UI shows achievability marker (A/N/blank).
- [ ] Trick List UI shows per-trick high score for discovered tricks.
- [ ] First-time discovery triggers a visible notification.
- [ ] Discovery is idempotent (no double events).
