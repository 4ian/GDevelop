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
      this.isFinished = true;
      for (const onFinish of this.onFinishCallbacks) {
        onFinish();
      }
    }
  }

  /**
   * Gives helper methods used when resources are loaded from an URL.
   */
  /**
   * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
   */
  export class ResourceLoader {
    _runtimeGame: RuntimeGame;
    private _resources: Map<string, ResourceData>;
    private _globalResources: Array<string>;
    private _layoutResources: Map<string, Array<string>>;
    private _loadedLayoutNames: Set<string> = new Set<string>();
    private _layoutToLoadQueue: Array<LayoutLoadingTask> = new Array<
      LayoutLoadingTask
    >();

    private _resourceManagersMap: Map<ResourceKind, ResourceManager>;
    private _imageManager: ImageManager;
    private _soundManager: SoundManager;
    private _fontManager: FontManager;
    private _jsonManager: JsonManager;
    private _model3DManager: Model3DManager;
    private _bitmapFontManager: BitmapFontManager;

    /**
     * @param resources The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
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

      const resourceManagers = [
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
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resources The resources data of the game.
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
          this._loadResource(resource);
          loadedCount++;
          onProgress(loadedCount, this._resources.size);
        })
      );
    }

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
        resources.map(async (resource) => {
          await this.loadResource(resource);
          loadedCount++;
          onProgress(loadedCount, resources.length);
        })
      );
      this._loadedLayoutNames.add(firstSceneName);
    }

    async loadAllLayoutInBackground(firstSceneName: string): Promise<void> {
      while (this._layoutToLoadQueue.length > 0) {
        const task = this._layoutToLoadQueue.pop();
        if (task === undefined) {
          continue;
        }
        if (!this.isLayoutAssetsLoaded(task.layoutName)) {
          await this._doLoadLayoutResources(task.layoutName, (count, total) =>
            task.onProgress(count, total)
          );
          task.onFinish();
        }
      }
    }

    loadLayoutResources(
      layoutName: string,
      onProgress?: (count: number, total: number) => void
    ): Promise<void> {
      const task = this._prioritizeLayout(layoutName);
      return new Promise((resolve, reject) => {
        if (!task) {
          resolve();
          return;
        }
        task.registerCallback(() => {
          resolve();
        }, onProgress);
      });
    }

    private _prioritizeLayout(layoutName: string): LayoutLoadingTask | null {
      const taskIndex = this._layoutToLoadQueue.findIndex(
        (task) => task.layoutName === layoutName
      );
      if (taskIndex < 0) {
        return null;
      }
      const task = this._layoutToLoadQueue[taskIndex];
      this._layoutToLoadQueue.splice(
        this._layoutToLoadQueue.findIndex(
          (task) => task.layoutName === layoutName
        )
      );
      this._layoutToLoadQueue.push(task);
      return task;
    }

    private async _doLoadLayoutResources(
      layoutName: string,
      onProgress?: (count: number, total: number) => void
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
          this.loadResource(resource);
          loadedCount++;
          onProgress && onProgress(loadedCount, this._resources.size);
        })
      );
      this._loadedLayoutNames.add(layoutName);
    }

    isLayoutAssetsLoaded(layoutName: string): boolean {
      return this._loadedLayoutNames.has(layoutName);
    }

    /**
     * Load the specified resources, so that textures are loaded and can then be
     * used by calling `getPIXITexture`.
     */
    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resources.get(resourceName);
      if (!resource) {
        logger.warn('Unable to find resource "' + resourceName + '".');
        return;
      }
      return this._loadResource(resource);
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
      return resourceManager.loadResource(resource.name);
    }

    getResource(resourceName: string): ResourceData | null {
      return this._resources.get(resourceName) || null;
    }

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
