gdjs.LightRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;
  this._manager = runtimeObject.getObstaclesManager();
  this._geometry = new PIXI.Geometry();
  this._radius = runtimeObject.getRadius();
  this._color = runtimeObject.getColor().map(function (item) {
    return item / 255;
  });
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
  // var vertices = [this._object.x + this._radius, this._object.y + this._radius];
  this._light.shader.uniforms.center = new Float32Array([
    this._object.x + this._radius,
    this._object.y + this._radius,
  ]);

  console.log(this.raycastTest());
  // if (raycast.length !== 0) {
  //   vertices.push.apply(vertices, raycast.flat(1));
  //   this._light.geometry
  //   .getBuffer('aVertexPosition')
  //   .update(new Float32Array(vertices));

  //   var indices = [0,1,2];

  //   for(var i = 3; i < vertices.length; i+=3) {
  //     indices[i] = 0;
  //     indices[i + 1] = indices[i - 1];
  //     indices[i + 2] = indices[i + 1] + 1;
  //   }

  //   this._light.geometry
  //   .getIndex().update(new Uint16Array(indices));
  // } else {
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
//  }
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.raycastTest = function () {
  var result = [];
  var center = [this._object.x + this._radius, this._object.y + this._radius];
  var halfOfDiag = Math.sqrt(2) * this._radius;

  this._manager.getAllObstaclesAround(this._object, this._radius, result);
  var hitBoxes = result.map(function (item) {
    return item.owner.hitBoxes;
  });
  hitBoxes.push(this._object.getHitBoxes());

  var polygons = hitBoxes.flat(1);
  var vertices = polygons.map(function (poly) {
    return poly.vertices;
  }).flat(1);

  function _calculatePOI(angle) {
    var minDist = halfOfDiag;
    var minPOI = [];
    for (var poly of polygons) {
      var poi = gdjs.Polygon.raycastTest(
        poly,
        center[0],
        center[1],
        center[0] + halfOfDiag * Math.cos(angle),
        center[1] + halfOfDiag * Math.sin(angle)
      )

      if (poi.closeSqDist <= minDist) {
        minDist = poi.closeSqDist;
        minPOI.length = 0;
        minPOI.push.apply(minPOI, [poi.closeX, poi.closeY]);
      } 
    }
    console.log(minPOI);
    return minPOI;
  }

  var _raycastResult = [];

  for (var vertex of vertices) {
    var xdiff = vertex[0] - center[0];
    var ydiff = vertex[1] - center[1];
    var angle = Math.atan(ydiff/xdiff);

    if (xdiff < 0) angle += Math.PI;
    if (xdiff >= 0 && ydiff < 0) angle += 2 * Math.PI;

    _raycastResult.push({
      vertex: _calculatePOI(angle),
      angle: angle
    });

    // TODO: Check whether we need to raycast these two extra rays or not.
    _raycastResult.push({
      vertex: _calculatePOI(angle + 0.01),
      angle: angle + 0.01
    });
    _raycastResult.push({
      vertex: _calculatePOI(angle - 0.01),
      angle: angle - 0.01
    });
  }

  return _raycastResult.sort(function (a, b) {
    if (a.angle < b.angle) return -1;
    if (a.angle > b.angle) return 1;
  }).map(function (item) {
    return item.vertex;
  });
};
