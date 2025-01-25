import { Camera, PerspectiveCamera } from 'three';

const FOV = 75;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;

export class CameraFactory {
    public static createCamera(
        fov: number = FOV,
        aspectRatio: number = ASPECT_RATIO,
        near: number = NEAR_CLIP,
        far: number = FAR_CLIP
    ): Camera {
        return new PerspectiveCamera(fov, aspectRatio, near, far);
    }
}
