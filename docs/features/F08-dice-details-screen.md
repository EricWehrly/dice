# F08 - Dice Details Screen

Status: 🔮 Planned

## Goal
A pure presentation component with orbit camera controls and a full property list for a die.

## Context
This overlaps with prior inspector intent from [F03 - Inspector Selection and Deferred UI](F03-inspector-selection.md), but formalizes it as a first-class screen in the pivot.

## Scope
- Rendering die with orbit camera controls
- Property list UI (base stats, modifiers, derived values)
- Probability display from F05 model
- Callback props for navigation (no shell knowledge)
- Camera lifecycle managed through existing `ThreeCam`/`ThreeJSRenderContext` ownership rules

## Screen Component Contract

**Props:**
- `selectedDie: DieInstance`
- `faceProbabilities: Record<FaceId, number>` (from F05)
- `onNavigate: (targetScreen: ScreenId) => void`

**Behavior:**
- Render die in dedicated orbit camera context.
- Display comprehensive property taxonomy (grouped by type).
- Include probability breakdown by face.
- Call `onNavigate` on user action.
- No knowledge of modal vs screen switch.

## Property Taxonomy (Proposed)
- Base Stats (geometry, face count, balance)
- Modifiers (active status effects, temporary bonuses)
- Derived (probabilities, expected value, bias metrics)
- History (when acquired, upgrade timeline)

## Deliverables
- Component interface definition
- Camera setup and orbit interaction spec
- Property grouping/sort order spec
- Engine context/layer transition notes for entering/leaving details
- Acceptance tests for property rendering + orbit behavior

## Acceptance Criteria
- Die renders with independent orbit camera.
- Property list displays all relevant data accurately.
- Orbit controls are responsive and independent from rolling camera.
- Navigation callbacks invoked without shell knowledge.

## Dependencies
- Depends on [F05 - Die Face Up-Probability Model](F05-die-face-up-probability-model.md).
- Should inform design around [F04 - Camera Profile and Scene View Policy](F04-camera-profile.md).
- Depends on [F10 - Screen Shell and Navigation](F10-screen-shell-navigation.md) for transitions.

## Risks
- Camera lifecycle bugs if rolling orbit camera state bleeds together.
- Property list becomes noisy without disciplined grouping.
