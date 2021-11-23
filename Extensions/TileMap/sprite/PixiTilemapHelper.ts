namespace gdjs {
  export namespace TileMap {
    import PIXI = GlobalPIXIModule.PIXI;

    /**
     * Data to render a tile map. Loosely based on the merge of a Tiled
     * map and tileset.
     *
     */
    type GenericPixiTileMapData = {
      width: number;
      height: number;
      atlasTexture: PIXI.BaseTexture;
      textureCache: gdjs.TileMap.TileTextureCache;
      tileMap: gdjs.TileMap.EditableTileMap;
    };

    export class PixiTileMapHelper {
      /**
       * The Tilesets that are ready to be used
       * with Pixi Tilemap, indexed by their id.
       * @type {Object<string, GenericPixiTileMapData>}
       */
      static loadedGenericPixiTileMapData = {};

      /**
       * Parse a Tiled map JSON file,
       * exported from Tiled (https://www.mapeditor.org/)
       * into a generic tile map data (`GenericPixiTileMapData`).
       *
       * @param tiledData A JS object representing a map exported from Tiled.
       * @param atlasTexture
       * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
       * @returns
       */
      static parseTiledData(
        tiledData: gdjs.TileMap.TiledMap,
        atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
        getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
      ): GenericPixiTileMapData | null {
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
          (atlasTexture.width !== 1 &&
            expectedAtlasWidth !== atlasTexture.width) ||
          (atlasTexture.height !== 1 &&
            expectedAtlasHeight !== atlasTexture.height)
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
        const textureCache = new gdjs.TileMap.TileTextureCache();
        for (let frame = 0; frame < tilecount; frame++) {
          const columnMultiplier = Math.floor(frame % columns);
          const rowMultiplier = Math.floor(frame / columns);
          const x = margin + columnMultiplier * (tilewidth + spacing);
          const y = margin + rowMultiplier * (tileheight + spacing);

          try {
            const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
            const texture = new PIXI.Texture(atlasTexture!, rect);

            textureCache.setTexture(frame, false, false, false, texture);
          } catch (error) {
            console.error(
              'An error occurred while creating a PIXI.Texture to be used in a TileMap:',
              error
            );
          }
        }

        const tileMapData: GenericPixiTileMapData = {
          width: atlasTexture.width,
          height: atlasTexture.height,
          atlasTexture: atlasTexture,
          textureCache: textureCache,
          tileMap: gdjs.TileMap.TiledTileMapLoader.load(tiledData),
        };
        return tileMapData;
      }

      /**
       * Re-renders the tilemap whenever its rendering settings have been changed
       *
       * @param pixiTileMap
       * @param genericTileMapData
       * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
       * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
       */
      static updatePixiTileMap(
        pixiTileMap,
        genericTileMapData: GenericPixiTileMapData,
        displayMode: 'index' | 'visible' | 'all',
        layerIndex: number
      ) {
        if (!pixiTileMap || !genericTileMapData) return;
        pixiTileMap.clear();

        for (const layer of genericTileMapData.tileMap.getLayers()) {
          if (displayMode === 'index' && layerIndex !== layer.id) return;
          // TODO is this really useful?
          // I think it's just an editor field
          // and everything invisible should just not be parsed in the 1st place.
          //else if (displayMode === 'visible' && !layer.visible) return;

          if (layer instanceof gdjs.TileMap.EditableObjectLayer) {
            const objectLayer = layer as gdjs.TileMap.EditableObjectLayer;
            for (const object of objectLayer.objects) {
              const texture = genericTileMapData.textureCache.findTileTexture(
                object.getTileId(),
                object.isFlippedHorizontally(),
                object.isFlippedVertically(),
                object.isFlippedDiagonally()
              );
              if (texture) {
                pixiTileMap.addFrame(
                  texture,
                  object.x,
                  object.y - objectLayer.tileMap.getTileHeight()
                );
              }
            }
          } else if (layer instanceof gdjs.TileMap.EditableTileMapLayer) {
            const tileLayer = layer as gdjs.TileMap.EditableTileMapLayer;

            for (let y = 0; y < tileLayer.tileMap.getDimensionY(); y++) {
              for (let x = 0; x < tileLayer.tileMap.getDimensionX(); x++) {
                const xPos = tileLayer.tileMap.getTileWidth() * x;
                const yPos = tileLayer.tileMap.getTileHeight() * y;

                const tileId = tileLayer.get(x, y)!;

                const tileTexture = genericTileMapData.textureCache.findTileTexture(
                  tileId,
                  tileLayer.isFlippedHorizontally(x, y),
                  tileLayer.isFlippedVertically(x, y),
                  tileLayer.isFlippedDiagonally(x, y)
                );
                if (tileTexture) {
                  const pixiTilemapFrame = pixiTileMap.addFrame(
                    tileTexture,
                    xPos,
                    yPos
                  );

                  const tileDefinition = tileLayer.tileMap.getTileDefinition(
                    tileId
                  );

                  // TODO handle animations

                  // // Animated tiles have a limitation:
                  // // they are only able to use frames arranged horizontally one next
                  // // to each other on the atlas.
                  // if (tileDefinition && tileDefinition.animation) {
                  //   pixiTilemapFrame.tileAnimX(
                  //     genericTileMapData.tileWidth,
                  //     tileDefinition.animation.length
                  //   );
                  // }
                }
              }
            }
          }
        }
      }

      /**
       * Load the given data, exported from Tiled, into a generic tilemap data (`GenericPixiTileMapData`),
       * which can then be used to update a PIXI.Tilemap (see `updatePixiTileMap`).
       *
       * Later on, this could potentially be refactored to support other data structures
       * (LDtk, for example: https://github.com/deepnight/ldtk).
       *
       * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
       * @param tiledData A JS object representing a map exported from Tiled.
       * @param atlasImageResourceName The name of the resource to pass to `getTexture` to load the atlas.
       * @param tilemapResourceName The name of the tilemap resource - used to index internally the loaded tilemap data.
       * @param tilesetResourceName The name of the tileset resource - used to index internally the loaded tilemap data.
       * @returns
       */
      static loadPixiTileMapData(
        getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
        tiledData: gdjs.TileMap.TiledMap,
        atlasImageResourceName: string,
        tilemapResourceName: string,
        tilesetResourceName: string
      ): GenericPixiTileMapData | null {
        const requestedTileMapDataId =
          tilemapResourceName +
          '@' +
          tilesetResourceName +
          '@' +
          atlasImageResourceName;

        // If the tilemap data is already in the cache, use it directly.
        if (
          PixiTileMapHelper.loadedGenericPixiTileMapData[requestedTileMapDataId]
        ) {
          return PixiTileMapHelper.loadedGenericPixiTileMapData[
            requestedTileMapDataId
          ];
        }

        const atlasTexture = atlasImageResourceName
          ? getTexture(atlasImageResourceName)
          : null;
        const genericPixiTileMapData = PixiTileMapHelper.parseTiledData(
          tiledData,
          atlasTexture,
          getTexture
        );

        if (genericPixiTileMapData)
          PixiTileMapHelper.loadedGenericPixiTileMapData[
            requestedTileMapDataId
          ] = genericPixiTileMapData;
        return genericPixiTileMapData;
      }
    }
  }
}
