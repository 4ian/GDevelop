/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Game manager');

  const sleep = (ms: float) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /** Identify a script file, with its content hash (useful for hot-reloading). */
  export type RuntimeGameOptionsScriptFile = {
    /** The path for this script file. */
    path: string;
    /** The hash of the script file content. */
    hash: number;
  };

  const getGlobalResourceNames = (projectData: ProjectData): Array<string> =>
    projectData.usedResources.map((resource) => resource.name);

  /** Options given to the game at startup. */
  export type RuntimeGameOptions = {
    /** if true, force fullscreen. */
    forceFullscreen?: boolean;
    /** if true, game is run as a preview launched from an editor. */
    isPreview?: boolean;
    /** The name of the external layout to create in the scene at position 0;0. */
    injectExternalLayout?: string;
    /** Script files, used for hot-reloading. */
    scriptFiles?: Array<RuntimeGameOptionsScriptFile>;
    /** if true, export is a partial preview without events. */
    projectDataOnlyExport?: boolean;
    /** The address of the debugger server, to reach out using WebSocket. */
    websocketDebuggerServerAddress?: string;
    /** The port of the debugger server, to reach out using WebSocket. */
    websocketDebuggerServerPort?: string;

    /**
     * The path to require `@electron/remote` module.
     * This is only useful in a preview, where this can't be required from
     * `@electron/remote` directly as previews don't have any node_modules.
     * On the contrary, a game packaged with Electron as a standalone app
     * has its node_modules.
     * This can be removed once there are no more dependencies on
     * `@electron/remote` in the game engine and extensions.
     */
    electronRemoteRequirePath?: string;

    /**
     * the token to use by the game engine when requiring any resource stored on
     * GDevelop Cloud buckets. Note that this is only useful during previews.
     */
    gdevelopResourceToken?: string;

    /**
     * Check if, in some exceptional cases, we allow authentication
     * to be done through a iframe.
     * This is usually discouraged as the user can't verify that the authentication
     * window is a genuine one. It's only to be used in trusted contexts.
     */
    allowAuthenticationUsingIframeForPreview?: boolean;

    /**
     * If set, the game should use the specified environment for making calls
     * to GDevelop APIs ("dev" = development APIs).
     */
    environment?: 'dev';
  };

  /**
   * Represents a game being played.
   */
  export class RuntimeGame {
    _resourcesLoader: gdjs.ResourceLoader;
    _variables: VariablesContainer;
    _data: ProjectData;
    _eventsBasedObjectDatas: Map<String, EventsBasedObjectData>;
    _effectsManager: EffectsManager;
    _maxFPS: integer;
    _minFPS: integer;
    _gameResolutionWidth: integer;
    _gameResolutionHeight: integer;
    _originalWidth: float;
    _originalHeight: float;
    _resizeMode: 'adaptWidth' | 'adaptHeight' | string;
    _adaptGameResolutionAtRuntime: boolean;
    _scaleMode: 'linear' | 'nearest';
    _pixelsRounding: boolean;
    _antialiasingMode: 'none' | 'MSAA';
    _isAntialisingEnabledOnMobile: boolean;
    /**
     * Game loop management (see startGameLoop method)
     */
    _renderer: RuntimeGameRenderer;
    _sessionId: string | null;
    _playerId: string | null;
    _watermark: watermark.RuntimeWatermark;

    _sceneStack: SceneStack;
    /**
     * When set to true, the scenes are notified that game resolution size changed.
     */
    _notifyScenesForGameResolutionResize: boolean = false;

    /**
     * When paused, the game won't step and will be freezed. Useful for debugging.
     */
    _paused: boolean = false;

    /**
     * True during the first frame the game is back from being hidden.
     * This has nothing to do with `_paused`.
     */
    _hasJustResumed: boolean = false;

    //Inputs :
    _inputManager: InputManager;

    /**
     * Allow to specify an external layout to insert in the first scene.
     */
    _injectExternalLayout: any;
    _options: RuntimeGameOptions;

    /**
     * The mappings for embedded resources
     */
    _embeddedResourcesMappings: Map<string, Record<string, string>>;

    /**
     * Optional client to connect to a debugger server.
     */
    _debuggerClient: gdjs.AbstractDebuggerClient | null;
    _sessionMetricsInitialized: boolean = false;
    _disableMetrics: boolean = false;
    _isPreview: boolean;

    /**
     * @param data The object (usually stored in data.json) containing the full project data
     * @param
     */
    constructor(data: ProjectData, options?: RuntimeGameOptions) {
      this._options = options || {};
      this._variables = new gdjs.VariablesContainer(data.variables);
      this._data = data;

      this._resourcesLoader = new gdjs.ResourceLoader(
        this,
        data.resources.resources,
        getGlobalResourceNames(data),
        data.layouts
      );

      this._effectsManager = new gdjs.EffectsManager();
      this._maxFPS = this._data.properties.maxFPS;
      this._minFPS = this._data.properties.minFPS;
      this._gameResolutionWidth = this._data.properties.windowWidth;
      this._gameResolutionHeight = this._data.properties.windowHeight;
      this._originalWidth = this._gameResolutionWidth;
      this._originalHeight = this._gameResolutionHeight;
      this._resizeMode = this._data.properties.sizeOnStartupMode;
      this._adaptGameResolutionAtRuntime = this._data.properties.adaptGameResolutionAtRuntime;
      this._scaleMode = data.properties.scaleMode || 'linear';
      this._pixelsRounding = this._data.properties.pixelsRounding;
      this._antialiasingMode = this._data.properties.antialiasingMode;
      this._isAntialisingEnabledOnMobile = this._data.properties.antialisingEnabledOnMobile;
      this._renderer = new gdjs.RuntimeGameRenderer(
        this,
        this._options.forceFullscreen || false
      );
      this._watermark = new gdjs.watermark.RuntimeWatermark(
        this,
        data.properties.authorUsernames,
        this._data.properties.watermark
      );
      this._sceneStack = new gdjs.SceneStack(this);
      this._inputManager = new gdjs.InputManager();
      this._injectExternalLayout = this._options.injectExternalLayout || '';
      this._debuggerClient = gdjs.DebuggerClient
        ? new gdjs.DebuggerClient(this)
        : null;
      this._isPreview = this._options.isPreview || false;
      this._sessionId = null;
      this._playerId = null;

      this._embeddedResourcesMappings = new Map();
      for (const resource of this._data.resources.resources) {
        if (resource.metadata) {
          try {
            const metadata = JSON.parse(resource.metadata);
            if (metadata?.embeddedResourcesMapping) {
              this._embeddedResourcesMappings.set(
                resource.name,
                metadata.embeddedResourcesMapping
              );
            }
          } catch {
            logger.error(
              'Some metadata of resources can not be successfully parsed.'
            );
          }
        }
      }

      this._eventsBasedObjectDatas = new Map<String, EventsBasedObjectData>();
      if (this._data.eventsFunctionsExtensions) {
        for (const extension of this._data.eventsFunctionsExtensions) {
          for (const eventsBasedObject of extension.eventsBasedObjects) {
            this._eventsBasedObjectDatas.set(
              extension.name + '::' + eventsBasedObject.name,
              eventsBasedObject
            );
          }
        }
      }

      if (this.isUsingGDevelopDevelopmentEnvironment()) {
        logger.info(
          'This game will run on the development version of GDevelop APIs.'
        );
      }
    }

    /**
     * Update the project data. Useful for hot-reloading, should not be used otherwise.
     *
     * @param projectData The object (usually stored in data.json) containing the full project data
     */
    setProjectData(projectData: ProjectData): void {
      this._data = projectData;
      this._resourcesLoader.setResources(
        projectData.resources.resources,
        getGlobalResourceNames(projectData),
        projectData.layouts
      );
    }

    /**
     * Return the additional options passed to the RuntimeGame when created.
     * @returns The additional options, if any.
     */
    getAdditionalOptions(): RuntimeGameOptions | null {
      return this._options;
    }

    getRenderer(): gdjs.RuntimeGameRenderer {
      return this._renderer;
    }

    /**
     * Get the variables of the RuntimeGame.
     * @return The global variables
     */
    getVariables(): gdjs.VariablesContainer {
      return this._variables;
    }

    /**
     * Get the gdjs.SoundManager of the RuntimeGame.
     * @return The sound manager.
     */
    getSoundManager(): gdjs.HowlerSoundManager {
      return this._resourcesLoader.getSoundManager();
    }

    /**
     * Get the gdjs.ImageManager of the RuntimeGame.
     * @return The image manager.
     */
    getImageManager(): gdjs.PixiImageManager {
      return this._resourcesLoader.getImageManager();
    }

    /**
     * Get the gdjs.FontManager of the RuntimeGame.
     * @return The font manager.
     */
    getFontManager(): gdjs.FontFaceObserverFontManager {
      return this._resourcesLoader.getFontManager();
    }

    /**
     * Get the gdjs.BitmapFontManager of the RuntimeGame.
     * @return The bitmap font manager.
     */
    getBitmapFontManager(): gdjs.BitmapFontManager {
      return this._resourcesLoader.getBitmapFontManager();
    }

    /**
     * Get the JSON manager of the game, used to load JSON from game
     * resources.
     * @return The json manager for the game
     */
    getJsonManager(): gdjs.JsonManager {
      return this._resourcesLoader.getJsonManager();
    }

    /**
     * Get the 3D model manager of the game, used to load 3D model from game
     * resources.
     * @return The 3D model manager for the game
     */
    getModel3DManager(): gdjs.Model3DManager {
      return this._resourcesLoader.getModel3DManager();
    }

    /**
     * Get the Spine manager of the game, used to load and construct spine skeletons from game
     * resources.
     * @return The Spine manager for the game
     */
    getSpineManager(): gdjs.SpineManager | null {
      return this._resourcesLoader.getSpineManager();
    }

    /**
     * Get the Spine Atlas manager of the game, used to load atlases from game
     * resources.
     * @return The Spine Atlas manager for the game
     */
    getSpineAtlasManager(): gdjs.SpineAtlasManager | null {
      return this._resourcesLoader.getSpineAtlasManager();
    }

    /**
     * Get the input manager of the game, storing mouse, keyboard
     * and touches states.
     * @return The input manager owned by the game
     */
    getInputManager(): gdjs.InputManager {
      return this._inputManager;
    }

    /**
     * Get the effects manager of the game, which allows to manage
     * effects on runtime objects or runtime layers.
     * @return The effects manager for the game
     */
    getEffectsManager(): gdjs.EffectsManager {
      return this._effectsManager;
    }

    /**
     * Get the object containing the game data
     * @return The object associated to the game.
     */
    getGameData(): ProjectData {
      return this._data;
    }

    getEventsBasedObjectData(type: string): EventsBasedObjectData | null {
      const eventsBasedObjectData = this._eventsBasedObjectDatas.get(type);
      if (!eventsBasedObjectData) {
        logger.error(
          'The game has no events-based object of the type "' + type + '"'
        );
        return null;
      }
      return eventsBasedObjectData;
    }

    /**
     * Get the data associated to a scene.
     *
     * @param sceneName The name of the scene. If not defined, the first scene will be returned.
     * @return The data associated to the scene.
     */
    getSceneData(sceneName?: string): LayoutData | null {
      let scene: LayoutData | null = null;
      for (let i = 0, len = this._data.layouts.length; i < len; ++i) {
        const sceneData = this._data.layouts[i];
        if (sceneName === undefined || sceneData.name === sceneName) {
          scene = sceneData;
          break;
        }
      }
      if (scene === null) {
        logger.error('The game has no scene called "' + sceneName + '"');
      }
      return scene;
    }

    /**
     * Check if a scene exists
     *
     * @param sceneName The name of the scene to search.
     * @return true if the scene exists. If sceneName is undefined, true if the game has a scene.
     */
    hasScene(sceneName?: string): boolean {
      let isTrue = false;
      for (let i = 0, len = this._data.layouts.length; i < len; ++i) {
        const sceneData = this._data.layouts[i];
        if (sceneName === undefined || sceneData.name == sceneName) {
          isTrue = true;
          break;
        }
      }
      return isTrue;
    }

    /**
     * Get the data associated to an external layout.
     *
     * @param name The name of the external layout.
     * @return The data associated to the external layout or null if not found.
     */
    getExternalLayoutData(name: string): ExternalLayoutData | null {
      let externalLayout: ExternalLayoutData | null = null;
      for (let i = 0, len = this._data.externalLayouts.length; i < len; ++i) {
        const layoutData = this._data.externalLayouts[i];
        if (layoutData.name === name) {
          externalLayout = layoutData;
          break;
        }
      }
      return externalLayout;
    }

    /**
     * Get the data representing all the global objects of the game.
     * @return The data associated to the global objects.
     */
    getInitialObjectsData(): ObjectData[] {
      return this._data.objects || [];
    }

    /**
     * Get the original width of the game, as set on the startup of the game.
     *
     * This is guaranteed to never change, even if the size of the game is changed afterwards.
     */
    getOriginalWidth(): float {
      return this._originalWidth;
    }

    /**
     * Get the original height of the game, as set on the startup of the game.
     *
     * This is guaranteed to never change, even if the size of the game is changed afterwards.
     */
    getOriginalHeight(): float {
      return this._originalHeight;
    }

    /**
     * Get the game resolution (the size at which the game is played and rendered) width.
     * @returns The game resolution width, in pixels.
     */
    getGameResolutionWidth(): float {
      return this._gameResolutionWidth;
    }

    /**
     * Get the game resolution (the size at which the game is played and rendered) height.
     * @returns The game resolution height, in pixels.
     */
    getGameResolutionHeight(): float {
      return this._gameResolutionHeight;
    }

    /**
     * Change the game resolution.
     *
     * @param width The new width
     * @param height The new height
     */
    setGameResolutionSize(width: float, height: float): void {
      this._gameResolutionWidth = width;
      this._gameResolutionHeight = height;
      if (this._adaptGameResolutionAtRuntime) {
        if (
          gdjs.RuntimeGameRenderer &&
          gdjs.RuntimeGameRenderer.getWindowInnerWidth &&
          gdjs.RuntimeGameRenderer.getWindowInnerHeight
        ) {
          const windowInnerWidth = gdjs.RuntimeGameRenderer.getWindowInnerWidth();
          const windowInnerHeight = gdjs.RuntimeGameRenderer.getWindowInnerHeight();

          // Enlarge either the width or the eight to fill the inner window space.
          if (this._resizeMode === 'adaptWidth') {
            this._gameResolutionWidth =
              (this._gameResolutionHeight * windowInnerWidth) /
              windowInnerHeight;
          } else {
            if (this._resizeMode === 'adaptHeight') {
              this._gameResolutionHeight =
                (this._gameResolutionWidth * windowInnerHeight) /
                windowInnerWidth;
            }
          }
        }
      } else {
      }

      // Don't alter the game resolution. The renderer
      // will maybe adapt the size of the canvas or whatever is used to render the
      // game in the window, but this does not change the "game resolution".

      // Notify the renderer that game resolution changed (so that the renderer size
      // can be updated, and maybe other things like the canvas size), and let the
      // scenes know too.
      this._renderer.updateRendererSize();
      this._notifyScenesForGameResolutionResize = true;
    }

    /**
     * Set if the width or the height of the game resolution
     * should be changed to fit the game window - or if the game
     * resolution should not be updated automatically.
     *
     * @param resizeMode Either "" (don't change game resolution), "adaptWidth" or "adaptHeight".
     */
    setGameResolutionResizeMode(resizeMode: string): void {
      this._resizeMode = resizeMode;
      this._forceGameResolutionUpdate();
    }

    /**
     * Returns if the width or the height of the game resolution
     * should be changed to fit the game window - or if the game
     * resolution should not be updated automatically (empty string).
     *
     * @returns Either "" (don't change game resolution), "adaptWidth" or "adaptHeight".
     */
    getGameResolutionResizeMode(): string {
      return this._resizeMode;
    }

    /**
     * Set if the game resolution should be automatically adapted
     * when the game window or screen size change. This will only
     * be the case if the game resolution resize mode is
     * configured to adapt the width or the height of the game.
     * @param enable true to change the game resolution according to the window/screen size.
     */
    setAdaptGameResolutionAtRuntime(enable: boolean): void {
      this._adaptGameResolutionAtRuntime = enable;
      this._forceGameResolutionUpdate();
    }

    /**
     * Returns if the game resolution should be automatically adapted
     * when the game window or screen size change. This will only
     * be the case if the game resolution resize mode is
     * configured to adapt the width or the height of the game.
     * @returns true if the game resolution is automatically changed according to the window/screen size.
     */
    getAdaptGameResolutionAtRuntime(): boolean {
      return this._adaptGameResolutionAtRuntime;
    }

    /**
     * Return the minimal fps that must be guaranteed by the game
     * (otherwise, game is slowed down).
     */
    getMinimalFramerate(): integer {
      return this._minFPS;
    }

    /**
     * Return the scale mode of the game ("linear" or "nearest").
     */
    getScaleMode(): 'linear' | 'nearest' {
      return this._scaleMode;
    }

    /**
     * Return if the game is rounding pixels when rendering.
     */
    getPixelsRounding(): boolean {
      return this._pixelsRounding;
    }

    /**
     * Return the antialiasing mode used by the game ("none" or "MSAA").
     */
    getAntialiasingMode(): 'none' | 'MSAA' {
      return this._antialiasingMode;
    }

    /**
     * Return true if antialising is enabled on mobiles.
     */
    isAntialisingEnabledOnMobile(): boolean {
      return this._isAntialisingEnabledOnMobile;
    }

    /**
     * Set or unset the game as paused.
     * When paused, the game won't step and will be freezed. Useful for debugging.
     * @param enable true to pause the game, false to unpause
     */
    pause(enable: boolean) {
      if (this._paused === enable) return;

      this._paused = enable;
      if (this._debuggerClient) {
        if (this._paused) this._debuggerClient.sendGamePaused();
        else this._debuggerClient.sendGameResumed();
      }
    }

    /**
     * @returns true during the first frame the game is back from being hidden.
     * This has nothing to do with `_paused`.
     */
    hasJustResumed() {
      return this._hasJustResumed;
    }

    /**
     * Preload a scene assets as soon as possible in background.
     */
    prioritizeLoadingOfScene(sceneName: string) {
      // Don't await the scene assets to be loaded.
      this._resourcesLoader.loadSceneResources(sceneName);
    }

    /**
     * @return The progress of assets loading in background for a scene
     * (between 0 and 1).
     */
    getSceneLoadingProgress(sceneName: string): number {
      return this._resourcesLoader.getSceneLoadingProgress(sceneName);
    }

    /**
     * @returns true when all the resources of the given scene are loaded
     * (but maybe not parsed).
     */
    areSceneAssetsLoaded(sceneName: string): boolean {
      return this._resourcesLoader.areSceneAssetsLoaded(sceneName);
    }

    /**
     * @returns true when all the resources of the given scene are loaded and
     * parsed.
     */
    areSceneAssetsReady(sceneName: string): boolean {
      return this._resourcesLoader.areSceneAssetsReady(sceneName);
    }

    /**
     * Load all assets needed to display the 1st scene, displaying progress in
     * renderer.
     */
    loadAllAssets(
      callback: () => void,
      progressCallback?: (progress: float) => void
    ) {
      this.loadFirstAssetsAndStartBackgroundLoading(
        this._getFirstSceneName(),
        progressCallback
      ).then(callback);
    }

    /**
     * Load all assets needed to display the 1st scene, displaying progress in
     * renderer.
     *
     * When a game is hot-reload, this method can be called with the current
     * scene.
     */
    async loadFirstAssetsAndStartBackgroundLoading(
      firstSceneName: string,
      progressCallback?: (progress: float) => void
    ): Promise<void> {
      try {
        // Download the loading screen background image first to be able to
        // display the loading screen as soon as possible.
        const backgroundImageResourceName = this._data.properties.loadingScreen
          .backgroundImageResourceName;
        if (backgroundImageResourceName) {
          await this._resourcesLoader
            .getImageManager()
            .loadResource(backgroundImageResourceName);
        }
        await Promise.all([
          this._loadAssetsWithLoadingScreen(
            /* isFirstScene = */ true,
            async (onProgress) => {
              // TODO Is a setting needed?
              if (false) {
                await this._resourcesLoader.loadAllResources(onProgress);
              } else {
                await this._resourcesLoader.loadGlobalAndFirstSceneResources(
                  firstSceneName,
                  onProgress
                );
                // Don't await as it must not block the first scene from starting.
                this._resourcesLoader.loadAllSceneInBackground();
              }
            },
            progressCallback
          ),
          // TODO This is probably not necessary in case of hot reload.
          gdjs.getAllAsynchronouslyLoadingLibraryPromise(),
        ]);
      } catch (e) {
        if (this._debuggerClient) this._debuggerClient.onUncaughtException(e);

        throw e;
      }
    }

    /**
     * Load all assets for a given scene, displaying progress in renderer.
     */
    async loadSceneAssets(
      sceneName: string,
      progressCallback?: (progress: float) => void
    ): Promise<void> {
      await this._loadAssetsWithLoadingScreen(
        /* isFirstLayout = */ false,
        async (onProgress) => {
          await this._resourcesLoader.loadAndProcessSceneResources(
            sceneName,
            onProgress
          );
        },
        progressCallback
      );
    }

    /**
     * Load assets, displaying progress in renderer.
     */
    private async _loadAssetsWithLoadingScreen(
      isFirstScene: boolean,
      loadAssets: (
        onProgress: (count: integer, total: integer) => Promise<void>
      ) => Promise<void>,
      progressCallback?: (progress: float) => void
    ): Promise<void> {
      this.pause(true);
      const loadingScreen = new gdjs.LoadingScreenRenderer(
        this.getRenderer(),
        this._resourcesLoader.getImageManager(),
        this._data.properties.loadingScreen,
        this._data.properties.watermark.showWatermark,
        isFirstScene
      );

      const onProgress = async (count: integer, total: integer) => {
        const percent = Math.floor((100 * count) / total);
        loadingScreen.setPercent(percent);
        if (progressCallback) {
          progressCallback(percent);
        }
        const hasRendered = loadingScreen.renderIfNeeded();
        if (hasRendered) {
          // Give a chance to draw calls from the renderer to be handled.
          await sleep(1);
        }
      };
      await loadAssets(onProgress);

      await loadingScreen.unload();
      this.pause(false);
    }

    private _getFirstSceneName(): string {
      const firstSceneName = this._data.firstLayout;
      return this.hasScene(firstSceneName)
        ? firstSceneName
        : // @ts-ignore - no risk of null object.
          this.getSceneData().name;
    }

    /**
     * Start the game loop, to be called once assets are loaded.
     */
    startGameLoop() {
      try {
        if (!this.hasScene()) {
          logger.error('The game has no scene.');
          return;
        }
        this._forceGameResolutionUpdate();

        // Load the first scene
        this._sceneStack.push(
          this._getFirstSceneName(),
          this._injectExternalLayout
        );
        this._watermark.displayAtStartup();

        //Uncomment to profile the first x frames of the game.
        // var x = 500;
        // var startTime = Date.now();
        // console.profile("Stepping for " + x + " frames")
        // for(var i = 0; i < x; ++i) {
        //     this._sceneStack.step(16);
        // }
        // console.profileEnd();
        // var time = Date.now() - startTime;
        // logger.log("Took", time, "ms");
        // return;

        this._setupGameVisibilityEvents();

        // The standard game loop
        let accumulatedElapsedTime = 0;
        this._hasJustResumed = false;
        this._renderer.startGameLoop((lastCallElapsedTime) => {
          try {
            if (this._paused) {
              return true;
            }

            // Skip the frame if we rendering frames too fast
            accumulatedElapsedTime += lastCallElapsedTime;
            if (
              this._maxFPS > 0 &&
              1000.0 / accumulatedElapsedTime > this._maxFPS + 7
            ) {
              // Only skip frame if the framerate is 7 frames above the maximum framerate.
              // Most browser/engines will try to run at slightly more than 60 frames per second.
              // If game is set to have a maximum FPS to 60, then one out of two frames will be dropped.
              // Hence, we use a 7 frames margin to ensure that we're not skipping frames too much.
              return true;
            }
            const elapsedTime = accumulatedElapsedTime;
            accumulatedElapsedTime = 0;

            // Manage resize events.
            if (this._notifyScenesForGameResolutionResize) {
              this._sceneStack.onGameResolutionResized();
              this._notifyScenesForGameResolutionResize = false;
            }

            // Render and step the scene.
            if (this._sceneStack.step(elapsedTime)) {
              this.getInputManager().onFrameEnded();
              this._hasJustResumed = false;
              return true;
            }
            return false;
          } catch (e) {
            if (this._debuggerClient)
              this._debuggerClient.onUncaughtException(e);

            throw e;
          }
        });
        setTimeout(() => {
          this._setupSessionMetrics();
        }, 10000);
      } catch (e) {
        if (this._debuggerClient) this._debuggerClient.onUncaughtException(e);

        throw e;
      }
    }

    /**
     * Set if the session should be registered.
     */
    enableMetrics(enable: boolean): void {
      this._disableMetrics = !enable;
      if (enable) {
        this._setupSessionMetrics();
      }
    }

    _setupGameVisibilityEvents() {
      if (typeof navigator !== 'undefined' && typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this._hasJustResumed = true;
          }
        });
        window.addEventListener(
          'resume',
          () => {
            this._hasJustResumed = true;
          },
          false
        );
      }
    }

    /**
     * Register a new session for the game, and set up listeners to follow the session
     * time.
     */
    _setupSessionMetrics() {
      if (this._sessionMetricsInitialized) {
        return;
      }
      if (this._disableMetrics) {
        return;
      }
      if (this.isPreview()) {
        return;
      }
      if (typeof fetch === 'undefined') {
        return;
      }
      if (!this._data.properties.projectUuid) {
        return;
      }
      const baseUrl = 'https://api.gdevelop-app.com/analytics';
      this._playerId = this._makePlayerUuid();
      /**
       * The duration that is already sent to the service
       * (in milliseconds).
       **/
      let sentDuration = 0;
      /**
       * The duration that is not yet sent to the service to avoid flooding
       * (in milliseconds).
       **/
      let notYetSentDuration = 0;
      /**
       * The last time when duration has been counted
       * either in sendedDuration or notYetSentDuration.
       **/
      let lastSessionResumeTime = Date.now();
      fetch(baseUrl + '/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // It's important to ensure that the data sent here does not contain
        // any personal information from the player or that would allow to
        // precisely identify someone.
        body: JSON.stringify({
          gameId: this._data.properties.projectUuid,
          playerId: this._playerId,
          game: {
            name: this._data.properties.name || '',
            packageName: this._data.properties.packageName || '',
            version: this._data.properties.version || '',
            location: window.location.href,
          },
          platform: {
            // @ts-ignore
            isCordova: !!window.cordova,
            devicePlatform:
              // @ts-ignore
              typeof device !== 'undefined' ? device.platform || '' : '',
            navigatorPlatform:
              typeof navigator !== 'undefined' ? navigator.platform : '',
            hasTouch:
              typeof navigator !== 'undefined'
                ? !!navigator.maxTouchPoints && navigator.maxTouchPoints > 2
                : false,
          },
        }),
      })
        .then((response) => {
          // Ensure the session is correctly created to avoid sending hits that will fail.
          if (!response.ok) {
            console.error('Error while creating the session', response);
            throw new Error('Error while creating the session');
          }
          return response;
        })
        .then((response) => response.text())
        .then((returnedSessionId) => {
          this._sessionId = returnedSessionId;
        })
        .catch(() => {});

      /* Ignore any error */
      const sendSessionHit = () => {
        if (!this._sessionId) {
          return;
        }

        const now = Date.now();
        notYetSentDuration += now - lastSessionResumeTime;
        lastSessionResumeTime = now;

        // Group repeated calls to sendSessionHit - which could
        // happen because of multiple event listeners being fired.
        if (notYetSentDuration < 5 * 1000) {
          return;
        }
        // The backend use seconds for duration.
        // The milliseconds will stay in notYetSentDuration.
        const toBeSentDuration = Math.floor(notYetSentDuration / 1000) * 1000;
        sentDuration += toBeSentDuration;
        notYetSentDuration -= toBeSentDuration;

        navigator.sendBeacon(
          baseUrl + '/session-hit',
          JSON.stringify({
            gameId: this._data.properties.projectUuid,
            playerId: this._playerId,
            sessionId: this._sessionId,
            duration: Math.floor(sentDuration / 1000),
          })
        );
      };
      if (typeof navigator !== 'undefined' && typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            // Skip the duration the game was hidden.
            lastSessionResumeTime = Date.now();
          } else {
            sendSessionHit();
          }
        });
        window.addEventListener('pagehide', sendSessionHit, false);
        // Cordova events
        window.addEventListener('pause', sendSessionHit, false);
        window.addEventListener(
          'resume',
          () => {
            // Skip the duration the game was hidden.
            lastSessionResumeTime = Date.now();
          },
          false
        );

        // Detect Safari to work around Safari-specific bugs:
        // - https://bugs.webkit.org/show_bug.cgi?id=151610
        // - https://bugs.webkit.org/show_bug.cgi?id=151234
        // @ts-ignore
        const isSafari = typeof safari === 'object' && safari.pushNotification;
        const isElectron = /electron/i.test(navigator.userAgent);
        if (isSafari || isElectron) {
          window.addEventListener('beforeunload', () => {
            sendSessionHit();
          });
        }
      }
      this._sessionMetricsInitialized = true;
      this._sessionId = this._sessionId;
    }

    /**
     * Generate an anonymous unique identifier to differentiate
     * the player from others in the game metrics.
     */
    _makePlayerUuid(): string {
      try {
        const key = 'GDJS-internal-player-uuid';
        const existingPlayerUuid = localStorage.getItem(key);
        if (existingPlayerUuid) {
          return existingPlayerUuid;
        }
        const newPlayerUuid = gdjs.makeUuid();
        localStorage.setItem(key, newPlayerUuid);
        return newPlayerUuid;
      } catch (err) {
        return gdjs.makeUuid();
      }
    }

    getSessionId(): string | null {
      return this._sessionId;
    }

    getPlayerId(): string | null {
      return this._playerId;
    }

    /**
     * Called by the game renderer when the window containing the game
     * has changed size (this can result from a resize of the window,
     * but also other factors like a device orientation change on mobile).
     */
    onWindowInnerSizeChanged() {
      this._forceGameResolutionUpdate();
    }

    /**
     * Enlarge/reduce the width (or the height) of the game to fill the inner window.
     */
    _forceGameResolutionUpdate() {
      this.setGameResolutionSize(
        this._gameResolutionWidth,
        this._gameResolutionHeight
      );
    }

    /**
     * Start a profiler for the currently running scene.
     * @param onProfilerStopped Function to be called when the profiler is stopped. Will be passed the profiler as argument.
     */
    startCurrentSceneProfiler(
      onProfilerStopped: (oldProfiler: Profiler) => void
    ) {
      const currentScene = this._sceneStack.getCurrentScene();
      if (!currentScene) {
        return false;
      }
      currentScene.startProfiler(onProfilerStopped);
      return true;
    }

    /**
     * Stop the profiler for the currently running scene.
     */
    stopCurrentSceneProfiler() {
      const currentScene = this._sceneStack.getCurrentScene();
      if (!currentScene) {
        return;
      }
      currentScene.stopProfiler();
    }

    /**
     * Return true if a scene was loaded, false otherwise (i.e: game not yet started).
     */
    wasFirstSceneLoaded(): boolean {
      return this._sceneStack.wasFirstSceneLoaded();
    }

    /**
     * Return the stack of {@link gdjs.RuntimeScene} being played.
     */
    getSceneStack(): gdjs.SceneStack {
      return this._sceneStack;
    }

    /**
     * Check if the game is running as a preview, launched from an editor.
     * @returns true if the current game is a preview.
     */
    isPreview(): boolean {
      return this._isPreview;
    }

    /**
     * Check if the game should call GDevelop development APIs or not.
     *
     * Unless you are contributing to GDevelop, avoid using this.
     */
    isUsingGDevelopDevelopmentEnvironment(): boolean {
      return this._options.environment === 'dev';
    }

    /**
     * Gets an extension property from the project data.
     * @param extensionName The extension name.
     * @param propertyName The property name.
     * @return The property value.
     */
    getExtensionProperty(
      extensionName: string,
      propertyName: string
    ): string | null {
      for (let property of this._data.properties.extensionProperties) {
        if (
          property.extension === extensionName &&
          property.property === propertyName
        ) {
          return property.value;
        }
      }
      return null;
    }

    /**
     * Resolves the name of an embedded resource.
     * @param mainResourceName The name of the resource containing the embedded resource.
     * @param embeddedResourceName The name of the embedded resource.
     * @return The resource name.
     */
    resolveEmbeddedResource(
      mainResourceName: string,
      embeddedResourceName: string
    ): string {
      const mapping = this._embeddedResourcesMappings.get(mainResourceName);
      return mapping && mapping[embeddedResourceName]
        ? mapping[embeddedResourceName]
        : embeddedResourceName;
    }

    /**
     * Returns the array of resources that are embedded to passed one.
     * @param resourceName The name of resource to find embedded resources of.
     * @returns The array of related resources names.
     */
    getEmbeddedResourcesNames(resourceName: string): string[] {
      return this._embeddedResourcesMappings.has(resourceName)
        ? Object.keys(this._embeddedResourcesMappings.get(resourceName)!)
        : [];
    }
  }
}
