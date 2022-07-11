declare namespace PIXI.filters {
  export class OldFilmFilter extends PIXI.Filter {
    constructor(options?: OldFilmFilterOptions, seed?: number);
    constructor(seed?: number);
    sepia: number;
    noise: number;
    noiseSize: number;
    scratch: number;
    scratchDensity: number;
    scratchWidth: number;
    vignetting: number;
    vignettingAlpha: number;
    vignettingBlur: number;
    seed: number;
  }
  export interface OldFilmFilterOptions {
    sepia?: number;
    noise?: number;
    noiseSize?: number;
    scratch?: number;
    scratchDensity?: number;
    scratchWidth?: number;
    vignetting?: number;
    vignettingAlpha?: number;
    vignettingBlur?: number;
  }
}

declare module '@pixi/filter-old-film' {
  export import OldFilmFilter = PIXI.filters.OldFilmFilter;
  export import OldFilmFilterOptions = PIXI.filters.OldFilmFilterOptions;
}
