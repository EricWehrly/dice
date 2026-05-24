# F07 - Dice Upgrading Screen

Status: 🔮 Planned

## Goal
A pure presentation component that shows available upgrades and clear before/after stat comparisons for a die.

## Scope
- Upgrade list UI and filtering/grouping
- Before/after stat comparison (no mutations)
- Probability delta display from F05 model
- Callback props for confirm/cancel (no shell knowledge)
- Engine UI binding through `UIElement`/`Menu` zones

## Screen Component Contract

**Props:**
- `currentDie: DieInstance`
- `availableUpgrades: Upgrade[]`
- `faceProbabilities: Record<FaceId, number>` (from F05)
- `onApplyUpgrade: (upgrade: Upgrade) => void`
- `onNavigate: (targetScreen: ScreenId) => void`

**Behavior:**
- Display upgrades in a list.
- On select, show before/after die snapshot with diff highlighting.
- Compute probability deltas locally from F05 model.
- Call `onApplyUpgrade` or `onNavigate` on user action.
- No knowledge of modal vs screen switch.

## Diff Model

```typescript
interface GroupedStats {
  before: DieStat[];
  after: DieStat[];
  changed: Set<StatKey>;
}
```

## Deliverables
- Component interface definition
- Diff/comparison rendering spec
- Upgrade application callback contract
- Engine UI mapping for list/detail regions
- Acceptance tests for list + diff + callback flow

## Acceptance Criteria
- Upgrade list renders with selectable items.
- Before/after stats are computed without mutating live die.
- Probability deltas are displayed from F05 data.
- Callbacks invoked without shell knowledge.

## Dependencies
- Depends on [F05 - Die Face Up-Probability Model](F05-die-face-up-probability-model.md).
- Depends on [F10 - Screen Shell and Navigation](F10-screen-shell-navigation.md) for navigation event contracts and layer policy.

## Risks
- Complex upgrade stacking can make diff logic tricky.
- Snapshot isolation is critical to prevent accidentally mutating live die.
