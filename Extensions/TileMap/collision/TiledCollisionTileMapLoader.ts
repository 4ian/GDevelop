namespace gdjs {
  export namespace TileMap {
    export class TiledCollisionTileMapLoader {
      static load(
        tiledMap: gdjs.TileMap.TiledMap
      ): gdjs.TileMap.CollisionTileMap {
        const definitions = new Map<
          integer,
          gdjs.TileMap.CollisionTileDefinition
        >();
        for (const tile of tiledMap.tilesets[0].tiles!) {
          const polygons: gdjs.Polygon[] = [];
          if (tile.objectgroup) {
            for (const object of tile.objectgroup.objects) {
              const polygon = new gdjs.Polygon();
              if (object.polygon) {
                polygon.vertices = object.polygon.map((point) => [
                  point.x,
                  point.y,
                ]);
              }
              // TODO handle ellipse
              else {
                polygon.vertices = [
                  [object.x, object.y],
                  [object.x, object.y + object.height],
                  [object.x + object.width, object.y + object.height],
                  [object.x + object.width, object.y],
                ];
              }
              polygons.push(polygon);
            }
          }
          //console.log("Definition: " + tile.id);
          definitions.set(
            tile.id,
            new gdjs.TileMap.CollisionTileDefinition(polygons, tile.type)
          );
        }
        const collisionTileMap = new gdjs.TileMap.CollisionTileMap(
          tiledMap.tilewidth,
          tiledMap.tileheight,
          tiledMap.width,
          tiledMap.height,
          definitions
        );
        // TODO handle multiple layer
        const layer = tiledMap.layers[0];

        if (layer.type === 'tilelayer') {
          let tileSlotIndex = 0;
          let layerData: integer[] | null = null;

          if (layer.encoding === 'base64') {
            layerData = gdjs.TileMap.decodeBase64LayerData(layer);
            if (!layerData) {
              console.warn('Failed to uncompress layer.data');
            }
          } else {
            layerData = layer.data as integer[];
          }
          if (layerData) {
            for (let y = 0; y < layer.height; y++) {
              for (let x = 0; x < layer.width; x++) {
                // The "globalTileUid" is the tile UID with encoded
                // bits about the flipping/rotation of the tile.
                const globalTileUid = layerData[tileSlotIndex];
                // Extract the tile UID and the texture.
                const tileUid = gdjs.TileMap.extractTileUidFlippedStates(
                  globalTileUid
                  );
                //console.log("globalTileUid: " + tileUid.id + " " + tileUid.flippedHorizontally + " " + tileUid.flippedVertically + " " + tileUid.flippedDiagonally);
                collisionTileMap.set(x, y, tileUid.id - 1, tileUid.flippedHorizontally, tileUid.flippedVertically, tileUid.flippedDiagonally);

                tileSlotIndex += 1;
              }
            }
          }
        }

        return collisionTileMap;
      }
    }
  }
}
