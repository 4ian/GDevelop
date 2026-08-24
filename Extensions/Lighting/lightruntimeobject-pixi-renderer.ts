namespace gdjs {
  const logger = new gdjs.Logger('Light object');

  /**
   * Pixi renderer for light runtime objects.
   * @category Renderers > 2D Light
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
    _lightIconSprite: PIXI.Sprite | null = null;

    /**
     * A polygon updated when vertices of the light are computed
     * to be a polygon bounding the light and its obstacles.
     */
    _lightBoundingPoly: gdjs.Polygon;

    /**
     * Pool of reusable FloatPoint arrays to avoid per-frame allocations
     * inside _computeClosestIntersectionPoint. Reset each call to
     * _computeLightVertices.
     */
    _closestPointsPool: FloatPoint[] = [];
    _closestPointsPoolIndex: integer = 0;

    /**
     * Flat array of precomputed AABBs for obstacle polygons, laid out as
     * [minX, minY, maxX, maxY, minX, minY, ...] (4 floats per polygon).
     * Rebuilt each _computeLightVertices call to allow cheap AABB rejection
     * in _computeClosestIntersectionPoint before the full raycast.
     */
    _obstaclePolygonsAABB: Float32Array = new Float32Array(0);

    // Reusable arrays for _computeLightVertices — cleared and refilled each call
    // to avoid per-frame heap allocations that would otherwise pressure the GC.
    _lightObstaclesTemp: gdjs.LightObstacleRuntimeBehavior[] = [];
    _obstaclePolygonsTemp: gdjs.Polygon[] = [];
    _flattenVerticesTemp: FloatPoint[] = [];
    _closestVerticesTemp: { vertex: FloatPoint; angle: float }[] = [];
    _closestVertexAnglePool: { vertex: FloatPoint; angle: float }[] = [];
    _closestVertexAnglePoolIndex: integer = 0;
    _filteredVerticesTemp: FloatPoint[] = [];

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

      const game = this._object.getInstanceContainer().getGame();
      if (game.isInGameEdition()) {
        const texture = game
          .getImageManager()
          .getPIXITexture('InGameEditor-LightIcon');
        this._lightIconSprite = new PIXI.Sprite(texture);
        this._lightIconSprite.anchor.x = 0.5;
        this._lightIconSprite.anchor.y = 0.5;

        this._debugGraphics = new PIXI.Graphics();

        this._debugLight = new PIXI.Container();
        this._debugLight.addChild(this._debugGraphics);
        this._debugLight.addChild(this._lightIconSprite);
        // Force a 1st rendering of the circle.
        this._radius = 0;
      }

      // Objects will be added in lighting layer, this is just to maintain consistency.
      const rendererObject = this.getRendererObject();
      if (rendererObject) {
        instanceContainer
          .getLayer('')
          .getRenderer()
          .addRendererObject(rendererObject, runtimeObject.getZOrder());
      }
    }

    destroy(): void {
      if (this._lightIconSprite) {
        this._lightIconSprite.removeFromParent();
        this._lightIconSprite.destroy();
        this._lightIconSprite = null;
      }
      if (this._debugGraphics) {
        this._debugGraphics.removeFromParent();
        this._debugGraphics.destroy();
        this._debugGraphics = null;
      }
      if (this._light) {
        this._light.removeFromParent();
        this._light.destroy();
        this._light = null;
      }
      // We dot not destroy the texture, as it is managed by the PixiImageManager.
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
      polygonAABBs: Float32Array,
      boundingSquareHalfDiag: float,
      result: FloatPoint
    ): FloatPoint | null {
      const centerX = lightObject.getX();
      const centerY = lightObject.getY();
      const targetX = centerX + boundingSquareHalfDiag * Math.cos(angle);
      const targetY = centerY + boundingSquareHalfDiag * Math.sin(angle);
      const dx = targetX - centerX;
      const dy = targetY - centerY;
      // Precompute inverses for the slab test. Mark near-zero components to handle
      // axis-aligned rays without division by zero.
      const isDxSmall = Math.abs(dx) < 1e-8;
      const isDySmall = Math.abs(dy) < 1e-8;
      const invDx = isDxSmall ? 0 : 1.0 / dx;
      const invDy = isDySmall ? 0 : 1.0 / dy;
      let minSqDist = boundingSquareHalfDiag * boundingSquareHalfDiag;
      result[0] = 0;
      result[1] = 0;
      for (let i = 0; i < polygons.length; i++) {
        const aabbBase = i * 4;
        const pMinX = polygonAABBs[aabbBase];
        const pMinY = polygonAABBs[aabbBase + 1];
        const pMaxX = polygonAABBs[aabbBase + 2];
        const pMaxY = polygonAABBs[aabbBase + 3];
        // Slab test: checks whether the ray segment actually passes through the
        // polygon AABB. This is far tighter than a bounding-box overlap check —
        // diagonal rays no longer spuriously test every polygon in the swept square.
        let tNear = 0.0;
        let tFar = 1.0;
        if (isDxSmall) {
          if (centerX < pMinX || centerX > pMaxX) continue;
        } else {
          const tx1 = (pMinX - centerX) * invDx;
          const tx2 = (pMaxX - centerX) * invDx;
          if (tx1 < tx2) {
            if (tx1 > tNear) tNear = tx1;
            if (tx2 < tFar) tFar = tx2;
          } else {
            if (tx2 > tNear) tNear = tx2;
            if (tx1 < tFar) tFar = tx1;
          }
          if (tNear > tFar) continue;
        }
        if (isDySmall) {
          if (centerY < pMinY || centerY > pMaxY) continue;
        } else {
          const ty1 = (pMinY - centerY) * invDy;
          const ty2 = (pMaxY - centerY) * invDy;
          if (ty1 < ty2) {
            if (ty1 > tNear) tNear = ty1;
            if (ty2 < tFar) tFar = ty2;
          } else {
            if (ty2 > tNear) tNear = ty2;
            if (ty1 < tFar) tFar = ty1;
          }
          if (tNear > tFar) continue;
        }
        const raycastResult = gdjs.Polygon.raycastTest(
          polygons[i],
          centerX,
          centerY,
          targetX,
          targetY
        );
        if (raycastResult.collision && raycastResult.closeSqDist <= minSqDist) {
          minSqDist = raycastResult.closeSqDist;
          result[0] = raycastResult.closeX;
          result[1] = raycastResult.closeY;
        }
      }
      if (result[0] && result[1]) {
        return result;
      }
      return null;
    }

    _getNextPooledPoint(): FloatPoint {
      if (this._closestPointsPoolIndex < this._closestPointsPool.length) {
        return this._closestPointsPool[this._closestPointsPoolIndex++];
      }
      const point: FloatPoint = [0, 0];
      this._closestPointsPool.push(point);
      this._closestPointsPoolIndex++;
      return point;
    }

    _getNextPooledVertexAngle(
      vertex: FloatPoint,
      angle: float
    ): { vertex: FloatPoint; angle: float } {
      if (
        this._closestVertexAnglePoolIndex < this._closestVertexAnglePool.length
      ) {
        const obj =
          this._closestVertexAnglePool[this._closestVertexAnglePoolIndex++];
        obj.vertex = vertex;
        obj.angle = angle;
        return obj;
      }
      const obj = { vertex, angle };
      this._closestVertexAnglePool.push(obj);
      this._closestVertexAnglePoolIndex++;
      return obj;
    }

    getRendererObject(): PIXI.Mesh | null | PIXI.Container {
      if (this._debugLight) {
        return this._debugLight;
      }
      return this._light;
    }

    ensureUpToDate() {
      if (this._object.getInstanceContainer().getGame().isInGameEdition()) {
        if (!this._debugLight) {
          return;
        }
        this._debugLight.x = this._object.getX();
        this._debugLight.y = this._object.getY();
        if (
          this._radius === this._object.getRadius() &&
          this._color[0] === this._object._color[0] &&
          this._color[1] === this._object._color[1] &&
          this._color[2] === this._object._color[2]
        ) {
          return;
        }
        if (this._debugGraphics) {
          this._radius = this._object.getRadius();
          this._color[0] = this._object._color[0];
          this._color[1] = this._object._color[1];
          this._color[2] = this._object._color[2];
          const radiusBorderWidth = 2;
          this._debugGraphics.clear();
          this._debugGraphics.lineStyle(
            radiusBorderWidth,
            gdjs.rgbToHexNumber(this._color[0], this._color[1], this._color[2]),
            0.8
          );
          this._debugGraphics.drawCircle(
            0,
            0,
            Math.max(1, this._radius - radiusBorderWidth)
          );
        }
        return;
      }
      if (this._object.isHidden()) {
        return;
      }
      if (this._debugGraphics) {
        this._updateDebugGraphics();
      }
      this._updateBuffers();
    }

    updateMesh(): void {
      if (this._object.getInstanceContainer().getGame().isInGameEdition()) {
        return;
      }
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
          ? (
              this._instanceContainer
                .getGame()
                .getImageManager() as gdjs.PixiImageManager
            ).getPIXITexture(texture)
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
      const lightObstacles = this._lightObstaclesTemp;
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

      // Build the list of polygons, reusing the class-level array to avoid
      // per-frame heap allocation.
      const obstaclePolygons = this._obstaclePolygonsTemp;
      obstaclePolygons.length = 0;
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
      const flattenVertices = this._flattenVerticesTemp;
      flattenVertices.length = 0;
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

      // Pre-compute AABBs for all obstacle polygons (4 floats each: minX, minY, maxX, maxY).
      // These are used in _computeClosestIntersectionPoint to quickly skip polygons
      // whose bounding box doesn't overlap the ray segment, avoiding the full raycast.
      const polyCount = obstaclePolygons.length;
      if (this._obstaclePolygonsAABB.length < polyCount * 4) {
        this._obstaclePolygonsAABB = new Float32Array(polyCount * 4);
      }
      for (let i = 0; i < polyCount; i++) {
        const verts = obstaclePolygons[i].vertices;
        let pMinX = verts[0][0];
        let pMaxX = verts[0][0];
        let pMinY = verts[0][1];
        let pMaxY = verts[0][1];
        for (let v = 1; v < verts.length; v++) {
          if (verts[v][0] < pMinX) pMinX = verts[v][0];
          else if (verts[v][0] > pMaxX) pMaxX = verts[v][0];
          if (verts[v][1] < pMinY) pMinY = verts[v][1];
          else if (verts[v][1] > pMaxY) pMaxY = verts[v][1];
        }
        const base = i * 4;
        this._obstaclePolygonsAABB[base] = pMinX;
        this._obstaclePolygonsAABB[base + 1] = pMinY;
        this._obstaclePolygonsAABB[base + 2] = pMaxX;
        this._obstaclePolygonsAABB[base + 3] = pMaxY;
      }

      // Add this._object.hitBoxes vertices.
      for (let i = 0; i < 4; i++) {
        flattenVertices.push(obstaclePolygons[0].vertices[i]);
      }
      const closestVertices = this._closestVerticesTemp;
      closestVertices.length = 0;
      this._closestPointsPoolIndex = 0;
      this._closestVertexAnglePoolIndex = 0;
      const flattenVerticesCount = flattenVertices.length;
      for (let i = 0; i < flattenVerticesCount; i++) {
        const xdiff = flattenVertices[i][0] - this._object.x;
        const ydiff = flattenVertices[i][1] - this._object.y;
        const angle = Math.atan2(ydiff, xdiff);
        const closestVertex =
          LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
            this._object,
            angle,
            obstaclePolygons,
            this._obstaclePolygonsAABB,
            boundingSquareHalfDiag,
            this._getNextPooledPoint()
          );
        if (closestVertex) {
          closestVertices.push(
            this._getNextPooledVertexAngle(closestVertex, angle)
          );
        }

        // TODO: Check whether we need to raycast these two extra rays or not.
        const closestVertexOffsetLeft =
          LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
            this._object,
            angle + 0.0001,
            obstaclePolygons,
            this._obstaclePolygonsAABB,
            boundingSquareHalfDiag,
            this._getNextPooledPoint()
          );
        if (closestVertexOffsetLeft) {
          closestVertices.push(
            this._getNextPooledVertexAngle(
              closestVertexOffsetLeft,
              angle + 0.0001
            )
          );
        }
        const closestVertexOffsetRight =
          LightRuntimeObjectPixiRenderer._computeClosestIntersectionPoint(
            this._object,
            angle - 0.0001,
            obstaclePolygons,
            this._obstaclePolygonsAABB,
            boundingSquareHalfDiag,
            this._getNextPooledPoint()
          );
        if (closestVertexOffsetRight) {
          closestVertices.push(
            this._getNextPooledVertexAngle(
              closestVertexOffsetRight,
              angle - 0.0001
            )
          );
        }
      }
      closestVertices.sort(
        LightRuntimeObjectPixiRenderer._verticesWithAngleComparator
      );
      const closestVerticesCount = closestVertices.length;
      const filteredVerticesResult = this._filteredVerticesTemp;
      filteredVerticesResult.length = 0;
      if (closestVerticesCount === 0) return filteredVerticesResult;
      filteredVerticesResult.push(closestVertices[0].vertex);
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

  /**
   * @category Renderers > 2D Light
   */
  // @ts-ignore - Register the class to let the engine use it.
  export const LightRuntimeObjectRenderer = LightRuntimeObjectPixiRenderer;
  /**
   * @category Renderers > 2D Light
   */
  export type LightRuntimeObjectRenderer = LightRuntimeObjectPixiRenderer;
}
