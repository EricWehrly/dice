import { Bag } from './game/Bag';
import { ScoreProgressionTracker } from './game/score/ScoreProgressionTracker';
import { TrickEvaluator } from './game/tricks/TrickEvaluator';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';
import { DieModificationPanel } from './ui';
import { RollHistoryPanel } from './ui/RollHistoryPanel';
import { setupRenderPresetPanel } from './ui/RenderPresetPanel';
import { TrickCounterPanel } from './ui/TrickCounterPanel';
import { TrickPanel } from './ui/TrickPanel';
import { setupIsometricEasterEgg } from './roll3d/isometricEasterEgg';
import { setupRoll3DScreen } from './roll3d/setupRoll3DScreen';
import { ScreenManager } from './utils/ScreenManager';
import { init as initThrower } from './thrower/index';
import { initializeGameResources } from './game/resources/GameResources';
import Events from '../engine/js/events';
import './rendering/DiceGraphic';  // Import for class initialization and event wiring
import { MakeDieCharacter } from './game/DieCharacterFactory';
import { DieEquippedMixin } from './game/DieEquippedMixin';

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

function calculateBagMaxRoll(bag: Bag): number {
    const activeDice = bag.getActiveDice();
    return activeDice.reduce((sum, die) => sum + die.faceCount, 0);
}

const bag = new Bag();
const dieA = MakeDieCharacter([DieEquippedMixin]);
dieA.pipStyle = 'x';
dieA.bodyMaterial = 'brass';
// dieA.pipMaterial = 'brass';
bag.addDie(dieA);
const dieB = MakeDieCharacter([DieEquippedMixin]);
dieB.bodyMaterial = 'silver';
dieB.surfaceFinish = 'hammered';
// dieB.pipMaterial = 'brass';
bag.addDie(dieB);
const dieC = MakeDieCharacter([DieEquippedMixin]);
dieC.bodyMaterial = 'gold';
dieC.pipSize = 2.8;
dieC.pipStyle = 'clover';
dieC.surfaceFinish = 'polished';
bag.addDie(dieC);
const dieD = MakeDieCharacter([DieEquippedMixin]);
dieD.bodyMaterial = 'plastic';
dieD.surfaceFinish = 'plain';
bag.addDie(dieD);
const dieE = MakeDieCharacter([DieEquippedMixin]);
dieE.bodyMaterial = 'resin';
dieE.surfaceFinish = 'polished';
bag.addDie(dieE);

wireRollButtons(bag);
new DiceCanvasRenderer(bag);

// Initialize all game resources once before creating systems that depend on them
const initialHighScore = calculateBagMaxRoll(bag);
initializeGameResources(initialHighScore);

new ScoreProgressionTracker(bag);
new TrickEvaluator();

const dieModificationPanel = new DieModificationPanel(bag.getActiveDice());
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

const roll3dScreen = document.getElementById('roll-3d-screen')!;
setupIsometricEasterEgg({
    bag,
    roll3dScreen,
});

setupRoll3DScreen({
    bag,
    roll3dScreen,
    dieModificationPanel,
});

setupRenderPresetPanel();

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

const addTestDie = (): number => {
    bag.addDie(MakeDieCharacter([DieEquippedMixin]));
    return bag.getActiveDice().length;
};

declare global {
    interface Window {
        addTestDie: () => number;
        addDie: () => number;
    }
}
window.addTestDie = addTestDie;
window.addDie = addTestDie;
