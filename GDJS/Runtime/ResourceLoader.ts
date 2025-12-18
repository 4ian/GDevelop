/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('ResourceLoader');
  const debugLogger = new gdjs.Logger('ResourceLoader - debug').enable(false);

  const addSearchParameterToUrl = (
    url: string,
    urlEncodedParameterName: string,
    urlEncodedValue: string
  ) => {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      // blob/data protocol does not support search parameters, which are useless anyway.
      return url;
    }

    const separator = url.indexOf('?') === -1 ? '?' : '&';
    return url + separator + urlEncodedParameterName + '=' + urlEncodedValue;
  };

  const checkIfIsGDevelopCloudBucketUrl = (url: string): boolean => {
    return (
      url.startsWith('https://project-resources.gdevelop.io/') ||
      url.startsWith('https://project-resources-dev.gdevelop.io/')
    );
  };

  const maxForegroundConcurrency = 20;
  const maxBackgroundConcurrency = 5;
  const maxAttempt = 3;

  /**
   * A task of pre-loading resources used by a scene.
   *
   * A Promise can't be used instead of this class because a Promise will start
   * as soon as possible. It would flood the server with downloading requests
   * and make impossible to finely tune in which order scenes are actually
   * downloaded.
   */
  class SceneLoadingTask {
    sceneName: string;
    private onProgressCallbacks: Array<(count: number, total: number) => void>;
    private onFinishCallbacks: Array<() => void>;
    private isFinished = false;

    constructor(sceneName: string) {
      this.sceneName = sceneName;
      this.onProgressCallbacks = new Array<
        (count: number, total: number) => void
      >();
      this.onFinishCallbacks = new Array<() => void>();
    }

    registerCallback(
      onFinish: () => void,
      onProgress?: (count: number, total: number) => void
    ) {
      if (this.isFinished) {
        onFinish();
        return;
      }
      this.onFinishCallbacks.push(onFinish);
      if (onProgress) {
        this.onProgressCallbacks.push(onProgress);
      }
    }

    onProgress(count: number, total: number) {
      for (const onProgress of this.onProgressCallbacks) {
        onProgress(count, total);
      }
    }

    onFinish() {
      this.isFinished = true;
      for (const onFinish of this.onFinishCallbacks) {
        onFinish();
      }
    }
  }

  class InternalInGameEditorOnlySvgManager implements gdjs.ResourceManager {
    async loadResource(resourceName: string): Promise<void> {
      // Nothing to do.
    }

    async processResource(resourceName: string): Promise<void> {
      // Nothing to do.
    }

    getResourceKinds(): Array<ResourceKind> {
      return ['internal-in-game-editor-only-svg'];
    }

    unloadResource(resourceData: ResourceData): void {
      // Nothing to do.
    }

    dispose(): void {
      // Nothing to do.
    }
  }

  /**
   * Pre-load resources of any kind needed for a game or a scene.
   * @category Resources
   */
  export class ResourceLoader {
    _runtimeGame: RuntimeGame;
    /**
     * All the resource of a game by resource name.
     */
    private _resources: Map<string, ResourceData>;
    /**
     * Resources needed for any scene. Typically, they are resources from
     * global objects.
     */
    private _globalResources: Array<string>;
    /**
     * Resources and the loading state of each scene, indexed by scene name.
     */
    private _sceneLoadingStates: Map<
      string,
      {
        resourceNames: Array<string>;
        status: 'not-loaded' | 'loaded' | 'ready';
      }
    > = new Map();
    /**
     * A queue of scenes whose resources are still to be pre-loaded.
     */
    private _sceneToLoadQueue: Array<SceneLoadingTask> =
      new Array<SceneLoadingTask>();
    /**
     * The resource managers that actually download and remember downloaded
     * content.
     */
    _resourceManagersMap: Map<ResourceKind, ResourceManager>;
    private _imageManager: ImageManager;
    private _soundManager: SoundManager;
    private _fontManager: FontManager;
    private _jsonManager: JsonManager;
    private _model3DManager: Model3DManager;
    private _bitmapFontManager: BitmapFontManager;
    private _spineAtlasManager: SpineAtlasManager | null = null;
    private _spineManager: SpineManager | null = null;
    private _svgManager: InternalInGameEditorOnlySvgManager;

    /**
     * The name of the scene for which resources are currently being loaded.
     */
    private currentLoadingSceneName: string = '';
    /**
     * The progress, between 0 and 1, of the loading of the resource, for the
     * scene that is being loaded (see `currentLoadingSceneName`).
     */
    private currentSceneLoadingProgress: float = 0;
    /**
     * It's set to `true` during intermediary loading screen to use a greater
     * concurrency as the game is paused and doesn't need bandwidth (for video
     * or music streaming or online multiplayer).
     */
    private _isLoadingInForeground = true;

    /**
     * @param runtimeGame The game.
     * @param resourceDataArray The resources data of the game.
     * @param globalResources The resources needed for any scene.
     * @param layoutDataArray The resources used by each scene.
     */
    constructor(
      runtimeGame: RuntimeGame,
      resourceDataArray: ResourceData[],
      globalResources: Array<string>,
      layoutDataArray: Array<LayoutData>
    ) {
      this._runtimeGame = runtimeGame;
      this._resources = new Map<string, ResourceData>();
      this._globalResources = globalResources;

      // These 3 attributes are filled by `setResources`.
      this.setResources(resourceDataArray, globalResources, layoutDataArray);

      this._imageManager = new gdjs.ImageManager(this);
      this._soundManager = new gdjs.SoundManager(this);
      this._fontManager = new gdjs.FontManager(this);
      this._jsonManager = new gdjs.JsonManager(this);
      this._bitmapFontManager = new gdjs.BitmapFontManager(
        this,
        this._imageManager
      );
      this._model3DManager = new gdjs.Model3DManager(this);
      this._svgManager = new InternalInGameEditorOnlySvgManager();

      // add spine related managers only if spine extension is used
      if (gdjs.SpineAtlasManager && gdjs.SpineManager) {
        this._spineAtlasManager = new gdjs.SpineAtlasManager(
          this,
          this._imageManager
        );
        this._spineManager = new gdjs.SpineManager(
          this,
          this._spineAtlasManager
        );
      }

      const resourceManagers: Array<ResourceManager> = [
        this._imageManager,
        this._soundManager,
        this._fontManager,
        this._jsonManager,
        this._bitmapFontManager,
        this._model3DManager,
        this._svgManager,
      ];

      if (this._spineAtlasManager)
        resourceManagers.push(this._spineAtlasManager);
      if (this._spineManager) resourceManagers.push(this._spineManager);

      this._resourceManagersMap = new Map<ResourceKind, ResourceManager>();
      for (const resourceManager of resourceManagers) {
        for (const resourceKind of resourceManager.getResourceKinds()) {
          this._resourceManagersMap.set(resourceKind, resourceManager);
        }
      }
    }

    /**
     * @returns the runtime game instance.
     */
    getRuntimeGame(): RuntimeGame {
      return this._runtimeGame;
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should
     * not be used otherwise.
     */
    setResources(
      resourceDataArray: ResourceData[],
      globalResources: Array<string>,
      layoutDataArray: Array<LayoutData>
    ): void {
      this._globalResources = globalResources;

      this._sceneLoadingStates.clear();

      for (const layoutData of layoutDataArray) {
        this._sceneLoadingStates.set(layoutData.name, {
          resourceNames: layoutData.usedResources.map(
            (resource) => resource.name
          ),
          status: 'not-loaded',
        });
      }
      // TODO Clearing the queue doesn't abort the running task, but it should
      // not matter as resource loading is really fast in preview mode.
      this._sceneToLoadQueue.length = 0;
      for (let index = layoutDataArray.length - 1; index >= 0; index--) {
        const layoutData = layoutDataArray[index];

        const resourcesPreloading = layoutData.resourcesPreloading || 'inherit';
        const resolvedResourcesPreloading =
          resourcesPreloading === 'inherit'
            ? this._runtimeGame.getSceneResourcesPreloading()
            : resourcesPreloading;

        if (resolvedResourcesPreloading === 'at-startup') {
          this._sceneToLoadQueue.push(new SceneLoadingTask(layoutData.name));
        }
      }

      this._resources.clear();
      for (const resourceData of resourceDataArray) {
        if (!resourceData.file) {
          // Empty string or missing `file` field: not a valid resource, let's entirely ignore it.
          // Otherwise, this can confuse some loaders that will consider an empty string different
          // than a file that happen not to fail to load.
          continue;
        }

        this._resources.set(resourceData.name, resourceData);
      }
    }

    async loadAllResources(
      onProgress: (loadingCount: integer, totalCount: integer) => void
    ): Promise<void> {
      let loadedCount = 0;
      await processAndRetryIfNeededWithPromisePool(
        [...this._resources.values()],
        maxForegroundConcurrency,
        maxAttempt,
        async (resource) => {
          await this._loadResource(resource);
          await this._processResource(resource);
          loadedCount++;
          onProgress(loadedCount, this._resources.size);
        }
      );

      for (const sceneLoadingState of this._sceneLoadingStates.values()) {
        sceneLoadingState.status = 'ready';
      }
    }

    async loadResources(
      resourceNames: Array<string>,
      onProgress: (loadingCount: integer, totalCount: integer) => void
    ): Promise<void> {
      let loadedCount = 0;
      await processAndRetryIfNeededWithPromisePool(
        resourceNames,
        maxForegroundConcurrency,
        maxAttempt,
        async (resourceName) => {
          const resource = this._resources.get(resourceName);
          if (resource) {
            await this._loadResource(resource);
            await this._processResource(resource);
          }
          loadedCount++;
          onProgress(loadedCount, this._resources.size);
        }
      );
    }

    /**
     * Load the resources that are needed to launch the first scene.
     */
    async loadGlobalAndFirstSceneResources(
      firstSceneName: string,
      onProgress: (count: number, total: number) => void
    ): Promise<void> {
      const firstSceneState = this._sceneLoadingStates.get(firstSceneName);
      if (!firstSceneState) {
        logger.warn(
          'Can\'t load resource for unknown scene: "' + firstSceneName + '".'
        );
        return;
      }

      let loadedCount = 0;
      const resourceNames = [
        ...this._globalResources,
        ...firstSceneState.resourceNames,
      ];
      await processAndRetryIfNeededWithPromisePool(
        resourceNames,
        maxForegroundConcurrency,
        maxAttempt,
        async (resourceName) => {
          const resource = this._resources.get(resourceName);
          if (!resource) {
            logger.warn('Unable to find resource "' + resourceName + '".');
            return;
          }
          await this._loadResource(resource);
          await this._processResource(resource);
          loadedCount++;
          onProgress(loadedCount, resourceNames.length);
        }
      );

      firstSceneState.status = 'ready';
    }

    /**
     * Load each scene in order.
     *
     * This is done in background to try to avoid loading screens when changing
     * scenes.
     */
    async loadAllSceneInBackground(): Promise<void> {
      if (this.currentLoadingSceneName) {
        return;
      }

      debugLogger.log('Loading all scene resources, in background.');
      while (this._sceneToLoadQueue.length > 0) {
        debugLogger.log(
          `Still resources of ${this._sceneToLoadQueue.length} scene(s) to load: ${this._sceneToLoadQueue.map((task) => task.sceneName).join(', ')}`
        );
        const task = this._sceneToLoadQueue[this._sceneToLoadQueue.length - 1];
        if (task === undefined) {
          continue;
        }
        this.currentLoadingSceneName = task.sceneName;
        if (!this.areSceneAssetsLoaded(task.sceneName)) {
          debugLogger.log(
            `Loading (but not processing) resources for scene ${task.sceneName}.`
          );
          await this._doLoadSceneResources(
            task.sceneName,
            async (count, total) => task.onProgress(count, total)
          );
          debugLogger.log(
            `Done loading (but not processing) resources for scene ${task.sceneName}.`
          );

          // A scene may have been moved last while awaiting resources to be
          // downloaded (see _prioritizeScene).
          this._sceneToLoadQueue.splice(
            this._sceneToLoadQueue.findIndex((element) => element === task),
            1
          );
          task.onFinish();
        } else {
          this._sceneToLoadQueue.pop();
        }
      }
      debugLogger.log(`Scene resources loading finished.`);
      this.currentLoadingSceneName = '';
    }

    private async _doLoadSceneResources(
      sceneName: string,
      onProgress?: (count: number, total: number) => Promise<void>
    ): Promise<void> {
      const sceneState = this._sceneLoadingStates.get(sceneName);
      if (!sceneState) {
        logger.warn(
          'Can\'t load resource for unknown scene: "' + sceneName + '".'
        );
        return;
      }

      let loadedCount = 0;
      await processAndRetryIfNeededWithPromisePool(
        sceneState.resourceNames,
        this._isLoadingInForeground
          ? maxForegroundConcurrency
          : maxBackgroundConcurrency,
        maxAttempt,
        async (resourceName) => {
          const resource = this._resources.get(resourceName);
          if (!resource) {
            logger.warn('Unable to find resource "' + resourceName + '".');
            return;
          }
          await this._loadResource(resource);
          loadedCount++;
          this.currentSceneLoadingProgress =
            loadedCount / sceneState.resourceNames.length;
          onProgress &&
            (await onProgress(loadedCount, sceneState.resourceNames.length));
        }
      );
      sceneState.status = 'loaded';
    }

    private async _loadResource(resource: ResourceData): Promise<void> {
      const resourceManager = this._resourceManagersMap.get(resource.kind);
      if (!resourceManager) {
        logger.warn(
          'Unknown resource kind: "' +
            resource.kind +
            '" for: "' +
            resource.name +
            '".'
        );
        return;
      }
      await resourceManager.loadResource(resource.name);
    }

    /**
     * Load and process a scene that is needed right away.
     *
     * The renderer will show a loading screen while its done.
     */
    async loadAndProcessSceneResources(
      sceneName: string,
      onProgress?: (count: number, total: number) => Promise<void>
    ): Promise<void> {
      if (this.areSceneAssetsReady(sceneName)) {
        return;
      }
      await this.loadSceneResources(sceneName, onProgress);

      const sceneState = this._sceneLoadingStates.get(sceneName);
      if (!sceneState) {
        logger.warn(
          'Can\'t load resource for unknown scene: "' + sceneName + '".'
        );
        return;
      }

      let parsedCount = 0;
      for (const resourceName of sceneState.resourceNames) {
        const resource = this._resources.get(resourceName);
        if (!resource) {
          logger.warn('Unable to find resource "' + resourceName + '".');
          continue;
        }
        await this._processResource(resource);
        parsedCount++;
        onProgress &&
          (await onProgress(parsedCount, sceneState.resourceNames.length));
      }
      sceneState.status = 'ready';
    }

    /**
     * Load a scene resources without parsing them.
     *
     * When another scene resources are loading in background, it waits for
     * all its resources to be loaded before loading resources of the given
     * scene.
     */
    async loadSceneResources(
      sceneName: string,
      onProgress?: (count: number, total: number) => void
    ): Promise<void> {
      debugLogger.log(
        `Prioritization of loading of resources for scene ${sceneName} was requested.`
      );

      this._isLoadingInForeground = true;
      const task = this._prioritizeScene(sceneName);
      return new Promise<void>((resolve, reject) => {
        if (!task) {
          this._isLoadingInForeground = false;
          debugLogger.log(
            `Loading of resources for scene ${sceneName} was immediately resolved.`
          );
          resolve();
          return;
        }
        task.registerCallback(() => {
          debugLogger.log(
            `Loading of resources for scene ${sceneName} just finished.`
          );
          this._isLoadingInForeground = false;
          resolve();
        }, onProgress);
      });
    }

    /**
     * To be called when the game is disposed.
     * Dispose all the resource managers.
     */
    dispose(): void {
      for (const resourceManager of this._resourceManagersMap.values()) {
        resourceManager.dispose();
      }
    }

    /**
     * To be called when a scene is unloaded.
     */
    unloadSceneResources({
      unloadedSceneName,
      newSceneName,
    }: {
      unloadedSceneName: string;
      newSceneName: string | null;
    }): void {
      if (!unloadedSceneName) return;
      debugLogger.log(
        `Unloading of resources for scene ${unloadedSceneName} was requested.`
      );

      const sceneUniqueResourcesByKindMap =
        this._getResourcesByKindOnlyUsedInUnloadedScene({
          unloadedSceneName,
          newSceneName,
        });

      for (const [kindResourceManager, resourceManager] of this
        ._resourceManagersMap) {
        const resources =
          sceneUniqueResourcesByKindMap.get(kindResourceManager);
        if (resources) {
          debugLogger.log(
            `Unloading of resources of kind ${kindResourceManager} for scene ${unloadedSceneName}: `,
            resources.map((resource) => resource.name).join(', ')
          );
          for (const resource of resources) {
            resourceManager.unloadResource(resource);
          }
        }
      }

      debugLogger.log(
        `Unloading of resources for scene ${unloadedSceneName} finished.`
      );

      const sceneState = this._sceneLoadingStates.get(unloadedSceneName);
      if (sceneState) {
        sceneState.status = 'not-loaded';
      }
      // TODO: mark the scene as unloaded so it's not automatically loaded again eagerly.
    }

    /**
     * To be called when hot-reloading resources.
     */
    unloadAllResources(): void {
      debugLogger.log(`Unloading of all resources was requested.`);
      for (const resource of this._resources.values()) {
        const resourceManager = this._resourceManagersMap.get(resource.kind);
        if (resourceManager) {
          resourceManager.unloadResource(resource);
        }
      }
      for (const sceneLoadingState of this._sceneLoadingStates.values()) {
        sceneLoadingState.status = 'not-loaded';
      }
      debugLogger.log(`Unloading of all resources finished.`);
    }

    /**
     * Put a given scene at the end of the queue.
     *
     * When the scene that is currently loading in background is done,
     * this scene will be the next to be loaded.
     */
    private _prioritizeScene(sceneName: string): SceneLoadingTask | null {
      const sceneState = this._sceneLoadingStates.get(sceneName);
      if (!sceneState) return null;
      if (sceneState.status === 'loaded' || sceneState.status === 'ready') {
        debugLogger.log(
          `Scene ${sceneName} is already loaded. Skipping prioritization.`
        );

        // The scene is already loaded, nothing to do.
        return null;
      }

      // The scene is not loaded: either prioritize it or add it to the loading queue.
      const taskIndex = this._sceneToLoadQueue.findIndex(
        (task) => task.sceneName === sceneName
      );
      let task: SceneLoadingTask;
      if (taskIndex !== -1) {
        // There is already a task for this scene in the queue.
        // Move it so that it's loaded first.
        task = this._sceneToLoadQueue[taskIndex];
        this._sceneToLoadQueue.splice(taskIndex, 1);
        this._sceneToLoadQueue.push(task);
      } else {
        // There is no task for this scene in the queue.
        // It might be because the scene was unloaded or never loaded.
        // In this case, we need to add a new task to the queue.
        task = new SceneLoadingTask(sceneName);
        this._sceneToLoadQueue.push(task);
      }

      // Re-start the loading process in the background. While at the beginning of the game
      // it's not needed because already launched, a scene might be unloaded. This means
      // that we then need to relaunch the loading process.
      this.loadAllSceneInBackground();

      return task;
    }

    private async _processResource(resource: ResourceData): Promise<void> {
      const resourceManager = this._resourceManagersMap.get(resource.kind);
      if (!resourceManager) {
        logger.warn(
          'Unknown resource kind: "' +
            resource.kind +
            '" for: "' +
            resource.name +
            '".'
        );
        return;
      }
      await resourceManager.processResource(resource.name);
    }

    getSceneLoadingProgress(sceneName: string): float {
      return sceneName === this.currentLoadingSceneName
        ? this.currentSceneLoadingProgress
        : this.areSceneAssetsLoaded(sceneName)
          ? 1
          : 0;
    }

    /**
     * @returns true when all the resources of the given scene are loaded
     * (but maybe not parsed).
     */
    areSceneAssetsLoaded(sceneName: string): boolean {
      const sceneState = this._sceneLoadingStates.get(sceneName);
      if (!sceneState) return false;

      return sceneState.status === 'loaded' || sceneState.status === 'ready';
    }

    /**
     * @returns true when all the resources of the given scene are loaded and
     * parsed.
     */
    areSceneAssetsReady(sceneName: string): boolean {
      const sceneState = this._sceneLoadingStates.get(sceneName);
      if (!sceneState) return false;

      return sceneState.status === 'ready';
    }

    getResource(resourceName: string): ResourceData | null {
      return this._resources.get(resourceName) || null;
    }

    // Helper methods used when resources are loaded from an URL.

    /**
     * Complete the given URL with any specific parameter required to access
     * the resource (this can be for example a token needed to access the resource).
     */
    getFullUrl(url: string) {
      if (this._runtimeGame.isInGameEdition()) {
        // Avoid adding cache burst to URLs which are assumed to be immutable files,
        // to avoid costly useless requests each time the game is hot-reloaded.
        if (url.startsWith('file://')) {
          url = addSearchParameterToUrl(url, 'cache', '' + Date.now());
        }
      }
      const { gdevelopResourceToken } = this._runtimeGame._options;
      if (!gdevelopResourceToken) return url;

      if (!checkIfIsGDevelopCloudBucketUrl(url)) return url;

      return addSearchParameterToUrl(
        url,
        'gd_resource_token',
        encodeURIComponent(gdevelopResourceToken)
      );
    }

    /**
     * Return true if the specified URL must be loaded with cookies ("credentials")
     * sent to grant access to them.
     */
    checkIfCredentialsRequired(url: string) {
      if (this._runtimeGame._options.gdevelopResourceToken) return false;

      // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
      // i.e: its gdevelop.io cookie, to be passed.
      // Note that this is only useful during previews.
      if (checkIfIsGDevelopCloudBucketUrl(url)) return true;

      // For other resources, use the default way of loading resources ("anonymous" or "same-site").
      return false;
    }

    /**
     * Get the gdjs.SoundManager of the RuntimeGame.
     * @return The sound manager.
     */
    getSoundManager(): gdjs.HowlerSoundManager {
      return this._soundManager;
    }

    /**
     * Get the gdjs.ImageManager of the RuntimeGame.
     * @return The image manager.
     */
    getImageManager(): gdjs.PixiImageManager {
      return this._imageManager;
    }

    /**
     * Get the gdjs.FontManager of the RuntimeGame.
     * @return The font manager.
     */
    getFontManager(): gdjs.FontFaceObserverFontManager {
      return this._fontManager;
    }

    /**
     * Get the gdjs.BitmapFontManager of the RuntimeGame.
     * @return The bitmap font manager.
     */
    getBitmapFontManager(): gdjs.BitmapFontManager {
      return this._bitmapFontManager;
    }

    /**
     * Get the JSON manager of the game, used to load JSON from game
     * resources.
     * @return The json manager for the game
     */
    getJsonManager(): gdjs.JsonManager {
      return this._jsonManager;
    }

    /**
     * Get the 3D model manager of the game, used to load 3D model from game
     * resources.
     * @return The 3D model manager for the game
     */
    getModel3DManager(): gdjs.Model3DManager {
      return this._model3DManager;
    }

    /**
     * Get the Spine manager of the game, used to load and construct spine skeletons from game
     * resources.
     * @return The Spine manager for the game
     */
    getSpineManager(): gdjs.SpineManager | null {
      return this._spineManager;
    }

    /**
     * Get the Spine Atlas manager of the game, used to load atlases from game
     * resources.
     * @return The Spine Atlas manager for the game
     */
    getSpineAtlasManager(): gdjs.SpineAtlasManager | null {
      return this._spineAtlasManager;
    }

    injectMockResourceManagerForTesting(
      resourceKind: ResourceKind,
      resourceManager: ResourceManager
    ) {
      this._resourceManagersMap.set(resourceKind, resourceManager);
    }

    /**
     * Get the map of resources that are only used in the scene that is being unloaded,
     * and that are not used in any other loaded scene (or the scene that is coming next).
     */
    private _getResourcesByKindOnlyUsedInUnloadedScene({
      unloadedSceneName,
      newSceneName,
    }: {
      unloadedSceneName: string;
      newSceneName: string | null;
    }): Map<ResourceKind, ResourceData[]> {
      const unloadedSceneState =
        this._sceneLoadingStates.get(unloadedSceneName);
      if (!unloadedSceneState) {
        return new Map<ResourceKind, ResourceData[]>();
      }

      // Construct the set of all resources to unload. These are the resources
      // used in the scene that is being unloaded minus all the resources used
      // by the other scenes that are loaded (and the possible scene that is coming next).
      const resourceNamesToUnload = new Set<string>(
        unloadedSceneState.resourceNames
      );
      for (const [
        sceneName,
        sceneState,
      ] of this._sceneLoadingStates.entries()) {
        if (sceneName === unloadedSceneName) continue;

        if (
          sceneName === newSceneName ||
          sceneState.status === 'loaded' ||
          sceneState.status === 'ready'
        ) {
          sceneState.resourceNames.forEach((resourceName) => {
            resourceNamesToUnload.delete(resourceName);
          });
        }
      }

      const result = new Map<ResourceKind, ResourceData[]>();
      resourceNamesToUnload.forEach((resourceName) => {
        const resourceData = this._resources.get(resourceName);
        if (!resourceData) return;

        const kind = resourceData.kind;
        const resources = result.get(kind);
        if (resources) {
          resources.push(resourceData);
        } else {
          result.set(kind, [resourceData]);
        }
      });

      return result;
    }
  }

  type PromiseError<T> = { item: T; error: Error };

  type PromisePoolOutput<T, U> = {
    results: Array<U>;
    errors: Array<PromiseError<T>>;
  };

  const processWithPromisePool = <T, U>(
    items: Array<T>,
    maxConcurrency: number,
    asyncFunction: (item: T) => Promise<U>
  ): Promise<PromisePoolOutput<T, U>> => {
    const results: Array<U> = [];
    const errors: Array<PromiseError<T>> = [];
    let activePromises = 0;
    let index = 0;

    return new Promise((resolve, reject) => {
      const executeNext = () => {
        if (items.length === 0) {
          resolve({ results, errors });
          return;
        }
        while (activePromises < maxConcurrency && index < items.length) {
          const item = items[index++];
          activePromises++;

          asyncFunction(item)
            .then((result) => results.push(result))
            .catch((error) => errors.push({ item, error }))
            .finally(() => {
              activePromises--;
              if (index === items.length && activePromises === 0) {
                resolve({ results, errors });
              } else {
                executeNext();
              }
            });
        }
      };

      executeNext();
    });
  };

  const processAndRetryIfNeededWithPromisePool = async <T, U>(
    items: Array<T>,
    maxConcurrency: number,
    maxAttempt: number,
    asyncFunction: (item: T) => Promise<U>
  ): Promise<PromisePoolOutput<T, U>> => {
    const output = await processWithPromisePool<T, U>(
      items,
      maxConcurrency,
      asyncFunction
    );
    if (output.errors.length !== 0) {
      logger.warn("Some assets couldn't be downloaded. Trying again now.");
    }
    for (
      let attempt = 1;
      attempt < maxAttempt && output.errors.length !== 0;
      attempt++
    ) {
      const retryOutput = await processWithPromisePool<T, U>(
        items,
        maxConcurrency,
        asyncFunction
      );
      output.results.push.apply(output.results, retryOutput.results);
      output.errors = retryOutput.errors;
    }
    return output;
  };
}
