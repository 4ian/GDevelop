import { integer } from "../CommonTypes";
import { TiledLayer } from "./Tiled";

/**
 * Decodes a layer data, which can sometimes be store as a compressed base64 string
 * by Tiled.
 * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
 * @param pako The zlib library.
 * @param layer The layer data from a Tiled JSON.
 * @returns The decoded layer data.
 */
export const decodeBase64LayerData = (pako: any, layer: TiledLayer) => {
  const { data, compression } = layer;
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
 * @param globalTileUid
 * @returns The tile identifier and orientation.
 */
export const extractTileUidFlippedStates = (
  globalTileUid: integer
): TiledGID => {
  const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
  const FLIPPED_VERTICALLY_FLAG = 0x40000000;
  const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

  const flippedHorizontally = globalTileUid & FLIPPED_HORIZONTALLY_FLAG;
  const flippedVertically = globalTileUid & FLIPPED_VERTICALLY_FLAG;
  const flippedDiagonally = globalTileUid & FLIPPED_DIAGONALLY_FLAG;
  const tileUid =
    globalTileUid &
    ~(
      FLIPPED_HORIZONTALLY_FLAG |
      FLIPPED_VERTICALLY_FLAG |
      FLIPPED_DIAGONALLY_FLAG
    );

  return {
    id: tileUid,
    flippedHorizontally: !!flippedHorizontally,
    flippedVertically: !!flippedVertically,
    flippedDiagonally: !!flippedDiagonally,
  };
};
