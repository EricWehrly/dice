# Dice Game - Active Roadmap

Last updated: 2026-06-02

This is the only active roadmap.

## Current Focus

1. 🔄 TB-03 - Bag Management
2. 🔄 TB-04 - Stateful Tricks and Combos
3. 🔮 TB-06 - Trick Discovery
4. 🔄 TB-08 - Die Mixin + Equipped Refactor
5. 🔄 F02 - Throw Input and Cooldown (3D path)
6. 🔄 F12 - Die Material and Texture Pipeline
7. 🔄 F14/F18 - Capability-Driven Material Coverage (execution + tuning)
8. 🔮 F17 - Physical Material Calibration and IBL (support lane)
9. 🔮 F16 - Camera Die Focus Click (new)
10. 🔮 F05/F10/F06/F07/F08/F09 - Screen Architecture expansion

## Status Snapshot

### Completed
- ✅ TB-01 Foundation
- ✅ TB-02 Trick System (core/stateless)
- ✅ TB-05 Modification Sys
- ✅ F15 Dynamic Camera Framingtem

### In Progress
- 🔄 TB-03 Bag Management
- 🔄 TB-04 Stateful Tricks
- 🔄 TB-08 Equipment refactor
- 🔄 F02 Throw flow polish
- 🔄 F12 texture/material pipeline
- 🔄 F14 material authoring (execution + tuning)
- 🔄 F18 capability system rollout and validation

### Planned / Deferred
- 🔮 TB-06 Trick Discovery
- 🔮 TB-07 Lock Breaking
- 🔮 TB-09 Pip face slot + symbol library
- 🔮 F17 calibration + IBL baseline (after next material-coverage chunk)
- 🔮 F04/F05/F06/F07/F08/F09/F10/F13 screen architecture and 3D UX expansion

## Roadmap Structure

- Active roadmap (this file): `docs/active/roadmap.md`
- Archived roadmap: `docs/archive/roadmap-archived.md`
- Feature details: `docs/features/F*.md` (see F16 for next focus)

## Current Delivery Focus

1. Close TB-03/TB-04 gaps with tests and explicit combo scope.
2. Keep F02/F12 moving as non-blocking 3D improvements.
3. Complete next material-coverage chunk in F14/F18 (remaining fallback materials + tuning).
4. After coverage lands, start F17 support lane in order: diagnostics -> IBL baseline -> lighting normalization.
5. Start F16 once current material chunk is stable.
6. Start F05/F10 when TB core loop is stable enough for screen-shell work.
