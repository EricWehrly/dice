# Dice Game - Active Roadmap

Branch: with-engine
Goal: migrate standalone dice prototype onto engine runtime while preserving incremental playability.

Feature docs: [F02](../features/F02-throw-input-cooldown.md), [F03](../features/F03-inspector-selection.md), [F04](../features/F04-camera-profile.md)
Migration plan reference: [docs/UPGRADE_PLAN_DUAL_SCENE.md](../UPGRADE_PLAN_DUAL_SCENE.md)

## Current Priority Order

1. 🔄 [F02 - Throw Input and Cooldown](../features/F02-throw-input-cooldown.md)
2. 🚧 [F03 - Inspector Selection and Deferred UI](../features/F03-inspector-selection.md)
3. 🔮 [F04 - Camera Profile and Scene View Policy](../features/F04-camera-profile.md)

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
