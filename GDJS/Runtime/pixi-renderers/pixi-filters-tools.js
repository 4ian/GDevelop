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

gdjs.PixiFiltersTools.getFilter = function(filterName) {
    if (gdjs.PixiFiltersTools._filters.hasOwnProperty(filterName))
        return gdjs.PixiFiltersTools._filters[filterName];

    return null;
}
