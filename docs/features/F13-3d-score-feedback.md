# F13 - 3D Score Feedback

Status: Planned

## Goal
Add readable, satisfying score feedback in the Roll 3D scene by showing per-die score labels and animated score tokens that travel to the high score indicator.

## User Decisions Captured
1. Keep arrivals within the same 2s animation window for now. If it feels too cramped in playtesting, adjust timings.
2. This feature is Roll 3D-specific.

## Clarifications (Resolved)
- Open questions remaining: none for implementation start.
- Score token count source: use score delta from score:updated (highScore - previousHighScore).
- No-gain rolls: still show per-die label fade-in at roll-end and fade-out via a short completion path, with zero token travel.
- Timeline contract: both spawn scheduling and token arrivals must complete inside the same 2000ms window.

## UX Behavior
- After a roll settles, each rolled die shows a score label above it with the high score icon plus zero (icon + 0).
- The per-die score label fades in at the end of roll resolution.
- Score tokens spawn from behind each die, rise/ascend, and travel toward the high score indicator.
- On each token arrival, the high score indicator bumps upward and the displayed score increments.
- After score animation completes, per-die score labels fade out.

## Timing Model (2s Total)
- Fixed score animation duration: 2000ms.
- For N token spawns, schedule spawn times across the full window:
  - t_i = i * (D / max(N - 1, 1)), where i in [0, N-1], D = 2000ms.
- Interpretation:
  - N = 1 -> one spawn at t=0.
  - N > 1 -> first spawn at t=0, last spawn at t=2000ms.
- Travel duration per token is chosen so arrivals still complete within the same 2s window.
- For N > 1, travel duration is derived from remaining timeline per token so the final token arrives by t=2000ms.

## Architecture (Reuse-First)
- Event sources:
  - bag:rolled for per-die context and post-roll label display.
  - score:updated for score delta and token count.
- Render/update hook:
  - Register one score-feedback update method in ThreeJSRenderContext render loop.
- Visual layers:
  - Keep 3D scene rendering unchanged.
  - Add a lightweight overlay layer inside the roll-3d screen container for projected labels/tokens.
- Target anchor:
  - Use the existing high score counter element from TrickCounterPanel as the arrival target.

## Proposed Implementation Slices
1. Slice A: Per-die label lifecycle
- Show icon + 0 labels above rolled dice when roll ends.
- Fade in at roll-end; keep visible during score animation; fade out on completion.

2. Slice B: Spawn scheduler and token queue
- Convert score delta into token count.
- Generate spawn schedule over 2000ms.

3. Slice C: Token motion and arrival effects
- Spawn behind die, rise, then travel to high score indicator.
- On arrival: increment indicator value by 1 and trigger bump animation.

4. Slice D: Polish
- Tune easing, offsets, and overlap handling.
- Optional later: spawn from face-up side rather than center-back approximation.

## Data and API Notes
- Score feedback controller should be initialized from app startup with minimal new wiring.
- TrickCounterPanel should expose a stable anchor for high score targeting (element accessor or rect helper).
- Keep all public contracts narrow and type-safe; avoid any.

## Acceptance Criteria
- In Roll 3D mode, each rolled die shows icon + 0 label after roll completion.
- Labels fade in at roll-end and fade out when score animation ends.
- For score delta N, exactly N tokens are spawned and animated.
- Token spawns are evenly distributed across 2000ms using the scheduling rule above.
- Token arrivals complete within the same 2000ms window.
- Each arrival increments score by exactly 1 and triggers a visible bump.
- Behavior remains stable across multiple rapid rolls (no stuck labels/tokens).

## Risks
- High token counts can look crowded in a strict 2s window.
- UI anchor movement/resizing can desync target projection if not updated per frame.

## Test Plan
- Unit test scheduling math for spawn timestamps.
- Unit/integration test token count from score delta.
- UI test for label visibility lifecycle (fade-in, visible, fade-out states).
- UI test for score bump trigger and per-arrival increment behavior.
- Stress test with larger deltas to validate clamping/overlap behavior.
