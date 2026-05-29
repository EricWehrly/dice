# Dice Positioning & Scene Setup Analysis

## Current Dice Positions

### Lane Ordering (X-axis positioning)
**File:** [src/game/Bag.ts](src/game/Bag.ts#L116)

Active dice are positioned with X coordinate = index in the active dice list:
```typescript
// From Bag.applyLaneOrdering()
die.position.update(new Coordinate3D(index, die.position.y, die.position.z));
```

- **Die 1:** x = 0
- **Die 2:** x = 1 
- **Die 3:** x = 2

### Scene Position Scaling
**File:** [src/rendering/DiceGraphic.ts](src/rendering/DiceGraphic.ts#L23)

```typescript
private static readonly SCENE_POSITION_SCALE = 2;

// Mesh position = entity position * 2
this.graphic.position.x = (this.entity.position.x || 0) * DiceGraphic.SCENE_POSITION_SCALE;
this.graphic.position.y = (this.entity.position.y || 0) * DiceGraphic.SCENE_POSITION_SCALE;
this.graphic.position.z = (this.entity.position.z || 0) * DiceGraphic.SCENE_POSITION_SCALE;
```

**Actual 3D Scene Positions (in THREE.js world coordinates):**
- **Die 1:** x = 0, y = 0 (default), z = 0 (default) → **Scene: (0, 0, 0)**
- **Die 2:** x = 1, y = 0, z = 0 → **Scene: (2, 0, 0)**
- **Die 3:** x = 2, y = 0, z = 0 → **Scene: (4, 0, 0)**

The 3 dice are arranged in a line along the X-axis: **[0, 2, 4]** in world space.

---

## Current Scene Setup & Bounds

### Scene Configuration
**File:** [engine/js/rendering/contexts/ThreeJS.RenderContext.ts](engine/js/rendering/contexts/ThreeJS.RenderContext.ts#L60-L115)

```typescript
private _scene: THREE.Scene;

get scene(): Readonly<THREE.Scene> { 
    this.init();
    return this._scene; 
}

// In init():
this._scene = new THREE.Scene();
this._scene.background = new THREE.Color('#606060');
```

- **Scene exists but has no explicit bounds constraints**
- Background color is dark gray (`#606060`)
- Scene lights managed by [src/rendering/lighting.ts](src/rendering/lighting.ts)

### Initial Camera Position & Target
**File:** [src/camera.ts](src/camera.ts#L151-L159)

The roll-3d camera is initialized with:

```typescript
const diceMainCamera = new ThreeCam({
    name: 'dice-main',
    cameraType: CameraType.PERSPECTIVE,
    enableControls: true,
    position: new THREE.Vector3(0.5, 5, 3),    // Positioned above/behind dice
    target: new THREE.Vector3(1, 0, 0),        // Looks at center-ish area
    fov: 45,
    near: 0.1,
    far: 1000,
});
```

**Camera frustum:** 
- Field of View: 45°
- Near plane: 0.1 units
- Far plane: 1000 units
- Looking at position (1, 0, 0) from position (0.5, 5, 3)

This frame is roughly centered on Die 1 and Die 2 (x positions 0-2).

---

## How Dice Are Added to the THREE.js Scene

### Automatic Entity-to-3D Rendering Pipeline
**File:** [engine/js/rendering/entities/entity-3d-graphics.ts](engine/js/rendering/entities/entity-3d-graphics.ts#L50-L135)

1. **DiceGraphic registered as renderer** ([src/rendering/DiceGraphic.ts](src/rendering/DiceGraphic.ts#L34)):
   ```typescript
   static {
       registerEntity3DRenderer(Die, DiceGraphic);
   }
   ```

2. **Dice created via EntityBuilder** ([src/thrower/input.ts](src/thrower/input.ts#L15-L25)):
   ```typescript
   const diceEntity = createEntity()
       .withOptions({
           name: 'Thrown Dice',
           position: spawnPosition,
           faceCount: 6,
           foreColor: Colors.dodgerblue,
           backColor: Colors.antiquewhite
       })
       .build();
   ```

3. **Thrown Dice Spawn Position** ([src/thrower/input.ts](src/thrower/input.ts#L8-L14)):
   ```typescript
   const DISTANCE_BEHIND_CAMERA = 8;
   
   const spawnPosition = {
       x: camera.position.x,           // Spawn at camera X
       y: camera.position.y + 5,       // 5 units above camera
       z: camera.position.z + DISTANCE_BEHIND_CAMERA  // 8 units behind
   };
   ```
   
   **For default camera at (0.5, 5, 3):**
   - Spawn position: (0.5, 10, 11) in entity space
   - Scene position: (1, 20, 22) after 2x scaling

4. **Initial bag dice positioning** ([src/index.ts](src/index.ts#L37-L44)):
   ```typescript
   const bag = new Bag();
   bag.addDie(MakeDieCharacter([DieEquippedMixin]));  // Die 1 at x=0
   bag.addDie(MakeDieCharacter([DieEquippedMixin]));  // Die 2 at x=1
   bag.addDie(MakeDieCharacter([DieEquippedMixin]));  // Die 3 at x=2
   ```

### Mesh Creation & Scene Addition
**File:** [engine/js/rendering/entities/entity-3d-graphics.ts](engine/js/rendering/entities/entity-3d-graphics.ts#L56-L125)

```typescript
export function registerEntity3DRenderer(
    entityType: typeof Entity,
    rendererType: typeof EntityGraphicThree
): void {
    // Registers DiceGraphic to render Die objects
}

// During render loop:
const scene = context.scene as THREE.Scene;
const graphic = new DiceGraphic(entity);
const mesh = graphic.createGraphic();
scene.add(mesh);  // ← Mesh added to scene automatically
```

---

## Existing Bounds & Camera Framing Logic

### No Automatic Bounds Calculation
**Status:** ❌ Does NOT exist

After searching the entire codebase:
- No `getBoundingBox()`, `calculateBounds()`, or `getExtents()` functions for dice
- No Three.js `Box3` usage for computing scene extents
- No camera fitting/framing algorithm to auto-zoom to dice

### Manual Orthographic Frustum
**File:** [engine/js/rendering/Threecam.ts](engine/js/rendering/Threecam.ts#L209-L220)

The orthographic camera option includes a hardcoded frustumSize, but it's not used by the roll-3d scene:

```typescript
export const ORTHOGRAPHIC_CAMERA_OPTIONS: Readonly<ThreeCamOptions> = {
    cameraType: CameraType.ORTHOGRAPHIC,
    enableControls: false,
    position: DEFAULT_POSITION,  // (10, 10, 10)
    target: DEFAULT_TARGET,      // (0, 0, 0)
    frustumSize: 20              // ← Hardcoded, not adaptive
};

private _createOrthographicCamera(frustumSize: number): THREE.OrthographicCamera {
    const aspect = this._aspectRatio;
    return new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
}
```

### Partial Bounds Logic in 2D Renderer
**File:** [src/rendering/2d/DieIsometricRenderer.ts](src/rendering/2d/DieIsometricRenderer.ts#L373)

Comment indicating viewport fit logic exists for 2D, but not 3D:
```typescript
// Fit vertically to fully use the viewport, while still honoring width bounds.
```

---

## Summary

| Aspect | Current State |
|--------|--------------|
| **Die 1 Position** | Entity: (0, 0, 0) → Scene: (0, 0, 0) |
| **Die 2 Position** | Entity: (1, 0, 0) → Scene: (2, 0, 0) |
| **Die 3 Position** | Entity: (2, 0, 0) → Scene: (4, 0, 0) |
| **Die Spacing** | 2 units apart in scene space (X-axis only) |
| **Scene Bounds** | None explicitly defined |
| **Camera Position** | (0.5, 5, 3) looking at (1, 0, 0) |
| **Camera Type** | Perspective (45° FOV) with orbit controls |
| **Bounds Calculation** | ❌ Not implemented - camera is manually positioned |
| **Auto-Fit to Dice** | ❌ Not implemented - would need Box3 + camera math |

---

## To Implement Camera Framing:

Would need to:
1. Collect all scene objects using `THREE.Box3` geometry traversal
2. Calculate combined bounding box
3. Adjust camera position/zoom based on diagonal distance
4. Consider aspect ratio for proper framing (cf. `calculateBounds()` in most 3D engines)

See **F04-camera-profile.md** for feature planning related to camera management.
