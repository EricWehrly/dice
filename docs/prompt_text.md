### Layered CodePilot Prompts for Scaffolding the Game

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

   - Abilities should be represented as classes and loaded dynamically from JSON files.
   - Use a generic interface to allow future data source changes (e.g., MongoDB or REST API).

3. **Persistence System**:

   - A flexible system to save player data, supporting:
     - File system API for on-disk storage.
     - Browser storage.
     - A default discard behavior ("/dev/null").

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

"""
Building on the previously generated UI system, implement the following menus:

1. **Main Menu**:

   - The entry point of the game.

2. **Game Settings Menu**:

   - Contains three tabs: Controls, Audio, and Video.

3. **Help Menu**:

   - Includes sections describing the game's mechanics and rules.

4. **Debug Menu**:

   - Includes a menu for adjusting flags, which can be used for debugging, feature flagging, and A/B testing.

Each menu should be implemented using the helper classes and loaded dynamically from JSON files.
"""

---

### Notes:

- Each layer builds upon the previous one to ensure incremental development.
- The prompts are structured for clarity and to prioritize functionality.
- Use this document to scaffold the project step by step.

