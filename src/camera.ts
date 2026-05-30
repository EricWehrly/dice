import * as THREE from 'three';
import { CameraType, ThreeCam } from '../engine/js/rendering/Threecam';
import ThreeJSRenderContext from '../engine/js/rendering/contexts/ThreeJS.RenderContext';
import { ensureDiceLighting } from './rendering/lighting';
import Events from '../engine/js/events';
import { Bag, type BagChangedEvent } from './game/Bag';
import { TrickEvents } from './game/contracts/TrickContracts';
import { Die } from './game/Die';
import { IsDieEquipped } from './game/DieEquippedMixin';
import { GetEntity3DGraphic } from '../engine/js/rendering/entities/entity-3d-graphics';
import { CameraAnimator } from './camera/CameraAnimator';
import { calculateCameraForBounds } from './camera/FramingCalculator';
import { DieClickHandler } from './camera/DieClickHandler';
import { FocusedCameraDrift } from './camera/FocusedCameraDrift';

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

function getAspectRatio(camera: THREE.PerspectiveCamera): number {
    return camera.aspect > 0 ? camera.aspect : Math.max(window.innerWidth, 1) / Math.max(window.innerHeight, 1);
}

function getVisibleDiceBounds(bag: Bag): THREE.Box3 | null {
    const activeDice = bag.getActiveDice().filter((die) => die.active && IsDieEquipped(die));
    if (activeDice.length === 0) {
        return null;
    }

    const bounds = new THREE.Box3();
    let hasAny = false;

    activeDice.forEach((die: Die) => {
        const graphic = GetEntity3DGraphic(die);
        if (!graphic) {
            return;
        }

        const graphicBounds = new THREE.Box3().setFromObject(graphic);
        if (graphicBounds.isEmpty()) {
            return;
        }

        bounds.union(graphicBounds);
        hasAny = true;
    });

    return hasAny ? bounds : null;
}

function getDieBounds(die: Die): THREE.Box3 | null {
    const graphic = GetEntity3DGraphic(die);
    if (!graphic) {
        return null;
    }

    const bounds = new THREE.Box3().setFromObject(graphic);
    return bounds.isEmpty() ? null : bounds;
}

function applyCameraState(cameraRig: ThreeCam, state: { position: THREE.Vector3; target: THREE.Vector3; fov?: number }): void {
    const camera = cameraRig.camera;
    camera.position.copy(state.position);
    cameraRig.lookAt(state.target);

    if (cameraRig.controls) {
        cameraRig.controls.target.copy(state.target);
        cameraRig.controls.update(0);
    }

    if (camera instanceof THREE.PerspectiveCamera && typeof state.fov === 'number') {
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
    }
}

function initializeDynamicFraming(cameraRig: ThreeCam, bag: Bag): void {
    const camera = cameraRig.camera;
    if (!(camera instanceof THREE.PerspectiveCamera)) {
        return;
    }

    const animator = new CameraAnimator(cameraRig);
    const cameraDrift = new FocusedCameraDrift(cameraRig);
    let focusedDie: Die | null = null;
    let pendingFrame = false;
    let pendingAnimated = false;

    const focusConstraints = {
        paddingPercent: -0.2,
        depthOffsetPercent: 0,
    };

    const applyFocusedDrift = (stateTarget: THREE.Vector3): void => {
        cameraDrift.start(stateTarget);
    };

    const clearFocus = (animated: boolean): void => {
        const wasFocused = focusedDie !== null;
        focusedDie = null;
        cameraDrift.stop();
        if (wasFocused) {
            scheduleFrame(animated);
        }
    };

    const frameCamera = (animated: boolean): void => {
        const bounds = focusedDie ? getDieBounds(focusedDie) : getVisibleDiceBounds(bag);
        if (!bounds) {
            if (focusedDie) {
                clearFocus(false);
            }
            return;
        }

        const nextState = calculateCameraForBounds(
            bounds,
            {
            fovDegrees: camera.fov,
            aspectRatio: getAspectRatio(camera),
            },
            focusedDie ? focusConstraints : undefined,
        );

        if (animated) {
            animator.animateCameraTo(nextState, 400);
            if (focusedDie) {
                window.setTimeout(() => {
                    if (focusedDie) {
                        applyFocusedDrift(nextState.target);
                    }
                }, 410);
            }
            return;
        }

        applyCameraState(cameraRig, nextState);
        if (focusedDie) {
            applyFocusedDrift(nextState.target);
        }
    };

    const scheduleFrame = (animated: boolean): void => {
        pendingAnimated = pendingAnimated || animated;
        if (pendingFrame) {
            return;
        }

        pendingFrame = true;
        window.requestAnimationFrame(() => {
            pendingFrame = false;
            const useAnimation = pendingAnimated;
            pendingAnimated = false;
            frameCamera(useAnimation);
        });
    };

    if (Events.EventHasFired(Events.List.GameStart)) {
        scheduleFrame(false);
    } else {
        Events.Subscribe(Events.List.GameStart, () => {
            scheduleFrame(false);
        }, { oneTime: true });
    }

    Events.Subscribe<BagChangedEvent>(TrickEvents.BAG_CHANGED, () => {
        if (focusedDie && !bag.getActiveDice().some((die) => die.id === focusedDie?.id)) {
            clearFocus(true);
            return;
        }
        scheduleFrame(true);
    });

    Events.Subscribe('RendererResized', () => {
        scheduleFrame(false);
    });

    const renderContext = ThreeJSRenderContext.Instance;
    const canvas = renderContext.canvas;
    const scene = renderContext.scene as unknown as THREE.Scene;
    const dieClickHandler = new DieClickHandler({
        canvas,
        camera,
        scene,
        onClickResolved: (die) => {
            if (!die) {
                if (!focusedDie) {
                    return false;
                }

                clearFocus(true);
                return true;
            }

            if (!bag.getActiveDice().some((item) => item.id === die.id)) {
                return false;
            }

            focusedDie = die;
            cameraDrift.stop();
            scheduleFrame(true);
            return true;
        },
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            clearFocus(true);
        }
    });

    ThreeJSRenderContext.RegisterRenderMethod(25, () => {
        cameraDrift.update(performance.now());
    });

    Events.Subscribe(Events.List.GameStart, () => {
        if (!document.body.contains(canvas)) {
            dieClickHandler.dispose();
        }
    });
}

export function initializeRoll3DCamera(roll3dScreen: HTMLElement, bag: Bag): ThreeCam {
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

    initializeDynamicFraming(diceMainCamera, bag);
    createCameraDebugOverlay(roll3dScreen, diceMainCamera);

    return diceMainCamera;
}
