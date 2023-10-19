/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('ResourceLoader');

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

  /**
   * A task of pre-loading resources used by a layout.
   *
   * A Promise can't be used instead of this class because a Promise will start
   * as soon as possible. It would flood the server with downloading requests
   * and make impossible to finely tune in which order layouts are actually
   * downloaded.
   */
  class LayoutLoadingTask {
    layoutName: string;
    private onProgressCallbacks: Array<(count: number, total: number) => void>;
    private onFinishCallbacks: Array<() => void>;
    private isFinished = false;

    constructor(layoutName: string) {
      this.layoutName = layoutName;
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
      console.log('onFinish: ' + this.layoutName);
      this.isFinished = true;
      for (const onFinish of this.onFinishCallbacks) {
        onFinish();
      }
    }
  }

  /**
   * Pre-load resources of any kind needed for a game or a layout.
   */
  export class ResourceLoader {
    _runtimeGame: RuntimeGame;
    /**
     * All the resource of a game by resource name.
     */
    private _resources: Map<string, ResourceData>;
    /**
     * Resources needed for any layout. Typically, they are resources from
     * global objects.
     */
    private _globalResources: Array<string>;
    /**
     * Resources by layout names.
     */
    private _layoutResources: Map<string, Array<string>>;
    // TODO empty them instead of filling them.
    /**
     * Keep track of which layout whose resources has already be pre-loaded.
     */
    private _loadedLayoutNames: Set<string> = new Set<string>();
    /**
     * Keep track of which layout whose resources has already be loaded.
     */
    private _readyLayoutNames: Set<string> = new Set<string>();
    /**
     * A queue of layouts whose resources are still to be pre-loaded.
     */
    private _layoutToLoadQueue: Array<LayoutLoadingTask> = new Array<
      LayoutLoadingTask
    >();
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

    /**
     * Only used by events.
     */
    private currentLayoutLoadingName: string = '';
    /**
     * Only used by events.
     */
    private currentLayoutLoadingProgress: float = 0;

    /**
     * @param runtimeGame The game.
     * @param resourceDataArray The resources data of the game.
     * @param globalResources The resources needed for any layer.
     * @param layoutDataArray The resources used by each layer.
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
      this._layoutResources = new Map<string, Array<string>>();
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

      const resourceManagers: Array<ResourceManager> = [
        this._imageManager,
        this._soundManager,
        this._fontManager,
        this._jsonManager,
        this._bitmapFontManager,
        this._model3DManager,
      ];
      this._resourceManagersMap = new Map<ResourceKind, ResourceManager>();
      for (const resourceManager of resourceManagers) {
        for (const resourceKind of resourceManager.getResourceKinds()) {
          this._resourceManagersMap.set(resourceKind, resourceManager);
        }
      }
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

      this._layoutResources.clear();
      for (const layoutData of layoutDataArray) {
        this._layoutResources.set(
          layoutData.name,
          layoutData.usedResources.map((resource) => resource.name)
        );
      }
      this._layoutToLoadQueue.length = 0;
      for (let index = layoutDataArray.length - 1; index >= 0; index--) {
        const layoutData = layoutDataArray[index];
        this._layoutToLoadQueue.push(new LayoutLoadingTask(layoutData.name));
      }

      this._resources.clear();
      for (const resourceData of resourceDataArray) {
        this._resources.set(resourceData.name, resourceData);
      }
    }

    async loadAllResources(
      onProgress: (loadingCount: integer, totalCount: integer) => void
    ): Promise<void> {
      let loadedCount = 0;
      await Promise.all(
        [...this._resources.values()].map(async (resource) => {
          await this._loadResource(resource);
          await this._processResource(resource);
          loadedCount++;
          onProgress(loadedCount, this._resources.size);
        })
      );
      this._loadedLayoutNames = new Set(this._layoutResources.keys());
      this._readyLayoutNames = new Set(this._layoutResources.keys());
    }

    /**
     * Pre-load the resources that are needed to launch the first layout.
     */
    async loadGlobalAndFirstLayoutResources(
      firstSceneName: string,
      onProgress: (count: number, total: number) => void
    ): Promise<void> {
      const layoutResources = this._layoutResources.get(firstSceneName);
      if (!layoutResources) {
        logger.warn(
          'Can\'t load resource for unknown layout: "' + firstSceneName + '".'
        );
        return;
      }
      let loadedCount = 0;
      const resources = [...this._globalResources, ...layoutResources.values()];
      await Promise.all(
        resources.map(async (resourceName) => {
          const resource = this._resources.get(resourceName);
          if (!resource) {
            logger.warn('Unable to find resource "' + resourceName + '".');
            return;
          }
          await this._loadResource(resource);
          await this._processResource(resource);
          loadedCount++;
          onProgress(loadedCount, resources.length);
        })
      );
      this._loadedLayoutNames.add(firstSceneName);
      this._readyLayoutNames.add(firstSceneName);
      console.log('loadGlobalAndFirstLayoutResources done: ' + firstSceneName);
    }

    /**
     * Pre-load each layout in order.
     *
     * This is done in background to try to avoid loading screens when changing
     * layouts.
     */
    async loadAllLayoutInBackground(): Promise<void> {
      while (this._layoutToLoadQueue.length > 0) {
        const task = this._layoutToLoadQueue[
          this._layoutToLoadQueue.length - 1
        ];
        if (task === undefined) {
          continue;
        }
        this.currentLayoutLoadingName = task.layoutName;
        if (!this.isLayoutAssetsLoaded(task.layoutName)) {
          await this._doLoadLayoutResources(
            task.layoutName,
            async (count, total) => task.onProgress(count, total)
          );
          // A layer may have been moved last while awaiting resources to be
          // downloaded (see _prioritizeLayout).
          this._layoutToLoadQueue.splice(
            this._layoutToLoadQueue.findIndex((element) => element === task),
            1
          );
          task.onFinish();
        } else {
          this._layoutToLoadQueue.pop();
        }
      }
      this.currentLayoutLoadingName = '';
      console.log('Done loading all layout in background');
    }

    /**
     * Load a scene that is needed right away.
     *
     * The renderer will show a loading screen while its done.
     */
    async loadLayoutResources(
      layoutName: string,
      onProgress?: (count: number, total: number) => void
    ): Promise<void> {
      const task = this._prioritizeLayout(layoutName);
      return new Promise<void>((resolve, reject) => {
        if (!task) {
          console.log('Already downloaded layout: ' + layoutName);
          resolve();
          return;
        }
        console.log('Register task callback for: ' + layoutName);
        task.registerCallback(() => {
          console.log('Downloaded layout: ' + layoutName);
          resolve();
        }, onProgress);
      });
    }

    /**
     * Load and process a scene that is needed right away.
     *
     * The renderer will show a loading screen while its done.
     */
    async loadAndProcessLayoutResources(
      layoutName: string,
      onProgress?: (count: number, total: number) => Promise<void>
    ): Promise<void> {
      if (this._readyLayoutNames.has(layoutName)) {
        return;
      }
      await this.loadLayoutResources(layoutName, onProgress);

      const layoutResources = this._layoutResources.get(layoutName);
      if (!layoutResources) {
        logger.warn(
          'Can\'t load resource for unknown layout: "' + layoutName + '".'
        );
        return;
      }

      let parsedCount = 0;
      for (const resourceName of layoutResources) {
        const resource = this._resources.get(resourceName);
        if (!resource) {
          logger.warn('Unable to find resource "' + resourceName + '".');
          continue;
        }
        await this._processResource(resource);
        parsedCount++;
        onProgress && (await onProgress(parsedCount, layoutResources.length));
      }
      this._readyLayoutNames.add(layoutName);
    }

    /**
     * Put a given layout at the end of the queue.
     *
     * When the layout that is currently pre-loading in background is done,
     * this layout will be the next to be pre-loaded.
     */
    private _prioritizeLayout(layoutName: string): LayoutLoadingTask | null {
      console.log('Prioritize layout: ' + layoutName);
      const taskIndex = this._layoutToLoadQueue.findIndex(
        (task) => task.layoutName === layoutName
      );
      if (taskIndex < 0) {
        // The layout is already loaded.
        return null;
      }
      const task = this._layoutToLoadQueue[taskIndex];
      this._layoutToLoadQueue.splice(taskIndex, 1);
      this._layoutToLoadQueue.push(task);
      return task;
    }

    private async _doLoadLayoutResources(
      layoutName: string,
      onProgress?: (count: number, total: number) => Promise<void>
    ): Promise<void> {
      console.log('------- Scene: ' + layoutName);
      const layoutResources = this._layoutResources.get(layoutName);
      if (!layoutResources) {
        logger.warn(
          'Can\'t load resource for unknown layout: "' + layoutName + '".'
        );
        return;
      }
      let loadedCount = 0;
      await Promise.all(
        [...layoutResources.values()].map(async (resource) => {
          await this.loadResource(resource);
          loadedCount++;
          this.currentLayoutLoadingProgress =
            loadedCount / this._resources.size;
          onProgress && (await onProgress(loadedCount, this._resources.size));
        })
      );
      this._loadedLayoutNames.add(layoutName);
      console.log('Done: ' + layoutName);
    }

    getLayoutLoadingProgress(layoutName: string): float {
      return layoutName === this.currentLayoutLoadingName
        ? this.currentLayoutLoadingProgress
        : this.isLayoutAssetsLoaded(layoutName)
        ? 1
        : 0;
    }

    isLayoutAssetsLoaded(layoutName: string): boolean {
      return this._loadedLayoutNames.has(layoutName);
    }

    areLayoutAssetsReady(layoutName: string): boolean {
      return this._readyLayoutNames.has(layoutName);
    }

    /**
     * Load the specified resources.
     */
    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resources.get(resourceName);
      if (!resource) {
        logger.warn('Unable to find resource "' + resourceName + '".');
        return;
      }
      await this._loadResource(resource);
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
      console.log('Load: ' + resource.name);
      await resourceManager.loadResource(resource.name);
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

    getResource(resourceName: string): ResourceData | null {
      return this._resources.get(resourceName) || null;
    }

    // Helper methods used when resources are loaded from an URL.

    /**
     * Complete the given URL with any specific parameter required to access
     * the resource (this can be for example a token needed to access the resource).
     */
    getFullUrl(url: string) {
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
  }
}
