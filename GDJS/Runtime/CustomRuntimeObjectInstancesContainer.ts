/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('RuntimeScene');
  const setupWarningLogger = new gdjs.Logger('RuntimeScene (setup warnings)');

  /**
   * A scene being played, containing instances of objects rendered on screen.
   */
  export class CustomRuntimeObjectInstancesContainer extends gdjs.RuntimeInstancesContainer {
    _renderer: gdjs.CustomObjectRenderer;
    _runtimeScene: gdjs.RuntimeScene;
    _parent: gdjs.RuntimeInstancesContainer;
    _customObject: gdjs.CustomRuntimeObject;
    _isLoaded: boolean = false;

    /**
     * @param runtimeGame The game associated to this scene.
     */
    constructor(
      parent: gdjs.RuntimeInstancesContainer,
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
    }

    createObject(objectName: string): gdjs.RuntimeObject | null {
      console.log("CustomObject createObject");
      const result = super.createObject(objectName);
      this._customObject.onChildrenLocationChange();
      return result;
    }

    /**
     * Load the runtime scene from the given scene.
     * @param customObjectData An object containing the scene data.
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
        cameras: [{
          defaultSize: true,
          defaultViewport: true,
          height: 0,
          viewportBottom: 0,
          viewportLeft: 0,
          viewportRight: 0,
          viewportTop: 0,
          width: 0}],
        effects: [],
        ambientLightColorR: 0,
        ambientLightColorG: 0,
        ambientLightColorB: 0,
        isLightingLayer: false,
        followBaseLayerCamera: false});

      // Set up the default z order (for objects created from events)
      this._setLayerDefaultZOrders();

      this._isLoaded = true;
    }

    onDestroyFromScene(runtimeScene: gdjs.RuntimeInstancesContainer): void {
      if (!this._isLoaded) {
        return;
      }

      // Notify the objects they are being destroyed
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        const object = this._allInstancesList[i];
        object.onDestroyFromScene(this);
      }

      // It should not be necessary to reset these variables, but this help
      // ensuring that all memory related to the RuntimeScene is released immediately.
      this._layers = new Hashtable();
      this._objects = new Hashtable();
      this._instances = new Hashtable();
      this._instancesCache = new Hashtable();
      this._objectsCtor = new Hashtable();
      this._allInstancesList = [];
      this._instancesRemoved = [];

      //@ts-ignore We are deleting the object
      this._onceTriggers = null;
      this._isLoaded = false;
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
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        const object = this._allInstancesList[i];
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

        // Perform pre-render update.
        object.updatePreRender(this);
      }
      return;
    }

    /**
     * Update the objects before launching the events.
     */
    _updateObjectsPreEvents() {
      //It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
      //may delete the objects.
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        const obj = this._allInstancesList[i];
        const elapsedTime = obj.getElapsedTime(this);
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
        this._allInstancesList[i].stepBehaviorsPreEvents(this);
      }

      //Some behaviors may have request objects to be deleted.
      this._cacheOrClearRemovedInstances();
    }

    /**
     * Update the objects (update positions, time management...)
     */
    _updateObjectsPostEvents() {
      this._cacheOrClearRemovedInstances();

      //It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
      //may delete the objects.
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        this._allInstancesList[i].stepBehaviorsPostEvents(this);
      }

      //Some behaviors may have request objects to be deleted.
      this._cacheOrClearRemovedInstances();
    }

    /**
     * Update the objects positions according to their forces
     */
    updateObjectsForces(): void {
      for (const name in this._instances.items) {
        if (this._instances.items.hasOwnProperty(name)) {
          const list = this._instances.items[name];
          for (let j = 0, listLen = list.length; j < listLen; ++j) {
            const obj = list[j];
            if (!obj.hasNoForces()) {
              const averageForce = obj.getAverageForce();
              const elapsedTimeInSeconds = obj.getElapsedTime(this) / 1000;
              obj.setX(obj.getX() + averageForce.getX() * elapsedTimeInSeconds);
              obj.setY(obj.getY() + averageForce.getY() * elapsedTimeInSeconds);
              obj.updateForces(elapsedTimeInSeconds);
            }
          }
        }
      }
    }

    getAllInstances(): gdjs.RuntimeObject[] {
      return this._allInstancesList;
    }

    /**
     * Get the renderer associated to the RuntimeScene.
     */
    getRenderer(): gdjs.CustomObjectRenderer {
      return this._renderer;
    }

    getGame() {
      return this._runtimeScene.getGame();
    }

    getScene() {
      return this._runtimeScene;
    }
    
    getProfiler(): gdjs.Profiler | null {
      return this._runtimeScene.getProfiler();
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
