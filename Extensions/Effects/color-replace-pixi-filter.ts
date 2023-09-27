namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'ColorReplace',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const colorReplaceFilter = new PIXI.filters.ColorReplaceFilter();
        return colorReplaceFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter;
        if (parameterName === 'epsilon') {
          colorReplaceFilter.epsilon = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {
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
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
