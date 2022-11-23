import { integer } from "../../types/commons";
import { EditableTile } from "../../model/Model";
import { TiledLayer } from "../../types/Tiled";

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

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

export function decodeTiledGUI(data: integer): EditableTile | null {
  if (data === 0) {
    return null;
  }

  const flippedHorizontally = !!(data & FLIPPED_HORIZONTALLY_FLAG);
  const flippedVertically = !!(data & FLIPPED_VERTICALLY_FLAG);
  const flippedDiagonally = !!(data & FLIPPED_DIAGONALLY_FLAG);

  const tileId = getTileIdFromTiledGUI(
    data &
      ~(
        FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG |
        FLIPPED_DIAGONALLY_FLAG
      )
  );

  return {
    tileId,
    alpha: 1,
    rotate: getPixiRotate(
      flippedHorizontally,
      flippedVertically,
      flippedDiagonally
    ),
    flippedDiagonally,
    flippedHorizontally,
    flippedVertically,
  };
}

/**
 * Return the texture to use for the tile with the specified uid, which can contains
 * information about rotation in bits 32, 31 and 30
 * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
 *
 * @param flippedHorizontally true if the tile is flipped horizontally.
 * @param flippedVertically true if the tile is flipped vertically.
 * @param flippedDiagonally true if the tile is flipped diagonally.
 * @returns the rotation "D8" number used by Pixi.
 * @see https://pixijs.io/examples/#/textures/texture-rotate.js
 */
function getPixiRotate(
  flippedHorizontally: boolean,
  flippedVertically: boolean,
  flippedDiagonally: boolean
): number {
  let rotate = 0;
  if (flippedDiagonally) {
    rotate = 10;
    if (!flippedHorizontally && flippedVertically) {
      rotate = 2;
    } else if (flippedHorizontally && !flippedVertically) {
      rotate = 6;
    } else if (flippedHorizontally && flippedVertically) {
      rotate = 14;
    }
  } else {
    rotate = 0;
    if (!flippedHorizontally && flippedVertically) {
      rotate = 8;
    } else if (flippedHorizontally && !flippedVertically) {
      rotate = 12;
    } else if (flippedHorizontally && flippedVertically) {
      rotate = 4;
    }
  }
  return rotate;
}

/**
 * Tiled use 0 as null, we do too but it's black boxed.
 * This is why the id needs to be decremented.
 * @return the tile identifier used in {@link TilMapModel}.
 */
export function getTileIdFromTiledGUI(
  tiledGUI: number | undefined
): number | undefined {
  return tiledGUI === 0 ? undefined : tiledGUI - 1;
}
