import * as THREE from 'three';

const FOV = 75;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;
const ANIMATION_TIMES = [0, 1]; // Animation start and end times

export function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  function createCubeAtCursor(event: MouseEvent) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    // Spawn the cube behind the camera
    cube.position.set(camera.position.x, camera.position.y + 5, camera.position.z + 10);
    scene.add(cube);

    const vector = new THREE.Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    // Move the cube to the calculated position
    const track = new THREE.VectorKeyframeTrack('.position', ANIMATION_TIMES, [
      cube.position.x, cube.position.y, cube.position.z,
      pos.x, pos.y, pos.z
    ]);

    const clip = new THREE.AnimationClip('move', 1, [track]);
    const mixer = new THREE.AnimationMixer(cube);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1); // Play the animation one time
    action.clampWhenFinished = true; // Keep the last frame when finished
    action.play();

    function animate() {
      requestAnimationFrame(animate);
      mixer.update(0.01);
      renderer.render(scene, camera);
    }

    animate();
  }

  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      createCubeAtCursor(event);
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}
