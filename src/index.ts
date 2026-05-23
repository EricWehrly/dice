import Game from '../engine/js/main';
import Events from '../engine/js/events';
import * as THREE from 'three';

// Initialize 3D rendering system  
import ThreeJSRenderContext from '../engine/js/rendering/contexts/ThreeJS.RenderContext';
import ThreeCam, { CameraType } from '../engine/js/rendering/Threecam';

// Import dice configuration and graphics
import { DiceGraphic } from './rendering/DiceGraphic';
import { init as initThrower } from './thrower';

// Import entity builder
import { createEntity } from '../engine/js/entities/character/EntityBuilder';
import Entity from '../engine/js/entities/character/Entity';

// Scene setup function
function setupDiceScene() {
    const context = ThreeJSRenderContext.Instance;
    if (!context || !context.scene) {
        console.error('No ThreeJS context or scene available!');
        return;
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    (context.scene as unknown as THREE.Scene).add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    (context.scene as unknown as THREE.Scene).add(directionalLight);

    // Set a pleasant background color
    (context.scene as unknown as THREE.Scene).background = new THREE.Color('#2a2a2a');

    // Create a camera
    new ThreeCam({
        cameraType: CameraType.PERSPECTIVE,
        enableControls: true,  // Enable OrbitControls for easy viewing
        position: new THREE.Vector3(0, 5, 10),
        target: new THREE.Vector3(0, 0, 0),
        name: 'main-camera',
        canvas: context.canvas
    });
    
    // Activate the camera
    ThreeCam.switchToCamera('main-camera');

    // Add a grid helper for reference
    const gridHelper = new THREE.GridHelper(20, 20);
    (context.scene as unknown as THREE.Scene).add(gridHelper);

    // Add a test cube to verify rendering is working
    const testGeometry = new THREE.BoxGeometry(2, 2, 2);
    const testMaterial = new THREE.MeshStandardMaterial({ color: '#00ff00' });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 1, 0);
    (context.scene as unknown as THREE.Scene).add(testCube);
}

// Create dice entities
function createDiceEntities() {
    // Create a red dice entity
    const redDice = createEntity()
        .withOptions({
            name: 'Red Dice',
            position: { x: -2, y: 1, z: 0 },
            faceCount: 6,
            foreColor: '#000000',
            backColor: '#ff0000'
        })
        .build();

    // Configure 3D graphics for the red dice
    (redDice as any).entity3DConfig = {
        graphicClass: DiceGraphic,
        visible: true,
        offset: { x: 0, y: 0, z: 0 }
    };

    // Create a blue dice entity
    const blueDice = createEntity()
        .withOptions({
            name: 'Blue Dice',
            position: { x: 2, y: 1, z: 0 },
            faceCount: 6,
            foreColor: '#ffffff',
            backColor: '#0000ff'
        })
        .build();

    // Configure 3D graphics for the blue dice
    (blueDice as any).entity3DConfig = {
        graphicClass: DiceGraphic,
        visible: true,
        offset: { x: 0, y: 0, z: 0 }
    };
}

// Initialize scene when game starts
Events.Subscribe(Events.List.GameStart, setupDiceScene);
Events.Subscribe(Events.List.GameStart, createDiceEntities);
Events.Subscribe(Events.List.GameStart, initThrower);

function startGame() {
    const gameStartOptions = {
        finalFire: true,
        removeAfterRaise: false,
        isNetworkBoundEvent: false,
        isNetworkOriginEvent: false
    };
    Events.RaiseEvent(Events.List.GameStart, null, gameStartOptions);
}

Events.Subscribe(Events.List.DataLoaded, startGame);

// Fire the initialization events
Events.RaiseEvent(Events.List.ScriptsLoaded, null, { finalFire: true });
Events.RaiseEvent(Events.List.DataLoaded, null, { finalFire: true });

// Expose Game to window for debugging
declare global {
    interface Window {
        Game: typeof Game;
    }
}

window.Game = Game;
