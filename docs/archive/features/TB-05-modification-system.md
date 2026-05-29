# TB-05 — Modification System

**Phase**: 5  
**Status**: ✅ Complete  
**Depends on**: TB-03 (Die identity, face count) ✅, TB-04 (tricks fire before mods earned) ✅  
**Blocks**: TB-06 loosely (discovery is independent)

**Completed (2026-05-29)**: Full modification UI and probability model implemented.
- `src/game/DiceProbability.ts` — pure probability calculation with weight-mod influence (distance-based model: target face / adjacent / opposite). Used for both live display and preview.
- `src/game/mods/DieWeightMod.ts` — weight modification implementing `DieEquipment`, stored on die via `DieEquippedMixin`.
- `src/ui/DieModificationPanel.ts` — full two-mode panel (collapsed: core mod + style selection; expanded: face-targeted install with face selector). Includes probability inspector readout per face, before/after preview on mod selection, and install/uninstall flow.
- `src/game/DiceModel` and related types provide the data contract for tests and display.
- Body and pip material selectors with 11 materials wired (plastic, wood, stone, ceramic, resin, brass, steel, obsidian, jade, glass, crystal).

---

## Delivery Plan

### M5.1 — Dice Inspector Readout

Show a selected die's face-up chance per face.

Requirements:
- Render current `% up` for every face on the selected die
- Keep the view read-only
- Add a stable data contract so tests can assert the display

### M5.2 — Die Selection

Add a way to choose which die the inspector is looking at.

Requirements:
- Reuse existing bag/canvas selection if it already exists
- If not, add the narrowest selection affordance needed for the inspector
- Keep selection separate from modification logic

### M5.3 — Modification Preview

Add modification selection and preview the resulting chance delta before install.

Requirements:
- Select a modification type
- Show before/after face-up chance changes
- Do not mutate the die yet

### M5.4 — Install Modification

Apply the chosen modification to the selected die.

Requirements:
- Persist the modification on the die
- Refresh the inspector after install
- Add the minimum model support needed for the installed mod to take effect

### M5.5 — Probability Resolver and Mod Types

Once the inspector flow is visible and useful, wire the underlying model pieces:
- `Modification` interface
- `ProbabilityResolver`
- Weight modification behavior
- Any future stat hooks only after the inspector slice is stable

---

## Mod Application UI

**File**: `src/ui/DieModPanel.ts`

A simple panel that appears when a die is selected (click on a tile in the Bag Panel or Canvas).

Inspector first:
- Current face weights / `% up` per face
- Selected die identity
- Placeholder area for future preview/install controls

Later:
- Controls to choose a mod type
- Controls to preview the change
- Controls to install the mod

Die selection: clicking a die tile fires a `'die:selected'` event with the die's ID. `DieModPanel` subscribes and updates.

---

## Tests

`tests/game/` and `tests/ui/`

- Inspector renders correct `% up` values for the selected die.
- Selection changes the inspector target without mutating die state.
- Preview shows the before/after chance delta for a candidate modification.
- Install applies the modification after preview and updates the inspector.
- WeightMod on face 0 reduces face 0's normalized weight.
- Face expansion preserves existing mods.

---

## Definition of Done

- [ ] Dice inspector shows per-face `% up` for the selected die.
- [ ] Die selection feeds the inspector without mutating state.
- [ ] Modification preview shows before/after chance delta.
- [ ] Installing a modification updates the selected die and the inspector.
- [ ] `Modification` interface and `ProbabilityResolver` are in place.
- [ ] `WeightMod` applies weighted random face selection.
