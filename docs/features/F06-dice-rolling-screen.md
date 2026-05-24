# F06 - Dice Rolling Screen

Status: 🔮 Planned

## Goal
A pure presentation component that renders the rolling scene: throw interaction, cooldown display, and dice state visualization.

## Scope
- Rendering main rolling scene (three.js / engine)
- Throw input handling and visual feedback
- Cooldown display
- Derived probability display (if desired) from F05 model
- Callback props for navigation (no direct shell knowledge)
- Screen controls mounted through engine UI (`UIElement`/`Menu`) rather than direct document overlays

## Screen Component Contract

**Props:**
- `currentDie: DieInstance`
- `faceProbabilities: Record<FaceId, number>` (from F05)
- `cooldownRemaining: number` (ms)
- `onThrow: (result: ThrowResult) => void`
- `onNavigate: (targetScreen: ScreenId) => void`

**Behavior:**
- Render rolling scene and handle left-click throw.
- Display cooldown countdown.
- Call `onNavigate` when player selects another screen (e.g., inspect, upgrade).
- No knowledge of how shell presents this screen (modal vs switch).

## Proposed Initial Approach
- Adapt existing throw pipeline to accept props instead of direct dom mutation.
- Keep existing `ThreeJSRenderContext` setup and camera path as baseline.
- Move screen-specific control surfaces to engine UI layer (`DomRenderingContext` + UI renderers).
- Keep visual/UX side mostly unchanged.

## Deliverables
- Component interface definition (inputs, callbacks, lifecycle)
- Integration notes with current engine renderer
- UI binding notes for nav controls in engine UI framework
- Acceptance tests for throw state + navigation callback flow

## Acceptance Criteria
- Rolling scene renders correctly with injected die/probability data.
- Throw input works and triggers callback.
- Navigation callbacks are invoked without screen knowledge.
- Camera/input state does not bleed into other screens.
- No direct app-level DOM element creation for screen-shell controls.

## Dependencies
- Depends on [F05 - Die Face Up-Probability Model](F05-die-face-up-probability-model.md) for probability display.
- Depends on [F10 - Screen Shell and Navigation](F10-screen-shell-navigation.md) for runtime navigation contracts.

## Risks
- Existing throw implementation tightly coupled to global state.
- Camera setup assumes exclusive control of input.
