// @ts-nocheck - TODO: fix typings in this file

namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Glitch', {
    makePIXIFilter: function (layer, effectData) {
      const glitchFilter = new PIXI.filters.GlitchFilter();
      glitchFilter._animationTimer = 0;
      return glitchFilter;
    },
    update: function (filter, layer) {
      if (filter.animationFrequency !== 0) {
        filter._animationTimer += layer.getElapsedTime() / 1000;
        if (filter._animationTimer >= 1 / filter.animationFrequency) {
          filter.seed = Math.random();
          filter._animationTimer = 0;
        }
      }
    },
    updateDoubleParameter: function (filter, parameterName, value) {
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
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {
      if (parameterName === 'average') {
        filter.average = value;
      }
    },
  });
}
