namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'ZoomBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter();
        return zoomBlurFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const zoomBlurFilter = (filter as unknown) as PIXI.filters.ZoomBlurFilter;
        zoomBlurFilter.center[0] = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          zoomBlurFilter._centerX * target.getWidth()
        );
        zoomBlurFilter.center[1] = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          zoomBlurFilter._centerY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const zoomBlurFilter = (filter as unknown) as PIXI.filters.ZoomBlurFilter;
        if (parameterName === 'centerX') {
          // @ts-ignore - extra properties are stored on the filter.
          zoomBlurFilter._centerX = value;
        } else if (parameterName === 'centerY') {
          // @ts-ignore - extra properties are stored on the filter.
          zoomBlurFilter._centerY = value;
        } else if (parameterName === 'innerRadius') {
          zoomBlurFilter.innerRadius = value;
        } else if (parameterName === 'strength') {
          zoomBlurFilter.strength = gdjs.PixiFiltersTools.clampValue(
            value / 10,
            0,
            20
          );
        } else if (parameterName === 'padding') {
          zoomBlurFilter.padding = value;
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
