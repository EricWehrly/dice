# Temporary Findings: dice / trick-bag branch

## Current Session: Render Context Container Sizing + Entity Creation Bridge

**Focus**: (1) Making `ThreeJSRenderContext` work within flex-based container layouts; (2) Fixing blank 3D canvas by creating engine entities from game state.

**Problems solved**:
1. **Render context sizing**: Singleton render context assumed full window control
2. **Blank canvas root cause**: `BagSceneSynchronizer` was never creating engine `Entity` objects—just mutating game model properties

**Solutions implemented**:

### Part 1: Container-Aware Render Context
- Added static `configure(RenderContextConfig)` method with `parentElement` option  
- Engine uses `ResizeObserver` to detect when container becomes visible/resizes
- Canvas properly sized and appended to target container instead of fullscreen
- Tests: 10 unit tests for configure() API and sizing behavior

### Part 2: Entity Creation Bridge (CRITICAL FIX)
- **Root cause found**: Game state (Bag, ModifiedDie) ≠ Engine entities (created via `createEntity()`)
- **Issue**: `BagSceneSynchronizer` was attempting to set `entity3DConfig` on game objects instead of creating engine entities
- **Fix implemented**: Synchronizer now calls `createEntity().withOptions({id, entity3DConfig: {graphicClass: DiceGraphic, ...}}).build()` for each die
- **Result**: Engine's `entity3DDrawers` map now receives proper Entity objects with DiceGraphic config; 3D meshes instantiate and render

**Key files changed**:
- `engine/js/rendering/contexts/ThreeJS.RenderContext.ts`: Config API, ResizeObserver integration
- `engine/test/rendering/ThreeJS.RenderContext.test.ts`: 10 unit tests for configure() and sizing logic
- `src/thrower/BagSceneSynchronizer.ts`: **NEW** - Creates engine entities via builder pattern, bridges game state → 3D rendering
- `tests/thrower/BagSceneSynchronizer.test.ts`: **NEW** - 4 integration tests verifying entity creation and event subscription
- `src/index.ts`: Call `configure()` before `initThrower()`

**Architecture insight**: Game models (Bag, ModifiedDie) are separate from Engine models (Entity, EntityGraphic). Synchronizer is the bridge layer that converts game state changes into engine entity mutations.

**Test status**: 23 test files passing (including new synchronizer tests); 3 pre-existing failures in InARow trick logic (unrelated to rendering)

**Forward compatibility note**: If multi-context support is needed later, this config pattern naturally scales—constructor calls replace `GetInstance()`, present code adapts without API breakage.
- Phase 3 path: Wire left-click with InputManager cooldown and async entity creation
- Both are testable and independent; could be tackled in parallel

## Renderer/Drawer Evidence (May 2026)

### Confirmed existing patterns
- Engine has a dedicated entity-graphic manager with an internal map:
	- `engine/js/rendering/entities/entity-3d-graphics.ts`
	- `const entity3DDrawers = new Map<Entity, EntityGraphicThree>()`
	- Creates graphics lazily from `entity.entity3DConfig.graphicClass`
	- Updates them from a registered render loop method
- Engine has an explicit base class for per-entity 3D renderers:
	- `engine/js/rendering/entities/EntityGraphicThree.ts`
	- `createGraphic()` + `update(deltaTime)` lifecycle
- App layer already uses a renderer registration pattern too:
	- `src/rendering/BaseRenderer.ts`
	- static `registry: Map<string, RendererConstructor>` with `registerRenderer/getRenderer`
- App has mesh/entity linkage support:
	- `src/rendering/EntityMeshRegistry.ts`
	- stores `entityId` in `userData` for mesh -> entity resolution

### Implication for die rendering architecture
- Yes: the codebase is already aligned with "distinct class owns rendering + internal mapping".
- Most native fit is:
	- Keep die visual class as `DiceGraphic extends EntityGraphicThree`
	- Let engine-level `entity3DDrawers` remain source-of-truth map for entity -> graphic instance
	- Use `EntityMeshRegistry` only for reverse lookup (hit-test/inspection), not as primary lifecycle store

### Recommendation for current roll-3d work
- If we want a die-focused synchronizer, keep it as an orchestration class (bag/event sync), not the primary renderer-owner.
- If a map is needed there, prefer `dieId -> entityId` or `dieId -> lightweight binding`, and avoid duplicating full renderer ownership that engine already maintains.