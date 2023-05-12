import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

declare global {
  namespace THREE_ADDONS {
    export { GLTFLoader };
  }
}
