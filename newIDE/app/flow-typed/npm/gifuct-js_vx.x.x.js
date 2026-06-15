// @flow

declare module 'gifuct-js' {
  declare export type ParsedGif = {|
    lsd: {|
      width: number,
      height: number,
      backgroundColorIndex: number,
    |},
    gct: Array<[number, number, number]>,
  |};

  declare export type ParsedFrame = {|
    dims: {|
      width: number,
      height: number,
      top: number,
      left: number,
    |},
    delay: number,
    disposalType: number,
    patch?: Uint8ClampedArray,
    transparentIndex?: number,
  |};

  declare export function parseGIF(arrayBuffer: ArrayBuffer): ParsedGif;
  declare export function decompressFrames(
    parsedGif: ParsedGif,
    buildImagePatches: boolean
  ): Array<ParsedFrame>;
}
