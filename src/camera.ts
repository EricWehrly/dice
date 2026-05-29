import * as THREE from 'three';
import { CameraType, ThreeCam } from '../engine/js/rendering/Threecam';
import ThreeJSRenderContext from '../engine/js/rendering/contexts/ThreeJS.RenderContext';
import { ensureDiceLighting } from './rendering/lighting';

export function createCameraDebugOverlay(container: HTMLElement, cameraRig: ThreeCam): void {
    const lookTarget = new THREE.Vector3(0, 0, 0);

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'roll3d-debug-toggle';
    toggleButton.textContent = 'Camera Debug';

    const panel = document.createElement('div');
    panel.className = 'roll3d-debug-panel is-hidden';

    const title = document.createElement('h4');
    title.className = 'roll3d-debug-title';
    title.textContent = 'Roll 3D Camera';
    panel.appendChild(title);

    const fields = document.createElement('div');
    fields.className = 'roll3d-debug-fields';

    const inputMap: Record<string, HTMLInputElement> = {};
    const addField = (key: string, labelText: string): void => {
        const row = document.createElement('label');
        row.className = 'roll3d-debug-row';

        const label = document.createElement('span');
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.className = 'roll3d-debug-input';

        row.appendChild(label);
        row.appendChild(input);
        fields.appendChild(row);

        inputMap[key] = input;
    };

    addField('posX', 'Pos X');
    addField('posY', 'Pos Y');
    addField('posZ', 'Pos Z');
    addField('targetX', 'Target X');
    addField('targetY', 'Target Y');
    addField('targetZ', 'Target Z');
    addField('fov', 'FOV');

    panel.appendChild(fields);

    const actions = document.createElement('div');
    actions.className = 'roll3d-debug-actions';

    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.className = 'roll3d-debug-action';
    applyButton.textContent = 'Apply';

    const syncButton = document.createElement('button');
    syncButton.type = 'button';
    syncButton.className = 'roll3d-debug-action';
    syncButton.textContent = 'Sync';

    actions.appendChild(applyButton);
    actions.appendChild(syncButton);
    panel.appendChild(actions);

    const syncFromCamera = (): void => {
        const camera = cameraRig.camera;

        inputMap.posX.value = camera.position.x.toFixed(2);
        inputMap.posY.value = camera.position.y.toFixed(2);
        inputMap.posZ.value = camera.position.z.toFixed(2);
        inputMap.targetX.value = lookTarget.x.toFixed(2);
        inputMap.targetY.value = lookTarget.y.toFixed(2);
        inputMap.targetZ.value = lookTarget.z.toFixed(2);

        if (camera instanceof THREE.PerspectiveCamera) {
            inputMap.fov.value = camera.fov.toFixed(1);
        } else {
            inputMap.fov.value = '';
        }
    };

    const parseInput = (key: string, fallback: number): number => {
        const value = Number.parseFloat(inputMap[key].value);
        return Number.isFinite(value) ? value : fallback;
    };

    const applyToCamera = (): void => {
        const camera = cameraRig.camera;

        camera.position.set(
            parseInput('posX', camera.position.x),
            parseInput('posY', camera.position.y),
            parseInput('posZ', camera.position.z),
        );

        lookTarget.set(
            parseInput('targetX', lookTarget.x),
            parseInput('targetY', lookTarget.y),
            parseInput('targetZ', lookTarget.z),
        );
        cameraRig.lookAt(lookTarget);

        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = parseInput('fov', camera.fov);
            camera.updateProjectionMatrix();
        }

        syncFromCamera();
    };

    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('is-hidden');
        if (!panel.classList.contains('is-hidden')) {
            syncFromCamera();
        }
    });

    applyButton.addEventListener('click', applyToCamera);
    syncButton.addEventListener('click', syncFromCamera);

    Object.values(inputMap).forEach((input) => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                applyToCamera();
            }
        });
    });

    container.appendChild(toggleButton);
    container.appendChild(panel);
    syncFromCamera();
}

export function initializeRoll3DCamera(roll3dScreen: HTMLElement): ThreeCam {
    ThreeJSRenderContext.configure({
        parentElement: roll3dScreen,
    });
    
    ensureDiceLighting(ThreeJSRenderContext.Instance.scene);

    const diceMainCamera = new ThreeCam({
        name: 'dice-main',
        cameraType: CameraType.PERSPECTIVE,
        enableControls: true,
        position: new THREE.Vector3(0.5, 5, 3),
        target: new THREE.Vector3(1, 0, 0),
        fov: 45,
        near: 0.1,
        far: 1000,
    });

    createCameraDebugOverlay(roll3dScreen, diceMainCamera);

    return diceMainCamera;
}
