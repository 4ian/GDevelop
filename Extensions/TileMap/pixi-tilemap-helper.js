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
  /** @typedef {GlobalPIXIModule.PIXI.Texture} PIXI.Texture */
  /** @typedef {GlobalPIXIModule.PIXI.BaseTexture} PIXI.BaseTexture */
  /** @typedef {GlobalPIXIModule.PIXI.Rectangle} PIXI.Rectangle */
  const PIXI = GlobalPIXIModule.PIXI;

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
    atlasTexture: PIXI.BaseTexture | null,
    textureCache: Object<number, PIXI.Texture | null>,
    layers: Array<TiledDataLayer>,
    tiles: Array<TiledDataTile>,
   }} GenericPixiTileMapData
   */

  // ldtk: f=0 (no flip), f=1 (X flip only), f=2 (Y flip only), f=3 (both flips)
  const LdtkToPixiRotations = {
    1: 12,
    2: 8,
    3: 4,
    0: 0,
  };
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
   * Parse a Tiled map Ldtk file,
   * exported from Ldtk (https://ldtk.io/json/)
   * into a generic tile map data (`GenericPixiTileMapData`).
   *
   * @param {Object} tiledData A JS object representing a map exported from Tiled.
   * @param {?PIXI.BaseTexture} atlasTexture
   * @param {(textureName: string, relativeToPath: string) => PIXI.BaseTexture} getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns {?GenericPixiTileMapData}
   */
  const parseLDtkData = (
    tiledData,
    atlasTexture,
    getTexture,
    levelIndex,
    tilemapResourceName
  ) => {
    const tileSetAtlases = {};
    tiledData.defs.tilesets.forEach((tileset) => {
      const texture = tileset.relPath
        ? getTexture(tileset.relPath, tilemapResourceName)
        : null;
      tileSetAtlases[tileset.uid] = { texture, ...tileset };
    });
    const selectedLevel = tiledData.levels[levelIndex > -1 ? levelIndex : 0];
    if (!selectedLevel) return;

    const layers = [];
    const textureCache = {};
    selectedLevel.layerInstances.reverse().forEach((ldtkLayer, layerIndex) => {
      const layerAtlasTextureRelPath = ldtkLayer['__tilesetRelPath'];
      const gridSize = ldtkLayer['__gridSize'];
      const type = ldtkLayer['__type'];
      const tilesetUid = ldtkLayer['__tilesetDefUid'];
      const autoLayerTiles = ldtkLayer.autoLayerTiles;
      const gridTiles = ldtkLayer.gridTiles;
      const ldtkTiles = [...autoLayerTiles, ...gridTiles];
      const entities = ldtkLayer.entityInstances || [];
      const layer = {
        type: type,
        autoLayerTiles,
        ldtkTiles,
        gridTiles,
        entityInstances: entities,
        visible: ldtkLayer.visible,
        opacity: ldtkLayer['__opacity'],
      };
      textureCache[layerIndex] = {};
      const tileSet = tileSetAtlases[tilesetUid];

      ldtkTiles.forEach((generatedTile) => {
        if (generatedTile.t in textureCache[layerIndex]) return;

        try {
          const [x, y] = generatedTile.src;
          const rect = new PIXI.Rectangle(x, y, gridSize, gridSize);

          // @ts-ignore - atlasTexture is never null here.
          const texture = new PIXI.Texture(tileSet.texture, rect);

          textureCache[layerIndex][generatedTile.t] = texture;
        } catch (error) {
          console.error(
            'An error occurred while creating a PIXI.Texture to be used in a TileMap:',
            error
          );
          textureCache[layerIndex] = null;
        }
      });

      layers.push(layer);
    });

    const selectedLevelBg = selectedLevel.bgRelPath;
    textureCache.levelBg = {};
    if (selectedLevelBg) {
      if (selectedLevelBg in textureCache.levelBg) return;
      try {
        const levelBgTexture = getTexture(selectedLevelBg, tilemapResourceName);
        const rect = new PIXI.Rectangle(0, 0, selectedLevel.pxWid, selectedLevel.pxHei);
        // // @ts-ignore - atlasTexture is never null here.
        const texture = new PIXI.Texture(levelBgTexture, rect);
        textureCache.levelBg[selectedLevelBg] = texture;
      } catch (error) {
        console.error(
          'An error occurred while creating a PIXI.Texture to be used in a TileMap:',
          error
        );
        textureCache.levelBg[selectedLevelBg] = null;
      }
    }
    /** @type {GenericPixiTileMapData} */
    const tileMapData = {
      width: 0,
      height: 0,
      tileWidth: 0, //not needed offset
      tileHeight: 0, // not needed
      atlasTexture, // oops, every layer can have a different one,, cant use this
      textureCache,
      layers,
      tiles: [],
      selectedLevelBg,
    };

    return tileMapData;
  };

  /**
   * Detects if the file was created in tiled or ldtk and creates a GenericPixiTileMapData with the appropriate method
   * @param tiledData
   * @param atlasTexture
   * @param getTexture
   * @returns {?GenericPixiTileMapData}
   */
  const parseTilemapData = (
    tiledData,
    atlasTexture,
    getTexture,
    levelIndex,
    tilemapResourceName
  ) => {
    if (tiledData.tiledversion) {
      console.info(
        'Detected the json file was created in Tiled, parsing the data...'
      );
      return parseTiledData(tiledData, atlasTexture, getTexture);
    }
    if (tiledData['__header__'] && tiledData['__header__'].app === 'LDtk') {
      console.info(
        'Detected the json/ldtk file was created in LDtk, parsing the data...'
      );
      return parseLDtkData(
        tiledData,
        atlasTexture,
        getTexture,
        levelIndex,
        tilemapResourceName
      );
    }

    console.warn(
      "The loaded Tiled map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );
    return null;
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
   * Returns the tileUid and the pixi rotation of tiled tiles
   * information about rotation in bits 32, 31 and 30
   * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
   *
   * @param {number} globalTileUid
   * @returns {[number, number]}
   */
  const getTileUidWithRotation = (globalTileUid) => {
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
    return [tileUid, rotate];
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

    if (genericTileMapData.selectedLevelBg) {
      const bgTexture =
        genericTileMapData.textureCache.levelBg[
          genericTileMapData.selectedLevelBg
        ];
      pixiTileMap.tile(bgTexture, 0, 0);
    }
    genericTileMapData.layers.forEach(function (layer, index) {
      if (displayMode === 'index' && layerIndex !== index) return;
      else if (displayMode === 'visible' && !layer.visible) return;

      // Ldtk Types
      if (layer.ldtkTiles) {
        // @ts-ignore
        layer.ldtkTiles.forEach(function (tile) {
          var texture = genericTileMapData.textureCache[index];
          if (texture) {
            const [x, y] = tile.px;
            pixiTileMap.tile(
              // @ts-ignore
              texture[tile.t],
              x,
              y,
              { alpha: layer.opacity, rotate: LdtkToPixiRotations[tile.f] }
            );
          }
        });
      }

      // Tiled types
      else if (layer.type === 'objectgroup') {
        layer.objects.forEach(function (object) {
          const { gid, x, y, visible } = object;
          if (displayMode === 'visible' && !visible) return;
          if (genericTileMapData.textureCache[gid]) {
            pixiTileMap.tile(
              genericTileMapData.textureCache[gid],
              x,
              y - genericTileMapData.tileHeight,
              { alpha: layer.opacity }
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
            const yPos = genericTileMapData.tileHeight * i; // these are stored in Ldtk, so no need to compute their positions

            /** @type {number} */
            // @ts-ignore
            const globalTileUid = layerData[tileSlotIndex];
            const [tileUid, rotate] = getTileUidWithRotation(globalTileUid);
            const tileTexture =
              tileUid !== 0 ? genericTileMapData.textureCache[tileUid] : null;

            if (tileTexture) {
              const tileData =
                genericTileMapData.tiles &&
                genericTileMapData.tiles.find(function (tile) {
                  return tile.id === globalTileUid - 1;
                });

              const pixiTilemapFrame = pixiTileMap.tile(
                tileTexture,
                xPos,
                yPos,
                { alpha: layer.opacity, rotate }
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
    tilesetResourceName,
    levelIndex
  ) => {
    const requestedTileMapDataId =
      tilemapResourceName +
      '@' +
      tilesetResourceName +
      '@' +
      atlasImageResourceName +
      '@' +
      levelIndex;

    // If the tilemap data is already in the cache, use it directly.
    // For LDtk we do not need to generate a tileset

    // TODO we will need to split the cache here - one for tilemaps and another for tilesets
    // TODO this is because LDtk tilemaps can have different atlas per layer
    if (loadedGenericPixiTileMapData[requestedTileMapDataId]) {
      return loadedGenericPixiTileMapData[requestedTileMapDataId];
    }

    const atlasTexture = atlasImageResourceName
      ? getTexture(atlasImageResourceName)
      : null;
    const genericPixiTileMapData = parseTilemapData(
      tiledData,
      atlasTexture,
      getTexture,
      levelIndex,
      tilemapResourceName
    );

    if (genericPixiTileMapData)
      loadedGenericPixiTileMapData[requestedTileMapDataId] =
        genericPixiTileMapData;
    return genericPixiTileMapData;
  };
});
