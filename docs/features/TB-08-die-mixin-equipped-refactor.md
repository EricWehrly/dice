# TB-08 — Die Mixin + Equipped Refactor

**Status**: � In Progress  
**Depends on**: current `ModifiedDie` behavior, TB-05 panel flow, and engine mixin patterns (especially `Equipped`)

**Progress (2026-05-29)**:
- ✅ `DieEquippedMixin` implemented in `src/game/DieEquippedMixin.ts` — game-layer approximation of engine `Equippable`, with named slot types (`DieSlotType`), equipment install/uninstall, and `DieEquipmentChangedEvent` firing.
- ✅ `ModifiedDie` retired — die equipment is now managed through `DieEquippedMixin` rather than ad-hoc slot state.
- 🔄 `FACTORY_CREATED_SYMBOL` bypass still present in `Die.ts`. Die still imports and passes the symbol to bypass Entity's factory guard. Removing this properly requires routing Die construction through `EntityBuilder`.

---

Before TB-07 lock/style work, migrate die construction to use `EntityBuilder` properly (removing the symbol bypass hack) and introduce explicit named equipment slots as a die-specific mixin.

Primary outcomes:

1. Remove `FACTORY_CREATED_SYMBOL` bypass from `Die.ts`. Die must enter through `EntityBuilder`.
2. Write a `DieSlotsMixin` (following engine `EntityMixin<T>` pattern) that owns `mod`, `faceStyle`, and `bodyStyle` slots.
3. Retire `ModifiedDie`'s ad-hoc slot management — the mixin becomes the authority.
4. Preserve existing weight mod behavior in the `mod` slot.
5. Leave TB-07 to focus on lock behavior/presentation once the slot contract is stable.

---

## Current State

`Die extends Entity` — that part is already correct.

The problem is construction:

- `Die.ts` imports `FACTORY_CREATED_SYMBOL` and passes it directly to bypass Entity's factory guard.
- The guard exists so that mixin `@PostConstruct` methods fire correctly. Bypassing it means mixins on `Die` or `ModifiedDie` cannot be trusted to initialize properly.
- `ModifiedDie` consequently manages its own slot state (`mod: DieWeightMod | null`) entirely outside the mixin system.

---

## Why Not Reuse Engine `Equipped` Directly

The engine `Equipped` mixin manages `Technology` objects keyed by `TechnologyTypes` enum — weapons, abilities, etc. Die slots (`mod: DieWeightMod`, `faceStyle: string`, `bodyStyle: string`) are a different domain and type contract. Forcing die equipment through `Technology` + `TechnologyTypes` would be misuse of those abstractions.

The correct approach: write `DieSlotsMixin` following the same `EntityMixin<T>` structural pattern — `name`, `dependencies`, `apply()` — but typed for die equipment. Same shape, different domain.

### Prototype Update (May 27, 2026)

To reduce guesswork before deciding between `DieSlotsMixin` and a generalized `Equipped` path, a minimal engine-level prototype now exists:

- `engine/js/baseTypes/Equippable.ts` now includes `EquippableBase<TSlotKey>`.
- `engine/js/entities/equipment.ts` now provides generic equip/unequip storage over `Equippable<TSlotKey>` via `GenericEquipment`.
- `src/game/DieEquippedMixin.ts` now consumes the generic engine equipment core directly.
- `tests/game/DieEquipped.integration.test.ts` applies `DieEquippedMixin` to `Die` using `createEntityFrom(Die)` and verifies install/uninstall.

This prototype intentionally does not modify `Die`, `ModifiedDie`, or existing `Equipped`.

### In-Progress Integration Update (May 27, 2026)

The existing engine path has now been partially integrated with the generic equippable layer:

- `engine/js/entities/equipment.ts` now contains a generic core (`GenericEquipment` + `GenericEquippedItem`) and keeps legacy `Equipment`/`EquippedTechnology` compatibility for `TechnologyTypes`.
- `engine/js/technology.ts` now extends `CombatEquippable` (`EquippableBase<TechnologyTypes>`), so `Technology` sits on top of the new equippable base instead of directly on `Listed`.

This means the migration direction is no longer only a side prototype; the live `Equipped` pipeline is now leveraging generic equippable primitives while preserving current `EquippedMixin` API shape.

---

## Working Model

### Construction

All `Die` and `ModifiedDie` instances must be created via `EntityBuilder`. Test helpers and app construction sites need to use the builder. The `FACTORY_CREATED_SYMBOL` import in `Die.ts` is removed.

### DieSlotsMixin

A new `EntityMixin<DieSlots>` where:

```ts
interface DieSlots {
    mod: DieWeightMod | null;
    faceStyle: string | null;
    bodyStyle: string | null;
    installMod(mod: DieWeightMod): void;
    uninstallMod(): void;
    installFaceStyle(id: string): void;
    installBodyStyle(id: string): void;
}
```

Each slot holds exactly one value (or null). No stacking.

### Separation of Concerns

- `mod` — gameplay/probability effect
- `faceStyle` — pip presentation (lock will be a faceStyle value in TB-07)
- `bodyStyle` — shell/material/finish

---

## Milestones

### M8.1 — Migrate to EntityBuilder Construction

**Files**:
- `src/game/Die.ts`
- `src/game/ModifiedDie.ts`
- `src/game/Bag.ts` (die construction site)
- all test files that use `new Die()` / `new ModifiedDie()` directly

**Tasks**:
1. Remove `FACTORY_CREATED_SYMBOL` import and usage from `Die.ts`.
2. Create a `createDie(options)` / `createModifiedDie(options)` factory helper using `EntityBuilder`.
3. Update all construction sites (app + tests) to use the factory helper.
4. Confirm `@PostConstruct` runs correctly after migration.

**Acceptance**:
- No direct `new Die()` or `new ModifiedDie()` calls remain outside the factory helper.
- Existing tests pass (updated to use factory helper as needed).

---

### M8.2 — Write DieSlotsMixin

**Files**:
- `src/game/DieEquipmentTypes.ts`
- `src/game/DieSlotsMixin.ts` (new)
- `src/game/ModifiedDie.ts`

**Tasks**:
1. Implement `DieSlotsMixin` as an `EntityMixin<DieSlots>` following engine mixin conventions.
2. Migrate `mod` slot management out of `ModifiedDie` and into the mixin.
3. Add `faceStyle` and `bodyStyle` slots (initially null).
4. Keep weight behavior in `mod` intact with no functional regression.

**Acceptance**:
- `DieSlotsMixin` applied via builder produces correct slot API.
- `ModifiedDie` no longer owns slot management directly.
- Weight mod install/uninstall works through the mixin.

---

### M8.3 — Three-Slot UI Contract

**Files**:
- `src/ui/DieModificationTypes.ts`
- `src/ui/DieModificationPanel.ts`
- `src/ui/DieModificationPanelTemplate.ts`

**Tasks**:
1. Update panel to drive all three slot lanes (`mod`, `faceStyle`, `bodyStyle`) through the mixin API.
2. Ensure style and gameplay mod paths are separate UI lanes.

**Acceptance**:
- UI can install/uninstall each slot independently.
- Existing weight mod flow works without regression.

---

### M8.4 — Renderer Contract Alignment

**Files**:
- `src/rendering/2d/DieFaceTileRenderer.ts`
- `src/rendering/2d/DieIsometricRenderer.ts`
- `src/rendering/2d/DiceCanvasRenderer.ts`

**Tasks**:
1. Read `faceStyle` / `bodyStyle` from the mixin slot API instead of any ad-hoc property.
2. Keep 2D behavior stable; same contract will be consumed by the upcoming 3D path.

**Acceptance**:
- Renderers read slot state without custom parsing.

---

### M8.5 — Integration Coverage

**File**:
- `tests/integration/die-mixin-equipped-refactor.test.ts` (new)

**Coverage**:
1. Die constructs via builder with `DieSlotsMixin` applied.
2. All three slots install/replace/uninstall correctly.
3. Weight path in `mod` slot remains functional.
4. Panel and renderer observe the same slot state.

---

## Definition of Done

- [ ] `FACTORY_CREATED_SYMBOL` bypass removed from `Die.ts`.
- [ ] All construction goes through `EntityBuilder`.
- [ ] `DieSlotsMixin` owns `mod`, `faceStyle`, `bodyStyle`.
- [ ] `ModifiedDie` no longer manages slots directly.
- [ ] UI drives all three lanes through the mixin API.
- [ ] Renderers consume slot state from the mixin.
- [ ] Integration tests pass.

---

## Incremental Commit Slices

1. EntityBuilder migration for Die/ModifiedDie + test updates.
2. DieSlotsMixin with mod slot.
3. faceStyle and bodyStyle slots.
4. Panel migration to three lanes.
5. Renderer contract alignment.
6. Integration tests.

## Next Step Gate (Before Committing to a Migration Path)

1. Compare `DieEquippedMixin` and existing `Equipped` method-by-method (`AddTechnology`, `install`/`equip`, `getEquipped`, option validation, event shape).
2. Decide whether to converge on a shared generic engine equipment layer or keep separate domain-specific mixins.
3. If converging, define a compatibility strategy for non-dice projects that already consume `Equipped` + `TechnologyTypes`.
4. Only after the decision above, update M8.2 implementation details (`DieSlotsMixin` vs engine-generic adaptation).

---

## Notes for TB-07

TB-07 depends on M8.2 (DieSlotsMixin) being complete. Once `faceStyle` is a real slot with install/uninstall, lock can be implemented as a `faceStyle` value without touching foundational construction again.
