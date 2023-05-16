namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Outline',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const outlineFilter = new PIXI.filters.OutlineFilter();
        return outlineFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const outlineFilter = (filter as unknown) as PIXI.filters.OutlineFilter;
        if (parameterName === 'thickness') {
          outlineFilter.thickness = value;
        } else if (parameterName === 'padding') {
          outlineFilter.padding = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {
        const outlineFilter = (filter as unknown) as PIXI.filters.OutlineFilter;
        if (parameterName === 'color') {
          outlineFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        }
      }
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
