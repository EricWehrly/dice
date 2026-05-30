import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Bag } from '../../src/game/Bag';
import { DieSlotType, type DieEquipped, DieEquippedMixin } from '../../src/game/DieEquippedMixin';
import { MakeDieCharacter } from '../../src/game/DieCharacterFactory';
import { DieWeightMod } from '../../src/game/mods/DieWeightMod';
import { DieModificationPanel } from '../../src/ui/DieModificationPanel';

function installCanvasMocks(): void {
    const context = {
        setTransform: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        arc: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: text.length * 7 })),
        fillStyle: '#000',
        strokeStyle: '#000',
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetY: 0,
        globalAlpha: 1,
        lineWidth: 1,
        font: '10px sans-serif',
        textAlign: 'center',
        textBaseline: 'middle',
    } as unknown as CanvasRenderingContext2D;

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: vi.fn(() => context),
        configurable: true,
    });

    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
        value: vi.fn(() => ({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            width: 240,
            height: 140,
            right: 240,
            bottom: 140,
            toJSON: () => ({}),
        })),
        configurable: true,
    });
}

function getRequired<T extends Element>(selector: string): T {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Element not found: ${selector}`);
    }

    return element as T;
}

describe('DieModificationPanel integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        installCanvasMocks();
        document.body.innerHTML = '<div id="die-mod-panel"></div>';
    });

    it('installs and replaces weight mod target through panel install flow', () => {
        const bag = new Bag();
        const die = MakeDieCharacter([DieEquippedMixin], { id: 'die-1', faceCount: 6 }) as ReturnType<typeof MakeDieCharacter> & DieEquipped;
        bag.addDie(die);
        const panel = new DieModificationPanel(bag.getActiveDice() as Array<ReturnType<typeof MakeDieCharacter> & DieEquipped>);

        panel.render();

        const coreModSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector.value = 'weight-1.5';
        coreModSelector.dispatchEvent(new Event('change', { bubbles: true }));

        let targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '2';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        let installBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');
        installBtn.click();

        const installedAfterFirstInstall = die.getEquipped(DieSlotType.MOD);
        expect(installedAfterFirstInstall).toBeInstanceOf(DieWeightMod);
        expect(installedAfterFirstInstall).toMatchObject({ faceIndex: 2, grams: 1.5, id: 'weight-1.5' });

        targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '4';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        installBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');
        installBtn.click();

        const installedAfterSecondInstall = die.getEquipped(DieSlotType.MOD);
        expect(installedAfterSecondInstall).toBeInstanceOf(DieWeightMod);
        expect(installedAfterSecondInstall).toMatchObject({ faceIndex: 4, grams: 1.5, id: 'weight-1.5' });
    });

    it('uninstalls when selecting none and clears pending selection state', () => {
        const bag = new Bag();
        const die = MakeDieCharacter([DieEquippedMixin], { id: 'die-2', faceCount: 6 }) as ReturnType<typeof MakeDieCharacter> & DieEquipped;
        bag.addDie(die);
        const panel = new DieModificationPanel(bag.getActiveDice() as Array<ReturnType<typeof MakeDieCharacter> & DieEquipped>);

        panel.render();

        const coreModSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector.value = 'weight-2.0';
        coreModSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '3';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        getRequired<HTMLButtonElement>('.die-mod-install-btn').click();
        expect(die.getEquipped(DieSlotType.MOD)).not.toBeNull();

        const refreshedCoreSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        refreshedCoreSelector.value = 'none';
        refreshedCoreSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const refreshedTargetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        const refreshedInstallBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');

        expect(refreshedInstallBtn.disabled).toBe(false);
        expect(refreshedInstallBtn.textContent?.trim()).toBe('Uninstall');

        refreshedInstallBtn.click();

        const finalInstallBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');

        expect(die.getEquipped(DieSlotType.MOD)).toBeNull();
        expect(refreshedTargetSelector.disabled).toBe(true);
        expect(finalInstallBtn.disabled).toBe(true);
        expect(finalInstallBtn.textContent?.trim()).toBe('Install');
    });

    it('clears pending selection without changing die state when none selected before install', () => {
        const bag = new Bag();
        const die = MakeDieCharacter([DieEquippedMixin], { id: 'die-3', faceCount: 6 }) as ReturnType<typeof MakeDieCharacter> & DieEquipped;
        bag.addDie(die);
        const panel = new DieModificationPanel(bag.getActiveDice() as Array<ReturnType<typeof MakeDieCharacter> & DieEquipped>);

        panel.render();

        const coreModSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector.value = 'weight-1.0';
        coreModSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '1';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const refreshedCoreSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        refreshedCoreSelector.value = 'none';
        refreshedCoreSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const refreshedTargetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        const refreshedInstallBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');

        expect(die.getEquipped(DieSlotType.MOD)).toBeNull();
        expect(refreshedTargetSelector.disabled).toBe(true);
        expect(refreshedInstallBtn.disabled).toBe(true);
        expect(refreshedInstallBtn.textContent?.trim()).toBe('Install');
    });

    it('applies and clears the die pip style from selector changes', () => {
        const bag = new Bag();
        const die = MakeDieCharacter([DieEquippedMixin], { id: 'die-4', faceCount: 6 }) as ReturnType<typeof MakeDieCharacter> & DieEquipped;
        bag.addDie(die);
        const panel = new DieModificationPanel(bag.getActiveDice() as Array<ReturnType<typeof MakeDieCharacter> & DieEquipped>);

        panel.render();

        const faceStyleSelector = getRequired<HTMLSelectElement>('.die-mod-face-style-selector');
        faceStyleSelector.value = 'x';
        faceStyleSelector.dispatchEvent(new Event('change', { bubbles: true }));

        expect(die.pipStyle).toBe('x');

        const refreshedFaceStyleSelector = getRequired<HTMLSelectElement>('.die-mod-face-style-selector');
        refreshedFaceStyleSelector.value = 'none';
        refreshedFaceStyleSelector.dispatchEvent(new Event('change', { bubbles: true }));

        expect(die.pipStyle).toBe('');
    });

    it('converts pip size input to number and defaults invalid input to 0', () => {
        const bag = new Bag();
        const die = MakeDieCharacter([DieEquippedMixin], { id: 'die-5', faceCount: 6 }) as ReturnType<typeof MakeDieCharacter> & DieEquipped;
        bag.addDie(die);
        const panel = new DieModificationPanel(bag.getActiveDice() as Array<ReturnType<typeof MakeDieCharacter> & DieEquipped>);

        panel.render();

        const pipSizeInput = getRequired<HTMLInputElement>('.die-mod-pip-size-input');
        pipSizeInput.value = '1.7';
        pipSizeInput.dispatchEvent(new Event('change', { bubbles: true }));

        expect(die.pipSize).toBe(1.7);

        const refreshedPipSizeInput = getRequired<HTMLInputElement>('.die-mod-pip-size-input');
        refreshedPipSizeInput.value = 'not-a-number';
        refreshedPipSizeInput.dispatchEvent(new Event('change', { bubbles: true }));

        expect(die.pipSize).toBe(0);
        expect(refreshedPipSizeInput.value).toBe('0');
    });

});
