import { Bag } from './game/Bag';
import { ScoreProgressionTracker } from './game/score/ScoreProgressionTracker';
import { TrickEvaluator } from './game/tricks/TrickEvaluator';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';
import { ScorePanel } from './ui/ScorePanel';
import { TrickCounterPanel } from './ui/TrickCounterPanel';
import { TrickPanel } from './ui/TrickPanel';

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

new ScoreProgressionTracker(bag);
new TrickEvaluator();

const scorePanel = new ScorePanel();
scorePanel.render();

const trickCounterPanel = new TrickCounterPanel();
trickCounterPanel.render();

const trickPanel = new TrickPanel();
trickPanel.render();
