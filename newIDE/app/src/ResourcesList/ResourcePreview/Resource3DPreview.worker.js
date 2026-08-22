/* eslint-env worker */
// @flow
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Copied from PixiResourcesLoader.js
// $FlowFixMe[missing-local-annot]
const removeMetalness = material => {
  if (material.metalness) {
    material.metalness = 0;
  }
};

// Copied from PixiResourcesLoader.js
// $FlowFixMe[missing-local-annot]
const removeMetalnessFromMesh = node => {
  if (!node.material) {
    return;
  }
  if (Array.isArray(node.material)) {
    for (let index = 0; index < node.material.length; index++) {
      removeMetalness(node.material[index]);
    }
  } else {
    removeMetalness(node.material);
  }
};

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
let dracoLoader = null;

// $FlowFixMe[missing-local-annot]
const createDracoLoader = (dracoWasmWrapperJs, dracoDecoderWasm) => {
  const manager = new THREE.LoadingManager();
  if (dracoWasmWrapperJs && dracoDecoderWasm) {
    const wrapperUrl = URL.createObjectURL(
      new Blob([dracoWasmWrapperJs], { type: 'text/javascript' })
    );
    const wasmUrl = URL.createObjectURL(
      new Blob([dracoDecoderWasm], { type: 'application/wasm' })
    );
    manager.setURLModifier(url => {
      if (url.indexOf('draco_wasm_wrapper.js') !== -1) {
        return wrapperUrl;
      }
      if (url.indexOf('draco_decoder.wasm') !== -1) {
        return wasmUrl;
      }
      return url;
    });
  }

  const loader = new DRACOLoader(manager);
  // File names are rewritten by the URL modifier above when decoder
  // libraries were prefetched on the main thread (required on Electron,
  // where workers cannot fetch file:// URLs).
  loader.setDecoderPath('./external/draco/gltf/');
  return loader;
};

// Set up the renderer when worker is initialized
const initRenderer = () => {
  // $FlowFixMe[incompatible-type] - OffscreenCanvas is not in Flow types
  // $FlowFixMe[cannot-resolve-name]
  offscreenCanvas = new OffscreenCanvas(width, height);

  // Create renderer with offscreen canvas
  renderer = new THREE.WebGLRenderer({
    canvas: offscreenCanvas,
    antialias: true,
    alpha: true,
  });
  renderer.useLegacyLights = true; // Use legacy lights as in the editor.

  renderer.setSize(width, height, false);

  return true;
};

// Render a 3D model to the offscreen canvas and return the data URL.
// resourceData is an ArrayBuffer fetched by the main thread (workers cannot
// fetch file:// URLs in Electron due to network service sandboxing).
// $FlowFixMe[missing-local-annot]
const renderModel = async (resourceUrl, resourceData, basePath) => {
  if (!renderer) {
    throw new Error('Renderer not initialized');
  }

  const scene = new THREE.Scene();

  const light = new THREE.HemisphereLight();
  light.color = new THREE.Color(1, 1, 1);
  light.groundColor = new THREE.Color(0.25, 0.25, 0.25);
  light.position.set(0, 0, 1);
  const lightGroup = new THREE.Group();
  lightGroup.rotation.order = 'ZYX';
  lightGroup.rotation.x = Math.PI / 4;
  lightGroup.add(light);
  scene.add(lightGroup);

  // Parse the pre-fetched model data instead of fetching the URL,
  // so the worker never needs to make any network/file requests.
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    if (dracoLoader) {
      loader.setDRACOLoader(dracoLoader);
    }

    loader.parse(
      resourceData,
      basePath,
      gltf => {
        if (!renderer) {
          throw new Error('Renderer not initialized');
        }

        if (!offscreenCanvas) {
          throw new Error('Offscreen canvas not initialized');
        }

        const model = gltf.scene;
        model.traverse(removeMetalnessFromMesh);

        // We can't just rely on model.boundingBox because it doesn't take into account
        // the model's scale and position.
        // So we need to compute the bounding box from the meshes in the model.
        const box = new THREE.Box3();
        const meshes = [];
        model.traverse(child => {
          if (child.isMesh) {
            meshes.push(child);
          }
        });
        meshes.forEach(mesh => {
          mesh.geometry.computeBoundingBox();
          const geometryBox = mesh.geometry.boundingBox.clone();
          geometryBox.applyMatrix4(mesh.matrixWorld);
          box.union(geometryBox);
        });

        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        model.scale.set(scale, scale, scale);

        // Center horizontally
        model.position.x -= center.x * scale;
        model.position.z -= center.z * scale;

        // Slight upward shift so base isn't too low
        model.position.y -= (center.y - size.y / 2) * scale;

        scene.add(model);

        const camera = new THREE.PerspectiveCamera(
          45,
          width / height,
          0.1,
          1000
        );
        // Those are empirical values to make the model fit nicely in the frame.
        camera.position.set(
          1 * (0.5 + size.x * scale),
          1 * (0.5 + size.y * scale),
          2 * (0.5 + size.z * scale)
        );
        // Aim camera slightly above center (based on size)
        camera.lookAt(0, 0.5 * size.y * scale, 0);

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
        const { dracoWasmWrapperJs, dracoDecoderWasm } = event.data;
        try {
          dracoLoader = createDracoLoader(
            dracoWasmWrapperJs,
            dracoDecoderWasm
          );
        } catch (dracoError) {
          console.error(
            'Failed to initialize Draco decoder in 3D preview worker:',
            dracoError
          );
          dracoLoader = null;
        }
        const success = initRenderer();
        // eslint-disable-next-line no-restricted-globals
        self.postMessage({ type: MESSAGE_TYPES.INIT, success });
        break;

      case MESSAGE_TYPES.RENDER_MODEL:
        if (!renderer) {
          throw new Error('Renderer not initialized');
        }

        const { resourceData, basePath } = event.data;
        const screenshot = await renderModel(
          resourceUrl,
          resourceData,
          basePath
        );
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
