// @flow
let isWebGLAvailable = null;

export const isWebGL2Supported = (): boolean => {
  if (isWebGLAvailable !== null) return isWebGLAvailable;
  try {
    const canvas = document.createElement('canvas');
    isWebGLAvailable =
      !!window.WebGLRenderingContext && !!canvas.getContext('webgl2');

    return isWebGLAvailable;
  } catch (e) {
    isWebGLAvailable = false;
    return false;
  }
};
