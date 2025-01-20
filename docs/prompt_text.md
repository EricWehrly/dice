### Layered CodePilot Prompts for Scaffolding the Game

These prompts are designed to guide the incremental development of the game by breaking the project into manageable layers. Each layer represents a distinct step in the development process, focusing on foundational systems first and progressively adding complexity. The intent is to scaffold the game while adhering to best practices in software development. The prompts are structured to:

1. Clearly define the scope and goals of each layer.
2. Emphasize modularity, scalability, and maintainability in the codebase.
3. Enable seamless integration of additional features in the future.

Follow the prompts in sequence, using each layer as a building block for the next.

#### Layer 1: Copilot Contribution Guidelines

```
Generate a `.github/copilot-instructions.md` file. This file should:

1. Include clear rules for Copilot's contributions:
   - Avoid generating code that duplicates existing functionality.
   - Prioritize modularity, maintainability, and adherence to project conventions (naming patterns, file organization).

2. Encourage:
   - Writing tests for new features.
   - Using existing utility functions (DRY principle).

3. Discourage:
   - Magic numbers and anti-patterns.
   - Overly complex or verbose implementations.

Focus on ensuring Copilot aligns with project standards and best practices.
```

---

#### Layer 2: Webpack Boilerplate

```
Generate the boilerplate setup for a TypeScript-based browser game using Webpack and Yarn. Your output must include:

1. **.gitignore**:
   - Exclude `node_modules`, build artifacts, and other common files.

2. **package.json**:
   - Define dependencies and scripts for development and production builds.

3. **webpack.config.js**:
   - Configure TypeScript bundling and a development server.
   - Ensure that changes are "hot reloaded," meaning Webpack will update the running server when a relevant file change is saved.
   - Avoid incorrectly using deprecated `devServer.contentBase` rather than `devServer.static`.

4. **tsconfig.json**:
   - Configure TypeScript settings for this project.
   - Target `es2022`.

5. **Install and configure dependencies**:
   - Include `three.js` and related `@types` for working in TypeScript. Use a version no older than `0.172.0`.
   - Include `html-webpack-plugin` and create an `index.html` file.
   - Style the HTML file to hide scrollbars, margin, and padding (on the body).
   - Install TypeScript `@type` packages for any installed libraries when available.

Your task is to:

- Use the latest stable versions for dependencies (LTS where applicable).
- Ensure compatibility between Webpack and TypeScript.
- Exclude the generation of lock files (e.g., `yarn.lock`, `package-lock.json`).
- Include npm scripts for `start` (development server) and `build` (production build).
- Avoid adding unused, excessive, or unnecessarily complex configuration for TypeScript and Webpack.
```

---

#### Layer 3: Test-Driven Development Setup

```
Configure a test-driven development setup for the project. Your output must include:

1. **Jest Configuration**:
   - Enable TypeScript support and configure Jest mocks for isolating classes under test.
   - Add a `test` script to `package.json` for running tests.

Ensure the testing workflow integrates seamlessly with VSCode.
```

---

#### Layer 4: Core Systems

##### Event Manager and Game Loop

```
Implement two core systems: an Event Manager and a Game Loop.

1. **Event Manager**:
   - Expose methods for Publishing and Subscribing to game events.
   - Declare at least three event types: `ScriptsLoaded`, `DataLoaded`, and `GameStart`. The `GameStart` event should be called from the game's entrypoint script.

2. **Game Loop**:
   - Expose methods to:
     - Register methods for execution in the game loop.
     - Defer a call (acts as a drop-in replacement for `setTimeout`, but tracked against game time).
     - Pause and resume the game loop.
   - Provide callbacks with the number of milliseconds elapsed since the last execution.
   - Separate concerns into:
     - Methods that need to be run as frequently as possible.
     - Methods that can be run less frequently.
   - Default `RegisterMethod` to the less frequent execution unless explicitly specified.
```

##### Data Loading System

```
Load JSON files dynamically at runtime for entities like abilities and dice properties.
- Provide a clean interface for requesting and parsing data.
- Handle errors gracefully, such as missing or malformed files.

Include example JSON files for abilities and dice properties.
```

##### Persistence System

```
Create a flexible system to save and load player data:
- Support file system API (for saving to disk).
- Browser storage (e.g., localStorage or IndexedDB).
- A default "discard" behavior (acts like "/dev/null").

Provide examples for saving and loading player progress and settings.
```

---

#### Layer 5: Game Logic

##### Dice System

```
Define a `Dice` class with configurable properties, such as:
- Color.
- Pip style.
- Special rules (e.g., weighted dice).
```

##### Abilities System

```
Define an `Ability` class with a generic interface that supports future data source changes (e.g., APIs, databases). Include example abilities, such as:
- Acid: Burns away pips from dice.
- Ice: Freezes dice, rendering their result immutable and immune to other effects.
```

---

#### Layer 6: UI Helper Classes

##### Prompt for UI System Setup

```
Design a touch-friendly user interface system for the game. Your output must include:

1. Helper classes to:
   - Define menus in script.
   - Load menu content dynamically from JSON files.

2. A basic example menu titled "Credits" that:
   - Reads its content from a JSON file.
   - Demonstrates the use of helper classes.

Ensure the system is modular and extensible.
```

##### Prompt for Predefined Menus

```
Implement predefined menus as separate tasks for clarity and focus:

1. **Main Menu**:
   - Provide options to start a new game, load a saved game, or access settings.

2. **Game Settings Menu**:
   - Include tabs for:
     - Controls: Adjust key bindings and input settings.
     - Audio: Configure volume levels and sound effects.
     - Video: Set resolution and graphical quality.

3. **Help Menu**:
   - Include sections describing the game's mechanics and rules.
   - Load sections dynamically from JSON files.

4. **Debug Menu**:
   - Provide options to toggle feature flags, enable debug logs, and run test scenarios.
   - Access via a special debug key combination.

Use the helper classes to implement these menus and demonstrate dynamic JSON loading.
```

---

### Technical Drafts for Additional Systems

#### Method Performance Monitoring Instrumentation

```
Add performance monitoring to the game. Your output must:

1. Include a utility function for measuring method execution times (e.g., `logPerformance(methodName, executionTime)`).
2. Ensure the system is non-invasive and easy to integrate.
3. Provide an example of instrumenting the `rollDice` method in the Dice class.
```

#### Method-Level Caching

```
Implement method-level caching for the game. Your output must:

1. Create a utility to cache method results based on input parameters (e.g., `cacheMethodResults(methodName, cacheDuration)`).
2. Support configurable expiration times for cached results.
3. Include an example of caching results for an expensive computation, such as calculating dice outcomes.
```

---

### Notes:

- Each layer builds incrementally upon the previous one.
- Prompts are designed for clarity and to prioritize functionality.
- Use this document to scaffold the project step by step.
