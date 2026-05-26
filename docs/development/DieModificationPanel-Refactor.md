# Die Modification Panel — Production Refactor Plan

## Overview

Convert `TB05PrototypePanel` (dummy prototype) into production `DieModificationPanel` with proper separation of concerns.

## Scope

### Remove
- All TB05 naming (planning artifact, not user-facing)
- Dummy die data and hard-coded mods
- Prototype-style class/variable names

### Add  
- Production panel: `src/ui/DieModificationPanel.ts`
- State/model layer: `src/game/DieModificationState.ts`
- CSS refactor: `.modification.css` → `.die-mod-panel.css`, all TB05 classes → `mod-panel-*`
- Wire real `Die`/`Bag` selection instead of dummy array
- Data contracts for testing UI rendering

### Keep
- Canvas rendering approach (2D API + theme colors)
- CORE slot visualation (die-like tile, gold border/inner ring)
- Per-face dropout UX (dropdowns with labels, aligned values/deltas)
- Read-only dummy behavior (no real `Modification` model yet — defer M5.4+)

---

## Architecture

### Layer 1: UI Component (`DieModificationPanel.ts`)
**Responsibility**: Rendering, layout, event wiring  
**Input**: die ID, current/preview chances, mod options  
**Output**: User interactions (face mod select, install click)  

```typescript
export class DieModificationPanel {
  private root: HTMLElement;
  private state: DieModificationState;
  
  constructor() { /* init root, create state */ }
  render(die: Die): void { /* HTML + canvas */ }
  private wireHandlers(): void { /* event listeners */ }
}
```

### Layer 2: Model/State (`DieModificationState.ts`)
**Responsibility**: Die selection, draft mods, probability calculation  
**Input**: Die data, modification selections  
**Output**: Computed chance arrays, dirty/clean state  

```typescript
export class DieModificationState {
  private selectedDie: Die | null;
  private draftFaceMods: AvailableModValue[] = [];
  private draftCenterMod: AvailableBrainModValue = 'none';
  
  setSelectedDie(die: Die): void { /* update + reset drafts */ }
  setFaceMod(index: number, mod: AvailableModValue): void { /* update */ }
  getCurrentChances(): number[] { /* calculate */ }
  getPreviewChances(): number[] { /* with drafts */ }
  hasDraftChanges(): boolean { /* dirty flag */ }
}
```

### Layer 3: Integration (`index.ts`)
Subscribe to `'die:selected'` event, wire panel to state, trigger re-render.

---

## Implementation Phases

### Phase 1: Rename & Relocate (Largest/Simplest)
1. Rename `TB05PrototypePanel` → `DieModificationPanel`  
2. Move dummy model to `DieModificationState` (same behavior for now)
3. Rename all CSS classes `.tb05-*` → `.mod-panel-*`
4. Rename `.modification.css` → `.die-mod-panel.css`
5. Update imports everywhere
6. **Result**: Same working UI, clean names, zero functional change; easy to test/review

### Phase 2: Wire Real Die Selection
1. Listen for `'die:selected'` event from Canvas/Bag
2. Pass `Die` object to state instead of dummy array
3. Draw selection UI from real die (label, face count)
4. **Result**: UI connected to live die state; dummy mod options still there

### Phase 3: Separate UI from State (Future)
1. Extract `DieModificationState` into its own class
2. DieModificationPanel consumes state via getter methods
3. State emits events for changes (optional: use Events system or simple callbacks)
4. **Result**: Cleaner testing, easier to mock/test state logic

### Phase 4: Add Real Modification Model (Defer to M5.4)
1. Create `Modification` interface and model
2. Implement `ProbabilityResolver`
3. Wire install to actually persist mods on die
4. **Result**: Functional modification system

---

## Files Changed (Phase 1)

- `src/ui/TB05PrototypePanel.ts` → `src/ui/DieModificationPanel.ts`
- `src/styles/modification.css` → `src/styles/die-mod-panel.css`
- `src/styles/modification.css`: rename all `.tb05-*` → `.mod-panel-*`
- `src/index.ts`: update import + panel instantiation
- `src/index.html`: rename mod-panel id, update stylesheet link
- `src/utils/ScreenManager.ts`: no changes (generic utility)

---

## Testing Strategy

### Unit Tests (Phase 1)
- UI rendering: state drives HTML structure + canvas, verify DOM matches
- Canvas alignment: face tiles match dropdown positions
- Event handlers: selecting face mod / installing updates state (dummy)

### Integration (Phase 2+)
- Die selection event updates displayed die
- Real die data feeds render (face count, label)

---

## Done Criteria

- [x] Plan documented
- [ ] Phase 1 refactor complete: rename, same behavior
- [ ] All imports updated, no broken references
- [ ] Tests still pass (if any existing)
- [ ] Git diff is clean: only name changes in Phase 1

