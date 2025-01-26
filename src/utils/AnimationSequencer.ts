import * as THREE from 'three';

interface IAnimationConfig {
  startTime: number;
  duration: number;
  blendDuration?: number;
}

interface ITrackConfig extends IAnimationConfig {
  track: THREE.KeyframeTrack;
}

export class AnimationSequencer {
  private mixer: THREE.AnimationMixer;
  private tracks: ITrackConfig[] = [];
  private totalDuration: number = 0;

  constructor(target: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(target);
  }

  addTrack(track: THREE.KeyframeTrack, config: IAnimationConfig) {
    const trackConfig: ITrackConfig = {
      track,
      ...config
    };
    this.tracks.push(trackConfig);
    this.totalDuration = Math.max(
      this.totalDuration,
      config.startTime + config.duration
    );
  }

  play(): THREE.AnimationMixer {
    const tracks = this.tracks.map(config => this.adjustTrackTiming(config));
    const clip = new THREE.AnimationClip('sequence', this.totalDuration, tracks);
    
    const action = this.mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    
    if (this.tracks[0]?.blendDuration) {
      action.fadeIn(this.tracks[0].blendDuration);
    }
    
    action.play();
    return this.mixer;
  }

  private adjustTrackTiming(config: ITrackConfig): THREE.KeyframeTrack {
    const { track, startTime, duration } = config;
    const times = Array.from(track.times).map(time => 
      (time * duration / track.times[track.times.length - 1]) + startTime
    );
    
    return new (track.constructor as any)(
      track.name,
      times,
      track.values.slice()
    );
  }
}
