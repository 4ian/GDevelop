namespace gdjs {
  const signalDebugAnimationDuration = 850;
  const maxSignalDebugSegments = 240;
  const maxSignalDebugPanelLogs = 80;
  const signalDebugPanelMargin = 12;
  const signalDebugPanelHeaderHeight = 34;
  const signalDebugPanelRowHeight = 78;
  const signalDebugPanelHorizontalPadding = 12;
  const signalDebugPanelFoldButtonSize = 20;
  const signalDebugPanelScrollbarWidth = 7;
  const signalDebugPanelScrollbarGap = 8;
  const signalDebugPanelMinWidth = 260;
  const signalDebugPanelMaxWidth = 360;
  const signalDebugUnhandledColor = 0xffc857;
  const signalDebugDroppedColor = 0xff5c8a;
  const signalDebugColors = [
    0x00d1ff, 0xffc857, 0xff5c8a, 0x7cff6b, 0xb388ff, 0xff9f1c, 0x40f99b,
    0xff4d4d,
  ];

  type SignalDebugSegment = {
    signalName: string;
    receiverName: string;
    source: gdjs.SignalDebugPoint;
    receiver: gdjs.SignalAnimationDebugReceiver;
    status: gdjs.SignalDebugStatus;
    color: integer;
    startTime: integer;
  };

  type SignalDebugPanelLog = {
    id: integer;
    signalName: string;
    payload: string;
    target: string;
    source: gdjs.SignalDebugPoint;
    receiver: gdjs.SignalAnimationDebugReceiver;
    status: gdjs.SignalDebugStatus;
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

  const getSignalDebugStatusColor = (
    status: gdjs.SignalDebugStatus,
    signalName: string
  ): integer => {
    if (status === 'dropped') {
      return signalDebugDroppedColor;
    }
    if (status === 'unhandled') {
      return signalDebugUnhandledColor;
    }
    return getSignalDebugColor(signalName);
  };

  const getSignalDebugStatusLabel = (
    status: gdjs.SignalDebugStatus
  ): string => {
    if (status === 'dropped') {
      return 'DROPPED';
    }
    if (status === 'unhandled') {
      return 'NO RECEIVER';
    }
    return '';
  };

  const shortenSignalDebugText = (text: string, maxLength: integer): string => {
    if (text.length <= maxLength) {
      return text;
    }
    if (maxLength <= 3) {
      return text.substr(0, maxLength);
    }
    return text.substr(0, maxLength - 3) + '...';
  };

  const fitSignalDebugTextToWidth = (
    textObject: PIXI.Text,
    text: string,
    maxWidth: float
  ): void => {
    if (maxWidth <= 0) {
      textObject.text = '';
      return;
    }

    textObject.text = text;
    if (textObject.width <= maxWidth) {
      return;
    }

    const ellipsis = '...';
    let lowerLength = 0;
    let upperLength = Math.max(0, text.length - ellipsis.length);
    while (lowerLength < upperLength) {
      const middleLength = Math.ceil((lowerLength + upperLength) / 2);
      textObject.text = text.substr(0, middleLength) + ellipsis;
      if (textObject.width <= maxWidth) {
        lowerLength = middleLength;
      } else {
        upperLength = middleLength - 1;
      }
    }

    textObject.text = text.substr(0, lowerLength) + ellipsis;
    while (lowerLength > 0 && textObject.width > maxWidth) {
      lowerLength--;
      textObject.text = text.substr(0, lowerLength) + ellipsis;
    }
  };

  const formatSignalDebugPoint = (point: gdjs.SignalDebugPoint): string => {
    if (point.objectName === 'scene') {
      return 'scene';
    }
    if (point.objectId < 0) {
      return point.objectName;
    }
    return point.objectName + '#' + point.objectId;
  };

  const formatSignalDebugTarget = (target: string): string => {
    const separatorIndex = target.indexOf(':');
    if (separatorIndex < 0) {
      return target || '<missing target>';
    }

    const targetKind = target.substr(0, separatorIndex);
    const targetValue = target.substr(separatorIndex + 1);
    if (targetKind === 'objectGroup') {
      return 'object group ' + (targetValue || '<missing>');
    }
    if (targetKind === 'object') {
      return targetValue || 'object <missing>';
    }
    if (targetKind === 'objectInstance') {
      return targetValue ? 'instance ' + targetValue : 'instance <missing>';
    }
    return targetValue ? targetKind + ' ' + targetValue : targetKind;
  };

  const formatSignalDebugPanelDestination = (
    log: SignalDebugPanelLog
  ): string => {
    const receiverLabel = formatSignalDebugPoint(log.receiver);
    if (
      log.target.indexOf('objectGroup:') === 0 &&
      (log.status !== 'delivered' ||
        receiverLabel === 'objectGroup' ||
        receiverLabel.indexOf('objectGroup:') === 0)
    ) {
      return formatSignalDebugTarget(log.target);
    }
    return receiverLabel;
  };

  const getPointerGlobalPosition = (event: any): { x: float; y: float } => {
    if (event && event.global) {
      return event.global;
    }
    if (event && event.data && event.data.global) {
      return event.data.global;
    }
    return { x: 0, y: 0 };
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
    _signalDebugPanel: PIXI.Container | null = null;
    _signalDebugPanelBackground: PIXI.Graphics | null = null;
    _signalDebugPanelRows: PIXI.Container | null = null;
    _signalDebugPanelLogs: SignalDebugPanelLog[] = [];
    _lastAppendedSignalDebugRecordsSignature: string = '';
    _signalDebugPanelX: float = signalDebugPanelMargin;
    _signalDebugPanelY: float = signalDebugPanelMargin;
    _signalDebugPanelScrollIndex: integer = 0;
    _signalDebugQueuedSignalsCount: integer = 0;
    _signalDebugHoveredPayloadLogId: integer | null = null;
    _signalDebugPanelPointerX: float = NaN;
    _signalDebugPanelPointerY: float = NaN;
    _hasUserPositionedSignalDebugPanel: boolean = false;
    _isDraggingSignalDebugPanel: boolean = false;
    _isSignalDebugPanelFolded: boolean = false;
    _signalDebugPanelDragOffsetX: float = 0;
    _signalDebugPanelDragOffsetY: float = 0;

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
        this._signalDebugDrawContainer.sortableChildren = true;
        this._signalDebugDraw = new PIXI.Graphics();
        this._signalDebugDraw.zIndex = 0;

        this._signalDebugDrawContainer.addChild(this._signalDebugDraw);
        if (pixiContainer) {
          pixiContainer.addChild(this._signalDebugDrawContainer);
        }
      }

      return this._signalDebugDraw;
    }

    _getSignalDebugPanelWidth(): float {
      const gameWidth = this._instanceContainer
        .getGame()
        .getGameResolutionWidth();
      const availableWidth = gameWidth - signalDebugPanelMargin * 2;
      if (availableWidth < signalDebugPanelMinWidth) {
        return Math.max(180, availableWidth);
      }
      return Math.min(signalDebugPanelMaxWidth, availableWidth);
    }

    _getSignalDebugPanelHeight(): float {
      if (this._isSignalDebugPanelFolded) {
        return signalDebugPanelHeaderHeight;
      }

      return (
        signalDebugPanelHeaderHeight +
        signalDebugPanelHorizontalPadding +
        Math.max(1, this._getVisibleSignalDebugPanelLogCount()) *
          signalDebugPanelRowHeight
      );
    }

    _getVisibleSignalDebugPanelLogCount(): integer {
      if (this._signalDebugPanelLogs.length === 0) {
        return 0;
      }

      const availableHeight =
        this._instanceContainer.getGame().getGameResolutionHeight() -
        signalDebugPanelMargin * 2 -
        signalDebugPanelHeaderHeight -
        signalDebugPanelHorizontalPadding;
      const maxVisibleRows = Math.max(
        1,
        Math.floor(availableHeight / signalDebugPanelRowHeight)
      );
      return Math.min(this._signalDebugPanelLogs.length, maxVisibleRows);
    }

    _getMaxSignalDebugPanelScrollIndex(): integer {
      return Math.max(
        0,
        this._signalDebugPanelLogs.length -
          this._getVisibleSignalDebugPanelLogCount()
      );
    }

    _clampSignalDebugPanelScrollIndex(): void {
      this._signalDebugPanelScrollIndex = Math.min(
        Math.max(0, this._signalDebugPanelScrollIndex),
        this._getMaxSignalDebugPanelScrollIndex()
      );
    }

    _scrollSignalDebugPanel(deltaRows: integer): void {
      this._signalDebugPanelScrollIndex += deltaRows;
      this._clampSignalDebugPanelScrollIndex();
    }

    _getSignalDebugPanelPointerPosition(event: any): { x: float; y: float } {
      const globalPosition = getPointerGlobalPosition(event);
      if (!this._signalDebugDrawContainer) {
        return globalPosition;
      }

      const localPosition =
        this._signalDebugDrawContainer.toLocal(globalPosition);
      return {
        x: localPosition.x,
        y: localPosition.y,
      };
    }

    _updateSignalDebugPanelPointerPosition(event: any): { x: float; y: float } {
      const position = this._getSignalDebugPanelPointerPosition(event);
      this._signalDebugPanelPointerX = position.x;
      this._signalDebugPanelPointerY = position.y;
      return position;
    }

    _isSignalDebugPanelPointInside(x: float, y: float): boolean {
      if (!this._signalDebugPanel) {
        return false;
      }

      const panelWidth = this._getSignalDebugPanelWidth();
      const panelHeight = this._getSignalDebugPanelHeight();
      return (
        x >= this._signalDebugPanelX &&
        x <= this._signalDebugPanelX + panelWidth &&
        y >= this._signalDebugPanelY &&
        y <= this._signalDebugPanelY + panelHeight
      );
    }

    _isSignalDebugPointerInsideRect(
      x: float,
      y: float,
      width: float,
      height: float
    ): boolean {
      return (
        isFinite(this._signalDebugPanelPointerX) &&
        isFinite(this._signalDebugPanelPointerY) &&
        this._signalDebugPanelPointerX >= x &&
        this._signalDebugPanelPointerX <= x + width &&
        this._signalDebugPanelPointerY >= y &&
        this._signalDebugPanelPointerY <= y + height
      );
    }

    _handleSignalDebugPanelWheel(x: float, y: float, deltaY: float): boolean {
      if (!this._isSignalDebugPanelPointInside(x, y)) {
        return false;
      }

      if (!this._isSignalDebugPanelFolded) {
        this._scrollSignalDebugPanel(deltaY > 0 ? 1 : -1);
        this._renderSignalDebugPanel();
      }
      return true;
    }

    _registerSignalDebugPanelInputInterceptor(): void {
      const gameRenderer = this._instanceContainer.getGame().getRenderer();
      const setInputInterceptor =
        // $FlowIgnore - RuntimeGamePixiRenderer exposes this in preview runtimes.
        gameRenderer.setPreviewOverlayInputInterceptor;
      if (!setInputInterceptor) {
        return;
      }

      setInputInterceptor.call(gameRenderer, {
        isBlockingPointer: (x: float, y: float): boolean =>
          this._isSignalDebugPanelPointInside(x, y),
        handleWheel: (x: float, y: float, deltaY: float): boolean =>
          this._handleSignalDebugPanelWheel(x, y, deltaY),
      });
    }

    _unregisterSignalDebugPanelInputInterceptor(): void {
      const gameRenderer = this._instanceContainer.getGame().getRenderer();
      const setInputInterceptor =
        // $FlowIgnore - RuntimeGamePixiRenderer exposes this in preview runtimes.
        gameRenderer.setPreviewOverlayInputInterceptor;
      if (!setInputInterceptor) {
        return;
      }

      setInputInterceptor.call(gameRenderer, null);
    }

    _placeSignalDebugPanelAtDefaultPosition(): void {
      const game = this._instanceContainer.getGame();
      this._signalDebugPanelX = signalDebugPanelMargin;
      this._signalDebugPanelY =
        game.getGameResolutionHeight() -
        this._getSignalDebugPanelHeight() -
        signalDebugPanelMargin;
    }

    _clampSignalDebugPanelPosition(): void {
      const game = this._instanceContainer.getGame();
      const panelWidth = this._getSignalDebugPanelWidth();
      const panelHeight = this._getSignalDebugPanelHeight();
      const maxX = Math.max(
        signalDebugPanelMargin,
        game.getGameResolutionWidth() - panelWidth - signalDebugPanelMargin
      );
      const maxY = Math.max(
        signalDebugPanelMargin,
        game.getGameResolutionHeight() - panelHeight - signalDebugPanelMargin
      );
      this._signalDebugPanelX = Math.min(
        Math.max(signalDebugPanelMargin, this._signalDebugPanelX),
        maxX
      );
      this._signalDebugPanelY = Math.min(
        Math.max(signalDebugPanelMargin, this._signalDebugPanelY),
        maxY
      );
    }

    _ensureSignalDebugPanel(): PIXI.Container | null {
      if (!this._signalDebugDrawContainer) {
        return null;
      }

      if (!this._signalDebugPanel) {
        this._signalDebugPanel = new PIXI.Container();
        this._signalDebugPanel.zIndex = 1000;
        (this._signalDebugPanel as any).eventMode = 'static';
        (this._signalDebugPanel as any).interactive = true;
        (this._signalDebugPanel as any).cursor = 'move';

        this._signalDebugPanelBackground = new PIXI.Graphics();
        this._signalDebugPanelRows = new PIXI.Container();
        this._signalDebugPanel.addChild(this._signalDebugPanelBackground);
        this._signalDebugPanel.addChild(this._signalDebugPanelRows);
        this._registerSignalDebugPanelInputInterceptor();

        this._signalDebugPanel.on('pointerdown', (event: any) => {
          const position = this._updateSignalDebugPanelPointerPosition(event);
          this._hasUserPositionedSignalDebugPanel = true;
          this._isDraggingSignalDebugPanel = true;
          this._signalDebugPanelDragOffsetX =
            position.x - this._signalDebugPanelX;
          this._signalDebugPanelDragOffsetY =
            position.y - this._signalDebugPanelY;
          if (event && event.stopPropagation) {
            event.stopPropagation();
          }
        });
        const movePanel = (event: any) => {
          const position = this._updateSignalDebugPanelPointerPosition(event);
          if (!this._isDraggingSignalDebugPanel) {
            return;
          }
          this._signalDebugPanelX =
            position.x - this._signalDebugPanelDragOffsetX;
          this._signalDebugPanelY =
            position.y - this._signalDebugPanelDragOffsetY;
          this._clampSignalDebugPanelPosition();
        };
        const stopDragging = (event: any) => {
          if (event) {
            this._updateSignalDebugPanelPointerPosition(event);
          }
          this._isDraggingSignalDebugPanel = false;
        };
        this._signalDebugPanel.on('pointermove', movePanel);
        this._signalDebugPanel.on('globalpointermove', movePanel);
        this._signalDebugPanel.on('pointerup', stopDragging);
        this._signalDebugPanel.on('pointerupoutside', stopDragging);
        this._signalDebugPanel.on('pointercancel', stopDragging);
      }

      if (
        this._signalDebugDrawContainer.children.indexOf(
          this._signalDebugPanel
        ) === -1
      ) {
        this._signalDebugDrawContainer.addChild(this._signalDebugPanel);
      }
      return this._signalDebugPanel;
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

    _clearSignalDebugPanelRows(): void {
      if (!this._signalDebugPanelRows) {
        return;
      }

      while (this._signalDebugPanelRows.children.length > 0) {
        const child = this._signalDebugPanelRows.removeChildAt(0);
        child.destroy({
          children: true,
        });
      }
    }

    _appendSignalDebugPanelLogs(
      signalDebugRecords: gdjs.SignalAnimationDebugRecord[],
      now: integer
    ): void {
      let addedLogCount = 0;
      for (let i = 0, len = signalDebugRecords.length; i < len; ++i) {
        const signalDebugRecord = signalDebugRecords[i];
        const color = getSignalDebugStatusColor(
          signalDebugRecord.status,
          signalDebugRecord.name
        );
        for (
          let j = 0, lenj = signalDebugRecord.receivers.length;
          j < lenj;
          ++j
        ) {
          this._signalDebugPanelLogs.unshift({
            id: signalDebugRecord.id,
            signalName: signalDebugRecord.name,
            payload: signalDebugRecord.payload,
            target: signalDebugRecord.target,
            source: signalDebugRecord.source,
            receiver: signalDebugRecord.receivers[j],
            status: signalDebugRecord.status,
            color,
            startTime: now,
          });
          addedLogCount++;
        }
      }

      if (this._signalDebugPanelScrollIndex > 0) {
        this._signalDebugPanelScrollIndex += addedLogCount;
      }
      if (this._signalDebugPanelLogs.length > maxSignalDebugPanelLogs) {
        this._signalDebugPanelLogs.length = maxSignalDebugPanelLogs;
      }
      this._clampSignalDebugPanelScrollIndex();
    }

    _getSignalDebugRecordsSignature(
      signalDebugRecords: gdjs.SignalAnimationDebugRecord[]
    ): string {
      let signature = '';
      for (let i = 0, len = signalDebugRecords.length; i < len; ++i) {
        const signalDebugRecord = signalDebugRecords[i];
        signature +=
          signalDebugRecord.id +
          ':' +
          signalDebugRecord.status +
          ':' +
          signalDebugRecord.receivers.length +
          '[';
        for (
          let j = 0, lenj = signalDebugRecord.receivers.length;
          j < lenj;
          ++j
        ) {
          const receiver = signalDebugRecord.receivers[j];
          signature += receiver.receiverName + '#' + receiver.objectId + ';';
        }
        signature += ']|';
      }
      return signature;
    }

    _renderSignalDebugPayloadTooltip(
      rows: PIXI.Container,
      payload: string,
      panelWidth: float,
      panelHeight: float,
      rowY: float
    ): void {
      const tooltipWidth = Math.max(180, panelWidth - 24);
      const tooltipText = new PIXI.Text('data: ' + payload, {
        fill: 0xffffff,
        fontSize: 11,
        lineHeight: 14,
        wordWrap: true,
        wordWrapWidth: tooltipWidth - 18,
        breakWords: true,
      });
      tooltipText.position.set(9, 8);

      const tooltipHeight = tooltipText.height + 16;
      const preferredY = rowY + 75;
      const tooltipY =
        preferredY + tooltipHeight <= panelHeight - 6
          ? preferredY
          : Math.max(
              signalDebugPanelHeaderHeight + 4,
              rowY - tooltipHeight - 6
            );

      const tooltip = new PIXI.Container();
      tooltip.position.set(12, tooltipY);

      const background = new PIXI.Graphics();
      background.lineStyle(1, 0xffdd78, 0.95);
      background.beginFill(0x080c14, 0.96);
      background.drawRoundedRect(0, 0, tooltipWidth, tooltipHeight, 5);
      background.endFill();
      tooltip.addChild(background);
      tooltip.addChild(tooltipText);

      rows.addChild(tooltip);
    }

    _renderSignalDebugPanel(): void {
      const panel = this._ensureSignalDebugPanel();
      if (
        !panel ||
        !this._signalDebugPanelBackground ||
        !this._signalDebugPanelRows
      ) {
        return;
      }

      if (!this._hasUserPositionedSignalDebugPanel) {
        this._placeSignalDebugPanelAtDefaultPosition();
      }
      this._clampSignalDebugPanelScrollIndex();
      this._clampSignalDebugPanelPosition();
      const panelWidth = this._getSignalDebugPanelWidth();
      const panelHeight = this._getSignalDebugPanelHeight();
      panel.position.set(this._signalDebugPanelX, this._signalDebugPanelY);
      panel.hitArea = new PIXI.Rectangle(0, 0, panelWidth, panelHeight);

      const background = this._signalDebugPanelBackground;
      background.clear();
      background.lineStyle(2, 0xffffff, 0.18);
      background.beginFill(0x080c14, 0.5);
      background.drawRoundedRect(0, 0, panelWidth, panelHeight, 6);
      background.endFill();
      background.lineStyle(0, 0, 0);
      background.beginFill(0x121926, 0.68);
      background.drawRoundedRect(
        0,
        0,
        panelWidth,
        signalDebugPanelHeaderHeight,
        6
      );
      background.endFill();
      background.beginFill(0x00d1ff, 0.95);
      background.drawRect(0, signalDebugPanelHeaderHeight - 3, panelWidth, 3);
      background.endFill();

      this._clearSignalDebugPanelRows();
      const rows = this._signalDebugPanelRows;
      const title = new PIXI.Text(
        'Signal monitor (queue: ' + this._signalDebugQueuedSignalsCount + ')',
        {
          fill: 0xffffff,
          fontSize: 14,
          fontWeight: 'bold',
        }
      );
      title.position.set(signalDebugPanelHorizontalPadding, 8);
      rows.addChild(title);

      const subtitle = new PIXI.Text('drag', {
        fill: 0x9aa7b8,
        fontSize: 11,
      });
      subtitle.anchor.set(1, 0);
      subtitle.position.set(
        panelWidth -
          signalDebugPanelHorizontalPadding -
          signalDebugPanelFoldButtonSize -
          8,
        10
      );
      rows.addChild(subtitle);

      const foldButton = new PIXI.Container();
      const foldButtonX =
        panelWidth -
        signalDebugPanelHorizontalPadding -
        signalDebugPanelFoldButtonSize;
      const foldButtonY =
        (signalDebugPanelHeaderHeight - signalDebugPanelFoldButtonSize) / 2;
      foldButton.position.set(foldButtonX, foldButtonY);
      foldButton.hitArea = new PIXI.Rectangle(
        0,
        0,
        signalDebugPanelFoldButtonSize,
        signalDebugPanelFoldButtonSize
      );
      (foldButton as any).eventMode = 'static';
      (foldButton as any).interactive = true;
      (foldButton as any).cursor = 'pointer';
      foldButton.on('pointerdown', (event: any) => {
        this._isSignalDebugPanelFolded = !this._isSignalDebugPanelFolded;
        this._isDraggingSignalDebugPanel = false;
        this._clampSignalDebugPanelPosition();
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
      });

      const foldButtonBackground = new PIXI.Graphics();
      foldButtonBackground.lineStyle(1, 0x9aa7b8, 0.8);
      foldButtonBackground.beginFill(0x1f2938, 0.92);
      foldButtonBackground.drawRoundedRect(
        0,
        0,
        signalDebugPanelFoldButtonSize,
        signalDebugPanelFoldButtonSize,
        4
      );
      foldButtonBackground.endFill();
      foldButtonBackground.lineStyle(2, 0xf3f7ff, 0.95);
      foldButtonBackground.moveTo(5, signalDebugPanelFoldButtonSize / 2);
      foldButtonBackground.lineTo(
        signalDebugPanelFoldButtonSize - 5,
        signalDebugPanelFoldButtonSize / 2
      );
      if (this._isSignalDebugPanelFolded) {
        foldButtonBackground.moveTo(signalDebugPanelFoldButtonSize / 2, 5);
        foldButtonBackground.lineTo(
          signalDebugPanelFoldButtonSize / 2,
          signalDebugPanelFoldButtonSize - 5
        );
      }
      foldButton.addChild(foldButtonBackground);
      rows.addChild(foldButton);

      if (this._isSignalDebugPanelFolded) {
        return;
      }

      if (this._signalDebugPanelLogs.length === 0) {
        const emptyText = new PIXI.Text('Waiting for signal deliveries...', {
          fill: 0xb9c3d4,
          fontSize: 13,
        });
        emptyText.position.set(
          signalDebugPanelHorizontalPadding,
          signalDebugPanelHeaderHeight + signalDebugPanelHorizontalPadding
        );
        rows.addChild(emptyText);
        return;
      }

      const visibleLogCount = this._getVisibleSignalDebugPanelLogCount();
      const hasScrollbar = this._getMaxSignalDebugPanelScrollIndex() > 0;
      const rowWidth =
        panelWidth -
        signalDebugPanelHorizontalPadding * 2 -
        (hasScrollbar
          ? signalDebugPanelScrollbarWidth + signalDebugPanelScrollbarGap
          : 0);
      let hoveredPayloadLog: SignalDebugPanelLog | null = null;
      let hoveredPayloadRowY = 0;
      for (let i = 0, len = visibleLogCount; i < len; ++i) {
        const log =
          this._signalDebugPanelLogs[this._signalDebugPanelScrollIndex + i];
        if (!log) {
          continue;
        }

        const rowY =
          signalDebugPanelHeaderHeight +
          signalDebugPanelHorizontalPadding +
          i * signalDebugPanelRowHeight;
        const row = new PIXI.Container();
        row.position.set(signalDebugPanelHorizontalPadding, rowY);

        const rowBackground = new PIXI.Graphics();
        rowBackground.lineStyle(1, log.color, i === 0 ? 0.75 : 0.35);
        rowBackground.beginFill(i === 0 ? 0x1a2331 : 0x101722, 0.72);
        rowBackground.drawRoundedRect(
          0,
          0,
          rowWidth,
          signalDebugPanelRowHeight - 6,
          5
        );
        rowBackground.endFill();
        rowBackground.beginFill(log.color, 0.95);
        rowBackground.drawRoundedRect(
          0,
          0,
          5,
          signalDebugPanelRowHeight - 6,
          4
        );
        rowBackground.endFill();
        row.addChild(rowBackground);

        const statusLabel = getSignalDebugStatusLabel(log.status);
        const signalText = new PIXI.Text('', {
          fill: 0x0b0f16,
          fontSize: 12,
          fontWeight: 'bold',
        });
        const maxChipWidth = Math.max(
          54,
          rowWidth - 24 - (statusLabel ? 116 : 44)
        );
        signalText.text = shortenSignalDebugText(
          log.signalName,
          statusLabel ? 16 : 28
        );
        const chipWidth = Math.min(
          maxChipWidth,
          Math.max(54, signalText.width + 14)
        );
        const chip = new PIXI.Graphics();
        chip.beginFill(log.color, 1);
        chip.drawRoundedRect(12, 8, chipWidth, 20, 4);
        chip.endFill();
        signalText.position.set(19, 10);
        row.addChild(chip);
        row.addChild(signalText);

        if (statusLabel) {
          const warningText = new PIXI.Text(statusLabel, {
            fill: 0x0b0f16,
            fontSize: 9,
            fontWeight: 'bold',
          });
          const warningWidth = Math.max(62, warningText.width + 12);
          const warningX = Math.max(
            12 + chipWidth + 8,
            rowWidth - warningWidth - 46
          );
          const warningBackground = new PIXI.Graphics();
          warningBackground.beginFill(log.color, 0.95);
          warningBackground.drawRoundedRect(warningX, 10, warningWidth, 16, 4);
          warningBackground.endFill();
          warningText.position.set(warningX + 6, 12);
          row.addChild(warningBackground);
          row.addChild(warningText);
        }

        const idText = new PIXI.Text('#' + log.id, {
          fill: 0x7e8da3,
          fontSize: 11,
        });
        idText.anchor.set(1, 0);
        idText.position.set(rowWidth - 12, 10);
        row.addChild(idText);

        const fromToText = new PIXI.Text(
          shortenSignalDebugText(
            'from ' +
              formatSignalDebugPoint(log.source) +
              ' -> ' +
              formatSignalDebugPanelDestination(log),
            panelWidth < 380 ? 42 : 62
          ),
          {
            fill: 0xf3f7ff,
            fontSize: 12,
          }
        );
        fromToText.position.set(12, 33);
        row.addChild(fromToText);

        const payload = log.payload || '';
        const payloadX = 12;
        const payloadY = 52;
        const payloadWidth = rowWidth - 24;
        const payloadHeight = 18;
        const payloadBackground = new PIXI.Graphics();
        payloadBackground.lineStyle(1, payload ? 0xffdd78 : 0x536174, 0.5);
        payloadBackground.beginFill(payload ? 0x2a2230 : 0x151d29, 0.7);
        payloadBackground.drawRoundedRect(
          payloadX,
          payloadY,
          payloadWidth,
          payloadHeight,
          4
        );
        payloadBackground.endFill();
        row.addChild(payloadBackground);

        const payloadText = new PIXI.Text('', {
          fill: payload ? 0xffdd78 : 0x9aa7b8,
          fontSize: 10,
        });
        fitSignalDebugTextToWidth(
          payloadText,
          'data: "' + payload + '"',
          payloadWidth - 12
        );
        payloadText.position.set(payloadX + 6, payloadY + 2);
        row.addChild(payloadText);

        if (payload) {
          const payloadHitArea = new PIXI.Container();
          payloadHitArea.hitArea = new PIXI.Rectangle(
            payloadX,
            payloadY,
            payloadWidth,
            payloadHeight
          );
          (payloadHitArea as any).eventMode = 'static';
          (payloadHitArea as any).interactive = true;
          (payloadHitArea as any).cursor = 'help';
          payloadHitArea.on('pointerover', (event: any) => {
            this._updateSignalDebugPanelPointerPosition(event);
            this._renderSignalDebugPanel();
            if (event && event.stopPropagation) {
              event.stopPropagation();
            }
          });
          payloadHitArea.on('pointermove', (event: any) => {
            this._updateSignalDebugPanelPointerPosition(event);
            if (event && event.stopPropagation) {
              event.stopPropagation();
            }
          });
          payloadHitArea.on('pointerout', (event: any) => {
            this._updateSignalDebugPanelPointerPosition(event);
            this._renderSignalDebugPanel();
            if (event && event.stopPropagation) {
              event.stopPropagation();
            }
          });
          row.addChild(payloadHitArea);
        }

        const payloadAbsoluteX =
          this._signalDebugPanelX +
          signalDebugPanelHorizontalPadding +
          payloadX;
        const payloadAbsoluteY = this._signalDebugPanelY + rowY + payloadY;
        if (
          payload &&
          this._isSignalDebugPointerInsideRect(
            payloadAbsoluteX,
            payloadAbsoluteY,
            payloadWidth,
            payloadHeight
          )
        ) {
          hoveredPayloadLog = log;
          hoveredPayloadRowY = rowY;
        }

        rows.addChild(row);
      }

      if (hasScrollbar) {
        const maxScrollIndex = this._getMaxSignalDebugPanelScrollIndex();
        const trackX =
          panelWidth -
          signalDebugPanelHorizontalPadding -
          signalDebugPanelScrollbarWidth;
        const trackY =
          signalDebugPanelHeaderHeight + signalDebugPanelHorizontalPadding;
        const trackHeight = Math.max(
          1,
          visibleLogCount * signalDebugPanelRowHeight - 8
        );
        const thumbHeight = Math.max(
          24,
          (trackHeight * visibleLogCount) / this._signalDebugPanelLogs.length
        );
        const thumbTravel = Math.max(1, trackHeight - thumbHeight);
        const thumbY =
          trackY +
          (thumbTravel * this._signalDebugPanelScrollIndex) / maxScrollIndex;

        const scrollbar = new PIXI.Container();
        scrollbar.position.set(trackX, trackY);
        scrollbar.hitArea = new PIXI.Rectangle(
          -signalDebugPanelScrollbarGap,
          0,
          signalDebugPanelScrollbarWidth + signalDebugPanelScrollbarGap,
          trackHeight
        );
        (scrollbar as any).eventMode = 'static';
        (scrollbar as any).interactive = true;
        (scrollbar as any).cursor = 'pointer';
        scrollbar.on('pointerdown', (event: any) => {
          const position = this._getSignalDebugPanelPointerPosition(event);
          const localY = position.y - this._signalDebugPanelY - trackY;
          const normalizedPosition = Math.min(
            1,
            Math.max(0, localY / trackHeight)
          );
          this._signalDebugPanelScrollIndex = Math.round(
            normalizedPosition * maxScrollIndex
          );
          this._clampSignalDebugPanelScrollIndex();
          this._renderSignalDebugPanel();
          if (event && event.stopPropagation) {
            event.stopPropagation();
          }
        });

        const scrollbarGraphics = new PIXI.Graphics();
        scrollbarGraphics.beginFill(0xffffff, 0.14);
        scrollbarGraphics.drawRoundedRect(
          0,
          0,
          signalDebugPanelScrollbarWidth,
          trackHeight,
          4
        );
        scrollbarGraphics.endFill();
        scrollbarGraphics.beginFill(0x00d1ff, 0.8);
        scrollbarGraphics.drawRoundedRect(
          0,
          thumbY - trackY,
          signalDebugPanelScrollbarWidth,
          thumbHeight,
          4
        );
        scrollbarGraphics.endFill();
        scrollbar.addChild(scrollbarGraphics);
        rows.addChild(scrollbar);
      }

      if (hoveredPayloadLog) {
        this._signalDebugHoveredPayloadLogId = hoveredPayloadLog.id;
        this._renderSignalDebugPayloadTooltip(
          rows,
          hoveredPayloadLog.payload,
          panelWidth,
          panelHeight,
          hoveredPayloadRowY
        );
      } else if (this._signalDebugHoveredPayloadLogId !== null) {
        this._signalDebugHoveredPayloadLogId = null;
      }
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

    _drawSignalDebugSceneReceiver(
      signalDraw: PIXI.Graphics,
      x: float,
      y: float,
      color: integer,
      alpha: float
    ): void {
      const markerAlpha = Math.max(0.2, alpha);
      const width = 46;
      const height = 34;
      const left = x - width / 2;
      const top = y - height / 2;

      signalDraw.lineStyle(2, color, 0.7 * markerAlpha);
      signalDraw.beginFill(0x0b1018, 0.36 * markerAlpha);
      signalDraw.drawRoundedRect(left, top, width, height, 8);
      signalDraw.endFill();

      signalDraw.lineStyle(1, 0xffffff, 0.45 * markerAlpha);
      signalDraw.beginFill(color, 0.12 * markerAlpha);
      signalDraw.drawRoundedRect(left + 6, top + 6, width - 12, height - 12, 5);
      signalDraw.endFill();

      signalDraw.beginFill(0xffdd78, 0.75 * markerAlpha);
      signalDraw.drawCircle(left + width - 13, top + 13, 4);
      signalDraw.endFill();

      signalDraw.lineStyle(2, color, 0.85 * markerAlpha);
      signalDraw.moveTo(left + 10, top + height - 10);
      signalDraw.lineTo(left + 19, top + height - 18);
      signalDraw.lineTo(left + 27, top + height - 11);
      signalDraw.lineTo(left + 34, top + height - 17);
      signalDraw.lineTo(left + width - 8, top + height - 10);

      signalDraw.lineStyle(1, 0xffffff, 0.55 * markerAlpha);
      signalDraw.drawCircle(x, y, 3);
    }

    /**
     * Render short-lived animated signal delivery lines for editor previews.
     */
    renderSignalDebugDraw(
      signalDebugRecords: gdjs.SignalAnimationDebugRecord[],
      signalDebugInfo?: gdjs.SignalDebugInfo | null
    ): void {
      const now = Date.now();
      this._signalDebugQueuedSignalsCount =
        signalDebugInfo?.queuedSignalsCount || 0;
      const signalDebugRecordsSignature =
        this._getSignalDebugRecordsSignature(signalDebugRecords);
      if (
        signalDebugRecordsSignature &&
        signalDebugRecordsSignature !==
          this._lastAppendedSignalDebugRecordsSignature
      ) {
        this._lastAppendedSignalDebugRecordsSignature =
          signalDebugRecordsSignature;
        this._appendSignalDebugPanelLogs(signalDebugRecords, now);
        for (let i = 0, len = signalDebugRecords.length; i < len; ++i) {
          const signalDebugRecord = signalDebugRecords[i];
          const color = getSignalDebugStatusColor(
            signalDebugRecord.status,
            signalDebugRecord.name
          );
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
              status: signalDebugRecord.status,
              color,
              startTime: now,
            });
          }
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
        const alpha = Math.max(0, 1 - age / signalDebugAnimationDuration);
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

        if (
          segment.receiver.objectName === 'scene' ||
          segment.receiver.receiverName === 'scene'
        ) {
          this._drawSignalDebugSceneReceiver(
            signalDraw,
            receiverX,
            receiverY,
            color,
            alpha
          );
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
      this._renderSignalDebugPanel();
    }

    clearSignalDebugDraw(): void {
      this._signalDebugSegments.length = 0;
      this._signalDebugPanelLogs.length = 0;
      this._lastAppendedSignalDebugRecordsSignature = '';
      this._signalDebugPanelScrollIndex = 0;
      this._clearSignalDebugLabels();
      this._clearSignalDebugPanelRows();
      this._unregisterSignalDebugPanelInputInterceptor();

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
      this._signalDebugPanel = null;
      this._signalDebugPanelBackground = null;
      this._signalDebugPanelRows = null;
      this._signalDebugPanelScrollIndex = 0;
      this._signalDebugHoveredPayloadLogId = null;
      this._signalDebugPanelPointerX = NaN;
      this._signalDebugPanelPointerY = NaN;
      this._hasUserPositionedSignalDebugPanel = false;
      this._isDraggingSignalDebugPanel = false;
      this._isSignalDebugPanelFolded = false;
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
