declare namespace PIXI.filters {
  export class BloomFilter extends PIXI.Filter {
    constructor(
      blur?: number | PIXI.Point | number[],
      quality?: number,
      resolution?: number,
      kernelSize?: number
    );
    blur: number;
    blurX: number;
    blurY: number;
  }
}

declare module '@pixi/filter-bloom' {
  export import BloomFilter = PIXI.filters.BloomFilter;
}
