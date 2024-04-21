// @flow
import { rgbToHexNumber } from '../Utils/ColorTransformer';

export type InstancesEditorSettings = {|
  /** Is grid shown? */
  grid: boolean,
  gridType: 'isometric' | 'rectangular',
  gridWidth: number,
  gridHeight: number,
  gridOffsetX: number,
  gridOffsetY: number,
  gridColor: number,
  gridAlpha: number,

  /** Is snap to grid activated? */
  snap: boolean,

  /** The zoom of the editor, 1 by default. */
  zoomFactor: number,

  /** Is the window mask shown? */
  windowMask: boolean,
|};

export const getRecommendedInitialZoomFactor = (
  largestSizeInPixels: number
) => {
  // 700 is an empirical value obtained multiplying the largest size (1920) with
  // the zoom factor (0.36) so that the screen black rectangle fits nicely on the canvas
  // with only the left and right side panels opened on a Macbook screen.
  return 700 / largestSizeInPixels;
};

export const prepareInstancesEditorSettings = (
  object: any,
  projectLargestResolutionSizeInPixels: number
): InstancesEditorSettings => {
  return {
    grid: object.grid || false,
    gridType: object.gridType || 'rectangular',
    gridWidth: object.gridWidth || 32,
    gridHeight: object.gridHeight || 32,
    gridOffsetX: object.gridOffsetX || 0,
    gridOffsetY: object.gridOffsetY || 0,
    gridColor:
      object.gridColor !== undefined
        ? object.gridColor
        : rgbToHexNumber(158, 180, 255),
    gridAlpha: object.gridAlpha !== undefined ? object.gridAlpha : 0.8,
    snap: object.snap || false,
    zoomFactor: Math.max(
      object.zoomFactor ||
        getRecommendedInitialZoomFactor(projectLargestResolutionSizeInPixels),
      0.01
    ),
    windowMask: object.windowMask || false,
  };
};

export const cloneInstancesEditorSettings = (
  instancesEditorSettings: InstancesEditorSettings
) => {
  return { ...instancesEditorSettings };
};
