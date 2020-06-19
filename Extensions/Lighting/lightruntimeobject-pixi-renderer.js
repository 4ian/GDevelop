gdjs.LightRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;
  this._manager = runtimeObject.getObstaclesManager();
  this._geometry = new PIXI.Geometry();
  this._radius = runtimeObject.getRadius();
  var objectColor = runtimeObject.getColor();
  this._color = [
    objectColor[0] / 255,
    objectColor[1] / 255,
    objectColor[2] / 255,
  ];
  this._debugMode = runtimeObject.getDebugMode();
  this._center = new Float32Array([runtimeObject.x, runtimeObject.y]);
  this._vertexBuffer = new Float32Array([
    runtimeObject.x - this._radius,
    runtimeObject.y + this._radius,
    runtimeObject.x + this._radius,
    runtimeObject.y + this._radius,
    runtimeObject.x + this._radius,
    runtimeObject.y - this._radius,
    runtimeObject.x - this._radius,
    runtimeObject.y - this._radius,
  ]);
  this._indexBuffer = new Uint16Array([0, 1, 2, 2, 3, 0]);

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
      center: this._center,
      radius: this._radius,
      color: this._color,
    }
  );
  if (this._light === undefined) {
    this._geometry
      .addAttribute('aVertexPosition', this._vertexBuffer, 2)
      .addIndex(this._indexBuffer);
    this._light = new PIXI.Mesh(this._geometry, this._shader);
  }
  this._light.blendMode = PIXI.BLEND_MODES.ADD;

  if (this._debugMode) {
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

gdjs.LightRuntimeObjectPixiRenderer.getClosestIntersectionPoint = function (
  lightObject,
  angle,
  polygons
) {
  var centerX = lightObject.getX();
  var centerY = lightObject.getY();
  var halfOfDiag = Math.sqrt(2) * lightObject.getRadius();
  var targetX = centerX + halfOfDiag * Math.cos(angle);
  var targetY = centerY + halfOfDiag * Math.sin(angle);
  var minSqDist = halfOfDiag * halfOfDiag;
  var minPOI = [null, null];
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
  if (minPOI[0] && minPOI[1]) return minPOI;
  return null;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  // Mandatory, return the internal PIXI object used for your object:
  if (this._debugMode) {
    return this._debugLight;
  }
  return this._light;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function () {
  if (this._debugMode) this.updateGraphics();
  this.updateVertexBufferObject();
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateGraphics = function () {
  var raycastResult = this.raycastTest();
  var vertices = new Array(2 * raycastResult.length + 2);
  vertices[0] = this._object.x;
  vertices[1] = this._object.y;

  for (var i = 2; i < 2 * raycastResult.length + 2; i += 2) {
    vertices[i] = raycastResult[i / 2 - 1][0];
    vertices[i + 1] = raycastResult[i / 2 - 1][1];
  }

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

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateVertexBufferObject = function () {
  this._center[0] = this._object.x;
  this._center[1] = this._object.y;
  this._light.shader.uniforms.center = this._center;

  var raycastResult = this.raycastTest();
  var raycastResultLength = raycastResult.length;

  var isSubArrayUsed = false;
  var vertexBufferSubArray = null;
  var indexBufferSubArray = null;

  if (this._vertexBuffer.length > 2 * raycastResultLength + 2) {
    if (this._vertexBuffer.length < 4 * raycastResultLength + 4) {
      isSubArrayUsed = true;
      vertexBufferSubArray = this._vertexBuffer.subarray(
        0,
        2 * raycastResultLength + 2
      );
      indexBufferSubArray = this._indexBuffer.subarray(
        0,
        3 * raycastResultLength
      );
    } else {
      this._vertexBuffer = new Float32Array(2 * raycastResultLength + 2);
      this._indexBuffer = new Uint16Array(3 * raycastResultLength);
    }
  }

  if (this._vertexBuffer.length < 2 * raycastResultLength + 2) {
    this._vertexBuffer = new Float32Array(2 * raycastResultLength + 2);
    this._indexBuffer = new Uint16Array(3 * raycastResultLength);
  }

  this._vertexBuffer[0] = this._object.x;
  this._vertexBuffer[1] = this._object.y;

  for (var i = 2; i < 2 * raycastResultLength + 2; i += 2) {
    this._vertexBuffer[i] = raycastResult[i / 2 - 1][0];
    this._vertexBuffer[i + 1] = raycastResult[i / 2 - 1][1];
  }

  for (var i = 0; i < 3 * raycastResultLength; i += 3) {
    this._indexBuffer[i] = 0;
    this._indexBuffer[i + 1] = i / 3 + 1;
    if (i / 3 + 1 !== raycastResultLength) this._indexBuffer[i + 2] = i / 3 + 2;
    else this._indexBuffer[i + 2] = 1;
  }

  if (!isSubArrayUsed) {
    this._light.geometry
      .getBuffer('aVertexPosition')
      .update(this._vertexBuffer);
    this._light.geometry.getIndex().update(this._indexBuffer);
  } else {
    this._light.geometry
      .getBuffer('aVertexPosition')
      .update(vertexBufferSubArray);
    this._light.geometry.getIndex().update(indexBufferSubArray);
  }
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.raycastTest = function () {
  var result = [];
  this._manager.getAllObstaclesAround(this._object, this._radius, result);

  var noOfObstacles = result.length + 1;
  var obstacleHitBoxes = new Array(noOfObstacles);
  obstacleHitBoxes[0] = this._object.getHitBoxes();
  for (var i = 0; i < noOfObstacles - 1; i++) {
    obstacleHitBoxes[i + 1] = result[i].owner.getHitBoxes();
  }

  var obstaclePolygons = [];
  for (var i = 0; i < noOfObstacles; i++) {
    var noOfHitBoxes = obstacleHitBoxes[i].length;
    for (var j = 0; j < noOfHitBoxes; j++)
      obstaclePolygons.push(obstacleHitBoxes[i][j]);
  }

  var flattenVertices = [];
  for (var i = 0; i < obstaclePolygons.length; i++) {
    var vertices = obstaclePolygons[i].vertices;
    var noOfVertices = vertices.length;
    for (var j = 0; j < noOfVertices; j++) flattenVertices.push(vertices[j]);
  }

  var _raycastResult = [];

  for (var vertex of flattenVertices) {
    var xdiff = vertex[0] - this._object.x;
    var ydiff = vertex[1] - this._object.y;
    var angle = Math.atan2(ydiff, xdiff);

    var result = gdjs.LightRuntimeObjectPixiRenderer.getClosestIntersectionPoint(
      this._object,
      angle,
      obstaclePolygons
    );
    if (result) {
      _raycastResult.push({
        vertex: result,
        angle: angle,
      });
    }

    // TODO: Check whether we need to raycast these two extra rays or not.
    var resultOffsetLeft = gdjs.LightRuntimeObjectPixiRenderer.getClosestIntersectionPoint(
      this._object,
      angle + 0.0001,
      obstaclePolygons
    );
    if (resultOffsetLeft) {
      _raycastResult.push({
        vertex: resultOffsetLeft,
        angle: angle + 0.0001,
      });
    }
    var resultOffsetRight = gdjs.LightRuntimeObjectPixiRenderer.getClosestIntersectionPoint(
      this._object,
      angle - 0.0001,
      obstaclePolygons
    );
    if (resultOffsetRight) {
      _raycastResult.push({
        vertex: resultOffsetRight,
        angle: angle - 0.0001,
      });
    }
  }

  _raycastResult.sort(function (a, b) {
    if (a.angle < b.angle) return -1;
    if (a.angle === b.angle) return 0;
    if (a.angle > b.angle) return 1;
  });

  var filteredRaycastResult = [_raycastResult[0].vertex];
  for (var i = 1; i < _raycastResult.length; i++) {
    if (_raycastResult[i].angle !== _raycastResult[i - 1].angle)
      filteredRaycastResult.push(_raycastResult[i].vertex);
  }

  return filteredRaycastResult;
};
