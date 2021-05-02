declare namespace PIXI.filters {
  import PIXI = GlobalPIXIModule.PIXI;
  export class MotionBlurFilter extends PIXI.Filter {
    constructor(
      velocity: PIXI.ObservablePoint | PIXI.Point | number[],
      kernelSize?: number,
      offset?: number
    );
    velocity: PIXI.ObservablePoint;
    kernelSize: number;
    offset: number;
  }
}

declare module '@pixi/filter-motion-blur' {
  export import MotionBlurFilter = PIXI.filters.MotionBlurFilter;
}
