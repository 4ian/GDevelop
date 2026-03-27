// @flow
import { rgbToHexNumber } from '../Utils/ColorTransformer';

export type InstancesEditorSettings = {|
  /** Is grid shown? */
  grid: boolean,
  gridType: 'isometric' | 'rectangular',
  gridWidth: number,
  gridHeight: number,
  gridDepth: number,
  gridOffsetX: number,
  gridOffsetY: number,
  gridOffsetZ: number,
  gridColor: number,
  gridAlpha: number,

  /** Is snap to grid activated? */
  snap: boolean,

  /** The zoom of the editor, 1 by default. */
  zoomFactor: number,

  /** Is the window mask shown? */
  windowMask: boolean,

  /** Show 3D physics collision shapes in the in-game editor */
  showPhysics3DCollisionShapes: boolean,
  /** Show axes helper in the in-game editor */
  showAxesHelper: boolean,
  /** Color of the 3D physics collision shapes in the in-game editor */
  physics3DCollisionShapeColor: number,
  /** Size of the axes helper in the in-game editor */
  axesHelperSize: number,

  /** The name of the layer selected to place instances on. */
  selectedLayer: string,

  gameEditorMode: 'embedded-game' | 'instances-editor',
|};

export const getRecommendedInitialZoomFactor = (
  largestSizeInPixels: number
): number => {
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
    gridDepth: object.gridDepth || 32,
    gridOffsetX: object.gridOffsetX || 0,
    gridOffsetY: object.gridOffsetY || 0,
    gridOffsetZ: object.gridOffsetZ || 0,
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
    showPhysics3DCollisionShapes: object.showPhysics3DCollisionShapes || false,
    showAxesHelper: object.showAxesHelper || false,
    physics3DCollisionShapeColor:
      object.physics3DCollisionShapeColor !== undefined
        ? object.physics3DCollisionShapeColor
        : 0x43c1ff,
    axesHelperSize:
      object.axesHelperSize !== undefined ? object.axesHelperSize : 200,
    selectedLayer: object.selectedLayer || '',
    gameEditorMode: object.gameEditorMode || 'instances-editor',
  };
};

export const cloneInstancesEditorSettings = (
  instancesEditorSettings: InstancesEditorSettings
): {
  gameEditorMode: 'embedded-game' | 'instances-editor',
  grid: boolean,
  gridAlpha: number,
  gridColor: number,
  gridDepth: number,
  gridHeight: number,
  gridOffsetX: number,
  gridOffsetY: number,
  gridOffsetZ: number,
  gridType: 'isometric' | 'rectangular',
  gridWidth: number,
  showPhysics3DCollisionShapes: boolean,
  showAxesHelper: boolean,
  physics3DCollisionShapeColor: number,
  axesHelperSize: number,
  selectedLayer: string,
  snap: boolean,
  windowMask: boolean,
  zoomFactor: number,
} => {
  return { ...instancesEditorSettings };
};
