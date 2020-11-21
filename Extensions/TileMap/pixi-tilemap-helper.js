;(function (root, factory) {
  if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports)
  } else {
    // Browser globals
    factory((root.PixiTileMapHelper = {}))
  }
})(typeof self !== 'undefined' ? self : this, function (exports) {
  /**
   * Tileset/Tilemap related data.
   */
  const loadedTileSets = {}

  /**
   * Creates a Tileset resource from a tiledData json file exported from https://www.mapeditor.org/.
   * Later on this can potentially be refactored to support other data structures (LED editor for example) https://github.com/deepnight/led
   */
  const createTileSetResource = (
    tiledData,
    tex,
    requestedTileSetId,
    onLoad,
    getTexture,
    jsonResourceName
  ) => {
    if (!tiledData.tiledversion) {
      console.warn("The json data doesn't contain a tiledversion key. Are you sure this file has been exported from mapeditor.org?");
      return; // TODO handle detecting and loading LDtk tilesets/maps
    }
    // This assumes that the tileset is embedded in the tilemap, which it might not always be, so we need to check
    if (!tiledData.tilesets.length || "source" in tiledData.tilesets[0]) {
      console.warn(`
        ${jsonResourceName} doesn't appear to contain any tileset data.
        Please embed your tileset in the tilemap file.
        At this point external tileset files are not supported
      `);
      return; // TODO handle loading tilesets from another json file, when it is provided- favor it over embeded tileset data
    }
    const { tilewidth, tileheight, tilecount, tiles, image, columns, spacing, margin } = tiledData.tilesets[0];
    // if (!tex) tex = getTexture(image);

    const rows = tilecount / columns;
    
    const tileWidth = tex.width === 1 ? tilewidth : Math.floor(tex.width / columns); // we dont trust the json's tilewidth/height here because the atlas can be resized or wrong file
    const tileHeight = tex.height === 1 ? tileheight : Math.floor(tex.height / rows); // instead we base the slicing on number of columns/rows it says it has + the texture width/height
    // we still use the dimentions tiled expects the atlas to be, these can be useful for scaling
    const expectedAtlasWidth = (tilewidth * columns) + (spacing * (columns - 1)) + (margin * 2);
    const expectedAtlasHeight = (tileheight * rows)  + (spacing * (rows - 1)) + (margin * 2);
    if ((tex.width !== 1 && expectedAtlasWidth !== tex.width) || (tex.height !== 1 && expectedAtlasHeight !== tex.height)) {
      console.warn(`
        Have you resized your atlas?
        It should be ${expectedAtlasWidth}x${expectedAtlasHeight} px, but it's ${tex.width}x${tex.height} px.
        Note that margin and spacing are not supported in GD at this time.
        GD will try to adopt the resized atlas image to these dimensions.
      `);
    }

    console.log(expectedAtlasWidth, tex.width, expectedAtlasWidth === tex.width)
    console.log("columns and rows", columns, rows)

    // assuming spacing and margin are the same
    const textureCache = new Array(tilecount + 1).fill(0).map((_, frame) => {
      const columnMultiplier = Math.floor((frame - 1) % columns)
      const rowMultiplier = Math.floor((frame - 1) / columns)
      const x = margin + (columnMultiplier * (tileWidth + spacing))
      const y = margin + (rowMultiplier * (tileHeight + spacing))
      
      //1, 34,67
      console.log(columnMultiplier,"x",rowMultiplier)
      console.log(frame, ">",x,y, tileWidth)
      const rect = new PIXI.Rectangle(x, y, tileWidth, tileHeight)
      const texture = new PIXI.Texture(tex, rect)
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
      texture.cacheAsBitmap = true

      return texture
    })
    const newTileset = {
      width: tex.width,
      height: tex.height,
      tileWidth,
      tileHeight,
      texture: tex,
      textureCache,
      layers: tiledData.layers,
      tiles,
      tilecount,
      // these scales are used as multipliers on some absolute pixel values from tiled that might be on a resized atlas
      // they help to adopt to changed dimentions when rendering in updatePIXITileMap
      atlasScaleX: tex.width !== 1 ? tex.width / expectedAtlasWidth : 1,
      atlasScaleY: tex.height !== 1 ? tex.height / expectedAtlasHeight : 1,
      margin,
      spacing
    }
    // return
    console.log(newTileset)
    onLoad(newTileset)
    loadedTileSets[requestedTileSetId] = newTileset
  }
  exports.createTileSetResource = createTileSetResource

  /**
   * Decodes the layer data, which tiled can sometimes store as a compressed base64 string
   * https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data
  */
  const decodeBase64 = (layer, pako) => {
    const {data, compression} = layer;
    var index = 4,
        arr   = [],
        step1 = atob(data).split('').map(function(x){return x.charCodeAt(0);});
    try {
      const decodeString = (str, index) => (((str.charCodeAt(index)) + (str.charCodeAt(index + 1) << 8) + (str.charCodeAt(index + 2) << 16) + (str.charCodeAt(index + 3) << 24 )) >>> 0);
      const decodeArray = (arr, index) => ((arr[index] + (arr[index + 1] << 8) + (arr[index + 2] << 16) + (arr[index + 3] << 24 )) >>> 0);
  
      if (compression === 'zlib') {
        var binData = new Uint8Array(step1);
          step1 = pako.inflate(binData);
          while (index <= step1.length) {
              arr.push(decodeArray(step1, index - 4));
              index += 4;
          }
      } else {
          while (index <= step1.length) {
              arr.push(decodeString(step1, index - 4));
              index += 4;
          }
      }
      return arr;
    } catch(error){
      console.error("Failed to decompress and unzip base64 layer.data string", error)
      return null
    }
  };

  /**
   * Re-renders the tilemap whenever its rendering settings have been changed
   */
  exports.updatePIXITileMap = (tileMap, tileSet, render, layerIndex, pako) => {
    if (!tileMap || !tileSet) return
    tileMap.clear()

    tileSet.layers.forEach(function (layer, index) {
      if (render === 'index' && layerIndex !== index) return
      else if (render === 'visible' && !layer.visible) return

      // todo filter groups
      if (layer.type === 'objectgroup') {
        layer.objects.forEach(function (object) {
          const { gid, x, y, visible } = object
          if (render === 'visible' && !visible) return
          if (tileSet.textureCache[gid]) {
            tileMap.addFrame(
              tileSet.textureCache[gid],
              x * tileSet.atlasScaleX,
              (y - tileSet.tileHeight) * tileSet.atlasScaleY
            )
          }
        })
      } else if (layer.type === 'tilelayer') {
        let ind = 0
        let layerData = layer.data;

        if (layer.encoding === 'base64') {
          layerData = decodeBase64(layer, pako)
          if (!layerData) {
            console.warn("Failed to uncompress layer.data");
            return;
          }
          layerData.encoding = "csv"
          console.log("Decoded: ", layerData)
        }
        for (let i = 0; i < layer.height; i++) {
          for (let j = 0; j < layer.width; j++) {
            const xPos = tileSet.tileWidth * j //+ tileSet.spacing
            const yPos = tileSet.tileHeight * i //+ tileSet.spacing
            const tileUid = layerData[ind]

            //console.log(tileUid,">",xPos, yPos)

            if (tileUid !== 0 && tileSet.textureCache[tileUid]) {
              const tileData = tileSet.tiles.find(function (tile) {
                return tile.id === tileUid - 1
              })

              // Animated tiles have a limitation with only being able to use frames arranged one to each other on the image resource
              if (tileData && tileData.animation) {
                tileMap
                  .addFrame(tileSet.textureCache[tileUid], xPos, yPos)
                  .tileAnimX(tileSet.tileWidth, tileData.animation.length)
              } else {
                // Non animated props dont require tileAnimX or Y
                //console.log("R ", xPos, yPos, ">", tileUid)
                tileMap.addFrame(tileSet.textureCache[tileUid], xPos, yPos)
              }
            }

            ind += 1
          }
        }
      }
    })
  }
  exports.getLoadedTileSets = () => {
    return loadedTileSets
  }
  /**
   * If a Tileset changes (json or image), a tilemap using it needs to re-render
   * The tileset needs to be rebuilt for use
   * But we need to have the capacity to instance a tilemap, so more than one tilemaps with different tileset layers
   * We need to cache the tileset somewhere, the tilemap instance will have to re-render it
   * Tileset changes => rerender it => tilemaps using it rerender too (keeping their layer visibility option)
   * tileset id == jsonResourceName + imageResourcename
   */
  exports.getPIXITileSet = (
    getTexture,
    tiledData,
    imageResourceName,
    jsonResourceName,
    onLoad
  ) => {
    
    const texture = imageResourceName ? getTexture(imageResourceName) : null; // we do this because gdevelop doesnt return a null when it fails to load textures
    const requestedTileSetId = `${jsonResourceName}@${imageResourceName}`
    console.log(imageResourceName, texture)
    // If the tileset is already in the cache, just load it
    if (loadedTileSets[requestedTileSetId]) {
      onLoad(loadedTileSets[requestedTileSetId])
      return
    }

    if(!texture) return
    createTileSetResource(tiledData, texture, requestedTileSetId, onLoad, getTexture, jsonResourceName)
  }
})
