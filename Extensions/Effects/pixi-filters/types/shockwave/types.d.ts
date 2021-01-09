
declare namespace PIXI.filters {
    export class ShockwaveFilter extends PIXI.Filter {
        constructor(center?:PIXI.Point|number[], options?:ShockwaveFilterOptions, time?:number);
        center: PIXI.Point|number[];
        options: ShockwaveFilterOptions;
        time: number;
    }
    export interface ShockwaveFilterOptions {
        amplitude?: number;
        wavelength?: number;
        brightness?: number;
        speed?: number;
        radius?: number;
    }
}

declare module "@pixi/filter-shockwave" {
    export import ShockwaveFilter = PIXI.filters.ShockwaveFilter;
    export import ShockwaveFilterOptions = PIXI.filters.ShockwaveFilterOptions;
}
