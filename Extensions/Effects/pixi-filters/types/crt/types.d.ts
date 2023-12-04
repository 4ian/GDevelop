declare namespace PIXI.filters {
  export class CRTFilter extends PIXI.Filter {
    constructor(options?: CRTFilterOptions);
    curvature: number;
    lineWidth: number;
    lineContrast: number;
    verticalLine: boolean;
    noise: number;
    noiseSize: number;
    seed: number;
    vignetting: number;
    vignettingAlpha: number;
    vignettingBlur: number;
    time: number;
  }
  export interface CRTFilterOptions {
    curvature?: number;
    lineWidth?: number;
    lineContrast?: number;
    verticalLine?: boolean;
    noise?: number;
    noiseSize?: number;
    seed?: number;
    vignetting?: number;
    vignettingAlpha?: number;
    vignettingBlur?: number;
    time?: number;
  }
}

declare module '@pixi/filter-crt' {
  export import CRTFilter = PIXI.filters.CRTFilter;
  export import CRTFilterOptions = PIXI.filters.CRTFilterOptions;
}
