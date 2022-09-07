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
  export class RuntimeScene extends gdjs.RuntimeInstancesContainer {
    _eventsFunction: null | ((runtimeScene: RuntimeScene) => void) = null;

    // TODO EBO move behavior shared data up to the instances container.
    //Contains the objects data stored in the project
    _initialBehaviorSharedData: Hashtable<BehaviorSharedData | null>;
    _renderer: RuntimeSceneRenderer;
    _variables: gdjs.VariablesContainer;
    _runtimeGame: gdjs.RuntimeGame;
    _lastId: integer = 0;
    _name: string = '';
    _timeManager: TimeManager;
    _gameStopRequested: boolean = false;
    _requestedScene: string = '';
    _isLoaded: boolean = false;
    private _asyncTasksManager = new gdjs.AsyncTasksManager();

    // True if loadFromScene was called and the scene is being played.
    _isJustResumed: boolean = false;

    // True in the first frame after resuming the paused scene
    _requestedChange: SceneChangeRequest;
    _backgroundColor: integer = 0;
    _onceTriggers: OnceTriggers;
    _profiler: gdjs.Profiler | null = null;

    // Set to `new gdjs.Profiler()` to have profiling done on the scene.
    _onProfilerStopped: null | ((oldProfiler: gdjs.Profiler) => void) = null;

    /**
     * @param runtimeGame The game associated to this scene.
     */
    constructor(runtimeGame: gdjs.RuntimeGame) {
      super();
      this._initialBehaviorSharedData = new Hashtable();
      this._renderer = new gdjs.RuntimeSceneRenderer(
        this,
        // @ts-ignore
        runtimeGame ? runtimeGame.getRenderer() : null
      );
      this._variables = new gdjs.VariablesContainer();
      this._runtimeGame = runtimeGame;
      this._timeManager = new gdjs.TimeManager();
      this._requestedChange = SceneChangeRequest.CONTINUE;

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
        logger.error('loadFromScene was called without a scene');
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
     * Called when a scene is "paused", i.e it will be not be rendered again
     * for some time, until it's resumed or unloaded.
     */
    onPause() {
      // Notify the objects that the scene is being paused. Objects should not
      // do anything special, but some object renderers might want to know about this.
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        const object = this._allInstancesList[i];
        object.onScenePaused(this);
      }

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

      // Notify the objects that the scene is being resumed. Objects should not
      // do anything special, but some object renderers might want to know about this.
      this._constructListOfAllInstances();
      for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
        const object = this._allInstancesList[i];
        object.onSceneResumed(this);
      }

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

      //@ts-ignore We are deleting the object
      this._onceTriggers = null;
      this._isLoaded = false;
      this.onGameResolutionResized();
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
        setupWarningLogger.warn(
          'No function found for running logic of scene ' + this._name
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
    setEventsFunction(func: () => void): void {
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
      this._requestedChange = SceneChangeRequest.CONTINUE;
      this._timeManager.update(
        elapsedTime,
        this._runtimeGame.getMinimalFramerate()
      );
      if (this._profiler) {
        this._profiler.begin('asynchronous actions (wait action, etc...)');
      }
      this._asyncTasksManager.processTasks(this);
      if (this._profiler) {
        this._profiler.end('asynchronous actions (wait action, etc...)');
      }
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
      if (this._eventsFunction !== null) this._eventsFunction(this);
      if (this._profiler) {
        this._profiler.end('events');
      }
      if (this._profiler) {
        this._profiler.begin('objects (post-events)');
      }
      // TODO EBO Add a method in RuntimeObject for this.
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
        this._profiler.begin('objects (pre-render, effects update)');
      }
      this._updateObjectsPreRender();
      if (this._profiler) {
        this._profiler.end('objects (pre-render, effects update)');
      }
      if (this._profiler) {
        this._profiler.begin('layers (effects update)');
      }
      this._updateLayersPreRender();
      if (this._profiler) {
        this._profiler.end('layers (effects update)');
      }
      if (this._profiler) {
        this._profiler.begin('render');
      }

      // Set to true to enable debug rendering (look for the implementation in the renderer
      // to see what is rendered).
      if (this._debugDrawEnabled) {
        this.getRenderer().renderDebugDraw(
          this._allInstancesList,
          this._debugDrawShowHiddenInstances,
          this._debugDrawShowPointsNames,
          this._debugDrawShowCustomPoints
        );
      }

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
      if (this._timeManager.isFirstFrame()) {
        this._constructListOfAllInstances();
        for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
          const object = this._allInstancesList[i];
          const rendererObject = object.getRendererObject();
          if (rendererObject) {
            rendererObject.visible = !object.isHidden();

            // Update effects, only for visible objects.
            if (rendererObject.visible) {
              this._runtimeGame
                .getEffectsManager()
                .updatePreRender(object.getRendererEffects(), object);
            }
          }

          // Perform pre-render update.
          object.updatePreRender(this);
        }
        return;
      } else {
        // After first frame, optimise rendering by setting only objects
        // near camera as visible.
        // TODO: For compatibility, pass a scale of `2`,
        // meaning that size of cameras will be multiplied by 2 and so objects
        // will be hidden if they are outside of this *larger* camera area.
        // This is useful for:
        // - objects not properly reporting their visibility AABB,
        // (so we have a "safety margin") but these objects should be fixed
        // instead.
        // - objects having effects rendering outside of their visibility AABB.
        this._updateLayersCameraCoordinates(2);
        this._constructListOfAllInstances();
        for (let i = 0, len = this._allInstancesList.length; i < len; ++i) {
          const object = this._allInstancesList[i];
          const rendererObject = object.getRendererObject();
          if (rendererObject) {
            if (object.isHidden()) {
              rendererObject.visible = false;
            } else {
              const cameraCoords = this._layersCameraCoordinates[
                object.getLayer()
              ];
              if (!cameraCoords) {
                continue;
              }
              const aabb = object.getVisibilityAABB();
              rendererObject.visible =
                // If no AABB is returned, the object should always be visible
                !aabb ||
                // If an AABB is there, it must be at least partially inside
                // the camera bounds.
                !(
                  aabb.min[0] > cameraCoords[2] ||
                  aabb.min[1] > cameraCoords[3] ||
                  aabb.max[0] < cameraCoords[0] ||
                  aabb.max[1] < cameraCoords[1]
                );
            }

            // Update effects, only for visible objects.
            if (rendererObject.visible) {
              this._runtimeGame
                .getEffectsManager()
                .updatePreRender(object.getRendererEffects(), object);

              // Perform pre-render update only if the object is visible
              // (including if there is no visibility AABB returned previously).
              object.updatePreRender(this);
            }
          } else {
            // Perform pre-render update, always for objects not having an
            // associated renderer object (so it must handle visibility on its own).
            object.updatePreRender(this);
          }
        }
      }
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
     * Create an identifier for a new object of the scene.
     */
    createNewUniqueId(): integer {
      this._lastId++;
      return this._lastId;
    }

    /**
     * Get the renderer associated to the RuntimeScene.
     */
    getRenderer() {
      return this._renderer;
    }

    getGame() {
      return this._runtimeGame;
    }

    getScene() {
      return this;
    }

    convertCoords(x: float, y: float): FloatPoint {
      // TODO EBO Use an attribute instead of instantiating a point.
      return [x, y];
    }

    convertInverseCoords(sceneX: float, sceneY: float): FloatPoint {
      return [sceneX, sceneY];
    }

    /**
     * Get the variables of the runtimeScene.
     * @return The container holding the variables of the scene.
     */
    getVariables() {
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
      logger.error("Can't find shared data for behavior with name: " + name);
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
     * Get the TimeManager of the scene.
     * @return The gdjs.TimeManager of the scene.
     */
    getTimeManager(): gdjs.TimeManager {
      return this._timeManager;
    }

    /**
     * Return the time elapsed since the last frame,
     * in milliseconds, for objects on the layer.
     */
    getElapsedTime(): float {
      return this._timeManager.getElapsedTime();
    }

    /**
     * Shortcut to get the SoundManager of the game.
     * @return The gdjs.SoundManager of the game.
     */
    getSoundManager(): gdjs.SoundManager {
      return this._runtimeGame.getSoundManager();
    }

    /**
     * @returns The scene's async tasks manager.
     */
    getAsyncTasksManager() {
      return this._asyncTasksManager;
    }

    /**
     * Return the value of the scene change that is requested.
     */
    getRequestedChange(): SceneChangeRequest {
      return this._requestedChange;
    }

    /**
     * Return the name of the new scene to be launched.
     *
     * See requestChange.
     */
    getRequestedScene(): string {
      return this._requestedScene;
    }

    /**
     * Request a scene change to be made. The change is handled externally (see gdjs.SceneStack)
     * thanks to getRequestedChange and getRequestedScene methods.
     * @param change One of RuntimeScene.CONTINUE|PUSH_SCENE|POP_SCENE|REPLACE_SCENE|CLEAR_SCENES|STOP_GAME.
     * @param sceneName The name of the new scene to launch, if applicable.
     */
    requestChange(change: SceneChangeRequest, sceneName?: string) {
      this._requestedChange = change;
      if (sceneName) this._requestedScene = sceneName;
    }

    getProfiler() {
      return this._profiler;
    }

    /**
     * Start a new profiler to measures the time passed in sections of the engine
     * in the scene.
     * @param onProfilerStopped Function to be called when the profiler is stopped. Will be passed the profiler as argument.
     */
    startProfiler(onProfilerStopped: (oldProfiler: gdjs.Profiler) => void) {
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
     * Check if the scene was just resumed.
     * This is true during the first frame after the scene has been unpaused.
     *
     * @returns true if the scene was just resumed
     */
    sceneJustResumed(): boolean {
      return this._isJustResumed;
    }
  }

  //The flags to describe the change request by a scene:
  export enum SceneChangeRequest {
    CONTINUE,
    PUSH_SCENE,
    POP_SCENE,
    REPLACE_SCENE,
    CLEAR_SCENES,
    STOP_GAME,
  }
}
