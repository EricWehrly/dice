# F15: Dynamic Camera Framing for Dice — COMPLETED ✅

**Date Completed:** 2026-05-29

## What Was Built

Implemented automatic camera framing for dice that adapts to layout changes while preserving compositional off-axis angle.

### Deliverables

1. **FramingCalculator** (`src/camera/FramingCalculator.ts`)
   - Pure math module for calculating camera position/target given bounds and constraints
   - Handles aspect ratio, FOV, vertical/horizontal fit, diagonal sphere coverage
   - Configurable pitch angle, padding, offsets, min/max distance clamps
   - Relaxation curve: horizontal offset eases toward 0 as layout widens (full bias @ 3 dice → centered @ 12 dice)

2. **CameraAnimator** (`src/camera/CameraAnimator.ts`)
   - Queued animation system for smooth camera transitions
   - Cubic ease-in-out over 400ms (tunable)
   - Keeps orbit controls target in sync to prevent control drift

3. **Camera Integration** (`src/camera.ts`)
   - Auto-frame on game start and whenever bag changes
   - Listens to `TrickEvents.BAG_CHANGED` for responsive retargeting
   - Responsive to viewport resize (non-animated recalc)
   - Integrates click handler for interaction (added later)

4. **Unit Tests** (`src/tests/camera/FramingCalculator.test.ts`)
   - 4/4 passing: pitch calculation, single-die framing, wide multi-die layout, deep layout with constraints
   - Validates that all bounds corners fit in NDC space

### Tuned Parameters (Final)

```typescript
{
  horizontalOffsetPercent: -0.15,           // Lean left at 3 dice
  horizontalOffsetRelaxStartWidth: 5,       // Start relaxing at ~3 dice width
  horizontalOffsetRelaxWidth: 23,           // Fully centered at ~12 dice width
  depthOffsetPercent: 0.05,                 // Minimal push-back
  lookDownPitchDegrees: 42,                 // Orbital looking-down angle
  minDistance: 4,                           // Closest zoom
  maxDistance: 24,                          // Furthest zoom
  paddingPercent: 0.15,                     // Breathing room around dice
}
```

### Visual Behavior

- **1–3 dice:** Strong off-axis (−15% lateral lean)
- **4–8 dice:** Gradual relaxation toward center
- **9–12+ dice:** Nearly centered view
- **Smooth transitions:** 400ms animated retarget when bag changes
- **Pitch:** Constant 42° look-down angle maintains compositional feel across all counts

### Known Limitations / Deferred

- Context-aware framing (different screens with different parameters) — not needed for initial release
- UI feedback for focused die — moved to F16 Phase 3

---

## Issue Resolution

### Pitch Effect Was Muted
**Issue:** Changing `lookDownPitchDegrees` had little visual effect.
**Root Cause:** Pitch was computed as `tan(pitch) * distance` for Y, but Z stayed at full distance → camera drifted upward without orbiting.
**Fix:** Proper sin/cos decomposition: `Y = distance * sin(pitch)`, `Z = distance * cos(pitch)`.

### Padding Had Non-Linear Effect
**Issue:** Adjusting `paddingPercent` had inconsistent results.
**Root Cause:** Padding scaled the input bounds before distance calculation, getting dominated by sphere-fit term.
**Fix:** Apply padding directly to final computed distance: `distance *= (1 + paddingPercent)`.

### Wide/Deep Layouts Clipped
**Issue:** Diagonal depth and pitch-offset corners could exceed NDC [-1, 1] bounds.
**Root Cause:** No provision for spherical coverage with pitch/offset applied.
**Fix:** Reduced sphere-fit coefficient to 0.75 (catches clipping without dominating typical layouts).

### Offset Too Strong With Many Dice
**Issue:** As dice accumulated, −15% lateral offset pushed camera further left in absolute terms.
**Root Cause:** Offset was `percent * size.x`, so it scaled with layout width.
**Fix:** Smoothstep relaxation curve gradually eases offset toward 0 as layout widens.

---

## Acceptance Criteria Met

- ✅ 3-dice scene frames all dice cleanly
- ✅ Adding a 4th+ die smoothly pans/zooms camera to fit
- ✅ Off-axis look remains consistent (never overhead)
- ✅ No jarring transitions or clipping
- ✅ Works for 1–10+ dice without major adjustment
- ✅ Responsive to viewport resize
- ✅ All unit tests passing

---

## Next Steps

The foundation is solid for the next phase: **F16 - Camera Die Focus Click** allows users to click on a die to zoom in for detail inspection, with smooth animation back to full-framing.
