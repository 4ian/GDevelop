declare namespace PIXI.filters {
  export class EmbossFilter extends PIXI.Filter {
    constructor(strength?: number);
    strength: number;
  }
}

declare module '@pixi/filter-emboss' {
  export import EmbossFilter = PIXI.filters.EmbossFilter;
}
