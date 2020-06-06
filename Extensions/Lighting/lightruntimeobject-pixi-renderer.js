gdjs.LightRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;
  this._geometry = new PIXI.Geometry();
  this._radius = runtimeObject.getRadius();
  this._shader = PIXI.Shader.from(`
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    varying vec2 vPos;

    void main() {
        vPos = aVertexPosition;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }`, `
    precision mediump float;
    uniform vec2 center;
    uniform float radius;
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vPos;

    void main() {
        float d = distance(center, vPos);
        float intensity = log(radius/d);
        gl_FragColor = vec4(vec3(0.35*intensity), 1.0);
    }
    `, {
      center: [50 + runtimeObject.getRadius(), 50 + runtimeObject.getRadius()],
      radius: this._radius//runtimeObject.getRadius(),
    });
  if(this._light === undefined) {
    this._geometry.addAttribute('aVertexPosition', [
      50, 50 + runtimeObject.getRadius() * 2,
      50 + runtimeObject.getRadius() * 2, 50 + runtimeObject.getRadius() * 2,
      50 + runtimeObject.getRadius() * 2, 50,
      50, 50, 
    ], 2).addIndex([0,1,2,2,3,0]);
    this._light = new PIXI.Mesh(this._geometry, this._shader);
  }
  this._light.blendMode = PIXI.BLEND_MODES.ADD; 
};

gdjs.LightRuntimeObjectRenderer = gdjs.LightRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.LightRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  // Mandatory, return the internal PIXI object used for your object:
  return this._light;
};
