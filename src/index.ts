import { DiceEquipmentBag } from './game/DiceEquipmentBag';
import { ScoreProgressionTracker } from './game/score/ScoreProgressionTracker';
import { TrickEvaluator } from './game/tricks/TrickEvaluator';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';
import { DieModificationPanel } from './ui';
import { RollHistoryPanel } from './ui/RollHistoryPanel';
import { setupRenderPresetPanel } from './ui/RenderPresetPanel';
import { TrickCounterPanel } from './ui/TrickCounterPanel';
import { TrickPanel } from './ui/TrickPanel';
import { setupIsometricEasterEgg } from './rendering/2d/isometricEasterEgg';
import { setupRoll3DScreen } from './rendering/3d/ui/setupRoll3DScreen';
import { setupHordeScreen } from './ui/setupHordeScreen';
import { ScreenManager } from './utils/ScreenManager';
import { init as initThrower } from './thrower/index';
import { initializeGameResources } from './game/resources/GameResources';
import Events from '../engine/js/events';
import './rendering/DiceGraphic';  // Import for class initialization and event wiring
import { MakeDieCharacter } from './game/DieCharacterFactory';
import { DieEquippedMixin } from './game/DieEquippedMixin';

// TODO: handle in managed UI instead
function wireRollButtons(bag: DiceEquipmentBag) {
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

const bag = new DiceEquipmentBag();
const dieA = MakeDieCharacter([DieEquippedMixin], {
    pipStyle: 'x',
    bodyMaterial: 'brass',
});
bag.addDie(dieA);
const dieB = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'silver',
    surfaceFinish: 'hammered',
});
bag.addDie(dieB);
const dieC = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'gold',
    pipSize: 2.8,
    pipStyle: 'clover',
    surfaceFinish: 'polished',
});
bag.addDie(dieC);
const dieD = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'plastic',
    surfaceFinish: 'plain',
});
bag.addDie(dieD);
const dieE = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'resin',
    surfaceFinish: 'polished',
});
bag.addDie(dieE);
const dieF = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'ceramic',
    surfaceFinish: 'plain',
});
bag.addDie(dieF);
const dieG = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'obsidian',
    surfaceFinish: 'polished',
});
bag.addDie(dieG);

// Additional dice for horde screen variety
const dieH = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'brass',
    surfaceFinish: 'hammered',
    pipStyle: 'circle',
});
bag.addDie(dieH);
const dieI = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'silver',
    surfaceFinish: 'polished',
    pipSize: 2.6,
});
bag.addDie(dieI);
const dieJ = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'gold',
    surfaceFinish: 'hammered',
});
bag.addDie(dieJ);
const dieK = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'ceramic',
    surfaceFinish: 'polished',
    pipStyle: 'clover',
});
bag.addDie(dieK);
const dieL = MakeDieCharacter([DieEquippedMixin], {
    bodyMaterial: 'resin',
    surfaceFinish: 'hammered',
});
bag.addDie(dieL);

// Auto-equip first 6 dice for gameplay
[dieA, dieB, dieC, dieD, dieE, dieF].forEach((die) => {
    bag.equip(die.id);
});

wireRollButtons(bag);
new DiceCanvasRenderer(bag);

// Initialize all game resources once before creating systems that depend on them
initializeGameResources(0);

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
const trickCounterPanel = new TrickCounterPanel();
trickCounterPanel.render();

setupIsometricEasterEgg({
    bag,
    roll3dScreen,
});

setupRoll3DScreen({
    bag,
    roll3dScreen,
    dieModificationPanel,
    trickCounterPanel,
});

setupRenderPresetPanel();

setupHordeScreen({
    bag,
    hordeScreenElement: document.getElementById('horde-screen')!,
    roll3dScreenElement: roll3dScreen,
    screenManager,
    dieModificationPanel,
    hordeTabButton: document.getElementById('horde-mode-btn')!,
    roll3dTabButton: document.getElementById('roll-3d-mode-btn')!,
});

initThrower();

screenManager.register('roll-3d',
    roll3dScreen,
    [document.getElementById('roll-3d-mode-btn')!]
);

screenManager.switchTo('roll-3d');

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
