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

  // If a Tileset changes (json orimage), a tilemap using it needs to re-render
  // Also the tileset needs to be rebuilt for use
  // But we need to have the capacity to instance a tilemap, so more than one tilemaps with different tileset layers
  // We need to cache the tileset somewhere, the tilemap instance will have to re-render it
  // Tileset changes => rerender it => tilemaps using it rerender too (keeping their layer visibility option)
  // tileset id == jsonResourceName + imageResourcename
  static getPIXITileSet(
    project: gdProject,
    imageResourceName: string,
    jsonResourceName: string,
    onLoad: any => null
  ) {
    const texture = this.getPIXITexture(project, imageResourceName);

    // Slices up the tileset into cached textures
    const createTileSetResource = (tiledData: any, tex: any, offset = 1) => ({
      width: tex.width,
      height: tex.height,
      tilewidth: tiledData.tilesets[0].tilewidth,
      tileheight: tiledData.tilesets[0].tileheight,
      texture: tex,
      textureCache: new Array(tiledData.tilesets[0].tilecount)
        .fill(0)
        .map((_, frame) => {
          const cols = Math.floor(tex.width / tiledData.tilesets[0].tilewidth);
          const x = ((frame - offset) % cols) * tiledData.tilesets[0].tilewidth;
          const y =
            Math.floor((frame - offset) / cols) *
            tiledData.tilesets[0].tileheight;
          const rect = new PIXI.Rectangle(
            x,
            y,
            tiledData.tilesets[0].tilewidth,
            tiledData.tilesets[0].tileheight
          );
          const texture = new PIXI.Texture(tex, rect);
          texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
          texture.cacheAsBitmap = true;

          return texture;
        }),
      layers: tiledData.layers,
      tiles: tiledData.tilesets[0].tiles,
      tilecount: tiledData.tilesets[0].tilecount,
    });

    const requestedTileSetId = `${jsonResourceName}@${imageResourceName}`;
    if (loadedTileSets[requestedTileSetId])
      onLoad(loadedTileSets[requestedTileSetId]);

    ResourcesLoader.getResourceJsonData(project, jsonResourceName).then(
      tiledData => {
        const newTileset = createTileSetResource(tiledData, texture);
        loadedTileSets[requestedTileSetId] = newTileset;
        onLoad(newTileset);
      }
    );
  }

  // Add options here
  static updatePIXITileMap(
    tileSet: any,
    tileMap: any,
    render,
    layerIndex: number
  ) {
    if (!tileMap || !tileSet) return;
    console.log('OPTIONS::', render, layerIndex);
    tileSet.layers.forEach((layer, index) => {
      // eslint-disable-next-line eqeqeq
      if (render === 'index' && layerIndex != index) return;
      else if (render === 'visible' && !layer.visible) return;

      // todo filter groups
      if (layer.type === 'objectgroup') {
        layer.objects.forEach(object => {
          const { gid, x, y, visible } = object;
          if (visible === false) return;
          if (tileSet.textureCache[gid]) {
            tileMap.addFrame(
              tileSet.textureCache[gid],
              x,
              y - tileSet.tileheight
            );
          }
        });
      } else if (layer.type === 'tilelayer') {
        let ind = 0;
        for (let i = 0; i < layer.height; i++) {
          for (let j = 0; j < layer.width; j++) {
            const xPos = tileSet.tilewidth * j;
            const yPos = tileSet.tileheight * i;

            const tileUid = layer.data[ind];

            if (tileUid !== 0) {
              const tileData = tileSet.tiles.find(
                tile => tile.id === tileUid - 1
              );

              // Animated tiles have a limitation with only being able to use frames arranged one to each other on the image resource
              if (tileData && tileData.animation) {
                tileMap
                  .addFrame(tileSet.textureCache[tileUid], xPos, yPos)
                  .tileAnimX(tileSet.tilewidth, tileData.animation.length);
              } else {
                // Non animated props dont require tileAnimX or Y
                tileMap.addFrame(tileSet.textureCache[tileUid], xPos, yPos);
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
