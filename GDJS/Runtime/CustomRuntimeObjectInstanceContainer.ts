/*
 * GDevelop JS Platform
 * Copyright 2013-2022 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * The instance container of a custom object, containing instances of objects rendered on screen.
   *
   * @see gdjs.CustomRuntimeObject
   */
  export class CustomRuntimeObjectInstanceContainer extends gdjs.RuntimeInstanceContainer {
    _debuggerRenderer: gdjs.DebuggerRenderer;
    _runtimeScene: gdjs.RuntimeScene;
    /** The parent container that contains the object associated with this container. */
    _parent: gdjs.RuntimeInstanceContainer;
    /** The object that is built with the instances of this container. */
    _customObject: gdjs.CustomRuntimeObject;
    _isLoaded: boolean = false;
    /**
     * The default size defined by users in the custom object initial instances editor.
     *
     * Don't modify it as it would affect every instance.
     *
     * @see gdjs.CustomRuntimeObject._innerArea
     **/
    private _initialInnerArea: {
      min: [float, float, float];
      max: [float, float, float];
    } | null = null;

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
      this._debuggerRenderer = new gdjs.DebuggerRenderer(this);
    }

    addLayer(layerData: LayerData) {
      const layer = new gdjs.RuntimeCustomObjectLayer(layerData, this);
      this._layers.put(layerData.name, layer);
      this._orderedLayers.push(layer);
    }

    createObject(objectName: string): gdjs.RuntimeObject | null {
      const result = super.createObject(objectName);
      this._customObject.onChildrenLocationChanged();
      return result;
    }

    /**
     * Load the container from the given initial configuration.
     * @param customObjectData An object containing the container data.
     * @see gdjs.RuntimeGame#getSceneAndExtensionsData
     */
    loadFrom(
      customObjectData: ObjectData & CustomObjectConfiguration,
      eventsBasedObjectData: EventsBasedObjectData
    ) {
      if (this._isLoaded) {
        this.onDestroyFromScene(this._parent);
      }

      this._setOriginalInnerArea(eventsBasedObjectData);

      // Registering objects
      for (
        let i = 0, len = eventsBasedObjectData.objects.length;
        i < len;
        ++i
      ) {
        const childObjectData = eventsBasedObjectData.objects[i];
        if (customObjectData.childrenContent) {
          this.registerObject({
            ...childObjectData,
            // The custom object overrides its events-based object configuration.
            ...customObjectData.childrenContent[childObjectData.name],
          });
        } else {
          // The custom object follows its events-based object configuration.
          this.registerObject(childObjectData);
        }
      }

      if (eventsBasedObjectData.layers.length > 0) {
        // Load layers
        for (
          let i = 0, len = eventsBasedObjectData.layers.length;
          i < len;
          ++i
        ) {
          this.addLayer(eventsBasedObjectData.layers[i]);
        }
      } else {
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
      }

      this.createObjectsFrom(
        eventsBasedObjectData.instances,
        0,
        0,
        0,
        // TODO EBO: handle hot-reloading for custom objects (including nested custom objects)
        true
      );

      // Set up the default z order (for objects created from events)
      this._setLayerDefaultZOrders();

      this._isLoaded = true;
    }

    /**
     * Initialize `_initialInnerArea` if it doesn't exist.
     * `_initialInnerArea` is shared by every instance to save memory.
     */
    private _setOriginalInnerArea(
      eventsBasedObjectData: EventsBasedObjectData
    ) {
      if (eventsBasedObjectData.instances.length > 0) {
        if (!eventsBasedObjectData._initialInnerArea) {
          eventsBasedObjectData._initialInnerArea = {
            min: [
              eventsBasedObjectData.areaMinX,
              eventsBasedObjectData.areaMinY,
              eventsBasedObjectData.areaMinZ,
            ],
            max: [
              eventsBasedObjectData.areaMaxX,
              eventsBasedObjectData.areaMaxY,
              eventsBasedObjectData.areaMaxZ,
            ],
          };
        }
        this._initialInnerArea = eventsBasedObjectData._initialInnerArea;
      }
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
        object.onDeletedFromScene(this);
        // The object can free all its resource directly...
        object.onDestroyed();
      }
      // ...as its container cache `_instancesRemoved` is also destroy.
      this._destroy();

      this._isLoaded = false;
    }

    _destroy() {
      // It should not be necessary to reset these variables, but this help
      // ensuring that all memory related to the container is released immediately.
      super._destroy();
      // @ts-ignore We are deleting the object
      this._onceTriggers = null;
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
      // TODO (3D) culling - add support for 3D object culling?
      for (let i = 0, len = allInstancesList.length; i < len; ++i) {
        const object = allInstancesList[i];
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
            allInstancesList,
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
     * Get the renderer associated to the RuntimeScene.
     */
    getRenderer():
      | gdjs.CustomRuntimeObject2DRenderer
      | gdjs.CustomRuntimeObject3DRenderer {
      return this._customObject.getRenderer();
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

    getOwner(): gdjs.CustomRuntimeObject {
      return this._customObject;
    }

    getAsyncTasksManager(): AsyncTasksManager {
      return this._runtimeScene.getAsyncTasksManager();
    }

    getUnrotatedViewportMinX(): float {
      return this._customObject.getInnerAreaMinX();
    }

    getUnrotatedViewportMinY(): float {
      return this._customObject.getInnerAreaMinY();
    }

    getUnrotatedViewportMaxX(): float {
      return this._customObject.getInnerAreaMaxX();
    }

    getUnrotatedViewportMaxY(): float {
      return this._customObject.getInnerAreaMaxY();
    }

    getInitialUnrotatedViewportMinX(): float {
      return this._initialInnerArea ? this._initialInnerArea.min[0] : 0;
    }

    getInitialUnrotatedViewportMinY(): float {
      return this._initialInnerArea ? this._initialInnerArea.min[1] : 0;
    }

    getInitialUnrotatedViewportMaxX(): float {
      return this._initialInnerArea ? this._initialInnerArea.max[0] : 0;
    }

    getInitialUnrotatedViewportMaxY(): float {
      return this._initialInnerArea ? this._initialInnerArea.max[1] : 0;
    }

    getViewportWidth(): float {
      return this._customObject.getUnscaledWidth();
    }

    getViewportHeight(): float {
      return this._customObject.getUnscaledHeight();
    }

    getViewportOriginX(): float {
      return this._customObject.getUnscaledCenterX();
    }

    getViewportOriginY(): float {
      return this._customObject.getUnscaledCenterY();
    }

    onChildrenLocationChanged(): void {
      this._customObject.onChildrenLocationChanged();
    }

    convertCoords(x: float, y: float, result: FloatPoint): FloatPoint {
      // The result parameter used to be optional.
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
      result: FloatPoint
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
