import PIXI = GlobalPIXIModule.PIXI;

export declare class CanvasTileRenderer {
  renderer: PIXI.Renderer;
  tileAnim: number[];
  dontUseTransform: boolean;
  constructor(renderer: PIXI.Renderer);
}

export declare class CompositeRectTileLayer extends PIXI.Container {
  constructor(
    zIndex?: number,
    bitmaps?: Array<PIXI.Texture>,
    texPerChild?: number
  );
  z: number;
  // @ts-ignore Maybe it's a compatibility issue with the PIXI version we are using
  zIndex: number;
  modificationMarker: number;
  shadowColor: Float32Array;
  _globalMat: PIXI.Matrix;
  _lastLayer: RectTileLayer;
  texPerChild: number;
  tileAnim: number[];
  initialize(
    zIndex?: number,
    bitmaps?: Array<PIXI.Texture>,
    texPerChild?: number
  ): void;
  setBitmaps(bitmaps: Array<PIXI.Texture>): void;
  clear(): void;
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
  tileRotate(rotate: number): this;
  tileAnimX(offset: number, count: number): this;
  tileAnimY(offset: number, count: number): this;
  addFrame(
    texture_: PIXI.Texture | String | number,
    x: number,
    y: number,
    animX?: number,
    animY?: number,
    animWidth?: number,
    animHeight?: number
  ): this;
  renderCanvas(renderer: any): void;
  render(renderer: PIXI.Renderer): void;
  isModified(anim: boolean): boolean;
  clearModify(): void;
}

export declare const Constant: {
  maxTextures: number;
  bufferSize: number;
  boundSize: number;
  boundCountPerBuffer: number;
  use32bitIndex: boolean;
  SCALE_MODE: PIXI.SCALE_MODES;
  DO_CLEAR: boolean;
};

export declare function fillSamplers(
  shader: TilemapShader,
  maxTextures: number
): void;

export declare function generateFragmentSrc(
  maxTextures: number,
  fragmentSrc: string
): string;

export declare function generateSampleSrc(maxTextures: number): string;

export declare class GraphicsLayer extends PIXI.Graphics {
  constructor(zIndex: number);
  renderCanvas(renderer: any): void;
  isModified(anim: boolean): boolean;
  clearModify(): void;
}

export declare interface IMultiTextureOptions {
  boundCountPerBuffer: number;
  boundSize: number;
  bufferSize: number;
  DO_CLEAR?: boolean;
}

export declare class MultiTextureResource extends PIXI.Resource {
  constructor(options: IMultiTextureOptions);
  DO_CLEAR: boolean;
  boundSize: number;
  _clearBuffer: Uint8Array;
  bind(baseTexture: PIXI.BaseTexture): void;
  baseTex: PIXI.BaseTexture;
  boundSprites: Array<PIXI.Sprite>;
  dirties: Array<number>;
  setTexture(ind: number, texture: PIXI.Texture): void;
  upload(
    renderer: PIXI.Renderer,
    texture: PIXI.BaseTexture,
    glTexture: PIXI.GLTexture
  ): boolean;
}

export declare const pixi_tilemap: {
  CanvasTileRenderer: typeof CanvasTileRenderer;
  CompositeRectTileLayer: typeof CompositeRectTileLayer;
  Constant: {
    maxTextures: number;
    bufferSize: number;
    boundSize: number;
    boundCountPerBuffer: number;
    use32bitIndex: boolean;
    SCALE_MODE: PIXI.SCALE_MODES;
    DO_CLEAR: boolean;
  };
  GraphicsLayer: typeof GraphicsLayer;
  MultiTextureResource: typeof MultiTextureResource;
  RectTileLayer: typeof RectTileLayer;
  TilemapShader: typeof TilemapShader;
  RectTileShader: typeof RectTileShader;
  RectTileGeom: typeof RectTileGeom;
  TileRenderer: typeof TileRenderer;
  ZLayer: typeof ZLayer;
};

export declare const POINT_STRUCT_SIZE = 12;

export declare class RectTileGeom extends PIXI.Geometry {
  vertSize: number;
  vertPerQuad: number;
  stride: number;
  lastTimeAccess: number;
  constructor();
  buf: PIXI.Buffer;
}

export declare class RectTileLayer extends PIXI.Container {
  constructor(zIndex: number, texture: PIXI.Texture | Array<PIXI.Texture>);
  // @ts-ignore Maybe it's a compatibility issue with the PIXI version we are using
  zIndex: number;
  modificationMarker: number;
  _$_localBounds: PIXI.Bounds;
  shadowColor: Float32Array;
  _globalMat: PIXI.Matrix;
  pointsBuf: Array<number>;
  hasAnim: boolean;
  textures: Array<PIXI.Texture>;
  offsetX: number;
  offsetY: number;
  compositeParent: boolean;
  initialize(
    zIndex: number,
    textures: PIXI.Texture | Array<PIXI.Texture>
  ): void;
  clear(): void;
  addFrame(
    texture_: PIXI.Texture | String | number,
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
    animCountY?: number
  ): this;
  tileRotate(rotate: number): void;
  tileAnimX(offset: number, count: number): void;
  tileAnimY(offset: number, count: number): void;
  renderCanvas(renderer: any): void;
  renderCanvasCore(renderer: any): void;
  vbId: number;
  vb: RectTileGeom;
  vbBuffer: ArrayBuffer;
  vbArray: Float32Array;
  vbInts: Uint32Array;
  destroyVb(): void;
  render(renderer: PIXI.Renderer): void;
  renderWebGLCore(renderer: PIXI.Renderer, plugin: TileRenderer): void;
  isModified(anim: boolean): boolean;
  clearModify(): void;
  protected _calculateBounds(): void;
  getLocalBounds(rect?: PIXI.Rectangle): PIXI.Rectangle;
  destroy(options?: any): void;
}

export declare class RectTileShader extends TilemapShader {
  constructor(maxTextures: number);
}

export declare abstract class TilemapShader extends PIXI.Shader {
  maxTextures: number;
  constructor(maxTextures: number, shaderVert: string, shaderFrag: string);
}

export declare class TileRenderer extends PIXI.ObjectRenderer {
  renderer: PIXI.Renderer;
  gl: WebGLRenderingContext;
  sn: number;
  indexBuffer: PIXI.Buffer;
  ibLen: number;
  tileAnim: number[];
  texLoc: Array<number>;
  rectShader: RectTileShader;
  texResources: Array<MultiTextureResource>;
  constructor(renderer: PIXI.Renderer);
  initBounds(): void;
  bindTexturesWithoutRT(
    renderer: PIXI.Renderer,
    shader: TilemapShader,
    textures: Array<PIXI.Texture>
  ): void;
  bindTextures(
    renderer: PIXI.Renderer,
    shader: TilemapShader,
    textures: Array<PIXI.Texture>
  ): void;
  start(): void;
  createVb(): RectTileGeom;
  checkIndexBuffer(size: number, vb?: RectTileGeom): void;
  getShader(): TilemapShader;
  destroy(): void;
}

export declare class ZLayer extends PIXI.Container {
  constructor(tilemap: PIXI.Container, zIndex: number);
  tilemap: any;
  z: number;
  // @ts-ignore Maybe it's a compatibility issue with the PIXI version we are using
  zIndex: number;
  _previousLayers: number;
  canvasBuffer: HTMLCanvasElement;
  _tempRender: any;
  _lastAnimationFrame: number;
  layerTransform: PIXI.Matrix;
  clear(): void;
  cacheIfDirty(): void;
  renderCanvas(renderer: any): void;
}
