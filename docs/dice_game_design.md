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

### Scoring and Victory

- After all actions are resolved, scores are derived from the dice remaining in play.
- The player with the highest score wins the round.
- The round winner selects one stolen die from that round to add to their dice bag.
- The game proceeds through three rounds, and the player with the best cumulative score is declared the victor.

## Abilities

Abilities represent special powers that players can use during the game. They can be individual or belong to a set or category. Abilities are tagged to denote their type, allowing for strategic combinations and unique interactions.

### Ability Ideas

- **Acid**:
  - Burns away pips from dice.
- **Ice**:
  - Freezes dice, rendering their result unable to be changed (and rendering them immune to effects of other abilities, including theft).
- **Temporal**:
  - Alters turn order (needs further expansion).
- **Fortune (Luck)**:
  - Alters probabilities for players, abilities, or dice (including non-player dice that may belong to the dealer or other such "defaults").
- **Jester**:
  - Can invert abilities, targeting a player or particular die (including one's own).
  - Can direct (blanket) beneficial or negative effects towards or away from a particular player.
  - (Will have other "meddling" powers, TBD.)
- **Mult**:
  - Score multiplier per bounce and for "noteworthy" dice rolls.

## Noteworthy Rolls

Some rolls are considered "noteworthy" and may trigger special scoring or abilities. Examples include:

- **Highest Roll**:
  - The highest (two pair) on the board of all players (includes dealer dice if applicable).
- **Combo & Sequence**:
  - Any pair is a basic combo.
  - Dice coerced to roll in a pattern such as 1-2-3-4-5 (including using other players' dice, so long as they're in play) will provide the highest combo, similar to flushes and straights in poker.

## Visual and Thematic Elements

- Dice are designed with intricate, eye-catching aesthetics to emphasize their properties:
  - Semi-transparent red dice with golden pips for fire-like effects.
  - Opaque green dice with dark, organic patterns for unique rules.
  - Luminescent blue dice with glowing symbols for utility effects.
- Players are incentivized to collect dice based on aesthetic
  - having coordination between dice will result in greater eye candy
    - player entrance effects
    - dice roll effects
    - dice ability effects
    - player victory effects
    - "combo" spell effects
  - This can consider the appearance of which dice:
    - Are being rolled
    - Are currently chosen to be "in play" (after rolling)
    - are contrastingly not in play (to those that are)
    - Other players' dice for the above

## Progression System

- Players build their dice bag by winning dice from opponents and acquiring new ones through challenges.
- The game focuses on competitive play, with no narrative campaign for now.
- The core loop revolves around enhancing and customizing the dice bag, creating a unique playstyle for each player.

