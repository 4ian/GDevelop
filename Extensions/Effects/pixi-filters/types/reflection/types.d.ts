declare namespace PIXI.filters {
  export class ReflectionFilter extends PIXI.Filter {
    constructor(options?: ReflectionFilterOptions);
    mirror: boolean;
    boundary: number;
    amplitude: number[];
    waveLength: number[];
    alpha: number[];
    time: number;
  }
  interface ReflectionFilterOptions {
    mirror?: boolean;
    boundary?: number;
    amplitude?: number[];
    waveLength?: number[];
    alpha?: number[];
    time?: number;
  }
}

declare module '@pixi/filter-reflection' {
  export import ReflectionFilter = PIXI.filters.ReflectionFilter;
  export import ReflectionFilterOptions = PIXI.filters.ReflectionFilterOptions;
}
