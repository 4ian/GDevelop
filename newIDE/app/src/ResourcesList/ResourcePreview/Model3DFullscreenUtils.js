// @flow

export const MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM = 3;

export const getModelPreviewCameraZoom = (isFullscreen: boolean): number =>
  isFullscreen ? MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM : 1;

export const exitAllFullscreenLayers = async (
  fullscreenDocument: Document
): Promise<void> => {
  while (fullscreenDocument.fullscreenElement) {
    const fullscreenElementBeforeExit = fullscreenDocument.fullscreenElement;
    await fullscreenDocument.exitFullscreen();

    if (fullscreenDocument.fullscreenElement === fullscreenElementBeforeExit) {
      throw new Error('The browser did not exit the active fullscreen layer.');
    }
  }
};
