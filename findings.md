# Temporary Findings: dice / with-engine

## What this WIP code is doing
This branch is migrating the dice game onto the engine runtime: `src/index.ts` now boots the engine, creates engine-backed dice entities, and uses `ThreeJSRenderContext`, while `src/thrower/*` still contains the older throw-and-inspect flow that is being adapted rather than removed.

## Where it is in the work
The migration is partially complete: the dice entities and rendering are engine-backed, but the thrower/inspector path is still split and unfinished, so the branch is in the middle of consolidation rather than at a working end state.

## Where the work is defined
The clearest work definition is `docs/UPGRADE_PLAN_DUAL_SCENE.md`, which lays out the thrower consolidation, inspector wiring, input manager, and cleanup phases; the broader engine side roadmap is in `engine/docs/roadmap.md`.

## Is the tracker up to date?
Only partly. The plan still describes the right direction, but it reads like an active migration plan rather than a live progress tracker, and it does not reflect task completion in a granular way; `engine/docs/roadmap.md` is also broader than this dice migration.

## Commits I would make
1. `feat(engine-integration): wire dice app entrypoint to engine runtime and entity graphics`
	- Includes current staged app migration files: `.github/copilot-instructions.md`, `src/game/Dice.ts`, `src/index.ts`, `src/ui/GameObjectInspector.ts`, `webpack.config.js`, and the staged portions of `src/thrower/index.ts`, `src/thrower/input.ts`, `tsconfig.json`.
2. `chore(engine-submodule): advance engine pointer to aligned migration commit`
	- Commit the submodule pointer update for `engine` only after confirming which engine commit you want to pin.
3. `test(vitest): migrate root test runner from jest to vitest`
	- Includes `package.json`, `tsconfig.json`, `vitest.config.ts`, `tests/vitest.setup.ts`, deletion of `jest.config.js`, and migrated test files (`src/tests/rendering/DiceGraphic.test.ts`, `tests/rendering/RenderingContext.test.ts`, `tests/__mocks__/three.js`).
4. `feat(input): add throw cooldown input manager with tests`
	- Includes `src/controls/InputManager.ts` and `tests/controls/InputManager.test.ts`.
5. `test(thrower): cover engine-backed thrown-dice path`
	- Includes `tests/thrower/input.test.ts` and any remaining unstaged changes in `src/thrower/index.ts` and `src/thrower/input.ts` that support async engine graphic resolution.
6. `docs(migration): add dual-scene upgrade plan and temporary findings snapshot`
	- Includes `docs/UPGRADE_PLAN_DUAL_SCENE.md` and `findings.md`.