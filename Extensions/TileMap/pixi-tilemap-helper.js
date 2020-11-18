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
    getTexture
  ) => {
    const { tilewidth, tileheight, tilecount, tiles, image, columns } = tiledData.tilesets[0];
    if (!tex) tex = getTexture(image);

    const rows = tilecount / columns;
    const tileWidth = Math.floor(tex.width / columns); // we dont trust the json's tilewidth/height here because the atlas can be resized
    const tileHeight = Math.floor(tex.height / rows);
    const expectedAtlasWidth = tilewidth * columns;
    const expectedAtlasHeight = tileheight * rows;
    if (tileWidth !== tilewidth || tileHeight !== tileheight) {
      console.warn(`
        Have you resized your atlas?
        It should be ${expectedAtlasWidth}x${expectedAtlasHeight} px, but it's ${tex.width}x${tex.height}px.
        Note that margin and spacing are not supported in GD at this time.
        GD will try to adopt the resized atlas image to these dimensions.
      `);
    }

    const textureCache = new Array(tilecount).fill(0).map((_, frame) => {
      const x = ((frame - 1) % columns) * tileWidth
      const y = Math.floor((frame - 1) / columns) * tileHeight
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
      atlasScaleX: tex.width/expectedAtlasWidth,
      atlasScaleY: tex.height/expectedAtlasHeight,
    }
    onLoad(newTileset)
    loadedTileSets[requestedTileSetId] = newTileset
  }
  exports.createTileSetResource = createTileSetResource

  /**
   * Re-renders the tilemap whenever its rendering settings have been changed
   */
  exports.updatePIXITileMap = (tileMap, tileSet, render, layerIndex) => {
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
        for (let i = 0; i < layer.height; i++) {
          for (let j = 0; j < layer.width; j++) {
            const xPos = tileSet.tileWidth * j
            const yPos = tileSet.tileHeight * i

            const tileUid = layer.data[ind]

            if (tileUid !== 0) {
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
    const texture = imageResourceName ? getTexture(imageResourceName) : null;
    const requestedTileSetId = `${jsonResourceName}@${imageResourceName}`
    // If the tileset is already in the cache, just load it
    if (loadedTileSets[requestedTileSetId]) {
      onLoad(loadedTileSets[requestedTileSetId])
      return
    }
    createTileSetResource(tiledData, texture, requestedTileSetId, onLoad, getTexture)
  }
})
