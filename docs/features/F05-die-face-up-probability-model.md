# F05 - Die Face Up-Probability Model

Status: 🔮 Planned

## Goal
Add a canonical derived-data model representing each face's probability of ending up as "up". Make it consumable by all screens and testable in isolation.

## Why This Is First
All four screens depend on probability data for display and decisions (rolling stats, upgrade impact, details view, tricks). This model establishes the contract before building screen logic.

## Scope
- Probability representation in die domain model
- Calculation pipeline for base and modified dice
- Cache/invalidation policy for derived probability values
- Pure, screen-agnostic API for reading probabilities
- Event hooks for invalidation and recompute triggers

## Proposed Data Shape
- `faceProbabilities: Record<FaceId, number>` where values are in [0, 1]
- `probabilityVersion` or equivalent derivation stamp for cache coherence
- Optional normalized percentage helpers for UI formatting

## Calculation Strategy (Initial)
1. Compute from canonical die state (geometry/stats/modifiers/rules).
2. Normalize so sum over faces is 1 where model assumptions require full outcome partition.
3. Persist as derived snapshot with explicit invalidation triggers.

## Invalidation Triggers
- Upgrade applied/removed
- Modifier added/removed
- Rule profile or simulation parameter changes
- Die topology changes (face set, weighting metadata)

## Deliverables
- Domain contract for per-face up-probabilities
- Deterministic calculator API specification
- Test matrix for baseline, upgraded, and edge-case dice
- Selector-style read API consumable by shell/screen binders

## Acceptance Criteria
- Probability contract is unambiguous and documented.
- Recalculation behavior is deterministic for the same inputs.
- Probability data is read-only from screen perspective (no UI-driven mutations).

## Dependencies
- No upstream dependencies; foundational.
- Unblocks F06, F07, F08, F09.

## Integration Notes

- Recompute should be triggered by explicit state changes (upgrade applied, modifier changed), not by UI redraw loops.
- Shell should read probabilities via selector/helper APIs; screens should not perform ad-hoc recomputation.

## Risks
- Ambiguous physics/rules assumptions can invalidate numeric expectations.
- Premature optimization of caching can hide stale derived data bugs.

## Open Questions
- Is up-probability analytical, simulated, or hybrid?
- What precision and rounding policy is acceptable for UI vs logic?
- Do probabilities need seed/version tagging for reproducibility?
