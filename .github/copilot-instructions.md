# GitHub Copilot Instructions

## First Rule: Show The Existing Code Before Designing

When asked to build or change anything non-trivial, start with a short "show around" pass:

1. Identify the runtime entrypoint and current behavior.
2. Identify existing modules that already do part of the job.
3. Propose the smallest change that reuses what exists.

Do not jump straight to new architecture when existing code already supports a minimal path.

## Codebase Orientation (Current)

- App entrypoint: `src/index.ts`
- Main HTML shell: `src/index.html`
- Throw flow: `src/thrower/*`
- Input handling: `src/controls/InputManager.ts`
- Dice graphics: `src/rendering/DiceGraphic.ts`
- Game object UI: `src/ui/GameObjectInspector.ts`
- Engine integration: `engine/js/*`
- Tests: `tests/*` and `engine/test/*`
- Active planning docs: `docs/active/roadmap.md`, `docs/active/roadmap-pivot.md`, `docs/features/*`

If a task touches rendering, inspect both `src/*` and `engine/js/*` before coding.

## Current Product Direction

This branch is pivoting toward:

1. Screen-oriented flow (rolling, upgrading, details, trick list)
2. Presentation-agnostic screen components
3. Shell/router deciding display mode (switch vs modal)
4. Derived die face up-probability model shared across screens

Prefer changes that support this direction incrementally.

## Implementation Bias

- Simplest-first vertical slices over full framework builds
- Reuse existing rendering/runtime setup before introducing abstractions
- Add small adapter layers only when needed
- Keep screens/data contracts explicit and narrow

## File Placement Guidance

- Screen-related app code: `src/ui/` or `src/` near current entry usage
- Throw/gameplay behavior: `src/thrower/`, `src/controls/`, `src/game/`
- Rendering-specific code: `src/rendering/`
- Engine-only changes: `engine/js/`
- Planning/design docs: `docs/active/` and `docs/features/`

Do not create parallel "new architecture" folders unless requested.

## TypeScript Guidelines

- Prefer explicit types at module boundaries
- Keep interfaces close to usage unless shared broadly
- Avoid `any`; if unavoidable, isolate and document the reason
- Use immutable defaults and narrow function signatures
- Functions/constructors with more than 2 parameters should prefer a single options interface instead

## Testing Expectations

## Build System & Package Management

- **Primary**: `yarn` (faster, more reliable lockfile, project standard)
- **Commands**: Use `yarn build`, `yarn start`, `yarn test` instead of `npm run`
- **Installation**: Use `yarn add` / `yarn add -D` instead of `npm install`
- **Why**: Workspace has `package.json` configured for Yarn; consistency prevents build issues

- For behavior changes, add/update focused tests in the nearest existing test folder
- Prefer narrow tests around changed behavior over broad rewrites
- When introducing adapters/contracts, add at least one contract-style test

## PR / Change Quality Checklist

Before finishing, ensure:

1. Existing modules were searched and reused where possible
2. Change is minimal and follows current branch direction
3. TypeScript compiles
4. Relevant tests run (or note why not)
5. Docs/plans are updated if behavior or direction changed