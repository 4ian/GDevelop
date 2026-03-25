import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils';

import { TransformControls } from 'three/addons/controls/TransformControls';
import { SelectionBox } from 'three/addons/interactive/SelectionBox';
import { Sky } from 'three/addons/objects/Sky';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass';
import { Pass } from 'three/addons/postprocessing/Pass';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass';
import { OutputPass } from 'three/addons/postprocessing/OutputPass';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';
import { BrightnessContrastShader } from 'three/addons/shaders/BrightnessContrastShader';
import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader';
import { HueSaturationShader } from 'three/addons/shaders/HueSaturationShader';
import { ExposureShader } from 'three/addons/shaders/ExposureShader';

declare global {
  namespace THREE_ADDONS {
    export {
      GLTFLoader,
      DRACOLoader,
      SkeletonUtils,
      TransformControls,
      SelectionBox,
      Sky,
      EffectComposer,
      OutlinePass,
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
