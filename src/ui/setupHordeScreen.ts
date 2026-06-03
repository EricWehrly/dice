import { ScreenManager } from '../utils/ScreenManager';
import { HordeScene } from '../rendering/3d/scenes/HordeScene';
import { DiceEquipmentBag } from '../game/DiceEquipmentBag';
import { DieModificationPanel } from '../ui/DieModificationPanel';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';
import Events from '../../engine/js/events';
import {
    TrickEvents,
    HORDE_SCREEN_STATE_EVENT,
    type DieSelectedEvent,
    type HordeScreenStateEvent,
} from '../game/contracts/TrickContracts';

interface SetupHordeScreenParams {
    bag: DiceEquipmentBag;
    hordeScreenElement: HTMLElement;
    roll3dScreenElement: HTMLElement;
    screenManager: ScreenManager;
    dieModificationPanel: DieModificationPanel;
    hordeTabButton: HTMLElement;
    roll3dTabButton: HTMLElement;
}

/**
 * setupHordeScreen
 * Initializes the horde tab: creates the 3D scene, wires input/output,
 * and integrates with the modification panel for equip/unequip functionality.
 */
export function setupHordeScreen({
    bag,
    hordeScreenElement,
    roll3dScreenElement,
    screenManager,
    dieModificationPanel,
    hordeTabButton,
    roll3dTabButton,
}: SetupHordeScreenParams): void {
    let hordeScene: HordeScene | null = null;

    const moveSharedCanvas = (target: HTMLElement): void => {
        // TECH DEBT: this shared canvas handoff is temporary until the camera/render ownership
        // is moved into the engine layer.
        const canvas = ThreeJSRenderContext.Instance.canvas;
        if (canvas.parentElement !== target) {
            target.appendChild(canvas);
            ThreeJSRenderContext.Instance.onWindowResize();
        }
    };

    const ensureHordeScene = (): HordeScene => {
        if (!hordeScene) {
            hordeScene = new HordeScene(bag, hordeScreenElement);
        }
        return hordeScene;
    };

    hordeTabButton.addEventListener('click', () => {
        // TECH DEBT: Horde currently borrows the roll renderer instead of owning a dedicated scene.
        moveSharedCanvas(hordeScreenElement);
        ensureHordeScene().enter();
        Events.RaiseEvent<HordeScreenStateEvent>(HORDE_SCREEN_STATE_EVENT, { active: true });
    });

    roll3dTabButton.addEventListener('click', () => {
        const roll3dCanvasHost = roll3dScreenElement.querySelector<HTMLElement>('.roll-3d-canvas-host');
        if (!roll3dCanvasHost) {
            return;
        }

        // TECH DEBT: exiting Horde needs to restore the shared canvas to the roll host for now.
        hordeScene?.exit();
        moveSharedCanvas(roll3dCanvasHost);
        Events.RaiseEvent<HordeScreenStateEvent>(HORDE_SCREEN_STATE_EVENT, { active: false });
    });

    // Listen for die selection from the horde scene (click or Enter key)
    Events.Subscribe<DieSelectedEvent>(TrickEvents.DIE_SELECTED, (payload) => {
        if (!payload.dieId || payload.source !== 'scene') {
            return;
        }

        dieModificationPanel.show();
    });

    // Register horde tab with screen manager
    screenManager.register('horde', hordeScreenElement, [hordeTabButton]);
}
