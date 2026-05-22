# Dual Scene Upgrade Plan - Dice Game

## Current State Analysis

### What Works
1. **src/thrower/** - A standalone system that:
   - Creates a dice on left-click
   - Animates dice with parabolic arc + rattle
   - Uses its own `RenderingContextManager` instance
   - Has a working left-click handler

2. **src/index.ts** - Uses the Engine system:
   - Creates dice entities via `createEntity()` builder
   - Uses Engine's event system and Entity management
   - Integrates with ThreeJSRenderContext
   - Creates static dice in the scene

3. **src/ui/GameObjectInspector.ts** - Partial inspector:
   - Has `RotationViewer` class for separate canvas
   - Has context menu handler
   - Currently has issues with object mapping

### What's Broken/Incomplete
1. **Scene Separation**: Two competing systems (thrower vs engine)
2. **GameObjectInspector**: Not properly connected to track dice
3. **OrbitControls**: Not integrated with RotationViewer
4. **Right-Click Inspector**: Not functional due to mapping issues
5. **Cooldown System**: Not implemented for left-click dice throwing
6. **Scene Mode**: No concept of "detail mode" vs "throw mode"

### Current Decision (May 2026)
- Defer full inspector modal implementation on dice side until engine provides reusable modal/screen capabilities.
- Keep incremental groundwork in dice:
    - Entity mesh lookup registry (`src/rendering/EntityMeshRegistry.ts`)
    - Right-click entity resolution in `src/ui/GameObjectInspector.ts`
- Prioritize lower-effort migration increments (throw input, cooldown UI, throw reset behavior) before revisiting full inspector UI.
- Legacy local-context implementation removed:
        - `src/rendering/RenderingContextManager.ts` (deleted)
        - `src/rendering/RotationViewer.ts` (deleted)
    Any inspector UI details from those files are tracked in feature docs instead of code references.

---

## Goal: Two Scene System

### Scene 1: Main Throwing Scene
- **Purpose**: Primary gameplay - throw and view dice
- **Features**:
  - Left-click to create and throw a new dice (2s cooldown)
  - Right-click on dice to open inspector
  - Multiple dice can exist simultaneously
  - Uses Engine's Entity system for dice management
  - Static OrbitControls for free camera movement

### Scene 2: Inspector Scene (Detail View)
- **Purpose**: Detailed inspection of a single dice
- **Features**:
  - Large canvas overlay with just the selected dice
  - OrbitControls centered on the dice
  - Close button/ESC to exit back to main scene
  - Isolated rendering context
  - Can rotate and examine dice closely

---

## Upgrade Plan

### Phase 1: Consolidate Systems
**Goal**: Use Engine's entity system everywhere, remove thrower duplication

#### Task 1.1: Refactor Thrower to Use Engine Entities
- [ ] Move `createCubeAtCursor` logic from `src/thrower/input.ts` to use Engine entities
- [ ] Use `ThreeJSRenderContext.Instance` instead of separate `RenderingContextManager`
- [ ] Ensure DiceGraphic integration works with Engine's rendering
- [ ] Keep animation sequencer (parabolic + rattle) working

**Files to modify**:
- `src/thrower/input.ts` - Update to use Engine entities
- `src/thrower/index.ts` - Update initialization

#### Task 1.2: Consolidate into Single Entry Point
- [ ] Move thrower initialization into `src/index.ts`
- [ ] Add left-click handler to main scene setup
- [ ] Remove duplicate renderer/camera setup

**Files to modify**:
- `src/index.ts` - Add thrower input handling
- Consider removing `src/thrower/index.ts` or simplifying

---

### Phase 2: Implement Inspector System
**Goal**: Working right-click inspector with orbit controls

> Status update: **Partially deferred**. Task 2.1 groundwork is in place; Tasks 2.2+2.3 are blocked by engine-level UI/screen capability requirements.

#### Task 2.1: Fix GameObjectInspector
- [x] Create proper dice-to-mesh mapping system
- [x] Store dice entity id in mesh userData for raycast resolution
- [x] Update `getIntersects` path to resolve Entity from raycast hit
- [x] Add right-click detection logging for verification

**Files to modify**:
- `src/ui/GameObjectInspector.ts`
- `src/rendering/EntityMeshRegistry.ts`

#### Task 2.2: Enhance RotationViewer
- [ ] Deferred: replace with engine-level inspector screen capability track (see feature docs)

**Files to modify**:
- [docs/features/F03-inspector-selection.md](features/F03-inspector-selection.md)

#### Task 2.3: Connect Inspector to Engine System
- [x] Update `handleContextMenu` to work with Engine entities
- [ ] Deferred: full inspector scene/screen wiring after engine capability definition

**Files to modify**:
- `src/ui/GameObjectInspector.ts`

#### Task 2.4: Engine Capability Requirements (New)
- [ ] Define engine modal lifecycle API (open/close hooks, focus, escape handling)
- [ ] Define render suspension policy for main scene during modal/screen transitions
- [ ] Define secondary scene/screen pattern for detail views (inspectors, menus, dialogs)
- [ ] Add minimal example in engine docs demonstrating scene/screen switching

**Ownership split**:
- Engine repo roadmap: capability definition and reusable implementation
- Dice repo roadmap: integrate inspector once engine capabilities exist

---

### Phase 3: Add Input Management
**Goal**: Proper cooldowns and mode handling

#### Task 3.1: Create InputManager Class
- [ ] Singleton input manager
- [ ] Track last throw time for cooldown
- [ ] Track current mode (normal vs detail/inspector)
- [ ] Disable throws when in inspector mode

**New file**: `src/controls/InputManager.ts`

```typescript
export class InputManager {
    private static instance: InputManager;
    private lastThrowTime: number = 0;
    private isInspecting: boolean = false;
    
    static get Instance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }
    
    canThrow(): boolean {
        const now = Date.now();
        const cooldown = 2000; // 2 seconds
        return !this.isInspecting && (now - this.lastThrowTime) > cooldown;
    }
    
    recordThrow(): void {
        this.lastThrowTime = Date.now();
    }
    
    setInspecting(value: boolean): void {
        this.isInspecting = value;
    }
}
```

#### Task 3.2: Integrate InputManager
- [ ] Use `InputManager` in left-click handler
- [ ] Use `InputManager` when opening/closing inspector
- [ ] Add visual feedback for cooldown (optional but nice)

**Files to modify**:
- `src/index.ts` - Left-click handler
- `src/ui/GameObjectInspector.ts` - Inspector open/close

---

### Phase 4: Polish & Testing
**Goal**: Clean up, test, and document

#### Task 4.1: Clean Up Code
- [ ] Remove unused thrower code if fully migrated
- [ ] Remove duplicate rendering contexts
- [ ] Add proper TypeScript types everywhere
- [ ] Add JSDoc comments

#### Task 4.2: Testing
- [ ] Test left-click dice creation with cooldown
- [ ] Test right-click inspector opening
- [ ] Test inspector controls (orbit, close)
- [ ] Test multiple dice in scene
- [ ] Test ESC key to close inspector
- [ ] Test that throws are disabled in inspector mode

#### Task 4.3: Documentation
- [ ] Update README with new features
- [ ] Document input controls
- [ ] Add architecture notes about dual-scene system

---

## Implementation Order

### Priority 1 (Critical Path)
1. **Phase 1, Task 1.1**: Consolidate to Engine entities
2. **Phase 2, Task 2.1**: Fix entity-to-mesh mapping
3. **Phase 2, Task 2.2**: Working inspector with OrbitControls

### Priority 2 (Core Features)
4. **Phase 1, Task 1.2**: Single entry point
5. **Phase 3, Task 3.1**: InputManager implementation
6. **Phase 3, Task 3.2**: Integrate InputManager

### Priority 3 (Polish)
7. **Phase 4**: All testing and cleanup tasks

---

## Technical Notes

### Mapping Strategy
The key issue is tracking which THREE.Mesh belongs to which Entity. Options:

Current implementation uses userData-based entity id tagging and resolves typed Entity in registry helpers.
Reference: [docs/features/F03-inspector-selection.md](features/F03-inspector-selection.md)

### OrbitControls Integration
```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// In RotationViewer constructor:
this.controls = new OrbitControls(this.camera, this.renderer.domElement);
this.controls.enableDamping = true;
this.controls.dampingFactor = 0.05;

// In animate loop:
this.controls.update();
```

### Close Button UI
```typescript
// Add to RotationViewer:
const closeButton = document.createElement('button');
closeButton.textContent = 'X';
closeButton.style.position = 'absolute';
closeButton.style.top = '10px';
closeButton.style.right = '10px';
closeButton.onclick = () => this.close();
this.container.appendChild(closeButton);
```

---

## Success Criteria

- ✅ Left-click creates and throws dice with 2s cooldown
- ✅ Right-click on any dice opens inspector
- ✅ Inspector shows isolated dice with working OrbitControls
- ✅ ESC or close button exits inspector
- ✅ No duplicate rendering systems
- ✅ All entity management through Engine
- ✅ Throws disabled while inspecting
- ✅ Multiple dice can coexist in main scene

---

## Migration Notes

### Breaking Changes
- Remove standalone `ThrowRenderer` class
- Thrower system becomes a set of utility functions
- All rendering through `ThreeJSRenderContext.Instance`

### Preserved Features
- Animation system (parabolic + rattle)
- Dice creation and configuration
- Entity builder pattern
- DiceGraphic renderer

### New Dependencies
- OrbitControls from three.js examples
- Possibly refine InputManager if patterns emerge

---

## Future Enhancements (Out of Scope)
- Multiple dice selection
- Dice physics/collision
- Dice result display (showing face value)
- Save/load dice configurations
- Multiplayer dice rolling
- Sound effects
- Particle effects on landing

---

## Questions to Resolve
1. Should we keep `GameObject` base class or migrate fully to Engine's Entity?
strongly prefer to migrate to entity
2. Do we want dice to persist after throwing or fade out?
persist, but reset (snap visibility change is fine for now) on new throw.
3. Should inspector have additional UI (stats, properties)?
Yeah. 
In an ideal scenario:
- the inspector is a modal
- pauses rendering of the scene below
- takes up most of the screen, but has a dedicated 'dismiss' button (x) like a modal, maybe also a border/frame
- the inspector is maybe subdivided into the dice preview area, and this stats section (ideally like 80:20 display share)
- ideally responsive (stats cuts into whichever there's more of: width or height)
4. Visual indicator for cooldown timer?
a circle / very simple sweeping clock type visual
circle with solid color background, very low opacity
overlay circle with slight edge (like an hour hand on a clock) shows "progress" has much higher opacity of same color, fills clockwise to animate progress

---

## Commit Strategy

### Commit 1: Consolidate Entity System
- Phase 1, Task 1.1 complete
- All dice use Engine entities
- Single rendering context

### Commit 2: Working Inspector
- Phase 2 complete
- Right-click opens inspector
- OrbitControls working

### Commit 3: Input Management
- Phase 3 complete
- Cooldowns working
- Mode switching functional

### Commit 4: Polish & Testing
- Phase 4 complete
- Documentation updated
- All tests passing
