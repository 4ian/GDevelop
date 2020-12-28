/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A scene being played, containing instances of objects rendered on screen.
   *
   * @class RuntimeScene
   * @memberof gdjs
   */
  export class RuntimeScene {
    _eventsFunction: any = null;
    _instances: any;

    //Contains the instances living on the scene
    _instancesCache: any;

    //Used to recycle destroyed instance instead of creating new ones.
    _objects: any;

    //Contains the objects data stored in the project
    _objectsCtor: any;
    _layers: any;
    _initialBehaviorSharedData: any;
    _renderer: any;
    _variables: any;
    _runtimeGame: gdjs.RuntimeGame;
    _lastId: number = 0;
    _name: string = '';
    _timeManager: any;
    _gameStopRequested: boolean = false;
    _requestedScene: any = '';
    _isLoaded: boolean = false;

    // True if loadFromScene was called and the scene is being played.
    _isJustResumed: boolean = false;

    // True in the first frame after resuming the paused scene
    _requestedChange: any;
    _backgroundColor: integer = 0;
    _allInstancesList: gdjs.RuntimeObject[] = [];
    _onceTriggers: any;
    _layersCameraCoordinates: any = {};
    _instancesRemoved: gdjs.RuntimeObject[] = [];
    _profiler: gdjs.Profiler | null = null;

    // Set to `new gdjs.Profiler()` to have profiling done on the scene.
    _onProfilerStopped: any = null;

    /**
     * @param runtimeGame The game associated to this scene.
     */
    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._instances = new Hashtable();
      this._instancesCache = new Hashtable();
      this._objects = new Hashtable();
      this._objectsCtor = new Hashtable();
      this._layers = new Hashtable();
      this._initialBehaviorSharedData = new Hashtable();
      this._renderer = new gdjs.RuntimeSceneRenderer(
        this,
        runtimeGame ? runtimeGame.getRenderer() : null
      );
      this._variables = new gdjs.VariablesContainer();
      this._runtimeGame = runtimeGame;
      this._timeManager = new gdjs.TimeManager();
      this._requestedChange = RuntimeScene.CONTINUE;

      // What to do after the frame is rendered.

      // Black background by default.

      //An array used to create a list of all instance when necessary ( see _constructListOfAllInstances )
      this._onceTriggers = new gdjs.OnceTriggers();

      //The instances removed from the scene and waiting to be sent to the cache.

      // The callback function to call when the profiler is stopped.
      this.onGameResolutionResized();
    }

    /**
     * Should be called when the canvas where the scene is rendered has been resized.
     * See gdjs.RuntimeGame.startGameLoop in particular.
     * @memberof gdjs.RuntimeScene
     */
    onGameResolutionResized() {
      for (const name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
          /** @type gdjs.Layer */
          const theLayer: gdjs.Layer = this._layers.items[name];
          theLayer.onGameResolutionResized();
        }
      }
      this._renderer.onGameResolutionResized();
    }

    /**
     * Load the runtime scene from the given scene.
     * @param sceneData An object containing the scene data.
     * @see gdjs.RuntimeGame#getSceneData
     */
    loadFromScene(sceneData: LayoutData | null) {
      if (!sceneData) {
        console.error('loadFromScene was called without a scene');
        return;
      }
      if (this._isLoaded) {
        this.unloadScene();
      }

      //Setup main properties
      if (this._runtimeGame) {
        this._runtimeGame.getRenderer().setWindowTitle(sceneData.title);
      }
      this._name = sceneData.name;
      this.setBackgroundColor(sceneData.r, sceneData.v, sceneData.b);

      //Load layers
      for (let i = 0, len = sceneData.layers.length; i < len; ++i) {
        this.addLayer(sceneData.layers[i]);
      }

      //Load variables
      this._variables = new gdjs.VariablesContainer(sceneData.variables);

      //Cache the initial shared data of the behaviors
      for (
        let i = 0, len = sceneData.behaviorsSharedData.length;
        i < len;
        ++i
      ) {
        const behaviorSharedData = sceneData.behaviorsSharedData[i];
        this.setInitialSharedDataForBehavior(
          behaviorSharedData.name,
          behaviorSharedData
        );
      }

      //Registering objects: Global objects first...
      const initialGlobalObjectsData = this.getGame().getInitialObjectsData();
      for (let i = 0, len = initialGlobalObjectsData.length; i < len; ++i) {
        this.registerObject(initialGlobalObjectsData[i]);
      }

      //...then the scene objects
      for (let i = 0, len = sceneData.objects.length; i < len; ++i) {
        this.registerObject(sceneData.objects[i]);
      }

      //Create initial instances of objects
      this.createObjectsFrom(
        sceneData.instances,
        0,
        0,
        /*trackByPersistentUuid=*/
        true
      );

      // Set up the default z order (for objects created from events)
      this._setLayerDefaultZOrders();

      //Set up the function to be executed at each tick
      this.setEventsGeneratedCodeFunction(sceneData);
      this._onceTriggers = new gdjs.OnceTriggers();

      // Notify the global callbacks
      if (this._runtimeGame && !this._runtimeGame.wasFirstSceneLoaded()) {
        for (let i = 0; i < gdjs.callbacksFirstRuntimeSceneLoaded.length; ++i) {
          gdjs.callbacksFirstRuntimeSceneLoaded[i](this);
        }
      }
      for (let i = 0; i < gdjs.callbacksRuntimeSceneLoaded.length; ++i) {
        gdjs.callbacksRuntimeSceneLoaded[i](this);
      }
      if (sceneData.stopSoundsOnStartup && this._runtimeGame) {
        this._runtimeGame.getSoundManager().clearAll();
      }
      this._isLoaded = true;
      this._timeManager.reset();
    }

    /**
     * Check if an object is registered, meaning that instances of it can be created and lives in the scene.
     * @see gdjs.RuntimeScene#registerObject
     */
    isObjectRegistered(objectName): boolean {
      return (
        this._objects.containsKey(objectName) &&
        this._instances.containsKey(objectName) &&
        this._objectsCtor.containsKey(objectName)
      );
    }

    /**
     * Register a {@link gdjs.RuntimeObject} so that instances of it can be used in the scene.
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
     * Update the data of a {@link gdjs.RuntimeObject} so that instances use this when constructed.
     * @param objectData The data for the object to register.
     */
    updateObject(objectData: ObjectData): void {
      if (!this.isObjectRegistered(objectData.name)) {
        console.warn(
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
     * Called when a scene is "paused", i.e it will be not be rendered again
     * for some time, until it's resumed or unloaded.
     */
    onPause() {
      for (let i = 0; i < gdjs.callbacksRuntimeScenePaused.length; ++i) {
        gdjs.callbacksRuntimeScenePaused[i](this);
      }
    }

    /**
     * Called when a scene is "resumed", i.e it will be rendered again
     * on screen after having being paused.
     */
    onResume() {
      this._isJustResumed = true;
      for (let i = 0; i < gdjs.callbacksRuntimeSceneResumed.length; ++i) {
        gdjs.callbacksRuntimeSceneResumed[i](this);
      }
    }

    /**
     * Called before a scene is removed from the stack of scenes
     * rendered on the screen.
     */
    unloadScene() {
      if (!this._isLoaded) {
        return;
      }
      if (this._profiler) {
        this.stopProfiler();
      }

      // Notify the global callbacks (which should not release resources yet,
      // as other callbacks might still refer to the objects/scene).
      for (let i = 0; i < gdjs.callbacksRuntimeSceneUnloading.length; ++i) {
        gdjs.callbacksRuntimeSceneUnloading[i](this);
      }

      // Notify the objects they are being destroyed
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        const object = this._allInstancesList[i];
        object.onDestroyFromScene(this);
      }

      // Notify the renderer
      if (this._renderer) {
        this._renderer.onSceneUnloaded();
      }

      // Notify the global callbacks (after notifying objects and renderer, because
      // callbacks from extensions might want to free resources - which can't be done
      // safely before destroying objects and the renderer).
      for (let i = 0; i < gdjs.callbacksRuntimeSceneUnloaded.length; ++i) {
        gdjs.callbacksRuntimeSceneUnloaded[i](this);
      }

      // It should not be necessary to reset these variables, but this help
      // ensuring that all memory related to the RuntimeScene is released immediately.
      this._layers = new Hashtable();
      this._variables = new gdjs.VariablesContainer();
      this._initialBehaviorSharedData = new Hashtable();
      this._objects = new Hashtable();
      this._instances = new Hashtable();
      this._instancesCache = new Hashtable();
      this._eventsFunction = null;
      this._objectsCtor = new Hashtable();
      this._allInstancesList = [];
      this._instancesRemoved = [];
      this._lastId = 0;

      this._onceTriggers = null;
      this._isLoaded = false;
      this.onGameResolutionResized();
    }

    /**
     * Create objects from initial instances data (for example, the initial instances
     * of the scene or the instances of an external layout).
     *
     * @param data The instances data
     * @param xPos The offset on X axis
     * @param yPos The offset on Y axis
     * @param trackByPersistentUuid If true, objects are tracked by setting their `persistentUuid`
     * to the same as the associated instance. Useful for hot-reloading when instances are changed.
     */
    createObjectsFrom(
      data: InstanceData[],
      xPos: number,
      yPos: number,
      trackByPersistentUuid: boolean
    ) {
      for (let i = 0, len = data.length; i < len; ++i) {
        const instanceData = data[i];
        const objectName = instanceData.name;
        const newObject = this.createObject(objectName);
        if (newObject !== null) {
          if (trackByPersistentUuid) {
            // Give the object the same persistentUuid as the instance, so that
            // it can be hot-reloaded.
            newObject.persistentUuid = instanceData.persistentUuid || null;
          }
          newObject.setPosition(instanceData.x + xPos, instanceData.y + yPos);
          newObject.setZOrder(instanceData.zOrder);
          newObject.setAngle(instanceData.angle);
          newObject.setLayer(instanceData.layer);
          newObject
            .getVariables()
            .initFrom(instanceData.initialVariables, true);
          newObject.extraInitializationFromInitialInstance(instanceData);
        }
      }
    }

    /**
     * Set the default Z order for each layer, which is the highest Z order found on each layer.
     * Useful as it ensures that instances created from events are, by default, shown in front
     * of other instances.
     */
    private _setLayerDefaultZOrders() {
      if (
        this._runtimeGame.getGameData().properties
          .useDeprecatedZeroAsDefaultZOrder
      ) {
        // Deprecated option to still support games that were made considered 0 as the
        // default Z order for all layers.
        return;
      }
      const layerHighestZOrders: { [key: string]: number } = {};
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

    /**
     * Set the function called each time the scene is stepped to be the events generated code,
     * which is by convention assumed to be a function in `gdjs` with a name based on the scene
     * mangled name.
     *
     * @param sceneData The scene data, used to find where the code was generated.
     */
    setEventsGeneratedCodeFunction(sceneData: LayoutData): void {
      const module = gdjs[sceneData.mangledName + 'Code'];
      if (module && module.func) {
        this._eventsFunction = module.func;
      } else {
        console.log(
          'Warning: no function found for running logic of scene ' + this._name
        );
        this._eventsFunction = function () {};
      }
    }

    /**
     * Set the function called each time the scene is stepped.
     * The function will be passed the `runtimeScene` as argument.
     *
     * Note that this is already set up by the gdjs.RuntimeScene constructor and that you should
     * not need to use this method.
     *
     * @param func The function to be called.
     */
    setEventsFunction(func: Function): void {
      this._eventsFunction = func;
    }

    /**
     * Step and render the scene.
     * @return true if the game loop should continue, false if a scene change/push/pop
     * or a game stop was requested.
     */
    renderAndStep(elapsedTime: float): boolean {
      if (this._profiler) {
        this._profiler.beginFrame();
      }
      this._requestedChange = RuntimeScene.CONTINUE;
      this._timeManager.update(
        elapsedTime,
        this._runtimeGame.getMinimalFramerate()
      );
      if (this._profiler) {
        this._profiler.begin('objects (pre-events)');
      }
      this._updateObjectsPreEvents();
      if (this._profiler) {
        this._profiler.end('objects (pre-events)');
      }
      if (this._profiler) {
        this._profiler.begin('callbacks and extensions (pre-events)');
      }
      for (let i = 0; i < gdjs.callbacksRuntimeScenePreEvents.length; ++i) {
        gdjs.callbacksRuntimeScenePreEvents[i](this);
      }
      if (this._profiler) {
        this._profiler.end('callbacks and extensions (pre-events)');
      }
      if (this._profiler) {
        this._profiler.begin('events');
      }
      this._eventsFunction(this);
      if (this._profiler) {
        this._profiler.end('events');
      }
      if (this._profiler) {
        this._profiler.begin('objects (post-events)');
      }
      this._updateObjectsPostEvents();
      if (this._profiler) {
        this._profiler.end('objects (post-events)');
      }
      if (this._profiler) {
        this._profiler.begin('callbacks and extensions (post-events)');
      }
      for (let i = 0; i < gdjs.callbacksRuntimeScenePostEvents.length; ++i) {
        gdjs.callbacksRuntimeScenePostEvents[i](this);
      }
      if (this._profiler) {
        this._profiler.end('callbacks and extensions (post-events)');
      }
      if (this._profiler) {
        this._profiler.begin('objects (visibility)');
      }
      this._updateObjectsVisibility();
      if (this._profiler) {
        this._profiler.end('objects (visibility)');
      }
      if (this._profiler) {
        this._profiler.begin('layers (effects update)');
      }
      this._updateLayers();
      if (this._profiler) {
        this._profiler.end('layers (effects update)');
      }
      if (this._profiler) {
        this._profiler.begin('render');
      }

      // Uncomment to enable debug rendering (look for the implementation in the renderer
      // to see what is rendered)
      // if (this._layersCameraCoordinates) {
      //  this.getRenderer().renderDebugDraw(this._allInstancesList, this._layersCameraCoordinates); //TODO
      // }
      this._isJustResumed = false;
      this.render();
      if (this._profiler) {
        this._profiler.end('render');
      }
      if (this._profiler) {
        this._profiler.endFrame();
      }
      return !!this.getRequestedChange();
    }

    /**
     * Render the PIXI container associated to the runtimeScene.
     */
    render() {
      this._renderer.render();
    }

    _updateLayersCameraCoordinates() {
      this._layersCameraCoordinates = this._layersCameraCoordinates || {};
      for (const name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
          const theLayer = this._layers.items[name];
          this._layersCameraCoordinates[name] = this._layersCameraCoordinates[
            name
          ] || [0, 0, 0, 0];
          this._layersCameraCoordinates[name][0] =
            theLayer.getCameraX() - theLayer.getCameraWidth();
          this._layersCameraCoordinates[name][1] =
            theLayer.getCameraY() - theLayer.getCameraHeight();
          this._layersCameraCoordinates[name][2] =
            theLayer.getCameraX() + theLayer.getCameraWidth();
          this._layersCameraCoordinates[name][3] =
            theLayer.getCameraY() + theLayer.getCameraHeight();
        }
      }
    }

    _updateLayers() {
      for (const name in this._layers.items) {
        if (this._layers.items.hasOwnProperty(name)) {
          /** @type gdjs.Layer */
          const theLayer: gdjs.Layer = this._layers.items[name];
          theLayer.update(this);
        }
      }
    }

    /**
     * Called to update visibility of PIXI.DisplayObject of objects
     * rendered on the scene.
     *
     * Visibility is set to false if object is hidden, or if
     * object is too far from the camera of its layer ("culling").
     */
    _updateObjectsVisibility() {
      if (this._timeManager.isFirstFrame()) {
        this._constructListOfAllInstances();
        for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
          let object = this._allInstancesList[i];
          let rendererObject = object.getRendererObject();
          if (rendererObject) {
            object.getRendererObject().visible = !object.isHidden();
          }
        }
        return;
      } else {
        //After first frame, optimise rendering by setting only objects
        //near camera as visible.
        this._updateLayersCameraCoordinates();
        this._constructListOfAllInstances();
        for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
          let object = this._allInstancesList[i];
          const cameraCoords = this._layersCameraCoordinates[object.getLayer()];
          let rendererObject = object.getRendererObject();
          if (!cameraCoords || !rendererObject) {
            continue;
          }
          if (object.isHidden()) {
            rendererObject.visible = false;
          } else {
            const aabb = object.getVisibilityAABB();
            if (
              aabb &&
              // If no AABB is returned, the object should always be visible
              (aabb.min[0] > cameraCoords[2] ||
                aabb.min[1] > cameraCoords[3] ||
                aabb.max[0] < cameraCoords[0] ||
                aabb.max[1] < cameraCoords[1])
            ) {
              rendererObject.visible = false;
            } else {
              rendererObject.visible = true;
            }
          }
        }
      }
    }

    /**
     * Empty the list of the removed objects:<br>
     * When an object is removed from the scene, it is still kept in the _instancesRemoved member
     * of the RuntimeScene.<br>
     * This method should be called regularly (after events or behaviors steps) so as to clear this list
     * and allows the removed objects to be cached (or destroyed if the cache is full).<br>
     * The removed objects could not be sent directly to the cache, as events may still be using them after
     * removing them from the scene for example.
     */
    _cacheOrClearRemovedInstances() {
      for (let k = 0, lenk = this._instancesRemoved.length; k < lenk; ++k) {
        // Cache the instance to recycle it into a new instance later.
        // If the object does not support recycling, the cache won't be defined.
        const cache = this._instancesCache.get(
          this._instancesRemoved[k].getName()
        );
        if (cache) {
          if (cache.length < 128) {
            cache.push(this._instancesRemoved[k]);
          }
        }
      }
      this._instancesRemoved.length = 0;
    }

    /**
     * Tool function filling _allInstancesList member with all the living object instances.
     */
    _constructListOfAllInstances() {
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
     * Change the background color, by setting the RGB components.
     * Internally, the color is stored as an hexadecimal number.
     *
     * @param r The color red component (0-255).
     * @param g The color green component (0-255).
     * @param b The color blue component (0-255).
     */
    setBackgroundColor(r: integer, g: integer, b: integer): void {
      this._backgroundColor = parseInt(gdjs.rgbToHex(r, g, b), 16);
    }

    /**
     * Get the background color, as an hexadecimal number.
     * @returns The current background color.
     */
    getBackgroundColor(): number {
      return this._backgroundColor;
    }

    /**
     * Get the name of the scene.
     */
    getName(): string {
      return this._name;
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

    /**
     * Add an object to the instances living on the scene.
     * @param obj The object to be added.
     */
    addObject(obj) {
      if (!this._instances.containsKey(obj.name)) {
        console.log(
          'RuntimeScene.addObject: No objects called "' +
            obj.name +
            '"! Adding it.'
        );
        this._instances.put(obj.name, []);
      }
      this._instances.get(obj.name).push(obj);
    }

    /**
     * Get all the instances of the object called name.
     * @param name Name of the object for which the instances must be returned.
     * @return The list of objects with the given name
     */
    getObjects(name: string): gdjs.RuntimeObject[] {
      if (!this._instances.containsKey(name)) {
        console.log(
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
     * living on the scene ( No need to call RuntimeScene.addObject )
     * @param objectName The name of the object to be created
     * @return The created object
     */
    createObject(objectName: string): gdjs.RuntimeObject | null {
      if (
        !this._objectsCtor.containsKey(objectName) ||
        !this._objects.containsKey(objectName)
      ) {
        return null;
      }

      //There is no such object in this scene.

      // Create a new object using the object constructor (cached during loading)
      // and the stored object's data:
      const cache = this._instancesCache.get(objectName);
      const ctor = this._objectsCtor.get(objectName);
      let obj = null;
      if (!cache || cache.length === 0) {
        obj = new ctor(this, this._objects.get(objectName));
      } else {
        // Reuse an objet destroyed before. If there is an object in the cache,
        // then it means it does support reinitialization.
        obj = cache.pop();
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        obj.reinitialize(this._objects.get(objectName));
      }
      this.addObject(obj);
      return obj;
    }

    /**
     * Must be called whenever an object must be removed from the scene.
     * @param obj The object to be removed.
     */
    markObjectForDeletion(obj: gdjs.RuntimeObject) {
      //Add to the objects removed list.
      //The objects will be sent to the instances cache or really deleted from memory later.
      if (this._instancesRemoved.indexOf(obj) === -1) {
        this._instancesRemoved.push(obj);
      }

      //Delete from the living instances.
      if (this._instances.containsKey(obj.getName())) {
        const objId = obj.id;
        const allInstances = this._instances.get(obj.getName());
        for (let i = 0, len = allInstances.length; i < len; ++i) {
          if (allInstances[i].id == objId) {
            allInstances.splice(i, 1);
            break;
          }
        }
      }

      //Notify the object it was removed from the scene
      obj.onDestroyFromScene(this);

      // Notify the global callbacks
      for (let j = 0; j < gdjs.callbacksObjectDeletedFromScene.length; ++j) {
        gdjs.callbacksObjectDeletedFromScene[j](this, obj);
      }
      return;
    }

    /**
     * Create an identifier for a new object of the scene.
     */
    createNewUniqueId() {
      this._lastId++;
      return this._lastId;
    }

    /**
     * Get the renderer associated to the RuntimeScene.
     */
    getRenderer() {
      return this._renderer;
    }

    /**
     * Get the runtimeGame associated to the RuntimeScene.
     */
    getGame() {
      return this._runtimeGame;
    }

    /**
     * Get the variables of the runtimeScene.
     * @return The container holding the variables of the scene.
     */
    getVariables(): any {
      return this._variables;
    }

    /**
     * Get the data representing the initial shared data of the scene for the specified behavior.
     * @param name The name of the behavior
     * @returns The shared data for the behavior, if any.
     */
    getInitialSharedDataForBehavior(name: string): BehaviorSharedData | null {
      const behaviorSharedData = this._initialBehaviorSharedData.get(name);
      if (behaviorSharedData) {
        return behaviorSharedData;
      }
      console.error("Can't find shared data for behavior with name:", name);
      return null;
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
     * Get the layer with the given name
     * @param name The name of the layer
     * @returns The layer, or the base layer if not found
     */
    getLayer(name: string): gdjs.Layer {
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
    addLayer(layerData: LayerData) {
      this._layers.put(layerData.name, new gdjs.Layer(layerData, this));
    }

    /**
     * Remove a layer. All {@link gdjs.RuntimeObject} on this layer will
     * be moved back to the base layer.
     * @param layerName The name of the layer to remove
     */
    removeLayer(layerName: string) {
      const allInstances = this.getAdhocListOfAllInstances();
      for (let i = 0; i < allInstances.length; ++i) {
        const runtimeObject = allInstances[i];
        if (runtimeObject.getLayer() === layerName) {
          runtimeObject.setLayer('');
        }
      }
      this._layers.remove(layerName);
    }

    /**
     * Change the position of a layer.
     *
     * @param layerName The name of the layer to reorder
     * @param index The new position in the list of layers
     */
    setLayerIndex(layerName: string, index: float): void {
      const layer: gdjs.Layer = this._layers.get(layerName);
      if (!layer) {
        return;
      }
      this._renderer.setLayerIndex(layer, index);
    }

    /**
     * Fill the array passed as argument with the names of all layers
     * @param result The array where to put the layer names
     */
    getAllLayerNames(result: string[]) {
      this._layers.keys(result);
    }

    /**
     * Get the TimeManager of the scene.
     * @return The gdjs.TimeManager of the scene.
     */
    getTimeManager(): gdjs.TimeManager {
      return this._timeManager;
    }

    /**
     * Shortcut to get the SoundManager of the game.
     * @return The gdjs.SoundManager of the game.
     */
    getSoundManager(): gdjs.SoundManager {
      return this._runtimeGame.getSoundManager();
    }

    /**
     * Return the value of the scene change that is requested.
     */
    getRequestedChange() {
      return this._requestedChange;
    }

    /**
     * Return the name of the new scene to be launched.
     *
     * See requestChange.
     */
    getRequestedScene() {
      return this._requestedScene;
    }

    /**
     * Request a scene change to be made. The change is handled externally (see gdjs.SceneStack)
     * thanks to getRequestedChange and getRequestedScene methods.
     * @param change One of RuntimeScene.CONTINUE|PUSH_SCENE|POP_SCENE|REPLACE_SCENE|CLEAR_SCENES|STOP_GAME.
     * @param sceneName The name of the new scene to launch, if applicable.
     */
    requestChange(change: number, sceneName: string) {
      this._requestedChange = change;
      this._requestedScene = sceneName;
    }

    /**
     * Get the profiler associated with the scene, or null if none.
     */
    getProfiler() {
      return this._profiler;
    }

    /**
     * Start a new profiler to measures the time passed in sections of the engine
     * in the scene.
     * @param onProfilerStopped Function to be called when the profiler is stopped. Will be passed the profiler as argument.
     */
    startProfiler(onProfilerStopped: Function) {
      if (this._profiler) {
        return;
      }
      this._profiler = new gdjs.Profiler();
      this._onProfilerStopped = onProfilerStopped;
    }

    /**
     * Stop the profiler being run on the scene.
     */
    stopProfiler() {
      if (!this._profiler) {
        return;
      }
      const oldProfiler = this._profiler;
      const onProfilerStopped = this._onProfilerStopped;
      this._profiler = null;
      this._onProfilerStopped = null;
      if (onProfilerStopped) {
        onProfilerStopped(oldProfiler);
      }
    }

    /**
     * Get the structure containing the triggers for "Trigger once" conditions.
     */
    getOnceTriggers() {
      return this._onceTriggers;
    }

    /**
     * Get a list of all gdjs.RuntimeObject living on the scene.
     * You should not, normally, need this method at all. It's only to be used
     * in exceptional use cases where you need to loop through all objects,
     * and it won't be performant.
     *
     * @returns The list of all runtime objects on the scnee
     */
    getAdhocListOfAllInstances(): gdjs.RuntimeObject[] {
      this._constructListOfAllInstances();
      return this._allInstancesList;
    }

    /**
     * Check if the scene was just resumed.
     * This is true during the first frame after the scene has been unpaused.
     *
     * @returns true if the scene was just resumed
     */
    sceneJustResumed(): boolean {
      return this._isJustResumed;
    }

    //The flags to describe the change request by a scene:
    static CONTINUE = 0;
    static PUSH_SCENE = 1;
    static POP_SCENE = 2;
    static REPLACE_SCENE = 3;
    static CLEAR_SCENES = 4;
    static STOP_GAME = 5;
  }
}
