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
      { x: float; y: float; z: float }
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
      movement: { totalDeltaX: float; totalDeltaY: float; totalDeltaZ: float }
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
                }
              : {
                  x: object.getX(),
                  y: object.getY(),
                  z: 0,
                };
          this._objectInitialPositions.set(object, initialPosition);
        }

        object.setX(initialPosition.x + movement.totalDeltaX);
        object.setY(initialPosition.y + movement.totalDeltaY);
        if (object instanceof gdjs.RuntimeObject3D) {
          object.setZ(initialPosition.z + movement.totalDeltaZ);
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
    private _tempVector2d = new THREE.Vector2();
    private _outlinePasses: Record<string, THREE_ADDONS.OutlinePass> = {};
    private _raycaster = new THREE.Raycaster();

    // The controls shown to manipulate the selection.
    private _selectionControls: {
      object: gdjs.RuntimeObject;
      dummyThreeObject: THREE.Object3D;
      threeTransformControls: THREE_ADDONS.TransformControls;
    } | null = null;
    private _selectionControlsMovement: {
      totalDeltaX: float;
      totalDeltaY: float;
      totalDeltaZ: float;
    } | null = null;
    private _wasMovingSelectionLastFrame = false;

    // The selected objects.
    private _selection = new Selection();

    private _objectMover = new ObjectMover();

    private _lastCursorX: number = 0;
    private _lastCursorY: number = 0;

    constructor(game: RuntimeGame) {
      this._runtimeGame = game;
    }

    getTempVector2d(x: float, y: float): THREE.Vector2 {
      this._tempVector2d.x = x;
      this._tempVector2d.y = y;
      return this._tempVector2d;
    }

    private _handleCameraMovement() {
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        const layer = currentScene.getLayer(layerName);

        // TODO: factor this?
        const assumedFovIn2D = 45;
        const layerRenderer = layer.getRenderer();
        const threeCamera = layerRenderer.getThreeCamera();
        const fov = threeCamera
          ? threeCamera instanceof THREE.OrthographicCamera
            ? null
            : threeCamera.fov
          : assumedFovIn2D;
        if (!threeCamera) return;

        const { right, up, forward } = getCameraVectors(threeCamera);

        const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
          layer.setCameraX(layer.getCameraX() + vector.x * scale);
          layer.setCameraY(layer.getCameraY() + vector.y * scale);
          layer.setCameraZ(layer.getCameraZ(fov) + vector.z * scale, fov);
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
        !this._selectionControlsMovement
      ) {
        this._objectMover.endMove();
        this._sendSelectionUpdate();
      }

      // Start moving the selection.
      if (
        !this._wasMovingSelectionLastFrame &&
        this._selectionControlsMovement
      ) {
        this._objectMover.startMove();
      }

      // Move the selection.
      if (this._selectionControlsMovement) {
        this._objectMover.move(
          this._selection.getSelectedObjects(),
          this._selectionControlsMovement
        );
      }

      this._wasMovingSelectionLastFrame = !!this._selectionControlsMovement;
    }

    private _handleSelection({
      objectUnderCursor,
    }: {
      objectUnderCursor: gdjs.RuntimeObject | null;
    }) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      const inputManager = this._runtimeGame.getInputManager();
      if (!currentScene) return;

      // Left click: select the object under the cursor.
      if (
        inputManager.isMouseButtonPressed(0) &&
        !this._selectionControlsMovement
        // TODO: add check for space key
      ) {
        if (!isShiftPressed(inputManager)) {
          this._selection.clear();
        }

        if (objectUnderCursor) {
          this._selection.add(objectUnderCursor);
          this._sendSelectionUpdate();
        }
      }

      if (shouldDeleteSelection(inputManager)) {
        const removedObjects = this._selection.getSelectedObjects();
        removedObjects.forEach((object) => {
          object.deleteFromScene(currentScene);
        });
        this._selection.clear();
        this._sendSelectionUpdate({
          removedObjects,
        });
      }
    }

    private _updateSelectionOutline({
      objectUnderCursor,
    }: {
      objectUnderCursor: gdjs.RuntimeObject | null;
    }) {
      const runtimeGame = this._runtimeGame;
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        if (!this._outlinePasses[layerName]) {
          const runtimeLayerRender = currentScene
            .getLayer(layerName)
            .getRenderer();
          const threeCamera = runtimeLayerRender.getThreeCamera();
          const threeScene = runtimeLayerRender.getThreeScene();
          if (!threeCamera || !threeScene) return;

          this._outlinePasses[layerName] = new THREE_ADDONS.OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            threeScene,
            threeCamera
          );

          runtimeLayerRender.addPostProcessingPass(
            this._outlinePasses[layerName]
          );
        }
        const outlinePass = this._outlinePasses[layerName];

        outlinePass.edgeStrength = 6.0;
        outlinePass.edgeGlow = 0;
        outlinePass.edgeThickness = 1.0;
        outlinePass.pulsePeriod = 0;
        // TODO: OutlinePass currently wrongly highlights the transform controls helper.
        // (See https://discourse.threejs.org/t/outlinepass-with-transform-control/18722)
        outlinePass.selectedObjects = this._selection
          .getSelectedObjects()
          .filter((object) => object.getLayer() === layerName)
          .map((object) => object.get3DRendererObject())
          .filter(isDefined);
      });
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
        threeTransformControls.scale.y = -1;

        // The dummy object is an invisible object that is the one moved by the transform
        // controls.
        const dummyThreeObject = new THREE.Object3D();
        dummyThreeObject.position.copy(threeObject.position);
        dummyThreeObject.rotation.copy(threeObject.rotation);
        threeScene.add(dummyThreeObject);

        threeTransformControls.attach(dummyThreeObject);
        threeScene.add(threeTransformControls);

        // Keep track of the movement so the editor can apply it to the selection.
        const initialPosition = new THREE.Vector3();
        initialPosition.copy(dummyThreeObject.position);
        threeTransformControls.addEventListener('change', (e) => {
          if (!threeTransformControls.dragging) {
            this._selectionControlsMovement = null;

            // Reset the initial position to the current position, so that
            // it's ready to be dragged again.
            initialPosition.copy(dummyThreeObject.position);
            return;
          }

          this._selectionControlsMovement = {
            totalDeltaX: dummyThreeObject.position.x - initialPosition.x,
            totalDeltaY: dummyThreeObject.position.y - initialPosition.y,
            totalDeltaZ: dummyThreeObject.position.z - initialPosition.z,
          };
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
      }
    }

    private _sendSelectionUpdate(options?: {
      removedObjects: Array<gdjs.RuntimeObject>;
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
        .map((object) => {
          if (object instanceof gdjs.RuntimeObject3D) {
            if (!object.persistentUuid) return null;

            const instanceData: InstanceData = {
              persistentUuid: object.persistentUuid,
              ...object.getRenderer().getObjectPositionFrom3DRendererObject(),
              layer: object.getLayer(),
              angle: object.getAngle(),
              width: object.getWidth(),
              height: object.getHeight(),
              depth: object.getDepth(),
              locked: false, // TODO
              customSize: false, // TODO
              // TODO: how to transmit/should we transmit other properties?
            };

            return instanceData;
          } else {
            // TODO: handle 2D objects/instances.
            return null;
          }
        })
        .filter(isDefined);

      debuggerClient.sendInstanceChanges({
        updatedInstances,
        selectedInstances: getPersistentUuidsFromObjects(
          this._selection.getSelectedObjects()
        ),
        removedInstances: options
          ? getPersistentUuidsFromObjects(options.removedObjects)
          : [],
      });
    }

    reloadInstances(instances: Array<InstanceData>) {
      console.log(instances);
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) {
        return;
      }
      // TODO: Might be worth indexing instances data and runtime objects by their
      // persistentUuid (See HotReloader.indexByPersistentUuid).
      currentScene.getAdhocListOfAllInstances().forEach((runtimeObject) => {
        const instance = instances.find(
          (instance) => instance.persistentUuid === runtimeObject.persistentUuid
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
    }

    getObjectUnderCursor(): gdjs.RuntimeObject | null {
      const runtimeGame = this._runtimeGame;
      const firstIntersectsByLayer: {
        [layerName: string]: null | {
          intersect: THREE.Intersection;
        };
      } = {};

      const layerNames = [];
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      const threeRenderer = runtimeGame.getRenderer().getThreeRenderer();
      if (!currentScene || !threeRenderer) return null;

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
        const inputManager = runtimeGame.getInputManager();
        const normalizedDeviceCoordinates = this.getTempVector2d(
          (inputManager.getCursorX() / runtimeGame.getGameResolutionWidth()) *
            2 -
            1,
          -(inputManager.getCursorY() / runtimeGame.getGameResolutionHeight()) *
            2 +
            1
        );
        this._raycaster.setFromCamera(normalizedDeviceCoordinates, threeCamera);
        const intersects = this._raycaster.intersectObjects(
          threeGroup.children,
          false
        );

        const firstIntersect = intersects[0];
        if (!firstIntersect) return;

        firstIntersectsByLayer[layerName] = {
          intersect: firstIntersect,
        };
      });

      let closestIntersect;
      for (const intersect of Object.values(firstIntersectsByLayer)) {
        if (
          intersect &&
          intersect.intersect &&
          (!closestIntersect ||
            intersect.intersect.distance < closestIntersect.intersect.distance)
        ) {
          closestIntersect = intersect;
        }
      }

      if (!closestIntersect) return null;
      const threeObject = closestIntersect.intersect.object;
      if (!threeObject.gdjsRuntimeObject) return null;

      return threeObject.gdjsRuntimeObject;
    }

    updateAndRender() {
      const objectUnderCursor: gdjs.RuntimeObject | null = this.getObjectUnderCursor();

      this._handleCameraMovement();
      this._handleSelectionMovement();
      this._handleSelection({ objectUnderCursor });
      this._updateSelectionOutline({ objectUnderCursor });
      this._updateSelectionControls();
    }
  }
}
