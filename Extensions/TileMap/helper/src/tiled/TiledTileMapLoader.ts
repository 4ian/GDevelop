namespace gdjs {
  export namespace TileMap {
    /**
     * It creates a {@link EditableTileMap} from a Tiled JSON.
     */
    export class TiledTileMapLoader {
      static load(
        pako: any,
        tiledMap: gdjs.TileMap.TiledMap
      ): gdjs.TileMap.EditableTileMap | null {
        if (!tiledMap.tiledversion) {
          console.warn(
            "The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"
          );

          return null;
        }

        const definitions = new Map<integer, gdjs.TileMap.TileDefinition>();
        for (const tile of tiledMap.tilesets[0].tiles!) {
          const polygons: PolygonVertices[] = [];
          if (tile.objectgroup) {
            for (const object of tile.objectgroup.objects) {
              let polygon: PolygonVertices | null = null;
              if (object.polygon) {
                polygon = object.polygon.map((point) => [point.x, point.y]);
                //TODO check that polygons are convex or split them?
              }
              // TODO handle ellipses by creating a polygon?
              // Make an object property for the number of vertices or always create 8 ones?
              // Will the user need the same vertices number for every ellipse?
              else {
                polygon = [
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
            new gdjs.TileMap.TileDefinition(
              polygons,
              tile.type ? tile.type : '',
              tile.animation ? tile.animation.length : 0
            )
          );
        }
        for (
          let tileId = 0;
          tileId < tiledMap.tilesets[0].tilecount;
          tileId++
        ) {
          if (!definitions.has(tileId)) {
            definitions.set(tileId, new gdjs.TileMap.TileDefinition([], '', 0));
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
          if (tiledLayer.type === 'objectgroup') {
            const objectLayer = collisionTileMap.addObjectLayer(tiledLayer.id);
            objectLayer.setVisible(tiledLayer.visible);
            for (const tiledObject of tiledLayer.objects) {
              if (!tiledObject.visible) {
                // Objects layer are nice to put decorations but dynamic objects
                // must be done with GDevelop objects.
                // So, there is no point to load it as there won't be any action to
                // make objects visible individually.
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
              layerData = gdjs.TileMap.decodeBase64LayerData(pako, tiledLayer);
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
              collisionTileLayer.setVisible(tiledLayer.visible);
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
                  if (tileUid.id > 0) {
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
                  }
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
