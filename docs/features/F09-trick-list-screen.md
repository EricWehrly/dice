# F09 - Trick List Screen

Status: 🔮 Planned

## Goal
A pure presentation component that shows accomplishments/trick entries and their completion state.

## Scope
- Trick list UI with grouping and filtering
- Detail view for selected trick entry
- Callback props for navigation (no shell knowledge)
- Engine UI zone placement and list rendering patterns

## Screen Component Contract

**Props:**
- `tricks: Trick[]`
- `completedTrickIds: Set<TrickId>`
- `onNavigate: (targetScreen: ScreenId) => void`

**Behavior:**
- Display tricks grouped by category or completion state.
- Show detail on selection.
- Call `onNavigate` on user action.
- No knowledge of modal vs screen switch.

## Trick Model Contract

```typescript
interface Trick {
  id: TrickId;
  name: string;
  description: string;
  category: string; // e.g., "discovered", "combat", "milestone"
  rarity?: string;
  completedAt?: Date;
}
```

## Deliverables
- Component interface definition
- Trick grouping and display spec
- Completion state rendering
- Engine UI binding plan for list/detail interactions
- Acceptance tests for list + detail + callback flow

## Acceptance Criteria
- Trick list renders with selectable items.
- Trick groups/filters work correctly.
- Completion state is accurately reflected.
- Navigation callbacks invoked without shell knowledge.

## Dependencies
- Depends on [F05 - Die Face Up-Probability Model](F05-die-face-up-probability-model.md) if tricks reference die stats.
- Depends on [F10 - Screen Shell and Navigation](F10-screen-shell-navigation.md) for navigation lifecycle.
- Can reuse list rendering patterns from [F07 - Dice Upgrading Screen](F07-dice-upgrading-screen.md).

## Risks
- Without clear event sourcing, trick completion can be tricky to reproduce/test.
- Similar UI to upgrades requires shared primitive design to avoid drift.
