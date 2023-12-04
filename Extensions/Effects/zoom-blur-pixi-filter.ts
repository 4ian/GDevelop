namespace gdjs {
  interface ZoomBlurFilterExtra {
    // extra properties are stored on the filter.
    _centerX: number;
    _centerY: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'ZoomBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter();
        return zoomBlurFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const zoomBlurFilter = (filter as unknown) as PIXI.filters.ZoomBlurFilter &
          ZoomBlurFilterExtra;
        zoomBlurFilter.center[0] = Math.round(
          zoomBlurFilter._centerX * target.getWidth()
        );
        zoomBlurFilter.center[1] = Math.round(
          zoomBlurFilter._centerY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const zoomBlurFilter = (filter as unknown) as PIXI.filters.ZoomBlurFilter &
          ZoomBlurFilterExtra;
        if (parameterName === 'centerX') {
          zoomBlurFilter._centerX = value;
        } else if (parameterName === 'centerY') {
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
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const zoomBlurFilter = (filter as unknown) as PIXI.filters.ZoomBlurFilter &
          ZoomBlurFilterExtra;
        if (parameterName === 'centerX') {
          return zoomBlurFilter._centerX;
        }
        if (parameterName === 'centerY') {
          return zoomBlurFilter._centerY;
        }
        if (parameterName === 'innerRadius') {
          return zoomBlurFilter.innerRadius;
        }
        if (parameterName === 'strength') {
          return zoomBlurFilter.strength;
        }
        if (parameterName === 'padding') {
          return zoomBlurFilter.padding;
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
