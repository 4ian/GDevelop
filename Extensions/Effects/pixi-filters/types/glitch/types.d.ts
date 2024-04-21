declare namespace PIXI.filters {
  export class GlitchFilter extends PIXI.Filter {
    constructor(options?: GlitchFilterOptions);
    slices: number;
    offset: number;
    direction: number;
    fillMode: number;
    seed: number;
    average: boolean;
    minSize: number;
    sampleSize: number;
    red: PIXI.Point;
    green: PIXI.Point;
    blue: PIXI.Point;
    sizes: Float32Array | number[];
    offsets: Float32Array | number[];
    refresh(): void;
    shuffle(): void;
    redraw(): void;
    readonly texture: PIXI.Texture;
  }
  export interface GlitchFilterOptions {
    slices: number;
    offset: number;
    direction: number;
    fillMode: number;
    seed: number;
    average: boolean;
    minSize: number;
    sampleSize: number;
    red: PIXI.Point;
    green: PIXI.Point;
    blue: PIXI.Point;
  }
}

declare module '@pixi/filter-glitch' {
  export import GlitchFilter = PIXI.filters.GlitchFilter;
  export import GlitchFilterOptions = PIXI.filters.GlitchFilterOptions;
}
