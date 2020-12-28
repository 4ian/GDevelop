// @ts-nocheck - TODO: fix typings in this file

namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Reflection', {
    makePIXIFilter: function (layer, effectData) {
      let time = 0;
      const reflectionFilter = new PIXI.filters.ReflectionFilter(
        effectData.booleanParameters.mirror,
        effectData.doubleParameters.boundary,
        [
          effectData.doubleParameters.amplitudeStart,
          effectData.doubleParameters.amplitudeEnding,
        ],
        [
          effectData.doubleParameters.waveLengthStart,
          effectData.doubleParameters.waveLengthEnding,
        ],
        [
          effectData.doubleParameters.alphaStart,
          effectData.doubleParameters.alphaEnding,
        ],
        time
      );
      return reflectionFilter;
    },
    update: function (filter, layer) {
      if (filter.animationSpeed !== 0) {
        filter.time += (layer.getElapsedTime() / 1000) * filter.animationSpeed;
      }
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'boundary') {
        filter.boundary = value;
      }
      if (parameterName === 'amplitudeStart') {
        filter.amplitude[0] = value;
      }
      if (parameterName === 'amplitudeEnding') {
        filter.amplitude[1] = value;
      }
      if (parameterName === 'waveLengthStart') {
        filter.waveLength[0] = value;
      }
      if (parameterName === 'waveLengthEnding') {
        filter.waveLength[1] = value;
      }
      if (parameterName === 'alphaStart') {
        filter.alpha[0] = value;
      }
      if (parameterName === 'alphaEnding') {
        filter.alpha[1] = value;
      }
      if (parameterName === 'animationSpeed') {
        filter.animationSpeed = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {
      if (parameterName === 'mirror') {
        filter.mirror = value;
      }
    },
  });
}
