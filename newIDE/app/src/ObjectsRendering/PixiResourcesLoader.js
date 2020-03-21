// @flow
import slugs from 'slugs';
import * as PIXI from 'pixi.js-legacy';
import ResourcesLoader from '../ResourcesLoader';
import { loadFontFace } from '../Utils/FontFaceLoader';
const gd: libGDevelop = global.gd;

const loadedFontFamilies = {};
const loadedTextures = {};
const invalidTexture = PIXI.Texture.from('res/error48.png');
const loadedTilesets = {};

/**
 * Expose functions to load PIXI textures or fonts, given the names of
 * resources and a gd.Project.
 *
 * This internally uses ResourcesLoader to get the URL of the resources.
 */
export default class PixiResourcesLoader {
  static _initializeTexture(resource: gdResource, texture: any) {
    if (resource.getKind() !== 'image') return;

    const imageResource = gd.asImageResource(resource);
    if (!imageResource.isSmooth()) {
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
  }

  /**
   * (Re)load the PIXI texture represented by the given resources.
   */
  static loadTextures(
    project: gdProject,
    resourceNames: Array<string>,
    onProgress: (number, number) => void,
    onComplete: () => void
  ) {
    const resourcesManager = project.getResourcesManager();
    const loader = PIXI.Loader.shared;
    loader.reset();

    const allResources = {};
    resourceNames.forEach(resourceName => {
      const resource = resourcesManager.getResource(resourceName);
      const filename = ResourcesLoader.getResourceFullUrl(
        project,
        resourceName
      );
      loader.add(resourceName, filename);
      allResources[resourceName] = resource;
    });

    const totalCount = resourceNames.length;
    if (!totalCount) {
      onComplete();
      return;
    }

    let loadingCount = 0;
    const progressCallbackId = loader.onProgress.add(function() {
      loadingCount++;
      onProgress(loadingCount, totalCount);
    });

    loader.load((loader, loadedResources) => {
      loader.onProgress.detach(progressCallbackId);

      //Store the loaded textures so that they are ready to use.
      for (const resourceName in loadedResources) {
        if (loadedResources.hasOwnProperty(resourceName)) {
          const resource = resourcesManager.getResource(resourceName);
          if (resource.getKind() !== 'image') continue;

          loadedTextures[resourceName] = loadedResources[resourceName].texture;
          PixiResourcesLoader._initializeTexture(
            resource,
            loadedTextures[resourceName]
          );
        }
      }

      onComplete();
    });
  }

  /**
   * Return the PIXI texture represented by the given resource.
   * If not loaded, it will load it.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  static getPIXITexture(project: gdProject, resourceName: string) {
    if (loadedTextures[resourceName]) {
      return loadedTextures[resourceName];
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return invalidTexture;

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'image') return invalidTexture;

    loadedTextures[resourceName] = PIXI.Texture.from(
      ResourcesLoader.getResourceFullUrl(project, resourceName)
    );

    PixiResourcesLoader._initializeTexture(
      resource,
      loadedTextures[resourceName]
    );
    return loadedTextures[resourceName];
  }

  /**
   * Return the PIXI video texture represented by the given resource.
   * If not loaded, it will load it.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  static getPIXIVideoTexture(project: gdProject, resourceName: string) {
    if (loadedTextures[resourceName]) {
      return loadedTextures[resourceName];
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return invalidTexture;

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'video') return invalidTexture;

    loadedTextures[resourceName] = PIXI.Texture.from(
      ResourcesLoader.getResourceFullUrl(
        project,
        resourceName,
        true /* Disable cache bursting for video because it prevent the video to be recognized as such? */
      ),
      {
        scaleMode: PIXI.SCALE_MODES.LINEAR,
        resourceOptions: {
          autoPlay: false,
        },
      }
    );

    return loadedTextures[resourceName];
  }

  static getPIXITileSet(
    project: gdProject,
    imageResourceName: string,
    jsonResourceName: string,
    onLoad: () => any
  ) {
    const texture = this.getPIXITexture(project, imageResourceName);
    // console.log(project.getJsonManager())
    class TileSet {
      constructor({ tiled, texture, offset }) {
        const tileset = tiled.tilesets[0];
        const { tileheight, tilewidth, tilecount, tiles } = tileset;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        this.offset = offset || 0;
        this.texture = texture;
        this.textureCache = [];
        this.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.layers = tiled.layers;
        this.tiles = tiles;
        this.prepareTextures(tilecount);
      }
      get width() {
        return this.texture.width;
      }
      get height() {
        return this.texture.height;
      }
      prepareTextures(count) {
        var size =
          count ||
          (this.width / this.tilewidth) * (this.height / this.tileheight);

        this.textureCache = new Array(size)
          .fill(0)
          .map((_, frame) => this.prepareTexture(frame));
      }
      prepareTexture(frame) {
        var cols = Math.floor(this.width / this.tilewidth);
        var x = ((frame - this.offset) % cols) * this.tilewidth;
        var y = Math.floor((frame - this.offset) / cols) * this.tileheight;
        var rect = new PIXI.Rectangle(x, y, this.tilewidth, this.tileheight);
        var texture = new PIXI.Texture(this.texture, rect);

        texture.baseTexture.scaleMode = this.scaleMode;
        texture.cacheAsBitmap = true;

        return texture;
      }
      getFrame(frame) {
        if (!this.textureCache[frame]) {
          this.prepareTexture(frame);
        }

        return this.textureCache[frame];
      }
    }

    ResourcesLoader.getResourceJsonData(project, jsonResourceName).then(
      tiled => {
        console.log(tiled);

        const TILESET = new TileSet({
          texture,
          offset: 1,
          tiled,
        });

        console.log('>>>', TILESET);
        onLoad(TILESET);
        // return TILESET;
      }
    );
  }

  static updatePIXITileMap(tileSet: any, tileMap: any) {
    if (!tileMap || !tileSet) return;
    console.log('RELOADING', tileSet, tileMap);
    tileSet.layers.forEach(layer => {
      if (!layer.visible) return;
      if (layer.type === 'objectgroup') {
        layer.objects.forEach(object => {
          var { gid, id, width, height, x, y, visible } = object;
          if (visible === false) return;
          if (tileSet.getFrame(gid)) {
            tileMap.addFrame(tileSet.getFrame(gid), x, y - tileSet.tileheight);
          }
        });
      } else if (layer.type === 'tilelayer') {
        var ind = 0;
        for (var i = 0; i < layer.height; i++) {
          for (var j = 0; j < layer.width; j++) {
            var xPos = tileSet.tilewidth * j;
            var yPos = tileSet.tileheight * i;

            var tileUid = layer.data[ind];

            if (tileUid !== 0) {
              var tileData = tileSet.tiles.find(
                tile => tile.id === tileUid - 1
              );

              // Animated tiles have a limitation with only being able to use frames arranged one to each other on the image resource
              if (tileData && tileData.animation) {
                tileMap
                  .addFrame(tileSet.getFrame(tileUid), xPos, yPos)
                  .tileAnimX(tileSet.tilewidth, tileData.animation.length);
              } else {
                // Non animated props dont require tileAnimX or Y
                tileMap.addFrame(tileSet.getFrame(tileUid), xPos, yPos);
              }
            }

            ind += 1;
          }
        }
      }
    });
  }

  /**
   * Load the given font from its url/filename.
   * @returns a Promise that resolves with the font-family to be used
   * to render a text with the font.
   */
  static loadFontFamily(
    project: gdProject,
    resourceName: string
  ): Promise<string> {
    // Avoid reloading a font if it's already cached
    if (loadedFontFamilies[resourceName]) {
      return Promise.resolve(loadedFontFamilies[resourceName]);
    }

    const fontFamily = slugs(resourceName);
    let fullFilename = null;
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resource = project.getResourcesManager().getResource(resourceName);
      if (resource.getKind() === 'font') {
        fullFilename = ResourcesLoader.getResourceFullUrl(
          project,
          resourceName
        );
      }
    } else {
      // Compatibility with GD <= 5.0-beta56
      // Assume resourceName is just the filename to the font
      fullFilename = ResourcesLoader.getFullUrl(project, resourceName);
      // end of compatibility code
    }

    if (!fullFilename) {
      // If no resource is found/resource is not a font, default to Arial,
      // as done by the game engine too.
      return Promise.resolve('Arial');
    }

    return loadFontFace(fontFamily, `url("${fullFilename}")`, {}).then(
      loadedFace => {
        loadedFontFamilies[resourceName] = fontFamily;

        return fontFamily;
      }
    );
  }

  /**
   * Get the font family name for the given font resource.
   * The font won't be loaded.
   * @returns The font-family to be used to render a text with the font.
   */
  static getFontFamily(project: gdProject, resourceName: string) {
    if (loadedFontFamilies[resourceName]) {
      return loadedFontFamilies[resourceName];
    }

    const fontFamily = slugs(resourceName);
    return fontFamily;
  }

  static getInvalidPIXITexture() {
    return invalidTexture;
  }
}
