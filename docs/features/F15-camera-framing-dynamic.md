# F15: Dynamic Camera Framing for Dice

## Problem
Camera is manually tuned for 3 dice but doesn't adapt when:
- New dice are added to the scene
- Dice layout changes
- User switches between different screen contexts

Current camera position (0.5, 5, 3) looking at (1, 0, 0) doesn't guarantee all dice are framed optimally.

## Constraints & Requirements
**Visual Constraints (User Preference):**
- Camera should be **slightly off-axis horizontally** (current X offset of 0.5 is good)
- Camera should be **off-axis in depth** (not directly looking from above)
- Camera should be **looking down** at dice (Y height of 5 with 3D position is good pitch)
- Maintain clean, professional framing without extreme angles

**Functional Requirements:**
- Auto-frame all visible dice in initial scene load
- When new dice are added, **smoothly dolly/zoom/pan** the camera to include them
- Work across different screen contexts (rolling screen, upgrade screen, etc.)
- Handle edge cases: 1 die, 2 dice, many dice

## Solution Approach

### Phase 1: Static Camera Framing (Quick)
**Goal**: On scene init, calculate camera position that frames all current dice while respecting visual constraints.

**Algorithm:**
1. Get bounding box of all dice in scene
2. Calculate camera position:
   - Maintain horizontal offset: `camera.x = boundingCenter.x + offsetX`
   - Maintain depth offset: `camera.z = boundingCenter.z + offsetZ` (behind dice)
   - Calculate Y to achieve desired pitch angle (looking down ~15-30°)
3. Adjust FOV or distance to ensure all dice fit in viewport
4. Constraints:
   - Preserve off-axis angle (don't move camera directly above/behind)
   - Ensure minimum/maximum distance from dice (prevent too-close or too-far framing)

**Files to Create/Modify:**
- `src/camera/FramingCalculator.ts` (new) — Pure framing math
  - `calculateCameraForBounds(boundingBox, constraints): CameraState`
  - Helper: `calculatePitchAngle(distance, height): angle`
- `src/camera.ts` — Call framing calculator on scene init
  - Replace hardcoded camera values with `calculateCameraForBounds(getAllDiceBounds())`

**Testing:**
- Unit test: 1, 2, 3, 5 dice at different positions → verify they fit
- Visual: Check that camera angle matches manual tuning

### Phase 2: Animated Camera Transitions (Medium)
**Goal**: When dice are added, smoothly animate camera to new framing.

**Algorithm:**
1. On dice addition, calculate new camera target
2. Animate from current to target using easing curve (e.g., cubic-in-out over 0.5s)
3. Optional: Zoom-out slightly before moving, then settle (feels more cinematic)

**Files to Create/Modify:**
- `src/camera/CameraAnimator.ts` (new) — Animation controller
  - `animateCameraTo(target: CameraState, duration: ms, easing?: EasingFn)`
  - Queue animations if multiple dice are added rapidly
- `src/thrower/index.ts` or rendering pipeline — Hook into dice-added events

**Testing:**
- Manual: Add dice one-by-one, verify smooth transitions
- Edge case: Rapid addition (spam-clicking) → queue correctly

### Phase 3: Context-Aware Framing (Future)
Different screens may need different framing:
- **Rolling screen**: Full 3D framing of active dice
- **Upgrade/trick screen**: Closer detail view with less depth offset
- **Bag management**: Multiple dice selection with grid layout

**Placeholder for later**: Add screen-context parameter to framing functions.

---

## Technical Details

### CameraState Contract
```typescript
interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
}
```

### Constraints Parameter
```typescript
interface FramingConstraints {
  horizontalOffsetPercent: number;  // 0.1 = 10% of bbox width
  depthOffsetPercent: number;       // How far behind bbox
  lookDownPitchDegrees: number;     // ~20-30° typical
  minDistance: number;              // Don't get too close
  maxDistance: number;              // Don't zoom out too far
}
```

### Dice Bounding Box Source
- Get from THREE.js `Box3().setFromObject()` on all dice meshes
- Cache until dice are added/removed

---

## Implementation Order

1. **FramingCalculator** (geometry + math, no dependencies on scene)
2. **Update camera.ts** to use FramingCalculator on init
3. **CameraAnimator** (animation, builds on FramingCalculator)
4. **Hook animation into dice-add event** (integration)
5. **Test & tune visual framing** (refinement)

---

## Unknowns to Resolve
- [ ] What is the exact pitch/look-down angle that looks best? (Measure from current manual setting or iterate)
- [ ] How many pixels of margin/padding should we add around dice? (20-30% common in UX)
- [ ] Should all dice stay centered, or should the camera favor the newest die?
- [ ] Is there a max number of dice where framing breaks down? (If yes, add strategy for many dice)

---

## Success Criteria
- ✅ 3-dice scene frames all dice cleanly
- ✅ Adding a 4th die smoothly pans/zooms camera to fit
- ✅ Off-axis look remains consistent (not overhead)
- ✅ No jarring transitions or clipping
- ✅ Works for 1-10 dice without major adjustment
