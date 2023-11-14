namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'ColorReplace',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const colorReplaceFilter = new PIXI.filters.ColorReplaceFilter();
        return colorReplaceFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter;
        if (parameterName === 'epsilon') {
          colorReplaceFilter.epsilon = value;
        }
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter;
        if (parameterName === 'originalColor') {
          colorReplaceFilter.originalColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        } else if (parameterName === 'newColor') {
          colorReplaceFilter.newColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        }
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
