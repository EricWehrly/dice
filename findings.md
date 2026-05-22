# Temporary Findings: dice / with-engine

## What this WIP code is doing
This branch is migrating the dice game onto the engine runtime: `src/index.ts` now boots the engine, creates engine-backed dice entities, and uses `ThreeJSRenderContext`. Input wiring (thrower and inspector) is still pending integration, but the rendering foundation is working.

## Where it is in the work
**✅ Phase 1 complete**: Engine integration, test runner migration, and input manager foundation are committed and working. Console logs confirm: scene setup, multiple dice entities rendering, OrbitControls camera active, graphics being materialized. **⏳ Phase 2+ pending**: Thrower input handling, inspector right-click wiring, and two-scene layout still need implementation.

## Where the work is defined
`docs/UPGRADE_PLAN_DUAL_SCENE.md` defines the multi-phase plan (Phase 1: Consolidate Systems ✅, Phase 2: Inspector System ⏳, Phase 3: Input Management ⏳, Phase 4: Polish). Broader engine context in `engine/docs/roadmap.md`.

## Tracker status & console evidence
The plan is now a live working reference. Console logs from yarn start show:
- ✅ Engine boots successfully
- ✅ Scene setup creates lighting, grid, test cube
- ✅ Red and blue dice entities created via `createEntity().withOptions()`
- ✅ DiceGraphic renders both dice meshes (BoxGeometry)
- ✅ Camera + OrbitControls initialized and active
- ⏳ Left-click input not yet wired (expected; Phase 3)
- ⏳ Right-click inspector not yet connected (expected; Phase 2)

## Commits made (adc438c HEAD)
1. ✅ `74e8d0a` feat(engine-integration): wire dice app entrypoint to engine runtime
2. ✅ `865c4e7` test(vitest): migrate test runner from jest to vitest
3. ✅ `be5f748` feat(input): add throw cooldown input manager
4. ✅ `921ee84` test(thrower): cover engine-backed thrown-dice path
5. ✅ `adc438c` docs(migration): add dual-scene plan and findings

## Next: Phase 2 (Inspector) or Phase 3 (Input Wiring)
- Phase 2 path: Implement right-click inspector with mesh-to-entity mapping and OrbitControls
- Phase 3 path: Wire left-click with InputManager cooldown and async entity creation
- Both are testable and independent; could be tackled in parallel