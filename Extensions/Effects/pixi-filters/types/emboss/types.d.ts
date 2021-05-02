declare namespace PIXI.filters {
  import PIXI = GlobalPIXIModule.PIXI;
  export class EmbossFilter extends PIXI.Filter {
    constructor(strength?: number);
    strength: number;
  }
}

declare module '@pixi/filter-emboss' {
  export import EmbossFilter = PIXI.filters.EmbossFilter;
}
