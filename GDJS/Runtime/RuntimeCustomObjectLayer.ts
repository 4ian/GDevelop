/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Represents a layer of a custom object. It doesn't allow to move any camera
   * because it doesn't make sense inside an object.
   * @category Core Engine > Layers
   */
  export class RuntimeCustomObjectLayer extends gdjs.RuntimeLayer {
    private _cameraDeltaX: float = 0;
    private _cameraDeltaY: float = 0;

    /**
     * @param layerData The data used to initialize the layer
     * @param instanceContainer The container in which the layer is used
     */
    constructor(
      layerData: LayerData,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      super(layerData, instanceContainer);

      // Let the renderer do its final set up:
      this._renderer.onCreated();
      this._renderer.updatePosition();
    }

    override onGameResolutionResized(
      oldGameResolutionOriginX: float,
      oldGameResolutionOriginY: float
    ): void {}

    override getCameraX(cameraId?: integer): float {
      return this._cameraDeltaX + this._runtimeScene.getViewportOriginX();
    }

    override getCameraY(cameraId?: integer): float {
      return this._cameraDeltaY + this._runtimeScene.getViewportOriginY();
    }

    override setCameraX(x: float, cameraId?: integer): void {
      this._cameraDeltaX = x - this._runtimeScene.getViewportOriginX();
      this._renderer.updatePosition();
    }

    override setCameraY(y: float, cameraId?: integer): void {
      this._cameraDeltaY = y - this._runtimeScene.getViewportOriginY();
      this._renderer.updatePosition();
    }

    override getCameraWidth(cameraId?: integer): float {
      return this.getWidth();
    }

    override getCameraHeight(cameraId?: integer): float {
      return this.getHeight();
    }

    override setCameraZoom(newZoom: float, cameraId?: integer): void {}

    override getCameraZoom(cameraId?: integer): float {
      return 1;
    }

    override setCameraZ(z: float, fov: float, cameraId?: integer): void {}

    override getCameraZ(fov: float | null, cameraId?: integer): float {
      return 0;
    }

    override getCameraRotation(cameraId?: integer): float {
      return 0;
    }

    override setCameraRotation(rotation: float, cameraId?: integer): void {}

    override getCameraRotationY(cameraId?: integer): float {
      return 0;
    }

    override setCameraRotationY(rotationY: float, cameraId?: integer): void {}

    override getCameraRotationX(cameraId?: integer): float {
      return 0;
    }

    override setCameraRotationX(rotationX: float, cameraId?: integer): void {}

    override getCameraForwardX(cameraId?: integer): number {
      return 0;
    }

    override getCameraForwardY(cameraId?: integer): number {
      return 0;
    }

    override getCameraForwardZ(cameraId?: integer): number {
      return -1;
    }

    override getCameraUpX(cameraId?: integer): number {
      return 0;
    }

    override getCameraUpY(cameraId?: integer): number {
      return -1;
    }

    override getCameraUpZ(cameraId?: integer): number {
      return 0;
    }

    override getCameraRightX(cameraId?: integer): number {
      return 1;
    }

    override getCameraRightY(cameraId?: integer): number {
      return 0;
    }

    override getCameraRightZ(cameraId?: integer): number {
      return 0;
    }

    override convertCoords(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      // The result parameter used to be optional.
      let position = result || [0, 0];

      x += this._cameraDeltaX;
      y += this._cameraDeltaY;

      // TODO EBO use an AffineTransformation to avoid chained calls.
      // The result parameter used to be optional.
      return this._runtimeScene.convertCoords(x, y, position);
    }

    override convertInverseCoords(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      // The result parameter used to be optional.
      let position = result || [0, 0];

      // TODO EBO use an AffineTransformation to avoid chained calls.
      // The result parameter used to be optional.
      this._runtimeScene.convertInverseCoords(x, y, position);
      position[0] -= this._cameraDeltaX;
      position[1] -= this._cameraDeltaY;

      return position;
    }

    override applyLayerInverseTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      result[0] = x - this._cameraDeltaX;
      result[1] = y - this._cameraDeltaY;
      return result;
    }

    override applyLayerTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      result[0] = x + this._cameraDeltaX;
      result[1] = y + this._cameraDeltaY;
      return result;
    }
  }
}
