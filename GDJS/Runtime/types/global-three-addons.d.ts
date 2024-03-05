import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader';
import { HueSaturationShader } from 'three/examples/jsm/shaders/HueSaturationShader';
import { ExposureShader } from 'three/examples/jsm/shaders/ExposureShader';

declare global {
  namespace THREE_ADDONS {
    export {
      GLTFLoader,
      GLTF,
      DRACOLoader,
      SkeletonUtils,
      EffectComposer,
      Pass,
      RenderPass,
      ShaderPass,
      SMAAPass,
      OutputPass,
      UnrealBloomPass,
      BrightnessContrastShader,
      ColorCorrectionShader,
      HueSaturationShader,
      ExposureShader,
    };
  }
}
