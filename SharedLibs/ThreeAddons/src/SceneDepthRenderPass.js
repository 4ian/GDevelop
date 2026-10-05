import {
  DepthTexture,
  HalfFloatType,
  ShaderMaterial,
  UniformsUtils,
  UnsignedIntType,
  WebGLRenderTarget,
} from "three";
import { Pass, FullScreenQuad } from "./examples/jsm/postprocessing/Pass.js";
import { CopyShader } from "./examples/jsm/shaders/CopyShader.js";

/**
 * Render the scene like a `RenderPass`, but in a render target owned by the
 * pass, with a depth texture that can be read by the next passes (for
 * instance a depth of field effect).
 *
 * The depth texture can't be attached to the render targets of the effect
 * composer: a pass would then read it while writing in the same render target.
 */
class SceneDepthRenderPass extends Pass {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
    // Like a RenderPass, the scene is rendered in the read buffer.
    this.needsSwap = false;

    this.renderTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
    this.renderTarget.depthTexture = new DepthTexture(1, 1, UnsignedIntType);

    this._copyMaterial = new ShaderMaterial({
      uniforms: UniformsUtils.clone(CopyShader.uniforms),
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    this._copyMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
    this._copyQuad = new FullScreenQuad(this._copyMaterial);
  }

  /** @returns {THREE.DepthTexture} */
  get depthTexture() {
    return this.renderTarget.depthTexture;
  }

  setSize(width, height) {
    this.renderTarget.setSize(width, height);
  }

  render(renderer, writeBuffer, readBuffer) {
    renderer.setRenderTarget(this.renderTarget);
    // The renderer may not clear by itself (autoClear disabled, and the
    // background being a texture or a cube texture).
    renderer.clear(true, true, true);
    renderer.render(this.scene, this.camera);

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    this._copyQuad.render(renderer);
  }

  dispose() {
    this.renderTarget.dispose();
    this._copyMaterial.dispose();
    this._copyQuad.dispose();
  }
}

export { SceneDepthRenderPass };
