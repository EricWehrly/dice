import * as THREE from 'three';

const RATTLE_AMPLITUDE = 0.2;
const ROTATION_AMPLITUDE = 0.1;

/**
 * Generates an array of rattle times based on the given parameters.
 * @param start - The start time of the rattle.
 * @param increment - The increment between each rattle time.
 * @param count - The number of rattle times to generate.
 * @returns An array of rattle times.
 */
function incrementingAnimationTimes(start: number, increment: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i * increment);
}

export function createRattleTracks(destination: THREE.Vector3) {
  const RATTLE_TIMES = incrementingAnimationTimes(1.5, 0.1, 6); // Adjust parameters as needed
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
