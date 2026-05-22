import * as THREE from 'three';
import Entity from '../../engine/js/entities/character/Entity';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';
import WorldCoordinate from '../../engine/js/coordinates/WorldCoordinate';

interface FollowOptions {
  durationMs?: number;
  arcHeight?: number;
}

interface ActiveFollow {
  entity: Entity;
  start: THREE.Vector3;
  end: THREE.Vector3;
  durationMs: number;
  arcHeight: number;
  elapsedMs: number;
}

const DEFAULT_DURATION_MS = 500;
const DEFAULT_ARC_HEIGHT = 1.5;
const activeFollows = new Map<string, ActiveFollow>();
let registered = false;
let lastUpdateTime = performance.now();

export function initThrowPathFollower(): void {
  if (registered) {
    return;
  }

  // Run before entity 3D redraw so updated entity positions are rendered the same frame.
  ThreeJSRenderContext.RegisterRenderMethod(4, () => {
    updateFollows();
  });

  registered = true;
}

export function enqueueThrowPath(entity: Entity, start: THREE.Vector3, end: THREE.Vector3, options: FollowOptions = {}): void {
  const follow: ActiveFollow = {
    entity,
    start: start.clone(),
    end: end.clone(),
    durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
    arcHeight: options.arcHeight ?? DEFAULT_ARC_HEIGHT,
    elapsedMs: 0
  };

  activeFollows.set(entity.id, follow);
  entity.position.update(new WorldCoordinate(start.x, start.y, start.z));
}

function updateFollows(): void {
  if (activeFollows.size === 0) {
    lastUpdateTime = performance.now();
    return;
  }

  const now = performance.now();
  const deltaMs = now - lastUpdateTime;
  lastUpdateTime = now;

  for (const [entityId, follow] of activeFollows) {
    follow.elapsedMs += deltaMs;

    const normalizedTime = Math.min(follow.elapsedMs / follow.durationMs, 1);
    const easedTime = easeOutCubic(normalizedTime);

    const nextPosition = new THREE.Vector3().lerpVectors(follow.start, follow.end, easedTime);
    nextPosition.y += follow.arcHeight * 4 * easedTime * (1 - easedTime);

    follow.entity.position.update(new WorldCoordinate(nextPosition.x, nextPosition.y, nextPosition.z));

    if (normalizedTime >= 1) {
      activeFollows.delete(entityId);
    }
  }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
