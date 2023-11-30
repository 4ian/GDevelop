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
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
