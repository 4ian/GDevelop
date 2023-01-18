import PIXI = GlobalPIXIModule.PIXI;

export declare class CanvasTileRenderer {
  renderer: PIXI.AbstractRenderer;
  tileAnim: number[];
  dontUseTransform: boolean;
  constructor(renderer: PIXI.AbstractRenderer);
}

declare abstract class CanvasRenderer extends PIXI.AbstractRenderer {}

declare class CompositeTilemap extends PIXI.Container {
  readonly texturesPerTilemap: number;
  tileAnim: [number, number];
  protected lastModifiedTilemap: Tilemap;
  private modificationMarker;
  private shadowColor;
  private _globalMat;
  constructor(tileset?: Array<PIXI.BaseTexture>);
  tileset(tileTextures: Array<PIXI.BaseTexture>): this;
  clear(): this;
  tileRotate(rotate: number): this;
  tileAnimX(offset: number, count: number): this;
  tileAnimY(offset: number, count: number): this;
  tile(
    tileTexture: PIXI.Texture | string | number,
    x: number,
    y: number,
    options?: {
      u?: number;
      v?: number;
      tileWidth?: number;
      tileHeight?: number;
      animX?: number;
      animY?: number;
      rotate?: number;
      animCountX?: number;
      animCountY?: number;
      alpha?: number;
    }
  ): this;
  renderCanvas(renderer: CanvasRenderer): void;
  render(renderer: PIXI.Renderer): void;
  isModified(anim: boolean): boolean;
  clearModify(): void;
  addFrame(
    texture: PIXI.Texture | string | number,
    x: number,
    y: number,
    animX?: number,
    animY?: number,
    animWidth?: number,
    animHeight?: number,
    alpha?: number
  ): this;
  addRect(
    textureIndex: number,
    u: number,
    v: number,
    x: number,
    y: number,
    tileWidth: number,
    tileHeight: number,
    animX?: number,
    animY?: number,
    rotate?: number,
    animWidth?: number,
    animHeight?: number
  ): this;
  setBitmaps: (tileTextures: Array<PIXI.BaseTexture>) => this;
  get texPerChild(): number;
}
export { CompositeTilemap as CompositeRectTileLayer };
export { CompositeTilemap };

export declare const Constant: {
  TEXTURES_PER_TILEMAP: number;
  TEXTILE_DIMEN: number;
  TEXTILE_UNITS: number;
  TEXTILE_SCALE_MODE: PIXI.SCALE_MODES;
  use32bitIndex: boolean;
  DO_CLEAR: boolean;
  maxTextures: number;
  boundSize: number;
  boundCountPerBuffer: number;
};

export declare function fillSamplers(
  shader: TilemapShader,
  maxTextures: number
): void;

export declare function generateFragmentSrc(
  maxTextures: number,
  fragmentSrc: string
): string;

export declare const pixi_tilemap: {
  CanvasTileRenderer: typeof CanvasTileRenderer;
  CompositeRectTileLayer: typeof CompositeTilemap;
  CompositeTilemap: typeof CompositeTilemap;
  Constant: {
    TEXTURES_PER_TILEMAP: number;
    TEXTILE_DIMEN: number;
    TEXTILE_UNITS: number;
    TEXTILE_SCALE_MODE: PIXI.SCALE_MODES;
    use32bitIndex: boolean;
    DO_CLEAR: boolean;
    maxTextures: number;
    boundSize: number;
    boundCountPerBuffer: number;
  };
  TextileResource: typeof TextileResource;
  MultiTextureResource: typeof TextileResource;
  RectTileLayer: typeof Tilemap;
  Tilemap: typeof Tilemap;
  TilemapShader: typeof TilemapShader;
  TilemapGeometry: typeof TilemapGeometry;
  RectTileShader: typeof TilemapShader;
  RectTileGeom: typeof TilemapGeometry;
  TileRenderer: typeof TileRenderer;
};

export declare const POINT_STRUCT_SIZE: number;

export declare const settings: {
  TEXTURES_PER_TILEMAP: number;
  TEXTILE_DIMEN: number;
  TEXTILE_UNITS: number;
  TEXTILE_SCALE_MODE: PIXI.SCALE_MODES;
  use32bitIndex: boolean;
  DO_CLEAR: boolean;
  maxTextures: number;
  boundSize: number;
  boundCountPerBuffer: number;
};

export declare interface TextileOptions {
  TEXTILE_DIMEN: number;
  TEXTILE_UNITS: number;
  DO_CLEAR?: boolean;
}

export declare class TextileResource extends PIXI.Resource {
  baseTexture: PIXI.BaseTexture;
  private readonly doClear;
  private readonly tileDimen;
  private readonly tiles;
  private _clearBuffer;
  constructor(options?: TextileOptions);
  tile(index: number, texture: PIXI.BaseTexture): void;
  bind(baseTexture: PIXI.BaseTexture): void;
  upload(
    renderer: PIXI.Renderer,
    texture: PIXI.BaseTexture,
    glTexture: PIXI.GLTexture
  ): boolean;
}

declare class Tilemap extends PIXI.Container {
  shadowColor: Float32Array;
  _globalMat: PIXI.Matrix;
  tileAnim: [number, number];
  modificationMarker: number;
  offsetX: number;
  offsetY: number;
  compositeParent: boolean;
  protected tileset: Array<PIXI.BaseTexture>;
  protected readonly tilemapBounds: PIXI.Bounds;
  protected hasAnimatedTile: boolean;
  private pointsBuf;
  constructor(tileset: PIXI.BaseTexture | Array<PIXI.BaseTexture>);
  getTileset(): Array<PIXI.BaseTexture>;
  setTileset(tileset?: PIXI.BaseTexture | Array<PIXI.BaseTexture>): this;
  clear(): this;
  tile(
    tileTexture: number | string | PIXI.Texture | PIXI.BaseTexture,
    x: number,
    y: number,
    options?: {
      u?: number;
      v?: number;
      tileWidth?: number;
      tileHeight?: number;
      animX?: number;
      animY?: number;
      rotate?: number;
      animCountX?: number;
      animCountY?: number;
      alpha?: number;
    }
  ): this;
  tileRotate(rotate: number): void;
  tileAnimX(offset: number, count: number): void;
  tileAnimY(offset: number, count: number): void;
  tileAlpha(alpha: number): void;
  renderCanvas(renderer: CanvasRenderer): void;
  renderCanvasCore(renderer: CanvasRenderer): void;
  private vbId;
  private vb;
  private vbBuffer;
  private vbArray;
  private vbInts;
  private destroyVb;
  render(renderer: PIXI.Renderer): void;
  renderWebGLCore(renderer: PIXI.Renderer, plugin: TileRenderer): void;
  isModified(anim: boolean): boolean;
  clearModify(): void;
  protected _calculateBounds(): void;
  getLocalBounds(rect?: PIXI.Rectangle): PIXI.Rectangle;
  destroy(options?: PIXI.IDestroyOptions): void;
  addFrame(
    texture: PIXI.Texture | string | number,
    x: number,
    y: number,
    animX: number,
    animY: number
  ): boolean;
  addRect(
    textureIndex: number,
    u: number,
    v: number,
    x: number,
    y: number,
    tileWidth: number,
    tileHeight: number,
    animX?: number,
    animY?: number,
    rotate?: number,
    animCountX?: number,
    animCountY?: number,
    alpha?: number
  ): this;
}
export { Tilemap as RectTileLayer };
export { Tilemap };

export declare class TilemapGeometry extends PIXI.Geometry {
  vertSize: number;
  vertPerQuad: number;
  stride: number;
  lastTimeAccess: number;
  constructor();
  buf: any;
}

export declare class TilemapShader extends PIXI.Shader {
  maxTextures: number;
  constructor(maxTextures: number);
}

export declare class TileRenderer extends PIXI.ObjectRenderer {
  readonly renderer: PIXI.Renderer;
  tileAnim: number[];
  private ibLen;
  private indexBuffer;
  private shader;
  private textiles;
  constructor(renderer: PIXI.Renderer);
  bindTileTextures(
    renderer: PIXI.Renderer,
    textures: Array<PIXI.BaseTexture>
  ): void;
  start(): void;
  createVb(): TilemapGeometry;
  getShader(): TilemapShader;
  destroy(): void;
  checkIndexBuffer(size: number, _vb?: TilemapGeometry): void;
  private makeTextiles;
}
