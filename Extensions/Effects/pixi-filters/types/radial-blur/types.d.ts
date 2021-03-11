declare namespace PIXI.filters {
  export class RadialBlurFilter extends PIXI.Filter {
    constructor(
      angle?: number,
      center?: number[] | PIXI.Point,
      kernelSize?: number,
      radius?: number
    );
    angle: number;
    center: number[] | PIXI.Point;
    kernelSize: number;
    radius: number;
  }
}

declare module '@pixi/filter-radial-blur' {
  export import RadialBlurFilter = PIXI.filters.RadialBlurFilter;
}
