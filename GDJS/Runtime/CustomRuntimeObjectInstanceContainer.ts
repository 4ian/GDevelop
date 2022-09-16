/*
 * GDevelop JS Platform
 * Copyright 2013-2022 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('RuntimeScene');
  const setupWarningLogger = new gdjs.Logger('RuntimeScene (setup warnings)');

  /**
   * The instance container of a custom object, containing instances of objects rendered on screen.
   *
   * @see gdjs.CustomRuntimeObject
   */
  export class CustomRuntimeObjectInstanceContainer extends gdjs.RuntimeInstanceContainer {
    _renderer: gdjs.CustomObjectRenderer;
    _debuggerRenderer: gdjs.DebuggerRenderer;
    _runtimeScene: gdjs.RuntimeScene;
    /** The parent container that contains the object associated with this container. */
    _parent: gdjs.RuntimeInstanceContainer;
    /** The object that is built with the instances of this container. */
    _customObject: gdjs.CustomRuntimeObject;
    _isLoaded: boolean = false;

    /**
     * @param parent the parent container that contains the object associated
     * with this container.
     * @param customObject the object that is built with the instances of this
     * container.
     */
    constructor(
      parent: gdjs.RuntimeInstanceContainer,
      customObject: gdjs.CustomRuntimeObject
    ) {
      super();
      this._parent = parent;
      this._customObject = customObject;
      this._runtimeScene = parent.getScene();
      this._renderer = new gdjs.CustomObjectRenderer(
        customObject,
        this,
        parent
      );
      this._debuggerRenderer = new gdjs.DebuggerRenderer(this);
    }

    createObject(objectName: string): gdjs.RuntimeObject | null {
      const result = super.createObject(objectName);
      this._customObject.onChildrenLocationChanged();
      return result;
    }

    /**
     * Load the container from the given scene.
     * @param customObjectData An object containing the container data.
     * @see gdjs.RuntimeGame#getSceneData
     */
    loadFrom(customObjectData: ObjectData & CustomObjectConfiguration) {
      if (this._isLoaded) {
        this.onDestroyFromScene(this._parent);
      }

      const eventsBasedObjectData = this._runtimeScene
        .getGame()
        .getEventsBasedObjectData(customObjectData.type);
      if (!eventsBasedObjectData) {
        logger.error('loadFrom was called without an events-based object');
        return;
      }

      // Registering objects
      for (
        let i = 0, len = eventsBasedObjectData.objects.length;
        i < len;
        ++i
      ) {
        const childObjectData = eventsBasedObjectData.objects[i];
        this.registerObject({
          ...childObjectData,
          ...customObjectData.childrenContent[childObjectData.name],
        });
      }

      // TODO EBO Remove it when the instance editor is done.
      // Add a default layer
      this.addLayer({
        name: '',
        visibility: true,
        cameras: [
          {
            defaultSize: true,
            defaultViewport: true,
            height: 0,
            viewportBottom: 0,
            viewportLeft: 0,
            viewportRight: 0,
            viewportTop: 0,
            width: 0,
          },
        ],
        effects: [],
        ambientLightColorR: 0,
        ambientLightColorG: 0,
        ambientLightColorB: 0,
        isLightingLayer: false,
        followBaseLayerCamera: false,
      });

      // Set up the default z order (for objects created from events)
      this._setLayerDefaultZOrders();

      this._isLoaded = true;
    }

    /**
     * Called when the associated object is destroyed (because it is removed
     * from its parent container or the scene is being unloaded).
     *
     * @param instanceContainer The container owning the object.
     */
    onDestroyFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (!this._isLoaded) {
        return;
      }

      // Notify the objects they are being destroyed
      const allInstancesList = this.getAdhocListOfAllInstances();
      for (let i = 0, len = allInstancesList.length; i < len; ++i) {
        const object = allInstancesList[i];
        object.onDestroyFromScene(this);
      }

      this._destroy();

      this._isLoaded = false;
    }

    _destroy() {
      // It should not be necessary to reset these variables, but this help
      // ensuring that all memory related to the RuntimeScene is released immediately.
      super._destroy();
      // @ts-ignore We are deleting the object
      this._onceTriggers = null;
    }

    _updateLayersCameraCoordinates(scale: float) {
      this._layersCameraCoordinates = this._layersCameraCoordinates || {};
      for (const name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
          const theLayer = this._layers.items[name];
          this._layersCameraCoordinates[name] = this._layersCameraCoordinates[
            name
          ] || [0, 0, 0, 0];
          this._layersCameraCoordinates[name][0] =
            theLayer.getCameraX() - (theLayer.getCameraWidth() / 2) * scale;
          this._layersCameraCoordinates[name][1] =
            theLayer.getCameraY() - (theLayer.getCameraHeight() / 2) * scale;
          this._layersCameraCoordinates[name][2] =
            theLayer.getCameraX() + (theLayer.getCameraWidth() / 2) * scale;
          this._layersCameraCoordinates[name][3] =
            theLayer.getCameraY() + (theLayer.getCameraHeight() / 2) * scale;
        }
      }
    }

    /**
     * Called to update effects of layers before rendering.
     */
    _updateLayersPreRender() {
      for (const name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
          const layer = this._layers.items[name];
          layer.updatePreRender(this);
        }
      }
    }

    /**
     * Called to update visibility of the renderers of objects
     * rendered on the scene ("culling"), update effects (of visible objects)
     * and give a last chance for objects to update before rendering.
     *
     * Visibility is set to false if object is hidden, or if
     * object is too far from the camera of its layer ("culling").
     */
    _updateObjectsPreRender() {
      const allInstancesList = this.getAdhocListOfAllInstances();
      for (
        let i = 0, len = this.getAdhocListOfAllInstances().length;
        i < len;
        ++i
      ) {
        const object = this.getAdhocListOfAllInstances()[i];
        const rendererObject = object.getRendererObject();
        if (rendererObject) {
          rendererObject.visible = !object.isHidden();

          // Update effects, only for visible objects.
          if (rendererObject.visible) {
            this.getGame()
              .getEffectsManager()
              .updatePreRender(object.getRendererEffects(), object);
          }
        }

        // Set to true to enable debug rendering (look for the implementation in the renderer
        // to see what is rendered).
        if (this._debugDrawEnabled) {
          this._debuggerRenderer.renderDebugDraw(
            this.getAdhocListOfAllInstances(),
            this._debugDrawShowHiddenInstances,
            this._debugDrawShowPointsNames,
            this._debugDrawShowCustomPoints
          );
        }

        // Perform pre-render update.
        object.updatePreRender(this);
      }
      return;
    }

    /**
     * Update the objects before launching the events.
     */
    _updateObjectsPreEvents() {
      const allInstancesList = this.getAdhocListOfAllInstances();
      for (let i = 0, len = allInstancesList.length; i < len; ++i) {
        const obj = allInstancesList[i];
        const elapsedTime = obj.getElapsedTime();
        if (!obj.hasNoForces()) {
          const averageForce = obj.getAverageForce();
          const elapsedTimeInSeconds = elapsedTime / 1000;
          obj.setX(obj.getX() + averageForce.getX() * elapsedTimeInSeconds);
          obj.setY(obj.getY() + averageForce.getY() * elapsedTimeInSeconds);
          obj.update(this);
          obj.updateForces(elapsedTimeInSeconds);
        } else {
          obj.update(this);
        }
        obj.updateTimers(elapsedTime);
        obj.stepBehaviorsPreEvents(this);
      }

      // Some behaviors may have request objects to be deleted.
      this._cacheOrClearRemovedInstances();
    }

    /**
     * Update the objects (update positions, time management...)
     */
    _updateObjectsPostEvents() {
      this._cacheOrClearRemovedInstances();

      const allInstancesList = this.getAdhocListOfAllInstances();
      for (let i = 0, len = allInstancesList.length; i < len; ++i) {
        allInstancesList[i].stepBehaviorsPostEvents(this);
      }

      // Some behaviors may have request objects to be deleted.
      this._cacheOrClearRemovedInstances();
    }

    /**
     * Get the renderer associated to the RuntimeScene.
     */
    getRenderer(): gdjs.CustomObjectRenderer {
      return this._renderer;
    }

    getDebuggerRenderer() {
      return this._debuggerRenderer;
    }

    getGame() {
      return this._runtimeScene.getGame();
    }

    getScene() {
      return this._runtimeScene;
    }

    getViewportWidth(): float {
      return this._customObject.getUnscaledWidth();
    }

    getViewportHeight(): float {
      return this._customObject.getUnscaledHeight();
    }

    onChildrenLocationChanged(): void {
      this._customObject.onChildrenLocationChanged();
    }

    /**
     * Triggered when the object dimensions are changed.
     *
     * It adapts the layers camera positions.
     */
    onObjectUnscaledDimensionChange(oldWidth: float, oldHeight: float): void {
      for (const name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
          /** @type gdjs.Layer */
          const theLayer: gdjs.Layer = this._layers.items[name];
          theLayer.onGameResolutionResized(oldWidth, oldHeight);
        }
      }
    }

    convertCoords(x: float, y: float, result?: FloatPoint): FloatPoint {
      let position = result || [0, 0];
      position = this._parent
        .getLayer(this._customObject.getLayer())
        .convertCoords(x, y, 0, position);
      this._customObject.applyObjectInverseTransformation(
        position[0],
        position[1],
        position
      );
      return position;
    }

    convertInverseCoords(
      sceneX: float,
      sceneY: float,
      result?: FloatPoint
    ): FloatPoint {
      const position = result || [0, 0];
      this._customObject.applyObjectTransformation(sceneX, sceneY, position);
      return this._parent.convertInverseCoords(
        position[0],
        position[1],
        position
      );
    }

    /**
     * Return the time elapsed since the last frame,
     * in milliseconds, for objects on the layer.
     */
    getElapsedTime(): float {
      return this._parent.getElapsedTime();
    }
  }
}
