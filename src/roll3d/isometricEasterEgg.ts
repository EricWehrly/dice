import Events from '../../engine/js/events';
import { type Bag } from '../game/Bag';
import { TrickEvents } from '../game/contracts/TrickContracts';
import { DieIsometricRenderer } from '../rendering/2d/DieIsometricRenderer';

export interface SetupIsometricEasterEggOptions {
    bag: Bag;
    roll3dScreen: HTMLElement;
}

export function setupIsometricEasterEgg(options: SetupIsometricEasterEggOptions): void {
    const { bag, roll3dScreen } = options;
    const easterEggHost = roll3dScreen.querySelector<HTMLElement>('.roll-3d-easter-egg');
    const easterEggToggle = document.getElementById('roll-3d-easter-egg-toggle') as HTMLInputElement | null;

    if (!easterEggHost || !easterEggToggle) {
        throw new Error('Missing Roll 3D isometric easter egg DOM elements');
    }

    const isometricRenderer = new DieIsometricRenderer();

    const renderIsometricEasterEgg = (): void => {
        const selectedDie = bag.getActiveDice()[0];
        if (!selectedDie) {
            return;
        }

        isometricRenderer.render({
            root: easterEggHost,
            faceCount: selectedDie.faceCount,
            currentCoreMod: null,
            coreModInstalledOnFace: null,
            style: (selectedDie.surfaceFinish ?? 'plain') as 'plain' | 'etched' | 'polished' | 'hammered',
        });
    };

    // TODO: Move this out of the management panel into a game menu and gate unlock through an in-game trick/achievement path.
    easterEggToggle.addEventListener('change', () => {
        roll3dScreen.classList.toggle('is-easter-egg-active', easterEggToggle.checked);
        if (easterEggToggle.checked) {
            renderIsometricEasterEgg();
        }
    });

    Events.Subscribe(TrickEvents.BAG_CHANGED, () => {
        if (!easterEggToggle.checked) {
            return;
        }

        renderIsometricEasterEgg();
    });
}