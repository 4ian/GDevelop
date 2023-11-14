namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'RadialBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const radialBlurFilter = new PIXI.filters.RadialBlurFilter();
        return radialBlurFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter;
        radialBlurFilter.center[0] = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          radialBlurFilter._centerX * target.getWidth()
        );
        radialBlurFilter.center[1] = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          radialBlurFilter._centerY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter;
        if (parameterName === 'radius') {
          radialBlurFilter.radius = value < 0 ? -1 : value;
        } else if (parameterName === 'angle') {
          radialBlurFilter.angle = value;
        } else if (parameterName === 'kernelSize') {
          radialBlurFilter.kernelSize = gdjs.PixiFiltersTools.clampKernelSize(
            value,
            3,
            25
          );
        } else if (parameterName === 'centerX') {
          // @ts-ignore - extra properties are stored on the filter.
          radialBlurFilter._centerX = value;
        } else if (parameterName === 'centerY') {
          // @ts-ignore - extra properties are stored on the filter.
          radialBlurFilter._centerY = value;
        } else if (parameterName === 'padding') {
          radialBlurFilter.padding = value;
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
