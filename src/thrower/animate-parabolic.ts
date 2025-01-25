import * as THREE from 'three';

const ANIMATION_TIMES = [0, 0.5, 1];
const PARABOLIC_PEAK_OFFSET_Y = 5;
const PARABOLIC_PEAK_OFFSET_Z = 2;

export function createParabolicTrack(start: THREE.Vector3, end: THREE.Vector3): THREE.VectorKeyframeTrack {
  const midY = (start.y + end.y) / 2 + PARABOLIC_PEAK_OFFSET_Y;
  const midZ = (start.z + end.z) / 2 + PARABOLIC_PEAK_OFFSET_Z;

  return new THREE.VectorKeyframeTrack('.position', ANIMATION_TIMES, [
    start.x, start.y, start.z,
    start.x, midY, midZ,
    end.x, end.y, end.z
  ]);
}
