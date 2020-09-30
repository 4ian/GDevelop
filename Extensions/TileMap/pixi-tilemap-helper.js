(function (root, factory) {
    if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.PixiTileMapHelper= {}));
    }
}(typeof self !== 'undefined' ? self : this, function (exports) {
    /**
     * Tileset/Tilemap related data.
     */
    const loadedTileSets = {};

    /**
     * Creates a Tileset resource from a tiledData json file exported from https://www.mapeditor.org/.
     * Later on this can potentially be refactored to support other data structures (LED editor for example) https://github.com/deepnight/led
     */
    const createTileSetResource = (
        tiledData,
        tex,
        requestedTileSetId,
        onLoad
      ) => {
        // Todo implement tileset index and use it instead of 0
        const { tilewidth, tilecount, tileheight, tiles } = tiledData.tilesets[0];
        console.log('NEW TILESET data::', tilewidth, tilecount, tileheight, tiles);
        const textureCache = new Array(tilecount).fill(0).map((_, frame) => {
          const cols = Math.floor(tex.width / tilewidth);
          const x = ((frame - 1) % cols) * tilewidth;
          const y = Math.floor((frame - 1) / cols) * tileheight;
          const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
          const texture = new PIXI.Texture(tex, rect);
          texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
          texture.cacheAsBitmap = true;
    
          return texture;
        });
        const newTileset = {
          width: tex.width,
          height: tex.height,
          tilewidth,
          tileheight,
          texture: tex,
          textureCache,
          layers: tiledData.layers,
          tiles,
          tilecount,
        };
        onLoad(newTileset);
        loadedTileSets[requestedTileSetId] = newTileset;
    }
    exports.createTileSetResource = createTileSetResource;

    /**
     * Re-renders the tilemap whenever its rendering settings have been changed
    */
    exports.updatePIXITileMap = (tileMap, tileSet, render, layerIndex, pixiRenderer) => {
        if (!tileMap || !tileSet) return;
  
        tileSet.layers.forEach(function(layer, index) {
          if (render === 'index' && layerIndex !== index) return;
          else if (render === 'visible' && !layer.visible) return;
    
          // todo filter groups
          if (layer.type === 'objectgroup') {
            layer.objects.forEach(function(object) {
              const { gid, x, y, visible } = object;
              if (render === 'visible' && !visible) return;
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
                    function(tile) { return tile.id === tileUid - 1}
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

        if (pixiRenderer) {
          let TIME = 0;
          console.log("===>",tileMap)
          setInterval(() => {
            TIME += 1;
            pixiRenderer.plugins.tilemap.tileAnim[0] = TIME;            
          }, 100);
        }
    }
    exports.getLoadedTileSets = () => { return loadedTileSets; }
    /**
    * If a Tileset changes (json or image), a tilemap using it needs to re-render
    * The tileset needs to be rebuilt for use
    * But we need to have the capacity to instance a tilemap, so more than one tilemaps with different tileset layers
    * We need to cache the tileset somewhere, the tilemap instance will have to re-render it
    * Tileset changes => rerender it => tilemaps using it rerender too (keeping their layer visibility option)
    * tileset id == jsonResourceName + imageResourcename
    */
    exports.getPIXITileSet = (texture, tiledData, imageResourceName, jsonResourceName, onLoad) => {
      const requestedTileSetId = `${jsonResourceName}@${imageResourceName}`;
      // If the tileset is already in the cache, just load it
      if (loadedTileSets[requestedTileSetId]) {
        onLoad(loadedTileSets[requestedTileSetId]);
        return;
      }
      createTileSetResource(
        tiledData,
        texture,
        requestedTileSetId,
        onLoad
      );
    };
}));