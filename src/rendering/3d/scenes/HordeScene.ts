import * as THREE from 'three';
import { DiceEquipmentBag } from '../../../game/DiceEquipmentBag';
import { Die } from '../../../game/Die';
import { GetEntity3DGraphic } from '../../../../engine/js/rendering/entities/entity-3d-graphics';
import ThreeJSRenderContext from '../../../../engine/js/rendering/contexts/ThreeJS.RenderContext';
import Events from '../../../../engine/js/events';
import { TrickEvents, type DieSelectedEvent } from '../../../game/contracts/TrickContracts';
import Coordinate3D from '../../../../engine/js/coordinates/Coordinate3D';
import { ensureDiceLighting } from '../../lighting';

const COLS_PER_ROW = 6;
const DIE_SPACING = 3;
const FOCUSED_SCALE = 1.2;
const UNFOCUSED_SCALE = 1.0;

/**
 * HordeScene
 * A 3D grid-based collection browser showing all owned dice in a "trophy room" aesthetic.
 * - Dice arranged in rows/columns with even spacing.
 * - Arrow-key navigation to cycle through dice (focus highlight).
 * - Click to open modification panel.
 * - Equip/unequip toggle integrated with modification panel.
 */
export class HordeScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private bag: DiceEquipmentBag;
    private hostElement: HTMLElement;
    private diceGridMap = new Map<string, { die: Die; mesh: THREE.Object3D; gridIndex: number }>();
    private focusedGridIndex = 0;
    private renderContext: ThreeJSRenderContext;
    private savedPositions = new Map<string, Coordinate3D>();
    private isActive = false;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;
    private clickHandler: ((e: MouseEvent) => void) | null = null;

    constructor(bag: DiceEquipmentBag, hostElement: HTMLElement) {
        this.bag = bag;
        this.hostElement = hostElement;
        this.renderContext = ThreeJSRenderContext.Instance;
        this.scene = this.renderContext.scene as THREE.Scene;
        this.camera = this.renderContext.camera as THREE.PerspectiveCamera;
        // TECH DEBT: Horde is still piggybacking on the singleton ThreeJS render context.
        // The engine camera migration should let this become a real scene owner.
        this.scene.background = new THREE.Color(0x1a1a1a); // Dark background for trophy room

        // Set up lighting for trophy room aesthetic
        ensureDiceLighting(this.scene);

        // Grid layout and rendering
        this.populateDiceGrid();

        // Event listeners
        this.setupInputHandlers(hostElement);
        Events.Subscribe(TrickEvents.BAG_CHANGED, () => {
            if (this.isActive) {
                this.applyHordeLayout();
            }
            this.updateDiceVisuals();
        });

        // Keep camera framing responsive when host is resized.
        window.addEventListener('resize', () => this.onWindowResize());
    }

    private populateDiceGrid(): void {
        const dice = this.bag.dice;
        this.scene.children
            .filter((child) => child.userData.isDie)
            .forEach((child) => {
                this.scene.remove(child);
            });

        this.diceGridMap.clear();

        dice.forEach((die, index) => {
            const row = Math.floor(index / COLS_PER_ROW);
            const col = index % COLS_PER_ROW;
            const x = (col - COLS_PER_ROW / 2 + 0.5) * DIE_SPACING;
            const y = -row * DIE_SPACING;
            const z = 0;

            const graphic = GetEntity3DGraphic(die);
            if (graphic) {
                const mesh = graphic;
                mesh.userData.isDie = true;
                mesh.userData.dieId = die.id;
                if (mesh.parent !== this.scene) {
                    this.scene.add(mesh);
                }

                this.diceGridMap.set(die.id, {
                    die,
                    mesh,
                    gridIndex: index,
                });
            }
        });

        // Focus on first die
        this.focusedGridIndex = 0;
        this.updateFocusHighlight();
    }

    public enter(): void {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        this.savedPositions.clear();

        window.requestAnimationFrame(() => {
            if (!this.isActive) {
                return;
            }

            this.populateDiceGrid();

            for (const die of this.bag.dice) {
                this.savedPositions.set(die.id, new Coordinate3D(die.position.x, die.position.y, die.position.z));
            }

            this.applyHordeLayout();
            this.frameDiceInView();
            this.updateDiceVisuals();
        });
    }

    public exit(): void {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;

        for (const die of this.bag.dice) {
            const savedPosition = this.savedPositions.get(die.id);
            if (savedPosition) {
                die.position.update(savedPosition);
            }
        }

        this.savedPositions.clear();
    }

    private applyHordeLayout(): void {
        this.bag.dice.forEach((die, index) => {
            const row = Math.floor(index / COLS_PER_ROW);
            const col = index % COLS_PER_ROW;
            const x = (col - COLS_PER_ROW / 2 + 0.5) * DIE_SPACING;
            const y = -row * DIE_SPACING;
            const z = 0;

            die.position.update(new Coordinate3D(x, y, z));
        });
    }

    private updateDiceVisuals(): void {
        this.diceGridMap.forEach(({ mesh, die }) => {
            const isEquipped = this.bag.isEquipped(die.id);
            const isLocked = die.locked;

            // Scale based on focus
            const isFocused = this.diceGridMap.get(die.id)?.gridIndex === this.focusedGridIndex;
            const targetScale = isFocused ? FOCUSED_SCALE : UNFOCUSED_SCALE;
            mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            // Apply visual states
            if (isEquipped) {
                // Add a subtle glow or highlight (e.g., emissive material tint)
                mesh.traverse((child: any) => {
                    if (child.material) {
                        child.material.emissiveIntensity = 0.1;
                        child.material.emissive?.setHSL(0.1, 1, 0.4); // Gold-ish highlight
                    }
                });
            } else {
                // Neutral
                mesh.traverse((child: any) => {
                    if (child.material) {
                        child.material.emissiveIntensity = 0;
                    }
                });
            }

            // Lock badge (optional: add a visual indicator)
            if (isLocked) {
                // TODO: Add lock badge or overlay visual
            }
        });
    }

    private updateFocusHighlight(): void {
        this.diceGridMap.forEach(({ gridIndex }) => {
            if (gridIndex === this.focusedGridIndex) {
                // Focus is handled by updateDiceVisuals scale
            }
        });
        this.updateDiceVisuals();
    }

    private frameDiceInView(): void {
        const diceArray = Array.from(this.diceGridMap.values());
        if (diceArray.length === 0) return;

        const box = new THREE.Box3();
        diceArray.forEach(({ mesh }) => {
            box.expandByObject(mesh);
        });

        if (!box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = this.camera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) + 2;

            this.camera.position.set(center.x, center.y + 3, center.z + cameraZ);
            this.camera.lookAt(center);
        }
    }

    private setupInputHandlers(_hostElement: HTMLElement): void {
        this.keyHandler = (e: KeyboardEvent) => {
            const diceArray = Array.from(this.diceGridMap.values()).sort((a, b) => a.gridIndex - b.gridIndex);
            if (diceArray.length === 0) return;

            const maxIndex = diceArray.length - 1;
            let newIndex = this.focusedGridIndex;

            switch (e.key) {
                case 'ArrowUp':
                    newIndex = Math.max(0, this.focusedGridIndex - COLS_PER_ROW);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    newIndex = Math.min(maxIndex, this.focusedGridIndex + COLS_PER_ROW);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    newIndex = this.focusedGridIndex === 0 ? 0 : this.focusedGridIndex - 1;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    newIndex = this.focusedGridIndex === maxIndex ? maxIndex : this.focusedGridIndex + 1;
                    e.preventDefault();
                    break;
                case 'Enter':
                    this.onFocusedDieSelected();
                    e.preventDefault();
                    break;
            }

            if (newIndex !== this.focusedGridIndex) {
                this.focusedGridIndex = newIndex;
                this.updateFocusHighlight();
            }
        };

        this.clickHandler = (e: MouseEvent) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const rect = this.renderContext.canvas.getBoundingClientRect();
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            const diceArray = Array.from(this.diceGridMap.values());
            const meshes = diceArray.map(({ mesh }) => mesh);
            const intersects = raycaster.intersectObjects(meshes, true);

            if (intersects.length > 0) {
                let clickedMesh = intersects[0].object;
                while (clickedMesh.parent && !clickedMesh.userData.dieId) {
                    clickedMesh = clickedMesh.parent;
                }

                const dieId = clickedMesh.userData?.dieId;
                if (dieId) {
                    const entry = this.diceGridMap.get(dieId);
                    if (entry) {
                        this.focusedGridIndex = entry.gridIndex;
                        this.updateFocusHighlight();
                        this.onFocusedDieSelected();
                    }
                }
            }
        };

        window.addEventListener('keydown', this.keyHandler);
        this.renderContext.canvas.addEventListener('click', this.clickHandler);
    }

    private onFocusedDieSelected(): void {
        const diceArray = Array.from(this.diceGridMap.values()).sort((a, b) => a.gridIndex - b.gridIndex);
        const focusedEntry = diceArray[this.focusedGridIndex];

        if (focusedEntry) {
            // Dispatch event to open modification panel
            Events.RaiseEvent<DieSelectedEvent>(TrickEvents.DIE_SELECTED, {
                dieId: focusedEntry.die.id,
            });
        }
    }

    private onWindowResize(): void {
        if (this.isActive) {
            this.frameDiceInView();
        }
    }

    public getEquippedDice(): Die[] {
        return this.bag.getEquippedDice();
    }

    public dispose(): void {
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        if (this.clickHandler) {
            this.renderContext.canvas.removeEventListener('click', this.clickHandler);
            this.clickHandler = null;
        }
    }
}
