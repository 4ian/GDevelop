// @flow

export const MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM = 1.35;

export const getModelPreviewCameraZoom = (isFullscreen: boolean): number =>
  isFullscreen ? MODEL_PREVIEW_FULLSCREEN_CAMERA_ZOOM : 1;
