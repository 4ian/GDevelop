gdjs.LightRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;
  this._manager = runtimeObject.getObstaclesManager();
  this._geometry = new PIXI.Geometry();
  this._radius = runtimeObject.getRadius();
  this._color = runtimeObject.getColor().map(function (item) {
    return item / 255;
  });
  this.DEBUG = runtimeObject.getDebugMode();
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
      //TODO: Fix the index buffer.
      .addIndex([0, 1, 2, 2, 3, 0]);
    this._light = new PIXI.Mesh(this._geometry, this._shader);
  }
  this._light.blendMode = PIXI.BLEND_MODES.ADD;

  if (this.DEBUG) {
    if (this._graphics === undefined) {
      this._graphics = new PIXI.Graphics();
      this._graphics
        .lineStyle(1, 0xff0000, 1)
        .moveTo(this._object.x, this._object.y)
        .lineTo(this._object.x - this._radius, this._object.y + this._radius)
        .moveTo(this._object.x, this._object.y)
        .lineTo(this._object.x + this._radius, this._object.y + this._radius)
        .moveTo(this._object.x, this._object.y)
        .lineTo(this._object.x + this._radius, this._object.y - this._radius)
        .moveTo(this._object.x, this._object.y)
        .lineTo(this._object.x - this._radius, this._object.y - this._radius);
    }
    if (this._debugLight === undefined) {
      this._debugLight = new PIXI.Container();
      this._debugLight.addChild(this._light);
      this._debugLight.addChild(this._graphics);
    }
  }
};

gdjs.LightRuntimeObjectRenderer = gdjs.LightRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.LightRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  // Mandatory, return the internal PIXI object used for your object:
  if (this.DEBUG) {
    return this._debugLight;
  }
  return this._light;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function () {
  if (this.DEBUG) this.updateGraphics();
  this.updateVertexBuffer();
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateGraphics = function () {
  var vertices = [this._object.x, this._object.y];
  var raycast = this.raycastTest().reduce(function (acc, val) {
    return acc.concat(val);
  });
  vertices.push.apply(vertices, raycast);

  this._graphics.clear();
  for (var i = 0; i < vertices.length; i += 2) {
    var lineColor = i % 4 === 0 ? 0xff0000 : 0x00ff00;
    this._graphics
      .lineStyle(1, lineColor, 1)
      .moveTo(vertices[0], vertices[1])
      .lineTo(vertices[i], vertices[i + 1]);
    if (i !== vertices.length - 2) {
      this._graphics.lineTo(vertices[i + 2], vertices[i + 3]);
    } else {
      this._graphics.lineTo(vertices[2], vertices[3]);
    }
  }
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateVertexBuffer = function () {
  this._light.shader.uniforms.center = new Float32Array([
    this._object.x,
    this._object.y,
  ]);

  var raycast = this.raycastTest();

  var vertexBuffer = [this._object.x, this._object.y];

  for (var i = 2; i < 2 * raycast.length + 2; i += 2) {
    vertexBuffer[i] = raycast[i / 2 - 1][0];
    vertexBuffer[i + 1] = raycast[i / 2 - 1][1];
  }

  var indexBuffer = [];

  for (var i = 0; i < 3 * raycast.length; i += 3) {
    indexBuffer[i] = 0;
    indexBuffer[i + 1] = i / 3 + 1;
    if (i / 3 + 1 !== raycast.length) indexBuffer[i + 2] = i / 3 + 2;
    else indexBuffer[i + 2] = 1;
  }

  this._light.geometry
    .getBuffer('aVertexPosition')
    .update(new Float32Array(vertexBuffer));

  this._light.geometry.getIndex().update(new Uint16Array(indexBuffer));
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

  var polygons = hitBoxes.reduce(function (acc, val) {
    return acc.concat(val);
  });
  var vertices = polygons
    .map(function (poly) {
      return poly.vertices;
    })
    .reduce(function (acc, val) {
      return acc.concat(val);
    });

  function _calculatePOI(angle) {
    var targetX = centerX + halfOfDiag * Math.cos(angle);
    var targetY = centerY + halfOfDiag * Math.sin(angle);
    var minSqDist = halfOfDiag * halfOfDiag;
    var minPOI = [];
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
    if (!minPOI.length) return null;
    return minPOI;
  }

  var _raycastResult = [];

  for (var vertex of vertices) {
    var xdiff = vertex[0] - centerX;
    var ydiff = vertex[1] - centerY;
    var angle = Math.atan2(ydiff, xdiff);

    var result = _calculatePOI(angle);
    if (result) {
      _raycastResult.push({
        vertex: result,
        angle: angle,
      });
    }

    // TODO: Check whether we need to raycast these two extra rays or not.
    var result = _calculatePOI(angle + 0.0001);
    if (result) {
      _raycastResult.push({
        vertex: result,
        angle: angle + 0.0001,
      });
    }
    var result = _calculatePOI(angle - 0.0001);
    if (result) {
      _raycastResult.push({
        vertex: result,
        angle: angle - 0.0001,
      });
    }
  }

  return _raycastResult
    .sort(function (a, b) {
      if (a.angle < b.angle) return -1;
      if (a.angle === b.angle) return 0;
      if (a.angle > b.angle) return 1;
    })
    .filter(function (element, index, array) {
      if (index === 0) return true;
      if (array[index].angle !== array[index - 1].angle) {
        return true;
      }
      return false;
    })
    .map(function (element) {
      return element.vertex;
    });
};
