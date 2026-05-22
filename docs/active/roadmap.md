# Dice Game – Active Roadmap

**Branch**: `with-engine` | **Goal**: Migrate standalone dice app onto engine runtime with full throw + inspect UX

> Detail: [UPGRADE_PLAN_DUAL_SCENE.md](../UPGRADE_PLAN_DUAL_SCENE.md)

---

## Phase 1: Consolidate Systems ✅
_Engine integration complete, dice rendering verified in browser._

- ✅ 1.1 Refactor Dice.ts to use Engine Entity (not GameObject)
- ✅ 1.2 Migrate src/index.ts to engine boot + ThreeJSRenderContext
- ✅ 1.3 DiceGraphic extends EntityGraphicThree, renders BoxGeometry
- ✅ 1.4 Migrate test runner from Jest to Vitest
- ✅ 1.5 Add InputManager (cooldown + inspector mode tracking)
- ✅ 1.6 CreateCubeAtCursor uses engine entities + async graphic resolution

---

## Phase 2: Inspector System 🚧 (Deferred)
_Right-click selection plumbing exists; full inspector UI deferred pending engine capability work._

**Design decisions (from plan Q&A):**
- Modal design, pauses scene below, large screen coverage
- ~80% preview (OrbitControls dice view) / ~20% stats panel
- Responsive: stats cuts into whichever dimension has more room (width or height)
- Dismiss via X button; inspector backed by dedicated render context

- ✅ 2.1 `EntityMeshRegistry`: UUID → Entity map, populated by DiceGraphic.createGraphic()
- 🔄 2.2 `GameObjectInspector` resolves clicked entity and stores selection (`window.__lastInspectedEntity`)
- 🚧 2.3 Engine dependency: modal/overlay lifecycle contract in engine UI layer
- 🚧 2.4 Engine dependency: scene/render suspension policy while inspector is open
- 🚧 2.5 Engine dependency: secondary scene/screen pattern for detailed inspection
- 🔮 2.6 Dice-side inspector UI can be reintroduced once engine capabilities land

---

## Phase 3: Input Management 🔄 ← **Current**
_Left-click throw with cooldown indicator; throws clear and reset on each throw._

**Design decisions (from plan Q&A):**
- Dice persist after throw; reset (visibility snap) when next throw happens
- Cooldown indicator: low-opacity solid circle, clockwise sweep overlay (high opacity same color)

- ✅ 3.1 Wire left-click → InputManager → createCubeAtCursor via game start init
- 🔮 3.2 Track thrown dice; reset/snap previous dice on new throw
- 🔮 3.3 Cooldown HUD: circular sweep clock overlay on canvas
- 🔮 3.4 Block throws while inspector is open (InputManager.setInspecting)

---

## Phase 4: Polish & Testing 🔮

- 🔮 4.1 Remove unused thrower code after full consolidation
- 🔮 4.2 TypeScript types cleanup (remove `as any` casts)
- 🔮 4.3 Integration tests for throw → inspect flow
- 🔮 4.4 Update README with input controls documentation

---

## Status Key
- ✅ Completed  |  🔄 In Progress  |  🔮 Not Started  |  🚧 Blocked

## Next Action
**Phase 3, Task 3.2** — Reset/snap previous thrown dice on each new throw, then implement cooldown HUD (Task 3.3).
