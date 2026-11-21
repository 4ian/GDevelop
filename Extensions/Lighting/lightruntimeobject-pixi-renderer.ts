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

    /**
     * For each obstacle polygon, a distance from the light that is at most
     * the distance of any point of the polygon (0 if the light is in its
     * bounding box), and its square.
     */
    _obstaclePolygonsMinDistance: Float64Array = new Float64Array(0);
    _obstaclePolygonsMinSquaredDistance: Float64Array = new Float64Array(0);
    /**
     * Index, in `_obstaclePolygonsEdges`, of the first vertex of each
     * obstacle polygon (and of the end of the last one).
     */
    _obstaclePolygonsFirstVertex: Int32Array = new Int32Array(0);
    /**
     * The vertices and edges of all the obstacle polygons, laid out as
     * [x, y, edgeX, edgeY, x, y, ...] (4 floats per vertex). The edges are
     * computed like `gdjs.Polygon.computeEdges` does.
     */
    _obstaclePolygonsEdges: Float64Array = new Float64Array(0);

    /**
     * The angular ranges, seen from the light, out of which rays can't hit
     * an obstacle polygon: [start, end] angles, possibly beyond [-PI, PI]
     * (a polygon can have up to 3 ranges, shifted by 2 PI).
     */
    _angularRangesStart: Float64Array = new Float64Array(0);
    _angularRangesEnd: Float64Array = new Float64Array(0);
    _angularRangesPolygon: Int32Array = new Int32Array(0);
    _angularRangesCount: integer = 0;
    /** The angular ranges indices, by increasing start angle. */
    _angularRangesByStart: Int32Array = new Int32Array(0);
    // Returns an integer: a float would be allocated at each comparison.
    _compareAngularRangesStart = (
      rangeIndexA: integer,
      rangeIndexB: integer
    ): integer => {
      const startA = this._angularRangesStart[rangeIndexA];
      const startB = this._angularRangesStart[rangeIndexB];
      return startA < startB ? -1 : startA > startB ? 1 : 0;
    };
    /** The angular ranges containing the angle of the current ray. */
    _activeAngularRanges: Int32Array = new Int32Array(0);
    /**
     * The polygons that are too close to the light to have an angular range
     * (including the light bounding polygon): every ray tests them.
     */
    _polygonsWithoutAngularRange: Int32Array = new Int32Array(0);
    _polygonsWithoutAngularRangeCount: integer = 0;
    /** The polygons tested by the current ray. */
    _rayPolygons: Int32Array = new Int32Array(0);
    _rayPolygonsCount: integer = 0;

    /**
     * What the last computed light vertices depend on: the light position,
     * the half size of the area where obstacles are searched, then for each
     * obstacle polygon its vertex count and its vertices. The vertices are
     * not computed again while these stay the same.
     */
    _lightVerticesInputs: Float64Array = new Float64Array(0);
    _newLightVerticesInputs: Float64Array = new Float64Array(0);
    /** The length used in `_lightVerticesInputs`, -1 when it's not valid. */
    _lightVerticesInputsLength: integer = -1;
    /** Incremented every time the light vertices are computed. */
    _lightVerticesVersion: integer = 0;
    /**
     * The version of the light vertices in the mesh geometry, -1 when the
     * geometry holds something else.
     */
    _meshLightVerticesVersion: integer = -1;

    // Reusable arrays for _computeLightVertices — cleared and refilled each call
    // to avoid per-frame heap allocations that would otherwise pressure the GC.
    _lightObstaclesTemp: gdjs.LightObstacleRuntimeBehavior[] = [];
    _obstaclePolygonsTemp: gdjs.Polygon[] = [];
    _flattenVerticesTemp: FloatPoint[] = [];
    _filteredVerticesTemp: FloatPoint[] = [];
    /** The angles of the vertices toward which rays are cast. */
    _vertexAngles: Float64Array = new Float64Array(0);

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
      // The object's angle is not applied yet at construction time (it is set
      // afterwards, via setAngle), so the initial quad is the axis-aligned
      // square. _updateBuffers rebuilds it with the rotation applied.
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

    /**
     * Find where a ray from the light center hits the closest obstacle
     * polygon (or the light bounding polygon).
     *
     * The result is the one of `gdjs.Polygon.raycastTest` called on every
     * polygon in order, keeping the closest hit, or the last one of the
     * closest hits at the same distance. Only the polygons that the ray can
     * hit (`_rayPolygons`) are tested, in any order.
     */
    _computeClosestIntersectionPoint(
      angle: float,
      polygons: Array<gdjs.Polygon>,
      boundingSquareHalfDiag: float,
      result: FloatPoint
    ): FloatPoint | null {
      const centerX = this._object.getX();
      const centerY = this._object.getY();
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
      const polygonAABBs = this._obstaclePolygonsAABB;
      const polygonsMinSquaredDistance =
        this._obstaclePolygonsMinSquaredDistance;
      const rayPolygons = this._rayPolygons;
      const polygonsFirstVertex = this._obstaclePolygonsFirstVertex;
      const polygonsEdges = this._obstaclePolygonsEdges;
      let minSqDist = boundingSquareHalfDiag * boundingSquareHalfDiag;
      let closestPolygonIndex = -1;
      result[0] = 0;
      result[1] = 0;
      for (let k = 0; k < this._rayPolygonsCount; k++) {
        const i = rayPolygons[k];
        if (polygonsMinSquaredDistance[i] > minSqDist) {
          // This polygon is farther than the closest hit.
          continue;
        }
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

        // Same computations as gdjs.Polygon.raycastTest, with the edges
        // computed once for all the rays.
        const firstVertex = polygonsFirstVertex[i];
        const endVertex = polygonsFirstVertex[i + 1];
        if (endVertex - firstVertex < 2) continue;
        let hasCollision = false;
        let isCollinear = false;
        let closeX = 0;
        let closeY = 0;
        let closeSqDist = Number.MAX_VALUE;
        for (let v = firstVertex; v < endVertex; v++) {
          const base = v * 4;
          const deltaQPX = polygonsEdges[base] - centerX;
          const deltaQPY = polygonsEdges[base + 1] - centerY;
          const edgeX = polygonsEdges[base + 2];
          const edgeY = polygonsEdges[base + 3];
          const crossRS = dx * edgeY - dy * edgeX;
          const crossQPR = deltaQPX * dy - deltaQPY * dx;
          if (Math.abs(crossRS) <= 0.0001 && Math.abs(crossQPR) <= 0.0001) {
            isCollinear = true;
            break;
          }
          const t = (deltaQPX * edgeY - deltaQPY * edgeX) / crossRS;
          if (!(crossRS !== 0 && 0 <= t && t <= 1)) continue;
          const u = crossQPR / crossRS;
          if (0 <= u && u <= 1) {
            const x = centerX + t * dx;
            const y = centerY + t * dy;
            const sqDist =
              (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY);
            if (sqDist < closeSqDist) {
              closeSqDist = sqDist;
              closeX = x;
              closeY = y;
              hasCollision = true;
            }
          }
        }
        if (isCollinear) {
          // Rare: let raycastTest handle the edges along the ray.
          const raycastResult = gdjs.Polygon.raycastTest(
            polygons[i],
            centerX,
            centerY,
            targetX,
            targetY
          );
          hasCollision = raycastResult.collision;
          closeX = raycastResult.closeX;
          closeY = raycastResult.closeY;
          closeSqDist = raycastResult.closeSqDist;
        }
        if (
          hasCollision &&
          (closeSqDist < minSqDist ||
            (closeSqDist === minSqDist && i > closestPolygonIndex))
        ) {
          minSqDist = closeSqDist;
          closestPolygonIndex = i;
          result[0] = closeX;
          result[1] = closeY;
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
        angle: gdjs.toRad(this._object.getAngle()),
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
      this._meshLightVerticesVersion = -1;
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
        // Draw the same rotated quad the mesh falls back to when there are
        // no obstacles around (see _updateBuffers), so the debug overlay
        // matches the actual light boundary. _updateBuffers recomputes the
        // same values into this buffer right after, so reusing it is safe.
        const corners = this._defaultVertexBuffer;
        this._computeRotatedSquareVertices(
          gdjs.toRad(this._object.getAngle()),
          corners
        );
        debugGraphics.clear();
        debugGraphics.lineStyle(1, 16711680, 1);
        for (let i = 0; i < 8; i += 2) {
          const next = (i + 2) % 8;
          debugGraphics
            .moveTo(this._object.x, this._object.y)
            .lineTo(corners[i], corners[i + 1])
            .lineTo(corners[next], corners[next + 1]);
        }
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

    /**
     * Fill the given buffer (4 corners, as x/y pairs) with the corners of the
     * light's square *rotated by the given angle* — the same rotated square
     * the shader samples the texture from (see texturedFragmentShader). At
     * angle 0, this is exactly the axis-aligned square
     * [x-radius, x+radius] x [y-radius, y+radius].
     */
    _computeRotatedSquareVertices(angleRad: float, output: Float32Array) {
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      const cx = this._object.x;
      const cy = this._object.y;
      const a = this._radius * (cosA + sinA);
      const b = this._radius * (cosA - sinA);
      output[0] = cx - a;
      output[1] = cy + b;
      output[2] = cx + b;
      output[3] = cy + a;
      output[4] = cx + a;
      output[5] = cy - b;
      output[6] = cx - b;
      output[7] = cy - a;
    }

    _updateBuffers() {
      if (!this._light) {
        return;
      }
      this._center[0] = this._object.x;
      this._center[1] = this._object.y;
      const angleRad = gdjs.toRad(this._object.getAngle());
      this._light.shader.uniforms.angle = angleRad;
      const vertices = this._computeLightVertices();

      // Fallback to simple quad when there are no obstacles around: the
      // light's rotated square, so it exactly matches the area the shader
      // samples the texture from, without clipping its corners nor
      // over-sizing the mesh.
      if (vertices.length === 0) {
        this._computeRotatedSquareVertices(angleRad, this._defaultVertexBuffer);
        this._light.shader.uniforms.center = this._center;
        this._light.geometry
          .getBuffer('aVertexPosition')
          .update(this._defaultVertexBuffer);
        this._light.geometry
          .getIndex()
          .update(LightRuntimeObjectPixiRenderer._defaultIndexBuffer);
        this._meshLightVerticesVersion = -1;
        return;
      }
      this._light.shader.uniforms.center = this._center;
      if (this._meshLightVerticesVersion === this._lightVerticesVersion) {
        return;
      }
      this._meshLightVerticesVersion = this._lightVerticesVersion;
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
      // An untextured light renders as a circle (see defaultFragmentShader),
      // which never lights anything beyond ±radius whatever the angle, so
      // the ±radius box is an exact obstacle search area for it.
      // A textured light's lit region is the light's square *rotated by the
      // object's angle* (see the fallback quad in _updateBuffers and
      // texturedFragmentShader), whose axis-aligned bounding box extends up
      // to radius * (|cos| + |sin|) from the center. Search obstacles in
      // that whole box — searching only ±radius would miss obstacles near
      // the rotated square's corners and let the light shine through them.
      // At angle 0 both are exactly ±radius, as before rotation support.
      let searchHalfExtent = this._radius;
      if (this._texture !== null) {
        const angleRad = gdjs.toRad(this._object.getAngle());
        searchHalfExtent =
          this._radius *
          (Math.abs(Math.cos(angleRad)) + Math.abs(Math.sin(angleRad)));
      }
      const lightObstacles = this._lightObstaclesTemp;
      if (this._manager) {
        this._manager.getAllObstaclesAround(
          this._object,
          searchHalfExtent,
          lightObstacles
        );
      }
      const searchAreaLeft = this._object.getX() - searchHalfExtent;
      const searchAreaTop = this._object.getY() - searchHalfExtent;
      const searchAreaRight = this._object.getX() + searchHalfExtent;
      const searchAreaBottom = this._object.getY() + searchHalfExtent;

      // Bail out early if there are no obstacles.
      if (lightObstacles.length === 0) {
        this._lightVerticesInputsLength = -1;
        // @ts-ignore TODO the array should probably be pass as a parameter.
        return lightObstacles;
      }

      // Build the list of polygons, reusing the class-level array to avoid
      // per-frame heap allocation (overwritten then truncated, rather than
      // emptied then filled, to keep the memory of the array).
      const obstaclePolygons = this._obstaclePolygonsTemp;
      let obstaclePolygonsCount = 0;
      obstaclePolygons[obstaclePolygonsCount++] = this._lightBoundingPoly;
      for (let i = 0; i < lightObstacles.length; i++) {
        const obstacleHitBoxes = lightObstacles[i].owner.getHitBoxesAround(
          searchAreaLeft,
          searchAreaTop,
          searchAreaRight,
          searchAreaBottom
        );
        if (Array.isArray(obstacleHitBoxes)) {
          // Avoid allocating an iterator for the most common case.
          for (let j = 0; j < obstacleHitBoxes.length; j++) {
            obstaclePolygons[obstaclePolygonsCount++] = obstacleHitBoxes[j];
          }
        } else {
          for (const hitbox of obstacleHitBoxes) {
            obstaclePolygons[obstaclePolygonsCount++] = hitbox;
          }
        }
      }
      obstaclePolygons.length = obstaclePolygonsCount;
      if (
        !this._updateLightVerticesInputs(searchHalfExtent, obstaclePolygons)
      ) {
        return this._filteredVerticesTemp;
      }
      this._lightVerticesVersion++;

      // Seed the self-boundary ("wall" that unoccluded rays terminate on)
      // with the axis-aligned bounding box of the light's rotated square —
      // the same box used to search obstacles above. At angle 0 this is
      // exactly [x-radius, x+radius] x [y-radius, y+radius], same as before;
      // at other angles it grows just enough to avoid clipping the corners
      // of the rotated texture, without over-sizing the search area.
      let minX = searchAreaLeft;
      let maxX = searchAreaRight;
      let minY = searchAreaTop;
      let maxY = searchAreaBottom;
      const flattenVertices = this._flattenVerticesTemp;
      let flattenVerticesCount = 0;
      for (let i = 1; i < obstaclePolygons.length; i++) {
        const vertices = obstaclePolygons[i].vertices;
        const verticesCount = vertices.length;
        for (let j = 0; j < verticesCount; j++) {
          flattenVertices[flattenVerticesCount++] = vertices[j];
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

      this._updateObstaclePolygonsData(
        obstaclePolygons,
        boundingSquareHalfDiag
      );

      // Add the vertices of the light bounding polygon.
      for (let i = 0; i < 4; i++) {
        flattenVertices[flattenVerticesCount++] =
          obstaclePolygons[0].vertices[i];
      }
      flattenVertices.length = flattenVerticesCount;
      // Rays are cast toward each vertex, and 0.0001 radian on each side of
      // it. The hit of a ray only depends on its angle: rays are cast once
      // per angle, in the order of their angles.
      if (this._vertexAngles.length < flattenVerticesCount) {
        this._vertexAngles = new Float64Array(2 * flattenVerticesCount);
      }
      const vertexAngles = this._vertexAngles;
      for (let i = 0; i < flattenVerticesCount; i++) {
        const xdiff = flattenVertices[i][0] - this._object.x;
        const ydiff = flattenVertices[i][1] - this._object.y;
        vertexAngles[i] = Math.atan2(ydiff, xdiff);
      }
      this._updateAngularRanges(
        obstaclePolygons,
        vertexAngles,
        boundingSquareHalfDiag
      );
      const sortedVertexAngles = vertexAngles
        .subarray(0, flattenVerticesCount)
        .sort();
      // Overwritten then truncated, rather than emptied then filled, to
      // keep the memory of the array.
      const filteredVerticesResult = this._filteredVerticesTemp;
      let filteredVerticesCount = 0;
      this._closestPointsPoolIndex = 0;
      const rangesCount = this._angularRangesCount;
      const rangesStart = this._angularRangesStart;
      const rangesEnd = this._angularRangesEnd;
      const rangesPolygon = this._angularRangesPolygon;
      const rangesByStart = this._angularRangesByStart;
      let nextRangeIndex = 0;
      let activeRangesCount = 0;
      const activeRanges = this._activeAngularRanges;
      const rayPolygons = this._rayPolygons;
      const polygonsMinDistance = this._obstaclePolygonsMinDistance;
      // Merge the angles of the rays toward the vertices and beside them
      // (each sorted).
      let lowerRayIndex = 0;
      let vertexRayIndex = 0;
      let upperRayIndex = 0;
      let previousAngle = 0;
      for (let i = 0; i < 3 * flattenVerticesCount; i++) {
        const lowerRayAngle =
          lowerRayIndex < flattenVerticesCount
            ? sortedVertexAngles[lowerRayIndex] - 0.0001
            : Infinity;
        const vertexRayAngle =
          vertexRayIndex < flattenVerticesCount
            ? sortedVertexAngles[vertexRayIndex]
            : Infinity;
        const upperRayAngle =
          upperRayIndex < flattenVerticesCount
            ? sortedVertexAngles[upperRayIndex] + 0.0001
            : Infinity;
        let angle = 0;
        if (lowerRayAngle <= vertexRayAngle && lowerRayAngle <= upperRayAngle) {
          angle = lowerRayAngle;
          lowerRayIndex++;
        } else if (vertexRayAngle <= upperRayAngle) {
          angle = vertexRayAngle;
          vertexRayIndex++;
        } else {
          angle = upperRayAngle;
          upperRayIndex++;
        }
        if (i > 0 && angle === previousAngle) {
          continue;
        }
        previousAngle = angle;
        // Rays are sorted by angle: add the ranges starting before this ray
        // and remove the ones ending before it.
        while (
          nextRangeIndex < rangesCount &&
          rangesStart[rangesByStart[nextRangeIndex]] <= angle
        ) {
          activeRanges[activeRangesCount++] = rangesByStart[nextRangeIndex++];
        }
        // The polygons are tested closest first, so that the ones farther
        // than a hit are skipped. The light bounding polygon is tested last.
        let rayPolygonsCount = 0;
        let keptRangesCount = 0;
        for (let k = 0; k < activeRangesCount; k++) {
          const rangeIndex = activeRanges[k];
          if (rangesEnd[rangeIndex] >= angle) {
            activeRanges[keptRangesCount++] = rangeIndex;
            const polygonIndex = rangesPolygon[rangeIndex];
            const minDistance = polygonsMinDistance[polygonIndex];
            let position = rayPolygonsCount++;
            while (
              position > 0 &&
              polygonsMinDistance[rayPolygons[position - 1]] > minDistance
            ) {
              rayPolygons[position] = rayPolygons[position - 1];
              position--;
            }
            rayPolygons[position] = polygonIndex;
          }
        }
        activeRangesCount = keptRangesCount;
        for (let k = this._polygonsWithoutAngularRangeCount - 1; k >= 0; k--) {
          rayPolygons[rayPolygonsCount++] =
            this._polygonsWithoutAngularRange[k];
        }
        this._rayPolygonsCount = rayPolygonsCount;

        const closestVertex = this._computeClosestIntersectionPoint(
          angle,
          obstaclePolygons,
          boundingSquareHalfDiag,
          this._getNextPooledPoint()
        );
        if (closestVertex) {
          filteredVerticesResult[filteredVerticesCount++] = closestVertex;
        }
      }
      filteredVerticesResult.length = filteredVerticesCount;
      return filteredVerticesResult;
    }

    /**
     * Store what the light vertices depend on, and tell if it changed since
     * the last time they were computed.
     * @returns true if the light vertices must be computed.
     */
    _updateLightVerticesInputs(
      searchHalfExtent: float,
      obstaclePolygons: Array<gdjs.Polygon>
    ): boolean {
      let inputsLength = 4;
      for (let i = 1; i < obstaclePolygons.length; i++) {
        inputsLength += 1 + 2 * obstaclePolygons[i].vertices.length;
      }
      if (this._newLightVerticesInputs.length < inputsLength) {
        this._newLightVerticesInputs = new Float64Array(2 * inputsLength);
      }
      const inputs = this._newLightVerticesInputs;
      inputs[0] = this._object.x;
      inputs[1] = this._object.y;
      inputs[2] = searchHalfExtent;
      inputs[3] = obstaclePolygons.length;
      let index = 4;
      for (let i = 1; i < obstaclePolygons.length; i++) {
        const vertices = obstaclePolygons[i].vertices;
        inputs[index++] = vertices.length;
        for (let j = 0; j < vertices.length; j++) {
          inputs[index++] = vertices[j][0];
          inputs[index++] = vertices[j][1];
        }
      }

      const previousInputs = this._lightVerticesInputs;
      let hasChanged = this._lightVerticesInputsLength !== inputsLength;
      for (let i = 0; i < inputsLength && !hasChanged; i++) {
        hasChanged = inputs[i] !== previousInputs[i];
      }
      this._lightVerticesInputs = inputs;
      this._newLightVerticesInputs = previousInputs;
      this._lightVerticesInputsLength = inputsLength;
      return hasChanged;
    }

    /**
     * Compute, for each obstacle polygon, what the rays need to find their
     * hits quickly: its bounding box, its edges, and its minimum distance
     * from the light.
     */
    _updateObstaclePolygonsData(
      obstaclePolygons: Array<gdjs.Polygon>,
      boundingSquareHalfDiag: float
    ) {
      const polyCount = obstaclePolygons.length;
      let verticesCount = 0;
      for (let i = 0; i < polyCount; i++) {
        verticesCount += obstaclePolygons[i].vertices.length;
      }
      if (this._obstaclePolygonsAABB.length < polyCount * 4) {
        this._obstaclePolygonsAABB = new Float32Array(polyCount * 4);
        this._obstaclePolygonsMinDistance = new Float64Array(polyCount);
        this._obstaclePolygonsMinSquaredDistance = new Float64Array(polyCount);
        this._obstaclePolygonsFirstVertex = new Int32Array(polyCount + 1);
      }
      if (this._obstaclePolygonsEdges.length < verticesCount * 4) {
        this._obstaclePolygonsEdges = new Float64Array(verticesCount * 4);
      }
      const centerX = this._object.x;
      const centerY = this._object.y;
      const polygonsEdges = this._obstaclePolygonsEdges;
      let vertexIndex = 0;
      for (let i = 0; i < polyCount; i++) {
        // Pre-compute AABBs for all obstacle polygons (4 floats each: minX, minY, maxX, maxY).
        // These are used in _computeClosestIntersectionPoint to quickly skip polygons
        // whose bounding box doesn't overlap the ray segment, avoiding the full raycast.
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

        // The distance from the light to the polygon bounding box (or to
        // the border of the light bounding polygon, which contains the
        // light) is lowered by a margin so that no hit can be closer:
        // - gdjs.Polygon.raycastTest considers an edge to be along the ray
        //   when its vertices are up to 0.0001 / (ray length) from the ray,
        //   and puts the hit on the ray.
        // - the rounding errors of the hits (much smaller).
        let distance = 0;
        if (i === 0) {
          distance = Math.min(
            centerX - pMinX,
            pMaxX - centerX,
            centerY - pMinY,
            pMaxY - centerY
          );
        } else {
          const distanceX = Math.max(pMinX - centerX, 0, centerX - pMaxX);
          const distanceY = Math.max(pMinY - centerY, 0, centerY - pMaxY);
          distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        }
        const minDistance =
          distance -
          0.0002 / boundingSquareHalfDiag -
          1e-5 * (1 + distance + Math.abs(centerX) + Math.abs(centerY));
        this._obstaclePolygonsMinDistance[i] =
          minDistance > 0 ? minDistance : 0;
        this._obstaclePolygonsMinSquaredDistance[i] =
          minDistance > 0 ? minDistance * minDistance : 0;

        this._obstaclePolygonsFirstVertex[i] = vertexIndex;
        for (let v = 0; v < verts.length; v++) {
          const vertex = verts[v];
          const nextVertex = v + 1 >= verts.length ? verts[0] : verts[v + 1];
          const edgeBase = vertexIndex * 4;
          polygonsEdges[edgeBase] = vertex[0];
          polygonsEdges[edgeBase + 1] = vertex[1];
          polygonsEdges[edgeBase + 2] = nextVertex[0] - vertex[0];
          polygonsEdges[edgeBase + 3] = nextVertex[1] - vertex[1];
          vertexIndex++;
        }
      }
      this._obstaclePolygonsFirstVertex[polyCount] = vertexIndex;
    }

    /**
     * Compute the angular range of each obstacle polygon seen from the
     * light, so that rays only test the polygons they can hit.
     * @param obstacleVertexAngles The angle of each vertex of the obstacles
     * (polygons after the first one).
     */
    _updateAngularRanges(
      obstaclePolygons: Array<gdjs.Polygon>,
      obstacleVertexAngles: Float64Array,
      boundingSquareHalfDiag: float
    ) {
      const polyCount = obstaclePolygons.length;
      if (this._polygonsWithoutAngularRange.length < polyCount) {
        this._polygonsWithoutAngularRange = new Int32Array(polyCount);
        this._rayPolygons = new Int32Array(4 * polyCount);
        this._activeAngularRanges = new Int32Array(3 * polyCount);
        this._angularRangesStart = new Float64Array(3 * polyCount);
        this._angularRangesEnd = new Float64Array(3 * polyCount);
        this._angularRangesPolygon = new Int32Array(3 * polyCount);
      }
      // A ray can hit a polygon out of its range by these distances:
      // - gdjs.Polygon.raycastTest considers an edge to be along the ray
      //   when its vertices are up to 0.0001 / (ray length) from the ray.
      // - the rounding errors of the hits (much smaller).
      const centerX = this._object.x;
      const centerY = this._object.y;
      const maxDistanceToRay =
        0.0002 / boundingSquareHalfDiag +
        1e-9 *
          (1 + Math.abs(centerX) + Math.abs(centerY) + boundingSquareHalfDiag);
      const twoPi = 2 * Math.PI;
      // Rays are cast toward vertices, and up to 0.0001 radians beside.
      const minRayAngle = -Math.PI - 0.001;
      const maxRayAngle = Math.PI + 0.001;
      let polygonsWithoutAngularRangeCount = 0;
      this._polygonsWithoutAngularRange[polygonsWithoutAngularRangeCount++] = 0;
      let rangesCount = 0;
      let vertexIndex = 0;
      for (let i = 1; i < polyCount; i++) {
        const verticesCount = obstaclePolygons[i].vertices.length;
        const minDistance = this._obstaclePolygonsMinDistance[i];
        const angleMargin =
          minDistance > 0 ? (2 * maxDistanceToRay) / minDistance + 1e-9 : 1;
        if (angleMargin > 0.01 || verticesCount === 0) {
          this._polygonsWithoutAngularRange[
            polygonsWithoutAngularRangeCount++
          ] = i;
          vertexIndex += verticesCount;
          continue;
        }
        // The light is out of the polygon bounding box, so the polygon is
        // seen within less than PI radians.
        const referenceAngle = obstacleVertexAngles[vertexIndex];
        let minAngleDifference = 0;
        let maxAngleDifference = 0;
        for (let v = 0; v < verticesCount; v++) {
          let angleDifference =
            obstacleVertexAngles[vertexIndex + v] - referenceAngle;
          if (angleDifference > Math.PI) angleDifference -= twoPi;
          else if (angleDifference < -Math.PI) angleDifference += twoPi;
          if (angleDifference < minAngleDifference)
            minAngleDifference = angleDifference;
          if (angleDifference > maxAngleDifference)
            maxAngleDifference = angleDifference;
        }
        vertexIndex += verticesCount;
        const rangeStart = referenceAngle + minAngleDifference - angleMargin;
        const rangeEnd = referenceAngle + maxAngleDifference + angleMargin;
        for (let shift = -twoPi; shift <= twoPi; shift += twoPi) {
          if (
            rangeEnd + shift >= minRayAngle &&
            rangeStart + shift <= maxRayAngle
          ) {
            this._angularRangesStart[rangesCount] = rangeStart + shift;
            this._angularRangesEnd[rangesCount] = rangeEnd + shift;
            this._angularRangesPolygon[rangesCount] = i;
            rangesCount++;
          }
        }
      }
      this._polygonsWithoutAngularRangeCount = polygonsWithoutAngularRangeCount;
      this._angularRangesCount = rangesCount;
      if (this._angularRangesByStart.length < rangesCount) {
        this._angularRangesByStart = new Int32Array(3 * polyCount);
      }
      for (let i = 0; i < rangesCount; i++) {
        this._angularRangesByStart[i] = i;
      }
      this._angularRangesByStart
        .subarray(0, rangesCount)
        .sort(this._compareAngularRangesStart);
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
      // Discard fragments outside the light's radius rather than writing a
      // transparent color. PixiJS's stencil-based masking (used when this
      // mesh is assigned as another object's mask, e.g. via an object
      // masking extension) only looks at which fragments were rasterized,
      // not their color/alpha - a plain color write of (0,0,0,1) would
      // still count as "inside" the mask, making the light's whole
      // quad/mesh footprint act as the mask instead of its actual visible
      // circular shape. discard removes the fragment from the pipeline
      // entirely, so only the true circle is considered "inside".
      if (l >= radius) discard;
      float intensity = clamp((radius - l)*(radius - l)/(radius*radius), 0.0, 1.0);
      gl_FragColor = vec4(color*intensity, 1.0);
  }`;
    static texturedFragmentShader = `
  precision highp float;
  uniform vec2 center;
  uniform float radius;
  uniform vec3 color;
  uniform float angle;
  uniform sampler2D uSampler;
  varying vec2 vPos;

  void main() {
    vec2 relativePos = vPos - center;
    float cosA = cos(angle);
    float sinA = sin(angle);
    // Rotate the sampled point back by the object's angle so that the
    // texture appears to rotate together with the light object.
    vec2 rotatedPos = vec2(
      relativePos.x * cosA + relativePos.y * sinA,
      -relativePos.x * sinA + relativePos.y * cosA
    );
    vec2 topleft = vec2(-radius, -radius);
    vec2 texCoord = (rotatedPos - topleft)/(2.0 * radius);

    // Sample before any discard: once a fragment of a 2x2 block is
    // discarded, some GPUs (Apple Metal) choose a wrong mipmap level for
    // the others, which shows as dotted lines in the very thin triangles
    // of the light mesh.
    vec4 texColor = texture2D(uSampler, texCoord);

    // See the comment in defaultFragmentShader above: discard (rather than
    // just writing a transparent color) any fragment outside the texture's
    // square, and any fragment whose texture pixel is itself fully
    // transparent, so stencil-based masking respects the texture's actual
    // (rotated) silhouette instead of the mesh's raw quad.
    if (texCoord.x <= 0.0 || texCoord.x >= 1.0 || texCoord.y <= 0.0 || texCoord.y >= 1.0) {
      discard;
    }
    if (texColor.a <= 0.0) {
      discard;
    }
    gl_FragColor = vec4(color, 1.0) * texColor;
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
