import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

declare global {
  namespace THREE_ADDONS {
    export { GLTFLoader, GLTF };
  }
}
