// @ts-nocheck - TODO: fix typings in this file

namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'CRT',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const crtFilter = new PIXI.filters.CRTFilter();
        crtFilter._animationTimer = 0;
        return crtFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        if (filter.animationSpeed !== 0) {
          // Multiply by 10 so that the default value is a sensible speed
          filter.time +=
            (target.getElapsedTime() / 1000) * 10 * filter.animationSpeed;
        }
        if (filter.animationFrequency !== 0) {
          filter._animationTimer += target.getElapsedTime() / 1000;
          if (filter._animationTimer >= 1 / filter.animationFrequency) {
            filter.seed = Math.random();
            filter._animationTimer = 0;
          }
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        if (parameterName === 'lineWidth') {
          filter.lineWidth = value;
        } else if (parameterName === 'lineContrast') {
          filter.lineContrast = value;
        } else if (parameterName === 'noise') {
          filter.noise = value;
        } else if (parameterName === 'curvature') {
          filter.curvature = value;
        } else if (parameterName === 'noiseSize') {
          filter.noiseSize = value;
        } else if (parameterName === 'vignetting') {
          filter.vignetting = value;
        } else if (parameterName === 'vignettingAlpha') {
          filter.vignettingAlpha = value;
        } else if (parameterName === 'vignettingBlur') {
          filter.vignettingBlur = value;
        } else if (parameterName === 'animationSpeed') {
          filter.animationSpeed = value;
        } else if (parameterName === 'animationFrequency') {
          filter.animationFrequency = value;
        } else if (parameterName === 'padding') {
          filter.padding = value;
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
      ) {
        if (parameterName === 'verticalLine') {
          filter.verticalLine = value;
        }
      }
    })()
  );
}
