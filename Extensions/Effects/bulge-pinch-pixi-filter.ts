namespace gdjs {
  interface BulgePinchFilterNetworkSyncData {
    cx: number;
    cy: number;
    r: number;
    s: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BulgePinch',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const bulgePinchFilter = new PIXI.filters.BulgePinchFilter();
        return bulgePinchFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const bulgePinchFilter = (filter as unknown) as PIXI.filters.BulgePinchFilter;
        if (parameterName === 'centerX') {
          bulgePinchFilter.center[0] = value;
        } else if (parameterName === 'centerY') {
          bulgePinchFilter.center[1] = value;
        } else if (parameterName === 'radius') {
          bulgePinchFilter.radius = value;
        } else if (parameterName === 'strength') {
          bulgePinchFilter.strength = gdjs.PixiFiltersTools.clampValue(
            value,
            -1,
            1
          );
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const bulgePinchFilter = (filter as unknown) as PIXI.filters.BulgePinchFilter;
        if (parameterName === 'centerX') {
          return bulgePinchFilter.center[0];
        }
        if (parameterName === 'centerY') {
          return bulgePinchFilter.center[1];
        }
        if (parameterName === 'radius') {
          return bulgePinchFilter.radius;
        }
        if (parameterName === 'strength') {
          return bulgePinchFilter.strength;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
      getNetworkSyncData(filter: PIXI.Filter): BulgePinchFilterNetworkSyncData {
        const bulgePinchFilter = (filter as unknown) as PIXI.filters.BulgePinchFilter;
        return {
          cx: bulgePinchFilter.center[0],
          cy: bulgePinchFilter.center[1],
          r: bulgePinchFilter.radius,
          s: bulgePinchFilter.strength,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: BulgePinchFilterNetworkSyncData
      ) {
        const bulgePinchFilter = (filter as unknown) as PIXI.filters.BulgePinchFilter;
        bulgePinchFilter.center[0] = data.cx;
        bulgePinchFilter.center[1] = data.cy;
        bulgePinchFilter.radius = data.r;
        bulgePinchFilter.strength = data.s;
      }
    })()
  );
}
