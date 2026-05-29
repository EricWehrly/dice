# ARCHIVED: Trick Bag Roadmap (First Pass)

**Status**: Parked (foundational work complete, system evolving)  
**Last Updated**: 2026-05-29  
**Context**: This was the initial detailed breakdown of the trick bag (TB) feature set. While TB-01 and TB-02 are complete, the remaining items were resequenced and consolidated into the active roadmap. This document is kept for reference on the original design thinking.

---

See [./roadmap-archived.md](./roadmap-archived.md) for the consolidated archived roadmap.

## Original Design Thinking

The trick bag was envisioned as a complete system from foundation through discovery and lock breaking:
1. **TB-01**: Foundation (Die, Bag, basic Trick interface)
2. **TB-02**: Trick System (Core/Stateless tricks)
3. **TB-03**: Bag Management (Bag UI, Die selection, earn dice)
4. **TB-04**: Stateful Tricks & Combos (Roll history, streaks, decimal milestones)
5. **TB-05**: Modification System (inspector, preview, install)
6. **TB-06**: Trick Discovery (discovery state, reveal on first completion)
7. **TB-07**: Lock Breaking (tie-breaking constraints for finer control)
8. **TB-08**: Die Mixin Equipped Refactor (consolidate equipped-die representation)

## Completed Phases

✅ **TB-01**: Foundation — Die, Bag, basic Trick interface (complete, see feature docs)
✅ **TB-02**: Trick System — All trick types, TrickEvaluator, economy resources (complete, commit 8d1037a)

## Status of Remaining Phases

- **TB-03**: Bag Management — Die identity and model exist, but bag UI deferred until roll screen is crowded
- **TB-04**: Stateful Tricks — Ready to start after priority sequencing; no blocking dependencies
- **TB-05**: Modification System — Ready to start; depends on TB-04 wiring only
- **TB-06**: Trick Discovery — Depends on TB-04; no UI work yet
- **TB-07**: Lock Breaking — Design incomplete; lower priority than TB-05
- **TB-08**: Die Mixin Refactor — May not be needed; current equipped-die model works

## Reintegration Notes

Current direction (now captured in `docs/active/roadmap.md` and `docs/archive/roadmap-archived.md`):
- Integration of TB work into a unified feature track
- TB-03 bag UI deferred to a "horde screen" when roll screen is crowded
- TB-05 front-loaded in priority (user preference)
- TB-04 stateful tricks parallel-tracked
- TB-06/TB-07 lower priority, deferred until core system stabilizes

## Design Insights Retained

- Trick-based economy is the core progression mechanism
- Die identity + modifications form the player collection
- Probability model is essential for all screens
- Discovery + reward loop is the long-term engagement target

See `docs/active/roadmap.md` for current sequencing and status.
