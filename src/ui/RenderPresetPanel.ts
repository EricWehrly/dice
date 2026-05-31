import * as THREE from 'three';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';

type RenderPresetId = 'balanced' | 'too-bright' | 'too-dark' | 'flat-diagnostic';

interface RenderPresetConfig {
    ambient: number;
    hemi: number;
    key: number;
    fill: number;
    rim: number;
    exposure: number;
    toneMapping: THREE.ToneMapping;
}

const RENDER_PRESETS: Record<RenderPresetId, RenderPresetConfig> = {
    balanced: {
        ambient: 0.25,
        hemi: 0.55,
        key: 0.9,
        fill: 0.35,
        rim: 0.25,
        exposure: 1.0,
        toneMapping: THREE.ACESFilmicToneMapping,
    },
    'too-bright': {
        ambient: 0.28,
        hemi: 0.62,
        key: 1.0,
        fill: 0.38,
        rim: 0.3,
        exposure: 1.28,
        toneMapping: THREE.ReinhardToneMapping,
    },
    'too-dark': {
        ambient: 0.2,
        hemi: 0.42,
        key: 0.72,
        fill: 0.24,
        rim: 0.18,
        exposure: 0.74,
        toneMapping: THREE.ACESFilmicToneMapping,
    },
    'flat-diagnostic': {
        ambient: 0.42,
        hemi: 0.75,
        key: 0.38,
        fill: 0.38,
        rim: 0.06,
        exposure: 1.0,
        toneMapping: THREE.NoToneMapping,
    },
};

export function setupRenderPresetPanel(): void {
    const presetContainer = document.getElementById('render-preset-buttons');
    if (!presetContainer) {
        return;
    }

    const presetButtons = Array.from(presetContainer.querySelectorAll<HTMLButtonElement>('[data-render-preset]'));
    if (presetButtons.length === 0) {
        return;
    }

    const applyPreset = (presetId: RenderPresetId): void => {
        const config = RENDER_PRESETS[presetId];
        const context = ThreeJSRenderContext.GetInstance();
        const scene = context.scene as THREE.Scene;

        const ambient = scene.getObjectByName('dice-ambient-light');
        const hemi = scene.getObjectByName('dice-hemi-light');
        const key = scene.getObjectByName('dice-key-light');
        const fill = scene.getObjectByName('dice-fill-light');
        const rim = scene.getObjectByName('dice-rim-light');

        if (ambient instanceof THREE.AmbientLight) {
            ambient.intensity = config.ambient;
        }
        if (hemi instanceof THREE.HemisphereLight) {
            hemi.intensity = config.hemi;
        }
        if (key instanceof THREE.DirectionalLight) {
            key.intensity = config.key;
        }
        if (fill instanceof THREE.DirectionalLight) {
            fill.intensity = config.fill;
        }
        if (rim instanceof THREE.DirectionalLight) {
            rim.intensity = config.rim;
        }

        context.setToneMapping(config.toneMapping, config.exposure);

        presetButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.renderPreset === presetId);
        });
    };

    presetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const presetId = button.dataset.renderPreset as RenderPresetId | undefined;
            if (!presetId || !(presetId in RENDER_PRESETS)) {
                return;
            }

            applyPreset(presetId);
        });
    });

    applyPreset('too-dark');
}
