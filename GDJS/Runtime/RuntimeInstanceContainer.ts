/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('RuntimeInstanceContainer');

  /**
   * A container of object instances rendered on screen.
   */
  export abstract class RuntimeInstanceContainer {
    _initialBehaviorSharedData: Hashtable<BehaviorSharedData | null>;

    /** Contains the instances living on the container */
    _instances: Hashtable<RuntimeObject[]>;

    /**
     * An array used to create a list of all instance when necessary.
     * @see gdjs.RuntimeInstanceContainer#_constructListOfAllInstances}
     */
    private _allInstancesList: gdjs.RuntimeObject[] = [];
    _allInstancesListIsUpToDate = true;

    /** Used to recycle destroyed instance instead of creating new ones. */
    _instancesCache: Hashtable<RuntimeObject[]>;

    /** The instances removed from the container and waiting to be sent to the cache. */
    _instancesRemoved: gdjs.RuntimeObject[] = [];

    /** Contains the objects data stored in the project */
    _objects: Hashtable<ObjectData>;
    _objectsCtor: Hashtable<typeof RuntimeObject>;

    _layers: Hashtable<RuntimeLayer>;
    _orderedLayers: RuntimeLayer[]; // TODO: should this be a single structure with _layers, to enforce its usage?
    _layersCameraCoordinates: Record<string, [float, float, float, float]> = {};

    // Options for the debug draw:
    _debugDrawEnabled: boolean = false;
    _debugDrawShowHiddenInstances: boolean = false;
    _debugDrawShowPointsNames: boolean = false;
    _debugDrawShowCustomPoints: boolean = false;

    constructor() {
      this._initialBehaviorSharedData = new Hashtable();
      this._instances = new Hashtable();
      this._instancesCache = new Hashtable();
      this._objects = new Hashtable();
      this._objectsCtor = new Hashtable();
      this._layers = new Hashtable();
      this._orderedLayers = [];
    }

    /**
     * Return the time elapsed since the last frame,
     * in milliseconds, for objects on the layer.
     */
    abstract getElapsedTime(): float;

    /**
     * Get the renderer associated to the container.
     */
    abstract getRenderer(): gdjs.RuntimeInstanceContainerRenderer;

    /**
     * Get the renderer for visual debugging associated to the container.
     */
    abstract getDebuggerRenderer(): gdjs.DebuggerRenderer;

    /**
     * Get the {@link gdjs.RuntimeGame} associated to this.
     */
    abstract getGame(): gdjs.RuntimeGame;

    /**
     * Get the {@link gdjs.RuntimeScene} associated to this.
     */
    abstract getScene(): gdjs.RuntimeScene;

    /**
     * Convert a point from the canvas coordinates (for example,
     * the mouse position) to the container coordinates.
     *
     * @param x The x position, in container coordinates.
     * @param y The y position, in container coordinates.
     * @param result The point instance that is used to return the result.
     */
    abstract convertCoords(x: float, y: float, result?: FloatPoint): FloatPoint;

    /**
     * Convert a point from the container coordinates (for example,
     * an object position) to the canvas coordinates.
     *
     * @param sceneX The x position, in container coordinates.
     * @param sceneY The y position, in container coordinates.
     * @param result The point instance that is used to return the result.
     */
    abstract convertInverseCoords(
      sceneX: float,
      sceneY: float,
      result: FloatPoint
    ): FloatPoint;

    /**
     * @return the width of:
     * - the game resolution for a {@link gdjs.RuntimeScene}
     * - the default dimensions (the AABB of all its children) for a
     * {@link gdjs.CustomRuntimeObject}.
     */
    abstract getViewportWidth(): float;

    /**
     * @return the height of:
     * - the game resolution for a {@link gdjs.RuntimeScene}
     * - the default dimensions (the AABB of all its children) for a
     * {@link gdjs.CustomRuntimeObject}.
     */
    abstract getViewportHeight(): float;

    /**
     * @return the center X of:
     * - the game resolution for a {@link gdjs.RuntimeScene}
     * - the default dimensions (the AABB of all its children) for a
     * {@link gdjs.CustomRuntimeObject}.
     */
    abstract getViewportOriginX(): float;

    /**
     * @return the center Y of:
     * - the game resolution for a {@link gdjs.RuntimeScene}
     * - the default dimensions (the AABB of all its children) for a
     * {@link gdjs.CustomRuntimeObject}.
     */
    abstract getViewportOriginY(): float;

    /**
     * Triggered when the AABB of a child of the container could have changed.
     */
    abstract onChildrenLocationChanged(): void;

    /**
     * Activate or deactivate the debug visualization for collisions and points.
     */
    enableDebugDraw(
      enableDebugDraw: boolean,
      showHiddenInstances: boolean,
      showPointsNames: boolean,
      showCustomPoints: boolean
    ): void {
      if (this._debugDrawEnabled && !enableDebugDraw) {
        this.getDebuggerRenderer().clearDebugDraw();
      }

      this._debugDrawEnabled = enableDebugDraw;
      this._debugDrawShowHiddenInstances = showHiddenInstances;
      this._debugDrawShowPointsNames = showPointsNames;
      this._debugDrawShowCustomPoints = showCustomPoints;
    }

    /**
     * Check if an object is registered, meaning that instances of it can be
     * created and lives in the container.
     * @see gdjs.RuntimeInstanceContainer#registerObject
     */
    isObjectRegistered(objectName: string): boolean {
      return (
        this._objects.containsKey(objectName) &&
        this._instances.containsKey(objectName) &&
        this._objectsCtor.containsKey(objectName)
      );
    }

    /**
     * Register a {@link gdjs.RuntimeObject} so that instances of it can be
     * used in the container.
     * @param objectData The data for the object to register.
     */
    registerObject(objectData: ObjectData) {
      this._objects.put(objectData.name, objectData);
      this._instances.put(objectData.name, []);

      // Cache the constructor
      const Ctor = gdjs.getObjectConstructor(objectData.type);
      this._objectsCtor.put(objectData.name, Ctor);

      // Also prepare a cache for recycled instances, if the object supports it.
      if (Ctor.supportsReinitialization) {
        this._instancesCache.put(objectData.name, []);
      }
    }

    /**
     * Update the data of a {@link gdjs.RuntimeObject} so that instances use
     * this when constructed.
     * @param objectData The data for the object to register.
     */
    updateObject(objectData: ObjectData): void {
      if (!this.isObjectRegistered(objectData.name)) {
        logger.warn(
          'Tried to call updateObject for an object that was not registered (' +
            objectData.name +
            '). Call registerObject first.'
        );
      }
      this._objects.put(objectData.name, objectData);
    }

    // Don't erase instances, nor instances cache, or objectsCtor cache.
    /**
     * Unregister a {@link gdjs.RuntimeObject}. Instances will be destroyed.
     * @param objectName The name of the object to unregister.
     */
    unregisterObject(objectName: string) {
      const instances = this._instances.get(objectName);
      if (instances) {
        // This is sub-optimal: markObjectForDeletion will search the instance to
        // remove in instances, so cost is O(n^2), n being the number of instances.
        // As we're unregistering an object which only happen during a hot-reloading,
        // this is fine.
        const instancesToRemove = instances.slice();
        for (let i = 0; i < instancesToRemove.length; i++) {
          this.markObjectForDeletion(instancesToRemove[i]);
        }
        this._cacheOrClearRemovedInstances();
      }
      this._objects.remove(objectName);
      this._instances.remove(objectName);
      this._instancesCache.remove(objectName);
      this._objectsCtor.remove(objectName);
    }

    /**
     * Create objects from initial instances data (for example, the initial instances
     * of the scene or the instances of an external layout).
     *
     * @param data The instances data
     * @param xPos The offset on X axis
     * @param yPos The offset on Y axis
     * @param zPos The offset on Z axis
     * @param trackByPersistentUuid If true, objects are tracked by setting their `persistentUuid`
     * to the same as the associated instance. Useful for hot-reloading when instances are changed.
     */
    createObjectsFrom(
      data: InstanceData[],
      xPos: float,
      yPos: float,
      zPos: float,
      trackByPersistentUuid: boolean
    ): void {
      let zOffset: number;
      let shouldTrackByPersistentUuid: boolean;

      if (arguments.length === 5) {
        zOffset = zPos;
        shouldTrackByPersistentUuid = trackByPersistentUuid;
      } else {
        /**
         * Support for the previous signature (before 3D was introduced):
         * createObjectsFrom(data, xPos, yPos, trackByPersistentUuid)
         */
        zOffset = 0;
        shouldTrackByPersistentUuid = arguments[3];
      }

      for (let i = 0, len = data.length; i < len; ++i) {
        const instanceData = data[i];
        const objectName = instanceData.name;
        const newObject = this.createObject(objectName);
        if (newObject !== null) {
          if (shouldTrackByPersistentUuid) {
            // Give the object the same persistentUuid as the instance, so that
            // it can be hot-reloaded.
            newObject.persistentUuid = instanceData.persistentUuid || null;
          }
          newObject.setPosition(instanceData.x + xPos, instanceData.y + yPos);
          newObject.setAngle(instanceData.angle);
          if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(newObject)) {
            if (instanceData.z !== undefined)
              newObject.setZ(instanceData.z + zOffset);
            if (instanceData.rotationX !== undefined)
              newObject.setRotationX(instanceData.rotationX);
            if (instanceData.rotationY !== undefined)
              newObject.setRotationY(instanceData.rotationY);
          }

          newObject.setZOrder(instanceData.zOrder);
          newObject.setLayer(instanceData.layer);
          newObject
            .getVariables()
            .initFrom(instanceData.initialVariables, true);
          newObject.extraInitializationFromInitialInstance(instanceData);
        }
      }
    }

    /**
     * Get the data representing the initial shared data of the scene for the specified behavior.
     * @param name The name of the behavior
     * @returns The shared data for the behavior, if any.
     */
    getInitialSharedDataForBehavior(name: string): BehaviorSharedData | null {
      return this._initialBehaviorSharedData.get(name);
    }

    /**
     * Set the data representing the initial shared data of the scene for the specified behavior.
     * @param name The name of the behavior
     * @param sharedData The shared data for the behavior, or null to remove it.
     */
    setInitialSharedDataForBehavior(
      name: string,
      sharedData: BehaviorSharedData | null
    ): void {
      this._initialBehaviorSharedData.put(name, sharedData);
    }

    /**
     * Set the default Z order for each layer, which is the highest Z order found on each layer.
     * Useful as it ensures that instances created from events are, by default, shown in front
     * of other instances.
     */
    _setLayerDefaultZOrders() {
      if (
        this.getGame().getGameData().properties.useDeprecatedZeroAsDefaultZOrder
      ) {
        // Deprecated option to still support games that were made considered 0 as the
        // default Z order for all layers.
        return;
      }
      const layerHighestZOrders: Record<string, number> = {};
      const allInstances = this.getAdhocListOfAllInstances();
      for (let i = 0, len = allInstances.length; i < len; ++i) {
        const object = allInstances[i];
        let layerName = object.getLayer();
        const zOrder = object.getZOrder();
        if (
          layerHighestZOrders[layerName] === undefined ||
          layerHighestZOrders[layerName] < zOrder
        ) {
          layerHighestZOrders[layerName] = zOrder;
        }
      }
      for (let layerName in layerHighestZOrders) {
        this.getLayer(layerName).setDefaultZOrder(
          layerHighestZOrders[layerName] + 1
        );
      }
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
      for (const layer of this._orderedLayers) {
        layer.updatePreRender(this);
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

        // Perform pre-render update.
        object.updatePreRender(this);
      }
      return;
    }

    /**
     * Empty the list of the removed objects:
     *
     * When an object is removed from the container, it is still kept in
     * {@link gdjs.RuntimeInstanceContainer#_instancesRemoved}.
     *
     * This method should be called regularly (after events or behaviors steps) so as to clear this list
     * and allows the removed objects to be cached (or destroyed if the cache is full).
     *
     * The removed objects could not be sent directly to the cache, as events may still be using them after
     * removing them from the scene for example.
     */
    _cacheOrClearRemovedInstances() {
      for (let k = 0, lenk = this._instancesRemoved.length; k < lenk; ++k) {
        const instance = this._instancesRemoved[k];
        // Cache the instance to recycle it into a new instance later.
        // If the object does not support recycling, the cache won't be defined.
        const cache = this._instancesCache.get(instance.getName());
        if (cache) {
          if (cache.length < 128) {
            cache.push(instance);
          }
        }
        instance.onDestroyed();
      }
      this._instancesRemoved.length = 0;
    }

    /**
     * Tool function filling _allInstancesList member with all the living object instances.
     */
    private _constructListOfAllInstances() {
      let currentListSize = 0;
      for (const name in this._instances.items) {
        if (this._instances.items.hasOwnProperty(name)) {
          const list = this._instances.items[name];
          const oldSize = currentListSize;
          currentListSize += list.length;
          for (let j = 0, lenj = list.length; j < lenj; ++j) {
            if (oldSize + j < this._allInstancesList.length) {
              this._allInstancesList[oldSize + j] = list[j];
            } else {
              this._allInstancesList.push(list[j]);
            }
          }
        }
      }
      this._allInstancesList.length = currentListSize;
      this._allInstancesListIsUpToDate = true;
    }

    /**
     * @param objectName The name of the object
     * @returns the instances of a given object in the container.
     */
    getInstancesOf(objectName: string): gdjs.RuntimeObject[] {
      return this._instances.items[objectName];
    }

    /**
     * Get a list of all {@link gdjs.RuntimeObject} living in the container.
     * You should not, normally, need this method at all. It's only to be used
     * in exceptional use cases where you need to loop through all objects,
     * and it won't be performant.
     *
     * @returns The list of all runtime objects in the container
     */
    getAdhocListOfAllInstances(): gdjs.RuntimeObject[] {
      if (!this._allInstancesListIsUpToDate) {
        this._constructListOfAllInstances();
      }
      return this._allInstancesList;
    }

    /**
     * Update the objects before launching the events.
     */
    _updateObjectsPreEvents() {
      // It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
      // may delete the objects.
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
        allInstancesList[i].stepBehaviorsPreEvents(this);
      }

      // Some behaviors may have request objects to be deleted.
      this._cacheOrClearRemovedInstances();
    }

    /**
     * Update the objects (update positions, time management...)
     */
    _updateObjectsPostEvents() {
      this._cacheOrClearRemovedInstances();

      // It is *mandatory* to create and iterate on a external list of all objects, as the behaviors
      // may delete the objects.
      const allInstancesList = this.getAdhocListOfAllInstances();
      for (let i = 0, len = allInstancesList.length; i < len; ++i) {
        allInstancesList[i].stepBehaviorsPostEvents(this);
      }

      // Some behaviors may have request objects to be deleted.
      this._cacheOrClearRemovedInstances();
    }

    /**
     * Add an object to the instances living in the container.
     * @param obj The object to be added.
     */
    addObject(obj: gdjs.RuntimeObject) {
      if (!this._instances.containsKey(obj.name)) {
        this._instances.put(obj.name, []);
      }
      this._instances.get(obj.name).push(obj);
      this._allInstancesListIsUpToDate = false;
    }

    /**
     * Get all the instances of the object called name.
     * @param name Name of the object for which the instances must be returned.
     * @return The list of objects with the given name
     */
    getObjects(name: string): gdjs.RuntimeObject[] | undefined {
      if (!this._instances.containsKey(name)) {
        logger.info(
          'RuntimeScene.getObjects: No instances called "' +
            name +
            '"! Adding it.'
        );
        this._instances.put(name, []);
      }
      return this._instances.get(name);
    }

    /**
     * Create a new object from its name. The object is also added to the instances
     * living in the container (No need to call {@link gdjs.RuntimeScene.addObject})
     * @param objectName The name of the object to be created
     * @return The created object
     */
    createObject(objectName: string): gdjs.RuntimeObject | null {
      if (
        !this._objectsCtor.containsKey(objectName) ||
        !this._objects.containsKey(objectName)
      ) {
        // There is no such object in this container.
        return null;
      }

      // Create a new object using the object constructor (cached during loading)
      // and the stored object's data:
      const cache = this._instancesCache.get(objectName);
      const ctor = this._objectsCtor.get(objectName);
      let obj;
      if (!cache || cache.length === 0) {
        obj = new ctor(this, this._objects.get(objectName));
      } else {
        // Reuse an objet destroyed before. If there is an object in the cache,
        // then it means it does support reinitialization.
        obj = cache.pop();
        obj.reinitialize(this._objects.get(objectName));
      }
      this.addObject(obj);
      return obj;
    }

    /**
     * Must be called whenever an object must be removed from the container.
     * @param obj The object to be removed.
     */
    markObjectForDeletion(obj: gdjs.RuntimeObject) {
      // Add to the objects removed list.
      // The objects will be sent to the instances cache or really deleted from memory later.
      if (this._instancesRemoved.indexOf(obj) === -1) {
        this._instancesRemoved.push(obj);
      }

      // Delete from the living instances.
      if (this._instances.containsKey(obj.getName())) {
        const objId = obj.id;
        const allInstances = this._instances.get(obj.getName());
        for (let i = 0, len = allInstances.length; i < len; ++i) {
          if (allInstances[i].id == objId) {
            allInstances.splice(i, 1);
            this._allInstancesListIsUpToDate = false;
            break;
          }
        }
      }

      // Notify the object it was removed from the container
      obj.onDeletedFromScene(this);

      // Notify the global callbacks
      for (let j = 0; j < gdjs.callbacksObjectDeletedFromScene.length; ++j) {
        gdjs.callbacksObjectDeletedFromScene[j](this, obj);
      }
      return;
    }

    /**
     * Get the layer with the given name
     * @param name The name of the layer
     * @returns The layer, or the base layer if not found
     */
    getLayer(name: string): gdjs.RuntimeLayer {
      if (this._layers.containsKey(name)) {
        return this._layers.get(name);
      }
      return this._layers.get('');
    }

    /**
     * Check if a layer exists
     * @param name The name of the layer
     */
    hasLayer(name: string): boolean {
      return this._layers.containsKey(name);
    }

    /**
     * Add a layer.
     * @param layerData The data to construct the layer
     */
    abstract addLayer(layerData: LayerData);

    /**
     * Remove a layer. All {@link gdjs.RuntimeObject} on this layer will
     * be moved back to the base layer.
     * @param layerName The name of the layer to remove
     */
    removeLayer(layerName: string) {
      const existingLayer = this._layers.get(layerName);
      if (!existingLayer) return;

      const allInstances = this.getAdhocListOfAllInstances();
      for (let i = 0; i < allInstances.length; ++i) {
        const runtimeObject = allInstances[i];
        if (runtimeObject.getLayer() === layerName) {
          runtimeObject.setLayer('');
        }
      }
      this._layers.remove(layerName);
      const layerIndex = this._orderedLayers.indexOf(existingLayer);
      this._orderedLayers.splice(layerIndex, 1);
    }

    /**
     * Change the position of a layer.
     *
     * @param layerName The name of the layer to reorder
     * @param index The new position in the list of layers
     */
    setLayerIndex(layerName: string, newIndex: integer): void {
      const layer: gdjs.RuntimeLayer = this._layers.get(layerName);
      if (!layer) {
        return;
      }
      const layerIndex = this._orderedLayers.indexOf(layer);
      if (layerIndex === newIndex) return;

      this._orderedLayers.splice(layerIndex, 1);
      this._orderedLayers.splice(newIndex, 0, layer);

      this.getRenderer().setLayerIndex(layer, newIndex);
    }

    /**
     * Fill the array passed as argument with the names of all layers
     * @param result The array where to put the layer names
     */
    getAllLayerNames(result: string[]) {
      this._layers.keys(result);
    }

    /**
     * Return the number of instances of the specified object living in the container.
     * @param objectName The object name for which instances must be counted.
     */
    getInstancesCountOnScene(objectName: string): integer {
      const instances = this._instances.get(objectName);
      if (instances) {
        return instances.length;
      }

      return 0;
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
              const elapsedTimeInSeconds = obj.getElapsedTime() / 1000;
              obj.setX(obj.getX() + averageForce.getX() * elapsedTimeInSeconds);
              obj.setY(obj.getY() + averageForce.getY() * elapsedTimeInSeconds);
              obj.updateForces(elapsedTimeInSeconds);
            }
          }
        }
      }
    }

    /**
     * Clear any data structures to make sure memory is freed as soon as
     * possible.
     */
    _destroy() {
      // It should not be necessary to reset these variables, but this help
      // ensuring that all memory related to the container is released immediately.
      this._layers = new Hashtable();
      this._orderedLayers = [];
      this._objects = new Hashtable();
      this._instances = new Hashtable();
      this._instancesCache = new Hashtable();
      this._objectsCtor = new Hashtable();
      this._allInstancesList = [];
      this._instancesRemoved = [];
    }
  }
}
