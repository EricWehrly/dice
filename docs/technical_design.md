### Technical Design Document

#### Technologies

- **Languages and Tools**:
  - **TypeScript**: For strict typing and integration with modern development tools.
  - **Webpack**: To bundle and serve the game for development and deployment.
  - **Yarn**: As the package manager to handle dependencies.
  - **Three.js**: For rendering the dice and other game elements in 3D.
- **Testing Framework**:
  - **Jest**: For test-driven development, leveraging TypeScript support and integration with VSCode.
    - Mocks will be used to ensure that individual classes under test do not depend on external files or systems.
- **Performance Considerations**:
  - Emphasis on consistent performance (smoothness) over peak FPS.
  - Optimized to run on lower-tier hardware and conserve battery on mobile devices.

#### Object-Oriented Structure

- **Dice**:
  - Each die is a class instance with properties such as color, pip style, and special rules.
- **Abilities**:
  - Abilities are represented as classes and loaded dynamically from JSON files.
  - Implemented via a generic interface to allow future changes to the data source (e.g., MongoDB or REST API).

#### Persistence System

- Player data can be saved through a flexible persistence system:
  - Options include using the file system API (on disk) or browser storage.
  - Default behavior will discard data ("/dev/null" style).

#### User Interface

- **Touch-Friendly Design**:
  - The UI will be optimized for both desktop and mobile platforms.
- **Menu System**:
  - Helper classes for defining menus in code.
  - Predefined menus include:
    - **Main Menu**
    - **Game Settings**: Contains tabs for:
      - **Controls**
      - **Audio**
      - **Video**
    - **Help Menu**: Sections to describe game mechanics and rules.
