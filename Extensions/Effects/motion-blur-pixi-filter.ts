namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'MotionBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const motionBlurFilter = new PIXI.filters.MotionBlurFilter([0, 0]);
        return motionBlurFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const motionBlurFilter = (filter as unknown) as PIXI.filters.MotionBlurFilter;
        if (parameterName === 'velocityX') {
          // @ts-ignore Using the private member avoids to instantiate Arrays.
          motionBlurFilter._velocity.x = value;
        } else if (parameterName === 'velocityY') {
          // @ts-ignore Using the private member avoids to instantiate Arrays.
          motionBlurFilter._velocity.y = value;
        } else if (parameterName === 'kernelSize') {
          motionBlurFilter.kernelSize = value;
        } else if (parameterName === 'offset') {
          motionBlurFilter.offset = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
