namespace gdjs {
  export namespace TileMap {
    export class TiledTileMapLoader {
      static load(
        tiledMap: gdjs.TileMap.TiledMap
      ): gdjs.TileMap.EditableTileMap {
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
        for (
          let tileId = 0;
          tileId < tiledMap.tilesets[0].tilecount;
          tileId++
        ) {
          if (!definitions.has(tileId)) {
            definitions.set(
              tileId,
              new gdjs.TileMap.CollisionTileDefinition([], '')
            );
          }
        }
        //console.log(definitions.size + " tiles definition");
        const collisionTileMap = new gdjs.TileMap.EditableTileMap(
          tiledMap.tilewidth,
          tiledMap.tileheight,
          tiledMap.width,
          tiledMap.height,
          definitions
        );

        for (const tiledLayer of tiledMap.layers) {
          if (!tiledLayer.visible) {
            continue;
          }

          if (tiledLayer.type === 'objectgroup') {
            const objectLayer = collisionTileMap.addObjectLayer(tiledLayer.id);
            for (const tiledObject of tiledLayer.objects) {
              if (!tiledObject.visible) {
                continue;
              }
              const tileGid = gdjs.TileMap.extractTileUidFlippedStates(
                tiledObject.gid
              );
              const object = new TileObject(
                tiledObject.x,
                tiledObject.y,
                tileGid.id
              );
              objectLayer.add(object);
              object.setFlippedHorizontally(tileGid.flippedHorizontally);
              object.setFlippedVertically(tileGid.flippedVertically);
              object.setFlippedDiagonally(tileGid.flippedDiagonally);
            }
          } else if (tiledLayer.type === 'tilelayer') {
            let tileSlotIndex = 0;
            let layerData: integer[] | null = null;

            if (tiledLayer.encoding === 'base64') {
              layerData = gdjs.TileMap.decodeBase64LayerData(tiledLayer);
              if (!layerData) {
                console.warn('Failed to uncompress layer.data');
              }
            } else {
              layerData = tiledLayer.data as integer[];
            }
            if (layerData) {
              const collisionTileLayer = collisionTileMap.addTileLayer(
                tiledLayer.id
              );
              // TODO handle layer offset

              for (let y = 0; y < tiledLayer.height; y++) {
                for (let x = 0; x < tiledLayer.width; x++) {
                  // The "globalTileUid" is the tile UID with encoded
                  // bits about the flipping/rotation of the tile.
                  const globalTileUid = layerData[tileSlotIndex];
                  // Extract the tile UID and the texture.
                  const tileUid = gdjs.TileMap.extractTileUidFlippedStates(
                    globalTileUid
                  );
                  //console.log("globalTileUid: " + tileUid.id + " " + tileUid.flippedHorizontally + " " + tileUid.flippedVertically + " " + tileUid.flippedDiagonally);
                  collisionTileLayer.setTile(x, y, tileUid.id - 1);
                  collisionTileLayer.setFlippedHorizontally(
                    x,
                    y,
                    tileUid.flippedHorizontally
                  );
                  collisionTileLayer.setFlippedVertically(
                    x,
                    y,
                    tileUid.flippedVertically
                  );
                  collisionTileLayer.setFlippedDiagonally(
                    x,
                    y,
                    tileUid.flippedDiagonally
                  );

                  tileSlotIndex += 1;
                }
              }
            }
          }
        }

        return collisionTileMap;
      }
    }
  }
}
