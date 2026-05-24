import { Bag } from './game/Bag';
import { TrickEvaluator } from './game/tricks/TrickEvaluator';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';
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

new TrickEvaluator();
const trickPanel = new TrickPanel();
trickPanel.render();
