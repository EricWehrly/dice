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

#### Task 2.1: Fix GameObjectInspector
- [ ] Create proper dice-to-mesh mapping system
- [ ] Store dice entities in a registry with their mesh UUIDs
- [ ] Update `getIntersects` to work with Entity-backed meshes
- [ ] Test right-click detection

**Files to modify**:
- `src/ui/GameObjectInspector.ts`
- `src/rendering/RenderingContextManager.ts` - Add entity mapping

#### Task 2.2: Enhance RotationViewer
- [ ] Add OrbitControls to RotationViewer camera
- [ ] Clone dice mesh for isolated display
- [ ] Add close button UI element
- [ ] Add ESC key handler to close viewer
- [ ] Prevent main scene interaction while viewer is open

**Files to modify**:
- `src/rendering/RotationViewer.ts`

#### Task 2.3: Connect Inspector to Engine System
- [ ] Update `handleContextMenu` to work with Engine entities
- [ ] Pass correct entity/mesh to RotationViewer
- [ ] Ensure proper cleanup when viewer closes

**Files to modify**:
- `src/ui/GameObjectInspector.ts`

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

**Option A: UUID Mapping in RenderingContextManager** (Recommended)
- Store `Map<string, Entity>` where key is mesh.uuid
- Update when adding dice to scene
- Query when raycasting hits a mesh

**Option B: Custom userData**
- Set `mesh.userData.entity = entity` when creating graphic
- Read from intersection results
- Simpler but less type-safe

**Recommendation**: Use Option A for better control and type safety.

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
2. Do we want dice to persist after throwing or fade out?
3. Should inspector have additional UI (stats, properties)?
4. Visual indicator for cooldown timer?

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
