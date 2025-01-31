# GitHub Copilot Instructions

## Code Generation Guidelines

### Core Principles

1. **Avoid Duplication**
   - Search for existing implementations before generating new code
   - Reuse utility functions and shared components
   - Follow the DRY (Don't Repeat Yourself) principle

2. **Code Organization**
   - Follow the established project structure
   - Place new files in appropriate directories:
     - `/src/core` for core game logic
     - `/src/utils` for utilities
     - `/src/components` for UI components
     - `/src/types` for TypeScript interfaces and types
     - `/tests` for test files

3. **Naming Conventions**
   - Use PascalCase for classes and interfaces
   - Use camelCase for methods and variables
   - Use UPPER_SNAKE_CASE for constants
   - Prefix interfaces with 'I' (e.g., IDice)
   - Suffix test files with '.test.ts'

### Best Practices

1. **Testing**
   - Generate test files for new features
   - Follow the pattern: Arrange, Act, Assert
   - Include both positive and negative test cases
   - Mock external dependencies appropriately

2. **Code Quality**
   - Prioritize readability over cleverness
   - Keep functions focused and small
   - Use meaningful variable and function names
   - Include JSDoc comments for public APIs

3. **Avoid**
   - Magic numbers (use named constants)
   - Deep nesting (maximum 3 levels)
   - Complex one-liners
   - Redundant comments
   - Anti-patterns like global state

### Examples

Good:
```typescript
const MAX_DICE_COUNT = 6;

function rollDice(count: number): number[] {
    if (count > MAX_DICE_COUNT) {
        throw new Error(`Cannot roll more than ${MAX_DICE_COUNT} dice`);
    }
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}
```

Bad:
```typescript
function roll(n) {
    // rolls n dice
    let r = [];
    for(let i = 0; i < n; i++) r.push(Math.floor(Math.random()*6+1));
    return r;
}
```

### Class Pattern with Default Options

When building classes that require default options, follow this pattern:

1. **Define the Options Type**: Create a type that includes all possible options, marking optional and required fields appropriately.
2. **Create a Defaults Class**: Implement a class that provides default values for the optional fields.
3. **Constructor Implementation**: In the constructor, merge the provided options with the default options and pass them to the superclass.

Example:

```typescript
import GameObject, { GameObjectOptions } from './GameObject';

export type DiceOptions = GameObjectOptions & {
    faceCount?: number;
    foreColor: string;
};

export class DiceOptionsDefaults implements Partial<DiceOptions> {
    faceCount = 6;
}

export class Dice extends GameObject {
    constructor(options: DiceOptions) {
        const defaultOptions = new DiceOptionsDefaults();
        const diceOptions = ({ ...defaultOptions, ...options } as Required<DiceOptions>);
        super(diceOptions);
    }
}
```