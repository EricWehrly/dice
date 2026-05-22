import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createParabolicTrack } from './animate-parabolic';
import { createRattleTracks } from './animate-rattle';
import { RenderingContextManager } from '../rendering/RenderingContextManager';
import { AnimationSequencer } from '../utils/AnimationSequencer';
import { DiceConfig } from '../game/Dice';
import { DiceGraphic } from '../rendering/DiceGraphic';
import { createEntity } from '../../engine/js/entities/character/EntityBuilder';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';

const DISTANCE_BEHIND_CAMERA = 8;

export function createCubeAtCursor(event: MouseEvent, camera: THREE.PerspectiveCamera, renderContext: RenderingContextManager) {
  const faceCount = 6;

  // Calculate spawn position behind camera
  const spawnPosition = {
    x: camera.position.x,
    y: camera.position.y + 5,
    z: camera.position.z + DISTANCE_BEHIND_CAMERA
  };

  // Create a dice entity
  const diceEntity = createEntity()
    .withOptions({
      name: 'Thrown Dice',
      position: spawnPosition,
      faceCount: 6,
      foreColor: Colors.dodgerblue,
      backColor: Colors.antiquewhite
    })
    .build();

  // Configure 3D graphics
  (diceEntity as any).entity3DConfig = {
    graphicClass: DiceGraphic,
    visible: true,
    offset: { x: 0, y: 0, z: 0 }
  };

  // Create the graphic directly and get the mesh
  const diceGraphic = new DiceGraphic(diceEntity);
  const cube = diceGraphic.getGraphic() as THREE.Mesh;
  
  // Add to scene
  const context = ThreeJSRenderContext.Instance;
  (context.scene as unknown as THREE.Scene).add(cube);
  
  // Set the spawn position
  cube.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
  
  // Apply a random rotation to the dice
  applyRandomRotation(cube, faceCount);

  const cubeDestinationPosition = calculatePosition(event, camera);
  const mixer = animateCube(cube, cubeDestinationPosition);
  
  return {
    cube,
    mixer
  };
}

function applyRandomRotation(dice: THREE.Object3D, faceCount: number) {
  const randomFace = Math.floor(Math.random() * faceCount);
  const angle = (2 * Math.PI) / faceCount;
  dice.rotation.x = randomFace * angle;
  dice.rotation.y = randomFace * angle;
  dice.rotation.z = randomFace * angle;
}

function calculatePosition(event: MouseEvent, camera: THREE.PerspectiveCamera): THREE.Vector3 {
  const vector = new THREE.Vector3(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );

  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(distance));
}

function animateCube(cube: THREE.Mesh, cubeDestinationPosition: THREE.Vector3) {
  const sequencer = new AnimationSequencer(cube);

  const parabolicTrack = createParabolicTrack(cube.position, cubeDestinationPosition);
  sequencer.addTrack(parabolicTrack, {
    startTime: 0,
    duration: 1.0
  });

  const { rattlePositionTrack, rattleRotationTrack } = createRattleTracks(cubeDestinationPosition);
  sequencer.addTrack(rattlePositionTrack, {
    startTime: 0.8, // Start rattle before parabolic ends
    duration: 1.2,
    blendDuration: 0.2
  });
  
  sequencer.addTrack(rattleRotationTrack, {
    startTime: 0.8,
    duration: 1.2,
    blendDuration: 0.2
  });

  return sequencer.play();
}
