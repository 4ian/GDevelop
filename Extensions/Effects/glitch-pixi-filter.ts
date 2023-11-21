// @ts-nocheck - TODO: fix typings in this file

namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Glitch',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const glitchFilter = new PIXI.filters.GlitchFilter();
        glitchFilter._animationTimer = 0;
        return glitchFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
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
        if (parameterName === 'slices') {
          filter.slices = value;
        } else if (parameterName === 'offset') {
          filter.offset = value;
        } else if (parameterName === 'direction') {
          filter.direction = value;
        } else if (parameterName === 'fillMode') {
          filter.fillMode = value;
        } else if (parameterName === 'minSize') {
          filter.minSize = value;
        } else if (parameterName === 'sampleSize') {
          filter.sampleSize = value;
        } else if (parameterName === 'redX') {
          filter.red.x = value;
        } else if (parameterName === 'redY') {
          filter.red.y = value;
        } else if (parameterName === 'greenX') {
          filter.green.x = value;
        } else if (parameterName === 'greenY') {
          filter.green.y = value;
        } else if (parameterName === 'blueX') {
          filter.blue.x = value;
        } else if (parameterName === 'blueY') {
          filter.blue.y = value;
        } else if (parameterName === 'animationFrequency') {
          filter.animationFrequency = value;
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
        if (parameterName === 'average') {
          filter.average = value;
        }
      }
    })()
  );
}
