import * as THREE from 'three';
import pipPositions4 from './pipPositions4.json';
import pipPositions6 from './pipPositions6.json';
import pipPositions8 from './pipPositions8.json';
import pipPositions12 from './pipPositions12.json';
import pipPositions20 from './pipPositions20.json';

const pipPositionsMap: Record<number, Record<string, number[][]>> = {
    4: pipPositions4,
    6: pipPositions6,
    8: pipPositions8,
    12: pipPositions12,
    20: pipPositions20,
};

export class PipUtils {
    static loadPipPositions(faceCount: number): Record<string, number[][]> {
        const pipPositions = pipPositionsMap[faceCount];
        if (!pipPositions) {
            throw new Error(`Failed to load pip positions for face count ${faceCount}`);
        }
        return pipPositions;
    }

    static addPips(parent: THREE.Object3D, faceCount: number, foreColor: string) {
        const pipPositions = PipUtils.loadPipPositions(faceCount);

        const pipMaterial = new THREE.MeshBasicMaterial({ color: foreColor });
        const pipGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Adjust size and detail as needed

        const pips = new THREE.Group();

        Object.values(pipPositions).forEach(positions => {
            positions.forEach(position => {
                const pip = new THREE.Mesh(pipGeometry, pipMaterial);
                pip.position.set(position[0], position[1], position[2]);
                pips.add(pip);
            });
        });

        parent.add(pips);
    }
}
