namespace gdjs {
  interface CRTFilterExtra {
    _animationTimer: number;
    animationSpeed: number;
    animationFrequency: number;
  }
  interface CRTFilterNetworkSyncData {
    lw: number;
    lc: number;
    n: number;
    c: number;
    ns: number;
    v: number;
    va: number;
    vb: number;
    as: number;
    af: number;
    p: number;
    vl: boolean;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'CRT',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const filter = new PIXI.filters.CRTFilter();
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter &
          CRTFilterExtra;
        crtFilter._animationTimer = 0;
        return crtFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter &
          CRTFilterExtra;
        if (crtFilter.animationSpeed !== 0) {
          // Multiply by 10 so that the default value is a sensible speed
          crtFilter.time +=
            (target.getElapsedTime() / 1000) * 10 * crtFilter.animationSpeed;
        }
        if (crtFilter.animationFrequency !== 0) {
          crtFilter._animationTimer += target.getElapsedTime() / 1000;
          if (crtFilter._animationTimer >= 1 / crtFilter.animationFrequency) {
            crtFilter.seed = Math.random();
            crtFilter._animationTimer = 0;
          }
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter &
          CRTFilterExtra;
        if (parameterName === 'lineWidth') {
          crtFilter.lineWidth = value;
        } else if (parameterName === 'lineContrast') {
          crtFilter.lineContrast = value;
        } else if (parameterName === 'noise') {
          crtFilter.noise = value;
        } else if (parameterName === 'curvature') {
          crtFilter.curvature = value;
        } else if (parameterName === 'noiseSize') {
          crtFilter.noiseSize = value;
        } else if (parameterName === 'vignetting') {
          crtFilter.vignetting = value;
        } else if (parameterName === 'vignettingAlpha') {
          crtFilter.vignettingAlpha = value;
        } else if (parameterName === 'vignettingBlur') {
          crtFilter.vignettingBlur = value;
        } else if (parameterName === 'animationSpeed') {
          crtFilter.animationSpeed = value;
        } else if (parameterName === 'animationFrequency') {
          crtFilter.animationFrequency = value;
        } else if (parameterName === 'padding') {
          crtFilter.padding = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter &
          CRTFilterExtra;
        if (parameterName === 'lineWidth') {
          return crtFilter.lineWidth;
        }
        if (parameterName === 'lineContrast') {
          return crtFilter.lineContrast;
        }
        if (parameterName === 'noise') {
          return crtFilter.noise;
        }
        if (parameterName === 'curvature') {
          return crtFilter.curvature;
        }
        if (parameterName === 'noiseSize') {
          return crtFilter.noiseSize;
        }
        if (parameterName === 'vignetting') {
          return crtFilter.vignetting;
        }
        if (parameterName === 'vignettingAlpha') {
          return crtFilter.vignettingAlpha;
        }
        if (parameterName === 'vignettingBlur') {
          return crtFilter.vignettingBlur;
        }
        if (parameterName === 'animationSpeed') {
          return crtFilter.animationSpeed;
        }
        if (parameterName === 'animationFrequency') {
          return crtFilter.animationFrequency;
        }
        if (parameterName === 'padding') {
          return crtFilter.padding;
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
      ) {
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter;
        if (parameterName === 'verticalLine') {
          crtFilter.verticalLine = value;
        }
      }
      getNetworkSyncData(filter: PIXI.Filter): CRTFilterNetworkSyncData {
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter &
          CRTFilterExtra;
        return {
          lw: crtFilter.lineWidth,
          lc: crtFilter.lineContrast,
          n: crtFilter.noise,
          c: crtFilter.curvature,
          ns: crtFilter.noiseSize,
          v: crtFilter.vignetting,
          va: crtFilter.vignettingAlpha,
          vb: crtFilter.vignettingBlur,
          as: crtFilter.animationSpeed,
          af: crtFilter.animationFrequency,
          p: crtFilter.padding,
          vl: crtFilter.verticalLine,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: CRTFilterNetworkSyncData
      ) {
        const crtFilter = (filter as unknown) as PIXI.filters.CRTFilter &
          CRTFilterExtra;
        crtFilter.lineWidth = data.lw;
        crtFilter.lineContrast = data.lc;
        crtFilter.noise = data.n;
        crtFilter.curvature = data.c;
        crtFilter.noiseSize = data.ns;
        crtFilter.vignetting = data.v;
        crtFilter.vignettingAlpha = data.va;
        crtFilter.vignettingBlur = data.vb;
        crtFilter.animationSpeed = data.as;
        crtFilter.animationFrequency = data.af;
        crtFilter.padding = data.p;
        crtFilter.verticalLine = data.vl;
      }
    })()
  );
}
