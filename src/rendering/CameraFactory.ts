import { Camera, PerspectiveCamera } from 'three';

const FOV = 75;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;

export class CameraFactory {
    private static get aspectRatio(): number {
        if (typeof window === 'undefined') return 1;
        else return (window.innerWidth || 1) / (window.innerHeight || 1);
    }

    public static createCamera(
        fov: number = FOV,
        aspectRatio: number = this.aspectRatio,
        near: number = NEAR_CLIP,
        far: number = FAR_CLIP
    ): Camera {
        return new PerspectiveCamera(fov, aspectRatio, near, far);
    }
}
