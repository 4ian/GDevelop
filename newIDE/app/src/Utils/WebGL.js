// @flow
let isWebGLAvailable = null;

export const isWebGLSupported = (): boolean => {
  if (isWebGLAvailable !== null) return isWebGLAvailable;
  try {
    const canvas = document.createElement('canvas');
    isWebGLAvailable =
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));

    return isWebGLAvailable;
  } catch (e) {
    isWebGLAvailable = false;
    return false;
  }
};
