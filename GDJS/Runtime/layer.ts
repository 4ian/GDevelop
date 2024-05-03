/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Represents a layer of a scene, used to display objects.
   */
  export class Layer extends gdjs.RuntimeLayer {
    _cameraRotation: float = 0;
    _zoomFactor: float = 1;
    _cameraX: float;
    _cameraY: float;
    _cameraZ: float = 0;
    /**
     * `_cameraZ` is dirty when the zoom factor is set last.
     */
    _isCameraZDirty: boolean = true;

    /**
     * @param layerData The data used to initialize the layer
     * @param instanceContainer The container in which the layer is used
     */
    constructor(
      layerData: LayerData,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      super(layerData, instanceContainer);

      this._cameraX = this.getWidth() / 2;
      this._cameraY = this.getHeight() / 2;
      if (this.getCameraType() === gdjs.RuntimeLayerCameraType.ORTHOGRAPHIC) {
        this._cameraZ =
          (this._initialCamera3DFarPlaneDistance +
            this._initialCamera3DNearPlaneDistance) /
          2;
      }

      // Let the renderer do its final set up:
      this._renderer.onCreated();
    }

    /**
     * Called by the RuntimeScene whenever the game resolution size is changed.
     * Updates the layer width/height and position.
     */
    onGameResolutionResized(
      oldGameResolutionOriginX: float,
      oldGameResolutionOriginY: float
    ): void {
      // Adapt position of the camera center only if the camera has never moved as:
      // * When the camera follows a player/object, it will rarely be at the default position.
      // * Cameras not following a player/object are usually UIs which are intuitively
      // expected not to "move". Not adapting the center position would make the camera
      // move from its initial position (which is centered in the screen) - and anchor
      // behavior would behave counterintuitively.
      if (
        this._cameraX === oldGameResolutionOriginX &&
        this._cameraY === oldGameResolutionOriginY &&
        this._zoomFactor === 1
      ) {
        this._cameraX +=
          this._runtimeScene.getViewportOriginX() - oldGameResolutionOriginX;
        this._cameraY +=
          this._runtimeScene.getViewportOriginY() - oldGameResolutionOriginY;
      }
      this._renderer.updatePosition();
      this._renderer.updateResolution();
    }

    /**
     * Change the camera center X position.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The x position of the camera
     */
    getCameraX(cameraId?: integer): float {
      this._forceDimensionUpdate();
      return this._cameraX;
    }

    /**
     * Change the camera center Y position.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The y position of the camera
     */
    getCameraY(cameraId?: integer): float {
      this._forceDimensionUpdate();
      return this._cameraY;
    }

    /**
     * Set the camera center X position.
     *
     * @param x The new x position
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraX(x: float, cameraId?: integer): void {
      this._forceDimensionUpdate();
      this._cameraX = x;
      this._renderer.updatePosition();
    }

    /**
     * Set the camera center Y position.
     *
     * @param y The new y position
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraY(y: float, cameraId?: integer): void {
      this._forceDimensionUpdate();
      this._cameraY = y;
      this._renderer.updatePosition();
    }

    /**
     * Get the camera width (which can be different than the game resolution width
     * if the camera is zoomed).
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The width of the camera
     */
    getCameraWidth(cameraId?: integer): float {
      return this.getWidth() / this._zoomFactor;
    }

    /**
     * Get the camera height (which can be different than the game resolution height
     * if the camera is zoomed).
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The height of the camera
     */
    getCameraHeight(cameraId?: integer): float {
      return this.getHeight() / this._zoomFactor;
    }

    /**
     * Set the zoom of a camera.
     *
     * @param newZoom The new zoom. Must be superior to 0. 1 is the default zoom.
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraZoom(newZoom: float, cameraId?: integer): void {
      this._zoomFactor = newZoom;
      this._isCameraZDirty = true;
      this._renderer.updatePosition();
    }

    /**
     * Get the zoom of a camera.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The zoom.
     */
    getCameraZoom(cameraId?: integer): float {
      return this._zoomFactor;
    }

    /**
     * Set the camera center Z position.
     *
     * @param z The new y position.
     * @param fov The field of view.
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraZ(z: float, fov: float | null, cameraId?: integer): void {
      if (fov) {
        const cameraFovInRadians = gdjs.toRad(fov);

        // The zoom factor is capped to a not too big value to avoid infinity.
        // MAX_SAFE_INTEGER is an arbitrary choice. It's big but not too big.
        const zoomFactor = Math.min(
          Number.MAX_SAFE_INTEGER,
          (0.5 * this.getHeight()) / (z * Math.tan(0.5 * cameraFovInRadians))
        );

        if (zoomFactor > 0) {
          this._zoomFactor = zoomFactor;
        }
      }

      this._cameraZ = z;
      this._isCameraZDirty = false;
      this._renderer.updatePosition();
    }

    /**
     * Get the camera center Z position.
     *
     * @param fov The field of view.
     * @param cameraId The camera number. Currently ignored.
     * @return The z position of the camera
     */
    getCameraZ(fov: float | null, cameraId?: integer): float {
      if (!this._isCameraZDirty || !fov) {
        return this._cameraZ;
      }

      // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
      // The Z position is computed by taking the half height of the displayed rendering,
      // and using the angle of the triangle defined by the field of view to compute the length
      // of the triangle defining the distance between the camera and the rendering plane.
      const cameraZPosition =
        (0.5 * this.getHeight()) /
        this.getCameraZoom() /
        Math.tan(0.5 * gdjs.toRad(fov));

      return cameraZPosition;
    }

    /**
     * Get the rotation of the camera, expressed in degrees.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The rotation, in degrees.
     */
    getCameraRotation(cameraId?: integer): float {
      return this._cameraRotation;
    }

    /**
     * Set the rotation of the camera, expressed in degrees.
     * The rotation is made around the camera center.
     *
     * @param rotation The new rotation, in degrees.
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraRotation(rotation: float, cameraId?: integer): void {
      this._cameraRotation = rotation;
      this._renderer.updatePosition();
    }

    /**
     * Convert a point from the canvas coordinates (for example,
     * the mouse position) to the container coordinates.
     *
     * This method handles 3D rotations.
     *
     * @param x The x position, in canvas coordinates.
     * @param y The y position, in canvas coordinates.
     * @param cameraId The camera number. Currently ignored.
     * @param result The point instance that is used to return the result.
     */
    convertCoords(
      x: float,
      y: float,
      cameraId: integer = 0,
      result: FloatPoint
    ): FloatPoint {
      // This code duplicates applyLayerInverseTransformation for performance reasons;

      // The result parameter used to be optional.
      let position = result || [0, 0];

      if (this._renderer.isCameraRotatedIn3D()) {
        return this._renderer.transformTo3DWorld(x, y, 0, cameraId, result);
      }

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

    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in layer local coordinates (as opposed to the parent coordinates).
     *
     * All transformations (scale, rotation) are supported.
     *
     * This method doesn't handle 3D rotations.
     *
     * @param x The X position of the point, in parent coordinates.
     * @param y The Y position of the point, in parent coordinates.
     * @param result Array that will be updated with the result
     * @param result The point instance that is used to return the result.
     * (x and y position of the point in layer coordinates).
     */
    applyLayerInverseTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
      x -= this._runtimeScene.getViewportOriginX();
      y -= this._runtimeScene.getViewportOriginY();
      x /= Math.abs(this._zoomFactor);
      y /= Math.abs(this._zoomFactor);

      // Only compute angle and cos/sin once (allow heavy optimization from JS engines).
      const angleInRadians = (this._cameraRotation / 180) * Math.PI;
      const tmp = x;
      const cosValue = Math.cos(angleInRadians);
      const sinValue = Math.sin(angleInRadians);
      x = cosValue * x - sinValue * y;
      y = sinValue * tmp + cosValue * y;
      result[0] = x + this.getCameraX(cameraId);
      result[1] = y + this.getCameraY(cameraId);

      return result;
    }

    /**
     * Convert a point from the container coordinates (for example,
     * an object position) to the canvas coordinates.
     *
     * This method doesn't handle 3D rotations.
     *
     * @param x The x position, in container coordinates.
     * @param y The y position, in container coordinates.
     * @param cameraId The camera number. Currently ignored.
     * @param result The point instance that is used to return the result.
     */
    convertInverseCoords(
      x: float,
      y: float,
      cameraId: integer = 0,
      result: FloatPoint
    ): FloatPoint {
      // This code duplicates applyLayerTransformation for performance reasons;

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

    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in parent coordinate coordinates (as opposed to the layer local coordinates).
     *
     * All transformations (scale, rotation) are supported.
     *
     * This method doesn't handle 3D rotations.
     *
     * @param x The X position of the point, in layer coordinates.
     * @param y The Y position of the point, in layer coordinates.
     * @param result Array that will be updated with the result
     * (x and y position of the point in parent coordinates).
     */
    applyLayerTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint {
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
      x += this._runtimeScene.getViewportOriginX();
      y += this._runtimeScene.getViewportOriginY();

      result[0] = x;
      result[1] = y;
      return result;
    }

    /**
     * This ensure that the viewport dimensions are up to date.
     *
     * It's needed because custom objects dimensions are only updated on
     * demand for efficiency reasons.
     */
    private _forceDimensionUpdate(): void {
      // This will update dimensions.
      this._runtimeScene.getViewportWidth();
    }
  }
}
