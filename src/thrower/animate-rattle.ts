import * as THREE from 'three';

const RATTLE_TIMES = [1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
const RATTLE_AMPLITUDE = 0.2;
const ROTATION_AMPLITUDE = 0.1;

export function createRattleTracks(destination: THREE.Vector3) {
  const rattlePositions = [];
  const rattleRotations = [];

  for (let i = 0; i < RATTLE_TIMES.length; i++) {
    const diminishFactor = 1 - (i / (RATTLE_TIMES.length - 1));
    const posOffset = RATTLE_AMPLITUDE * diminishFactor;
    const rotOffset = ROTATION_AMPLITUDE * diminishFactor;

    rattlePositions.push(
      destination.x + (i % 2 ? posOffset : -posOffset),
      destination.y,
      destination.z + (i % 2 ? posOffset : -posOffset)
    );

    rattleRotations.push(
      (i % 2 ? rotOffset : -rotOffset),
      (i % 3 ? rotOffset/2 : -rotOffset/2),
      (i % 2 ? -rotOffset : rotOffset)
    );
  }

  const rattlePositionTrack = new THREE.VectorKeyframeTrack(
    '.position',
    RATTLE_TIMES,
    rattlePositions
  );

  const rattleRotationTrack = new THREE.VectorKeyframeTrack(
    '.rotation',
    RATTLE_TIMES,
    rattleRotations
  );

  return { rattlePositionTrack, rattleRotationTrack };
}
