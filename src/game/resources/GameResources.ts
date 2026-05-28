import Resource from '../../../engine/js/entities/resource';

export const ResourceNames = {
    mods: 'mods',
    cosmetics: 'cosmetics',
    highScore: 'high_score',
} as const;

export const resourceIcons = {
    [ResourceNames.mods]: '\u2699',
    [ResourceNames.cosmetics]: '\u{1F58C}',
    [ResourceNames.highScore]: '\u25cc',
} as const;


// TODO: Initialize mods and cosmetics directly
// initialize high score on first bag update, calculating max score
export function initializeGameResources(initialHighScore: number): void {
    new Resource({
        name: ResourceNames.mods,
        value: 0,
        icon: resourceIcons[ResourceNames.mods],
    });

    new Resource({
        name: ResourceNames.cosmetics,
        value: 0,
        icon: resourceIcons[ResourceNames.cosmetics],
    });

    new Resource({
        name: ResourceNames.highScore,
        value: initialHighScore,
        icon: resourceIcons[ResourceNames.highScore],
    });
}
