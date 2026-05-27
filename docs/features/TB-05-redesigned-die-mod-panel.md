# TB-05 Redesigned — Die Modification Panel (Isometric Die + Exploded Carousel Install Flow)

**Context**: Major UX redesign of the die modification panel to simplify the interaction model and showcase the die visually in isometric perspective.

---

## Executive Summary

**Current state (before redesign):**
- Flat carousel strip of die faces
- All faces visible at once
- Per-face selector always present
- Style as separate dropdown
- User selects face first, then applies mods

**Desired state (after redesign):**
- Isometric 2D die rendering showing multiple faces
- Faces only expanded when a core mod is selected
- Collapsed by default: just die + core mod selector
- Style rendered on the die itself (textures + pip icon styling in projection)
- User selects mod first, then chooses a face in exploded carousel and presses Install
- Better fit for future 3D migration

**Major changes:**
1. **Rendering**: Hybrid view
  - Collapsed: Isometric die (still 2D canvas)
  - Expanded: Existing exploded face carousel with probabilities
2. **Layout & State**: Always-expanded → Collapsed/expanded modes
3. **Interaction**: Face-first → Mod-first workflow with button-based install
4. **Scope**: Phase 2 of core mod system (Phase 1 is basic install/uninstall)

---

## Architecture Overview

### Current Structure
```
DieModificationPanel.ts (orchestrator)
  ├── DieModificationPanelTemplate.ts (renders face carousel + mod/style selectors)
  └── DieModificationCanvasRenderer.ts (draws flat tile carousel)
      └── DieFaceTileRenderer.ts (shared tile drawing)
```

### Proposed Structure
```
DieModificationPanel.ts (orchestrator + state machine)
  ├── DieModificationPanelTemplate.ts (renders mode-specific UI)
  │   ├── "collapsed" mode: die + core mod selector
  │   └── "expanded" mode: exploded carousel + face chooser + install/cancel actions
  ├── DieIsometricRenderer.ts (NEW: 2D isometric die drawing)
  ├── DieModificationCanvasRenderer.ts (existing exploded face carousel renderer)
  ├── DieFaceTileRenderer.ts (unchanged: tile drawing primitives)
  └── ModSelectionHandler.ts (optional state machine helper)
```

**Key insight**: The panel enters an "expanded" mode when a core mod is selected, showing the exploded carousel for face targeting. Install returns the panel to "collapsed" mode.

---

## State Machine

### States

```
COLLAPSED
├─ User selects a core mod (e.g., "Weight")
└─→ EXPANDING (animate if desired)
    └─→ EXPANDED
    ├─ User chooses target face (selector/buttons tied to exploded view)
    ├─ User presses Install
    └─→ INSTALLING
            └─→ COLLAPSED (mod installed to selected face, panel closes expansion)

EXPANDED
├─ User presses "Cancel"
└─→ COLLAPSING (optional minimal transition)
  └─→ COLLAPSED (selection cleared)
```

**Variables to track:**
- `panelMode: 'collapsed' | 'expanded'`
- `selectedCoreMod: string | null` (e.g., 'weight', 'spin', etc.)
- `selectedTargetFaceIndex: number | null` (-1 for core, 0..faceCount for faces)
- `installingFaceIndex: number | null` (optional temporary UI feedback)

---

## Rendering Strategy

### Isometric Die View

**Goal**: Show a die in 2D isometric projection so ~3 faces are visible at once, giving a 3D impression.

**Approach**: 
- Treat the die as a cube with 6 faces
- Project 3 visible faces (typically top, right, front or similar) using isometric math
- Render style details (textures/pips/orientation cues) directly on visible faces
- Keep probability overlay in expanded exploded view (not required in collapsed isometric view)

**Canvas dimensions**:
- Make the die large enough to be readable (e.g., 200px cube size in isometric)
- Padding around for labels/interaction hints

**Implementation**:
1. Calculate isometric projection coordinates for each face vertex
2. Draw each visible face as a parallelogram (transformed rectangle)
3. Apply shading/depth to make it look 3D
4. Overlay face number and probability text
5. Highlight on hover; show selection state when a face is being installed

**Face visibility**:
- For a standard isometric view, show:
  - **Top face** (1 visible face area)
  - **Right face** (1 visible face area)
  - **Front face** (1 visible face area)
- This matches the classic isometric die perspective
- Core mod indicator (orb, gem, etc.) rendered on one visible face or centered

**2D coordinates mapping**:
```
            Top
           /   \
        /       \ 
       /         \
      +-----+     \
      |     |      \
      |  R  |       +---+
      |  i  |      /    |
      |  g  |     /  F  |
      |  h  |    |  r  |
      |  t  |    |  o  |
      +-----+----+ n  |
            |     | t  |
            +-----+-----+
```

---

## UI Layout

### Collapsed Mode
```
┌─────────────────────────────────┐
│   Die Modification Panel        │
├─────────────────────────────────┤
│                                 │
│      [Isometric Die View]       │
│      (showing current style     │
│       + installed mods)         │
│                                 │
├─────────────────────────────────┤
│ Core Mod: [Weight ▼]            │
│           [Spin    ]            │
│           [Balance ]            │
│                                 │
│ Face Style: [Glossy ▼]          │
│ (global, not per-face by def.)  │
└─────────────────────────────────┘
```

### Expanded Mode (Mod Selected)
```
┌─────────────────────────────────┐
│   Die Modification Panel        │
├─────────────────────────────────┤
│                                 │
│  Installing: Weight             │
│                                 │
│  [Exploded Face Carousel]       │
│  [with probabilities + deltas]  │
│                                 │
│  Target Face: [Face 3 ▼]        │
│                                 │
├─────────────────────────────────┤
│ [Cancel]              [Install] │
└─────────────────────────────────┘
```

---

## File Changes & Implementation Plan

### Phase 1: Infrastructure & Rendering

#### New file: `src/rendering/2d/DieIsometricRenderer.ts`

Responsible for drawing an isometric die with the following interface:

```typescript
export interface IsometricDieRenderInput {
  root: HTMLElement;
  faceCount: number;
  currentCoreMod: string | null;         // e.g., 'weight', null if none
  coreModInstalledOnFace: number | null; // -1 for core, 0..n for face index
  style: string;                         // e.g., 'glossy', 'matte'
}

export class DieIsometricRenderer {
  render(input: IsometricDieRenderInput): void {
    // Draw die in isometric view
    // Show ~3 faces with style details (textures/pips/orientation)
    // Display current mod placement when present
  }
}
```

**Implementation details**:
- Use canvas 2D context (same as carousel)
- Isometric projection math: `screen = {x: worldX - worldY, y: (worldX + worldY) / 2}`
- Each face is a quadrilateral; draw with fills + outlines
- Apply lighting/shading to create depth illusion
- Label each visible face with number and probability
- Draw core mod indicator (small orb/gem) on appropriate face or center

#### Update: `src/ui/DieModificationPanelTemplate.ts`

Add conditional rendering based on panel mode:

```typescript
function renderDieModPanel(state: DieModPanelState): string {
  if (state.panelMode === 'collapsed') {
    return renderCollapsedMode(state);
  } else {
    return renderExpandedMode(state);
  }
}

function renderCollapsedMode(state: DieModPanelState): string {
  return `
    <div class="die-mod-panel">
      <div class="die-mod-isometric-container">
        <canvas id="die-iso-canvas"></canvas>
      </div>
      <div class="die-mod-controls">
        <label>Core Mod:
          <select>${/* core mod options */}</select>
        </label>
        <label>Style:
          <select>${/* style options */}</select>
        </label>
      </div>
    </div>
  `;
}

function renderExpandedMode(state: DieModPanelState): string {
  return `
    <div class="die-mod-panel die-mod-panel--expanded">
      <p>Installing: ${state.selectedCoreMod}</p>
      <div class="die-mod-face-carousel-container">
        <canvas id="die-mod-canvas"></canvas>
      </div>
      <label>
        Target Face
        <select data-target-face-select>${/* face options */}</select>
      </label>
      <div class="die-mod-actions">
        <button id="cancel-mod-install">Cancel</button>
        <button id="install-mod">Install</button>
      </div>
    </div>
  `;
}
```

**Key changes**:
- Keep per-face selection out of collapsed mode
- Keep exploded carousel only in expanded mode
- Add mode-specific UI (collapsed isometric display, expanded install controls)
- Add explicit cancel/install actions

#### Update: `src/ui/DieModificationPanel.ts`

Orchestrate state machine and coordinate renderer:

```typescript
export class DieModificationPanel {
  private panelMode: 'collapsed' | 'expanded' = 'collapsed';
  private selectedCoreMod: string | null = null;
  private selectedTargetFaceIndex: number | null = null;
  private isometricRenderer = new DieIsometricRenderer();
  private canvasRenderer = new DieModificationCanvasRenderer();

  private onCoreModChange(modId: string) {
    if (this.panelMode === 'collapsed') {
      this.selectedCoreMod = modId;
      this.selectedTargetFaceIndex = this.getCurrentFaceForMod(modId);
      this.panelMode = 'expanded';
      this.render();
    }
  }

  private onInstall() {
    if (this.panelMode === 'expanded' && this.selectedCoreMod) {
      this.installModToFace(this.selectedCoreMod, this.selectedTargetFaceIndex ?? -1);
      this.selectedCoreMod = null;
      this.selectedTargetFaceIndex = null;
      this.panelMode = 'collapsed';
      this.render();
    }
  }

  private onCancel() {
    this.selectedCoreMod = null;
    this.selectedTargetFaceIndex = null;
    this.panelMode = 'collapsed';
    this.render();
  }

  private render() {
    const root = this.getRootElement();
    const template = renderDieModPanel({
      panelMode: this.panelMode,
      selectedCoreMod: this.selectedCoreMod,
      // ... other state
    });
    root.innerHTML = template;

    // Re-attach event listeners
    this.attachEventListeners();

    if (this.panelMode === 'collapsed') {
      this.isometricRenderer.render({ /* collapsed die view */ });
    } else {
      this.canvasRenderer.render({ /* expanded exploded face view */ });
    }
  }

  private attachEventListeners() {
    // Core mod selector change
    const modSelect = this.getRootElement().querySelector('[data-core-mod-select]');
    if (modSelect) {
      modSelect.addEventListener('change', (e) => {
        this.onCoreModChange((e.target as HTMLSelectElement).value);
      });
    }

    // Target face selection in expanded mode
    const targetFaceSelect = this.getRootElement().querySelector('[data-target-face-select]') as HTMLSelectElement | null;
    if (targetFaceSelect) {
      targetFaceSelect.addEventListener('change', (e) => {
        this.selectedTargetFaceIndex = Number((e.target as HTMLSelectElement).value);
      });
    }

    // Cancel button
    const cancelBtn = this.getRootElement().querySelector('#cancel-mod-install');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.onCancel());
    }

    const installBtn = this.getRootElement().querySelector('#install-mod');
    if (installBtn) {
      installBtn.addEventListener('click', () => this.onInstall());
    }
  }
}
```

**State management**:
- `panelMode` controls template and interaction
- `selectedCoreMod` stores the mod being installed
- `selectedTargetFaceIndex` stores install target while expanded
- Event handlers transition between states

#### Update: `src/styles/die-mod-panel.css`

Add styles for isometric container and expanded mode:

```css
.die-mod-isometric-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 320px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.05), rgba(0,0,0,0.15));
  border-radius: 8px;
}

.die-mod-isometric-container canvas {
  display: block;
  cursor: pointer;
}

.die-mod-panel--expanded {
  /* Highlight expanded mode with border or shading */
  border: 2px solid var(--color-gold-trim);
  padding: 16px;
}

.die-mod-hint {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  margin: 8px 0;
}

.die-mod-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.die-mod-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid var(--color-counter-border);
  background: var(--color-panel-bg);
  color: var(--color-text-primary);
  cursor: pointer;
}

.die-mod-actions button:hover {
  background: color-mix(in srgb, var(--color-panel-bg) 80%, var(--color-gold-trim) 20%);
}
```

### Phase 2: Install Flow + Mod Target Semantics

- Treat `face` as a property of the selected mod (not vice versa)
- Expand only when a core mod is selected
- Allow face targeting via UI controls tied to exploded view
- Commit changes with explicit Install action
- On uninstall, clear the mod and its stored face target
- Do not implement move yet; reinstall to a new face is acceptable

### Phase 3: Styling & Polish

- Keep motion minimal; simple and informative transitions only
- Optional small polish animation allowed if low risk and subtle
- Ensure isometric rendering is performant and visually appealing
- No keyboard-based face selection

---

## Data Flow

### State → Render → Interaction Loop

```
User selects core mod
  ↓
onCoreModChange(modId)
  ├─ selectedCoreMod = modId
  ├─ selectedTargetFaceIndex = current face for that mod (or default)
  ├─ panelMode = 'expanded'
  └─ render()
    ├─ renderDieModPanel() → template
    ├─ attachEventListeners()
    └─ canvasRenderer.render() (exploded face view)

User changes Target Face
  ↓
target face selector
  └─ selectedTargetFaceIndex = chosen face

User clicks Install
  ↓
onInstall()
  ├─ installModToFace(selectedCoreMod, selectedTargetFaceIndex)
  ├─ selectedCoreMod = null
  ├─ selectedTargetFaceIndex = null
  ├─ panelMode = 'collapsed'
  └─ render() (isometric view)

User clicks Cancel
  ↓
onCancel()
  ├─ selectedCoreMod = null
  ├─ selectedTargetFaceIndex = null
  ├─ panelMode = 'collapsed'
  └─ render()
```

---

## Visual Design Notes

### Isometric Projection Formula

For a cube with vertices at origin, height H, width W, depth D:

```typescript
function project(x3d: number, y3d: number, z3d: number): {x: number, y: number} {
  // Standard isometric angles
  const isoAngle = Math.PI / 6; // 30 degrees
  const x2d = x3d * Math.cos(isoAngle) - z3d * Math.cos(isoAngle);
  const y2d = y3d + (x3d + z3d) * Math.sin(isoAngle);
  return {x: x2d, y: y2d};
}
```

### Face Shading

To enhance the 3D look:
- **Top face**: Brightest (fully lit from above)
- **Right face**: Medium brightness (side lighting)
- **Front face**: Darker (away from light source)

Use slight color shifts or alpha variations on face fills.

### Core Mod Indicator

- Show a small gem/orb icon on the face where the core mod is installed
- If no mod installed yet, show a placeholder or leave it empty
- Animation: subtle glow or rotation when hovered/selected

---

## Testing Strategy

### Unit Tests

- `DieIsometricRenderer.test.ts`: Test isometric projection math and visual layer mapping
- `DieModificationPanel.test.ts`: Test state transitions (collapsed ↔ expanded)
- `ModSelectionHandler.test.ts`: Test mod→face installation logic and uninstall clearing

### Integration Tests

- State machine transitions on dropdown + button actions
- Correct rendering of die in collapsed mode and exploded view in expanded mode
- Install applies selected mod to selected target face
- Return to collapsed mode after installation

### Visual/Manual Tests

- Isometric die looks 3D and intuitive
- Hover effects are responsive
- Expanded mode is clearly distinguished from collapsed
- Text/labels are readable at intended size

---

## Migration Path from Current Code

### What stays the same

- `DieFaceTileRenderer.ts` (can still draw individual tiles if needed for other UIs)
- `DiceCanvasRenderer.ts` (main dice roll canvas, separate from mod panel)
- Trick system, probability system, core logic

### What changes completely

- `DieModificationCanvasRenderer.ts` → **Repurposed for expanded face-targeting mode**
- `DieModificationPanelTemplate.ts` → **Refactored** (mode-based templates)
- `DieModificationPanel.ts` → **Refactored** (new state machine)

### What's added

- `DieIsometricRenderer.ts` (NEW: isometric die rendering)
- `ModSelectionHandler.ts` (optional state machine helper, or inline if simple)

---

## Decisions Locked

General guidance:
- Keep interaction simple, straightforward, and informative.
- Keep motion minimal because this UI is expected to migrate toward 3D.

Resolved decisions:
1. Use explicit buttons. No canvas click hit-testing for install in this phase.
2. Keep exploded carousel as the expanded face-targeting view.
3. Keep an Install button in expanded mode.
4. Uninstall clears the installed mod and its face target directly (no expansion flow).
5. Treat face as a property of the mod (not mod as a property of a face).
6. Do not implement move yet; use uninstall + reinstall for reassignment.
7. Style should render directly on the isometric die (textures, pips, orientation).
8. Skip keyboard face selection.
9. Only one mod selected at a time via dropdown.

---

## Success Criteria

- [ ] Isometric die renders correctly with ~3 visible faces
- [ ] Collapsed mode shows die + core mod selector + style selector
- [ ] Selecting core mod → expanded mode with exploded face view + probabilities
- [ ] Selecting target face + pressing Install applies mod to that face
- [ ] Returns to collapsed mode after installation
- [ ] Cancel button closes expansion without installing
- [ ] Uninstall clears mod + face target for that mod
- [ ] No regressions to existing dice/trick rendering
- [ ] Tests pass for state machine and install flow
- [ ] Visual design is polished and intuitive

---

## Timeline Estimate

- **Phase 1 (Infrastructure)**: ~4–6 hours (isometric renderer, template, state machine)
- **Phase 2 (Interaction)**: ~2–3 hours (install controls, target-face wiring, event handlers)
- **Phase 3 (Polish)**: ~1–2 hours (styling, animations, edge cases)
- **Testing**: ~1–2 hours (unit + integration tests)

**Total**: ~8–13 hours

---

## Next Steps

1. Review and refine this design doc with team feedback
2. Begin Phase 1 implementation (build isometric renderer + basic state machine)
3. Implement expanded-mode install flow using exploded carousel + explicit Install button
4. Iterate on visual design and user testing
5. Integrate with existing mod system and game logic



--- 

## questions

Data model contract for mod-to-face
Define exactly where face target lives and its shape.
Recommendation: mod has targetFaceIndex with explicit values for core vs face, and a single source of truth in game state, not UI-local state.
Seems right to me. The Die has Mods which have an optional targetFaceIndex. 0 can be the core.

Install/replace semantics
What happens if Weight is already installed and user picks a new face?
Recommendation: Install always means replace current target for that mod (no separate move feature), no duplicate Weight instances.
weight is in mod slot
"face" (pip icon) is from style slot
they should not conflict

Cost and economy behavior
Does reinstall/uninstall affect modsSpent or other counters?
Recommendation: lock a temporary rule now (for example, reinstall is free during this phase, uninstall refunds nothing) to avoid later logic ambiguity.
if we think of an installation as a "use", then that use can be transfered or refunded
that should be how the actual literal Resource class is being used right now...

Expanded mode face options
Should target include Core and all faces, or faces only?
Recommendation: define this explicitly in the control label and option list so behavior is obvious.

Probability source and timing
When expanded, are probabilities showing current die state, or preview with selected mod + selected target face?
Recommendation: show preview based on selected mod + target face, with fallback text if preview unavailable.

Style rendering scope
You decided style is rendered on the isometric die; clarify if style remains one global die style or can diverge by face later.
Recommendation: keep global die style for now, add a note that per-face style is out of scope.

Transition and animation boundaries
You want minimal motion.
Recommendation: explicitly cap animation scope to one subtle expand/collapse transition (or none), and ban per-face animated effects for this phase.

Event and integration contract
Which events fire on install/uninstall and who listens?
Recommendation: define one event payload now to avoid coupling drift between panel, renderer, and game state.

Failure and disabled states
What if install is pressed with no valid target, or mod unavailable?
Recommendation: define disabled Install conditions and inline error/hint behavior.

Test acceptance at behavior level
Current criteria are good; add concrete behavioral assertions.
Recommendation: add explicit tests for install-replace, uninstall-clear-target, cancel-no-state-change, and collapsed-after-install.
