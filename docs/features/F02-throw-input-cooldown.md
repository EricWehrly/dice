# F02 - Throw Input and Cooldown

Status: 🔄 In Progress

## Goal
Support left-click throw flow using engine entities with cooldown and predictable reset behavior.

## Scope
- Throw input wiring
- InputManager cooldown enforcement
- Throw animation integration
- Reset/snap behavior for previously thrown dice
- Cooldown HUD indicator

## Done
- Thrower init wired into game startup path
- Left-click throw path uses InputManager gate
- createCubeAtCursor returns engine entity + mesh + animation mixer

## Remaining
- Fix regression: thrown dice currently disappear after throw; they should persist until reset on next throw
- Implement reset/snap behavior for previously thrown dice on new throw
- Add cooldown HUD visual (clock-sweep circle)
- Add tests for reset and cooldown HUD state transitions

## Acceptance Criteria
- Left-click throws one dice when cooldown allows
- Repeated clicks during cooldown do not throw
- Thrown dice remain visible after throw (no unintended disappearance)
- New throw resets/snap-hides prior throw visuals per current design decision
- Cooldown indicator clearly reflects time remaining
