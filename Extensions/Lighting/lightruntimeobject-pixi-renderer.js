/**
 * Pixi renderer for light runtime objects.
 *
 * @memberof gdjs
 * @constructor LightRuntimeObjectPixiRenderer
 * @param {gdjs.LightRuntimeObject} runtimeObject
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.LightRuntimeObjectPixiRenderer = function (runtimeObject, runtimeScene) {
  this._object = runtimeObject;
  this._manager = runtimeObject.getObstaclesManager();
  this._radius = runtimeObject.getRadius();
  var objectColor = runtimeObject.getColor();
  this._color = [
    objectColor[0] / 255,
    objectColor[1] / 255,
    objectColor[2] / 255,
  ];

  /** @type {?PIXI.Texture} */
  this._texture = runtimeObject.getPIXITexture();
  this._center = new Float32Array([runtimeObject.x, runtimeObject.y]);

  this._defaultVertexBuffer = new Float32Array(8);
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
  this._indexBuffer = new Uint16Array([0, 1, 2, 0, 2, 3]);

  /** @type {?PIXI.Mesh} */
  this._light = null;
  this._updateMesh();

  this._isPreview = runtimeScene.getGame().isPreview();
  this._debugMode = null;
  /** @type {?PIXI.Container} */
  this._debugLight = null;
  /** @type {?PIXI.Graphics} */
  this._debugGraphics = null;
  this.updateDebugMode();
};

gdjs.LightRuntimeObjectRenderer = gdjs.LightRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.LightRuntimeObjectPixiRenderer._defaultIndexBuffer = new Uint16Array([
  0,
  1,
  2,
  0,
  2,
  3,
]);

gdjs.LightRuntimeObjectPixiRenderer.defaultVertexShader = `
  precision mediump float;
  attribute vec2 aVertexPosition;

  uniform mat3 translationMatrix;
  uniform mat3 projectionMatrix;
  varying vec2 vPos;

  void main() {
      vPos = aVertexPosition;
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  }`;

gdjs.LightRuntimeObjectPixiRenderer.defaultFragmentShader = `
  precision mediump float;
  uniform vec2 center;
  uniform float radius;
  uniform vec3 color;
  varying vec2 vPos;

  void main() {
      float l = length(vPos - center);
      float intensity = 0.0;
      if(l < radius)
        intensity = clamp((radius - l)*(radius - l)/(radius*radius), 0.0, 1.0);
      gl_FragColor = vec4(color*intensity, 1.0);
  }`;

gdjs.LightRuntimeObjectPixiRenderer.texturedFragmentShader = `
  precision mediump float;
  uniform vec2 center;
  uniform float radius;
  uniform vec3 color;
  uniform sampler2D uSampler;
  varying vec2 vPos;

  void main() {
      vec2 topleft = vec2(center.x - radius, center.y - radius);
      vec2 texCoord = (vPos - topleft)/(2.0 * radius);
      gl_FragColor = vec4(color, 1.0) * texture2D(uSampler, texCoord);
  }`;

gdjs.LightRuntimeObjectPixiRenderer._verticesWithAngleComparator = function (
  vertexWithAngleA,
  vertexWithAngleB
) {
  if (vertexWithAngleA.angle < vertexWithAngleB.angle) return -1;
  if (vertexWithAngleA.angle === vertexWithAngleB.angle) return 0;
  if (vertexWithAngleA.angle > vertexWithAngleB.angle) return 1;
};

gdjs.LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint = function (
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
  var closestPoint = [null, null];
  for (var poly of polygons) {
    var raycastResult = gdjs.Polygon.raycastTest(
      poly,
      centerX,
      centerY,
      targetX,
      targetY
    );

    if (raycastResult.collision && raycastResult.closeSqDist <= minSqDist) {
      minSqDist = raycastResult.closeSqDist;
      closestPoint[0] = raycastResult.closeX;
      closestPoint[1] = raycastResult.closeY;
    }
  }
  if (closestPoint[0] && closestPoint[1]) return closestPoint;
  return null;
};

/**
 * @returns {?PIXI.Mesh | PIXI.Container}
 */
gdjs.LightRuntimeObjectPixiRenderer.prototype.getRendererObject = function () {
  if (this._debugLight) {
    return this._debugLight;
  }
  return this._light;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function () {
  if (this._object.isHidden()) return;

  if (this._debugGraphics) this._updateDebugGraphics();
  this._updateBuffers();
};

gdjs.LightRuntimeObjectPixiRenderer.prototype._updateMesh = function () {
  var fragmentShader =
    this._texture === null
      ? gdjs.LightRuntimeObjectPixiRenderer.defaultFragmentShader
      : gdjs.LightRuntimeObjectPixiRenderer.texturedFragmentShader;
  var shaderUniforms = {
    center: this._center,
    radius: this._radius,
    color: this._color,
  };
  if (this._texture) {
    shaderUniforms.uSampler = this._texture;
  }
  var shader = PIXI.Shader.from(
    gdjs.LightRuntimeObjectPixiRenderer.defaultVertexShader,
    fragmentShader,
    shaderUniforms
  );
  var geometry = new PIXI.Geometry();
  geometry
    .addAttribute('aVertexPosition', this._vertexBuffer, 2)
    .addIndex(this._indexBuffer);
  if (!this._light) {
    this._light = new PIXI.Mesh(geometry, shader);
    this._light.blendMode = PIXI.BLEND_MODES.ADD;
  } else {
    this._light.shader = shader;
    this._light.geometry = geometry;
  }
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateRadius = function () {
  this._radius = this._object.getRadius();
  this._light.shader.uniforms.radius = this._radius;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateColor = function () {
  var objectColor = this._object.getColor();
  this._color = [
    objectColor[0] / 255,
    objectColor[1] / 255,
    objectColor[2] / 255,
  ];
  this._light.shader.uniforms.color = this._color;
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateTexture = function () {
  this._texture = this._object.getPIXITexture();
  this._updateMesh();
};

gdjs.LightRuntimeObjectPixiRenderer.prototype.updateDebugMode = function () {
  this._debugMode = this._object.getDebugMode();
  if (!this._debugLight && (this._isPreview || this._debugMode)) {
    this._debugLight = new PIXI.Container();
    this._debugLight.addChild(this._light);
  }

  if (this._debugMode && !this._debugGraphics) {
    this._debugGraphics = new PIXI.Graphics();
    this._debugLight.addChild(this._debugGraphics);
  }

  if (!this._debugMode && this._debugGraphics) {
    this._debugLight.removeChild(this._debugGraphics);
    this._debugGraphics.destroy();
    this._debugGraphics = null;
  }

  this.ensureUpToDate();
};

gdjs.LightRuntimeObjectPixiRenderer.prototype._updateDebugGraphics = function () {
  var computedVertices = this._computeLightVertices();

  if (!computedVertices.length) {
    this._debugGraphics.clear();
    this._debugGraphics
      .lineStyle(1, 0xff0000, 1)
      .moveTo(this._object.x, this._object.y)
      .lineTo(this._object.x - this._radius, this._object.y + this._radius)
      .lineTo(this._object.x + this._radius, this._object.y + this._radius)
      .moveTo(this._object.x, this._object.y)
      .lineTo(this._object.x + this._radius, this._object.y + this._radius)
      .lineTo(this._object.x + this._radius, this._object.y - this._radius)
      .moveTo(this._object.x, this._object.y)
      .lineTo(this._object.x + this._radius, this._object.y - this._radius)
      .lineTo(this._object.x - this._radius, this._object.y - this._radius)
      .moveTo(this._object.x, this._object.y)
      .lineTo(this._object.x - this._radius, this._object.y - this._radius)
      .lineTo(this._object.x - this._radius, this._object.y + this._radius);
    return;
  }

  var vertices = new Array(2 * computedVertices.length + 2);
  vertices[0] = this._object.x;
  vertices[1] = this._object.y;

  for (var i = 2; i < 2 * computedVertices.length + 2; i += 2) {
    vertices[i] = computedVertices[i / 2 - 1][0];
    vertices[i + 1] = computedVertices[i / 2 - 1][1];
  }

  this._debugGraphics.clear();
  for (var i = 0; i < vertices.length; i += 2) {
    var lineColor = i % 4 === 0 ? 0xff0000 : 0x00ff00;
    this._debugGraphics
      .lineStyle(1, lineColor, 1)
      .moveTo(vertices[0], vertices[1])
      .lineTo(vertices[i], vertices[i + 1]);
    if (i !== vertices.length - 2) {
      this._debugGraphics.lineTo(vertices[i + 2], vertices[i + 3]);
    } else {
      this._debugGraphics.lineTo(vertices[2], vertices[3]);
    }
  }
};

gdjs.LightRuntimeObjectPixiRenderer.prototype._updateBuffers = function () {
  this._center[0] = this._object.x;
  this._center[1] = this._object.y;
  this._light.shader.uniforms.center = this._center;

  var vertices = this._computeLightVertices();
  // Fallback to simple quad when there are no obstacles around.
  if (vertices.length === 0) {
    this._defaultVertexBuffer[0] = this._object.x - this._radius;
    this._defaultVertexBuffer[1] = this._object.y + this._radius;
    this._defaultVertexBuffer[2] = this._object.x + this._radius;
    this._defaultVertexBuffer[3] = this._object.y + this._radius;
    this._defaultVertexBuffer[4] = this._object.x + this._radius;
    this._defaultVertexBuffer[5] = this._object.y - this._radius;
    this._defaultVertexBuffer[6] = this._object.x - this._radius;
    this._defaultVertexBuffer[7] = this._object.y - this._radius;

    this._light.geometry
      .getBuffer('aVertexPosition')
      .update(this._defaultVertexBuffer);
    this._light.geometry
      .getIndex()
      .update(gdjs.LightRuntimeObjectPixiRenderer._defaultIndexBuffer);
    return;
  }

  var verticesCount = vertices.length;

  // If the array buffer which is already allocated is atmost
  // twice the size of memory required, we could avoid re-allocation
  // and instead use a subarray. Otherwise, allocate new array buffers as
  // there would be memory wastage.
  var isSubArrayUsed = false;
  var vertexBufferSubArray = null;
  var indexBufferSubArray = null;

  if (this._vertexBuffer.length > 2 * verticesCount + 2) {
    if (this._vertexBuffer.length < 4 * verticesCount + 4) {
      isSubArrayUsed = true;
      vertexBufferSubArray = this._vertexBuffer.subarray(
        0,
        2 * verticesCount + 2
      );
      indexBufferSubArray = this._indexBuffer.subarray(0, 3 * verticesCount);
    } else {
      this._vertexBuffer = new Float32Array(2 * verticesCount + 2);
      this._indexBuffer = new Uint16Array(3 * verticesCount);
    }
  }

  // When the allocated array buffer has less memory than
  // required, we'll have to allocated new array buffers.
  if (this._vertexBuffer.length < 2 * verticesCount + 2) {
    this._vertexBuffer = new Float32Array(2 * verticesCount + 2);
    this._indexBuffer = new Uint16Array(3 * verticesCount);
  }

  this._vertexBuffer[0] = this._object.x;
  this._vertexBuffer[1] = this._object.y;

  for (var i = 2; i < 2 * verticesCount + 2; i += 2) {
    this._vertexBuffer[i] = vertices[i / 2 - 1][0];
    this._vertexBuffer[i + 1] = vertices[i / 2 - 1][1];
  }

  for (var i = 0; i < 3 * verticesCount; i += 3) {
    this._indexBuffer[i] = 0;
    this._indexBuffer[i + 1] = i / 3 + 1;
    if (i / 3 + 1 !== verticesCount) this._indexBuffer[i + 2] = i / 3 + 2;
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

/**
 * Computes the vertices of mesh using raycasting.
 * @returns {number[][]} the vertices of mesh.
 */
gdjs.LightRuntimeObjectPixiRenderer.prototype._computeLightVertices = function () {
  var lightObstacles = [];
  if (this._manager)
    this._manager.getAllObstaclesAround(
      this._object,
      this._radius,
      lightObstacles
    );

  // Bail out early if there are no obstacles.
  if (lightObstacles.length === 0) return lightObstacles;

  // Adding 1 to the count since light object itself acts as a light obstacle.
  var obstaclesCount = lightObstacles.length + 1;
  var obstacleHitBoxes = new Array(obstaclesCount);
  obstacleHitBoxes[0] = this._object.getHitBoxes();
  for (var i = 0; i < obstaclesCount - 1; i++) {
    obstacleHitBoxes[i + 1] = lightObstacles[i].owner.getHitBoxes();
  }

  var obstaclePolygons = [];
  for (var i = 0; i < obstaclesCount; i++) {
    var noOfHitBoxes = obstacleHitBoxes[i].length;
    for (var j = 0; j < noOfHitBoxes; j++)
      obstaclePolygons.push(obstacleHitBoxes[i][j]);
  }

  var flattenVertices = [];
  for (var i = 0; i < obstaclePolygons.length; i++) {
    var vertices = obstaclePolygons[i].vertices;
    var verticesCount = vertices.length;
    for (var j = 0; j < verticesCount; j++) flattenVertices.push(vertices[j]);
  }

  var closestVertices = [];
  var flattenVerticesCount = flattenVertices.length;
  for (var i = 0; i < flattenVerticesCount; i++) {
    var xdiff = flattenVertices[i][0] - this._object.x;
    var ydiff = flattenVertices[i][1] - this._object.y;
    var angle = Math.atan2(ydiff, xdiff);

    var closestVertex = gdjs.LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
      this._object,
      angle,
      obstaclePolygons
    );
    if (closestVertex) {
      closestVertices.push({
        vertex: closestVertex,
        angle: angle,
      });
    }

    // TODO: Check whether we need to raycast these two extra rays or not.
    var closestVertexOffsetLeft = gdjs.LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
      this._object,
      angle + 0.0001,
      obstaclePolygons
    );
    if (closestVertexOffsetLeft) {
      closestVertices.push({
        vertex: closestVertexOffsetLeft,
        angle: angle + 0.0001,
      });
    }
    var closestVertexOffsetRight = gdjs.LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
      this._object,
      angle - 0.0001,
      obstaclePolygons
    );
    if (closestVertexOffsetRight) {
      closestVertices.push({
        vertex: closestVertexOffsetRight,
        angle: angle - 0.0001,
      });
    }
  }

  closestVertices.sort(
    gdjs.LightRuntimeObjectPixiRenderer._verticesWithAngleComparator
  );

  var filteredVerticesResult = [closestVertices[0].vertex];
  var closestVerticesCount = closestVertices.length;
  for (var i = 1; i < closestVerticesCount; i++) {
    if (closestVertices[i].angle !== closestVertices[i - 1].angle)
      filteredVerticesResult.push(closestVertices[i].vertex);
  }

  return filteredVerticesResult;
};
