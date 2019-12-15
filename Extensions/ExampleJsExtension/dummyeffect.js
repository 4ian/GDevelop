// A simple PIXI filter doing some color changes
PIXI.DummyPixiFilter = function() {
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
PIXI.DummyPixiFilter.prototype = Object.create(PIXI.Filter.prototype);
PIXI.DummyPixiFilter.prototype.constructor = PIXI.DummyPixiFilter;

// Register the effect type and associate it with a "filter creator" object, containing
// functions to create and manipulate the filter.
// Don't forget your extension name in the effect type!
gdjs.PixiFiltersTools.registerFilterCreator('MyDummyExtension::DummyEffect', {
    // MakePIXIFilter should return a PIXI.Filter, that will be applied on the PIXI.Container (for layers)
    // or the PIXI.DisplayObject (for objects).
    makePIXIFilter: function() {
        var filter = new PIXI.DummyPixiFilter();
        return filter;
    },
    // The function that will be called to update a parameter of the PIXI filter with a new value
    updateParameter: function(filter, parameterName, value) {
        if (parameterName !== 'opacity') return;

        filter.uniforms.opacity = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
});
