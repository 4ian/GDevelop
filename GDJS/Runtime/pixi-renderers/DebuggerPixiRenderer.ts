namespace gdjs {
  const signalDebugAnimationDuration = 850;
  const maxSignalDebugSegments = 240;
  const signalDebugColors = [
    0x00d1ff,
    0xffc857,
    0xff5c8a,
    0x7cff6b,
    0xb388ff,
    0xff9f1c,
    0x40f99b,
    0xff4d4d,
  ];

  type SignalDebugSegment = {
    signalName: string;
    receiverName: string;
    source: gdjs.SignalDebugPoint;
    receiver: gdjs.SignalAnimationDebugReceiver;
    color: integer;
    startTime: integer;
  };

  const getSignalDebugColor = (signalName: string): integer => {
    let hash = 0;
    for (let i = 0, len = signalName.length; i < len; ++i) {
      hash = (hash * 31 + signalName.charCodeAt(i)) | 0;
    }
    return signalDebugColors[Math.abs(hash) % signalDebugColors.length];
  };

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
    _signalDebugDraw: PIXI.Graphics | null = null;
    _signalDebugDrawContainer: PIXI.Container | null = null;
    _signalDebugDrawLabels: PIXI.Text[] = [];
    _signalDebugSegments: SignalDebugSegment[] = [];

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._instanceContainer = instanceContainer;
      this._debugDrawRenderedObjectsPoints = {};
      this._debugDraw = null;
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

    _ensureSignalDebugDraw(): PIXI.Graphics | null {
      const pixiContainer = this._instanceContainer
        .getRenderer()
        .getRendererObject();
      if (!this._signalDebugDraw || !this._signalDebugDrawContainer) {
        this._signalDebugDrawContainer = new PIXI.Container();
        this._signalDebugDraw = new PIXI.Graphics();

        this._signalDebugDrawContainer.addChild(this._signalDebugDraw);
        if (pixiContainer) {
          pixiContainer.addChild(this._signalDebugDrawContainer);
        }
      }

      return this._signalDebugDraw;
    }

    _clearSignalDebugLabels(): void {
      if (!this._signalDebugDrawContainer) {
        this._signalDebugDrawLabels.length = 0;
        return;
      }

      for (let i = 0, len = this._signalDebugDrawLabels.length; i < len; ++i) {
        const label = this._signalDebugDrawLabels[i];
        this._signalDebugDrawContainer.removeChild(label);
        label.destroy();
      }
      this._signalDebugDrawLabels.length = 0;
    }

    _getSignalDebugPointPosition(
      point: gdjs.SignalDebugPoint,
      workingPoint: FloatPoint
    ): FloatPoint | null {
      const layer = this._instanceContainer.getLayer(point.layer);
      if (!layer.isVisible()) {
        return null;
      }

      const transformedPoint = layer.applyLayerTransformation(
        point.x,
        point.y,
        0,
        workingPoint
      );
      return [transformedPoint[0], transformedPoint[1]];
    }

    /**
     * Render short-lived animated signal delivery lines for editor previews.
     */
    renderSignalDebugDraw(
      signalDebugRecords: gdjs.SignalAnimationDebugRecord[]
    ): void {
      if (
        signalDebugRecords.length === 0 &&
        this._signalDebugSegments.length === 0
      ) {
        return;
      }

      const now = Date.now();
      for (let i = 0, len = signalDebugRecords.length; i < len; ++i) {
        const signalDebugRecord = signalDebugRecords[i];
        const color = getSignalDebugColor(signalDebugRecord.name);
        for (
          let j = 0, lenj = signalDebugRecord.receivers.length;
          j < lenj;
          ++j
        ) {
          const receiver = signalDebugRecord.receivers[j];
          this._signalDebugSegments.push({
            signalName: signalDebugRecord.name,
            receiverName: receiver.receiverName,
            source: signalDebugRecord.source,
            receiver,
            color,
            startTime: now,
          });
        }
      }

      if (this._signalDebugSegments.length > maxSignalDebugSegments) {
        this._signalDebugSegments.splice(
          0,
          this._signalDebugSegments.length - maxSignalDebugSegments
        );
      }

      const signalDraw = this._ensureSignalDebugDraw();
      if (!signalDraw || !this._signalDebugDrawContainer) {
        return;
      }

      signalDraw.clear();
      this._clearSignalDebugLabels();

      const activeSegments: SignalDebugSegment[] = [];
      const workingPoint: FloatPoint = [0, 0];
      const secondWorkingPoint: FloatPoint = [0, 0];
      for (let i = 0, len = this._signalDebugSegments.length; i < len; ++i) {
        const segment = this._signalDebugSegments[i];
        const age = now - segment.startTime;
        if (age > signalDebugAnimationDuration) {
          continue;
        }

        activeSegments.push(segment);
        const alpha = Math.max(
          0,
          1 - age / signalDebugAnimationDuration
        );
        const sourcePosition = this._getSignalDebugPointPosition(
          segment.source,
          workingPoint
        );
        const receiverPosition = this._getSignalDebugPointPosition(
          segment.receiver,
          secondWorkingPoint
        );
        if (!sourcePosition || !receiverPosition) {
          continue;
        }

        const sourceX = sourcePosition[0];
        const sourceY = sourcePosition[1];
        const receiverX = receiverPosition[0];
        const receiverY = receiverPosition[1];
        const deltaX = receiverX - sourceX;
        const deltaY = receiverY - sourceY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const directionX = distance > 0 ? deltaX / distance : 1;
        const directionY = distance > 0 ? deltaY / distance : 0;
        const normalX = -directionY;
        const normalY = directionX;
        const color = segment.color;

        if (distance < 1) {
          signalDraw.lineStyle(2, color, 0.85 * alpha);
          signalDraw.drawCircle(receiverX, receiverY, 12 + 12 * (1 - alpha));
        } else {
          signalDraw.lineStyle(Math.max(1, 4 * alpha), color, 0.85 * alpha);
          signalDraw.moveTo(sourceX, sourceY);
          signalDraw.lineTo(receiverX, receiverY);

          const arrowLength = 12;
          const arrowHalfWidth = 5;
          signalDraw.moveTo(receiverX, receiverY);
          signalDraw.lineTo(
            receiverX - directionX * arrowLength + normalX * arrowHalfWidth,
            receiverY - directionY * arrowLength + normalY * arrowHalfWidth
          );
          signalDraw.moveTo(receiverX, receiverY);
          signalDraw.lineTo(
            receiverX - directionX * arrowLength - normalX * arrowHalfWidth,
            receiverY - directionY * arrowLength - normalY * arrowHalfWidth
          );

          const progress = Math.min(1, age / signalDebugAnimationDuration);
          signalDraw.beginFill(color, Math.max(0.25, alpha));
          signalDraw.drawCircle(
            sourceX + deltaX * progress,
            sourceY + deltaY * progress,
            4 + 3 * alpha
          );
          signalDraw.endFill();
        }

        const labelOffset =
          12 + (Math.abs(getSignalDebugColor(segment.receiverName)) % 3) * 8;
        const label = new PIXI.Text(
          segment.signalName + ' -> ' + segment.receiverName,
          {
            fill: color,
            fontSize: 12,
          }
        );
        label.alpha = Math.max(0.35, alpha);
        label.anchor.set(0.5, 0.5);
        label.position.set(
          (sourceX + receiverX) / 2 + normalX * labelOffset,
          (sourceY + receiverY) / 2 + normalY * labelOffset
        );
        this._signalDebugDrawContainer.addChild(label);
        this._signalDebugDrawLabels.push(label);
      }

      this._signalDebugSegments = activeSegments;
    }

    clearSignalDebugDraw(): void {
      this._signalDebugSegments.length = 0;
      this._clearSignalDebugLabels();

      if (this._signalDebugDraw) {
        this._signalDebugDraw.clear();
      }

      if (this._signalDebugDrawContainer) {
        this._signalDebugDrawContainer.destroy({
          children: true,
        });
        const pixiContainer: PIXI.Container | null = this._instanceContainer
          .getRenderer()
          .getRendererObject();
        if (pixiContainer) {
          pixiContainer.removeChild(this._signalDebugDrawContainer);
        }
      }
      this._signalDebugDraw = null;
      this._signalDebugDrawContainer = null;
      this._signalDebugDrawLabels.length = 0;
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
  }

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
