// @ts-check
(function (root, factory) {
  if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports);
  } else {
    // Browser globals
    factory((root.PixiTileMapHelper = {}));
  }
})(typeof self !== 'undefined' ? self : this, function (exports) {
  /**
   * The Tilesets that are ready to be used, indexed by their id.
   */
  const loadedTileSets = {};

  /**
   * Creates a Tileset resource from a tiledData json file exported from https://www.mapeditor.org/.
   * Later on this can potentially be refactored to support other data structures (LED editor for example) https://github.com/deepnight/led
   */
  const createTileSetResource = (
    tiledData,
    tex,
    onLoad,
    getTexture,
    tilemapResourceName
  ) => {
    if (!tiledData.tiledversion) {
      console.warn(
        "The json data doesn't contain a tiledversion key. Are you sure this file has been exported from Tiled Map Editor (mapeditor.org)?"
      );
      return; // TODO handle detecting and loading LDtk tilesets/maps
    }

    // We only handle tileset embedded in the tilemap. Warn if it's not the case
    if (!tiledData.tilesets.length || 'source' in tiledData.tilesets[0]) {
      console.warn(
        `${tilemapResourceName} seems not to contain any tileset data. Have you saved it in a separate Json file?`
      );
      return;
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
    if (!tex) tex = getTexture(image);

    const rows = tilecount / columns;
    // We try to detect what size tiled is expecting and if the texture is not the right size, dont load it
    const expectedAtlasWidth =
      tilewidth * columns + spacing * (columns - 1) + margin * 2;
    const expectedAtlasHeight =
      tileheight * rows + spacing * (rows - 1) + margin * 2;
    if (
      (tex.width !== 1 && expectedAtlasWidth !== tex.width) ||
      (tex.height !== 1 && expectedAtlasHeight !== tex.height)
    ) {
      console.warn(
        `It seems the atlas file was resized, which is not supported. It should be ${expectedAtlasWidth}x${expectedAtlasHeight} px, but it's ${tex.width}x${tex.height} px.`
      );
      return;
    }

    const textureCache = new Array(tilecount + 1).fill(0).map((_, frame) => {
      const columnMultiplier = Math.floor((frame - 1) % columns);
      const rowMultiplier = Math.floor((frame - 1) / columns);
      const x = margin + columnMultiplier * (tilewidth + spacing);
      const y = margin + rowMultiplier * (tileheight + spacing);

      try {
        const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
        const texture = new PIXI.Texture(tex, rect);
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        return texture;
      } catch (error) {
        console.error(
          'An error occurred while creating a PIXI.Texture to be used in a TileSet:',
          error
        );
        return null;
      }
    });
    const newTileset = {
      width: tex.width,
      height: tex.height,
      tileWidth: tilewidth,
      tileHeight: tileheight,
      texture: tex,
      textureCache: textureCache,
      layers: tiledData.layers,
      tiles: tiles,
      tilecount: tilecount,
      margin: margin,
      spacing: spacing,
    };
    onLoad(newTileset);
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
   * Re-renders the tilemap whenever its rendering settings have been changed
   */
  exports.updatePIXITileMap = (
    tileMap,
    tileSet,
    displayMode,
    layerIndex,
    pako
  ) => {
    if (!tileMap || !tileSet) return;
    tileMap.clear();

    tileSet.layers.forEach(function (layer, index) {
      if (displayMode === 'index' && layerIndex !== index) return;
      else if (displayMode === 'visible' && !layer.visible) return;

      // TODO add support for filtering a specific tiled object group by its name
      if (layer.type === 'objectgroup') {
        layer.objects.forEach(function (object) {
          const { gid, x, y, visible } = object;
          if (displayMode === 'visible' && !visible) return;
          if (tileSet.textureCache[gid]) {
            tileMap.addFrame(
              tileSet.textureCache[gid],
              x,
              y - tileSet.tileHeight
            );
          }
        });
      } else if (layer.type === 'tilelayer') {
        let tileSlotIndex = 0;
        let layerData = layer.data;

        if (layer.encoding === 'base64') {
          layerData = decodeBase64LayerData(layer, pako);
          if (!layerData) {
            console.warn('Failed to uncompress layer.data');
            return;
          }
          layerData.encoding = 'csv';
        }
        for (let i = 0; i < layer.height; i++) {
          for (let j = 0; j < layer.width; j++) {
            const xPos = tileSet.tileWidth * j;
            const yPos = tileSet.tileHeight * i;
            const tileUid = layerData[tileSlotIndex];

            if (tileUid !== 0 && tileSet.textureCache[tileUid]) {
              const tileData = tileSet.tiles.find(function (tile) {
                return tile.id === tileUid - 1;
              });

              // Animated tiles have a limitation with only being able to use frames arranged one to each other on the image resource
              if (tileData && tileData.animation) {
                tileMap
                  .addFrame(tileSet.textureCache[tileUid], xPos, yPos)
                  .tileAnimX(tileSet.tileWidth, tileData.animation.length);
              } else {
                // Non animated props dont require tileAnimX or Y
                tileMap.addFrame(tileSet.textureCache[tileUid], xPos, yPos);
              }
            }
            tileSlotIndex += 1;
          }
        }
      }
    });
  };
  exports.getLoadedTileSets = () => {
    return loadedTileSets;
  };
  /**
   * If a Tileset changes (json or image), a tilemap using it needs to re-render.
   * The tileset needs to be rebuilt for use.
   * But we need to have the capacity to instance a tilemap, so more than one tilemap with different tileset layers
   * We need to cache the tileset somewhere, the tilemap instance will have to re-render it
   * Tileset changes => rerender it => tilemaps using it rerender too (keeping their layer visibility option)
   * tileset id == tilemapResourceName + imageResourcename
   */
  exports.getPIXITileSet = (
    getTexture,
    tiledData,
    imageResourceName,
    tilemapResourceName,
    tilesetResourceName,
    onLoad
  ) => {
    const requestedTileSetId = `${
      tilesetResourceName || tilemapResourceName
    }@${imageResourceName}`;

    // If the tileset is already in the cache, just load it
    if (loadedTileSets[requestedTileSetId]) {
      onLoad(loadedTileSets[requestedTileSetId]);
      return;
    }

    const texture = imageResourceName ? getTexture(imageResourceName) : null; // we do this because gdevelop doesnt return a null when it fails to load textures
    createTileSetResource(
      tiledData,
      texture,
      (tileset) => {
        loadedTileSets[requestedTileSetId] = tileset;
        onLoad(tileset);
      },
      getTexture,
      tilemapResourceName
    );
  };
});
