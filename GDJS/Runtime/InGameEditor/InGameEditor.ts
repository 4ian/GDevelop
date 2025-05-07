namespace gdjs {
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;
  const ALT_KEY = 18;
  const DEL_KEY = 46;
  const BACKSPACE_KEY = 8;
  const LEFT_ALT_KEY = gdjs.InputManager.getLocationAwareKeyCode(ALT_KEY, 1);
  const RIGHT_ALT_KEY = gdjs.InputManager.getLocationAwareKeyCode(ALT_KEY, 2);
  const SHIFT_KEY = 16;
  const LEFT_SHIFT_KEY = gdjs.InputManager.getLocationAwareKeyCode(
    SHIFT_KEY,
    1
  );
  const RIGHT_SHIFT_KEY = gdjs.InputManager.getLocationAwareKeyCode(
    SHIFT_KEY,
    2
  );
  const SPACE_KEY = 32;
  const CTRL_KEY = 17;
  const LEFT_CTRL_KEY = gdjs.InputManager.getLocationAwareKeyCode(CTRL_KEY, 1);
  const RIGHT_CTRL_KEY = gdjs.InputManager.getLocationAwareKeyCode(CTRL_KEY, 2);
  const LEFT_META_KEY = gdjs.InputManager.getLocationAwareKeyCode(91, 1);
  const RIGHT_META_KEY = gdjs.InputManager.getLocationAwareKeyCode(93, 2);
  const W_KEY = 87;
  const A_KEY = 65;
  const S_KEY = 83;
  const D_KEY = 68;
  const Q_KEY = 81;
  const E_KEY = 69;

  const transformControlsModes: ['translate', 'rotate', 'scale'] = [
    'translate',
    'rotate',
    'scale',
  ];

  function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
    return value !== null && value !== undefined;
  }

  // TODO: factor this?
  const isMacLike =
    typeof navigator !== 'undefined' &&
    navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
      ? true
      : false;

  const isControlOrCmdPressed = (inputManager: gdjs.InputManager) => {
    // On macOS, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return (
      inputManager.isKeyPressed(LEFT_CTRL_KEY) ||
      inputManager.isKeyPressed(RIGHT_CTRL_KEY) ||
      inputManager.isKeyPressed(LEFT_META_KEY) ||
      inputManager.isKeyPressed(RIGHT_META_KEY)
    );
  };

  const isAltPressed = (inputManager: gdjs.InputManager) => {
    return (
      inputManager.isKeyPressed(LEFT_ALT_KEY) ||
      inputManager.isKeyPressed(RIGHT_ALT_KEY)
    );
  };

  const isShiftPressed = (inputManager: gdjs.InputManager) => {
    return (
      inputManager.isKeyPressed(LEFT_SHIFT_KEY) ||
      inputManager.isKeyPressed(RIGHT_SHIFT_KEY)
    );
  };

  const shouldDeleteSelection = (inputManager: gdjs.InputManager) => {
    return (
      inputManager.isKeyPressed(DEL_KEY) ||
      inputManager.isKeyPressed(BACKSPACE_KEY)
    );
  };

  const shouldScrollHorizontally = isAltPressed;

  const shouldZoom = (inputManager: gdjs.InputManager) => {
    // Browsers trigger a wheel event with ctrlKey or metaKey to true when the user
    // does a pinch gesture on a trackpad. If this is the case, we zoom.
    // see https://dev.to/danburzo/pinch-me-i-m-zooming-gestures-in-the-dom-a0e
    if (isControlOrCmdPressed(inputManager)) return true;
    if (isMacLike) {
      return isControlOrCmdPressed(inputManager);
    } else {
      return (
        !isControlOrCmdPressed(inputManager) &&
        !isAltPressed(inputManager) &&
        !isShiftPressed(inputManager)
      );
    }
  };

  const getInstanceDataFromRuntimeObject = (
    runtimeObject: gdjs.RuntimeObject
  ): InstanceData | null => {
    if (runtimeObject instanceof gdjs.RuntimeObject3D) {
      if (!runtimeObject.persistentUuid) return null;

      console.log(
        runtimeObject.getOriginalWidth(),
        runtimeObject.getOriginalHeight(),
        runtimeObject.getOriginalDepth()
      );
      const instanceData: InstanceData = {
        name: runtimeObject.getName(),
        zOrder: runtimeObject.getZOrder(),
        persistentUuid: runtimeObject.persistentUuid,
        ...runtimeObject.getRenderer().getObjectPositionFrom3DRendererObject(),
        layer: runtimeObject.getLayer(),
        angle: runtimeObject.getAngle(),
        rotationY: runtimeObject.getRotationY(),
        rotationX: runtimeObject.getRotationX(),
        customSize: runtimeObject.getScale() !== 1,
        width: runtimeObject.getWidth(),
        height: runtimeObject.getHeight(),
        depth: runtimeObject.getDepth(),
        // @ts-ignore
        defaultWidth: runtimeObject.getOriginalWidth(),
        defaultHeight: runtimeObject.getOriginalHeight(),
        defaultDepth: runtimeObject.getOriginalDepth(),
        locked: false, // TODO
        // TODO: how to transmit/should we transmit other properties?
      };

      return instanceData;
    } else {
      // TODO: handle 2D objects/instances.
      return null;
    }
  };

  class Selection {
    private _selectedObjects: Array<gdjs.RuntimeObject> = [];

    add(object: gdjs.RuntimeObject) {
      if (!this._selectedObjects.includes(object)) {
        this._selectedObjects.push(object);
      }
    }

    clear() {
      this._selectedObjects = [];
    }

    toggle(object: gdjs.RuntimeObject) {
      const index = this._selectedObjects.indexOf(object);
      if (index < 0) {
        this._selectedObjects.push(object);
      } else {
        this._selectedObjects.splice(index);
      }
    }

    getSelectedObjects() {
      return this._selectedObjects;
    }

    getLastSelectedObject(): gdjs.RuntimeObject | null {
      return this._selectedObjects[this._selectedObjects.length - 1] || null;
    }
  }

  class ObjectMover {
    _objectInitialPositions: Map<
      gdjs.RuntimeObject,
      {
        x: float;
        y: float;
        z: float;
        rotationX: float;
        rotationY: float;
        angle: float;
        width: float;
        height: float;
        depth: float;
      }
    > = new Map();

    startMove() {
      this._objectInitialPositions.clear();
    }

    endMove() {
      this._objectInitialPositions.clear();
    }

    // TODO: add support for snapping to grid.
    move(
      selectedObjects: Array<gdjs.RuntimeObject>,
      movement: {
        translationX: float;
        translationY: float;
        translationZ: float;
        rotationX: float;
        rotationY: float;
        rotationZ: float;
        scaleX: float;
        scaleY: float;
        scaleZ: float;
      }
    ) {
      selectedObjects.forEach((object) => {
        let initialPosition = this._objectInitialPositions.get(object);
        if (!initialPosition) {
          initialPosition =
            object instanceof gdjs.RuntimeObject3D
              ? {
                  x: object.getX(),
                  y: object.getY(),
                  z: object.getZ(),
                  rotationX: object.getRotationX(),
                  rotationY: object.getRotationY(),
                  angle: object.getAngle(),
                  width: object.getWidth(),
                  height: object.getHeight(),
                  depth: object.getDepth(),
                }
              : {
                  x: object.getX(),
                  y: object.getY(),
                  z: 0,
                  rotationX: 0,
                  rotationY: 0,
                  angle: object.getAngle(),
                  width: object.getWidth(),
                  height: object.getHeight(),
                  depth: 0,
                };
          this._objectInitialPositions.set(object, initialPosition);
        }
        object.setX(initialPosition.x + movement.translationX);
        object.setY(initialPosition.y + movement.translationY);
        object.setAngle(initialPosition.angle + movement.rotationZ);
        object.setWidth(initialPosition.width * movement.scaleX);
        object.setHeight(initialPosition.height * movement.scaleY);
        if (object instanceof gdjs.RuntimeObject3D) {
          object.setZ(initialPosition.z + movement.translationZ);
          object.setRotationX(initialPosition.rotationX + movement.rotationX);
          object.setRotationY(initialPosition.rotationY + movement.rotationY);
          object.setDepth(initialPosition.depth * movement.scaleZ);
        }
      });
    }
  }

  const getCameraVectors = (threeCamera: THREE.Camera) => {
    // Make sure camera's matrixWorld is up-to-date (usually is, but good practice).
    threeCamera.updateMatrixWorld();

    // threeCamera.matrixWorld is a 4x4. In Three.js, the columns correspond to:
    //   [ right.x,   up.x,    forwardNeg.x,  pos.x
    //     right.y,   up.y,    forwardNeg.y,  pos.y
    //     right.z,   up.z,    forwardNeg.z,  pos.z
    //     0,         0,       0,             1     ]
    //
    // By default, a Three.js camera looks down the -Z axis, so the "forward" axis
    // in the matrix is actually the negative Z column. We'll call it "forward" below.
    // We also invert the Y axis because it's inverted in GDevelop coordinates.
    const elements = threeCamera.matrixWorld.elements;

    // Local right axis in world space:
    const right = new THREE.Vector3(elements[0], -elements[1], elements[2]);
    // Local up axis in world space:
    const up = new THREE.Vector3(elements[4], -elements[5], elements[6]);
    // Local forward axis in world space (note we take the negative of that column).
    const forward = new THREE.Vector3(-elements[8], elements[9], -elements[10]);

    // Normalize them, just in case (they should generally be unit vectors).
    right.normalize();
    up.normalize();
    forward.normalize();

    return { right, up, forward };
  };

  export class InGameEditor {
    private _runtimeGame: RuntimeGame;
    private _editedInstanceContainer: gdjs.RuntimeInstanceContainer | null =
      null;
    private _tempVector2d = new THREE.Vector2();
    private _raycaster = new THREE.Raycaster();

    // The controls shown to manipulate the selection.
    private _selectionControls: {
      object: gdjs.RuntimeObject;
      dummyThreeObject: THREE.Object3D;
      threeTransformControls: THREE_ADDONS.TransformControls;
    } | null = null;
    private _selectionControlsMovementTotalDelta: {
      translationX: float;
      translationY: float;
      translationZ: float;
      rotationX: float;
      rotationY: float;
      rotationZ: float;
      scaleX: float;
      scaleY: float;
      scaleZ: float;
    } | null = null;
    private _hasSelectionActuallyMoved = false;
    private _wasMovingSelectionLastFrame = false;

    // The selected objects.
    private _selection = new Selection();
    private _selectionBoxes: Map<
      gdjs.RuntimeObject3D,
      { container: THREE.Group; box: THREE.BoxHelper }
    > = new Map();
    private _objectMover = new ObjectMover();

    private _lastCursorX: number = 0;
    private _lastCursorY: number = 0;

    // Dragged new object:
    private _draggedNewObject: gdjs.RuntimeObject | null = null;

    constructor(game: RuntimeGame) {
      this._runtimeGame = game;
    }

    setEditedInstanceContainer(
      editedInstanceContainer: gdjs.RuntimeInstanceContainer | null
    ) {
      this._editedInstanceContainer = editedInstanceContainer;
    }

    _getEditedInstanceContainer(): gdjs.RuntimeInstanceContainer | null {
      return (
        this._editedInstanceContainer ||
        this._runtimeGame.getSceneStack().getCurrentScene()
      );
    }

    getTempVector2d(x: float, y: float): THREE.Vector2 {
      this._tempVector2d.x = x;
      this._tempVector2d.y = y;
      return this._tempVector2d;
    }

    zoomToInitialPosition(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      this.zoomToFitArea(
        {
          minX: 0,
          minY: 0,
          maxX: this._runtimeGame.getOriginalWidth(),
          maxY: this._runtimeGame.getOriginalHeight(),
        },
        visibleScreenArea
      );
    }

    zoomToFitContent(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      this.zoomToFitObjects(
        editedInstanceContainer.getAdhocListOfAllInstances(),
        visibleScreenArea
      );
    }

    zoomToFitSelection(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      this.zoomToFitObjects(
        this._selection.getSelectedObjects(),
        visibleScreenArea
      );
    }

    zoomToFitObjects(
      objects: Array<RuntimeObject>,
      visibleScreenArea: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      }
    ) {
      if (objects.length === 0) {
        this.zoomToFitArea(
          {
            minX: 0,
            minY: 0,
            maxX: this._runtimeGame.getOriginalWidth(),
            maxY: this._runtimeGame.getOriginalHeight(),
          },
          visibleScreenArea
        );
      }
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      for (const object of objects) {
        const aabb = object.getAABB();
        minX = Math.min(minX, aabb.min[0]);
        minY = Math.min(minY, aabb.min[1]);
        maxX = Math.max(maxX, aabb.max[0]);
        maxY = Math.max(maxY, aabb.max[1]);
      }
      this.zoomToFitArea(
        {
          minX,
          minY,
          maxX,
          maxY,
        },
        visibleScreenArea
      );
    }

    zoomToFitArea(
      sceneArea: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      },
      visibleScreenArea: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      }
    ) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const sceneAreaWidth = sceneArea.maxX - sceneArea.minX;
      const sceneAreaHeight = sceneArea.maxY - sceneArea.minY;

      const renderedWidth = this._runtimeGame.getGameResolutionWidth();
      const renderedHeight = this._runtimeGame.getGameResolutionHeight();
      const editorWidth =
        (visibleScreenArea.maxX - visibleScreenArea.minX) * renderedWidth;
      const editorHeight =
        (visibleScreenArea.maxX - visibleScreenArea.minX) * renderedHeight;
      const isContentWider =
        editorWidth * sceneAreaHeight < sceneAreaWidth * editorHeight;
      const zoom =
        0.8 *
        (isContentWider
          ? editorWidth / sceneAreaWidth
          : editorHeight / sceneAreaHeight);

      const sceneAreaCenterX = (sceneArea.maxX + sceneArea.minX) / 2;
      const sceneAreaCenterY = (sceneArea.maxY + sceneArea.minY) / 2;
      const cameraX =
        sceneAreaCenterX +
        (renderedWidth *
          (0.5 * (-visibleScreenArea.minX + (1 - visibleScreenArea.maxX)))) /
          zoom;
      const cameraY =
        sceneAreaCenterY +
        (renderedHeight *
          (0.5 * (-visibleScreenArea.minY + (1 - visibleScreenArea.maxY)))) /
          zoom;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      for (const layerName of layerNames) {
        const layer = currentScene.getLayer(layerName);

        layer.setCameraX(cameraX);
        layer.setCameraY(cameraY);
        layer.setCameraZoom(zoom);
        gdjs.scene3d.camera.setCameraRotationX(currentScene, 0, layerName, 0);
        gdjs.scene3d.camera.setCameraRotationY(currentScene, 0, layerName, 0);
        layer.setCameraRotation(0);
      }
    }

    zoomBy(zoomInFactor: float) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      for (const layerName of layerNames) {
        const layer = currentScene.getLayer(layerName);

        const layerRenderer = layer.getRenderer();
        const threeCamera = layerRenderer.getThreeCamera();
        // TODO Handle a 2D zoom when the camera is not rotated?
        if (!threeCamera) return;

        const { forward } = getCameraVectors(threeCamera);

        // TODO Factorize
        const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
          layer.setCameraX(layer.getCameraX() + vector.x * scale);
          layer.setCameraY(layer.getCameraY() + vector.y * scale);
          gdjs.scene3d.camera.setCameraZ(
            currentScene,
            gdjs.scene3d.camera.getCameraZ(currentScene, layerName, 0) +
              vector.z * scale,
            layerName,
            0
          );
        };

        moveCameraByVector(forward, zoomInFactor > 1 ? 200 : -200);
      }
    }

    setSelectedObjects(persistentUuids: Array<string>) {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      const persistentUuidsSet = new Set<string>(persistentUuids);
      const selectedObjectsMap = new Map<string, gdjs.RuntimeObject>();
      for (const object of editedInstanceContainer.getAdhocListOfAllInstances()) {
        if (
          object.persistentUuid &&
          persistentUuidsSet.has(object.persistentUuid)
        ) {
          // We can't add the object to the selection directly because they
          // would be out of order.
          selectedObjectsMap.set(object.persistentUuid, object);
        }
      }
      this._selection.clear();
      for (const instanceUuid of persistentUuids) {
        const object = selectedObjectsMap.get(instanceUuid);
        if (object) {
          this._selection.add(object);
        }
      }
    }

    centerViewOnLastSelectedInstance(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const object = this._selection.getLastSelectedObject();
      if (!object) {
        return;
      }

      const renderedWidth = this._runtimeGame.getGameResolutionWidth();
      const renderedHeight = this._runtimeGame.getGameResolutionHeight();
      const zoom = currentScene.getLayer('').getCameraZoom();

      const cameraX =
        object.getCenterXInScene() +
        (renderedWidth *
          (0.5 * (-visibleScreenArea.minX + (1 - visibleScreenArea.maxX)))) /
          zoom;
      const cameraY =
        object.getCenterYInScene() +
        (renderedHeight *
          (0.5 * (-visibleScreenArea.minY + (1 - visibleScreenArea.maxY)))) /
          zoom;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      for (const layerName of layerNames) {
        const layer = currentScene.getLayer(layerName);

        layer.setCameraX(cameraX);
        layer.setCameraY(cameraY);
        layer.setCameraZoom(zoom);
        gdjs.scene3d.camera.setCameraRotationX(currentScene, 0, layerName, 0);
        gdjs.scene3d.camera.setCameraRotationY(currentScene, 0, layerName, 0);
        layer.setCameraRotation(0);
      }
    }

    private _handleCameraMovement() {
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        const layer = currentScene.getLayer(layerName);

        const layerRenderer = layer.getRenderer();
        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        const { right, up, forward } = getCameraVectors(threeCamera);

        const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
          layer.setCameraX(layer.getCameraX() + vector.x * scale);
          layer.setCameraY(layer.getCameraY() + vector.y * scale);
          gdjs.scene3d.camera.setCameraZ(
            currentScene,
            gdjs.scene3d.camera.getCameraZ(currentScene, layerName, 0) +
              vector.z * scale,
            layerName,
            0
          );
        };

        // Mouse wheel: movement on the plane or forward/backward movement.
        const wheelDeltaY = inputManager.getMouseWheelDelta();
        const wheelDeltaX = inputManager.getMouseWheelDeltaX();
        if (shouldZoom(inputManager)) {
          moveCameraByVector(forward, wheelDeltaY);
        } else if (shouldScrollHorizontally(inputManager)) {
          moveCameraByVector(right, wheelDeltaY / 5);
        } else {
          moveCameraByVector(up, wheelDeltaY / 5);
          moveCameraByVector(right, wheelDeltaX / 5);
        }

        // Movement with the keyboard:
        // Either arrow keys (move in the camera plane) or WASD ("FPS move" + Q/E for up/down).
        const moveSpeed = isShiftPressed(inputManager) ? 12 : 6;

        if (inputManager.isKeyPressed(LEFT_KEY)) {
          moveCameraByVector(right, -moveSpeed);
        }
        if (inputManager.isKeyPressed(RIGHT_KEY)) {
          moveCameraByVector(right, moveSpeed);
        }
        if (inputManager.isKeyPressed(UP_KEY)) {
          moveCameraByVector(up, moveSpeed);
        }
        if (inputManager.isKeyPressed(DOWN_KEY)) {
          moveCameraByVector(up, -moveSpeed);
        }
        // Forward/back
        if (inputManager.isKeyPressed(W_KEY)) {
          moveCameraByVector(forward, moveSpeed);
        }
        if (inputManager.isKeyPressed(S_KEY)) {
          moveCameraByVector(forward, -moveSpeed);
        }

        // Left/right (strafe)
        if (inputManager.isKeyPressed(A_KEY)) {
          moveCameraByVector(right, -moveSpeed);
        }
        if (inputManager.isKeyPressed(D_KEY)) {
          moveCameraByVector(right, moveSpeed);
        }

        // Up/down
        if (inputManager.isKeyPressed(Q_KEY)) {
          moveCameraByVector(up, -moveSpeed);
        }
        if (inputManager.isKeyPressed(E_KEY)) {
          moveCameraByVector(up, moveSpeed);
        }

        // Space + click: move the camera on its plane.
        if (
          inputManager.isKeyPressed(SPACE_KEY) &&
          inputManager.isMouseButtonPressed(0)
        ) {
          const xDelta = this._lastCursorX - inputManager.getCursorX();
          const yDelta = this._lastCursorY - inputManager.getCursorY();
          moveCameraByVector(up, -yDelta);
          moveCameraByVector(right, xDelta);
        }

        // Right click: rotate the camera.
        if (inputManager.isMouseButtonPressed(1)) {
          const xDelta = inputManager.getCursorX() - this._lastCursorX;
          const yDelta = inputManager.getCursorY() - this._lastCursorY;

          const layerRenderer = layer.getRenderer();
          const threeCamera = layerRenderer.getThreeCamera();

          if (threeCamera) {
            const rotationSpeed = 0.004;
            layer.setCameraRotation(
              layer.getCameraRotation() + gdjs.toDegrees(xDelta * rotationSpeed)
            );
            threeCamera.rotation.x -= yDelta * rotationSpeed;
          }
        }
      });

      // TODO: touch controls - pinch to zoom
      // TODO: touch controls - two fingers to move the camera

      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    private _handleSelectionMovement() {
      // Finished moving the selection.
      if (
        this._wasMovingSelectionLastFrame &&
        !this._selectionControlsMovementTotalDelta
      ) {
        this._objectMover.endMove();
        this._sendSelectionUpdate();
      }

      // Start moving the selection.
      if (
        !this._wasMovingSelectionLastFrame &&
        this._selectionControlsMovementTotalDelta
      ) {
        this._objectMover.startMove();
      }

      // Move the selection.
      if (this._selectionControlsMovementTotalDelta) {
        this._objectMover.move(
          this._selection.getSelectedObjects(),
          this._selectionControlsMovementTotalDelta
        );
      }
    }

    private _handleSelection({
      objectUnderCursor,
    }: {
      objectUnderCursor: gdjs.RuntimeObject | null;
    }) {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      const inputManager = this._runtimeGame.getInputManager();
      // Left click: select the object under the cursor.
      if (
        inputManager.isMouseButtonReleased(0) &&
        !this._hasSelectionActuallyMoved
        // TODO: add check for space key
      ) {
        if (
          !isShiftPressed(inputManager) &&
          this._selection.getLastSelectedObject() === objectUnderCursor
        ) {
          this._swapTransformControlsMode();
        } else {
          if (!isShiftPressed(inputManager)) {
            this._selection.clear();
          }
          if (objectUnderCursor) {
            this._selection.toggle(objectUnderCursor);
          }
          this._sendSelectionUpdate();
        }
      }

      if (shouldDeleteSelection(inputManager)) {
        const removedObjects = this._selection.getSelectedObjects();
        removedObjects.forEach((object) => {
          object.deleteFromScene(editedInstanceContainer);
        });
        this._selection.clear();
        this._sendSelectionUpdate({
          removedObjects,
        });
      }
    }

    private _swapTransformControlsMode() {
      if (!this._selectionControls) {
        return;
      }
      this._selectionControls.threeTransformControls.mode =
        transformControlsModes[
          gdjs.evtTools.common.mod(
            transformControlsModes.indexOf(
              this._selectionControls.threeTransformControls.mode
            ) + 1,
            transformControlsModes.length
          )
        ];
    }

    private _updateSelectionOutline({
      objectUnderCursor,
    }: {
      objectUnderCursor: gdjs.RuntimeObject | null;
    }) {
      const runtimeGame = this._runtimeGame;
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const selected3DObjects = this._selection
        .getSelectedObjects()
        .filter(
          (obj): obj is gdjs.RuntimeObject3D =>
            obj instanceof gdjs.RuntimeObject3D
        );

      // Remove boxes for deselected objects
      this._selectionBoxes.forEach(({ container }, object) => {
        if (!selected3DObjects.includes(object)) {
          container.removeFromParent();
          this._selectionBoxes.delete(object);
        }
      });

      // Add/update boxes for selected objects
      selected3DObjects.forEach((object) => {
        const threeObject = object.get3DRendererObject();
        if (!threeObject) return;

        const layer = currentScene.getLayer(object.getLayer());
        const threeGroup = layer.getRenderer().getThreeGroup();
        if (!threeGroup) return;

        let containerAndBox = this._selectionBoxes.get(object);
        if (!containerAndBox) {
          // Use a group to invert the Y-axis as the GDevelop Y axis is inverted
          // compared to Three.js. This is somehow necessary because the position
          // of the BoxHelper is always (0, 0, 0) and the geometry is hard to manipulate.
          const container = new THREE.Group();
          container.rotation.order = 'ZYX';
          container.scale.y = -1;
          const box = new THREE.BoxHelper(threeObject, '#f2a63c');
          box.rotation.order = 'ZYX';
          box.material.depthTest = false;
          box.material.fog = false;
          threeGroup.add(container);

          this._selectionBoxes.set(object, { container, box });
          container.add(box);
        }
      });

      this._selectionBoxes.forEach(({ box }) => {
        box.update();
      });
    }

    private _forceUpdateSelectionControls() {
      let mode: string | null = null;
      if (this._selectionControls) {
        mode = this._selectionControls.threeTransformControls.mode;
        this._selectionControls.threeTransformControls.detach();
        this._selectionControls.threeTransformControls.removeFromParent();
        this._selectionControls.dummyThreeObject.removeFromParent();
        this._selectionControls = null;
      }
      this._updateSelectionControls();
      if (mode && this._selectionControls) {
        //@ts-ignore
        this._selectionControls.threeTransformControls.mode = mode;
      }
    }

    private _updateSelectionControls() {
      const runtimeGame = this._runtimeGame;
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const lastSelectedObject = this._selection.getLastSelectedObject();

      if (
        this._selectionControls &&
        (!lastSelectedObject ||
          (lastSelectedObject &&
            this._selectionControls.object !== lastSelectedObject))
      ) {
        this._selectionControls.threeTransformControls.detach();
        this._selectionControls.threeTransformControls.removeFromParent();
        this._selectionControls.dummyThreeObject.removeFromParent();
        this._selectionControls = null;
      }

      if (lastSelectedObject && !this._selectionControls) {
        const threeObject = lastSelectedObject.get3DRendererObject();
        if (!threeObject) return;

        const layerName = lastSelectedObject.getLayer();
        const runtimeLayerRender = currentScene
          .getLayer(layerName)
          .getRenderer();
        const threeCamera = runtimeLayerRender.getThreeCamera();
        const threeScene = runtimeLayerRender.getThreeScene();
        if (!threeCamera || !threeScene) return;

        // Create and attach the transform controls. It is attached to a dummy object
        // to avoid the controls to directly move the runtime object (we handle this
        // manually).
        const threeTransformControls = new THREE_ADDONS.TransformControls(
          threeCamera,
          this._runtimeGame.getRenderer().getCanvas() || undefined
        );
        threeTransformControls.rotation.order = 'ZYX';
        threeTransformControls.scale.y = -1;
        threeTransformControls.traverse((obj) => {
          // To be detected correctly by OutlinePass.
          // @ts-ignore
          obj.isTransformControls = true;
        });

        // The dummy object is an invisible object that is the one moved by the transform
        // controls.
        const dummyThreeObject = new THREE.Object3D();
        dummyThreeObject.rotation.order = 'ZYX';
        dummyThreeObject.position.copy(threeObject.position);
        dummyThreeObject.rotation.copy(threeObject.rotation);
        dummyThreeObject.rotation.y = -dummyThreeObject.rotation.y;
        dummyThreeObject.rotation.z = -dummyThreeObject.rotation.z;
        dummyThreeObject.scale.copy(threeObject.scale);
        threeScene.add(dummyThreeObject);

        threeTransformControls.attach(dummyThreeObject);
        threeScene.add(threeTransformControls);

        // Keep track of the movement so the editor can apply it to the selection.
        const initialPosition = new THREE.Vector3();
        initialPosition.copy(dummyThreeObject.position);
        const initialRotation = new THREE.Euler();
        initialRotation.copy(dummyThreeObject.rotation);
        const initialScale = new THREE.Vector3();
        initialScale.copy(dummyThreeObject.scale);
        threeTransformControls.addEventListener('change', (e) => {
          if (!threeTransformControls.dragging) {
            this._selectionControlsMovementTotalDelta = null;

            // Reset the initial position to the current position, so that
            // it's ready to be dragged again.
            initialPosition.copy(dummyThreeObject.position);
            initialRotation.copy(dummyThreeObject.rotation);
            initialScale.copy(dummyThreeObject.scale);
            return;
          }

          this._selectionControlsMovementTotalDelta = {
            translationX: dummyThreeObject.position.x - initialPosition.x,
            translationY: dummyThreeObject.position.y - initialPosition.y,
            translationZ: dummyThreeObject.position.z - initialPosition.z,
            rotationX: gdjs.toDegrees(
              dummyThreeObject.rotation.x - initialRotation.x
            ),
            rotationY: -gdjs.toDegrees(
              dummyThreeObject.rotation.y - initialRotation.y
            ),
            rotationZ: -gdjs.toDegrees(
              dummyThreeObject.rotation.z - initialRotation.z
            ),
            scaleX: dummyThreeObject.scale.x / initialScale.x,
            scaleY: dummyThreeObject.scale.y / initialScale.y,
            scaleZ: dummyThreeObject.scale.z / initialScale.z,
          };

          this._hasSelectionActuallyMoved =
            this._hasSelectionActuallyMoved ||
            !dummyThreeObject.position.equals(initialPosition) ||
            !dummyThreeObject.rotation.equals(initialRotation) ||
            !dummyThreeObject.scale.equals(initialScale);
        });

        this._selectionControls = {
          object: lastSelectedObject,
          dummyThreeObject,
          threeTransformControls,
        };
      }
    }

    activate(enable: boolean) {
      if (enable) {
        // Nothing to do.
      } else {
        if (this._selectionControls) {
          // TODO: factor this.
          this._selectionControls.threeTransformControls.detach();
          this._selectionControls.threeTransformControls.removeFromParent();
          this._selectionControls.dummyThreeObject.removeFromParent();
          this._selectionControls = null;
        }

        // Cleanup selection boxes
        this._selectionBoxes.forEach(({ container }) => {
          container.removeFromParent();
        });
        this._selectionBoxes.clear();
      }
    }

    private _sendSelectionUpdate(options?: {
      addedObjects?: Array<gdjs.RuntimeObject>;
      removedObjects?: Array<gdjs.RuntimeObject>;
    }) {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;

      const getPersistentUuidsFromObjects = (
        objects: Array<gdjs.RuntimeObject>
      ): Array<InstancePersistentUuidData> =>
        objects
          .map((object) => {
            if (!object.persistentUuid) return null;

            return { persistentUuid: object.persistentUuid };
          })
          .filter(isDefined);

      const updatedInstances = this._selection
        .getSelectedObjects()
        .map((object) => getInstanceDataFromRuntimeObject(object))
        .filter(isDefined);

      const addedInstances =
        options && options.addedObjects
          ? options.addedObjects
              .map((object) => getInstanceDataFromRuntimeObject(object))
              .filter(isDefined)
          : [];

      debuggerClient.sendInstanceChanges({
        updatedInstances,
        addedInstances,
        selectedInstances: getPersistentUuidsFromObjects(
          this._selection.getSelectedObjects()
        ),
        removedInstances:
          options && options.removedObjects
            ? getPersistentUuidsFromObjects(options.removedObjects)
            : [],
      });
    }

    private _isLeftButtonPressed = false;
    private _pressedOriginalCursorX = 0;
    private _pressedOriginalCursorY = 0;

    private _handleContextMenu() {
      const inputManager = this._runtimeGame.getInputManager();
      if (inputManager.isMouseButtonPressed(1) && !this._isLeftButtonPressed) {
        this._isLeftButtonPressed = true;
        this._pressedOriginalCursorX = inputManager.getCursorX();
        this._pressedOriginalCursorY = inputManager.getCursorY();
      }
      if (inputManager.isMouseButtonReleased(1) && this._isLeftButtonPressed) {
        this._isLeftButtonPressed = false;
        if (
          this._pressedOriginalCursorX === inputManager.getCursorX() &&
          this._pressedOriginalCursorY === inputManager.getCursorY()
        ) {
          this._sendOpenContextMenu(
            inputManager.getCursorX(),
            inputManager.getCursorY()
          );
        }
      }
    }

    private _sendOpenContextMenu(cursorX: float, cursorY: float) {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;

      debuggerClient.sendOpenContextMenu(cursorX, cursorY);
    }

    cancelDragNewInstance() {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      if (this._draggedNewObject) {
        this._draggedNewObject.deleteFromScene(editedInstanceContainer);
        this._draggedNewObject = null;
      }
    }

    dragNewInstance({ name, dropped }: { name: string; dropped: boolean }) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      if (dropped) {
        if (this._draggedNewObject) {
          this._sendSelectionUpdate({
            addedObjects: [this._draggedNewObject],
          });
        }

        this._draggedNewObject = null;
        return;
      }

      if (this._draggedNewObject && this._draggedNewObject.getName() !== name) {
        this._draggedNewObject.deleteFromScene(editedInstanceContainer);
        this._draggedNewObject = null;
      }

      if (!this._draggedNewObject) {
        const newObject = editedInstanceContainer.createObject(name);
        if (!newObject) return;
        newObject.persistentUuid = gdjs.makeUuid();
        this._draggedNewObject = newObject;
      }

      const closestIntersect = this._getClosestIntersectionUnderCursor();

      if (this._draggedNewObject instanceof gdjs.RuntimeObject3D) {
        if (closestIntersect) {
          this._draggedNewObject.setX(closestIntersect.point.x);
          this._draggedNewObject.setY(-closestIntersect.point.y);
          this._draggedNewObject.setZ(closestIntersect.point.z);
        } else {
          this._draggedNewObject.setX(
            gdjs.evtTools.input.getCursorX(currentScene, '', 0)
          );
          this._draggedNewObject.setY(
            gdjs.evtTools.input.getCursorY(currentScene, '', 0)
          );
          this._draggedNewObject.setZ(0);
        }
      } else {
        // TODO: handle 2D objects (project on plane).
      }
    }

    reloadInstances(instances: Array<InstanceData>) {
      console.log(instances);

      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      // TODO: Might be worth indexing instances data and runtime objects by their
      // persistentUuid (See HotReloader.indexByPersistentUuid).
      editedInstanceContainer
        .getAdhocListOfAllInstances()
        .forEach((runtimeObject) => {
          const instance = instances.find(
            (instance) =>
              instance.persistentUuid === runtimeObject.persistentUuid
          );
          if (instance) {
            runtimeObject.setX(instance.x);
            runtimeObject.setY(instance.y);
            runtimeObject.setWidth(instance.width);
            runtimeObject.setHeight(instance.height);
            runtimeObject.setAngle(instance.angle);
            runtimeObject.setLayer(instance.layer);
            if (runtimeObject instanceof gdjs.RuntimeObject3D) {
              if (instance.z !== undefined) runtimeObject.setZ(instance.z);
              if (instance.rotationX !== undefined)
                runtimeObject.setRotationX(instance.rotationX);
              if (instance.rotationY !== undefined)
                runtimeObject.setRotationY(instance.rotationY);
              if (instance.depth !== undefined)
                runtimeObject.setDepth(instance.depth);
            }
            runtimeObject.extraInitializationFromInitialInstance(instance);
          }
        });
      this._forceUpdateSelectionControls();
    }

    private _getClosestIntersectionUnderCursor(): THREE.Intersection | null {
      const runtimeGame = this._runtimeGame;
      const firstIntersectsByLayer: {
        [layerName: string]: null | {
          intersect: THREE.Intersection;
        };
      } = {};
      const cursorX = runtimeGame.getInputManager().getCursorX();
      const cursorY = runtimeGame.getInputManager().getCursorY();

      const layerNames = [];
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      const threeRenderer = runtimeGame.getRenderer().getThreeRenderer();
      if (!currentScene || !threeRenderer) return null;

      // Only check layer 0, on which Three.js objects are by default,
      // and move selection boxes + dragged object to layer 1 so they
      // are not considered by raycasting.
      this._raycaster.layers.set(0);
      this._selectionBoxes.forEach(({ box }) => box.layers.set(1));
      let draggedNewObjectPreviousMask = 0;
      if (
        this._draggedNewObject &&
        this._draggedNewObject instanceof gdjs.RuntimeObject3D
      ) {
        draggedNewObjectPreviousMask =
          this._draggedNewObject.get3DRendererObject().layers.mask;
        this._draggedNewObject.get3DRendererObject().layers.set(1);
        this._draggedNewObject
          .get3DRendererObject()
          .traverse((object) => object.layers.set(1));
      }

      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        const runtimeLayerRender = currentScene
          .getLayer(layerName)
          .getRenderer();
        const threeCamera = runtimeLayerRender.getThreeCamera();
        const threeScene = runtimeLayerRender.getThreeScene();
        const threeGroup = runtimeLayerRender.getThreeGroup();
        if (!threeCamera || !threeScene || !threeGroup) return;

        // Note that raycasting is done by Three.js, which means it could slow down
        // if lots of 3D objects are shown. We consider that if this needs improvements,
        // this must be handled by the game engine culling
        const normalizedDeviceCoordinates = this.getTempVector2d(
          (cursorX / runtimeGame.getGameResolutionWidth()) * 2 - 1,
          -(cursorY / runtimeGame.getGameResolutionHeight()) * 2 + 1
        );
        this._raycaster.setFromCamera(normalizedDeviceCoordinates, threeCamera);
        const intersects = this._raycaster.intersectObjects(
          threeGroup.children,
          true
        );

        const firstIntersect = intersects[0];
        if (!firstIntersect) return;

        firstIntersectsByLayer[layerName] = {
          intersect: firstIntersect,
        };
      });

      // Reset selection boxes layers so they are properly displayed.
      this._selectionBoxes.forEach(({ box }) => box.layers.set(0));
      // Also reset the layer of the object being added.
      if (
        this._draggedNewObject &&
        this._draggedNewObject instanceof gdjs.RuntimeObject3D
      ) {
        this._draggedNewObject.get3DRendererObject().layers.mask =
          draggedNewObjectPreviousMask;
        this._draggedNewObject
          .get3DRendererObject()
          .traverse(
            (object) => (object.layers.mask = draggedNewObjectPreviousMask)
          );
      }

      let closestIntersect: THREE.Intersection | null = null;
      for (const intersect of Object.values(firstIntersectsByLayer)) {
        if (
          intersect &&
          (!closestIntersect ||
            intersect.intersect.distance < closestIntersect.distance)
        ) {
          closestIntersect = intersect.intersect;
        }
      }

      return closestIntersect;
    }

    getObjectUnderCursor(): gdjs.RuntimeObject | null {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return null;

      const closestIntersect = this._getClosestIntersectionUnderCursor();
      if (!closestIntersect) return null;

      // Walk back up the object hierarchy to find the runtime object.
      // We sadly need to do that because the intersection can be found on a Mesh or other
      // child Three.js object, instead of the one exposed by the gdjs.RuntimeObject.
      let threeObject: THREE.Object3D | null = closestIntersect.object;
      while (true) {
        if (!threeObject) return null;
        const runtimeObject: gdjs.RuntimeObject | null =
          // @ts-ignore
          threeObject.gdjsRuntimeObject;
        if (runtimeObject) {
          let rootRuntimeObject = runtimeObject;
          while (
            rootRuntimeObject.getInstanceContainer() instanceof
              gdjs.CustomRuntimeObjectInstanceContainer &&
            rootRuntimeObject.getInstanceContainer() !== editedInstanceContainer
          ) {
            rootRuntimeObject = (
              rootRuntimeObject.getInstanceContainer() as gdjs.CustomRuntimeObjectInstanceContainer
            ).getOwner();
          }
          return rootRuntimeObject;
        }
        threeObject = threeObject.parent || null;
      }
    }

    updateAndRender() {
      const objectUnderCursor: gdjs.RuntimeObject | null =
        this.getObjectUnderCursor();

      this._handleCameraMovement();
      this._handleSelectionMovement();
      this._handleSelection({ objectUnderCursor });
      this._updateSelectionOutline({ objectUnderCursor });
      this._updateSelectionControls();
      this._handleContextMenu();
      this._wasMovingSelectionLastFrame =
        !!this._selectionControlsMovementTotalDelta;
      if (!this._selectionControlsMovementTotalDelta) {
        this._hasSelectionActuallyMoved = false;
      }
    }
  }
}
