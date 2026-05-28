import { Bag } from './game/Bag';
import { ScoreProgressionTracker } from './game/score/ScoreProgressionTracker';
import { TrickEvaluator } from './game/tricks/TrickEvaluator';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';
import { DieModificationPanel } from './ui';
import { RollHistoryPanel } from './ui/RollHistoryPanel';
import { TrickCounterPanel } from './ui/TrickCounterPanel';
import { TrickPanel } from './ui/TrickPanel';
import { ScreenManager } from './utils/ScreenManager';
import { init as initThrower } from './thrower/index';
import Events from '../engine/js/events';
import ThreeJSRenderContext from '../engine/js/rendering/contexts/ThreeJS.RenderContext';
import './rendering/DiceGraphic';  // Import for class initialization and event wiring

// TODO: handle in managed UI instead
function wireRollButtons(bag: Bag) {
    const rollButtons = [
        document.getElementById('roll-btn') as HTMLButtonElement | null,
        document.getElementById('roll-3d-btn') as HTMLButtonElement | null,
    ];

    if (rollButtons.some((button) => !button)) {
        throw new Error('Missing required TB-01 DOM elements');
    }

    rollButtons.forEach((button) => {
        button!.addEventListener('click', () => {
            bag.rollAll();
        });
    });
}

const bag = new Bag();
wireRollButtons(bag);
new DiceCanvasRenderer(bag);

new ScoreProgressionTracker(bag);
new TrickEvaluator();

const dieModificationPanel = new DieModificationPanel(bag.dice);
dieModificationPanel.render();

// Initialize screen manager for play mode toggle
const screenManager = new ScreenManager();
screenManager.register('roll',
    document.getElementById('roll-screen')!,
    [document.getElementById('roll-mode-btn')!]
);
screenManager.register('mod',
    document.getElementById('die-mod-panel')!,
    [document.getElementById('mod-mode-btn')!]
);

// Mount 3D viewport: configure render context to use the container.
// ResizeObserver will automatically size the renderer when the container becomes visible.
const roll3dScreen = document.getElementById('roll-3d-screen')!;
ThreeJSRenderContext.configure({
    parentElement: roll3dScreen,
});
initThrower();

screenManager.register('roll-3d',
    roll3dScreen,
    [document.getElementById('roll-3d-mode-btn')!]
);

screenManager.switchTo('roll-3d');

const trickCounterPanel = new TrickCounterPanel();
trickCounterPanel.render();

const trickPanel = new TrickPanel();
trickPanel.render();

const rollHistoryPanel = new RollHistoryPanel(bag);
rollHistoryPanel.render();

if (!Events.EventHasFired(Events.List.GameStart)) {
    Events.RaiseEvent(Events.List.GameStart, null, { finalFire: true });
}
