/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Represents a layer of a container, used to display objects.
   *
   * Viewports and multiple cameras are not supported.
   */
  export class SceneLayer extends gdjs.Layer {
    /**
     * @param layerData The data used to initialize the layer
     * @param scene The scene in which the layer is used
     */
    constructor(layerData: LayerData, scene: gdjs.RuntimeScene) {
      super(layerData, scene);
    }

    convertCoords(
      x: float,
      y: float,
      cameraId: integer = 0,
      result: FloatPoint
    ): FloatPoint {
      // The result parameter used to be optional.
      let position = result || [0, 0];
      x -= this.getRuntimeScene()._cachedGameResolutionWidth / 2;
      y -= this.getRuntimeScene()._cachedGameResolutionHeight / 2;
      x /= Math.abs(this._zoomFactor);
      y /= Math.abs(this._zoomFactor);

      // Only compute angle and cos/sin once (allow heavy optimization from JS engines).
      const angleInRadians = (this._cameraRotation / 180) * Math.PI;
      const tmp = x;
      const cosValue = Math.cos(angleInRadians);
      const sinValue = Math.sin(angleInRadians);
      x = cosValue * x - sinValue * y;
      y = sinValue * tmp + cosValue * y;
      position[0] = x + this.getCameraX(cameraId);
      position[1] = y + this.getCameraY(cameraId);
      return position;
    }

    convertInverseCoords(
      x: float,
      y: float,
      cameraId: integer = 0,
      result: FloatPoint
    ): FloatPoint {
      // The result parameter used to be optional.
      let position = result || [0, 0];
      x -= this.getCameraX(cameraId);
      y -= this.getCameraY(cameraId);

      // Only compute angle and cos/sin once (allow heavy optimization from JS engines).
      const angleInRadians = (this._cameraRotation / 180) * Math.PI;
      const tmp = x;
      const cosValue = Math.cos(-angleInRadians);
      const sinValue = Math.sin(-angleInRadians);
      x = cosValue * x - sinValue * y;
      y = sinValue * tmp + cosValue * y;
      x *= Math.abs(this._zoomFactor);
      y *= Math.abs(this._zoomFactor);
      position[0] = x + this.getRuntimeScene()._cachedGameResolutionWidth / 2;
      position[1] = y + this.getRuntimeScene()._cachedGameResolutionHeight / 2;
      return position;
    }
  }
}
