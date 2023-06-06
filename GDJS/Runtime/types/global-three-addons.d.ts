import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

declare global {
  namespace THREE_ADDONS {
    export { GLTFLoader, GLTF, SkeletonUtils };
  }
}
