import { HalfFloatType, ShaderMaterial, WebGLRenderTarget } from "three";
import { Pass, FullScreenQuad } from "./examples/jsm/postprocessing/Pass.js";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const blurAmountShader = /* glsl */ `
  #include <common>
  #include <packing>

  varying vec2 vUv;

  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;
  uniform float focusDistance;
  uniform float focusRange;
  uniform float transitionDistance;
  uniform float maxBlur;
  uniform float aspect;
  uniform float nearClip;
  uniform float farClip;

  float getDistance(const in vec2 uv) {
    float depth = texture2D(tDepth, uv).x;
    #if PERSPECTIVE_CAMERA == 1
    return -perspectiveDepthToViewZ(depth, nearClip, farClip);
    #else
    return -orthographicDepthToViewZ(depth, nearClip, farClip);
    #endif
  }

  float getBlur(const in float distance) {
    float outOfFocusDistance =
      abs(distance - focusDistance) - focusRange * 0.5;
    return clamp(outOfFocusDistance / transitionDistance, 0.0, 1.0);
  }

  // A sharper object in front of the pixel must not be spread on it.
  float getSampleWeight(
    const in float sampleDistance,
    const in float centerDistance,
    const in float centerBlur
  ) {
    return sampleDistance < centerDistance
      ? clamp(getBlur(sampleDistance) / centerBlur, 0.0, 1.0)
      : 1.0;
  }

  // The full resolution pixel giving its depth to a pixel of the half
  // resolution blur.
  vec2 getBlurDepthUv(const in vec2 blurUv) {
    return blurUv - 0.5 / vec2(textureSize(tDiffuse, 0));
  }`;

/**
 * A bokeh blur adapted from Three.js `BokehShader`, with samples weighted to
 * avoid sharp objects bleeding on the blurred background behind them.
 */
const blurFragmentShader = /* glsl */ `
  ${blurAmountShader}

  vec4 color;
  float totalWeight;
  float centerDistance;
  float centerBlur;
  vec2 blurRadius;

  void addPixel(const in vec2 uv, const in float weight) {
    float pixelWeight = weight *
      getSampleWeight(getDistance(uv), centerDistance, centerBlur);
    color += texture2D(tDiffuse, uv) * pixelWeight;
    totalWeight += pixelWeight;
  }

  void addSample(const in vec2 offset) {
    addPixel(vUv + offset * blurRadius, 1.0);
  }

  void main() {
    vec2 depthUv = getBlurDepthUv(vUv);
    centerDistance = getDistance(depthUv);
    centerBlur = getBlur(centerDistance);
    if (centerBlur <= 0.0) {
      gl_FragColor = texture2D(tDiffuse, vUv);
      return;
    }
    // Start from the 4 pixels under this one, without the sharper objects
    // in front.
    vec2 pixelSize = 1.0 / vec2(textureSize(tDiffuse, 0));
    color = vec4(0.0);
    totalWeight = 0.0;
    addPixel(depthUv, 0.25);
    addPixel(depthUv + vec2(pixelSize.x, 0.0), 0.25);
    addPixel(depthUv + vec2(0.0, pixelSize.y), 0.25);
    addPixel(depthUv + pixelSize, 0.25);
    blurRadius = vec2(1.0, aspect) * maxBlur * centerBlur;

    addSample(vec2( 0.0,    1.0  ));
    addSample(vec2( 0.375,  0.925));
    addSample(vec2( 0.725,  0.725));
    addSample(vec2(-0.925,  0.375));
    addSample(vec2( 1.0,    0.0  ));
    addSample(vec2( 0.925, -0.375));
    addSample(vec2( 0.725, -0.725));
    addSample(vec2(-0.375, -0.925));
    addSample(vec2( 0.0,   -1.0  ));
    addSample(vec2(-0.375,  0.925));
    addSample(vec2(-0.725,  0.725));
    addSample(vec2( 0.925,  0.375));
    addSample(vec2(-1.0,    0.0  ));
    addSample(vec2(-0.925, -0.375));
    addSample(vec2(-0.725, -0.725));
    addSample(vec2( 0.375, -0.925));

    addSample(vec2( 0.375,  0.925) * 0.9);
    addSample(vec2(-0.925,  0.375) * 0.9);
    addSample(vec2( 0.925, -0.375) * 0.9);
    addSample(vec2(-0.375, -0.925) * 0.9);
    addSample(vec2(-0.375,  0.925) * 0.9);
    addSample(vec2( 0.925,  0.375) * 0.9);
    addSample(vec2(-0.925, -0.375) * 0.9);
    addSample(vec2( 0.375, -0.925) * 0.9);

    addSample(vec2( 0.725,  0.725) * 0.7);
    addSample(vec2( 1.0,    0.0  ) * 0.7);
    addSample(vec2( 0.725, -0.725) * 0.7);
    addSample(vec2( 0.0,   -1.0  ) * 0.7);
    addSample(vec2(-0.725,  0.725) * 0.7);
    addSample(vec2(-1.0,    0.0  ) * 0.7);
    addSample(vec2(-0.725, -0.725) * 0.7);
    addSample(vec2( 0.0,    1.0  ) * 0.7);

    addSample(vec2( 0.725,  0.725) * 0.4);
    addSample(vec2( 1.0,    0.0  ) * 0.4);
    addSample(vec2( 0.725, -0.725) * 0.4);
    addSample(vec2( 0.0,   -1.0  ) * 0.4);
    addSample(vec2(-0.725,  0.725) * 0.4);
    addSample(vec2(-1.0,    0.0  ) * 0.4);
    addSample(vec2(-0.725, -0.725) * 0.4);
    addSample(vec2( 0.0,    1.0  ) * 0.4);

    gl_FragColor = color / totalWeight;
  }`;

const compositeFragmentShader = /* glsl */ `
  ${blurAmountShader}

  uniform sampler2D tBlurred;

  vec4 blurredColor;
  float totalWeight;
  float centerDistance;
  float centerBlur;
  vec2 blurredPosition;

  void addBlurredSample(const in vec2 offset) {
    vec2 blurredSize = vec2(textureSize(tBlurred, 0));
    // Clamped at the borders, so that the color and the depth are read for
    // the same pixel.
    vec2 blurPixel = clamp(
      floor(blurredPosition) + offset,
      vec2(0.0),
      blurredSize - 1.0
    );
    vec2 blurUv = (blurPixel + 0.5) / blurredSize;
    vec2 bilinearWeights = mix(
      1.0 - fract(blurredPosition),
      fract(blurredPosition),
      offset
    );
    float weight = bilinearWeights.x * bilinearWeights.y * getSampleWeight(
      getDistance(getBlurDepthUv(blurUv)),
      centerDistance,
      centerBlur
    );
    blurredColor += texture2D(tBlurred, blurUv) * weight;
    totalWeight += weight;
  }

  void main() {
    vec4 sharpColor = texture2D(tDiffuse, vUv);
    centerDistance = getDistance(vUv);
    centerBlur = getBlur(centerDistance);
    float blurInPixels =
      centerBlur * maxBlur * float(textureSize(tDiffuse, 0).x);
    if (blurInPixels <= 0.0) {
      gl_FragColor = sharpColor;
      return;
    }

    // Bilinear upsampling of the blur, without the pixels of sharper objects
    // in front of this one.
    blurredPosition = vUv * vec2(textureSize(tBlurred, 0)) - 0.5;
    blurredColor = vec4(0.0);
    totalWeight = 0.0;
    addBlurredSample(vec2(0.0, 0.0));
    addBlurredSample(vec2(1.0, 0.0));
    addBlurredSample(vec2(0.0, 1.0));
    addBlurredSample(vec2(1.0, 1.0));
    if (totalWeight <= 0.0) {
      gl_FragColor = sharpColor;
      return;
    }

    // The blur computed at half the resolution is too coarse for blurs
    // under 2 pixels: mix it with the sharp image.
    gl_FragColor = mix(
      sharpColor,
      blurredColor / totalWeight,
      clamp(blurInPixels * 0.5, 0.0, 1.0)
    );
  }`;

/**
 * A depth of field blurring at half the resolution, then mixing the blur
 * with the sharp image at full resolution according to the depth of each
 * pixel, so that objects in focus stay sharp.
 */
class DepthOfFieldPass extends Pass {
  constructor() {
    super();

    /**
     * The uniforms of both shaders. Distances are in Three.js world units,
     * `maxBlur` is a fraction of the width of the screen.
     * @type {Record<string, THREE.IUniform>}
     */
    this.uniforms = {
      tDiffuse: { value: null },
      tBlurred: { value: null },
      tDepth: { value: null },
      focusDistance: { value: 10.0 },
      focusRange: { value: 1.0 },
      transitionDistance: { value: 10.0 },
      maxBlur: { value: 0.01 },
      aspect: { value: 1.0 },
      nearClip: { value: 1.0 },
      farClip: { value: 1000.0 },
    };
    this._isPerspectiveCamera = true;
    const defines = { PERSPECTIVE_CAMERA: 1 };

    this._blurRenderTarget = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
    });
    this.uniforms.tBlurred.value = this._blurRenderTarget.texture;
    this._blurMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      defines,
      vertexShader,
      fragmentShader: blurFragmentShader,
    });
    this._compositeMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      defines,
      vertexShader,
      fragmentShader: compositeFragmentShader,
    });
    this._fullScreenQuad = new FullScreenQuad(this._blurMaterial);
  }

  /** @param {boolean} isPerspectiveCamera */
  setPerspectiveCamera(isPerspectiveCamera) {
    if (this._isPerspectiveCamera === isPerspectiveCamera) {
      return;
    }
    this._isPerspectiveCamera = isPerspectiveCamera;
    for (const material of [this._blurMaterial, this._compositeMaterial]) {
      material.defines.PERSPECTIVE_CAMERA = isPerspectiveCamera ? 1 : 0;
      material.needsUpdate = true;
    }
  }

  setSize(width, height) {
    this._blurRenderTarget.setSize(Math.ceil(width / 2), Math.ceil(height / 2));
  }

  render(renderer, writeBuffer, readBuffer) {
    this.uniforms.tDiffuse.value = readBuffer.texture;

    this._fullScreenQuad.material = this._blurMaterial;
    renderer.setRenderTarget(this._blurRenderTarget);
    this._fullScreenQuad.render(renderer);

    this._fullScreenQuad.material = this._compositeMaterial;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    this._fullScreenQuad.render(renderer);
  }

  dispose() {
    this._blurRenderTarget.dispose();
    this._blurMaterial.dispose();
    this._compositeMaterial.dispose();
    this._fullScreenQuad.dispose();
  }
}

export { DepthOfFieldPass };
