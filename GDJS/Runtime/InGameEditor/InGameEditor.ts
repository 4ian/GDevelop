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

  const getInstanceDataFromRuntimeObject = (
    runtimeObject: gdjs.RuntimeObject
  ): InstanceData | null => {
    if (runtimeObject instanceof gdjs.RuntimeObject3D) {
      if (!runtimeObject.persistentUuid) return null;

      const instanceData: InstanceData = {
        name: runtimeObject.getName(),
        zOrder: runtimeObject.getZOrder(),
        persistentUuid: runtimeObject.persistentUuid,
        ...runtimeObject.getRenderer().getObjectPositionFrom3DRendererObject(),
        layer: runtimeObject.getLayer(),
        angle: runtimeObject.getAngle(),
        width: runtimeObject.getWidth(),
        height: runtimeObject.getHeight(),
        depth: runtimeObject.getDepth(),
        locked: false, // TODO
        customSize: false, // TODO
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
          container.scale.y = -1;
          const box = new THREE.BoxHelper(threeObject, '#f2a63c');
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
        threeTransformControls.traverse((obj) => {
          // To be detected correctly by OutlinePass.
          // @ts-ignore
          obj.isTransformControls = true;
        });

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

    cancelDragNewInstance() {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      if (this._draggedNewObject) {
        this._draggedNewObject.deleteFromScene(currentScene);
        this._draggedNewObject = null;
      }
    }

    dragNewInstance({ name, dropped }: { name: string; dropped: boolean }) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

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
        this._draggedNewObject.deleteFromScene(currentScene);
        this._draggedNewObject = null;
      }

      if (!this._draggedNewObject) {
        const newObject = currentScene.createObject(name);
        if (!newObject) return;
        newObject.persistentUuid = gdjs.makeUuid();
        this._draggedNewObject = newObject;
      }

      const closestIntersect = this._getClosestIntersectionUnderCursor();
      if (!closestIntersect) return;

      if (this._draggedNewObject instanceof gdjs.RuntimeObject3D) {
        this._draggedNewObject.setX(closestIntersect.point.x);
        this._draggedNewObject.setY(-closestIntersect.point.y);
        this._draggedNewObject.setZ(closestIntersect.point.z);
      } else {
        // TODO: handle 2D objects (project on plane).
      }
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
        draggedNewObjectPreviousMask = this._draggedNewObject.get3DRendererObject()
          .layers.mask;
        this._draggedNewObject.get3DRendererObject().layers.set(1);
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
        this._draggedNewObject.get3DRendererObject().layers.mask = draggedNewObjectPreviousMask;
      }

      let closestIntersect;
      for (const intersect of Object.values(firstIntersectsByLayer)) {
        if (
          intersect &&
          intersect.intersect &&
          (!closestIntersect ||
            intersect.intersect.distance < closestIntersect.intersect.distance)
        ) {
          closestIntersect = intersect.intersect;
        }
      }

      return closestIntersect || null;
    }

    getObjectUnderCursor(): gdjs.RuntimeObject | null {
      const closestIntersect = this._getClosestIntersectionUnderCursor();
      if (!closestIntersect) return null;

      // Walk back up the object hierarchy to find the runtime object.
      // We sadly need to do that because the intersection can be found on a Mesh or other
      // child Three.js object, instead of the one exposed by the gdjs.RuntimeObject.
      let threeObject: THREE.Object3D | null = closestIntersect.object;
      while (true) {
        if (!threeObject) return null;
        // @ts-ignore
        if (threeObject.gdjsRuntimeObject) return threeObject.gdjsRuntimeObject;
        threeObject = threeObject.parent || null;
      }
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
