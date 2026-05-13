namespace gdjs {
  /**
   * A renderer for debug instances location of a container using Pixi.js.
   *
   * @see gdjs.CustomRuntimeObject2DPixiRenderer
   * @category Debugging > Debugger Renderer
   */
  export class DebuggerPixiRenderer {
    _instanceContainer: gdjs.RuntimeInstanceContainer;
    _debugDraw: PIXI.Graphics | null = null;
    _debugDrawContainer: PIXI.Container | null = null;
    _debugDrawRenderedObjectsPoints: Record<
      number,
      {
        wasRendered: boolean;
        points: Record<string, PIXI.Text>;
      }
    >;
    /** State of 3D collision wireframes per tracked object. */
    _debug3DWireframeStates: Map<gdjs.RuntimeObject, DebugDraw3DState>;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._instanceContainer = instanceContainer;
      this._debugDrawRenderedObjectsPoints = {};
      this._debugDraw = null;
      this._debug3DWireframeStates = new Map();
    }

    getRendererObject() {
      return this._debugDrawContainer;
    }

    /**
     * Render graphics for debugging purpose. Activate this in `gdjs.RuntimeScene`,
     * in the `renderAndStep` method.
     * @see gdjs.RuntimeInstanceContainer#enableDebugDraw
     */
    renderDebugDraw(
      instances: gdjs.RuntimeObject[],
      showHiddenInstances: boolean,
      showPointsNames: boolean,
      showCustomPoints: boolean
    ) {
      const pixiContainer = this._instanceContainer
        .getRenderer()
        .getRendererObject();
      if (!this._debugDraw || !this._debugDrawContainer) {
        this._debugDrawContainer = new PIXI.Container();
        this._debugDraw = new PIXI.Graphics();

        // Add on top of all layers:
        this._debugDrawContainer.addChild(this._debugDraw);
        if (pixiContainer) {
          pixiContainer.addChild(this._debugDrawContainer);
        }
      }
      const debugDraw = this._debugDraw;

      // Reset the boolean "wasRendered" of all points of objects to false:
      for (let id in this._debugDrawRenderedObjectsPoints) {
        this._debugDrawRenderedObjectsPoints[id].wasRendered = false;
      }

      const renderObjectPoint = (
        points: Record<string, PIXI.Text>,
        name: string,
        fillColor: integer,
        x: float,
        y: float
      ) => {
        debugDraw.line.color = fillColor;
        debugDraw.fill.color = fillColor;
        debugDraw.drawCircle(x, y, 3);

        if (showPointsNames) {
          if (!points[name]) {
            points[name] = new PIXI.Text(name, {
              fill: fillColor,
              fontSize: 12,
            });

            this._debugDrawContainer!.addChild(points[name]);
          }

          points[name].position.set(x, y);
        }
      };

      debugDraw.clear();
      debugDraw.beginFill();
      debugDraw.alpha = 0.8;
      debugDraw.lineStyle(2, 0x0000ff, 1);

      // Draw AABB
      const workingPoint: FloatPoint = [0, 0];
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const layer = this._instanceContainer.getLayer(object.getLayer());

        if (
          (!object.isVisible() || !layer.isVisible()) &&
          !showHiddenInstances
        ) {
          continue;
        }

        const rendererObject = object.getRendererObject();
        if (!rendererObject) {
          continue;
        }
        const aabb = object.getAABB();
        debugDraw.fill.alpha = 0.2;
        debugDraw.line.color = 0x778ee8;
        debugDraw.fill.color = 0x778ee8;

        const polygon: float[] = [];
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.min[0],
            aabb.min[1],
            0,
            workingPoint
          )
        );
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.max[0],
            aabb.min[1],
            0,
            workingPoint
          )
        );
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.max[0],
            aabb.max[1],
            0,
            workingPoint
          )
        );
        polygon.push.apply(
          polygon,
          layer.applyLayerTransformation(
            aabb.min[0],
            aabb.max[1],
            0,
            workingPoint
          )
        );

        debugDraw.drawPolygon(polygon);
      }

      // Draw hitboxes and points
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        const layer = this._instanceContainer.getLayer(object.getLayer());

        if (
          (!object.isVisible() || !layer.isVisible()) &&
          !showHiddenInstances
        ) {
          continue;
        }

        const rendererObject = object.getRendererObject();
        if (!rendererObject) {
          continue;
        }

        // Create the structure to store the points in memory
        const id = object.id;
        if (!this._debugDrawRenderedObjectsPoints[id]) {
          this._debugDrawRenderedObjectsPoints[id] = {
            wasRendered: true,
            points: {},
          };
        }
        const renderedObjectPoints = this._debugDrawRenderedObjectsPoints[id];
        renderedObjectPoints.wasRendered = true;

        const cameraX = layer.getCameraX();
        const cameraY = layer.getCameraY();
        let cameraHalfWidth = layer.getCameraWidth() / 2;
        let cameraHalfHeight = layer.getCameraHeight() / 2;
        if (layer.getCameraRotation() !== 0) {
          const hypot = cameraHalfWidth + cameraHalfHeight;
          cameraHalfWidth = hypot;
          cameraHalfHeight = hypot;
        }
        // Draw hitboxes (sub-optimal performance)
        for (const hitBox of object.getHitBoxesAround(
          cameraX - cameraHalfWidth,
          cameraY - cameraHalfHeight,
          cameraX + cameraHalfWidth,
          cameraY + cameraHalfHeight
        )) {
          // Note that this conversion is sub-optimal, but we don't care
          // as this is for debug draw.
          const polygon: float[] = [];
          hitBox.vertices.forEach((point) => {
            point = layer.applyLayerTransformation(
              point[0],
              point[1],
              0,
              workingPoint
            );

            polygon.push(point[0]);
            polygon.push(point[1]);
          });
          debugDraw.fill.alpha = 0;
          debugDraw.line.alpha = 0.5;
          debugDraw.line.color = 0xff0000;
          debugDraw.drawPolygon(polygon);
        }

        // Draw points
        debugDraw.fill.alpha = 0.3;

        // Draw Center point
        const centerPoint = layer.applyLayerTransformation(
          object.getCenterXInScene(),
          object.getCenterYInScene(),
          0,
          workingPoint
        );

        renderObjectPoint(
          renderedObjectPoints.points,
          'Center',
          0xffff00,
          centerPoint[0],
          centerPoint[1]
        );

        // Draw position point
        const positionPoint = layer.applyLayerTransformation(
          object.getX(),
          object.getY(),
          0,
          workingPoint
        );

        renderObjectPoint(
          renderedObjectPoints.points,
          'Position',
          0xff0000,
          positionPoint[0],
          positionPoint[1]
        );

        // Draw Origin point
        if (object instanceof gdjs.SpriteRuntimeObject) {
          let originPoint = object.getPointPosition('origin');
          // When there is neither rotation nor flipping,
          // the origin point is over the position point.
          if (
            Math.abs(originPoint[0] - positionPoint[0]) >= 1 ||
            Math.abs(originPoint[1] - positionPoint[1]) >= 1
          ) {
            originPoint = layer.applyLayerTransformation(
              originPoint[0],
              originPoint[1],
              0,
              workingPoint
            );

            renderObjectPoint(
              renderedObjectPoints.points,
              'Origin',
              0xff0000,
              originPoint[0],
              originPoint[1]
            );
          }
        }

        // Draw custom point
        if (showCustomPoints && object instanceof gdjs.SpriteRuntimeObject) {
          const animationFrame = object._animator.getCurrentFrame();
          if (!animationFrame) continue;

          for (const customPointName in animationFrame.points.items) {
            let customPoint = object.getPointPosition(customPointName);

            customPoint = layer.applyLayerTransformation(
              customPoint[0],
              customPoint[1],
              0,
              workingPoint
            );

            renderObjectPoint(
              renderedObjectPoints.points,
              customPointName,
              0x0000ff,
              customPoint[0],
              customPoint[1]
            );
          }
        }
      }

      // Clean any point text from an object that is not rendered.
      for (const objectID in this._debugDrawRenderedObjectsPoints) {
        const renderedObjectPoints =
          this._debugDrawRenderedObjectsPoints[objectID];
        if (renderedObjectPoints.wasRendered) continue;

        const points = renderedObjectPoints.points;
        for (const name in points) {
          this._debugDrawContainer.removeChild(points[name]);
        }
      }

      debugDraw.endFill();
    }

    clearDebugDraw(): void {
      if (this._debugDraw) {
        this._debugDraw.clear();
      }

      if (this._debugDrawContainer) {
        this._debugDrawContainer.destroy({
          children: true,
        });
        const pixiContainer: PIXI.Container | null = this._instanceContainer
          .getRenderer()
          .getRendererObject();
        if (pixiContainer) {
          pixiContainer.removeChild(this._debugDrawContainer);
        }
      }
      this._debugDraw = null;
      this._debugDrawContainer = null;
      this._debugDrawRenderedObjectsPoints = {};
    }

    /**
     * Render 3D wireframe meshes showing the collision shapes of objects
     * using the built-in 3D physics behavior.
     * @see gdjs.RuntimeInstanceContainer#enableDebugDraw3D
     */
    renderDebugDraw3D(
      instances: gdjs.RuntimeObject[],
      colorHex: integer,
      depthTest: boolean
    ) {
      const THREE = (window as any).THREE;
      if (!THREE) return;

      const states = this._debug3DWireframeStates;
      const seen: Set<gdjs.RuntimeObject> = new Set();
      this._visitInstancesForDebug3D(instances, colorHex, depthTest, THREE, seen);

      // Dispose wireframes whose objects were destroyed or no longer eligible.
      states.forEach((_state, object) => {
        if (!seen.has(object)) {
          this._disposeWireframeState(object);
        }
      });
    }

    /**
     * Recursively visit all instances (including those nested inside
     * CustomRuntimeObject children containers), updating their wireframe.
     * @internal
     */
    _visitInstancesForDebug3D(
      instances: gdjs.RuntimeObject[],
      colorHex: integer,
      depthTest: boolean,
      THREE: any,
      seen: Set<gdjs.RuntimeObject>
    ): void {
      for (let i = 0; i < instances.length; i++) {
        const object = instances[i];
        if (this._updateWireframeForInstance(object, colorHex, depthTest, THREE)) {
          seen.add(object);
        }
        const childrenContainer = (object as any).getChildrenContainer
          ? (object as any).getChildrenContainer()
          : null;
        if (childrenContainer) {
          this._visitInstancesForDebug3D(
            childrenContainer.getAdhocListOfAllInstances(),
            colorHex,
            depthTest,
            THREE,
            seen
          );
        }
      }
    }

    /**
     * @returns true if a wireframe is currently tracked for this object.
     * @internal
     */
    _updateWireframeForInstance(
      object: gdjs.RuntimeObject,
      colorHex: integer,
      depthTest: boolean,
      THREE: any
    ): boolean {
      const physics3DBehavior: any = object.getBehavior('Physics3D');
      if (!physics3DBehavior) return false;
      const objectAny: any = object;
      const threeRendererObject: any =
        objectAny.get3DRendererObject && objectAny.get3DRendererObject();
      if (!threeRendererObject) return false;

      const states = this._debug3DWireframeStates;
      let state = states.get(object);

      if (physics3DBehavior._shape === 'Mesh') {
        // If switching from primitive to Mesh, clear the previous primitive.
        if (state && state.kind === 'primitive') {
          this._disposeWireframeState(object);
          state = undefined;
        }
        if (!state) {
          state = {
            kind: 'mesh',
            wrapped: [],
          };
          states.set(object, state);
        }
        this._updateMeshShapeWireframe(
          state,
          threeRendererObject,
          colorHex,
          depthTest,
          THREE
        );
        return true;
      }

      // Primitive shape. Clear any leftover mesh-shape wireframes first.
      if (state && state.kind === 'mesh') {
        this._disposeWireframeState(object);
        state = undefined;
      }

      const character3DBehavior: any = object.getBehavior('PhysicsCharacter3D');
      const worldWidth = objectAny.getWidth();
      const worldHeight = objectAny.getHeight();
      const worldDepth = objectAny.getDepth
        ? objectAny.getDepth()
        : worldWidth;

      const shapeKey =
        physics3DBehavior._shape +
        '|' +
        physics3DBehavior.shapeOrientation +
        '|' +
        physics3DBehavior.shapeDimensionA +
        '|' +
        physics3DBehavior.shapeDimensionB +
        '|' +
        physics3DBehavior.shapeDimensionC +
        '|' +
        (physics3DBehavior.shapeOffsetX || 0) +
        '|' +
        (physics3DBehavior.shapeOffsetY || 0) +
        '|' +
        (physics3DBehavior.shapeOffsetZ || 0);

      const shapeChanged =
        !state ||
        state.kind !== 'primitive' ||
        worldWidth !== state.lastWorldWidth ||
        worldHeight !== state.lastWorldHeight ||
        worldDepth !== state.lastWorldDepth ||
        shapeKey !== state.lastShapeKey;

      if (shapeChanged) {
        if (!state || state.kind !== 'primitive') {
          state = {
            kind: 'primitive',
            mesh: null,
            lastWorldWidth: worldWidth,
            lastWorldHeight: worldHeight,
            lastWorldDepth: worldDepth,
            lastShapeKey: shapeKey,
          };
          states.set(object, state);
        } else {
          state.lastWorldWidth = worldWidth;
          state.lastWorldHeight = worldHeight;
          state.lastWorldDepth = worldDepth;
          state.lastShapeKey = shapeKey;
        }
        const primitiveState = state;

        const shape = physics3DBehavior._shape;
        const orientation = physics3DBehavior.shapeOrientation;
        let w = 0,
          h = 0,
          d = 0,
          radius = 0,
          totalHeight = 0;
        const autoRadius = (a: number, b: number) => Math.sqrt(a * b) / 2;

        if (shape === 'Box') {
          w =
            physics3DBehavior.shapeDimensionA === 0
              ? worldWidth
              : physics3DBehavior.shapeDimensionA;
          h =
            physics3DBehavior.shapeDimensionB === 0
              ? worldHeight
              : physics3DBehavior.shapeDimensionB;
          d =
            physics3DBehavior.shapeDimensionC === 0
              ? worldDepth
              : physics3DBehavior.shapeDimensionC;
          totalHeight = d;
        } else if (shape === 'Sphere') {
          const volumeRadius =
            Math.pow(worldWidth * worldHeight * worldDepth, 1 / 3) / 2;
          radius =
            physics3DBehavior.shapeDimensionA === 0
              ? volumeRadius
              : physics3DBehavior.shapeDimensionA;
          w = h = d = radius * 2;
          totalHeight = radius * 2;
        } else {
          let radiusRefA: number, radiusRefB: number, heightRef: number;
          if (orientation === 'X') {
            radiusRefA = worldHeight;
            radiusRefB = worldDepth;
            heightRef = worldWidth;
          } else if (orientation === 'Y') {
            radiusRefA = worldWidth;
            radiusRefB = worldDepth;
            heightRef = worldHeight;
          } else {
            radiusRefA = worldWidth;
            radiusRefB = worldHeight;
            heightRef = worldDepth;
          }
          radius =
            physics3DBehavior.shapeDimensionA === 0
              ? autoRadius(radiusRefA, radiusRefB)
              : physics3DBehavior.shapeDimensionA;
          totalHeight =
            physics3DBehavior.shapeDimensionB === 0
              ? heightRef
              : physics3DBehavior.shapeDimensionB;
          if (orientation === 'X') {
            w = totalHeight;
            h = d = radius * 2;
          } else if (orientation === 'Y') {
            h = totalHeight;
            w = d = radius * 2;
          } else {
            d = totalHeight;
            w = h = radius * 2;
          }
        }

        let geometry;
        if (shape === 'Box') {
          geometry = new THREE.BoxGeometry(w, h, d);
        } else if (shape === 'Sphere') {
          geometry = new THREE.SphereGeometry(radius, 12, 12);
        } else if (shape === 'Capsule') {
          const cylinderHeight = Math.max(0, totalHeight - radius * 2);
          geometry = new THREE.CapsuleGeometry(radius, cylinderHeight, 2, 12);
        } else {
          geometry = new THREE.CylinderGeometry(
            radius,
            radius,
            totalHeight,
            12
          );
        }

        if (shape !== 'Box' && shape !== 'Sphere') {
          if (orientation === 'Z') geometry.rotateX(Math.PI / 2);
          if (orientation === 'X') geometry.rotateZ(Math.PI / 2);
        }

        if (primitiveState.mesh) {
          primitiveState.mesh.geometry.dispose();
          primitiveState.mesh.geometry = geometry;
        } else {
          const material = new THREE.MeshBasicMaterial({
            color: colorHex,
            wireframe: true,
            depthTest: depthTest,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.raycast = function () {};
          primitiveState.mesh = mesh;
          threeRendererObject.add(mesh);
        }

        const mesh = primitiveState.mesh;
        const invScaleX = 1 / threeRendererObject.scale.x;
        const invScaleY = 1 / threeRendererObject.scale.y;
        const invScaleZ = 1 / threeRendererObject.scale.z;
        mesh.scale.set(invScaleX, invScaleY, invScaleZ);

        let offsetX = physics3DBehavior.shapeOffsetX || 0;
        let offsetY = physics3DBehavior.shapeOffsetY || 0;
        let offsetZ = physics3DBehavior.shapeOffsetZ || 0;

        if (character3DBehavior) {
          const halfTotal = totalHeight / 2;
          if (shape === 'Box') {
            offsetZ += halfTotal;
          } else if (shape === 'Sphere') {
            offsetZ += radius;
          } else if (orientation === 'Z') {
            offsetZ += halfTotal;
          } else {
            offsetZ += radius;
          }
        }

        mesh.position.set(
          offsetX * invScaleX,
          offsetY * invScaleY,
          offsetZ * invScaleZ
        );
      }

      const primitive = state as PrimitiveDebug3DState;
      const mesh = primitive.mesh;
      if (!mesh) return true;
      mesh.visible = true;
      const material = mesh.material;
      if (material.depthTest !== depthTest) {
        material.depthTest = depthTest;
        material.needsUpdate = true;
      }
      if (material.color && material.color.getHex() !== colorHex) {
        material.color.setHex(colorHex);
      }
      return true;
    }

    /** @internal */
    _updateMeshShapeWireframe(
      state: MeshShapeDebug3DState,
      threeRendererObject: any,
      colorHex: integer,
      depthTest: boolean,
      THREE: any
    ) {
      // Detect new source meshes (e.g. Model3D loaded asynchronously) and
      // wrap them with a wireframe LineSegments child. Also prune entries
      // whose source mesh was detached/replaced internally.
      const wrapped = state.wrapped;
      for (let i = wrapped.length - 1; i >= 0; i--) {
        const entry = wrapped[i];
        if (!entry.source.parent && entry.source !== threeRendererObject) {
          // Source mesh detached from the scene graph; dispose its wireframe.
          if (entry.lines.parent) entry.lines.parent.remove(entry.lines);
          entry.lines.geometry.dispose();
          entry.lines.material.dispose();
          wrapped.splice(i, 1);
        }
      }

      const known: Set<any> = new Set(wrapped.map((e) => e.source));
      threeRendererObject.traverse((child: any) => {
        if (child.userData && child.userData.isDebugWireframe) return;
        if (!child.isMesh || !child.geometry) return;
        if (known.has(child)) return;

        const wireGeometry = new THREE.WireframeGeometry(child.geometry);
        const material = new THREE.LineBasicMaterial({
          color: colorHex,
          depthTest: depthTest,
        });
        const lines = new THREE.LineSegments(wireGeometry, material);
        lines.userData.isDebugWireframe = true;
        // Prevent raycasters (e.g. community Raycaster3D extension) from
        // hitting the debug wireframe — LineSegments intersections lack
        // `normal` and would crash consumers that expect it.
        lines.raycast = function () {};
        child.add(lines);
        wrapped.push({ source: child, lines });
      });

      // Per-frame sync of visibility, depth test and color.
      for (let i = 0; i < wrapped.length; i++) {
        const lines = wrapped[i].lines;
        lines.visible = true;
        const material = lines.material;
        if (material.depthTest !== depthTest) {
          material.depthTest = depthTest;
          material.needsUpdate = true;
        }
        if (material.color && material.color.getHex() !== colorHex) {
          material.color.setHex(colorHex);
        }
      }
    }

    /** @internal */
    _disposeWireframeState(object: gdjs.RuntimeObject): void {
      const state = this._debug3DWireframeStates.get(object);
      if (!state) return;
      if (state.kind === 'primitive') {
        const mesh = state.mesh;
        if (mesh) {
          if (mesh.parent) mesh.parent.remove(mesh);
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) mesh.material.dispose();
        }
      } else {
        for (let i = 0; i < state.wrapped.length; i++) {
          const entry = state.wrapped[i];
          if (entry.lines.parent) entry.lines.parent.remove(entry.lines);
          entry.lines.geometry.dispose();
          entry.lines.material.dispose();
        }
      }
      this._debug3DWireframeStates.delete(object);
    }

    /**
     * Remove all 3D debug wireframes.
     * The `instances` parameter is unused (kept for API compatibility);
     * the renderer tracks wireframe owners internally.
     */
    clearDebugDraw3D(_instances: gdjs.RuntimeObject[]): void {
      const objects: gdjs.RuntimeObject[] = [];
      this._debug3DWireframeStates.forEach((_state, object) => {
        objects.push(object);
      });
      for (let i = 0; i < objects.length; i++) {
        this._disposeWireframeState(objects[i]);
      }
    }
  }

  type PrimitiveDebug3DState = {
    kind: 'primitive';
    mesh: any;
    lastWorldWidth: float;
    lastWorldHeight: float;
    lastWorldDepth: float;
    lastShapeKey: string;
  };

  type MeshShapeDebug3DState = {
    kind: 'mesh';
    wrapped: Array<{ source: any; lines: any }>;
  };

  type DebugDraw3DState = PrimitiveDebug3DState | MeshShapeDebug3DState;

  // Register the class to let the engine use it.
  /**
   * @category Debugging > Debugger Renderer
   */
  export type DebuggerRenderer = gdjs.DebuggerPixiRenderer;
  /**
   * @category Debugging > Debugger Renderer
   */
  export const DebuggerRenderer = gdjs.DebuggerPixiRenderer;
}
