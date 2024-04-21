namespace gdjs {
  const logger = new gdjs.Logger('Light object');

  /**
   * Pixi renderer for light runtime objects.
   */
  export class LightRuntimeObjectPixiRenderer {
    _object: gdjs.LightRuntimeObject;
    _instanceContainer: gdjs.RuntimeInstanceContainer;
    _manager: gdjs.LightObstaclesManager;
    _radius: number;
    _color: [number, number, number];
    _texture: PIXI.Texture | null = null;
    _center: Float32Array;
    _defaultVertexBuffer: Float32Array;
    _vertexBuffer: Float32Array;
    _indexBuffer: Uint16Array;
    _light: PIXI.Mesh<PIXI.Shader> | null = null;
    _isPreview: boolean;
    _debugMode: boolean = false;
    _debugLight: PIXI.Container | null = null;
    _debugGraphics: PIXI.Graphics | null = null;

    /**
     * A polygon updated when vertices of the light are computed
     * to be a polygon bounding the light and its obstacles.
     */
    _lightBoundingPoly: gdjs.Polygon;

    constructor(
      runtimeObject: gdjs.LightRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._instanceContainer = instanceContainer;
      this._manager = runtimeObject.getObstaclesManager();
      this._radius = runtimeObject.getRadius();
      const objectColor = runtimeObject._color;
      this._color = [
        objectColor[0] / 255,
        objectColor[1] / 255,
        objectColor[2] / 255,
      ];
      this.updateTexture();
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
      this.updateMesh();
      this._isPreview = instanceContainer.getGame().isPreview();
      this._lightBoundingPoly = gdjs.Polygon.createRectangle(0, 0);

      this.updateDebugMode();

      // Objects will be added in lighting layer, this is just to maintain consistency.
      if (this._light) {
        instanceContainer
          .getLayer('')
          .getRenderer()
          .addRendererObject(
            this.getRendererObject(),
            runtimeObject.getZOrder()
          );
      }
    }

    static _verticesWithAngleComparator(vertexWithAngleA, vertexWithAngleB) {
      if (vertexWithAngleA.angle < vertexWithAngleB.angle) {
        return -1;
      }
      if (vertexWithAngleA.angle > vertexWithAngleB.angle) {
        return 1;
      }
      return 0;
    }

    static _computeClosestIntersectionPoint(
      lightObject: gdjs.LightRuntimeObject,
      angle: float,
      polygons: Array<gdjs.Polygon>,
      boundingSquareHalfDiag: float
    ) {
      const centerX = lightObject.getX();
      const centerY = lightObject.getY();
      const targetX = centerX + boundingSquareHalfDiag * Math.cos(angle);
      const targetY = centerY + boundingSquareHalfDiag * Math.sin(angle);
      let minSqDist = boundingSquareHalfDiag * boundingSquareHalfDiag;
      const closestPoint: Array<integer | null> = [null, null];
      for (const poly of polygons) {
        const raycastResult = gdjs.Polygon.raycastTest(
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
      if (closestPoint[0] && closestPoint[1]) {
        return closestPoint;
      }
      return null;
    }

    getRendererObject(): PIXI.Mesh | null | PIXI.Container {
      if (this._debugLight) {
        return this._debugLight;
      }
      return this._light;
    }

    ensureUpToDate() {
      if (this._object.isHidden()) {
        return;
      }
      if (this._debugGraphics) {
        this._updateDebugGraphics();
      }
      this._updateBuffers();
    }

    updateMesh(): void {
      if (!PIXI.utils.isWebGLSupported()) {
        logger.warn(
          'This device does not support webgl, which is required for Lighting Extension.'
        );
        return;
      }
      this.updateTexture();
      const fragmentShader =
        this._texture === null
          ? LightRuntimeObjectPixiRenderer.defaultFragmentShader
          : LightRuntimeObjectPixiRenderer.texturedFragmentShader;
      const shaderUniforms = {
        center: this._center,
        radius: this._radius,
        color: this._color,
      };
      if (this._texture) {
        // @ts-ignore
        shaderUniforms.uSampler = this._texture;
      }
      const shader = PIXI.Shader.from(
        LightRuntimeObjectPixiRenderer.defaultVertexShader,
        fragmentShader,
        shaderUniforms
      );
      const geometry = new PIXI.Geometry();
      geometry
        .addAttribute('aVertexPosition', this._vertexBuffer, 2)
        .addIndex(this._indexBuffer);
      if (!this._light) {
        this._light = new PIXI.Mesh(geometry, shader);
        this._light.blendMode = PIXI.BLEND_MODES.ADD;
      } else {
        this._light.shader = shader;
        // @ts-ignore - replacing the read-only geometry
        this._light.geometry = geometry;
      }
    }

    updateRadius(): void {
      if (!this._light) {
        return;
      }
      this._radius = this._object.getRadius();
      this._light.shader.uniforms.radius = this._radius;
    }

    updateColor(): void {
      if (!this._light) {
        return;
      }
      const objectColor = this._object._color;
      this._color = [
        objectColor[0] / 255,
        objectColor[1] / 255,
        objectColor[2] / 255,
      ];
      this._light.shader.uniforms.color = this._color;
    }

    updateTexture(): void {
      const texture = this._object.getTexture();
      this._texture =
        texture !== ''
          ? (this._instanceContainer
              .getGame()
              .getImageManager() as gdjs.PixiImageManager).getPIXITexture(
              texture
            )
          : null;
    }

    updateDebugMode(): void {
      if (!this._light) {
        return;
      }
      this._debugMode = this._object.getDebugMode();
      if (!this._debugLight && (this._isPreview || this._debugMode)) {
        this._debugLight = new PIXI.Container();
        this._debugLight.addChild(this._light);
      }
      if (this._debugMode && !this._debugGraphics) {
        this._debugGraphics = new PIXI.Graphics();
        (this._debugLight as PIXI.Container).addChild(this._debugGraphics);
      }
      if (!this._debugMode && this._debugGraphics) {
        (this._debugLight as PIXI.Container).removeChild(this._debugGraphics);
        this._debugGraphics.destroy();
        this._debugGraphics = null;
      }
      this.ensureUpToDate();
    }

    _updateDebugGraphics() {
      const debugGraphics = this._debugGraphics as PIXI.Graphics;

      const computedVertices = this._computeLightVertices();
      if (!computedVertices.length) {
        debugGraphics.clear();
        debugGraphics
          .lineStyle(1, 16711680, 1)
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
      const vertices = new Array(2 * computedVertices.length + 2);
      vertices[0] = this._object.x;
      vertices[1] = this._object.y;
      for (let i = 2; i < 2 * computedVertices.length + 2; i += 2) {
        vertices[i] = computedVertices[i / 2 - 1][0];
        vertices[i + 1] = computedVertices[i / 2 - 1][1];
      }
      debugGraphics.clear();
      debugGraphics.moveTo(vertices[2], vertices[3]);
      const verticesCount = vertices.length;
      for (let i = 2; i < verticesCount; i += 2) {
        const lineColor = i % 4 === 0 ? 16711680 : 65280;
        const lastX = i + 2 >= verticesCount ? 2 : i + 2;
        const lastY = i + 3 >= verticesCount ? 3 : i + 3;
        debugGraphics
          .lineStyle(1, lineColor, 1)
          .lineTo(vertices[i], vertices[i + 1])
          .lineTo(vertices[lastX], vertices[lastY])
          .moveTo(vertices[0], vertices[1])
          .lineTo(vertices[i], vertices[i + 1])
          .moveTo(vertices[0], vertices[1])
          .lineTo(vertices[lastX], vertices[lastY]);
      }
    }

    _updateBuffers() {
      if (!this._light) {
        return;
      }
      this._center[0] = this._object.x;
      this._center[1] = this._object.y;
      const vertices = this._computeLightVertices();

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
        this._light.shader.uniforms.center = this._center;
        this._light.geometry
          .getBuffer('aVertexPosition')
          .update(this._defaultVertexBuffer);
        this._light.geometry
          .getIndex()
          .update(LightRuntimeObjectPixiRenderer._defaultIndexBuffer);
        return;
      }
      const verticesCount = vertices.length;

      // If the array buffer which is already allocated is at most
      // twice the size of memory required, we could avoid re-allocation
      // and instead use a subarray. Otherwise, allocate new array buffers as
      // there would be memory wastage.
      let isSubArrayUsed = false;
      let vertexBufferSubArray: Float32Array | null = null;
      let indexBufferSubArray: Uint16Array | null = null;
      if (this._vertexBuffer.length > 2 * verticesCount + 2) {
        if (this._vertexBuffer.length < 4 * verticesCount + 4) {
          isSubArrayUsed = true;
          vertexBufferSubArray = this._vertexBuffer.subarray(
            0,
            2 * verticesCount + 2
          );
          indexBufferSubArray = this._indexBuffer.subarray(
            0,
            3 * verticesCount
          );
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
      for (let i = 2; i < 2 * verticesCount + 2; i += 2) {
        this._vertexBuffer[i] = vertices[i / 2 - 1][0];
        this._vertexBuffer[i + 1] = vertices[i / 2 - 1][1];
      }
      for (let i = 0; i < 3 * verticesCount; i += 3) {
        this._indexBuffer[i] = 0;
        this._indexBuffer[i + 1] = i / 3 + 1;
        if (i / 3 + 1 !== verticesCount) {
          this._indexBuffer[i + 2] = i / 3 + 2;
        } else {
          this._indexBuffer[i + 2] = 1;
        }
      }
      this._light.shader.uniforms.center = this._center;
      if (!isSubArrayUsed) {
        this._light.geometry
          .getBuffer('aVertexPosition')
          .update(this._vertexBuffer);
        this._light.geometry.getIndex().update(this._indexBuffer);
      } else {
        this._light.geometry
          .getBuffer('aVertexPosition')
          // @ts-ignore
          .update(vertexBufferSubArray);
        // @ts-ignore
        this._light.geometry.getIndex().update(indexBufferSubArray);
      }
    }

    /**
     * Computes the vertices of mesh using raycasting.
     * @returns the vertices of mesh.
     */
    _computeLightVertices(): Array<FloatPoint> {
      const lightObstacles: gdjs.LightObstacleRuntimeBehavior[] = [];
      if (this._manager) {
        this._manager.getAllObstaclesAround(
          this._object,
          this._radius,
          lightObstacles
        );
      }
      const searchAreaLeft = this._object.getX() - this._radius;
      const searchAreaTop = this._object.getY() - this._radius;
      const searchAreaRight = this._object.getX() + this._radius;
      const searchAreaBottom = this._object.getY() + this._radius;

      // Bail out early if there are no obstacles.
      if (lightObstacles.length === 0) {
        // @ts-ignore TODO the array should probably be pass as a parameter.
        return lightObstacles;
      }

      // Synchronize light bounding polygon with the hitbox.
      // Note: we suppose the hitbox is always a single rectangle.
      const objectHitBox = this._object.getHitBoxes()[0];
      for (let i = 0; i < 4; i++) {
        this._lightBoundingPoly.vertices[i][0] = objectHitBox.vertices[i][0];
        this._lightBoundingPoly.vertices[i][1] = objectHitBox.vertices[i][1];
      }

      // Create the list of polygons to compute the light vertices
      const obstaclePolygons: Array<gdjs.Polygon> = [];
      obstaclePolygons.push(this._lightBoundingPoly);
      for (let i = 0; i < lightObstacles.length; i++) {
        const obstacleHitBoxes = lightObstacles[i].owner.getHitBoxesAround(
          searchAreaLeft,
          searchAreaTop,
          searchAreaRight,
          searchAreaBottom
        );
        for (const hitbox of obstacleHitBoxes) {
          obstaclePolygons.push(hitbox);
        }
      }

      let maxX = this._object.x + this._radius;
      let minX = this._object.x - this._radius;
      let maxY = this._object.y + this._radius;
      let minY = this._object.y - this._radius;
      const flattenVertices: Array<FloatPoint> = [];
      for (let i = 1; i < obstaclePolygons.length; i++) {
        const vertices = obstaclePolygons[i].vertices;
        const verticesCount = vertices.length;
        for (let j = 0; j < verticesCount; j++) {
          flattenVertices.push(vertices[j]);
          if (vertices[j][0] < minX) {
            minX = vertices[j][0];
          }
          if (vertices[j][0] > maxX) {
            maxX = vertices[j][0];
          }
          if (vertices[j][1] < minY) {
            minY = vertices[j][1];
          }
          if (vertices[j][1] > maxY) {
            maxY = vertices[j][1];
          }
        }
      }
      obstaclePolygons[0].vertices[0][0] = minX;
      obstaclePolygons[0].vertices[0][1] = minY;
      obstaclePolygons[0].vertices[1][0] = maxX;
      obstaclePolygons[0].vertices[1][1] = minY;
      obstaclePolygons[0].vertices[2][0] = maxX;
      obstaclePolygons[0].vertices[2][1] = maxY;
      obstaclePolygons[0].vertices[3][0] = minX;
      obstaclePolygons[0].vertices[3][1] = maxY;

      // Find the largest diagonal length.
      const boundingSquareHalfDiag = Math.sqrt(
        Math.max(
          (this._object.x - minX) * (this._object.x - minX) +
            (this._object.y - minY) * (this._object.y - minY),
          (maxX - this._object.x) * (maxX - this._object.x) +
            (this._object.y - minY) * (this._object.y - minY),
          (maxX - this._object.x) * (maxX - this._object.x) +
            (maxY - this._object.y) * (maxY - this._object.y),
          (this._object.x - minX) * (this._object.x - minX) +
            (maxY - this._object.y) * (maxY - this._object.y)
        )
      );
      // Add this._object.hitBoxes vertices.
      for (let i = 0; i < 4; i++) {
        flattenVertices.push(obstaclePolygons[0].vertices[i]);
      }
      const closestVertices: Array<any> = [];
      const flattenVerticesCount = flattenVertices.length;
      for (let i = 0; i < flattenVerticesCount; i++) {
        const xdiff = flattenVertices[i][0] - this._object.x;
        const ydiff = flattenVertices[i][1] - this._object.y;
        const angle = Math.atan2(ydiff, xdiff);
        const closestVertex = LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
          this._object,
          angle,
          obstaclePolygons,
          boundingSquareHalfDiag
        );
        if (closestVertex) {
          closestVertices.push({ vertex: closestVertex, angle: angle });
        }

        // TODO: Check whether we need to raycast these two extra rays or not.
        const closestVertexOffsetLeft = LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
          this._object,
          angle + 0.0001,
          obstaclePolygons,
          boundingSquareHalfDiag
        );
        if (closestVertexOffsetLeft) {
          closestVertices.push({
            vertex: closestVertexOffsetLeft,
            angle: angle + 0.0001,
          });
        }
        const closestVertexOffsetRight = LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
          this._object,
          angle - 0.0001,
          obstaclePolygons,
          boundingSquareHalfDiag
        );
        if (closestVertexOffsetRight) {
          closestVertices.push({
            vertex: closestVertexOffsetRight,
            angle: angle - 0.0001,
          });
        }
      }
      closestVertices.sort(
        LightRuntimeObjectPixiRenderer._verticesWithAngleComparator
      );
      const filteredVerticesResult = [closestVertices[0].vertex];
      const closestVerticesCount = closestVertices.length;
      for (let i = 1; i < closestVerticesCount; i++) {
        if (closestVertices[i].angle !== closestVertices[i - 1].angle) {
          filteredVerticesResult.push(closestVertices[i].vertex);
        }
      }
      return filteredVerticesResult;
    }

    static _defaultIndexBuffer = new Uint16Array([0, 1, 2, 0, 2, 3]);
    static defaultVertexShader = `
  precision highp float;
  attribute vec2 aVertexPosition;

  uniform mat3 translationMatrix;
  uniform mat3 projectionMatrix;
  varying vec2 vPos;

  void main() {
      vPos = aVertexPosition;
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  }`;
    static defaultFragmentShader = `
  precision highp float;
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
    static texturedFragmentShader = `
  precision highp float;
  uniform vec2 center;
  uniform float radius;
  uniform vec3 color;
  uniform sampler2D uSampler;
  varying vec2 vPos;

  void main() {
    vec2 topleft = vec2(center.x - radius, center.y - radius);
    vec2 texCoord = (vPos - topleft)/(2.0 * radius);
    gl_FragColor = (texCoord.x > 0.0 && texCoord.x < 1.0 && texCoord.y > 0.0 && texCoord.y < 1.0)
      ? vec4(color, 1.0) * texture2D(uSampler, texCoord)
      : vec4(0.0, 0.0, 0.0, 0.0);
  }`;
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const LightRuntimeObjectRenderer = LightRuntimeObjectPixiRenderer;
  export type LightRuntimeObjectRenderer = LightRuntimeObjectPixiRenderer;
}
