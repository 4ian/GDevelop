// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
const remote = optionalRequire('@electron/remote');

export type SlowGraphicsRenderingReason =
  | 'software-rendering'
  | 'integrated-graphics-card';

// Renderers drawing with the processor instead of the graphics card:
// "Microsoft Basic Render Driver" (WARP) and SwiftShader with Chromium,
// llvmpipe and softpipe with Mesa, "Apple Software Renderer".
const softwareRendererNameRegex = /Basic Render Driver|SwiftShader|llvmpipe|softpipe|Software/i;

const intelVendorId = 0x8086;
const nvidiaVendorId = 0x10de;
const amdVendorId = 0x1002;

const getWebGLRendererName = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    // The renderer is the same for WebGL and WebGL2 contexts.
    const gl = canvas.getContext('webgl');
    if (!gl) return null;

    const debugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererName = gl.getParameter(
      debugRendererInfo
        ? debugRendererInfo.UNMASKED_RENDERER_WEBGL
        : gl.RENDERER
    );
    // Browsers limit the number of WebGL contexts: free this one now.
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) loseContext.loseContext();

    return typeof rendererName === 'string' ? rendererName : null;
  } catch (error) {
    return null;
  }
};

/**
 * Only known on the desktop app: browsers don't tell which graphics cards
 * are installed.
 */
const isIntegratedGraphicsCardUsedWhileDiscreteOneIsAvailable = async (): Promise<boolean> => {
  if (!remote) return false;
  try {
    const gpuInfo: any = await remote.app.getGPUInfo('basic');
    const gpuDevices: Array<{ active: boolean, vendorId: number }> =
      (gpuInfo && gpuInfo.gpuDevice) || [];
    const activeGpuDevice = gpuDevices.find(gpuDevice => gpuDevice.active);
    // Intel graphics cards are integrated in the processor, while the NVIDIA
    // and AMD ones installed next to them are discrete.
    return (
      !!activeGpuDevice &&
      activeGpuDevice.vendorId === intelVendorId &&
      gpuDevices.some(
        gpuDevice =>
          gpuDevice.vendorId === nvidiaVendorId ||
          gpuDevice.vendorId === amdVendorId
      )
    );
  } catch (error) {
    console.warn('Unable to get the graphics cards information:', error);
    return false;
  }
};

const getSlowGraphicsRenderingReason = async (): Promise<SlowGraphicsRenderingReason | null> => {
  const rendererName = getWebGLRendererName();
  if (rendererName && softwareRendererNameRegex.test(rendererName)) {
    return 'software-rendering';
  }
  if (await isIntegratedGraphicsCardUsedWhileDiscreteOneIsAvailable()) {
    return 'integrated-graphics-card';
  }
  return null;
};

let slowGraphicsRenderingReasonPromise: Promise<SlowGraphicsRenderingReason | null> | null = null;

/**
 * Return why the 3D rendering (the 3D editor, previews) is a lot slower than
 * it could be on this computer, if it is.
 */
export const useSlowGraphicsRenderingReason = (): SlowGraphicsRenderingReason | null => {
  const [
    slowGraphicsRenderingReason,
    setSlowGraphicsRenderingReason,
  ] = React.useState<SlowGraphicsRenderingReason | null>(null);
  React.useEffect(() => {
    let isMounted = true;
    if (!slowGraphicsRenderingReasonPromise) {
      slowGraphicsRenderingReasonPromise = getSlowGraphicsRenderingReason();
    }
    slowGraphicsRenderingReasonPromise.then(reason => {
      if (isMounted) setSlowGraphicsRenderingReason(reason);
    });
    return () => {
      isMounted = false;
    };
  }, []);
  return slowGraphicsRenderingReason;
};
