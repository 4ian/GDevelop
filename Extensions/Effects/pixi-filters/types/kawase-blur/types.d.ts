declare namespace PIXI.filters {
  export class KawaseBlurFilter extends PIXI.Filter {
    constructor(blur?: number | number[], quality?: number, clamp?: boolean);
    kernels: number[];
    pixelSize: number | PIXI.Point | number[];
    quality: number;
    blur: number;
    readonly clamp: boolean;
  }
}

declare module '@pixi/filter-kawase-blur' {
  export import KawaseBlurFilter = PIXI.filters.KawaseBlurFilter;
}
