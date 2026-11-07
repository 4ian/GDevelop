// @flow
import { type GpuCapabilities } from './settings';

// The vendored DOM lib (flow-libs/dom.js) only declares `WebGLRenderingContext`
// (WebGL 1). Describe just the WebGL 2 API used below.
type WebGL2Context = {
  getSupportedExtensions(): Array<string> | null,
  getExtension(name: string): any,
  getShaderPrecisionFormat(
    shaderType: number,
    precisionType: number
  ): { precision: number, ... } | null,
  getParameter(pname: number): any,
  +FRAGMENT_SHADER: number,
  +HIGH_FLOAT: number,
  +MAX_TEXTURE_SIZE: number,
  +MAX_CUBE_MAP_TEXTURE_SIZE: number,
  +MAX_3D_TEXTURE_SIZE: number,
  +MAX_SAMPLES: number,
  +RENDERER: number,
};

/**
 * Detect the capabilities of the GPU used by the editor, by creating a
 * temporary WebGL 2 context - the same way the game engine does it at
 * startup (see `GDJS/Runtime/TextureQuality3DManager.ts`).
 *
 * This gives real information about the device of the developer, so that the
 * texture quality settings can be checked against what the GPU supports.
 */
export const detectGpuCapabilities = (): ?GpuCapabilities => {
  let gl: ?WebGL2Context = null;
  try {
    const canvas = document.createElement('canvas');
    gl = (canvas.getContext('webgl2'): any);
    if (!gl) return null;

    const supportedExtensions = gl.getSupportedExtensions() || [];
    const debugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const anisotropicExtension = gl.getExtension(
      'EXT_texture_filter_anisotropic'
    );

    const supportedCompressedFormats = [];
    const compressedFormatLabels: { [extensionName: string]: string } = {
      WEBGL_compressed_texture_s3tc: 'S3TC (DXT)',
      WEBGL_compressed_texture_s3tc_srgb: 'S3TC sRGB',
      WEBGL_compressed_texture_astc: 'ASTC',
      WEBGL_compressed_texture_etc: 'ETC2/EAC',
      WEBGL_compressed_texture_etc1: 'ETC1',
      WEBGL_compressed_texture_pvrtc: 'PVRTC',
      EXT_texture_compression_bptc: 'BPTC',
      EXT_texture_compression_rgtc: 'RGTC',
      EXT_texture_compression_rgtc_srgb: 'RGTC sRGB',
    };
    for (const extensionName in compressedFormatLabels) {
      if (supportedExtensions.indexOf(extensionName) !== -1) {
        supportedCompressedFormats.push(compressedFormatLabels[extensionName]);
      }
    }

    const precisionFormat = gl.getShaderPrecisionFormat(
      gl.FRAGMENT_SHADER,
      gl.HIGH_FLOAT
    );
    const precision =
      precisionFormat && precisionFormat.precision > 0 ? 'highp' : 'mediump';

    const capabilities: GpuCapabilities = {
      isWebGL2: true,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCubemapSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      max3DTextureSize: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) || 0,
      maxSamples: gl.getParameter(gl.MAX_SAMPLES) || 0,
      precision,
      maxAnisotropy: anisotropicExtension
        ? gl.getParameter(anisotropicExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        : 0,
      gpuName: debugRendererInfo
        ? String(gl.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL))
        : String(gl.getParameter(gl.RENDERER)),
      supportedCompressedFormats,
      supportsAnisotropicFiltering: !!anisotropicExtension,
    };

    // Release the temporary WebGL context right away.
    const loseContextExtension = gl.getExtension('WEBGL_lose_context');
    if (loseContextExtension) loseContextExtension.loseContext();
    return capabilities;
  } catch (error) {
    console.warn('Unable to detect the GPU capabilities:', error);
    return null;
  }
};
