## What's in this file are things that need to be done, which have not yet been fleshed out, evaluated, or mapped into the roadmap.

- default circle pip is score / currency
gem faces are 10x currency value?

- colors are worth score
    each band worth 0-255
    full black (RGB 000) is worth 0
    white is worth 768
    but you can increase / get a higher score by alternating colors
    maybe brighter isn't necessarily worth more, but combining is
    so doing RGB LED (lol gaemr meme) is like the highest score

    arrives via rgb light core mod? 
    we should do a visual comparison test between rgb-light-effect-at-pip
    vs rgb light(s) as central dynamic light shining through pip faces

    (let's later allow the dice to be drawn with different colors in addition to the pips,
    and add it effectively as another pip, scored based on the RGB of the die body)

- for high score: capture die render from the canvas just the die that rolled
show that (image) (as data uri if possible) in the high score area

- drag to transfer lock (remove 1 pip to add 1 to another dice and lock it)
(drag to transfer can become a more robust mechanic later)

- along the lines of our lock transfer, it would be nice to have mod upgrades
    which cost some # of modification tokens to upgrade above & beyond the initial cost for the base mod
    upgrades for weight can increase or decrease weight from the default / middle value
    brain could have "smarter" variants (take more into account ...?)
    the above mentioned central light could be mono-colored before getting the RGB upgrade

- move 'resources' to canvas screen
and draw them with the appropriate (pip) icons related to them
and ui scaling as in other places...

- (later) unlock and then buy the sword, heart, and shield
with all 3, unlocks pvp
must deploy to pvp with at least one heart die
