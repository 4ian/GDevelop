declare namespace PIXI.filters {
  import PIXI = GlobalPIXIModule.PIXI;
  export class SimpleLightmapFilter extends PIXI.Filter {
    constructor(texture: PIXI.Texture, color?: number[] | number);
    alpha: number;
    color: number[] | number;
    texture: PIXI.Texture;
  }
}

declare module '@pixi/filter-simple-lightmap' {
  export import SimpleLightmapFilter = PIXI.filters.SimpleLightmapFilter;
}
