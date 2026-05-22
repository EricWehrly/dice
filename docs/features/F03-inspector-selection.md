# F03 - Inspector Selection and Deferred UI

Status: 🚧 Blocked (engine capability dependency)

## Goal
Preserve right-click entity inspection plumbing now; defer full inspector UI until engine-level modal/screen support is defined.

## Scope
- Raycast to selected entity
- Mesh/object -> entity resolution
- Inspector flow logging and verification
- Future inspector scene/screen integration

## Done
- userData-based entity id tagging on mesh and child meshes
- getEntityForMesh resolver API returns typed Entity to callers
- Right-click raycast hit/miss logging in GameObjectInspector
- Last selected entity retained for deferred flow verification

## Retained Learnings From Removed RotationViewer
- Need dedicated close/dismiss semantics
- Need OrbitControls behavior for inspection camera
- Need stable object->entity mapping for click hit results

## Remaining
- Define engine-level modal/screen lifecycle contract
- Define whether inspector is overlay modal or full scene switch
- Implement inspector UI only after engine capability decision

## Engine Requirements To Unblock
- Reusable modal lifecycle in engine UI layer (open/close/focus/escape)
- Scene/render suspension policy while inspector is open
- Secondary scene/screen pattern for detailed inspection views

## Acceptance Criteria
- Right-click on dice reliably resolves entity and logs hit details
- No local ad-hoc renderer stack for inspector UI in dice app
- Inspector UI implementation waits on engine capability decision
