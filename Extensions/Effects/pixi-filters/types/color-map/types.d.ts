declare namespace PIXI.filters {
  export class ColorMapFilter extends PIXI.Filter {
    constructor(
      colorMap?:
        | HTMLImageElement
        | HTMLCanvasElement
        | PIXI.BaseTexture
        | PIXI.Texture,
      nearest?: boolean,
      mix?: number
    );
    colorMap: PIXI.Texture;
    nearest: boolean;
    mix: number;
    readonly colorSize: number;
  }
}

declare module '@pixi/filter-color-map' {
  export import ColorMapFilter = PIXI.filters.ColorMapFilter;
}
