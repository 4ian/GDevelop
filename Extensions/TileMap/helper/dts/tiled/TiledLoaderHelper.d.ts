import { integer } from '../CommonTypes';
import { TiledLayer } from './Tiled';
/**
 * Decodes a layer data, which can sometimes be store as a compressed base64 string
 * by Tiled.
 * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
 * @param pako The zlib library.
 * @param layer The layer data from a Tiled JSON.
 * @returns The decoded layer data.
 */
export declare const decodeBase64LayerData: (
  pako: any,
  layer: TiledLayer
) => number[];
export declare type TiledGID = {
  id: integer;
  flippedHorizontally: boolean;
  flippedVertically: boolean;
  flippedDiagonally: boolean;
};
/**
 * Extract information about the rotation of a tile from the tile id.
 * @param globalTileUid
 * @returns The tile identifier and orientation.
 */
export declare const extractTileUidFlippedStates: (
  globalTileUid: integer
) => TiledGID;
//# sourceMappingURL=TiledLoaderHelper.d.ts.map
