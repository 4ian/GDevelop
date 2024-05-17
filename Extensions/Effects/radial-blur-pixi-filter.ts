namespace gdjs {
  interface RadialBlurFilterExtra {
    // extra properties are stored on the filter.
    _centerX: number;
    _centerY: number;
  }
  interface RadialBlurFilterNetworkSyncData {
    r: number;
    a: number;
    ks: number;
    cx: number;
    cy: number;
    p: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'RadialBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const radialBlurFilter = new PIXI.filters.RadialBlurFilter();
        return radialBlurFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter &
          RadialBlurFilterExtra;
        radialBlurFilter.center[0] = Math.round(
          radialBlurFilter._centerX * target.getWidth()
        );
        radialBlurFilter.center[1] = Math.round(
          radialBlurFilter._centerY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter &
          RadialBlurFilterExtra;
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
          radialBlurFilter._centerX = value;
        } else if (parameterName === 'centerY') {
          radialBlurFilter._centerY = value;
        } else if (parameterName === 'padding') {
          radialBlurFilter.padding = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter &
          RadialBlurFilterExtra;
        if (parameterName === 'radius') {
          radialBlurFilter.radius;
        }
        if (parameterName === 'angle') {
          radialBlurFilter.angle;
        }
        if (parameterName === 'kernelSize') {
          radialBlurFilter.kernelSize;
        }
        if (parameterName === 'centerX') {
          radialBlurFilter._centerX;
        }
        if (parameterName === 'centerY') {
          radialBlurFilter._centerY;
        }
        if (parameterName === 'padding') {
          radialBlurFilter.padding;
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
      getNetworkSyncData(filter: PIXI.Filter): RadialBlurFilterNetworkSyncData {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter &
          RadialBlurFilterExtra;
        return {
          r: radialBlurFilter.radius,
          a: radialBlurFilter.angle,
          ks: radialBlurFilter.kernelSize,
          cx: radialBlurFilter._centerX,
          cy: radialBlurFilter._centerY,
          p: radialBlurFilter.padding,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: RadialBlurFilterNetworkSyncData
      ) {
        const radialBlurFilter = (filter as unknown) as PIXI.filters.RadialBlurFilter &
          RadialBlurFilterExtra;
        radialBlurFilter.radius = data.r;
        radialBlurFilter.angle = data.a;
        radialBlurFilter.kernelSize = data.ks;
        radialBlurFilter._centerX = data.cx;
        radialBlurFilter._centerY = data.cy;
        radialBlurFilter.padding = data.p;
      }
    })()
  );
}
