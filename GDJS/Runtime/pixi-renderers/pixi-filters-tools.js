gdjs.PixiFiltersTools = function() {};

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

  PIXI.AbstractFilter.call(this,
    vertexShader,
    fragmentShader,
    uniforms
  );
}
gdjs.NightPixiFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
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

  PIXI.AbstractFilter.call(this,
    vertexShader,
    fragmentShader,
    uniforms
  );
}
gdjs.LightNightPixiFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
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

            filter.uniforms[parameterName].value = value;
        },
    },
    LightNight: {
        makeFilter: function() {
            var filter = new gdjs.LightNightPixiFilter();
            return filter;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'opacity') return;

            filter.uniforms.opacity.value = value;
        },
    },
    Sepia: {
        makeFilter: function() {
            return new PIXI.filters.SepiaFilter();
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'opacity') return;

            filter.sepia = value;
        },
    },
};

gdjs.PixiFiltersTools.getFilter = function(filterName) {
    if (gdjs.PixiFiltersTools._filters.hasOwnProperty(filterName))
        return gdjs.PixiFiltersTools._filters[filterName];

    return null;
}
