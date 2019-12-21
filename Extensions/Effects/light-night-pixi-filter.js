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
    '}',
  ].join('\n');
  var uniforms = {
    opacity: { type: '1f', value: 1 },
  };

  PIXI.Filter.call(this, vertexShader, fragmentShader, uniforms);
};

gdjs.LightNightPixiFilter.prototype = Object.create(PIXI.Filter.prototype);
gdjs.LightNightPixiFilter.prototype.constructor = gdjs.LightNightPixiFilter;

gdjs.PixiFiltersTools.registerFilterCreator('LightNight', {
  makePIXIFilter: function(layer, effectData) {
    var filter = new gdjs.LightNightPixiFilter();
    return filter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName !== 'opacity') return;

    filter.uniforms.opacity = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {},
});
