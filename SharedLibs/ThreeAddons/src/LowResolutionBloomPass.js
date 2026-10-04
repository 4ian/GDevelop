import { UnrealBloomPass } from "./examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * An `UnrealBloomPass` blurring the bright areas from a quarter of the
 * resolution instead of the half, with kernels twice smaller. The glow has the
 * same size on screen, for about 4 times less work and memory.
 */
class LowResolutionBloomPass extends UnrealBloomPass {
  /**
   * @param {THREE.Vector2} resolution
   * @param {number} strength
   * @param {number} radius
   * @param {number} threshold
   */
  constructor(resolution, strength, radius, threshold) {
    super(resolution, strength, radius, threshold);

    const kernelSizes = [3, 5, 7, 9, 11];
    for (let i = 0; i < this.nMips; i++) {
      this.separableBlurMaterials[i].dispose();
      const material = this._getSeparableBlurMaterial(kernelSizes[i]);
      // Small kernels cut a bigger part of the Gaussian curve: normalize them
      // to not darken the glow.
      const coefficients = material.uniforms.gaussianCoefficients.value;
      const sum = coefficients.reduce(
        (sum, coefficient, index) => sum + (index === 0 ? 1 : 2) * coefficient,
        0,
      );
      material.uniforms.gaussianCoefficients.value = coefficients.map(
        (coefficient) => coefficient / sum,
      );
      this.separableBlurMaterials[i] = material;
    }

    // Each pixel of the bright areas covers 4x4 pixels of the input: average
    // 4 bilinear samples to take all of them into account (otherwise small
    // highlights would flicker).
    this.materialHighPassFilter.fragmentShader = /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform vec3 defaultColor;
      uniform float defaultOpacity;
      uniform float luminosityThreshold;
      uniform float smoothWidth;

      varying vec2 vUv;

      vec4 getBrightColor(const in vec2 uv) {
        vec4 texel = texture2D(tDiffuse, uv);
        float alpha = smoothstep(
          luminosityThreshold,
          luminosityThreshold + smoothWidth,
          luminance(texel.xyz)
        );
        return mix(vec4(defaultColor.rgb, defaultOpacity), texel, alpha);
      }

      void main() {
        vec2 offset = 1.0 / vec2(textureSize(tDiffuse, 0));
        gl_FragColor = 0.25 * (
          getBrightColor(vUv + vec2(-offset.x, -offset.y)) +
          getBrightColor(vUv + vec2(offset.x, -offset.y)) +
          getBrightColor(vUv + vec2(-offset.x, offset.y)) +
          getBrightColor(vUv + vec2(offset.x, offset.y))
        );
      }`;

    this.setSize(resolution.x, resolution.y);
  }

  setSize(width, height) {
    // UnrealBloomPass starts its mips at the half of the given size.
    super.setSize(width / 2, height / 2);
  }
}

export { LowResolutionBloomPass };
