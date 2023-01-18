import {
  FLIPPED_DIAGONALLY_FLAG,
  FLIPPED_HORIZONTALLY_FLAG,
  FLIPPED_VERTICALLY_FLAG,
} from "../../model/GID";
import { integer } from "../../model/CommonTypes";
import { TiledLayer } from "./TiledFormat";

/**
 * Decodes a layer data, which can sometimes be store as a compressed base64 string
 * by Tiled.
 * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
 * @param pako The zlib library.
 * @param tiledLayer The layer data from a Tiled JSON.
 * @returns The decoded layer data.
 */
export const decodeBase64LayerData = (pako: any, tiledLayer: TiledLayer) => {
  const { data, compression } = tiledLayer;
  const dataBase64 = data as string;
  if (!dataBase64) {
    // The layer data is not encoded.
    return data as number[];
  }
  let index = 4;
  const decodedData: integer[] = [];
  let step1 = atob(dataBase64)
    .split("")
    .map(function (x) {
      return x.charCodeAt(0);
    });
  try {
    const decodeArray = (arr: integer[] | Uint8Array, index: integer) =>
      (arr[index] +
        (arr[index + 1] << 8) +
        (arr[index + 2] << 16) +
        (arr[index + 3] << 24)) >>>
      0;

    if (compression === "zlib") {
      const binData = new Uint8Array(step1);
      const decompressedData = pako.inflate(binData);
      while (index <= decompressedData.length) {
        decodedData.push(decodeArray(decompressedData, index - 4));
        index += 4;
      }
    } else if (compression === "zstd") {
      console.error(
        "Zstandard compression is not supported for layers in a Tilemap. Use instead zlib compression or no compression."
      );
      return null;
    } else {
      while (index <= step1.length) {
        decodedData.push(decodeArray(step1, index - 4));
        index += 4;
      }
    }
    return decodedData;
  } catch (error) {
    console.error(
      "Failed to decompress and unzip base64 layer.data string",
      error
    );
    return null;
  }
};

export type TiledGID = {
  id: integer;
  flippedHorizontally: boolean;
  flippedVertically: boolean;
  flippedDiagonally: boolean;
};

/**
 * Extract information about the rotation of a tile from the tile id.
 * @param globalTileUid The Tiled tile global uniq identifier.
 * @returns The tile identifier and orientation.
 */
export const extractTileUidFlippedStates = (
  globalTileUid: integer
): TiledGID => {
  const flippedHorizontally = globalTileUid & FLIPPED_HORIZONTALLY_FLAG;
  const flippedVertically = globalTileUid & FLIPPED_VERTICALLY_FLAG;
  const flippedDiagonally = globalTileUid & FLIPPED_DIAGONALLY_FLAG;
  const tileUid = getTileIdFromTiledGUI(
    globalTileUid &
      ~(
        FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG |
        FLIPPED_DIAGONALLY_FLAG
      )
  );

  return {
    id: tileUid,
    flippedHorizontally: !!flippedHorizontally,
    flippedVertically: !!flippedVertically,
    flippedDiagonally: !!flippedDiagonally,
  };
};

/**
 * Tiled use 0 as null, we do too but it's black boxed.
 * This is why the id needs to be decremented.
 * @return the tile identifier.
 */
export function getTileIdFromTiledGUI(
  tiledGUI: number | undefined
): number | undefined {
  return tiledGUI === 0 ? undefined : tiledGUI - 1;
}
