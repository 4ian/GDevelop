// @ts-check
(function (root, factory) {
  // @ts-ignore
  if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports);
  } else {
    // Browser globals
    // @ts-ignore
    factory((root.PixiTileMapHelper = {}));
  }
})(typeof self !== 'undefined' ? self : this, function (exports) {
  /**
   * Information about one or more tiles. Loosely based on
   * https://doc.mapeditor.org/en/stable/reference/json-map-format/#tile-definition.
   *
   * @typedef {{
    "id": number,
    "terrain"?: Array<number>,
    "animation"?: Array<{duration: number, tileid: number}>
   }} TiledDataTile
   */

  /**
   * Information about a layer. Loosely based on
   * https://doc.mapeditor.org/en/stable/reference/json-map-format/#layer.
   *
   * @typedef {{
    "compression"?:"zlib" | "gzip" | "zstd",
    "data":Array<number> | string,
    "encoding"?:"base64",
    "height":number,
    "id":number,
    "name": string,
    "opacity": number,
    "type": string,
    "visible":boolean,
    "width":number,
    "objects": Array<{ gid: number, x: number, y: number, visible: boolean }>
   }} TiledDataLayer
   */

  /**
   * Data to render a tile map. Loosely based on the merge of a Tiled
   * map and tileset.
   *
   * @typedef {{
    width: number,
    height: number,
    tileWidth: number,
    tileHeight: number,
    atlasTexture: PIXI.BaseTexture,
    textureCache: Object<number, PIXI.Texture | null>,
    layers: Array<TiledDataLayer>,
    tiles: Array<TiledDataTile>,
   }} GenericPixiTileMapData
   */

  /**
   * The Tilesets that are ready to be used
   * with Pixi Tilemap, indexed by their id.
   * @type {Object<string, GenericPixiTileMapData>}
   */
  const loadedGenericPixiTileMapData = {};

  /**
   * Parse a Tiled map JSON file,
   * exported from Tiled (https://www.mapeditor.org/)
   * into a generic tile map data (`GenericPixiTileMapData`).
   *
   * @param {Object} tiledData A JS object representing a map exported from Tiled.
   * @param {?PIXI.BaseTexture} atlasTexture
   * @param {(textureName: string) => PIXI.BaseTexture} getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns {?GenericPixiTileMapData}
   */
  const parseTiledData = (tiledData, atlasTexture, getTexture) => {
    if (!tiledData.tiledversion) {
      console.warn(
        "The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"
      );

      return null;
    }

    // We only handle tileset embedded in the tilemap. Warn if it's not the case.
    if (!tiledData.tilesets.length || 'source' in tiledData.tilesets[0]) {
      console.warn(
        "The loaded Tiled map seems not to contain any tileset data (nothing in 'tilesets' key)."
      );
      return null;
    }

    const {
      tilewidth,
      tileheight,
      tilecount,
      tiles,
      image,
      columns,
      spacing,
      margin,
    } = tiledData.tilesets[0];
    if (!atlasTexture) atlasTexture = getTexture(image);

    // We try to detect what size Tiled is expecting.
    const rows = tilecount / columns;
    const expectedAtlasWidth =
      tilewidth * columns + spacing * (columns - 1) + margin * 2;
    const expectedAtlasHeight =
      tileheight * rows + spacing * (rows - 1) + margin * 2;
    if (
      (atlasTexture.width !== 1 && expectedAtlasWidth !== atlasTexture.width) ||
      (atlasTexture.height !== 1 && expectedAtlasHeight !== atlasTexture.height)
    ) {
      const expectedSize = expectedAtlasWidth + 'x' + expectedAtlasHeight;
      const actualSize = atlasTexture.width + 'x' + atlasTexture.height;
      console.warn(
        'It seems the atlas file was resized, which is not supported. It should be ' +
          expectedSize +
          "px, but it's " +
          actualSize +
          ' px.'
      );
      return null;
    }

    // Prepare the textures pointing to the base "Atlas" Texture for each tile.
    // Note that this cache can be augmented later with rotated/flipped
    // versions of the tile textures.
    /** @type {Object<number, PIXI.Texture | null>} */
    const textureCache = {};
    for (let frame = 0; frame <= tilecount; frame++) {
      const columnMultiplier = Math.floor((frame - 1) % columns);
      const rowMultiplier = Math.floor((frame - 1) / columns);
      const x = margin + columnMultiplier * (tilewidth + spacing);
      const y = margin + rowMultiplier * (tileheight + spacing);

      try {
        const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
        // @ts-ignore - atlasTexture is never null here.
        const texture = new PIXI.Texture(atlasTexture, rect);

        textureCache[frame] = texture;
      } catch (error) {
        console.error(
          'An error occurred while creating a PIXI.Texture to be used in a TileMap:',
          error
        );
        textureCache[frame] = null;
      }
    }

    /** @type {GenericPixiTileMapData} */
    const tileMapData = {
      width: atlasTexture.width,
      height: atlasTexture.height,
      tileWidth: tilewidth,
      tileHeight: tileheight,
      atlasTexture: atlasTexture,
      textureCache: textureCache,
      layers: tiledData.layers,
      tiles: tiles,
    };
    return tileMapData;
  };

  /**
   * Decodes a layer data, which can sometimes be store as a compressed base64 string
   * by Tiled.
   * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
   */
  const decodeBase64LayerData = (layer, pako) => {
    const { data, compression } = layer;
    let index = 4;
    const decodedData = [];
    let step1 = atob(data)
      .split('')
      .map(function (x) {
        return x.charCodeAt(0);
      });
    try {
      const decodeString = (str, index) =>
        (str.charCodeAt(index) +
          (str.charCodeAt(index + 1) << 8) +
          (str.charCodeAt(index + 2) << 16) +
          (str.charCodeAt(index + 3) << 24)) >>>
        0;
      const decodeArray = (arr, index) =>
        (arr[index] +
          (arr[index + 1] << 8) +
          (arr[index + 2] << 16) +
          (arr[index + 3] << 24)) >>>
        0;

      if (compression === 'zlib') {
        const binData = new Uint8Array(step1);
        step1 = pako.inflate(binData);
        while (index <= step1.length) {
          decodedData.push(decodeArray(step1, index - 4));
          index += 4;
        }
      } else if (compression === 'zstd') {
        console.error(
          'Zstandard compression is not supported for layers in a Tilemap. Use instead zlib compression or no compression.'
        );
        return null;
      } else {
        while (index <= step1.length) {
          decodedData.push(decodeString(step1, index - 4));
          index += 4;
        }
      }
      return decodedData;
    } catch (error) {
      console.error(
        'Failed to decompress and unzip base64 layer.data string',
        error
      );
      return null;
    }
  };

  /**
   * Extract information about the rotation of a tile from the tile id.
   * @param {number} globalTileUid
   * @returns {[number, boolean, boolean, boolean]}
   */
  const extractTileUidFlippedStates = (globalTileUid) => {
    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

    const flippedHorizontally = globalTileUid & FLIPPED_HORIZONTALLY_FLAG;
    const flippedVertically = globalTileUid & FLIPPED_VERTICALLY_FLAG;
    const flippedDiagonally = globalTileUid & FLIPPED_DIAGONALLY_FLAG;
    const tileUid =
      globalTileUid &
      ~(
        FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG |
        FLIPPED_DIAGONALLY_FLAG
      );

    return [tileUid, !!flippedHorizontally, !!flippedVertically, !!flippedDiagonally];
  };

  /**
   * Return the texture to use for the tile with the specified uid, which can contains
   * information about rotation in bits 32, 31 and 30
   * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
   *
   * @param {Object<number, PIXI.Texture | null>} textureCache
   * @param {number} globalTileUid
   * @returns {?PIXI.Texture}
   */
  const findTileTextureInCache = (textureCache, globalTileUid) => {
    if (globalTileUid === 0) return null;

    if (textureCache[globalTileUid]) {
      return textureCache[globalTileUid];
    }

    // If the texture is not in the cache, it's potentially because its ID
    // is a flipped/rotated version of another ID.
    const flippedStates = extractTileUidFlippedStates(globalTileUid);
    const tileUid = flippedStates[0];
    const flippedHorizontally = flippedStates[1];
    const flippedVertically = flippedStates[2];
    const flippedDiagonally = flippedStates[3];

    if (tileUid === 0) return null;

    // If the tile still can't be found in the cache, it means the ID we got
    // is invalid.
    const unflippedTexture = textureCache[tileUid];
    if (!unflippedTexture) return null;

    // Clone the unflipped texture and save it in the cache
    const frame = unflippedTexture.frame.clone();
    const orig = unflippedTexture.orig.clone();
    if (flippedDiagonally) {
      const width = orig.width;
      orig.width = orig.height;
      orig.height = width;
    }
    const trim = orig.clone();

    // Get the rotation "D8" number.
    // See https://pixijs.io/examples/#/textures/texture-rotate.js
    let rotate = 0;
    if (flippedDiagonally) {
      rotate = 10;
      if (!flippedHorizontally && flippedVertically) {
        rotate = 2;
      } else if (flippedHorizontally && !flippedVertically) {
        rotate = 6;
      } else if (flippedHorizontally && flippedVertically) {
        rotate = 14;
      }
    } else {
      rotate = 0;
      if (!flippedHorizontally && flippedVertically) {
        rotate = 8;
      } else if (flippedHorizontally && !flippedVertically) {
        rotate = 12;
      } else if (flippedHorizontally && flippedVertically) {
        rotate = 4;
      }
    }

    const flippedTexture = new PIXI.Texture(
      unflippedTexture.baseTexture,
      frame,
      orig,
      trim,
      rotate
    );
    return (textureCache[globalTileUid] = flippedTexture);
  };

  /**
   * Re-renders the tilemap whenever its rendering settings have been changed
   *
   * @param {any} pixiTileMap
   * @param {GenericPixiTileMapData} genericTileMapData
   * @param {'index' | 'visible' | 'all'} displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
   * @param {number} layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
   * @param {any} pako The Pako library object, to decompress the layer data.
   */
  exports.updatePixiTileMap = (
    pixiTileMap,
    genericTileMapData,
    displayMode,
    layerIndex,
    pako
  ) => {
    if (!pixiTileMap || !genericTileMapData) return;
    pixiTileMap.clear();

    genericTileMapData.layers.forEach(function (layer, index) {
      if (displayMode === 'index' && layerIndex !== index) return;
      else if (displayMode === 'visible' && !layer.visible) return;

      if (layer.type === 'objectgroup') {
        layer.objects.forEach(function (object) {
          const { gid, x, y, visible } = object;
          if (displayMode === 'visible' && !visible) return;
          if (genericTileMapData.textureCache[gid]) {
            pixiTileMap.addFrame(
              genericTileMapData.textureCache[gid],
              x,
              y - genericTileMapData.tileHeight
            );
          }
        });
      } else if (layer.type === 'tilelayer') {
        let tileSlotIndex = 0;
        let layerData = layer.data;

        if (layer.encoding === 'base64') {
          // @ts-ignore
          layerData = decodeBase64LayerData(layer, pako);
          if (!layerData) {
            console.warn('Failed to uncompress layer.data');
            return;
          }
        }

        for (let i = 0; i < layer.height; i++) {
          for (let j = 0; j < layer.width; j++) {
            const xPos = genericTileMapData.tileWidth * j;
            const yPos = genericTileMapData.tileHeight * i;

            // The "globalTileUid" is the tile UID with encoded
            // bits about the flipping/rotation of the tile.
            /** @type {number} */
            // @ts-ignore
            const globalTileUid = layerData[tileSlotIndex];

            // Extract the tile UID and the texture.
            const tileUid = extractTileUidFlippedStates(globalTileUid)[0];
            const tileTexture = findTileTextureInCache(
              genericTileMapData.textureCache,
              globalTileUid
            );
            if (tileTexture) {
              const tileData =
                genericTileMapData.tiles &&
                genericTileMapData.tiles.find(function (tile) {
                  return tile.id === tileUid - 1;
                });

              const pixiTilemapFrame = pixiTileMap.addFrame(
                tileTexture,
                xPos,
                yPos
              );

              // Animated tiles have a limitation:
              // they are only able to use frames arranged horizontally one next
              // to each other on the atlas.
              if (tileData && tileData.animation) {
                pixiTilemapFrame.tileAnimX(
                  genericTileMapData.tileWidth,
                  tileData.animation.length
                );
              }
            }

            tileSlotIndex += 1;
          }
        }
      }
    });
  };

  /**
   * Load the given data, exported from Tiled, into a generic tilemap data (`GenericPixiTileMapData`),
   * which can then be used to update a PIXI.Tilemap (see `updatePixiTileMap`).
   *
   * Later on, this could potentially be refactored to support other data structures
   * (LDtk, for example: https://github.com/deepnight/ldtk).
   *
   * @param {(textureName: string) => PIXI.BaseTexture} getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @param {Object} tiledData A JS object representing a map exported from Tiled.
   * @param {string} atlasImageResourceName The name of the resource to pass to `getTexture` to load the atlas.
   * @param {string} tilemapResourceName The name of the tilemap resource - used to index internally the loaded tilemap data.
   * @param {string} tilesetResourceName The name of the tileset resource - used to index internally the loaded tilemap data.
   * @returns {?GenericPixiTileMapData}
   */
  exports.loadPixiTileMapData = (
    getTexture,
    tiledData,
    atlasImageResourceName,
    tilemapResourceName,
    tilesetResourceName
  ) => {
    const requestedTileMapDataId =
      tilemapResourceName +
      '@' +
      tilesetResourceName +
      '@' +
      atlasImageResourceName;

    // If the tilemap data is already in the cache, use it directly.
    if (loadedGenericPixiTileMapData[requestedTileMapDataId]) {
      return loadedGenericPixiTileMapData[requestedTileMapDataId];
    }

    const atlasTexture = atlasImageResourceName
      ? getTexture(atlasImageResourceName)
      : null;
    const genericPixiTileMapData = parseTiledData(
      tiledData,
      atlasTexture,
      getTexture
    );

    if (genericPixiTileMapData)
      loadedGenericPixiTileMapData[
        requestedTileMapDataId
      ] = genericPixiTileMapData;
    return genericPixiTileMapData;
  };
});
