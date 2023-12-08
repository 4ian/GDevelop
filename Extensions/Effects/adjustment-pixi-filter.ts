namespace gdjs {
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
    })()
  );
}
