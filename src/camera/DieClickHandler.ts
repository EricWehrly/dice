import * as THREE from 'three';
import { Die } from '../game/Die';
import { getEntityForMesh } from '../rendering/EntityMeshRegistry';

export interface DieClickHandlerOptions {
    canvas: HTMLCanvasElement;
    camera: THREE.Camera;
    scene: THREE.Scene;
    onClickResolved: (die: Die | null, event: MouseEvent) => boolean;
}

export class DieClickHandler {
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();

    constructor(private readonly options: DieClickHandlerOptions) {
        this.options.canvas.addEventListener('mouseup', this.handleMouseUp, true);
    }

    dispose(): void {
        this.options.canvas.removeEventListener('mouseup', this.handleMouseUp, true);
    }

    private readonly handleMouseUp = (event: MouseEvent): void => {
        if (event.button !== 0 || event.target !== this.options.canvas) {
            return;
        }

        const die = this.resolveDieFromEvent(event);
        const consumed = this.options.onClickResolved(die, event);
        if (!consumed) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    };

    private resolveDieFromEvent(event: MouseEvent): Die | null {
        const rect = this.options.canvas.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);

        this.pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.options.camera);
        const intersections = this.raycaster.intersectObjects(this.options.scene.children, true);
        for (const hit of intersections) {
            const entity = getEntityForMesh(hit.object);
            if (entity instanceof Die) {
                return entity;
            }
        }

        return null;
    }
}
