/* eslint-env worker */
// @flow
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Worker message types
const MESSAGE_TYPES = {
  RENDER_MODEL: 'RENDER_MODEL',
  RENDER_COMPLETE: 'RENDER_COMPLETE',
  RENDER_ERROR: 'RENDER_ERROR',
  INIT: 'INIT',
};

let renderer = null;
let width = 256;
let height = 256;
let offscreenCanvas = null;

// Set up the renderer when worker is initialized
const initRenderer = () => {
  // $FlowExpectedError - OffscreenCanvas is not in Flow types
  offscreenCanvas = new OffscreenCanvas(width, height);

  // Create renderer with offscreen canvas
  renderer = new THREE.WebGLRenderer({
    canvas: offscreenCanvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(1); // Use 1 for consistent rendering across devices
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  return true;
};

// Render a 3D model to the offscreen canvas and return the data URL
const renderModel = async resourceUrl => {
  if (!renderer) {
    throw new Error('Renderer not initialized');
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(2, 2, 4);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 3);
  const mainLight = new THREE.DirectionalLight(0xffffff, 3);
  hemiLight.position.set(0, 20, 0);
  mainLight.position.set(5, 10, 7.5);
  scene.add(ambientLight, hemiLight, mainLight);

  // Load the model
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      resourceUrl,
      gltf => {
        if (!renderer) {
          throw new Error('Renderer not initialized');
        }

        if (!offscreenCanvas) {
          throw new Error('Offscreen canvas not initialized');
        }

        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);

        const scale = 1 / sphere.radius;
        model.scale.set(scale, scale, scale);

        // Center horizontally
        model.position.x -= center.x * scale;
        model.position.z -= center.z * scale;

        // Slight upward shift so base isn't too low
        model.position.y -= (center.y - size.y / 2) * scale;

        scene.add(model);

        // Aim camera slightly above center
        camera.lookAt(0, 0.75, 0);

        // Render the scene
        renderer.render(scene, camera);

        // Get the screenshot and return it
        const screenshot = offscreenCanvas.convertToBlob
          ? offscreenCanvas.convertToBlob().then(blob => {
              return URL.createObjectURL(blob);
            })
          : Promise.resolve(renderer.domElement.toDataURL());

        resolve(screenshot);
      },
      undefined,
      error => {
        reject(error);
      }
    );
  });
};

// Handle messages from the main thread
// eslint-disable-next-line no-restricted-globals
self.onmessage = async event => {
  const { type, resourceUrl } = event.data;

  try {
    switch (type) {
      case MESSAGE_TYPES.INIT:
        const success = initRenderer();
        // eslint-disable-next-line no-restricted-globals
        self.postMessage({ type: MESSAGE_TYPES.INIT, success });
        break;

      case MESSAGE_TYPES.RENDER_MODEL:
        if (!renderer) {
          throw new Error('Renderer not initialized');
        }

        const screenshot = await renderModel(resourceUrl);
        // eslint-disable-next-line no-restricted-globals
        self.postMessage({
          type: MESSAGE_TYPES.RENDER_COMPLETE,
          resourceUrl,
          screenshot,
        });
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    // eslint-disable-next-line no-restricted-globals
    self.postMessage({
      type: MESSAGE_TYPES.RENDER_ERROR,
      resourceUrl,
      error: error.message || 'Unknown error',
      originalEvent: JSON.stringify(event.data),
    });
  }
};

// Required for Create React App to correctly bundle this worker
// eslint-disable-next-line import/no-anonymous-default-export
export default {};
