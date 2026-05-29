# ARCHIVED: Engine Migration Roadmap

**Status**: Parked (not complete, not abandoned)  
**Last Updated**: 2026-05-29  
**Context**: This was the intermediate roadmap during the engine migration phase. The current focus has shifted to the consolidated active roadmap (see `docs/active/roadmap.md`). This document is kept for historical reference and to track outstanding engine integration work.

---

# Original Content

Branch: with-engine
Goal: migrate standalone dice prototype onto engine runtime while preserving incremental playability.

Feature docs: [F02](../../features/F02-throw-input-cooldown.md), [F03](../../features/F03-inspector-selection.md), [F04](../../features/F04-camera-profile.md)
Migration plan reference: [docs/UPGRADE_PLAN_DUAL_SCENE.md](../../UPGRADE_PLAN_DUAL_SCENE.md)

## Current Priority Order

1. 🔄 [F02 - Throw Input and Cooldown](../../features/F02-throw-input-cooldown.md)
2. 🚧 [F03 - Inspector Selection and Deferred UI](../../features/F03-inspector-selection.md)
3. 🔮 [F04 - Camera Profile and Scene View Policy](../../features/F04-camera-profile.md)

## Status Summary

- ✅ Engine bootstrap and entity rendering foundation are complete.
- 🔄 Throw flow works through engine path, but thrown dice currently disappear and need persistence/reset behavior fixed plus cooldown HUD.
- 🚧 Inspector UI is deferred; selection and logging plumbing is kept active.
- 🔮 Camera defaults need one centralized feature-owned profile.

## Legacy Cleanup Track

- `src/rendering/RenderingContextManager.ts` and `src/rendering/RotationViewer.ts` were removed.
- Any remaining docs/tests referencing those classes should be retired or rewritten against feature docs.

## Next Action

Implement F02 remaining items in order:
1) reset/snap previous throw visuals on new throw,
2) cooldown HUD,
3) tests for both.

---

## Lessons & Decisions From This Phase

- Engine bootstrap proved stable and allowed incremental migration.
- Dual-path rendering (legacy + engine) created complexity; full migration to engine needed to simplify.
- Inspector UI benefits from engine-level modal/screen support decisions (tracked in F10, F03).

## Reintegration Notes

Outstanding work from this phase:
- F02 remaining: reset/snap behavior + cooldown HUD tests
- F03 deferred: Inspector UI waits for F10 engine-level screen support
- F04 camera profile: Can be picked up anytime; no other features depend on it yet

See current `docs/active/roadmap.md` for current priorities and how this work fits in.
