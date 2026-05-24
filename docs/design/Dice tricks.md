Dice trick bag
## Summary

You have a "bag" of dice. 
You're trying to roll various tricks to score modifiers you can apply to your dice. Sometimes winning new dice. 
New tricks discovered grant new modifiers. 
High scores can increase, and new high scores earn new cosmetics
(perhaps indirectly, through some separate point system)

For visuals we should probably use [[Dice visuals]]
Let's try to do simple 2D visuals or descriptions first before depending on the fancy 3d implementations

We need to decide a way to let the player re-roll some die in order to try to get attempted outcomes. Maybe just straight up allow it. 

---
## Tricks

Tricks you can pull off to get rewards:
- each new decimal place achieved grants you a fresh 1d6 to use
(so scoring 10, 100, etc)
- "in a row" - score the same roll value
Let's say starting with 3x
- "of a kind" - roll two twos, three threes, etc.
- "ascending" roll a 1, a 2, a 3, and so on
- "matching" - all up-faces share non-default style
- "flashing" - present different non-default styles on each up-face
(can also extend to new trick for each visible face)

You can also mix score tricks:
- two of a kind twice in a row, through six of a kind 6x in a row, and on
- with matching/flashing/etc. 

---
## Modifications

It might be a good idea to have the player discover / unlock new modification types, maybe beyond a starting few. This could make them more compelling, and manages the information influx.

Given that we have all these different kinds of modifications already, it probably makes sense for now to just use one currency for the modification itself, rather than trying to manage tokens for each or some such. 
Or maybe try it as a gacha. You pull and get a modification token for randomly one of these 

Maybe there's meta-game where you discover you can use the tokens on the gacha machine itself, affecting its outcomes. 

### Non-cosmetic
- weight (comes in different gram amounts)
Attaches to a face of the die, affecting the chances that face will be down
(user convenience option to install weights perspective to "opposite" faces, so you can see the chance faces come up rather than down) (maybe it makes sense to just have a `%UP`for each die face when editing, with preview for deltas? )
- Magnet (comes in various N of strength)
Magnets will be drawn to each other, with a high chance to become attached. Affects each die 'up' chance
- brain
Can try to follow a playbook/intent. 
The player expresses this by flagging a pattern as intended / favorite / preferred. 
(so we need to give the player an interface for outcomes)

### Randomizer modifiers
- chance of odd vs even
- chance of higher vs lower 
- desire/bias to match neighbors
- random engine? 
Maybe we can implement "random" a few different ways and let them change the dice with that

Maybe it makes sense to just make stats, and allow enchantments to improve stats
Also enchantments should be better than straightforward. They should have some condition, constraint, or cost. Incur cost or encourage playstyle, to be interesting. 
Maybe each dice can only support 1 enchantment type until upgraded as "magic"
Upgrades up through legendary

### Stats
- crit 
Chance to 'crit': roll for double value
- face
Increasing adds more faces to the die
(if you increase, customize, decrease, then increase again, your face customizations should try to reapply)
- strength (N)
Capability check for exerting will toward faces
- multiplier
Chance to multiply the number of faces on the dice (2x mult means a 1d6 becomes a 1d12, multipliers can stack, chance can exceed 100% to go towards multiple 'hits' / stacking)
Faces 'extend' current face configurations. So if 1/6th of the dice face is magnetized, then every 6th face will be similarly magnetized and effect chances accordingly.