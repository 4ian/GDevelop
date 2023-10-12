namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Outline',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const outlineFilter = new PIXI.filters.OutlineFilter();
        return outlineFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const outlineFilter = (filter as unknown) as PIXI.filters.OutlineFilter;
        if (parameterName === 'thickness') {
          outlineFilter.thickness = value;
        } else if (parameterName === 'padding') {
          outlineFilter.padding = value;
        }
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const outlineFilter = (filter as unknown) as PIXI.filters.OutlineFilter;
        if (parameterName === 'color') {
          outlineFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
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
