import { initializeRoll3DCamera, type Roll3DFocusUiState } from '../camera';
import { type Bag } from '../game/Bag';
import { DieModificationPanel } from '../ui';

export interface SetupRoll3DScreenOptions {
    bag: Bag;
    roll3dScreen: HTMLElement;
    dieModificationPanel: DieModificationPanel;
}

export function setupRoll3DScreen(options: SetupRoll3DScreenOptions): void {
    const { bag, roll3dScreen, dieModificationPanel } = options;
    const roll3dCanvasHost = roll3dScreen.querySelector<HTMLElement>('.roll-3d-canvas-host');
    const roll3dDock = roll3dScreen.querySelector<HTMLElement>('.roll-3d-dock');
    const roll3dDockPanel = document.getElementById('roll-3d-die-mod-panel');

    if (!roll3dCanvasHost || !roll3dDock || !roll3dDockPanel) {
        throw new Error('Missing Roll 3D dock DOM elements');
    }

    dieModificationPanel.setRootElement(roll3dDockPanel);
    dieModificationPanel.setDockedMode(true);

    const onRoll3dFocusUiStateChange = (state: Roll3DFocusUiState): void => {
        if (state.panelOpen && state.focusedDieId) {
            dieModificationPanel.selectDieById(state.focusedDieId);
            roll3dDock.classList.remove('is-hidden');
            roll3dScreen.classList.add('is-focus-open');
            return;
        }

        roll3dDock.classList.add('is-hidden');
        roll3dScreen.classList.remove('is-focus-open');
    };

    initializeRoll3DCamera(roll3dScreen, bag, {
        onFocusUiStateChange: onRoll3dFocusUiStateChange,
        canvasParentElement: roll3dCanvasHost,
    });
}
