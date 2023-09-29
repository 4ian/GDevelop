// @ts-nocheck - TODO: fix typings in this file

namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Godray',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const godrayFilter = new PIXI.filters.GodrayFilter();
        return godrayFilter;
      }
      updatePreRender(filter, target) {
        if (filter.animationSpeed !== 0) {
          filter.time +=
            (target.getElapsedTime() / 1000) * filter.animationSpeed;
        }
      }
      updateDoubleParameter(filter, parameterName, value) {
        if (parameterName === 'lacunarity') {
          filter.lacunarity = value;
        } else if (parameterName === 'angle') {
          filter.angle = value;
        } else if (parameterName === 'gain') {
          filter.gain = value;
        } else if (parameterName === 'light') {
          filter.light = value;
        } else if (parameterName === 'x') {
          filter.x = value;
        } else if (parameterName === 'y') {
          filter.y = value;
        } else if (parameterName === 'animationSpeed') {
          filter.animationSpeed = value;
        } else if (parameterName === 'padding') {
          filter.padding = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {
        if (parameterName === 'parallel') {
          filter.parallel = value;
        }
      }
    })()
  );
}
