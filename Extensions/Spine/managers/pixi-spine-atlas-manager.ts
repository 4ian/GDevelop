/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const atlasKinds: ResourceKind[] = ['atlas'];

  /**
   * SpineAtlasManager loads `.atlas` files via the official `@esotericsoftware/spine-pixi-v7`
   * Pixi atlas loader, sharing texture pages with the engine's ImageManager.
   *
   * The loader is auto-registered by the `spine-pixi-v7` IIFE bundle. We simply prepare
   * the asset metadata (`data.images`) so that PIXI.Assets binds atlas pages to the
   * already-loaded base textures instead of fetching them again.
   *
   * @category Resources > Spine
   */
  export class SpineAtlasManager implements gdjs.ResourceManager {
    private _imageManager: ImageManager;
    private _resourceLoader: ResourceLoader;
    private _loadedSpineAtlases = new gdjs.ResourceCache<spine.TextureAtlas>();
    private _loadingSpineAtlases = new gdjs.ResourceCache<
      Promise<spine.TextureAtlas>
    >();

    /**
     * @param resourceLoader The resources loader of the game.
     * @param imageManager The image manager of the game.
     */
    constructor(
      resourceLoader: gdjs.ResourceLoader,
      imageManager: ImageManager
    ) {
      this._resourceLoader = resourceLoader;
      this._imageManager = imageManager;
    }

    getResourceKinds(): ResourceKind[] {
      return atlasKinds;
    }

    async processResource(_resourceName: string): Promise<void> {
      // The spine-pixi-v7 atlas loader parses the resource itself.
    }

    async loadResource(resourceName: string): Promise<void> {
      await this.getOrLoad(resourceName);
    }

    /**
     * Returns a cached promise resolving to the loaded atlas, loading it if needed.
     */
    getOrLoad(resourceName: string): Promise<spine.TextureAtlas> {
      const resource = this._getAtlasResource(resourceName);
      if (!resource) {
        return Promise.reject(
          new Error(`Unable to find atlas for resource '${resourceName}'.`)
        );
      }

      const cachedAtlas = this._loadedSpineAtlases.get(resource);
      if (cachedAtlas) {
        return Promise.resolve(cachedAtlas);
      }

      const inflight = this._loadingSpineAtlases.get(resource);
      if (inflight) {
        return inflight;
      }

      const loadingPromise = this._load(resource).then((atlas) => {
        this._loadedSpineAtlases.set(resource, atlas);
        return atlas;
      });
      this._loadingSpineAtlases.set(resource, loadingPromise);
      return loadingPromise;
    }

    private async _load(resource: ResourceData): Promise<spine.TextureAtlas> {
      const game = this._resourceLoader.getRuntimeGame();
      const embeddedResourcesNames = game.getEmbeddedResourcesNames(
        resource.name
      );

      if (!embeddedResourcesNames.length) {
        throw new Error(`${resource.name} does not have image metadata!`);
      }

      const images = embeddedResourcesNames.reduce<{
        [key: string]: PIXI.BaseTexture;
      }>((imagesMap, embeddedResourceName) => {
        const mappedResourceName = game.resolveEmbeddedResource(
          resource.name,
          embeddedResourceName
        );
        // The v7 atlas loader expects BaseTexture instances when sharing pages
        // with already-loaded textures.
        imagesMap[embeddedResourceName] =
          this._imageManager.getOrLoadPIXITexture(
            mappedResourceName
          ).baseTexture;
        return imagesMap;
      }, {});

      const url = this._resourceLoader.getFullUrl(resource.file);
      const alias = url;

      PIXI.Assets.setPreferences({
        preferWorkers: false,
        crossOrigin: this._resourceLoader.checkIfCredentialsRequired(url)
          ? 'use-credentials'
          : 'anonymous',
      });
      PIXI.Assets.add({ alias, src: url, data: { images } });
      const atlas = await PIXI.Assets.load<spine.TextureAtlas>(alias);

      // The spine-pixi-v7 tint shader always samples atlas textures as if they
      // were premultiplied (see the runtime comment in `renderMeshes`). When the
      // spine loader loads the atlas pages itself, it sets each page texture's
      // alpha mode accordingly (`PMA` for premultiplied atlases, `UNPACK`
      // otherwise). Here we instead share the textures already loaded by the
      // ImageManager, which are uploaded to the GPU with PIXI's default `UNPACK`
      // mode (premultiply-on-upload). For atlases exported with premultiplied
      // alpha (`pma: true`), this premultiplies the texture a second time, which
      // produces dark fringes/halos ("shadows") around the rendered parts.
      // Align each shared texture's alpha mode with what the atlas page declares.
      const imageNames = Object.keys(images);
      for (const page of atlas.pages) {
        const baseTexture =
          images[page.name] ||
          (atlas.pages.length === 1 && imageNames.length === 1
            ? images[imageNames[0]]
            : undefined);
        if (!baseTexture) continue;

        const expectedAlphaMode = page.pma
          ? PIXI.ALPHA_MODES.PMA
          : PIXI.ALPHA_MODES.UNPACK;
        if (baseTexture.alphaMode !== expectedAlphaMode) {
          baseTexture.alphaMode = expectedAlphaMode;
          // Force a re-upload to the GPU so the new alpha mode takes effect.
          baseTexture.update();
        }
      }

      return atlas;
    }

    /**
     * Check if the given atlas resource was loaded.
     * @param resourceName The name of the atlas resource.
     */
    isLoaded(resourceName: string): boolean {
      return !!this._loadedSpineAtlases.getFromName(resourceName);
    }

    /**
     * Returns the alias used to register the atlas in PIXI.Assets,
     * or null if the resource is not loaded.
     */
    getAtlasAlias(resourceName: string): string | null {
      const resource = this._getAtlasResource(resourceName);
      if (!resource) return null;
      return this._loadedSpineAtlases.get(resource)
        ? this._resourceLoader.getFullUrl(resource.file)
        : null;
    }

    /**
     * Returns the loaded TextureAtlas for the given resource, if available.
     */
    getAtlasTexture(resourceName: string): spine.TextureAtlas | null {
      return this._loadedSpineAtlases.getFromName(resourceName);
    }

    private _getAtlasResource(resourceName: string): ResourceData | null {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    }

    /**
     * To be called when the game is disposed.
     */
    dispose(): void {
      this._loadedSpineAtlases.clear();
      this._loadingSpineAtlases.clear();
    }

    unloadResource(resourceData: ResourceData): void {
      const resource = this._getAtlasResource(resourceData.name);
      // PIXI.Assets.unload disposes the TextureAtlas and clears the cache entry,
      // preventing a stale atlas from being reused on the next load.
      if (resource) {
        const alias = this._resourceLoader.getFullUrl(resource.file);
        PIXI.Assets.unload(alias).catch(() => {});
      }

      this._loadedSpineAtlases.delete(resourceData);
      this._loadingSpineAtlases.delete(resourceData);
    }
  }
}
