/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export enum RuntimeLayerRenderingType {
    TWO_D,
    THREE_D,
    TWO_D_PLUS_THREE_D,
  }

  const getRenderingTypeFromString = (
    renderingTypeAsString: string | undefined
  ) =>
    renderingTypeAsString === '3d'
      ? RuntimeLayerRenderingType.THREE_D
      : renderingTypeAsString === '2d+3d' || renderingTypeAsString === ''
      ? RuntimeLayerRenderingType.TWO_D_PLUS_THREE_D
      : RuntimeLayerRenderingType.TWO_D;

  export enum RuntimeLayerCameraType {
    PERSPECTIVE,
    ORTHOGRAPHIC,
  }

  const getCameraTypeFromString = (renderingTypeAsString: string | undefined) =>
    renderingTypeAsString === 'orthographic'
      ? RuntimeLayerCameraType.ORTHOGRAPHIC
      : RuntimeLayerCameraType.PERSPECTIVE;
  /**
   * Represents a layer of a "container", used to display objects.
   * The container can be a scene (see gdjs.Layer)
   * or a custom object (see gdjs.RuntimeCustomObjectLayer).
   */
  export abstract class RuntimeLayer implements EffectsTarget {
    _name: string;
    _renderingType: RuntimeLayerRenderingType;
    _cameraType: RuntimeLayerCameraType;
    _timeScale: float = 1;
    _defaultZOrder: integer = 0;
    _hidden: boolean;
    _initialEffectsData: Array<EffectData>;

    // TODO EBO Don't store scene layer related data in layers used by custom objects.
    // (both these 3D settings and the lighting layer properties below).
    _initialCamera3DFieldOfView: float;
    _initialCamera3DFarPlaneDistance: float;
    _initialCamera3DNearPlaneDistance: float;

    _runtimeScene: gdjs.RuntimeInstanceContainer;
    _effectsManager: gdjs.EffectsManager;

    // Lighting layer properties.
    _isLightingLayer: boolean;
    _followBaseLayerCamera: boolean;
    _clearColor: Array<integer>;

    _rendererEffects: Record<string, gdjs.PixiFiltersTools.Filter> = {};
    _renderer: gdjs.LayerRenderer;

    /**
     * @param layerData The data used to initialize the layer
     * @param instanceContainer The container in which the layer is used
     */
    constructor(
      layerData: LayerData,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._name = layerData.name;
      this._renderingType = getRenderingTypeFromString(layerData.renderingType);
      this._cameraType = getCameraTypeFromString(layerData.cameraType);
      this._hidden = !layerData.visibility;
      this._initialCamera3DFieldOfView = layerData.camera3DFieldOfView || 45;
      this._initialCamera3DNearPlaneDistance =
        layerData.camera3DNearPlaneDistance || 0.1;
      this._initialCamera3DFarPlaneDistance =
        layerData.camera3DFarPlaneDistance || 2000;
      this._initialEffectsData = layerData.effects || [];
      this._runtimeScene = instanceContainer;
      this._effectsManager = instanceContainer.getGame().getEffectsManager();
      this._isLightingLayer = layerData.isLightingLayer;
      this._followBaseLayerCamera = layerData.followBaseLayerCamera;
      this._clearColor = [
        layerData.ambientLightColorR / 255,
        layerData.ambientLightColorG / 255,
        layerData.ambientLightColorB / 255,
        1.0,
      ];
      this._renderer = new gdjs.LayerRenderer(
        this,
        instanceContainer.getRenderer(),
        instanceContainer.getGame().getRenderer()
      );
      this.show(!this._hidden);
      for (let i = 0; i < layerData.effects.length; ++i) {
        this.addEffect(layerData.effects[i]);
      }
    }

    getRenderer(): gdjs.LayerRenderer {
      return this._renderer;
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    get3DRendererObject() {
      return this._renderer.getThreeScene();
    }

    getRenderingType(): RuntimeLayerRenderingType {
      return this._renderingType;
    }

    getCameraType(): RuntimeLayerCameraType {
      return this._cameraType;
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
    abstract onGameResolutionResized(
      oldGameResolutionOriginX: float,
      oldGameResolutionOriginY: float
    ): void;

    /**
     * Returns the scene the layer belongs to directly or indirectly
     * @returns the scene the layer belongs to directly or indirectly
     */
    getRuntimeScene(): gdjs.RuntimeScene {
      return this._runtimeScene.getScene();
    }

    /**
     * Called at each frame, after events are run and before rendering.
     */
    updatePreRender(instanceContainer?: gdjs.RuntimeInstanceContainer): void {
      if (this._followBaseLayerCamera) {
        this.followBaseLayer();
      }
      this._renderer.updatePreRender();
      this._effectsManager.updatePreRender(this._rendererEffects, this);
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
    abstract getCameraX(cameraId?: integer): float;

    /**
     * Change the camera center Y position.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The y position of the camera
     */
    abstract getCameraY(cameraId?: integer): float;

    /**
     * Set the camera center X position.
     *
     * @param x The new x position
     * @param cameraId The camera number. Currently ignored.
     */
    abstract setCameraX(x: float, cameraId?: integer): void;

    /**
     * Set the camera center Y position.
     *
     * @param y The new y position
     * @param cameraId The camera number. Currently ignored.
     */
    abstract setCameraY(y: float, cameraId?: integer): void;

    /**
     * Get the camera width (which can be different than the game resolution width
     * if the camera is zoomed).
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The width of the camera
     */
    abstract getCameraWidth(cameraId?: integer): float;

    /**
     * Get the camera height (which can be different than the game resolution height
     * if the camera is zoomed).
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The height of the camera
     */
    abstract getCameraHeight(cameraId?: integer): float;

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
    abstract setCameraZoom(newZoom: float, cameraId?: integer): void;

    /**
     * Get the zoom of a camera.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The zoom.
     */
    abstract getCameraZoom(cameraId?: integer): float;

    /**
     * Set the camera center Z position.
     *
     * @param z The new y position.
     * @param fov The field of view.
     * @param cameraId The camera number. Currently ignored.
     */
    abstract setCameraZ(z: float, fov: float | null, cameraId?: integer): void;

    /**
     * Get the camera center Z position.
     *
     * @param fov The field of view.
     * @param cameraId The camera number. Currently ignored.
     * @return The z position of the camera
     */
    abstract getCameraZ(fov: float | null, cameraId?: integer): float;

    /**
     * Get the rotation of the camera, expressed in degrees.
     *
     * @param cameraId The camera number. Currently ignored.
     * @return The rotation, in degrees.
     */
    abstract getCameraRotation(cameraId?: integer): float;

    /**
     * Set the rotation of the camera, expressed in degrees.
     * The rotation is made around the camera center.
     *
     * @param rotation The new rotation, in degrees.
     * @param cameraId The camera number. Currently ignored.
     */
    abstract setCameraRotation(rotation: float, cameraId?: integer): void;

    /**
     * Convert a point from the canvas coordinates (for example,
     * the mouse position) to the container coordinates.
     *
     * @param x The x position, in canvas coordinates.
     * @param y The y position, in canvas coordinates.
     * @param cameraId The camera number. Currently ignored.
     * @param result The point instance that is used to return the result.
     */
    abstract convertCoords(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint;

    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in parent coordinate coordinates (as opposed to the layer local coordinates).
     *
     * All transformations (scale, rotation) are supported.
     *
     * @param x The X position of the point, in layer coordinates.
     * @param y The Y position of the point, in layer coordinates.
     * @param result Array that will be updated with the result
     * (x and y position of the point in parent coordinates).
     */
    abstract applyLayerTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint;

    /**
     * Convert a point from the container coordinates (for example,
     * an object position) to the canvas coordinates.
     *
     * @param x The x position, in container coordinates.
     * @param y The y position, in container coordinates.
     * @param cameraId The camera number. Currently ignored.
     * @param result The point instance that is used to return the result.
     */
    abstract convertInverseCoords(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint;

    /**
     * Return an array containing the coordinates of the point passed as parameter
     * in layer local coordinates (as opposed to the parent coordinates).
     *
     * All transformations (scale, rotation) are supported.
     *
     * @param x The X position of the point, in parent coordinates.
     * @param y The Y position of the point, in parent coordinates.
     * @param result Array that will be updated with the result
     * @param result The point instance that is used to return the result.
     * (x and y position of the point in layer coordinates).
     */
    abstract applyLayerInverseTransformation(
      x: float,
      y: float,
      cameraId: integer,
      result: FloatPoint
    ): FloatPoint;

    getWidth(): float {
      return this._runtimeScene.getViewportWidth();
    }

    getHeight(): float {
      return this._runtimeScene.getViewportHeight();
    }

    getInitialCamera3DFieldOfView(): float {
      return this._initialCamera3DFieldOfView;
    }
    getInitialCamera3DNearPlaneDistance(): float {
      return this._initialCamera3DNearPlaneDistance;
    }
    getInitialCamera3DFarPlaneDistance(): float {
      return this._initialCamera3DFarPlaneDistance;
    }

    /**
     * Return the initial effects data for the layer. Only to
     * be used by renderers.
     * @deprecated
     */
    getInitialEffectsData(): EffectData[] {
      return this._initialEffectsData;
    }

    /**
     * Returns the collection of effects to be rendered by the
     * underlying renderer.
     * @returns The renderer effects.
     */
    getRendererEffects() {
      return this._rendererEffects;
    }

    /**
     * Add a new effect, or replace the one with the same name.
     * @param effectData The data of the effect to add.
     */
    addEffect(effectData: EffectData): void {
      this._effectsManager.addEffect(effectData, this._rendererEffects, this);
    }

    /**
     * Remove the effect with the specified name
     * @param effectName The name of the effect.
     */
    removeEffect(effectName: string): void {
      this._effectsManager.removeEffect(
        this._rendererEffects,
        this,
        effectName
      );
    }

    /**
     * Change an effect property value (for properties that are numbers).
     * @param name The name of the effect to update.
     * @param parameterName The name of the property to update.
     * @param value The new value (number).
     */
    setEffectDoubleParameter(
      name: string,
      parameterName: string,
      value: float
    ): void {
      this._effectsManager.setEffectDoubleParameter(
        this._rendererEffects,
        name,
        parameterName,
        value
      );
    }

    /**
     * Change an effect property value (for properties that are strings).
     * @param name The name of the effect to update.
     * @param parameterName The name of the property to update.
     * @param value The new value (string).
     */
    setEffectStringParameter(
      name: string,
      parameterName: string,
      value: string
    ): void {
      this._effectsManager.setEffectStringParameter(
        this._rendererEffects,
        name,
        parameterName,
        value
      );
    }

    /**
     * Change an effect property value (for properties that are booleans).
     * @param name The name of the effect to update.
     * @param parameterName The name of the property to update.
     * @param value The new value (boolean).
     */
    setEffectBooleanParameter(
      name: string,
      parameterName: string,
      value: boolean
    ): void {
      this._effectsManager.setEffectBooleanParameter(
        this._rendererEffects,
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
      this._effectsManager.enableEffect(
        this._rendererEffects,
        this,
        name,
        enable
      );
    }

    /**
     * Check if an effect is enabled
     * @param name The name of the effect
     * @return true if the effect is enabled, false otherwise.
     */
    isEffectEnabled(name: string): boolean {
      return this._effectsManager.isEffectEnabled(
        this._rendererEffects,
        this,
        name
      );
    }

    /**
     * Check if an effect exists on this layer
     * @param name The name of the effect
     * @return true if the effect exists, false otherwise.
     */
    hasEffect(name: string): boolean {
      return this._effectsManager.hasEffect(this._rendererEffects, name);
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
     *
     * @param instanceContainer The instance container the layer belongs to (deprecated - can be omitted).
     */
    getElapsedTime(instanceContainer?: gdjs.RuntimeInstanceContainer): float {
      const container = instanceContainer || this._runtimeScene;
      return container.getElapsedTime() * this._timeScale;
    }

    /**
     * Change the position, rotation and scale (zoom) of the layer camera to be the same as the base layer camera.
     */
    followBaseLayer(): void {
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
    setClearColor(r: integer, g: integer, b: integer): void {
      this._clearColor[0] = r / 255;
      this._clearColor[1] = g / 255;
      this._clearColor[2] = b / 255;
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
