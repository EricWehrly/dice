# F10 - Screen Shell and Navigation

Status: 🔮 Planned

## Goal
Support screen-frame composition where the game can place screens into regions (top, bottom, full, etc.) and swap which screen is rendered in each region, while the engine owns rendering/layout mechanics.

## Read This First (Simple Requirements)

- Engine provides frame-slot layout primitives (top, bottom, full, left, right, custom grid) and render order.
  - Expand: [Engine Frame Layout System](#engine-frame-layout-system)
- Game declares screen registry and which screen goes in which slot.
  - Expand: [Game Screen Declarations](#game-screen-declarations)
- Runtime can swap screens in slots without recreating renderer/context objects.
  - Expand: [Engine Slot Swap Runtime](#engine-slot-swap-runtime)
- UI layout concerns and canvas/context concerns are separate contracts.
  - Expand: [UI Layout Contract](#ui-layout-contract)
  - Expand: [Canvas/Context Contract](#canvascontext-contract)
- Layers are for stacked render work, not screen identity.
  - Expand: [Render Layer Clarification](#render-layer-clarification)

## Render Layer Clarification

Render layers are for stacking/filtering render work inside a context.
They are not screen IDs.

Screen switching means changing which screen content is active in a slot/layer policy, not creating one layer per screen.

## UI Layout Contract

Write these engine capabilities:

- Slot layout model:
  - named slots
  - anchor/size rules
  - z-order between slots
- Slot UI binder:
  - mount/unmount screen UI trees per slot
  - preserve reusable UI container(s)
- Slot transition policy:
  - replace
  - show/hide
  - optional transition hooks
- Slot diagnostics:
  - current slot -> screen mapping
  - last swap reason/event

## Canvas/Context Contract

Write these engine capabilities:

- Context policy model per slot/screen:
  - ThreeJS enabled/disabled
  - Dom UI enabled/disabled
  - gameplay loop active/paused
- Camera ownership policy:
  - active camera per screen mode
  - camera state retain/reset rules on swap
- Render update pipeline hooks:
  - apply slot/screen policy before render pass
  - avoid creating/destroying contexts on routine swaps
- Event lifecycle:
  - navigate requested
  - slot assignment changed
  - slot content rendered

## Engine Frame Layout System

Primary implementation ownership: engine layer.

Write:

- `ScreenFrameLayout` type (slot definitions + ordering)
- `ScreenSlotId` type and registry
- `SlotAssignment` model (`slot -> screen`)
- renderer-facing applier that translates assignment into active render work

## Engine Slot Swap Runtime

Primary implementation ownership: engine layer.

Write:

- navigation reducer/state machine for slot assignments
- idempotent swap API (`setSlotScreen(slot, screen)`)
- event emission for before/after swap
- safeguards for invalid slot/screen declarations

## Game Screen Declarations

Primary implementation ownership: game layer.

Write:

- game-owned screen registry (`screen id -> screen definition`)
- initial layout declaration (`slot -> screen`)
- user intents mapped to engine swap API
- per-screen view-model selectors

## Dependencies

- [F05](F05-die-face-up-probability-model.md)
- [F06](F06-dice-rolling-screen.md)
- [F07](F07-dice-upgrading-screen.md)
- [F08](F08-dice-details-screen.md)
- [F09](F09-trick-list-screen.md)

## Acceptance Criteria

- Game can declare 2+ slots and assign screens to them.
- Swapping one slot does not force full context rebuild.
- Engine APIs handle slot/layout/render mechanics.
- Game APIs handle screen declaration and intent routing.
- Screen rendering remains presentation-agnostic.
