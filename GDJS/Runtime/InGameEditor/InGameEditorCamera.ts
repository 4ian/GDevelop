namespace gdjs {
  /**
   * The camera of the in-game editor. It is moved by the editor controls and
   * applied to the layers as an override, so that the cameras of the layers
   * (which are game state) are never changed.
   */

  // See same factors in `newIDE/app/src/Utils/ZoomUtils.js`.
  const zoomInFactor = Math.pow(2, (2 * 1) / 16);
  const zoomOutFactor = Math.pow(2, (-2 * 1) / 16);

  const EQUAL_KEY = 187;
  const MINUS_KEY = 189;

  const isMacLike =
    typeof navigator !== 'undefined' &&
    navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
      ? true
      : false;

  const shouldScrollHorizontally = gdjs.isAltPressed;

  const shouldZoom = (inputManager: gdjs.InputManager) => {
    // Browsers trigger a wheel event with ctrlKey or metaKey to true when the user
    // does a pinch gesture on a trackpad. If this is the case, we zoom.
    // see https://dev.to/danburzo/pinch-me-i-m-zooming-gestures-in-the-dom-a0e
    if (gdjs.isControlOrCmdPressed(inputManager)) return true;
    if (isMacLike) {
      return gdjs.isControlOrCmdPressed(inputManager);
    } else {
      return (
        !gdjs.isControlOrCmdPressed(inputManager) &&
        !gdjs.isAltPressed(inputManager) &&
        !gdjs.isShiftPressed(inputManager)
      );
    }
  };

  const getTouchesCentroid = (inputManager: gdjs.InputManager) => {
    const ids = gdjs.getCurrentTouchIdentifiers(inputManager);
    if (ids.length === 0) return { x: 0, y: 0 };
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < ids.length; i++) {
      sx += inputManager.getTouchX(ids[i]);
      sy += inputManager.getTouchY(ids[i]);
    }
    return { x: sx / ids.length, y: sy / ids.length };
  };

  const getTouchesDistance = (inputManager: gdjs.InputManager) => {
    const ids = gdjs.getCurrentTouchIdentifiers(inputManager);
    if (ids.length === 0) return 0;
    return Math.hypot(
      inputManager.getTouchX(ids[0]) - inputManager.getTouchX(ids[1]),
      inputManager.getTouchY(ids[0]) - inputManager.getTouchY(ids[1])
    );
  };

  const areSameTouchesSet = (ids1: Array<integer>, ids2: Array<integer>) => {
    if (ids1.length !== ids2.length) return false;
    for (let i = 0; i < ids1.length; i++) {
      if (ids1[i] !== ids2[i]) return false;
    }
    return true;
  };

  /** @category In-Game Editor */
  export type EditorCameraState = {
    cameraMode: 'free' | 'orbit';
    positionX: float;
    positionY: float;
    positionZ: float;
    rotationAngle: float;
    elevationAngle: float;
    distance: float;
  };

  export class EditorCamera implements CameraControl {
    editor: gdjs.InGameEditor;
    orbitCameraControl: OrbitCameraControl;
    freeCameraControl: FreeCameraControl;
    private _hasChanged = false;
    private _hadChanged = false;
    private _mouseCursor: string | null = null;

    constructor(editor: gdjs.InGameEditor) {
      this.editor = editor;
      this.orbitCameraControl = new OrbitCameraControl(this);
      this.freeCameraControl = new FreeCameraControl(this);
      this.orbitCameraControl.setEnabled(false);
    }

    isFreeCamera(): boolean {
      return this.freeCameraControl.isEnabled();
    }

    private getActiveCamera() {
      return this.isFreeCamera()
        ? this.freeCameraControl
        : this.orbitCameraControl;
    }

    getRequestedMouseCursor(): string | null {
      return this._mouseCursor;
    }

    switchToOrbitAroundObject(object: gdjs.RuntimeObject): void {
      this.switchToOrbitAroundPosition(
        object.getCenterXInScene(),
        object.getCenterYInScene(),
        gdjs.is3D(object) ? object.getUnrotatedAABBMinZ() : 0
      );
      this.onHasCameraChanged();
    }

    switchToOrbitAroundPosition(
      targetX: float,
      targetY: float,
      targetZ: float
    ): void {
      this.orbitCameraControl.target.x = targetX;
      this.orbitCameraControl.target.y = targetY;
      this.orbitCameraControl.target.z = targetZ;
      if (this.freeCameraControl.isEnabled()) {
        this.orbitCameraControl.rotationAngle =
          this.freeCameraControl.rotationAngle;
        this.orbitCameraControl.elevationAngle =
          this.freeCameraControl.elevationAngle;
      }
      this.orbitCameraControl.setEnabled(true);
      this.freeCameraControl.setEnabled(false);
      this.onHasCameraChanged();
    }

    switchToOrbitAroundZ0(maxDistance: number): void {
      if (this.freeCameraControl.isEnabled()) {
        // Match orientation and orbit from the current free camera position.
        this.orbitCameraControl.rotationAngle =
          this.freeCameraControl.rotationAngle;
        this.orbitCameraControl.elevationAngle =
          this.freeCameraControl.elevationAngle;
        this.orbitCameraControl.orbitFromPositionAroundZ0(
          this.freeCameraControl.position.x,
          this.freeCameraControl.position.y,
          this.freeCameraControl.position.z,
          maxDistance
        );
      }

      this.orbitCameraControl.setEnabled(true);
      this.freeCameraControl.setEnabled(false);
      this.onHasCameraChanged();
    }

    switchToFreeCamera(): void {
      this.orbitCameraControl.setEnabled(false);
      this.freeCameraControl.setEnabled(true);

      this.freeCameraControl.position.x = this.orbitCameraControl.getCameraX();
      this.freeCameraControl.position.y = this.orbitCameraControl.getCameraY();
      this.freeCameraControl.position.z = this.orbitCameraControl.getCameraZ();
      this.freeCameraControl.rotationAngle =
        this.orbitCameraControl.rotationAngle;
      this.freeCameraControl.elevationAngle =
        this.orbitCameraControl.elevationAngle;
      this.onHasCameraChanged();
    }

    resetRotationToTopDown(): void {
      this.orbitCameraControl.resetRotationToTopDown();
      this.freeCameraControl.resetRotationToTopDown();
      this.onHasCameraChanged();
    }

    setOrbitDistance(distance: number): void {
      this.orbitCameraControl.distance = distance;
      this.onHasCameraChanged();
    }

    /**
     * Move the camera, keeping its orientation, so that the AABB of the objects
     * fits in the given area of the screen (e.g. the space between the editor panels).
     *
     * @param objects The objects to frame.
     * @param screenArea The area where to frame the objects, in ratios of the screen size.
     * @param margin The ratio of the screen area size kept empty on each side.
     */
    frameObjectsInScreenArea(
      objects: Array<RuntimeObject>,
      screenArea: ScreenArea,
      margin: float
    ): void {
      if (objects.length === 0) return;
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let minZ = Number.MAX_VALUE;
      let maxX = -Number.MAX_VALUE;
      let maxY = -Number.MAX_VALUE;
      let maxZ = -Number.MAX_VALUE;
      for (const object of objects) {
        const aabb = object.getAABB();
        minX = Math.min(minX, aabb.min[0]);
        minY = Math.min(minY, aabb.min[1]);
        minZ = Math.min(
          minZ,
          gdjs.is3D(object) ? object.getUnrotatedAABBMinZ() : 0
        );
        maxX = Math.max(maxX, aabb.max[0]);
        maxY = Math.max(maxY, aabb.max[1]);
        maxZ = Math.max(
          maxZ,
          gdjs.is3D(object) ? object.getUnrotatedAABBMaxZ() : 0
        );
      }
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // Keep the orientation of the camera that is currently used.
      const activeCamera = this.getActiveCamera();
      const yaw = gdjs.toRad(activeCamera.rotationAngle + 90);
      const elevation = gdjs.toRad(activeCamera.elevationAngle);
      const forward: Point3D = [
        -Math.cos(yaw) * Math.cos(elevation),
        -Math.sin(yaw) * Math.cos(elevation),
        -Math.sin(elevation),
      ];
      const right: Point3D = [Math.sin(yaw), -Math.cos(yaw), 0];
      // up = forward x right
      const up: Point3D = [
        forward[1] * right[2] - forward[2] * right[1],
        forward[2] * right[0] - forward[0] * right[2],
        forward[0] * right[1] - forward[1] * right[0],
      ];

      // Express the AABB corners in the camera basis, relatively to the AABB center.
      const cornersRight: Array<float> = [];
      const cornersUp: Array<float> = [];
      const cornersDepth: Array<float> = [];
      for (const cornerX of [minX, maxX]) {
        for (const cornerY of [minY, maxY]) {
          for (const cornerZ of [minZ, maxZ]) {
            const deltaX = cornerX - centerX;
            const deltaY = cornerY - centerY;
            const deltaZ = cornerZ - centerZ;
            cornersRight.push(
              deltaX * right[0] + deltaY * right[1] + deltaZ * right[2]
            );
            cornersUp.push(deltaX * up[0] + deltaY * up[1] + deltaZ * up[2]);
            cornersDepth.push(
              deltaX * forward[0] + deltaY * forward[1] + deltaZ * forward[2]
            );
          }
        }
      }

      // The screen area in normalized device coordinates (y going up), with the margin.
      const areaWidth = screenArea.maxX - screenArea.minX;
      const areaHeight = screenArea.maxY - screenArea.minY;
      if (areaWidth <= 0 || areaHeight <= 0) return;
      const ndcLeft = 2 * (screenArea.minX + margin * areaWidth) - 1;
      const ndcRight = 2 * (screenArea.maxX - margin * areaWidth) - 1;
      const ndcTop = 1 - 2 * (screenArea.minY + margin * areaHeight);
      const ndcBottom = 1 - 2 * (screenArea.maxY - margin * areaHeight);

      const runtimeGame = this.editor.getRuntimeGame();
      const aspectRatio =
        runtimeGame.getGameResolutionWidth() /
        runtimeGame.getGameResolutionHeight();
      const tanHalfVerticalFov = Math.tan(
        0.5 * gdjs.toRad(gdjs.editorCameraFov)
      );
      const tanHalfHorizontalFov = tanHalfVerticalFov * aspectRatio;

      // For a camera distance, the range of camera offsets (along one screen axis)
      // that keeps every corner inside [ndcMin, ndcMax], or null if there is none.
      const getOffsetRange = (
        distance: float,
        cornerOffsets: Array<float>,
        tanHalfFov: float,
        ndcMin: float,
        ndcMax: float
      ): [float, float] | null => {
        let offsetMin = -Number.MAX_VALUE;
        let offsetMax = Number.MAX_VALUE;
        for (let index = 0; index < cornerOffsets.length; index++) {
          const halfExtent = (distance + cornersDepth[index]) * tanHalfFov;
          offsetMin = Math.max(
            offsetMin,
            cornerOffsets[index] - ndcMax * halfExtent
          );
          offsetMax = Math.min(
            offsetMax,
            cornerOffsets[index] - ndcMin * halfExtent
          );
        }
        return offsetMin <= offsetMax ? [offsetMin, offsetMax] : null;
      };
      const getOffsetRanges = (distance: float) => {
        const rightRange = getOffsetRange(
          distance,
          cornersRight,
          tanHalfHorizontalFov,
          ndcLeft,
          ndcRight
        );
        const upRange = getOffsetRange(
          distance,
          cornersUp,
          tanHalfVerticalFov,
          ndcBottom,
          ndcTop
        );
        return rightRange && upRange ? { rightRange, upRange } : null;
      };

      // Find the smallest distance for which the corners fit (the fitting is monotonic).
      const minimumDistance = 10;
      let nearDistance = Math.max(
        minimumDistance,
        -Math.min(...cornersDepth) + minimumDistance
      );
      let farDistance = nearDistance;
      while (!getOffsetRanges(farDistance) && farDistance < 1e9) {
        nearDistance = farDistance;
        farDistance *= 2;
      }
      for (let iteration = 0; iteration < 40; iteration++) {
        const middleDistance = (nearDistance + farDistance) / 2;
        if (getOffsetRanges(middleDistance)) {
          farDistance = middleDistance;
        } else {
          nearDistance = middleDistance;
        }
      }
      const offsetRanges = getOffsetRanges(farDistance);
      if (!offsetRanges) return;
      const rightOffset =
        (offsetRanges.rightRange[0] + offsetRanges.rightRange[1]) / 2;
      const upOffset = (offsetRanges.upRange[0] + offsetRanges.upRange[1]) / 2;

      this.switchToOrbitAroundPosition(
        centerX + rightOffset * right[0] + upOffset * up[0],
        centerY + rightOffset * right[1] + upOffset * up[1],
        centerZ + rightOffset * right[2] + upOffset * up[2]
      );
      this.setOrbitDistance(farDistance);
    }

    step(): void {
      const runtimeGame = this.editor.getRuntimeGame();
      const inputManager = runtimeGame.getInputManager();

      const touchIds = gdjs.getCurrentTouchIdentifiers(inputManager);
      const touchCount = touchIds.length;

      // Always allow to use Space+click to switch to free camera and pan.
      // Display a grab cursor to indicate that.
      this._mouseCursor = null;
      if (gdjs.isSpacePressed(inputManager)) {
        this._mouseCursor = 'grab';

        // Switch to pan if space + left click is used.
        if (inputManager.isMouseButtonPressed(0) && !this.isFreeCamera()) {
          this.switchToFreeCamera();
        }
      }
      // Also switch to pan if shift + wheel click is used.
      if (
        gdjs.isShiftPressed(inputManager) &&
        inputManager.isMouseButtonPressed(2) &&
        !this.isFreeCamera()
      ) {
        this.switchToFreeCamera();
      }
      // Shift to orbit if just mouse wheel click is used
      if (
        !gdjs.isShiftPressed(inputManager) &&
        inputManager.isMouseButtonPressed(2) &&
        this.isFreeCamera()
      ) {
        const maxDistance = 4000; // Large enough to orbit quickly on most parts of a level.
        this.switchToOrbitAroundZ0(maxDistance);
      }
      // With touches, 2 touches will always pan/zoom the camera with the free camera.
      if (touchCount === 2 && !this.isFreeCamera()) {
        this.switchToFreeCamera();
      }
      // With touches, 3 touches will orbit around the point "in front of the camera".
      if (
        (touchCount === 3 ||
          this.editor
            .getShortcuts()
            .isPressed(inputManager, 'IN_GAME_EDITOR_ORBIT_CAMERA')) &&
        this.isFreeCamera()
      ) {
        const maxDistance = 4000; // Large enough to orbit quickly on most parts of a level.
        this.switchToOrbitAroundZ0(maxDistance);
      }

      this.orbitCameraControl.step();
      this.freeCameraControl.step();

      if (this._hadChanged && !this._hasChanged) {
        this._sendCameraState();
      }
      this._hadChanged = this._hasChanged;
      this._hasChanged = false;
    }

    onHasCameraChanged() {
      this._hasChanged = true;
      this.editor._onEditorCameraChanged();
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      this.getActiveCamera().updateCamera(currentScene, layer);
    }

    zoomBy(zoomInFactor: float): void {
      this.getActiveCamera().zoomBy(zoomInFactor);
      this.onHasCameraChanged();
    }

    setZoom(zoom: float): void {
      const distance = this._getCameraZFromZoom(zoom);
      this.switchToOrbitAroundPosition(this.getAnchorX(), this.getAnchorY(), 0);
      this.resetRotationToTopDown();
      this.setOrbitDistance(distance);
      this.onHasCameraChanged();
    }

    getAnchorX(): float {
      return this.getActiveCamera().getAnchorX();
    }
    getAnchorY(): float {
      return this.getActiveCamera().getAnchorY();
    }
    getAnchorZ(): float {
      return this.getActiveCamera().getAnchorZ();
    }

    zoomToInitialPosition(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      const runtimeGame = this.editor.getRuntimeGame();
      this.zoomToFitArea(
        {
          minX: 0,
          minY: 0,
          minZ: 0,
          maxX: runtimeGame.getOriginalWidth(),
          maxY: runtimeGame.getOriginalHeight(),
          maxZ: 0,
        },
        visibleScreenArea,
        0.1
      );
    }

    zoomToFitObjects(
      objects: Array<RuntimeObject>,
      visibleScreenArea: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      },
      margin: float
    ) {
      if (objects.length === 0) {
        const runtimeGame = this.editor.getRuntimeGame();
        this.zoomToFitArea(
          {
            minX: 0,
            minY: 0,
            minZ: 0,
            maxX: runtimeGame.getOriginalWidth(),
            maxY: runtimeGame.getOriginalHeight(),
            maxZ: 0,
          },
          visibleScreenArea,
          0.1
        );
      }
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let minZ = Number.MAX_VALUE;
      let maxX = Number.MIN_VALUE;
      let maxY = Number.MIN_VALUE;
      let maxZ = Number.MIN_VALUE;
      for (const object of objects) {
        const aabb = object.getAABB();
        minX = Math.min(minX, aabb.min[0]);
        minY = Math.min(minY, aabb.min[1]);
        minZ = Math.min(
          minZ,
          gdjs.is3D(object) ? object.getUnrotatedAABBMinZ() : 0
        );
        maxX = Math.max(maxX, aabb.max[0]);
        maxY = Math.max(maxY, aabb.max[1]);
        maxZ = Math.max(
          maxZ,
          gdjs.is3D(object) ? object.getUnrotatedAABBMaxZ() : 0
        );
      }
      this.zoomToFitArea(
        {
          minX,
          minY,
          minZ,
          maxX,
          maxY,
          maxZ,
        },
        visibleScreenArea,
        margin
      );
    }

    zoomToFitArea(
      sceneArea: {
        minX: number;
        minY: number;
        minZ: number;
        maxX: number;
        maxY: number;
        maxZ: number;
      },
      visibleScreenArea: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      },
      margin: float
    ) {
      const sceneAreaWidth = sceneArea.maxX - sceneArea.minX;
      const sceneAreaHeight = sceneArea.maxY - sceneArea.minY;

      const runtimeGame = this.editor.getRuntimeGame();
      const renderedWidth = runtimeGame.getGameResolutionWidth();
      const renderedHeight = runtimeGame.getGameResolutionHeight();
      const editorWidth =
        (visibleScreenArea.maxX - visibleScreenArea.minX) * renderedWidth;
      const editorHeight =
        (visibleScreenArea.maxY - visibleScreenArea.minY) * renderedHeight;
      const isContentWider =
        editorWidth * sceneAreaHeight < sceneAreaWidth * editorHeight;
      const zoom =
        (1 - 2 * margin) *
        (isContentWider
          ? editorWidth / sceneAreaWidth
          : editorHeight / sceneAreaHeight);
      const distance = this._getCameraZFromZoom(zoom);

      const sceneAreaCenterX = (sceneArea.maxX + sceneArea.minX) / 2;
      const sceneAreaCenterY = (sceneArea.maxY + sceneArea.minY) / 2;

      this.switchToOrbitAroundPosition(
        sceneAreaCenterX,
        sceneAreaCenterY,
        sceneArea.minZ
      );
      this.resetRotationToTopDown();
      this.setOrbitDistance(distance);
      this.onHasCameraChanged();
    }

    /**
     * Get the camera center Z position.
     *
     * @param zoom The camera zoom.
     * @return The z position of the camera
     */
    _getCameraZFromZoom = (zoom: float): float => {
      const runtimeGame = this.editor.getRuntimeGame();
      // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
      // The Z position is computed by taking the half height of the displayed rendering,
      // and using the angle of the triangle defined by the field of view to compute the length
      // of the triangle defining the distance between the camera and the rendering plane.
      return (
        (0.5 * runtimeGame.getGameResolutionHeight()) /
        zoom /
        Math.tan(0.5 * gdjs.toRad(gdjs.editorCameraFov))
      );
    };

    getCameraRotation(): float {
      return this.getActiveCamera().rotationAngle;
    }

    getCameraState(): EditorCameraState {
      return this.getActiveCamera()._getCameraState();
    }

    restoreCameraState(cameraState: EditorCameraState) {
      if (cameraState.cameraMode === 'free') {
        this.orbitCameraControl.setEnabled(false);
        this.freeCameraControl.setEnabled(true);
        this.freeCameraControl._restoreCameraState(cameraState);
      } else {
        this.freeCameraControl.setEnabled(false);
        this.orbitCameraControl.setEnabled(true);
        this.orbitCameraControl._restoreCameraState(cameraState);
      }
      this.onHasCameraChanged();
    }

    private _sendCameraState() {
      const runtimeGame = this.editor.getRuntimeGame();
      const debuggerClient = runtimeGame._debuggerClient;
      if (!debuggerClient) return;
      debuggerClient.sendCameraState(this.getCameraState());
    }
  }

  interface CameraControl {
    step(): void;
    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void;
    zoomBy(zoomInFactor: float): void;
    resetRotationToTopDown(): void;
    getAnchorX(): float;
    getAnchorY(): float;
    getAnchorZ(): float;
  }

  class OrbitCameraControl implements CameraControl {
    private _editorCamera: EditorCamera;
    target: THREE.Vector3 = new THREE.Vector3();
    rotationAngle: float = 0;
    elevationAngle: float = 90;
    distance: float = 800;
    private _isEnabled: boolean = true;

    private _lastCursorX: float = 0;
    private _lastCursorY: float = 0;
    private _wasMouseRightButtonPressed = false;
    private _wasMouseMiddleButtonPressed = false;

    private _gestureActiveTouchIds: Array<integer> = [];
    private _gestureLastCentroidX: float = 0;
    private _gestureLastCentroidY: float = 0;

    constructor(editorCamera: EditorCamera) {
      this._editorCamera = editorCamera;
    }

    isEnabled(): boolean {
      return this._isEnabled;
    }

    setEnabled(isEnabled: boolean): void {
      this._isEnabled = isEnabled;
      this._editorCamera.onHasCameraChanged();
    }

    step(): void {
      const runtimeGame = this._editorCamera.editor.getRuntimeGame();
      const inputManager = runtimeGame.getInputManager();
      const renderer = runtimeGame.getRenderer();
      const isRightButtonPressed = inputManager.isMouseButtonPressed(1);
      const isMiddleButtonPressed = inputManager.isMouseButtonPressed(2);

      if (this._isEnabled) {
        // Right click: rotate the camera.
        // Middle click: also rotate the camera.
        if (
          (isRightButtonPressed &&
            // The camera should not move the 1st frame
            this._wasMouseRightButtonPressed) ||
          (isMiddleButtonPressed &&
            // The camera should not move the 1st frame
            this._wasMouseMiddleButtonPressed)
        ) {
          // Use movement deltas when pointer is locked, otherwise use cursor position delta
          const xDelta = renderer.isPointerLocked()
            ? inputManager.getMouseMovementX()
            : inputManager.getCursorX() - this._lastCursorX;
          const yDelta = renderer.isPointerLocked()
            ? inputManager.getMouseMovementY()
            : inputManager.getCursorY() - this._lastCursorY;

          const rotationSpeed = 0.2;
          this.rotationAngle += xDelta * rotationSpeed;
          this.elevationAngle += yDelta * rotationSpeed;
          this._editorCamera.onHasCameraChanged();
        }

        // Mouse wheel: movement on the plane or forward/backward movement.
        const wheelDeltaY = inputManager.getMouseWheelDelta();
        if (wheelDeltaY !== 0 && shouldZoom(inputManager)) {
          this.distance = Math.max(
            10,
            this.distance * Math.pow(2, -wheelDeltaY / 512)
          );
          this._editorCamera.onHasCameraChanged();
        }

        // Movement with keyboard: zoom in/out.
        if (gdjs.isControlOrCmdPressed(inputManager)) {
          if (inputManager.wasKeyJustPressed(EQUAL_KEY)) {
            this.zoomBy(zoomInFactor);
          } else if (inputManager.wasKeyJustPressed(MINUS_KEY)) {
            this.zoomBy(zoomOutFactor);
          }
        }

        // Touch gestures
        const touchIds = gdjs.getCurrentTouchIdentifiers(inputManager);
        const touchCount = touchIds.length;

        if (touchCount === 0) {
          this._gestureActiveTouchIds = [];
        } else if (!areSameTouchesSet(this._gestureActiveTouchIds, touchIds)) {
          // Start or reinitialize gesture tracking
          this._gestureActiveTouchIds = touchIds.slice();
          if (touchCount === 3) {
            const centroid3 = getTouchesCentroid(inputManager);
            this._gestureLastCentroidX = centroid3.x;
            this._gestureLastCentroidY = centroid3.y;
          }
        } else {
          // Process ongoing gesture
          if (touchCount === 3) {
            // Three-finger rotation:
            // - adjust elevation angle from vertical movement of centroid
            // - adjust rotation angle from horizontal movement of centroid
            const centroid3 = getTouchesCentroid(inputManager);
            const dx3 = centroid3.x - this._gestureLastCentroidX;
            const dy3 = centroid3.y - this._gestureLastCentroidY;
            if (dx3 !== 0) {
              const tiltSpeed = 0.2;
              this.rotationAngle += dx3 * tiltSpeed;
              this._editorCamera.onHasCameraChanged();
            }
            if (dy3 !== 0) {
              const tiltSpeed = 0.2;
              this.elevationAngle += dy3 * tiltSpeed;
              if (this.elevationAngle < -45) this.elevationAngle = -45;
              if (this.elevationAngle > 175) this.elevationAngle = 175;
              this._editorCamera.onHasCameraChanged();
            }
            this._gestureLastCentroidX = centroid3.x;
            this._gestureLastCentroidY = centroid3.y;
          }
        }
      } else {
        // Reset gesture tracking when camera control is disabled.
        this._gestureActiveTouchIds = [];
      }

      this._wasMouseRightButtonPressed = isRightButtonPressed;
      this._wasMouseMiddleButtonPressed = isMiddleButtonPressed;
      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    getAnchorX(): float {
      return this.target.x;
    }

    getAnchorY(): float {
      return this.target.y;
    }

    getAnchorZ(): float {
      return this.target.z;
    }

    private _getCameraForwardVector(): Point3D {
      // Camera forward (from camera toward where it looks), unit length.
      const cosYaw = Math.cos(gdjs.toRad(this.rotationAngle + 90));
      const sinYaw = Math.sin(gdjs.toRad(this.rotationAngle + 90));
      const cosEl = Math.cos(gdjs.toRad(this.elevationAngle));
      const sinEl = Math.sin(gdjs.toRad(this.elevationAngle));

      const fwdX = -cosYaw * cosEl;
      const fwdY = -sinYaw * cosEl;
      const fwdZ = -sinEl;

      return [fwdX, fwdY, fwdZ];
    }

    getCameraX(): float {
      const [fwdX, ,] = this._getCameraForwardVector();
      return this.target.x - this.distance * fwdX;
    }

    getCameraY(): float {
      const [, fwdY] = this._getCameraForwardVector();
      return this.target.y - this.distance * fwdY;
    }

    getCameraZ(): float {
      const [, , fwdZ] = this._getCameraForwardVector();
      return this.target.z - this.distance * fwdZ;
    }

    orbitFromPositionAroundZ0(
      x: float,
      y: float,
      z: float,
      targetMaxDistance: float
    ): void {
      const [fwdX, fwdY, fwdZ] = this._getCameraForwardVector();

      // Intersect ray P(t) = camera position + t * forward with plane z = 0:
      // z + t*fwdZ = 0 => t = -z / fwdZ
      let tPlane: number | null = null;
      if (Math.abs(fwdZ) > 1e-6) {
        const t = -z / fwdZ;
        // Only keep intersections "in front" of the camera
        if (t > 0) tPlane = t;
      }

      // Choose distance along the ray:
      // - If there is a valid intersection within targetMaxDistance, use it
      // - Otherwise, clamp to targetMaxDistance
      const distance =
        tPlane !== null && tPlane <= targetMaxDistance
          ? tPlane
          : targetMaxDistance;

      // Target point = point ahead of camera along forward by distance
      this.target.x = x + fwdX * distance;
      this.target.y = y + fwdY * distance;
      this.target.z = z + fwdZ * distance;

      // Distance so that orbit camera stays exactly at the specified position
      this.distance = distance;
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      setEditorCameraOverrideOnLayer(layer, {
        x: this.getCameraX(),
        y: this.getCameraY(),
        z: this.getCameraZ(),
        rotation: this.rotationAngle,
        rotationX: 90 - this.elevationAngle,
        rotationY: 0,
      });
    }

    zoomBy(zoomFactor: float): void {
      // The distance is proportional to the inverse of the zoom.
      this.distance /= zoomFactor;
      this._editorCamera.onHasCameraChanged();
    }

    resetRotationToTopDown(): void {
      this.rotationAngle = 0;
      this.elevationAngle = 90;
      this._editorCamera.onHasCameraChanged();
    }

    _getCameraState(): EditorCameraState {
      return {
        cameraMode: 'orbit',
        positionX: this.target.x,
        positionY: this.target.y,
        positionZ: this.target.z,
        rotationAngle: this.rotationAngle,
        elevationAngle: this.elevationAngle,
        distance: this.distance,
      };
    }

    _restoreCameraState(cameraState: EditorCameraState): void {
      if (cameraState.cameraMode !== 'orbit') {
        return;
      }
      this.target.x = cameraState.positionX;
      this.target.y = cameraState.positionY;
      this.target.z = cameraState.positionZ;
      this.rotationAngle = cameraState.rotationAngle;
      this.elevationAngle = cameraState.elevationAngle;
      this.distance = cameraState.distance;
      this._editorCamera.onHasCameraChanged();
    }
  }

  class FreeCameraControl implements CameraControl {
    private _editorCamera: EditorCamera;
    position: THREE.Vector3 = new THREE.Vector3();
    rotationAngle: float = 0;
    elevationAngle: float = 30;
    private _isEnabled: boolean = true;
    private _euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'ZYX');
    private _rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();

    private _lastCursorX: float = 0;
    private _lastCursorY: float = 0;
    private _wasMouseRightButtonPressed = false;

    // Touch gesture state
    private _gestureActiveTouchIds: Array<integer> = [];
    private _gestureLastCentroidX: float = 0;
    private _gestureLastCentroidY: float = 0;
    private _gestureLastDistance: float = 0;

    constructor(editorCamera: EditorCamera) {
      this._editorCamera = editorCamera;
    }

    isEnabled(): boolean {
      return this._isEnabled;
    }

    setEnabled(isEnabled: boolean): void {
      this._isEnabled = isEnabled;
      this._editorCamera.onHasCameraChanged();
    }

    step(): void {
      const runtimeGame = this._editorCamera.editor.getRuntimeGame();
      const inputManager = runtimeGame.getInputManager();
      const renderer = runtimeGame.getRenderer();
      const isRightButtonPressed = inputManager.isMouseButtonPressed(1);
      if (this._isEnabled) {
        const { right, up, forward } = this.getCameraVectors();

        const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
          this.position.x += vector.x * scale;
          this.position.y += vector.y * scale;
          this.position.z += vector.z * scale;
          this._editorCamera.onHasCameraChanged();
        };

        // Mouse wheel: movement on the plane or forward/backward movement.
        const wheelDeltaY = inputManager.getMouseWheelDelta();
        const wheelDeltaX = inputManager.getMouseWheelDeltaX();
        if (wheelDeltaY !== 0 && shouldZoom(inputManager)) {
          moveCameraByVector(forward, wheelDeltaY);
        } else if (
          wheelDeltaY !== 0 &&
          shouldScrollHorizontally(inputManager)
        ) {
          moveCameraByVector(right, wheelDeltaY / 5);
        } else if (wheelDeltaX !== 0 || wheelDeltaY !== 0) {
          moveCameraByVector(up, wheelDeltaY / 5);
          moveCameraByVector(right, wheelDeltaX / 5);
        }

        // Touch gestures
        const touchIds = gdjs.getCurrentTouchIdentifiers(inputManager);
        const touchCount = touchIds.length;

        if (touchCount === 0) {
          this._gestureActiveTouchIds = [];
        } else if (!areSameTouchesSet(this._gestureActiveTouchIds, touchIds)) {
          // Start or reinitialize gesture tracking
          this._gestureActiveTouchIds = touchIds.slice();
          if (touchCount === 2) {
            const centroid = getTouchesCentroid(inputManager);
            this._gestureLastCentroidX = centroid.x;
            this._gestureLastCentroidY = centroid.y;
            this._gestureLastDistance = getTouchesDistance(inputManager);
          }
        } else {
          // Process ongoing gesture
          if (touchCount === 2) {
            // Pan: move on the camera plane by centroid delta
            const centroid = getTouchesCentroid(inputManager);
            const dx = (centroid.x - this._gestureLastCentroidX) * 5;
            const dy = (centroid.y - this._gestureLastCentroidY) * 5;
            if (dx !== 0 || dy !== 0) {
              moveCameraByVector(up, dy);
              moveCameraByVector(right, -dx);
              this._gestureLastCentroidX = centroid.x;
              this._gestureLastCentroidY = centroid.y;
            }

            // Pinch: zoom forward/backward based on distance delta
            const dist = getTouchesDistance(inputManager);
            const pinchDelta = (dist - this._gestureLastDistance) * 10;
            if (pinchDelta !== 0) {
              moveCameraByVector(forward, pinchDelta);
              this._gestureLastDistance = dist;
            }
          }
        }

        // Movement with the keyboard:
        // Either arrow keys (move in the camera plane) or the customizable
        // shortcuts (by default WASD for a "FPS move" + Q/E for up/down).
        // Shift makes the camera move faster.
        const moveSpeed = gdjs.isShiftPressed(inputManager) ? 48 : 6;

        if (
          !gdjs.isControlOrCmdPressed(inputManager) &&
          !gdjs.isAltPressed(inputManager)
        ) {
          if (inputManager.isKeyPressed(gdjs.LEFT_KEY)) {
            moveCameraByVector(right, -moveSpeed);
          }
          if (inputManager.isKeyPressed(gdjs.RIGHT_KEY)) {
            moveCameraByVector(right, moveSpeed);
          }
          if (inputManager.isKeyPressed(gdjs.UP_KEY)) {
            moveCameraByVector(up, moveSpeed);
          }
          if (inputManager.isKeyPressed(gdjs.DOWN_KEY)) {
            moveCameraByVector(up, -moveSpeed);
          }
        }

        const shortcuts = this._editorCamera.editor.getShortcuts();
        const isMoveCameraShortcutPressed = (commandName: string) =>
          shortcuts.isPressed(inputManager, commandName, true);
        // Forward/back
        if (isMoveCameraShortcutPressed('IN_GAME_EDITOR_MOVE_CAMERA_FORWARD')) {
          moveCameraByVector(forward, moveSpeed);
        }
        if (
          isMoveCameraShortcutPressed('IN_GAME_EDITOR_MOVE_CAMERA_BACKWARD')
        ) {
          moveCameraByVector(forward, -moveSpeed);
        }

        // Left/right (strafe)
        if (isMoveCameraShortcutPressed('IN_GAME_EDITOR_MOVE_CAMERA_LEFT')) {
          moveCameraByVector(right, -moveSpeed);
        }
        if (isMoveCameraShortcutPressed('IN_GAME_EDITOR_MOVE_CAMERA_RIGHT')) {
          moveCameraByVector(right, moveSpeed);
        }

        // Up/down
        if (isMoveCameraShortcutPressed('IN_GAME_EDITOR_MOVE_CAMERA_DOWN')) {
          moveCameraByVector(up, -moveSpeed);
        }
        if (isMoveCameraShortcutPressed('IN_GAME_EDITOR_MOVE_CAMERA_UP')) {
          moveCameraByVector(up, moveSpeed);
        }

        // Movement with keyboard: zoom in/out.
        if (gdjs.isControlOrCmdPressed(inputManager)) {
          if (inputManager.wasKeyJustPressed(EQUAL_KEY)) {
            this.zoomBy(zoomInFactor);
          } else if (inputManager.wasKeyJustPressed(MINUS_KEY)) {
            this.zoomBy(zoomOutFactor);
          }
        }

        // Space + click: move the camera on its plane.
        // Shift + Wheel click: same.
        if (
          (gdjs.isSpacePressed(inputManager) &&
            inputManager.isMouseButtonPressed(0)) ||
          (gdjs.isShiftPressed(inputManager) &&
            inputManager.isMouseButtonPressed(2))
        ) {
          // Use movement deltas when pointer is locked, otherwise use cursor position delta
          const xDelta = renderer.isPointerLocked()
            ? inputManager.getMouseMovementX()
            : inputManager.getCursorX() - this._lastCursorX;
          const yDelta = renderer.isPointerLocked()
            ? inputManager.getMouseMovementY()
            : inputManager.getCursorY() - this._lastCursorY;
          moveCameraByVector(up, yDelta);
          moveCameraByVector(right, -xDelta);
        }

        // Right click: rotate the camera.
        if (
          isRightButtonPressed &&
          // The camera should not move the 1st frame
          this._wasMouseRightButtonPressed
        ) {
          // Use movement deltas when pointer is locked, otherwise use cursor position delta
          const xDelta = renderer.isPointerLocked()
            ? inputManager.getMouseMovementX()
            : inputManager.getCursorX() - this._lastCursorX;
          const yDelta = renderer.isPointerLocked()
            ? inputManager.getMouseMovementY()
            : inputManager.getCursorY() - this._lastCursorY;

          const rotationSpeed = 0.2;
          this.rotationAngle += xDelta * rotationSpeed;
          this.elevationAngle += yDelta * rotationSpeed;
          this._editorCamera.onHasCameraChanged();
        }
      } else {
        // Reset gesture tracking when camera control is disabled.
        this._gestureActiveTouchIds = [];
      }
      this._wasMouseRightButtonPressed = isRightButtonPressed;
      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    moveForward(distanceDelta: number) {
      const { forward } = this.getCameraVectors();

      const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
        this.position.x += vector.x * scale;
        this.position.y += vector.y * scale;
        this.position.z += vector.z * scale;
        this._editorCamera.onHasCameraChanged();
      };

      moveCameraByVector(forward, distanceDelta);
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      setEditorCameraOverrideOnLayer(layer, {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
        rotation: this.rotationAngle,
        rotationX: 90 - this.elevationAngle,
        rotationY: 0,
      });
    }

    private getCameraVectors() {
      this._euler.x = gdjs.toRad(90 - this.elevationAngle);
      this._euler.z = gdjs.toRad(this.rotationAngle);
      this._rotationMatrix.makeRotationFromEuler(this._euler);

      // threeCamera.matrixWorld is a 4x4. In Three.js, the columns correspond to:
      //   [ right.x,   up.x,    forwardNeg.x,  pos.x
      //     right.y,   up.y,    forwardNeg.y,  pos.y
      //     right.z,   up.z,    forwardNeg.z,  pos.z
      //     0,         0,       0,             1     ]
      //
      // By default, a Three.js camera looks down the -Z axis, so the "forward" axis
      // in the matrix is actually the negative Z column. We'll call it "forward" below.
      const elements = this._rotationMatrix.elements;

      // Local right axis in world space:
      const right = new THREE.Vector3(elements[0], elements[1], elements[2]);
      // Local forward axis in world space (note we take the negative of that column).
      const forward = new THREE.Vector3(
        elements[8],
        elements[9],
        -elements[10]
      );

      // Local up axis in world space: orthogonal to both right and forward.
      const up = new THREE.Vector3().crossVectors(forward, right);

      // Normalize them, just in case (they should generally be unit vectors).
      right.normalize();
      up.normalize();
      forward.normalize();

      return { right, up, forward };
    }

    getAnchorX(): float {
      return this.position.x;
    }

    getAnchorY(): float {
      return this.position.y;
    }

    getAnchorZ(): float {
      return this.position.z;
    }

    zoomBy(zoomInFactor: float): void {
      this.moveForward(zoomInFactor > 1 ? 200 : -200);
      this._editorCamera.onHasCameraChanged();
    }

    resetRotationToTopDown(): void {
      this.rotationAngle = 0;
      this.elevationAngle = 90;
      this._editorCamera.onHasCameraChanged();
    }

    _getCameraState(): EditorCameraState {
      return {
        cameraMode: 'free',
        positionX: this.position.x,
        positionY: this.position.y,
        positionZ: this.position.z,
        rotationAngle: this.rotationAngle,
        elevationAngle: this.elevationAngle,
        distance: 0,
      };
    }

    _restoreCameraState(cameraState: EditorCameraState): void {
      if (cameraState.cameraMode !== 'free') {
        return;
      }
      this.position.x = cameraState.positionX;
      this.position.y = cameraState.positionY;
      this.position.z = cameraState.positionZ;
      this.rotationAngle = cameraState.rotationAngle;
      this.elevationAngle = cameraState.elevationAngle;
      this._editorCamera.onHasCameraChanged();
    }
  }

  /**
   * Render a layer with the camera of the editor without changing the camera
   * of the layer: the camera of a layer is game state (and is given back when
   * the game runs).
   */
  const setEditorCameraOverrideOnLayer = (
    layer: RuntimeLayer,
    camera: {
      x: float;
      y: float;
      z: float;
      rotation: float;
      rotationX: float;
      rotationY: float;
    }
  ) => {
    const threeCamera = layer.getRenderer().getThreeCamera();
    const fov =
      threeCamera && !(threeCamera instanceof THREE.OrthographicCamera)
        ? threeCamera.fov
        : null;
    // The same zoom as the one `setCameraZ` computes from a distance: it is
    // used to project the cursor on the 2D plane of the layer.
    const zoom = fov
      ? Math.min(
          Number.MAX_SAFE_INTEGER,
          (0.5 * layer.getHeight()) /
            (camera.z * Math.tan(0.5 * gdjs.toRad(fov)))
        )
      : layer.getCameraZoom();
    layer.getRenderer().setCameraOverride({
      ...camera,
      zoom: zoom > 0 ? zoom : layer.getCameraZoom(),
    });
  };
}
