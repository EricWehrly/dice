# F14 - Material System & Texture Authoring

Status: 🔄 In Progress

## Objective

Implement a material system that allows dice to have independent body and pip materials (e.g., "brass on wood"), with a pluggable texture generation architecture to enable material authors to add procedural, baked, or hybrid textures without modifying the core renderer.

## Current State

- **Runtime plumbing**: ✅ Complete
  - 11 materials fully wired: plastic, wood, stone, ceramic, resin, brass, steel, obsidian, jade, glass, crystal
  - Body/pip material selectors in modification panel
  - Material changes trigger live 3D view updates
  - Pip color logic corrected (uses pip material's pip color, not body color)

- **Texture Generation Architecture**: ✅ Implemented (F14 groundwork)
  - `MaterialTextureRegistry`: Global registry for material texture generators
  - `MaterialTextureGenerator`: Interface for pluggable texture generation
  - `PlasticMaterialGenerator`: Baseline color-based implementation
  - Flow: Material system → registry lookup → generator → texture
  - Fallback: If no generator registered, uses color-only rendering
  - **All future materials register their own generator without touching core code**

## Architecture Overview

### Material Texture Generator System

```
DiceGraphic.createMaterial()
    ↓
resolveDieMaterialPreset() → colors + finish profiles
    ↓
createPhysicalD6Material()
    ↓
createD6FaceAtlasMaterialTexture()
    ↓
MaterialTextureRegistry.get(material)
    ├─ Found: Call generator.generateTexture() → Full texture generation
    └─ Not found: Fallback to color-only rendering
```

### Key Files

- `src/rendering/textures/MaterialTextureGenerator.ts`: Interface definition
- `src/rendering/textures/MaterialTextureRegistry.ts`: Global registry (register/get)
- `src/rendering/textures/generators/PlasticMaterialGenerator.ts`: Baseline implementation
- `src/rendering/textures/DieFaceTextureAtlas.ts`: Updated to use registry
- `src/rendering/DiceGraphic.ts`: Initializes registry on load

### Adding a New Material

1. Create `src/rendering/textures/generators/[Material]MaterialGenerator.ts`
2. Implement `MaterialTextureGenerator` interface
3. Register in `MaterialTextureRegistry.register(myGenerator)`
4. **That's it** — no changes to core renderer needed

Example:
```typescript
export const WoodMaterialGenerator: MaterialTextureGenerator = {
    material: 'wood',
    label: 'Wood',
    generateTexture(options) {
        // Generate procedural wood grain or load baked texture
        return createWoodTexture(options);
    }
};
// Register once, anywhere, anytime (e.g., in DiceGraphic.static block)
MaterialTextureRegistry.register(WoodMaterialGenerator);
```

## Material Color Palette (Current Placeholders)

| Material | Body Color | Pip Color | Use Case |
|----------|-----------|-----------|----------|
| Plastic | #f5f5f2 | #1f2c35 | Baseline high-contrast |
| Wood | #8b6f47 | #2a1810 | Warm, natural organic feel |
| Stone | #a0a0a0 | #3a3a3a | Cool, earthy, matte |
| Ceramic | #f0e5d8 | #4a3c32 | Warm porcelain, smooth |
| Resin | #e8d5c4 | #2a2a2a | Glossy, translucent-like |
| Brass | #d4a574 | #3d3d2d | Golden metallic, warm |
| Steel | #d0d0d0 | #1a1a1a | Cool metallic, industrial |
| Obsidian | #1f1f1f | #e8e8e8 | High contrast, dark body |
| Jade | #3a6a4a | #d8e8d0 | Deep green, subtle variation |
| Glass | #e8f0f8 | #2a2a3a | Translucent pale blue |
| Crystal | #f0f8ff | #3a4a5a | Very light, icy tone |

## Texture Authoring Workflow (Phase 2+)

### For Each Material Generator

1. **Author texture** (choose one or combine):
   - **Procedural**: Generate patterns dynamically using Canvas 2D (wood grain, metal brushing, stucco)
   - **Baked**: Create in Blender/Substance Painter, import as texture atlas sheet
   - **Hybrid**: Procedural base + baked detail/normal maps overlaid

2. **Implement generator**:
   - Inherit base atlas generation from `createD6FaceAtlasTexture()`
   - Add procedural overlays or baked sampling
   - Test all four finishes (plain/etched/polished/hammered)

3. **Validate**:
   - Readability at gameplay camera distance
   - No UV shift/cropping with repeated material changes
   - Pips remain visible and readable
   - All finish profiles work as intended

4. **Test & Ship**:
   - Add snapshot test for generator output
   - Include before/after screenshots
   - Register generator in DiceGraphic or standalone loader
   - Create PR to mainline

## Prioritized Material Implementation Order

### Tier 1 - High Impact (Ship ASAP - best ROI)
1. **Wood** - Most requested, procedural grain candidates, high visual impact
2. **Brass** - Metallic polish response, straightforward finish tuning
3. **Stone** - Natural reference, good for procedural Voronoi/crack patterns

### Tier 2 - Medium Impact (Ship Mid)
4. **Steel** - Industrial aesthetic, distinct from brass with cooler tones
5. **Ceramic** - Smooth/matte response, gloss contrast, pottery feel
6. **Obsidian** - Dramatic high-contrast, mirrors/gloss simulation

### Tier 3 - Special/Niche (Ship Later - Polish Additions)
7. **Jade** - Subtle color variation, cultural appeal
8. **Resin** - Glossy/translucent simulation, modern craft feel
9. **Glass** - Challenging transparency, premium luxury feel
10. **Crystal** - Extreme clarity simulation, high-difficulty shimmer

### Tier 4 - Future Expansion (Post-MVP)
11. **Copper** - Oxidation states, patina aging effects
12. **Marble** - Veining patterns, elegant luxury
13. **Leather** - Textured surface, warm stitching accents
14. **Carbon Fiber** - Woven pattern, tech aesthetic
15. **Pearl** - Iridescent shimmer, luxury appeal

## Procedural Pattern Suggestions

### Wood
- Perlin noise grain with radial waves (growth rings)
- Darker sapwood edges, lighter heartwood center
- Finish responses: plain=matte, polished=glossy highlights, etched=grain exaggeration

### Brass
- Brushed directional noise + specular highlights
- Warm yellow-gold base, darker shading in recesses
- Finish responses: plain=matte brushing, polished=mirror gloss, etched=pattern amplification

### Stone
- Voronoi cellular patterns with random cracks
- Subtle color variance, matte overlay
- Finish responses: plain=rough pores, polished=smooth reflective, etched=deep cracks

### Obsidian
- High-gloss black with subtle specular simulation
- Reflective edges, subtle iridescent shimmer
- Finish responses: all keep glossy, but vary edge sharpness

### Ceramic
- Subtle radial gradient + gloss center
- Hand-thrown potter's mark variation
- Finish responses: plain=matte clay, polished=glazed shine, etched=texture accentuation

## Technical Constraints

- Keep `DieFaceTextureAtlas.ts` UV remap logic unchanged
- Do not alter die orientation mapping or face-up probability model  
- Maintain backward compatibility: missing generators fall back to color-only
- Textures must fit in 256px×256px per face (5% gap = ~243px usable per face in 3×2 grid)
- Generator calls must complete synchronously during material creation
- `DieMaterialPreset.ts` remains source of truth for color fallbacks

## Workflow Per Material (Tier 1, 2, 3)

1. Create generator file in `src/rendering/textures/generators/[Material]MaterialGenerator.ts`
2. Implement texture generation (procedural Canvas or baked import)
3. Validate all four finishes in roll screen
4. Screenshot texture results (plain, etched, polished, hammered variants)
5. Add snapshot test in `src/tests/rendering/generators/[Material]MaterialGenerator.test.ts`
6. Update `DieMaterialPreset.ts` color palette if texture shifts tone significantly
7. Register generator in `DiceGraphic.static` or dedicated generator loader
8. Update F14 document marking material complete
9. Create PR with generator + tests

## Expected Output Per Material

- **PR with**: MaterialGenerator implementation, screenshot comparisons, snapshot tests
- **Docs**: Material-specific notes in docs/textures/[material]-notes.md
- **Acceptance**: Roll screen shows realistic appearance; finishes respond appropriately; no regressions

## Known Unknowns

- Exact procedural formula for each material (requires iteration + playtesting)
- Whether baked textures justify bundle size tradeoff vs procedural
- Performance profile of procedural generation vs. cached textures
- How glass/crystal translucency should simulate in current pipeline

## Future: Dynamic Material Variants

Once texture authoring complete, consider per-material variants:
- **Wood**: Oak, Maple, Walnut, Cherry
- **Brass**: Polished, Patina, Verdigris
- **Stone**: Granite, Marble, Slate, Basalt

## Exit Criteria

- ✅ Runtime plumbing for 11 materials (done)
- ✅ Body/pip material selectors working (done)
- ✅ Texture generator registry + architecture (done)
- ✅ PlasticMaterialGenerator baseline (done)
- Tier 1 materials (wood, brass, stone) have realistic texture generators
- All materials pass readability + finish validation
- No UV shift/cropping regressions
- Roll screen screenshots document final appearance per tier
