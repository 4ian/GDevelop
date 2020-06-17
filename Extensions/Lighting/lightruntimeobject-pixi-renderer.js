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
      center: [runtimeObject.x, runtimeObject.y],
      radius: this._radius,
      color: this._color,
    }
  );
  if (this._light === undefined) {
    this._geometry
      .addAttribute(
        'aVertexPosition',
        [
          runtimeObject.x - this._radius,
          runtimeObject.y + this._radius,
          runtimeObject.x + this._radius,
          runtimeObject.y + this._radius,
          runtimeObject.x + this._radius,
          runtimeObject.y - this._radius,
          runtimeObject.x - this._radius,
          runtimeObject.y - this._radius,
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
  var vertices = [this._object.x, this._object.y];
  this._light.shader.uniforms.center = new Float32Array([
    this._object.x,
    this._object.y,
  ]);

  var raycast = this.raycastTest().flat(1);
  if (raycast.length !== 0) {
    vertices.push.apply(vertices, raycast);
    this._light.geometry
      .getBuffer('aVertexPosition')
      .update(new Float32Array(vertices));

    var indices = [0, 1, 2];

    for (var i = 3; i < 3 * vertices.length; i += 3) {
      indices[i] = 0;
      indices[i + 1] = indices[i - 1];
      if (i + 2 === 3 * vertices.length - 1) {
        indices[i + 2] = 1;
      } else {
        indices[i + 2] = indices[i + 1] + 1;
      }
    }

    console.log(indices, vertices.length);

    this._light.geometry.getIndex().update(new Uint16Array(indices));
  } else {
    this._light.geometry
      .getBuffer('aVertexPosition')
      .update(
        new Float32Array([
          this._object.x - this._radius,
          this._object.y + this._radius,
          this._object.x + this._radius,
          this._object.y + this._radius,
          this._object.x + this._radius,
          this._object.y - this._radius,
          this._object.x - this._radius,
          this._object.y - this._radius,
        ])
      );
  }
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.raycastTest = function () {
  var result = [];
  var centerX = this._object.x;
  var centerY = this._object.y;
  var halfOfDiag = Math.sqrt(2) * this._radius;

  this._manager.getAllObstaclesAround(this._object, this._radius, result);
  var hitBoxes = result.map(function (item) {
    return item.owner.getHitBoxes();
  });
  hitBoxes.push(this._object.getHitBoxes());

  var polygons = hitBoxes.flat(1);
  var vertices = polygons
    .map(function (poly) {
      return poly.vertices;
    })
    .flat(1);

  function _calculatePOI(angle) {
    var targetX = centerX + halfOfDiag * Math.cos(angle);
    var targetY = centerY + halfOfDiag * Math.sin(angle);
    var minSqDist = halfOfDiag * halfOfDiag;
    var minPOI = [targetX, targetY];
    for (var poly of polygons) {
      var poi = gdjs.Polygon.raycastTest(
        poly,
        centerX,
        centerY,
        targetX,
        targetY
      );

      if (poi.collision && poi.closeSqDist <= minSqDist) {
        minSqDist = poi.closeSqDist;
        minPOI[0] = poi.closeX;
        minPOI[1] = poi.closeY;
      }
    }

    return minPOI;
  }

  var _raycastResult = [];

  for (var vertex of vertices) {
    var xdiff = vertex[0] - centerX;
    var ydiff = vertex[1] - centerY;
    var angle = Math.atan2(ydiff, xdiff);

    _raycastResult.push({
      vertex: _calculatePOI(angle),
      angle: angle,
    });

    // TODO: Check whether we need to raycast these two extra rays or not.
    _raycastResult.push({
      vertex: _calculatePOI(angle + 0.0001),
      angle: angle + 0.0001,
    });
    _raycastResult.push({
      vertex: _calculatePOI(angle - 0.0001),
      angle: angle - 0.0001,
    });
  }

  return _raycastResult
    .sort(function (a, b) {
      if (a.angle < b.angle) return -1;
      if (a.angle === b.angle) return 0;
      if (a.angle > b.angle) return 1;
    })
    .map(function (item) {
      return item.vertex;
    });
};
