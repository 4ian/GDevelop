import { integer, PolygonVertices } from "../../model/CommonTypes";
import {
  EditableTileMap,
  TileDefinition,
  TileObject,
} from "../../model/Model";
import { TiledTileMap } from "./Format";
import {
  extractTileUidFlippedStates,
  decodeBase64LayerData,
  getTileIdFromTiledGUI,
} from "./LoaderHelper";

/**
 * It creates a {@link EditableTileMap} from a Tiled JSON.
 */
export namespace TiledTileMapLoader {
  export function load(pako: any, tileMap: TiledTileMap): EditableTileMap | null {
    if (!tileMap.tiledversion) {
      console.warn(
        "The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"
      );

      return null;
    }

    const definitions = new Map<integer, TileDefinition>();
    for (const tileSet of tileMap.tilesets) {
      const firstGid = tileSet.firstgid === undefined ? 1 : tileSet.firstgid;
      if (tileSet.tiles) {
        for (const tile of tileSet.tiles) {
          const tileDefinition = new TileDefinition(
            tile.animation ? tile.animation.length : 0
          );
          if (tile.objectgroup) {
            for (const object of tile.objectgroup.objects) {
              const tag = object.class || tile.class;
              if (!tag || tag.length === 0) {
                continue;
              }
              let polygon: PolygonVertices | null = null;
              if (object.polygon) {
                const angle = (object.rotation * Math.PI) / 180;
                let cos = Math.cos(angle);
                let sin = Math.sin(angle);
                // Avoid rounding errors around 0.
                if (cos === -1 || cos === 1) {
                  sin = 0;
                }
                if (sin === -1 || sin === 1) {
                  cos = 0;
                }
                polygon = object.polygon.map((point) => [
                  object.x + point.x * cos - point.y * sin,
                  object.y + point.x * sin + point.y * cos,
                ]);
                //TODO check that polygons are convex or split them?
              }
              // TODO handle ellipses by creating a polygon?
              // Make an object property for the number of vertices or always create 8 ones?
              // Will the user need the same vertices number for every ellipse?
              else if (
                object.x !== undefined &&
                object.y !== undefined &&
                object.width !== undefined &&
                object.height !== undefined
              ) {
                polygon = [
                  [object.x, object.y],
                  [object.x, object.y + object.height],
                  [object.x + object.width, object.y + object.height],
                  [object.x + object.width, object.y],
                ];
              }
              if (polygon) {
                tileDefinition.add(tag, polygon);
              }
            }
          } else if (tile.class && tile.class.length > 0) {
            // When there is no shape, default to the whole tile.
            const polygon: PolygonVertices = [
              [0, 0],
              [0, tileMap.tileheight],
              [tileMap.tilewidth, tileMap.tileheight],
              [tileMap.tilewidth, 0],
            ];
            tileDefinition.add(tile.class, polygon);
          }
          definitions.set(
            getTileIdFromTiledGUI(firstGid + tile.id),
            tileDefinition
          );
        }
      }
      for (let tileIndex = 0; tileIndex < tileSet.tilecount; tileIndex++) {
        const tileId = getTileIdFromTiledGUI(firstGid + tileIndex);
        if (!definitions.has(tileId)) {
          definitions.set(tileId, new TileDefinition(0));
        }
      }
    }

    const collisionTileMap = new EditableTileMap(
      tileMap.tilewidth,
      tileMap.tileheight,
      tileMap.width,
      tileMap.height,
      definitions
    );

    for (const tiledLayer of tileMap.layers) {
      if (tiledLayer.type === "objectgroup") {
        const objectLayer = collisionTileMap.addObjectLayer(tiledLayer.id);
        objectLayer.setVisible(tiledLayer.visible);
        for (const tiledObject of tiledLayer.objects) {
          if (!tiledObject.visible || !tiledObject.gid) {
            // Objects layer are nice to put decorations but dynamic objects
            // must be done with GDevelop objects.
            // So, there is no point to load it as there won't be any action to
            // make objects visible individually.
            continue;
          }
          const tileGid = extractTileUidFlippedStates(tiledObject.gid);
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
      } else if (tiledLayer.type === "tilelayer") {
        let tileSlotIndex = 0;
        let layerData: integer[] | null = null;

        if (tiledLayer.encoding === "base64") {
          layerData = decodeBase64LayerData(pako, tiledLayer);
          if (!layerData) {
            console.warn("Failed to uncompress layer.data");
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
              const tileUid = extractTileUidFlippedStates(globalTileUid);
              if (tileUid.id !== undefined) {
                collisionTileLayer.setTile(x, y, tileUid.id);
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
