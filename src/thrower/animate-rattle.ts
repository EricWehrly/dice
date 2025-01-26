import * as THREE from 'three';

const RATTLE_AMPLITUDE = 0.2;
const ROTATION_AMPLITUDE = Math.PI / 32; // Convert to radians
const EULER_ORDER = 'XYZ'; // Explicitly set rotation order

export function createRattleTracks(destination: THREE.Vector3) {
  // Use normalized times (0-1), will be scaled by AnimationSequencer
  const RATTLE_TIMES = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const rattlePositions = [];
  const rattleRotations = [];

  for (let i = 0; i < RATTLE_TIMES.length; i++) {
    const diminishFactor = 1 - (i / (RATTLE_TIMES.length - 1));
    const posOffset = RATTLE_AMPLITUDE * diminishFactor;
    const rotOffset = ROTATION_AMPLITUDE * diminishFactor;

    rattlePositions.push(
      destination.x + (Math.random() * 2 - 1) * posOffset,
      destination.y,
      destination.z + (Math.random() * 2 - 1) * posOffset
    );

    // Create proper Euler rotation
    const rotation = new THREE.Euler(
      rotOffset * (Math.random() * 2 - 1),
      rotOffset * (Math.random() * 2 - 1), 
      rotOffset * (Math.random() * 2 - 1),
      EULER_ORDER
    );

    rattleRotations.push(rotation.x, rotation.y, rotation.z);
  }

  const rattlePositionTrack = new THREE.VectorKeyframeTrack(
    '.position',
    RATTLE_TIMES,
    rattlePositions
  );

  const rattleRotationTrack = new THREE.VectorKeyframeTrack(
    '.rotation[.]',
    RATTLE_TIMES,
    rattleRotations
  );

  return { rattlePositionTrack, rattleRotationTrack };
}
