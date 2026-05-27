# F11: Pip Style Options Proposal

## Context

The shared 2D die face tile renderer now draws pips instead of numeric glyphs.
This document proposes style variants for future pip rendering updates.

Readability rule: when face value is above 9, render the numeral instead of dense pip clusters.
Style rule: engraving, bevel, glow, and related treatments should apply to the active face mark,
whether that mark is a pip pattern or a numeral fallback.

## What Is Most Common In Physical Dice

1. Filled round pips
2. Filled round pips with slight bevel/shading
3. Filled square pips (less common, seen in custom/casino-inspired sets)
4. Hollow ring pips (common in decorative dice sets)
5. Symbol pips (stars, skulls, suit icons, elemental marks) in novelty sets

Notes:
- For six-sided dice, pips are the conventional standard.
- For d8/d12/d20, printed numerals are far more common than pips in physical products.
- If we keep pips on high-face dice, readability should be tested carefully at small sizes.

## Candidate Styles For This Project

### Implemented

1. `circle` (default)
- Visual: classic filled circles
- Readability: excellent

2. `hollow-circle`
- Visual: ring outline
- Readability: high on light backgrounds

3. `square`
- Visual: arcade/tech feel
- Readability: high

4. `diamond`
- Visual: fantasy/deck-building vibe
- Readability: medium-high

5. `star`
- Visual: five-point filled star
- Readability: high

6. `heart`
- Visual: classic playing-card heart
- Readability: high

7. `club`
- Visual: playing-card club (three lobes + stem)
- Readability: medium-high at larger tile sizes

8. `clover`
- Visual: four-leaf clover (four lobes + stem)
- Readability: medium-high at larger tile sizes

9. `skull`
- Visual: cranium with eye sockets and teeth
- Readability: best at tile size 60+; eye sockets use tile background color for cutout
- Note: skull is the only shape that reads the tile background color

### Future

10. `engraved`
- Visual: pseudo-3D inset mark with highlight/shadow pass
- Readability: high
- Note: engraved and similar treatments should apply to whichever face mark is active — pips or numeral fallback alike

## Layout Approaches

1. Grid fill (implemented now)
- Works for any face value
- Best for d8/d12/d20 where exact pip count exceeds six

2. Classic d6 positions
- Use canonical dice positions for 1-6
- Most recognizable for traditional six-sided dice

3. Hybrid
- d6: canonical positions
- >6: compact grid or ring+center grouping

## Suggested API Direction

Add or continue using a per-render option:

- `pipShape: 'circle' | 'hollow-circle' | 'square' | 'diamond' | ...`

Likely future extension:

- `pipStyle: { shape, fill, stroke, bevel, glow }`

This keeps face layout logic and pip appearance logic separate, so we can iterate on style without rewriting die tile rendering.

## Recommendation

1. Keep `circle` as default.
2. Add a runtime style toggle for quick visual playtesting.
3. If we want physical-dice authenticity, implement classic d6 placement for d6 while keeping grid for higher-face dice.
4. Evaluate at two sizes before finalizing: tile 44 and tile 80.
