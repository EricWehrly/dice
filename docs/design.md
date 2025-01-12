# Dice Game Design Document

## Overview

This game is a dice-based strategy game where players roll dice to achieve specific outcomes, strategically take opponents' dice, and manage risk. The core mechanics involve collecting and managing a pool of dice with unique properties, using them to influence results in creative ways, and balancing risk versus reward.

## Core Mechanics

### Dice Rolling

- Players roll a set of dice, starting with a basic pool of two dice.
- Additional dice can be added to the roll, but each die introduces additional risk.
  - Risk increases linearly: Each additional die adds a predictable increase in difficulty or consequences.

### Dice Properties

Dice come in various colors, shapes, and styles, representing different properties and effects. Examples include:

- **Colors**:
  - **Red**: Special rules such as "treat one die as a 4-sided die."
  - **Green**: Effects like "double the result of a dice roll."
  - Effects can target yourself, opponents, or anyone.
- **Pip Styles**:
  - Numbers
  - Animals (e.g., wings, fangs, claws)
  - Symbols (e.g., flames, stars, waves)
  - Abstract shapes
- Each type of die has its own potential outcomes, influencing the effects available to the player.

### Risk and Reward

- Rolling more dice increases the probability of unwanted outcomes (e.g., "snake eyes").
- Players must carefully consider:
  - The number of dice to roll.
  - The types of dice to include in their roll.
  - The potential for powerful combos versus detrimental effects.

## Secondary Mechanics

### Deckbuilding

- Players collect new dice through gameplay (e.g., winning hands, completing challenges).
- Dice can be swapped into the active "deck" for use in rolls.
- Rare or powerful dice add unique effects but may increase risk or complexity.
- Strategic decisions include:
  - Which dice to include in the active pool.
  - How to balance risk versus potential rewards.

### Combat Mechanics

- Players select up to 7 dice from their "dice bag" to roll each round. The minimum and default is 2. If no dice are available, players use plain, undecorated dice.
- Players roll their selected dice, and all results are visible to every player.
- During the second half of the turn, players choose what to do with each of their dice:
  - Dice can be used to capture enemy dice, apply special effects, or contribute to scoring.
  - Each die performs its action even if captured by another player, unless a specific ability prevents the action.
- After the action phase, scores are derived from the dice that remain in play.
- The player with the best score at the end of the round wins.

### Scoring and Victory Conditions
- The player with the best score at the end of the round selects one die from all dice stolen during that round to add to their dice bag.
- The game proceeds for three rounds.
- The player with the highest cumulative score across all three rounds is declared the victor.

## Visual and Thematic Elements

- Dice are designed with intricate, eye-catching aesthetics to emphasize their properties:
  - Semi-transparent red dice with golden pips for fire-like effects.
  - Opaque green dice with dark, organic patterns for unique rules.
  - Luminescent blue dice with glowing symbols for utility effects.
- Themes and settings may include:
  - A mystical world where dice represent elemental forces.
  - A duel between players using dice as tools of strategy and power.

## Progression System

- Players build their dice bag by winning dice from opponents and acquiring new ones through challenges.
- The game focuses on competitive play, with no narrative campaign for now.
- The core loop revolves around enhancing and customizing the dice bag, creating a unique playstyle for each player.

## Technical Design

### Technologies
- **Languages and Frameworks**:
  - The game will be built using **TypeScript** for type-safe development.
  - **Webpack** will be used for bundling and serving the game during development.
  - **Three.js** will provide the rendering engine for visualizing the dice and game world.
  - **Yarn** will be used as the package manager for dependency management.

- **Backend**:
  - There will be no backend initially; the entire game will run in the client browser.
  - Webpack will serve the game during development to simplify iteration and testing.

### Performance
- Performance optimization will prioritize:
  - **Smoothness over peak FPS**, ensuring consistent performance rather than brief performance spikes.
  - Running smoothly on lower-tier hardware, including older phones and laptops.
  - Minimizing battery usage on mobile devices, leveraging ARM-optimized techniques where applicable.
- Simple performance tricks will be employed where effort and risk are low, such as:
  - Optimizing Three.js scenes with object pooling and frustum culling.
  - Reducing draw calls by batching similar objects.
  - Lowering resolution or effects dynamically based on hardware capabilities.

### User Interface

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

### Using AI for Development

AI tools will be utilized to scaffold and accelerate development, providing a foundation for iterative refinement. Below is the prompt designed for generating the project structure using CodePilot:

#### CodePilot Prompt

"""
You are tasked with scaffolding a TypeScript-based browser game using Webpack, Yarn, and Three.js. The game is a dice-based strategy game featuring the following requirements:

1. **Core Systems**:

   - Object-oriented structure with classes for "Dice" and "Abilities".
   - Abilities are dynamically loaded from JSON files, using a generic interface to allow future data source changes.

2. **Testing**:

   - Test-driven development setup using Jest, with mocks to isolate individual classes during tests.

3. **Persistence**:

   - A system to save player data, supporting file system API, browser storage, and a default discard behavior.

4. **UI**:

   - Touch-friendly menus for "Main Menu," "Game Settings" (with Controls, Audio, Video tabs), and "Help Menu."

5. **Performance**:

   - Emphasis on smooth performance, optimized for low-tier hardware and mobile devices.

Generate the full project structure, including sample code for the above systems and configurations for Webpack and Jest.
"""

