// @flow
let isWebGLAvailable = null;

export const isWebGLSupported = (): boolean => {
  if (isWebGLAvailable !== null) return isWebGLAvailable;
  try {
    // $FlowFixMe[cannot-resolve-name]
    const canvas = document.createElement('canvas');
    isWebGLAvailable =
      // $FlowFixMe[cannot-resolve-name]
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));

    return isWebGLAvailable;
  } catch (e) {
    isWebGLAvailable = false;
    return false;
  }
};
