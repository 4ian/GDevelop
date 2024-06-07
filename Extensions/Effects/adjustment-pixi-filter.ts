namespace gdjs {
  interface AdjustmentFilterNetworkSyncData {
    ga: number;
    sa: number;
    co: number;
    br: number;
    r: number;
    g: number;
    b: number;
    a: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Adjustment',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const adjustmentFilter = new PIXI.filters.AdjustmentFilter();
        return adjustmentFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const adjustmentFilter = (filter as unknown) as PIXI.filters.AdjustmentFilter;
        if (parameterName === 'gamma') {
          adjustmentFilter.gamma = value;
        } else if (parameterName === 'saturation') {
          adjustmentFilter.saturation = value;
        } else if (parameterName === 'contrast') {
          adjustmentFilter.contrast = value;
        } else if (parameterName === 'brightness') {
          adjustmentFilter.brightness = value;
        } else if (parameterName === 'red') {
          adjustmentFilter.red = value;
        } else if (parameterName === 'green') {
          adjustmentFilter.green = value;
        } else if (parameterName === 'blue') {
          adjustmentFilter.blue = value;
        } else if (parameterName === 'alpha') {
          adjustmentFilter.alpha = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const adjustmentFilter = (filter as unknown) as PIXI.filters.AdjustmentFilter;
        if (parameterName === 'gamma') {
          return adjustmentFilter.gamma;
        }
        if (parameterName === 'saturation') {
          return adjustmentFilter.saturation;
        }
        if (parameterName === 'contrast') {
          return adjustmentFilter.contrast;
        }
        if (parameterName === 'brightness') {
          return adjustmentFilter.brightness;
        }
        if (parameterName === 'red') {
          return adjustmentFilter.red;
        }
        if (parameterName === 'green') {
          return adjustmentFilter.green;
        }
        if (parameterName === 'blue') {
          return adjustmentFilter.blue;
        }
        if (parameterName === 'alpha') {
          return adjustmentFilter.alpha;
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
      getNetworkSyncData(filter: PIXI.Filter): AdjustmentFilterNetworkSyncData {
        const adjustmentFilter = (filter as unknown) as PIXI.filters.AdjustmentFilter;
        return {
          ga: adjustmentFilter.gamma,
          sa: adjustmentFilter.saturation,
          co: adjustmentFilter.contrast,
          br: adjustmentFilter.brightness,
          r: adjustmentFilter.red,
          g: adjustmentFilter.green,
          b: adjustmentFilter.blue,
          a: adjustmentFilter.alpha,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: AdjustmentFilterNetworkSyncData
      ): void {
        const adjustmentFilter = (filter as unknown) as PIXI.filters.AdjustmentFilter;
        adjustmentFilter.gamma = data.ga;
        adjustmentFilter.saturation = data.sa;
        adjustmentFilter.contrast = data.co;
        adjustmentFilter.brightness = data.br;
        adjustmentFilter.red = data.r;
        adjustmentFilter.green = data.g;
        adjustmentFilter.blue = data.b;
        adjustmentFilter.alpha = data.a;
      }
    })()
  );
}
