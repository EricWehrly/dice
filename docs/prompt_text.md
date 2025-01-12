### Layered CodePilot Prompts for Scaffolding the Game

These prompts are designed to guide the incremental development of the game by breaking the project into manageable layers. Each layer represents a distinct step in the development process, focusing on foundational systems first and progressively adding complexity. The intent is to scaffold the game while adhering to best practices in software development. The prompts are structured to:

1. Clearly define the scope and goals of each layer.
2. Emphasize modularity, scalability, and maintainability in the codebase.
3. Enable seamless integration of additional features in the future.

Follow the prompts in sequence, using each layer as a building block for the next.

#### Layer 1: Webpack Boilerplate

"""
You are tasked with generating the boilerplate setup for a TypeScript-based browser game using Webpack and Yarn. Your output must include the following files:

1. **package.json**:

   - Contains dependencies and scripts for development and building the project.

2. **webpack.config.js**:

   - A minimal Webpack configuration to bundle TypeScript files and serve them locally.

3. **tsconfig.json**:

   - Configures TypeScript for the project.

4. **.gitignore**:

   - Ignores node\_modules, build artifacts, and other common patterns.

Your task is to:

- Ensure compatibility between Webpack and TypeScript.
- Avoid generating an initial lock file (e.g., yarn.lock or package-lock.json).
- Include npm scripts for `start` (local development server) and `build` (production build).
- Make it as simple and bulletproof as possible.

Do not include any application logic yet.
"""

---

#### Layer 2: Core Systems

"""
You are tasked with implementing the core systems for the game. The requirements are:

1. **Dice Class**:

   - Each die should be an instance of a class with properties such as color, pip style, and special rules.

2. **Abilities Class**:

   - Abilities should be represented as classes
   - Use a generic interface to allow future data source changes (e.g., MongoDB or REST API).

3. **Persistence System**:

   - A flexible system to save player data, supporting:
     - File system API for on-disk storage.
     - Browser storage.
     - A default discard behavior ("/dev/null").

4. Data loading system

   1. Default to data stored as JSON objects in bundled script files, for simplicity, to be iterated on later.

Include sample JSON files and placeholder classes to demonstrate these systems in action.
"""

---

#### Layer 3: Test-Driven Development Setup

"""
You are tasked with configuring a test-driven development setup for the previously generated project. Your output must include:

1. **Jest Configuration**:

   - Configure Jest to work with TypeScript.
   - Include TypeScript support and set up Jest mocks for isolating individual classes under test.

2. **Sample Test**:

   - Provide an example test for a placeholder class (e.g., `ExampleClass`) to demonstrate TDD principles.

Your goal is to ensure a smooth testing workflow that integrates with VSCode.
"""

---

#### Layer 4: UI Helper Classes

##### Prompt for UI System Setup

"""
You are tasked with designing a touch-friendly user interface system for the game project. Your output must:

1. Include helper classes to:

   - Define menus in script.
   - Load menu content dynamically from JSON files.

2. Implement a basic example menu titled "Credits" that:

   - Reads its content from a JSON file.
   - Demonstrates the use of the helper classes.

Ensure the system is modular and easy to extend.
"""

##### Prompt for Predefined Menus

Split the implementation of each menu into separate prompts to ensure clarity and focus:

1. **Main Menu**:

   - The entry point of the game.
   - Provide options to start a new game, load a saved game, or access settings.

2. **Game Settings Menu**:

   - Contains three tabs:
     - Controls: Adjust key bindings and input settings.
     - Audio: Configure volume levels and sound effects.
     - Video: Set resolution and graphical quality.

3. **Help Menu**:

   - Includes sections describing the game's mechanics and rules.
   - Each section should be loaded dynamically from JSON files to allow future updates.

4. **Debug Menu**:

   - Includes options to toggle feature flags, enable debug logs, and run test scenarios.
   - Should be accessible via a special debug key combination.

Each menu should be implemented using the helper classes and demonstrate dynamic JSON loading.

---

### Technical Drafts for Additional Systems

#### Data Loading

"""
You are tasked with implementing a flexible data-loading system for the game. The requirements are:

1. Create a system that loads JSON files dynamically at runtime.

   - These files will define entities such as abilities, dice properties, and menu content.

2. The system should:

   - Provide a clean interface for requesting and parsing data.
   - Handle errors gracefully, such as missing or malformed JSON files.

3. Include examples for loading:

   - A sample abilities JSON file.
   - A sample dice properties JSON file.
"""

#### Persistence

"""
You are tasked with implementing a flexible persistence system for the game. The requirements are:

1. Create a system to save and load player data with the following options:

   - File system API (for saving to disk).
   - Browser storage (e.g., localStorage or IndexedDB).
   - A default "discard" behavior that does not save data anywhere (acts like "/dev/null").

2. The system should:

   - Allow easy switching between storage methods.
   - Include examples for saving and loading player progress and settings.
"""

#### Method Performance Monitoring Instrumentation

"""
You are tasked with adding method performance monitoring to the game project. The requirements are:

1. Implement a lightweight system to track method execution times.

   - Include a utility function for measuring and logging performance.
   - Example: `logPerformance(methodName, executionTime)`.

2. The system should:

   - Be non-invasive and easy to integrate into existing methods.
   - Include an option to disable logging for production builds.

3. Provide an example of instrumenting the `rollDice` method in the Dice class.
"""

#### Method-Level Caching

"""
You are tasked with implementing method-level caching for the game project. The requirements are:

1. Create a utility to cache method results based on input parameters.

   - Example: `cacheMethodResults(methodName, cacheDuration)`.

2. The system should:

   - Support configurable expiration times for cached results.
   - Include an option to bypass the cache when necessary.

3. Provide an example of caching the results of an expensive computation, such as calculating possible dice outcomes.
"""

---

### Notes:

- Each layer builds upon the previous one to ensure incremental development.
- The prompts are structured for clarity and to prioritize functionality.
- Use this document to scaffold the project step by step.

