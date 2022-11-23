import { integer } from "../../model/CommonTypes";
import { EditableTile } from "../../model/Model";
import { TiledLayer } from "./Format";
/**
 * Decodes a layer data, which can sometimes be store as a compressed base64 string
 * by Tiled.
 * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
 * @param pako The zlib library.
 * @param layer The layer data from a Tiled JSON.
 * @returns The decoded layer data.
 */
export declare const decodeBase64LayerData: (pako: any, layer: TiledLayer) => number[];
export declare function decodeTiledGUI(data: integer): EditableTile | null;
/**
 * Tiled use 0 as null, we do too but it's black boxed.
 * This is why the id needs to be decremented.
 * @return the tile identifier used in {@link TilMapModel}.
 */
export declare function getTileIdFromTiledGUI(tiledGUI: number | undefined): number | undefined;
//# sourceMappingURL=LoaderHelper.d.ts.map