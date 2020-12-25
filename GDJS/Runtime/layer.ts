/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Represents a layer of a scene, used to display objects.
   *
   * Viewports and multiple cameras are not supported.
   *
   * @class Layer
   * @memberof gdjs
   */
  export class Layer {
    _name: string;
    _cameraRotation: float = 0;
    _zoomFactor: float = 1;
    _timeScale: float = 1;
    _defaultZOrder: integer = 0;
    _hidden: boolean;
    _initialEffectsData: Array<EffectsData>;
    _cameraX: float;
    _cameraY: float;
    _cachedGameResolutionWidth: integer;
    _cachedGameResolutionHeight: integer;
    _runtimeScene: gdjs.RuntimeScene;

    // Lighting layer properties.
    _isLightingLayer: boolean;
    _followBaseLayerCamera: boolean;
    _clearColor: Array<integer>;

    // @ts-ignore - assume the proper renderer is passed
    _renderer: any;

    /**
     * @param layerData The data used to initialize the layer
     * @param runtimeScene The scene in which the layer is used
     */
    constructor(layerData: LayerData, runtimeScene: gdjs.RuntimeScene) {
      this._name = layerData.name;
      this._hidden = !layerData.visibility;
      this._initialEffectsData = layerData.effects || [];
      this._cameraX = runtimeScene.getGame().getGameResolutionWidth() / 2;
      this._cameraY = runtimeScene.getGame().getGameResolutionHeight() / 2;
      this._cachedGameResolutionWidth = runtimeScene
        .getGame()
        .getGameResolutionWidth();
      this._cachedGameResolutionHeight = runtimeScene
        .getGame()
        .getGameResolutionHeight();
      this._runtimeScene = runtimeScene;
      this._isLightingLayer = layerData.isLightingLayer;
      this._followBaseLayerCamera = layerData.followBaseLayerCamera;
      this._clearColor = [
        layerData.ambientLightColorR / 255,
        layerData.ambientLightColorG / 255,
        layerData.ambientLightColorB / 255,
        1.0,
      ];
      this._renderer = new gdjs.LayerRenderer(this, runtimeScene.getRenderer());
      this.show(!this._hidden);
      for (let i = 0; i < layerData.effects.length; ++i) {
        this.addEffect(layerData.effects[i]);
      }
    }

    getRenderer() {
      return this._renderer;
    }

    /**
     * Get the default Z order to be attributed to objects created on this layer
     * (usually from events generated code).
     */
    getDefaultZOrder(): float {
      return this._defaultZOrder;
    }

    /**
     * Set the default Z order to be attributed to objects created on this layer.
     * @param defaultZOrder The Z order to use when creating a new object from events.
     */
    setDefaultZOrder(defaultZOrder: integer): void {
      this._defaultZOrder = defaultZOrder;
    }

    /**
     * Called by the RuntimeScene whenever the game resolution size is changed.
     * Updates the layer width/height and position.
     */
    onGameResolutionResized() {
      const oldGameResolutionWidth = this._cachedGameResolutionWidth;
      const oldGameResolutionHeight = this._cachedGameResolutionHeight;
      this._cachedGameResolutionWidth = this._runtimeScene
        .getGame()
        .getGameResolutionWidth();
      this._cachedGameResolutionHeight = this._runtimeScene
        .getGame()
        .getGameResolutionHeight();

      // Adapt position of the camera center as:
      // * Most cameras following a player/object on the scene will be updating this
      // in events anyway.
      // * Cameras not following a player/object are usually UIs which are intuitively
      // expected not to "move". Not adapting the center position would make the camera
      // move from its initial position (which is centered in the screen) - and anchor
      // behavior would behave counterintuitively.
      this._cameraX +=
        (this._cachedGameResolutionWidth - oldGameResolutionWidth) / 2;
      this._cameraY +=
        (this._cachedGameResolutionHeight - oldGameResolutionHeight) / 2;
      this._renderer.updatePosition();
    }

    /**
     * Returns the scene the layer belongs to
     * @returns the scene the layer belongs to
     */
    getRuntimeScene(): gdjs.RuntimeScene {
      return this._runtimeScene;
    }

    /**
     * Called at each frame, after events are run and before rendering.
     * @param runtimeScene The scene the layer belongs to.
     */
    update(runtimeScene: gdjs.RuntimeScene): void {
      if (this._followBaseLayerCamera) {
        this.followBaseLayer();
      }
      return this._renderer.update();
    }

    /**
     * Get the name of the layer
     * @return The name of the layer
     */
    getName(): string {
      return this._name;
    }

    /**
     * Change the camera center X position.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The x position of the camera
     */
    getCameraX(cameraId?: integer): float {
      return this._cameraX;
    }

    /**
     * Change the camera center Y position.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The y position of the camera
     */
    getCameraY(cameraId?: integer): float {
      return this._cameraY;
    }

    /**
     * Set the camera center X position.
     *
     * @param x The new x position
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraX(x: float, cameraId?: integer): void {
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
      return (+this._cachedGameResolutionWidth * 1) / this._zoomFactor;
    }

    /**
     * Get the camera height (which can be different than the game resolution height
     * if the camera is zoomed).
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The height of the camera
     */
    getCameraHeight(cameraId?: integer): float {
      return (+this._cachedGameResolutionHeight * 1) / this._zoomFactor;
    }

    /**
     * Show (or hide) the layer.
     * @param enable true to show the layer, false to hide it.
     */
    show(enable: boolean): void {
      this._hidden = !enable;
      this._renderer.updateVisibility(enable);
    }

    /**
     * Check if the layer is visible.
     *
     * @return true if the layer is visible.
     */
    isVisible(): boolean {
      return !this._hidden;
    }

    /**
     * Set the zoom of a camera.
     *
     * @param newZoom The new zoom. Must be superior to 0. 1 is the default zoom.
     * @param cameraId The camera number. Currently ignored.
     */
    setCameraZoom(newZoom: float, cameraId?: integer): void {
      this._zoomFactor = newZoom;
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
     * Convert a point from the canvas coordinates (For example, the mouse position) to the
     * "world" coordinates.
     *
     * TODO: Update this method to store the result in a static array
     *
     * @param x The x position, in canvas coordinates.
     * @param y The y position, in canvas coordinates.
     * @param cameraId The camera number. Currently ignored.
     */
    convertCoords(x: float, y: float, cameraId?: integer) {
      x -= this._cachedGameResolutionWidth / 2;
      y -= this._cachedGameResolutionHeight / 2;
      x /= Math.abs(this._zoomFactor);
      y /= Math.abs(this._zoomFactor);

      // Only compute angle and cos/sin once (allow heavy optimization from JS engines).
      const angleInRadians = (this._cameraRotation / 180) * Math.PI;
      const tmp = x;
      const cosValue = Math.cos(angleInRadians);
      const sinValue = Math.sin(angleInRadians);
      x = cosValue * x - sinValue * y;
      y = sinValue * tmp + cosValue * y;
      return [x + this.getCameraX(cameraId), y + this.getCameraY(cameraId)];
    }

    convertInverseCoords(x, y, cameraId) {
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
      return [
        x + this._cachedGameResolutionWidth / 2,
        y + this._cachedGameResolutionHeight / 2,
      ];
    }

    getWidth(): float {
      return this._cachedGameResolutionWidth;
    }

    getHeight(): float {
      return this._cachedGameResolutionHeight;
    }

    /**
     * Return the initial effects data for the layer. Only to
     * be used by renderers.
     */
    getInitialEffectsData() {
      return this._initialEffectsData;
    }

    /**
     * Add a new effect, or replace the one with the same name.
     * @param effectData The data of the effect to add.
     */
    addEffect(effectData: EffectData) {
      this._renderer.addEffect(effectData);
      for (let name in effectData.doubleParameters) {
        this.setEffectDoubleParameter(
          effectData.name,
          name,
          effectData.doubleParameters[name]
        );
      }
      for (let name in effectData.stringParameters) {
        this.setEffectStringParameter(
          effectData.name,
          name,
          effectData.stringParameters[name]
        );
      }
      for (let name in effectData.booleanParameters) {
        this.setEffectBooleanParameter(
          effectData.name,
          name,
          effectData.booleanParameters[name]
        );
      }
    }

    /**
     * Remove the effect with the specified name
     * @param effectName The name of the effect.
     */
    removeEffect(effectName: string) {
      this._renderer.removeEffect(effectName);
    }

    /**
     * Change an effect parameter value (for parameters that are numbers).
     * @param name The name of the effect to update.
     * @param parameterName The name of the parameter to update.
     * @param value The new value (number).
     */
    setEffectDoubleParameter(
      name: string,
      parameterName: string,
      value: float
    ): void {
      return this._renderer.setEffectDoubleParameter(
        name,
        parameterName,
        value
      );
    }

    /**
     * Change an effect parameter value (for parameters that are strings).
     * @param name The name of the effect to update.
     * @param parameterName The name of the parameter to update.
     * @param value The new value (string).
     */
    setEffectStringParameter(
      name: string,
      parameterName: string,
      value: string
    ): void {
      return this._renderer.setEffectStringParameter(
        name,
        parameterName,
        value
      );
    }

    /**
     * Change an effect parameter value (for parameters that are booleans).
     * @param name The name of the effect to update.
     * @param parameterName The name of the parameter to update.
     * @param value The new value (boolean).
     */
    setEffectBooleanParameter(
      name: string,
      parameterName: string,
      value: boolean
    ): void {
      return this._renderer.setEffectBooleanParameter(
        name,
        parameterName,
        value
      );
    }

    /**
     * Enable or disable an effect.
     * @param name The name of the effect to enable or disable.
     * @param enable true to enable, false to disable
     */
    enableEffect(name: string, enable: boolean): void {
      this._renderer.enableEffect(name, enable);
    }

    /**
     * Check if an effect is enabled
     * @param name The name of the effect
     * @return true if the effect is enabled, false otherwise.
     */
    isEffectEnabled(name: string): boolean {
      return this._renderer.isEffectEnabled(name);
    }

    /**
     * Check if an effect exists on this layer
     * @param name The name of the effect
     * @return true if the effect exists, false otherwise.
     */
    hasEffect(name: string): boolean {
      return this._renderer.hasEffect(name);
    }

    /**
     * Set the time scale for the objects on the layer:
     * time will be slower if time scale is < 1, faster if > 1.
     * @param timeScale The new time scale (must be positive).
     */
    setTimeScale(timeScale: float): void {
      if (timeScale >= 0) {
        this._timeScale = timeScale;
      }
    }

    /**
     * Get the time scale for the objects on the layer.
     */
    getTimeScale(): float {
      return this._timeScale;
    }

    /**
     * Return the time elapsed since the last frame,
     * in milliseconds, for objects on the layer.
     */
    getElapsedTime(): float {
      return (
        this._runtimeScene.getTimeManager().getElapsedTime() * this._timeScale
      );
    }

    /**
     * Change the position, rotation and scale (zoom) of the layer camera to be the same as the base layer camera.
     */
    followBaseLayer() {
      const baseLayer = this._runtimeScene.getLayer('');
      this.setCameraX(baseLayer.getCameraX());
      this.setCameraY(baseLayer.getCameraY());
      this.setCameraRotation(baseLayer.getCameraRotation());
      this.setCameraZoom(baseLayer.getCameraZoom());
    }

    /**
     * The clear color is defined in the format [r, g, b], with components in the range of 0 to 1.
     * @return the clear color of layer in the range of [0, 1].
     */
    getClearColor(): Array<integer> {
      return this._clearColor;
    }

    /**
     * Set the clear color in format [r, g, b], with components in the range of 0 to 1.;
     * @param r Red color component in the range 0-255.
     * @param g Green color component in the range 0-255.
     * @param b Blue color component in the range 0-255.
     */
    setClearColor(
      r: integer | null,
      g: integer | null,
      b: integer | null
    ): void {
      if (r) {
        this._clearColor[0] = r / 255;
      }
      if (g) {
        this._clearColor[1] = g / 255;
      }
      if (b) {
        this._clearColor[2] = b / 255;
      }
      this._renderer.updateClearColor();
    }

    /**
     * Set whether layer's camera follows base layer's camera or not.
     */
    setFollowBaseLayerCamera(follow: boolean): void {
      this._followBaseLayerCamera = follow;
    }

    /**
     * Return true if the layer is a lighting layer, false otherwise.
     * @return true if it is a lighting layer, false otherwise.
     */
    isLightingLayer(): boolean {
      return this._isLightingLayer;
    }
  }
}
