# F16: Camera Focus on Die Click + Mod Panel Dock

Status: Planned (Option B approved: dock existing DieModificationPanel; engine Panel migration deferred)

## Problem
Currently all dice are framed uniformly in the viewport. To inspect or edit a single die, users must manually coordinate camera + UI interactions. We need a click flow that focuses a die and opens the die modification panel as a docked sub-panel in the 3D screen, while preserving clean close behavior.

## Constraints & Requirements

**Functional Requirements:**
- Click on a die in the 3D viewport to focus the camera on it
- Focusing a die opens a docked die-mod sub-panel in the Roll 3D screen
- 3D canvas shrinks vertically to fit above the docked panel
- Docked panel animates in (slide up) while canvas resizes down
- Click outside die/empty space closes focus and closes docked panel
- Escape key closes focus and closes docked panel
- Preserve rapid-click behavior without jank
- The docked mod panel should be the long-term replacement for the existing global die-mod panel
- Prefer styling and behavior by role/function, not by persistent unique identity
- Product direction for this phase: Roll 3D is the default primary screen and tabs are slated for removal (single-screen flow)

**Visual Constraints (User Preference):**
- Focus mode should be tighter than all-dice framing
- Maintain established off-axis compositional feel
- Subtle alive camera motion in focus mode is desirable
- Depth of field feedback is desired, but deferred for later pass
- The docked panel should take only the vertical space it needs; the canvas uses the remaining height
- On narrow layouts, use min/max pixel heights for both canvas and panel; if both mins cannot fit, the layout may overflow/clip rather than invent a special mobile mode

**Edge Cases:**
- Single die in scene → focus already shows it; click should be no-op or deselect
- Die removed while focused → return to all-dice framing
- No dice at all → gracefully handle (no crash)

## Solution Approach

### Phase 1: Focus + Docked Panel Controller (Core Foundation)
Goal: Introduce a single controller that synchronizes camera focus state and docked panel visibility.

Files to Create/Modify:
- `src/camera.ts`
  - Becomes source of truth for focus open/close transitions
  - Emits focus changes to panel bridge (`focusedDieId` or null)
  - Preserves empty-space click and Escape close behavior
- `src/camera/DieClickHandler.ts` (existing)
  - Keep raycast resolution and click consume rules
  - Continue consuming only clicks that change focus state
  
Dependencies:
- Existing `getEntityForMesh()` from `src/rendering/EntityMeshRegistry.ts`
- Existing `DieModificationPanel` class in `src/ui/DieModificationPanel.ts`
- Existing Roll 3D screen host (`#roll-3d-screen`) in `src/index.html`

Testing:
- Manual: click die opens panel + focuses camera
- Manual: empty click/Escape closes panel + returns framing
- Manual: rapid click on different dice retargets without broken panel state

### Phase 2: Roll 3D Docked Panel Shell (Layout + Motion)
Goal: Create a Roll 3D local sub-layout where canvas and mod panel can animate without reusing legacy play mode layout rules.

Files to Create/Modify:
- `src/index.html`
  - Add Roll 3D dock structure placeholders (canvas host + dock host)
  - Avoid depending on a permanent unique id for the dock shell if a class-based hook is sufficient
- `src/styles/main.css`
  - Add Roll 3D focus-mode classes:
    - panel hidden state
    - panel entering/open/closing states
    - canvas flex-height transition
    - min/max height rules for canvas and docked panel
    - independent scroll container rules for the docked panel content
  - Keep animation duration aligned with camera transition (400ms)
- `src/ui/DieModificationPanel.ts`
  - Add public method to select die by id from external click flow
  - Add optional compact/docked render mode flag if needed
- `src/index.ts`
  - Wire panel bridge between camera focus events and DieModificationPanel instance
  - Ensure roll-3d screen mode owns this behavior only
  - Use a dock shell helper so the 3D screen can resize the canvas above the panel without hard-coding layout identity
  - Keep this phase on Option B: dock the existing DieModificationPanel in Roll 3D; do not migrate to engine Panel in F16

Testing:
- Manual: panel slides up while canvas shrinks
- Manual: panel closes and canvas expands on empty click/Escape
- Manual: clicked die is selected in panel each time

### Phase 3: Panel Selection + Camera Cohesion
Goal: Ensure clicked die selection in panel always matches focused die and remains stable across bag changes.

Files to Create/Modify:
- `src/ui/DieModificationPanel.ts`
  - Add `selectDieById(dieId: string): void`
  - Guard against missing die ids after removals
  - Keep current click behavior if the same die is clicked again (no special toggle semantics)
- `src/camera.ts`
  - On focused die removal, close focus and panel
  - Keep alive drift only when focused and panel open
  - Start drift only after the slide animation completes, then wait about 2s before easing into motion

Testing:
- Manual: die removed while focused -> clean close
- Manual: select different die while panel open -> retarget focus + selection

### Phase 4: DoF and Tunnel Vision (Deferred)
Goal: Add depth-of-field / edge blur focus feedback after core interaction ships.

Deferred Notes:
- Requires render-pipeline/postprocessing setup, not camera-only changes
- Candidate approach: EffectComposer + Bokeh/DoF pass + vignette/edge blur mask
- Keep out of initial implementation to reduce risk and unblock feature delivery

---

## Technical Details

### Raycast Implementation
```typescript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Normalize click coordinates to NDC [-1, 1]
mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

// Raycast from camera into scene
raycaster.setFromCamera(mouse, camera);
const intersections = raycaster.intersectObjects(scene.children, true);

// Check each intersection against entity registry
for (const hit of intersections) {
  const entity = getEntityForMesh(hit.object);
  if (entity && entity instanceof Die) {
    return entity; // Found a die
  }
}
```

### Focus + Panel State Machine
```typescript
type FocusUiState = {
  focusedDieId: string | null;
  panelOpen: boolean;
};

// Rules:
// 1) click die: focusedDieId = die.id, panelOpen = true
// 2) empty click or Escape: focusedDieId = null, panelOpen = false
// 3) focused die removed: focusedDieId = null, panelOpen = false
```

### Click Event Flow (Updated)
```
User clicks on die
  → DieClickHandler raycast
    → getEntityForMesh finds Die entity
      → focus controller sets focused die + opens panel
        → DieModificationPanel.selectDieById(die.id)
        → Calls animator.animateCameraTo(newState, 400ms)
          → roll-3d canvas transitions to smaller height
          → dock panel slides up
          → Smooth transition over 400ms
            → Camera zooms in on selected die
```

---

## Implementation Order

1. Focus state controller in `src/camera.ts`
2. Roll 3D dock container + CSS transitions
3. `DieModificationPanel` external selection API
4. Bridge wiring in `src/index.ts`
5. Manual QA and tune timing/spacing
6. DoF phase deferred (separate feature pass)

---

## Success Criteria
- ✅ Click on die → camera smoothly zooms in and centers on clicked die
- ✅ Click on die opens docked mod panel and selects that die
- ✅ Canvas shrinks smoothly to fit above docked panel
- ✅ Click outside die or press Escape → close panel and return to all-dice framing
- ✅ Multiple rapid clicks → queue and execute in order, no jank
- ✅ Die removed while focused → gracefully return to all-dice framing
- ✅ No crashes on edge cases (0 dice, 1 die, rapid add/remove/focus)
- ✅ Raycast works at any window size and camera position
- ✅ Core feature ships without DoF dependency

### Deferred Manual QA Checklist (Not Yet Executed)
- [ ] Rapid click retargeting across multiple dice while panel is opening/closing
- [ ] Focused die removal during open panel state returns to all-dice framing cleanly
- [ ] 0-dice state: no crash and stable close behavior
- [ ] 1-die state: click same die behavior remains stable (no accidental toggle/jank)
- [ ] Empty-space click and Escape both close panel and restore controls
- [ ] Dock open state hides Roll button and camera debug controls
- [ ] Easter egg isometric toggle swaps viewport mode without breaking focus flow

---

## Open Questions
- [x] Focus mode tighter than all-dice framing
- [x] Single click to focus; empty click/Escape to close
- [x] Keep subtle alive camera motion in focus mode
- [x] Orbit controls effectively disabled for this flow (leave placeholder comment)
- [x] DoF desired but deferred for later

### Implementation Notes From Your Answers
- The existing global die-mod panel is effectively legacy; F16 should move us toward the docked panel model instead of preserving both long-term.
- Focusing the same die again should keep the current behavior unless later code naturally changes it.
- The docked panel should size to its content, with the canvas taking the remaining vertical space.
- Use min/max pixel heights as guardrails on smaller layouts; if the viewport cannot fit both minimums, do not add a separate mobile overlay mode in this phase.
- The docked panel should scroll independently when its content exceeds its height.
- The alive camera drift should start only after the panel slide finishes, then wait roughly 2 seconds before beginning.

### Option B Decision (Locked for F16)
- Implement docking by reusing `src/ui/DieModificationPanel.ts` and making it dockable in the Roll 3D layout.
- Do not migrate to `engine/js/ui/Panel.ts` during F16.
- Treat engine-level panel migration as a separate follow-up feature after F16 ships.
- Rationale: lower implementation risk, faster delivery, avoids expanding scope into draft engine panel infrastructure.

### Remaining Implementation Questions
- [x] Which existing engine UI primitive should host the docked panel?
  - Answer: none for F16; use Option B and dock the existing DieModificationPanel.
- [x] Who owns open/close animation timing?
  - Answer: UI layer owns timing, and animation should be keyframe/interruptable in design.
  - F16 implementation note: provide start/open/close hooks from controller to UI and keep timing ownership in the docked panel behavior.

### Deferred Follow-up (Post-F16)
- Evaluate migration path from docked DieModificationPanel to engine `Panel` once engine UI panel primitives are no longer draft and lifecycle hooks are standardized.

### Forward Intent Notes
- if there is significantly more width in the screen's aspect ratio, have them side-by-side rather than above-and-below
- UI simplification intent: remove play-mode tabs for now and keep a single primary Roll 3D screen flow with docked interactions.
- Visualization intent: project die face probabilities directly into 3D space (near faces/regions) and add a controlled die spin mode that exposes all sides for approximately equal proportions of the rotation interval.
