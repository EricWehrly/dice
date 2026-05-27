import { Bag } from './game/Bag';
import { ScoreProgressionTracker } from './game/score/ScoreProgressionTracker';
import { TrickEvaluator } from './game/tricks/TrickEvaluator';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';
import { ScorePanel } from './ui/ScorePanel';
import { DieModificationPanel } from './ui';
import { RollHistoryPanel } from './ui/RollHistoryPanel';
import { TrickCounterPanel } from './ui/TrickCounterPanel';
import { TrickPanel } from './ui/TrickPanel';
import { ScreenManager } from './utils/ScreenManager';
import { init as initThrower } from './thrower/index';
import ThreeJSRenderContext from '../engine/js/rendering/contexts/ThreeJS.RenderContext';

// TODO: handle in managed UI instead
function wireRollButton(bag: Bag) {
    const rollButton = document.getElementById('roll-btn') as HTMLButtonElement | null;

    if (!rollButton) {
        throw new Error('Missing required TB-01 DOM elements');
    }

    rollButton.addEventListener('click', () => {
        bag.rollAll();
    });
}

const bag = new Bag();
wireRollButton(bag);
new DiceCanvasRenderer(bag);

const scoreTracker = new ScoreProgressionTracker(bag);
new TrickEvaluator();

const scorePanel = new ScorePanel(scoreTracker.getHighScore());
scorePanel.render();

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

// Mount 3D viewport: init thrower (creates ThreeJSRenderContext canvas appended to body),
// then re-parent the canvas into the roll-3d screen container so it stays mounted on tab switch.
const roll3dScreen = document.getElementById('roll-3d-screen')!;
initThrower();
roll3dScreen.appendChild(ThreeJSRenderContext.Instance.canvas);

screenManager.register('roll-3d',
    roll3dScreen,
    [document.getElementById('roll-3d-mode-btn')!]
);

screenManager.switchTo('mod');

const trickCounterPanel = new TrickCounterPanel();
trickCounterPanel.render();

const trickPanel = new TrickPanel();
trickPanel.render();

const rollHistoryPanel = new RollHistoryPanel(bag);
rollHistoryPanel.render();
