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

### Opening Gambit
- At the beginning of the game, each player rolls 2 plain dice.
- Players must assign one die to "Best Of" and one die to "Turn Order":
  - **Turn Order**: Higher numbers go first, lower numbers go last. Ties are resolved with a random plain dice roll.
  - **Best Of**: Tracks the hand count. Players aim to win a "best of 3" or similar setup. The average of all players' "Best Of" dice is rounded up to determine the target number of hands to win (e.g., if the dice values are 2, 4, 1, and 2, the average is 4.5, rounded to 5).

### Combat Mechanics
- Players select up to 7 dice from their "dice bag" to roll each round. The minimum and default is 2. If no dice are available, players use plain, undecorated dice.
- The goal of each hand is to achieve the highest score while strategically managing risk and rewards.
- A key mechanic is the ability to take opponents' dice:
  - Players can remove their own dice from play during a round to take an opponent's die.
  - This adds a layer of strategy as players balance winning the hand with weakening their opponents' dice pool.

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

## Potential Variants
- **Multiplayer Mode**: Players compete in head-to-head battles, using dice to outmaneuver their opponents.
- **Team Mode**: Players form teams to combine dice strategies and take on other teams.
- **Ranked Mode**: Competitive ranking system where players progress based on wins and strategic plays.

## Next Steps
- Prototype the core mechanics:
  - Basic dice rolling with risk/reward dynamics.
  - Strategic dice-taking system.
- Develop a visual style for the dice and game components.
- Playtest to refine balance and identify opportunities for deeper mechanics or additional layers of strategy.

