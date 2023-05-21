namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'KawaseBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();
        return kawaseBlurFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const kawaseBlurFilter = (filter as unknown) as PIXI.filters.KawaseBlurFilter;
        if (parameterName === 'pixelizeX') {
          // @ts-ignore: fix these wrong parameters
          kawaseBlurFilter.pixelizeX = value;
        } else if (parameterName === 'pixelizeY') {
          // @ts-ignore: fix these wrong parameters
          kawaseBlurFilter.pixelizeY = value;
        } else if (parameterName === 'blur') {
          kawaseBlurFilter.blur = value;
        } else if (parameterName === 'quality') {
          kawaseBlurFilter.quality = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
