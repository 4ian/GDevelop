/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Represents a layer of a custom object. It doesn't allow to move any camera
   * because it doesn't make sense inside an object.
   */
  export class RuntimeCustomObjectLayer extends gdjs.RuntimeLayer {
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
    }

    override onGameResolutionResized(
      oldGameResolutionOriginX: float,
      oldGameResolutionOriginY: float
    ): void {}

    override getCameraX(cameraId?: integer): float {
      return 0;
    }

    override getCameraY(cameraId?: integer): float {
      return 0;
    }

    override setCameraX(x: float, cameraId?: integer): void {}

    override setCameraY(y: float, cameraId?: integer): void {}

    override getCameraWidth(cameraId?: integer): float {
      return 0;
    }

    override getCameraHeight(cameraId?: integer): float {
      return 0;
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

    override convertCoords(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      // TODO EBO use an AffineTransformation to avoid chained calls.
      // The result parameter used to be optional.
      return this._runtimeScene.convertCoords(x, y, result || [0, 0]);
    }

    override convertInverseCoords(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      // TODO EBO use an AffineTransformation to avoid chained calls.
      // The result parameter used to be optional.
      return this._runtimeScene.convertInverseCoords(x, y, result || [0, 0]);
    }

    override applyLayerInverseTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      result[0] = x;
      result[1] = y;
      return result;
    }

    override applyLayerTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      result[0] = x;
      result[1] = y;
      return result;
    }
  }
}
