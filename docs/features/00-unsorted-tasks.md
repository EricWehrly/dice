## What's in this file are things that need to be done, which have not yet been fleshed out, evaluated, or mapped into the roadmap.

(done?)
- core lock should be a style instead (commit current plan first)

(done?)
- show all die faces in mod carousel (if they can fit)
if there are too many faces and we need to 'truncate', throw a warning in the console

- initialize high score as the max value of the die in the bag
(should be 1d6. because we're currently testing starting with 3d6, the high score should be 18)
I want to make sure that the user doesn't earn a die on their first roll that's over 10, as we should already count as having unlocked both the 10s and the 100s dies. I think we need prevantative logic for that.

- when a trick is accomplished, "light up" the trick in the list
(border-color?)
do it quickly but not immediately
fade in quick but fade out real slow
no vertical displacement (difference) for any elements
we can adjust initial border size to allow (pixel space) for like a glow that becomes dimmer

- for high score: capture from the canvas just the die that rolled
show that (as data uri if possible) in the high score area

- drag to transfer lock (remove 1 pip to add 1 to another dice and lock it)
(drag to transfer can become a more robust mechanic later)

- (later) unlock and then buy the sword, heart, and shield

- default circle pip is score / currency
different pip faces are worth more currency
squares are 2x
rings are 8x
gems are 10x

- colors are worth score
each band worth 0-255
full black (RGB 000) is worth 0
white is worth 768
but you can increase / get a higher score by alternating colors
maybe brighter isn't necessarily worth more, but combining is
so doing RGB LED (lol gaemr meme) is like the highest score

- move 'resources' to canvas screen
and draw them with the appropriate (pip) icons related to them
and ui scaling as in other places...