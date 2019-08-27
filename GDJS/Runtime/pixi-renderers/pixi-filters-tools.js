/**
 * Contains tools related to PIXI filters handling.
 */
gdjs.PixiFiltersTools = function() {};

gdjs.PixiFiltersTools.clampValue = function(value, min, max) { return Math.max(min, Math.min(max, value)); };
gdjs.PixiFiltersTools.clampKernelSize = function(value) { return (([5, 7, 9, 11, 13, 15].indexOf(value) !== -1) ? value : 5); };

gdjs.NightPixiFilter = function() {
  var vertexShader = null;
  var fragmentShader = [
    'precision mediump float;',
    '',
    'varying vec2 vTextureCoord;',
    'uniform sampler2D uSampler;',
    'uniform float intensity;',
    'uniform float opacity;',
    '',
    'void main(void)',
    '{',
    '   mat3 nightMatrix = mat3(-2.0 * intensity, -1.0 * intensity, 0, -1.0 * intensity, 0, 1.0 * intensity, 0, 1.0 * intensity, 2.0 * intensity);',
    '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
    '   gl_FragColor.rgb = mix(gl_FragColor.rgb, nightMatrix * gl_FragColor.rgb, opacity);',
    '}'
  ].join('\n');
  var uniforms = {
      intensity: { type: '1f', value: 1 },
      opacity: { type: '1f', value: 1 }
  };

  PIXI.Filter.call(this,
    vertexShader,
    fragmentShader,
    uniforms
  );
}
gdjs.NightPixiFilter.prototype = Object.create(PIXI.Filter.prototype);
gdjs.NightPixiFilter.prototype.constructor = gdjs.NightPixiFilter;

gdjs.LightNightPixiFilter = function() {
  var vertexShader = null;
  var fragmentShader = [
    'precision mediump float;',
    '',
    'varying vec2 vTextureCoord;',
    'uniform sampler2D uSampler;',
    'uniform float opacity;',
    '',
    'void main(void)',
    '{',
    '   mat3 nightMatrix = mat3(0.6, 0, 0, 0, 0.7, 0, 0, 0, 1.3);',
    '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
    '   gl_FragColor.rgb = mix(gl_FragColor.rgb, nightMatrix * gl_FragColor.rgb, opacity);',
    '}'
  ].join('\n');
  var uniforms = {
      opacity: { type: '1f', value: 1 }
  };

  PIXI.Filter.call(this,
    vertexShader,
    fragmentShader,
    uniforms
  );
}
gdjs.LightNightPixiFilter.prototype = Object.create(PIXI.Filter.prototype);
gdjs.LightNightPixiFilter.prototype.constructor = gdjs.LightNightPixiFilter;

gdjs.PixiFiltersTools._filters = {
    Night: {
        makeFilter: function() {
            var filter = new gdjs.NightPixiFilter();
            return filter;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'intensity' &&
                parameterName !== 'opacity') return;

            filter.uniforms[parameterName] = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        },
    },
    LightNight: {
        makeFilter: function() {
            var filter = new gdjs.LightNightPixiFilter();
            return filter;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'opacity') return;

            filter.uniforms.opacity = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        },
    },
    Sepia: {
        makeFilter: function() {
            var colorMatrix = new PIXI.filters.ColorMatrixFilter();
            colorMatrix.sepia();
            return colorMatrix;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'opacity') return;

            filter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        },
    },
    BlackAndWhite: {
        makeFilter: function() {
            var colorMatrix = new PIXI.filters.ColorMatrixFilter();
            colorMatrix.blackAndWhite();
            return colorMatrix;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'opacity') return;

            filter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        },
    },
    Brightness: {
        makeFilter: function() {
            var brightness = new PIXI.filters.ColorMatrixFilter();
            brightness.brightness();
            return brightness;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'brightness') return;

            filter.brightness(gdjs.PixiFiltersTools.clampValue(value, 0, 1));
        },
    },
    Noise: {
        makeFilter: function() {
            var noise = new PIXI.filters.NoiseFilter();
            return noise;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'noise') return;

            filter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        },
    },
    Blur: {
        makeFilter: function() {
            var blur = new PIXI.filters.BlurFilter();
            return blur;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'blur' &&
                parameterName !== 'quality' &&
                parameterName !== 'kernelSize' &&
                parameterName !== 'resolution') return;

            if (parameterName === 'kernelSize'){
                value = gdjs.PixiFiltersTools.clampKernelSize(value);
            }

            filter[parameterName] = value;
        },
    },
};

/**
 * Enable an effect.
 * @param {PIXI.Filter} filter The filter to enable or disable
 * @param {boolean} value Set to true to enable, false to disable
 */
gdjs.PixiFiltersTools.enableEffect = function(filter, value) {
    filter.enabled = value;
}

/**
 * Effect is enabled.
 * @param {PIXI.Filter} filter The filter to be checked
 * @return {boolean} true if the filter is enabled
 */
gdjs.PixiFiltersTools.isEffectEnabled = function(filter) {
    return filter.enabled;
}

/**
 * Return the filter with the given name, if any.
 * @param {string} filterName The name of the filter to get
 * @return {?gdjsPixiFiltersToolsFilter} The filter wrapper, if any (null otherwise).
 */
gdjs.PixiFiltersTools.getFilter = function(filterName) {
    if (gdjs.PixiFiltersTools._filters.hasOwnProperty(filterName))
        return gdjs.PixiFiltersTools._filters[filterName];

    return null;
}

// Type definitions:

/**
 * The type of a filter used to manipulate a Pixi filter.
 * @typedef gdjsPixiFiltersToolsFilter
 * @type {object}
 * @property {PIXI.Filter} filter The PIXI filter
 * @property {Function} updateParameter The function to be called to update a parameter
 */
