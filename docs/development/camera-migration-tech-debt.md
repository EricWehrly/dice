# Camera Migration Tech Debt

The current 3D roll flow still owns camera framing in [src/camera.ts](../../src/camera.ts). Horde mode works by sharing the existing ThreeJS canvas and suppressing roll-camera refits while the horde screen is active.

This is acceptable for now, but it is temporary coupling. The intended migration path is to move camera ownership into the engine-side camera layer so the game can switch scenes without a bespoke handoff flag in game code.

Known debt being carried forward:
- Roll 3D and Horde still coordinate through the shared `ThreeJSRenderContext` canvas instead of independent scene ownership.
- Roll-camera refits are skipped through the `horde:screen-state` event instead of an explicit mode controller.
- Legacy `die.active` behavior remains in the bag/model layer while equipped-vs-owned semantics settle.
- Horde selection opens the modification panel, but the selection flow still depends on the current shared scene wiring.

When the engine camera migration starts, this file should be updated or retired and the temporary guards in [src/camera.ts](../../src/camera.ts) should be removed.

**Signature**: A1