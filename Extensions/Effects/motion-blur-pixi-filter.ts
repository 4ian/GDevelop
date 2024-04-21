namespace gdjs {
  interface MotionBlurFilterExtra {
    /**Use the private member avoids to instantiate Arrays.*/
    _velocity: PIXI.Point;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'MotionBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const motionBlurFilter = new PIXI.filters.MotionBlurFilter([0, 0]);
        return motionBlurFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const motionBlurFilter = filter as PIXI.filters.MotionBlurFilter &
          MotionBlurFilterExtra;
        if (parameterName === 'velocityX') {
          motionBlurFilter._velocity.x = value;
        } else if (parameterName === 'velocityY') {
          motionBlurFilter._velocity.y = value;
        } else if (parameterName === 'kernelSize') {
          motionBlurFilter.kernelSize = value;
        } else if (parameterName === 'offset') {
          motionBlurFilter.offset = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const motionBlurFilter = filter as PIXI.filters.MotionBlurFilter &
          MotionBlurFilterExtra;
        if (parameterName === 'velocityX') {
          return motionBlurFilter._velocity.x;
        }
        if (parameterName === 'velocityY') {
          return motionBlurFilter._velocity.y;
        }
        if (parameterName === 'kernelSize') {
          return motionBlurFilter.kernelSize;
        }
        if (parameterName === 'offset') {
          return motionBlurFilter.offset;
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
