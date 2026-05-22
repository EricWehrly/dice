# F04 - Camera Profile and Scene View Policy

Status: 🔮 Planned

## Goal
Define and track camera defaults (FOV, near/far, position, target, controls) in one deliberate profile rather than scattered constants.

## Current State
- Main scene camera is created in src/index.ts via ThreeCam
- Legacy standalone camera constants were removed from thrower path
- Older example files still contain local FOV/clip constants and are not authoritative

## Proposed Direction
- Introduce a dedicated camera profile for dice main scene
- Keep camera settings in engine-compatible construction path (ThreeCam options)
- Reuse profile for future inspector scene/screen if inspector becomes a scene switch

## Candidate Defaults (to validate)
- fov: 75
- near: 0.1
- far: 1000
- position: (0, 5, 10)
- target: (0, 0, 0)
- controls: enabled

## Remaining
- Add a camera config module for dice app (single source for values)
- Replace hard-coded camera values in src/index.ts with profile import
- Document profile usage in active roadmap and feature references

## Acceptance Criteria
- Camera defaults are centralized and documented
- Main scene camera reads from one profile module
- Any future inspector camera derives from explicit profile decision
