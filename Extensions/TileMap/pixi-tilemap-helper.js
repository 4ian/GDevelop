(function (root, factory) {
    if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.PixiTileMapHelper= {}));
    }
}(typeof self !== 'undefined' ? self : this, function (exports) {
    // Your module can have "private" variables (that's how we do private stuff in JS):
    const loadedTileSets = {};

    // Implement your functions that are exposed:
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
    exports.updatePIXITileMap = (tileMap, tileSet, render, layerIndex) => {
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
    }
    exports.getLoadedTileSets = () => { return loadedTileSets; }
    exports.getPIXITileSet = (project, pixiResourcesLoader, imageResourceName, jsonResourceName, onLoad) => {
      const requestedTileSetId = `${jsonResourceName}@${imageResourceName}`;
      // If the tileset is already in the cache, just load it
      if (loadedTileSets[requestedTileSetId]) {
        onLoad(loadedTileSets[requestedTileSetId]);
        return;
      }
      const texture = pixiResourcesLoader.getPIXITexture(project, imageResourceName);
      // Otherwise proceed to creating it as an object that can easily be consumed by a tilemap
      pixiResourcesLoader.ResourcesLoader.getResourceJsonData(project, jsonResourceName).then(
        tiledData => {
          console.log(tiledData,texture);
          createTileSetResource(
            tiledData,
            texture,
            requestedTileSetId,
            onLoad
          );
        }
      );
    };
}));