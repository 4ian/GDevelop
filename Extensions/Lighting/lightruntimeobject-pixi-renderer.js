gdjs.LightRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;
  this._geometry = new PIXI.Geometry();
  this._radius = runtimeObject.getRadius();
  this._color = runtimeObject.getColor().map((item) => item / 255);
  this._shader = PIXI.Shader.from(
    `
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    varying vec2 vPos;

    void main() {
        vPos = aVertexPosition;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }`,
    `
    precision mediump float;
    uniform vec2 center;
    uniform float radius;
    uniform vec3 color;
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vPos;

    void main() {
        float l = length(vPos - center);
        float intensity = 0.0;
        if(l < radius)
          intensity = clamp((radius - l)*(radius - l)/(radius*radius), 0.0, 1.0);
        gl_FragColor = vec4(color*intensity, 1.0);
    }
    `,
    {
      center: [runtimeObject.x + this._radius, runtimeObject.y + this._radius],
      radius: this._radius,
      color: this._color,
    }
  );
  if (this._light === undefined) {
    this._geometry
      .addAttribute(
        'aVertexPosition',
        [
          runtimeObject.x,
          runtimeObject.y + this._radius * 2,
          runtimeObject.x + this._radius * 2,
          runtimeObject.y + this._radius * 2,
          runtimeObject.x + this._radius * 2,
          runtimeObject.y,
          runtimeObject.x,
          runtimeObject.y,
        ],
        2
      )
      .addIndex([0, 1, 2, 2, 3, 0]);
    this._light = new PIXI.Mesh(this._geometry, this._shader);
  }
  this._light.blendMode = PIXI.BLEND_MODES.ADD;
};

gdjs.LightRuntimeObjectRenderer = gdjs.LightRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.LightRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  // Mandatory, return the internal PIXI object used for your object:
  return this._light;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function () {
  this.updateVertexBuffer();
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateVertexBuffer = function () {
  this._light.shader.uniforms.center = new Float32Array([
    this._object.x + this._radius,
    this._object.y + this._radius,
  ]);

  this._light.geometry
    .getBuffer('aVertexPosition')
    .update(
      new Float32Array([
        this._object.x,
        this._object.y + this._radius * 2,
        this._object.x + this._radius * 2,
        this._object.y + this._radius * 2,
        this._object.x + this._radius * 2,
        this._object.y,
        this._object.x,
        this._object.y,
      ])
    );
};
