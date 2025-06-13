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
  const F_KEY = 70;

  const transformControlsModes: ['translate', 'rotate', 'scale'] = [
    'translate',
    'rotate',
    'scale',
  ];

  function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
    return value !== null && value !== undefined;
  }

  type RuntimeObjectWith3D = RuntimeObject &
    Base3DHandler &
    Resizable &
    Scalable &
    Flippable;

  const is3D = (object: gdjs.RuntimeObject): object is RuntimeObjectWith3D => {
    return typeof THREE !== 'undefined' && gdjs.Base3DHandler.is3D(object);
  };

  type AABB3D = {
    min: [float, float, float];
    max: [float, float, float];
  };

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
    if (gdjs.Base3DHandler.is3D(runtimeObject)) {
      if (!runtimeObject.persistentUuid) return null;

      const instanceData: InstanceData = {
        name: runtimeObject.getName(),
        zOrder: runtimeObject.getZOrder(),
        persistentUuid: runtimeObject.persistentUuid,
        x: runtimeObject.getX(),
        y: runtimeObject.getY(),
        z: runtimeObject.getZ(),
        layer: runtimeObject.getLayer(),
        angle: runtimeObject.getAngle(),
        rotationY: runtimeObject.getRotationY(),
        rotationX: runtimeObject.getRotationX(),
        customSize: runtimeObject.getScale() !== 1,
        width: runtimeObject.getWidth(),
        height: runtimeObject.getHeight(),
        depth: runtimeObject.getDepth(),
        locked: false, // TODO
        // TODO: how to transmit/should we transmit other properties?
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
        // @ts-ignore
        defaultWidth: runtimeObject.getOriginalWidth(),
        defaultHeight: runtimeObject.getOriginalHeight(),
        defaultDepth: runtimeObject.getOriginalDepth(),
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
        this._selectedObjects.splice(index, 1);
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
          initialPosition = is3D(object)
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
        if (is3D(object)) {
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
    private _editorId: string = '';
    private _runtimeGame: RuntimeGame;
    private _editedInstanceContainer: gdjs.RuntimeInstanceContainer | null =
      null;
    private _editedInstanceDataList: InstanceData[] = [];
    private _selectedLayerName: string = '';
    private _innerArea: AABB3D | null = null;
    private _threeInnerArea: THREE.Object3D | null = null;
    //@ts-ignore
    private _tempVector2d: THREE.Vector2 =
      typeof THREE === 'undefined' ? null : new THREE.Vector2();
    //@ts-ignore
    private _raycaster: THREE.Raycaster =
      typeof THREE === 'undefined' ? null : new THREE.Raycaster();

    private _editorCameras = new Map<string, EditorCamera>();

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

    private _selectionBox: THREE_ADDONS.SelectionBox | null = null;

    // The selected objects.
    private _selection = new Selection();
    private _selectionBoxes: Map<
      RuntimeObjectWith3D,
      { container: THREE.Group; box: THREE.BoxHelper }
    > = new Map();
    private _objectMover = new ObjectMover();

    private _wasMouseRightButtonPressed = false;
    private _wasMouseLeftButtonPressed = false;
    private _pressedOriginalCursorX: float = 0;
    private _pressedOriginalCursorY: float = 0;

    // Dragged new object:
    private _draggedNewObject: gdjs.RuntimeObject | null = null;

    constructor(game: RuntimeGame) {
      this._runtimeGame = game;
    }

    getEditorId(): string {
      return this._editorId;
    }

    setEditorId(editorId: string): void {
      this._editorId = editorId;
    }

    setEditedInstanceDataList(editedInstanceDataList: InstanceData[]) {
      this._editedInstanceDataList = editedInstanceDataList;
    }

    setEditedInstanceContainer(
      editedInstanceContainer: gdjs.RuntimeInstanceContainer | null
    ) {
      this._editedInstanceContainer = editedInstanceContainer;
      // The 3D scene is rebuilt and the inner area marker is lost in the process.
      this._threeInnerArea = null;
      this._innerArea = null;
    }

    _getEditedInstanceContainer(): gdjs.RuntimeInstanceContainer | null {
      return (
        this._editedInstanceContainer ||
        this._runtimeGame.getSceneStack().getCurrentScene()
      );
    }

    setInnerArea(innerArea: AABB3D | null) {
      this._innerArea = innerArea;
    }

    updateInnerArea(
      areaMinX: float,
      areaMinY: float,
      areaMinZ: float,
      areaMaxX: float,
      areaMaxY: float,
      areaMaxZ: float
    ) {
      if (!this._innerArea) {
        return;
      }
      // This only works because `this._innerArea` is the same instance as the
      // one used by custom object instances.
      this._innerArea.min[0] = areaMinX;
      this._innerArea.min[1] = areaMinY;
      this._innerArea.min[2] = areaMinZ;
      this._innerArea.max[0] = areaMaxX;
      this._innerArea.max[1] = areaMaxY;
      this._innerArea.max[2] = areaMaxZ;
    }

    setSelectedLayerName(layerName: string): void {
      this._selectedLayerName = layerName;
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
          minZ: 0,
          maxX: this._runtimeGame.getOriginalWidth(),
          maxY: this._runtimeGame.getOriginalHeight(),
          maxZ: 0,
        },
        visibleScreenArea,
        0.1
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
        visibleScreenArea,
        0.01
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
        visibleScreenArea,
        0.2
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
        this.zoomToFitArea(
          {
            minX: 0,
            minY: 0,
            minZ: 0,
            maxX: this._runtimeGame.getOriginalWidth(),
            maxY: this._runtimeGame.getOriginalHeight(),
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
        minZ = Math.min(minZ, is3D(object) ? object.getUnrotatedAABBMinZ() : 0);
        maxX = Math.max(maxX, aabb.max[0]);
        maxY = Math.max(maxY, aabb.max[1]);
        maxZ = Math.max(maxZ, is3D(object) ? object.getUnrotatedAABBMaxZ() : 0);
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
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const sceneAreaWidth = sceneArea.maxX - sceneArea.minX;
      const sceneAreaHeight = sceneArea.maxY - sceneArea.minY;

      const renderedWidth = this._runtimeGame.getGameResolutionWidth();
      const renderedHeight = this._runtimeGame.getGameResolutionHeight();
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

      // TODO Use this delta to rotate around the visible part of the screen.
      // or maybe we don't care and this block can be removed.
      const centerDeltaX =
        (renderedWidth *
          (0.5 * (-visibleScreenArea.minX + (1 - visibleScreenArea.maxX)))) /
        zoom;
      const centerDeltaY =
        (renderedHeight *
          (0.5 * (-visibleScreenArea.minY + (1 - visibleScreenArea.maxY)))) /
        zoom;

      this._getEditorCamera().switchToOrbitCamera();
      const orbitCameraControl = this._getObitCameraControl();
      orbitCameraControl.target.x = sceneAreaCenterX;
      orbitCameraControl.target.y = sceneAreaCenterY;
      orbitCameraControl.target.z = sceneArea.minZ;
      orbitCameraControl.distance = distance;
      orbitCameraControl.rotationAngle = 0;
      orbitCameraControl.elevationAngle = 90;
    }

    zoomBy(zoomInFactor: float) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const distanceDelta = zoomInFactor > 1 ? 200 : -200;
      const orbitCameraControl = this._getObitCameraControl();
      if (orbitCameraControl.isEnabled()) {
        orbitCameraControl.distance = Math.min(
          10,
          orbitCameraControl.distance + distanceDelta
        );
      } else {
        const freeCameraControl = this._getFreeCameraControl();
        freeCameraControl.moveForward(distanceDelta);
      }
    }

    /**
     * Get the camera center Z position.
     *
     * @param zoom The camera zoom.
     * @return The z position of the camera
     */
    private _getCameraZFromZoom = (zoom: float): float => {
      // TODO Should the editor force this fov?
      const fov = 45;
      // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
      // The Z position is computed by taking the half height of the displayed rendering,
      // and using the angle of the triangle defined by the field of view to compute the length
      // of the triangle defining the distance between the camera and the rendering plane.
      return (
        (0.5 * this._runtimeGame.getGameResolutionHeight()) /
        zoom /
        Math.tan(0.5 * gdjs.toRad(fov))
      );
    };

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

      const layer = this._getFirstLayer3D();
      if (!layer) {
        return;
      }

      // TODO Use this delta to rotate around the visible part of the screen.
      // or maybe we don't care and this block can be removed.
      const renderedWidth = this._runtimeGame.getGameResolutionWidth();
      const renderedHeight = this._runtimeGame.getGameResolutionHeight();
      const zoom = layer.getCameraZoom();
      const centerDeltaX =
        (renderedWidth *
          (0.5 * (-visibleScreenArea.minX + (1 - visibleScreenArea.maxX)))) /
        zoom;
      const centerDeltaY =
        (renderedHeight *
          (0.5 * (-visibleScreenArea.minY + (1 - visibleScreenArea.maxY)))) /
        zoom;

      this._getEditorCamera().switchToOrbitCamera();

      // We keep the same camera distance.
      const orbitCameraControl = this._getObitCameraControl();
      orbitCameraControl.target.x = object.getCenterXInScene();
      orbitCameraControl.target.y = object.getCenterYInScene();
      orbitCameraControl.target.z = is3D(object)
        ? object.getUnrotatedAABBMinZ()
        : 0;
      orbitCameraControl.rotationAngle = 0;
      orbitCameraControl.elevationAngle = 90;
    }

    private _handleCameraMovement() {
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const orbitCameraControl = this._getObitCameraControl();
      const freeCameraControl = this._getFreeCameraControl();

      const selectedObject = this._selection.getLastSelectedObject();
      if (inputManager.isKeyPressed(F_KEY) && selectedObject) {
        this._getEditorCamera().switchToOrbitCamera();

        // TODO Use the center of the AABB of the whole selection instead
        orbitCameraControl.target.x = selectedObject.getCenterXInScene();
        orbitCameraControl.target.y = selectedObject.getCenterYInScene();
        orbitCameraControl.target.z = is3D(selectedObject)
          ? selectedObject.getCenterZInScene()
          : 0;
      }

      if (
        !freeCameraControl.isEnabled() &&
        (inputManager.isKeyPressed(W_KEY) ||
          inputManager.isKeyPressed(S_KEY) ||
          inputManager.isKeyPressed(A_KEY) ||
          inputManager.isKeyPressed(D_KEY) ||
          inputManager.isKeyPressed(Q_KEY) ||
          inputManager.isKeyPressed(E_KEY))
      ) {
        orbitCameraControl.setEnabled(false);
        freeCameraControl.setEnabled(true);

        freeCameraControl.position.x = orbitCameraControl.getCameraX();
        freeCameraControl.position.y = orbitCameraControl.getCameraY();
        freeCameraControl.position.z = orbitCameraControl.getCameraZ();
        freeCameraControl.rotationAngle = orbitCameraControl.rotationAngle;
        freeCameraControl.elevationAngle = orbitCameraControl.elevationAngle;
      }

      this._getEditorCamera().step();

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        const layer = currentScene.getLayer(layerName);

        this._getEditorCamera().updateCamera(currentScene, layer);
      });

      // TODO: touch controls - pinch to zoom
      // TODO: touch controls - two fingers to move the camera
    }

    moveSelectionUnderCursor() {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const closestIntersect = this._getClosestIntersectionUnderCursor();
      let cursorX = 0;
      let cursorY = 0;
      let cursorZ = 0;
      if (closestIntersect) {
        cursorX = closestIntersect.point.x;
        cursorY = -closestIntersect.point.y;
        cursorZ = closestIntersect.point.z;
      } else {
        cursorX = gdjs.evtTools.input.getCursorX(currentScene, '', 0);
        cursorY = gdjs.evtTools.input.getCursorY(currentScene, '', 0);
        cursorZ = 0;
      }

      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let minZ = Number.MAX_VALUE;
      let maxX = Number.MIN_VALUE;
      let maxY = Number.MIN_VALUE;
      for (const object of this._selection.getSelectedObjects()) {
        minX = Math.min(minX, object.getAABBLeft());
        minY = Math.min(minY, object.getAABBTop());
        if (is3D(object)) {
          minZ = Math.min(minZ, object.getUnrotatedAABBMinZ());
        }
        maxX = Math.max(maxX, object.getAABBRight());
        maxY = Math.max(maxY, object.getAABBBottom());
      }
      const deltaX = cursorX - (maxX + minX) / 2;
      const deltaY = cursorY - (maxY + minY) / 2;
      const deltaZ = cursorZ - minZ;
      for (const object of this._selection.getSelectedObjects()) {
        object.setX(object.getX() + deltaX);
        object.setY(object.getY() + deltaY);
        if (is3D(object)) {
          object.setZ(object.getZ() + deltaZ);
        }
      }
      this._sendSelectionUpdate();
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

    private _updateSelectionBox() {
      const inputManager = this._runtimeGame.getInputManager();
      const runtimeGame = this._runtimeGame;
      const threeRenderer = runtimeGame.getRenderer().getThreeRenderer();
      if (!threeRenderer) return;
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const layer = currentScene.getLayer(this._selectedLayerName);
      const runtimeLayerRender = layer.getRenderer();
      const threeCamera = runtimeLayerRender.getThreeCamera();
      const threeScene = runtimeLayerRender.getThreeScene();
      if (!threeCamera || !threeScene) return;

      const cursorX = inputManager.getCursorX();
      const cursorY = inputManager.getCursorY();

      if (inputManager.isMouseButtonPressed(0)) {
        if (this._wasMouseLeftButtonPressed && this._selectionBox) {
          this._selectionBox.endPoint.set(
            this._getNormalizedScreenX(cursorX),
            this._getNormalizedScreenY(cursorY),
            0.5
          );
        } else {
          this._selectionBox = new THREE_ADDONS.SelectionBox(
            threeCamera,
            threeScene
          );
          this._selectionBox.startPoint.set(
            this._getNormalizedScreenX(cursorX),
            this._getNormalizedScreenY(cursorY),
            0.5
          );
        }
      }
      if (
        inputManager.isMouseButtonReleased(0) &&
        this._selectionBox &&
        !this._selectionBox.endPoint.equals(this._selectionBox.startPoint)
      ) {
        const objects = new Set<gdjs.RuntimeObject>();
        for (const selectThreeObject of this._selectionBox.select()) {
          // TODO Select the object if all its meshes are inside the rectangle
          // instead of if any is.
          const object = this._getObject(selectThreeObject);
          if (object) {
            objects.add(object);
          }
        }
        if (!isShiftPressed(inputManager)) {
          this._selection.clear();
        }
        if (layer.isVisible() && !layer._initialLayerData.isLocked) {
          for (const object of objects) {
            // TODO Check if the object is locked
            this._selection.add(object);
          }
        }
        this._selectionBox = null;
        this._sendSelectionUpdate();
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
        this._hasCursorStayedStillWhilePressed()
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
            // TODO Check if the object is locked
            const layer = editedInstanceContainer.getLayer(
              objectUnderCursor.getLayer()
            );
            if (!layer._initialLayerData.isLocked) {
              this._selection.toggle(objectUnderCursor);
            }
          }
          this._sendSelectionUpdate();
        }
      }

      if (shouldDeleteSelection(inputManager)) {
        const removedObjects = this._selection.getSelectedObjects();
        removedObjects.forEach((object) => {
          object.deleteFromScene();
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
        .filter((obj) => is3D(obj)) as Array<RuntimeObjectWith3D>;

      // Add/update boxes for selected objects
      selected3DObjects.forEach((object) =>
        this._createBoundingBoxIfNeeded(object)
      );
      if (
        objectUnderCursor &&
        is3D(objectUnderCursor) &&
        !this._selectionBoxes.has(objectUnderCursor)
      ) {
        this._createBoundingBoxIfNeeded(objectUnderCursor);
      }

      // Remove boxes for deselected objects
      this._selectionBoxes.forEach(({ container, box }, object) => {
        const isHovered = object === objectUnderCursor;
        const isInSelection = selected3DObjects.includes(object);
        if (!isInSelection && !isHovered) {
          container.removeFromParent();
          this._selectionBoxes.delete(object);
        } else {
          box.material.color = new THREE.Color(
            isHovered ? (isInSelection ? '#ffd200' : '#aaaaaa') : '#f2a63c'
          );
        }
      });

      this._selectionBoxes.forEach(({ box }) => {
        box.update();
      });
    }

    private _createBoundingBoxIfNeeded(object: RuntimeObjectWith3D): void {
      if (this._selectionBoxes.has(object)) {
        return;
      }
      const runtimeGame = this._runtimeGame;
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const threeObject = object.get3DRendererObject();
      if (!threeObject) return;

      const layer = currentScene.getLayer(object.getLayer());
      const threeGroup = layer.getRenderer().getThreeGroup();
      if (!threeGroup) return;

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

      container.add(box);
      this._selectionBoxes.set(object, { container, box });
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
        .map((object) => {
          const instance = getInstanceDataFromRuntimeObject(object);
          if (instance) {
            // Avoid to clear these properties when assigning it to the old InstanceData.
            // @ts-ignore
            delete instance.initialVariables;
            // @ts-ignore
            delete instance.numberProperties;
            // @ts-ignore
            delete instance.stringProperties;
          }
          return instance;
        })
        .filter(isDefined);

      const addedInstances =
        options && options.addedObjects
          ? options.addedObjects
              .map((object) => getInstanceDataFromRuntimeObject(object))
              .filter(isDefined)
          : [];

      const removedInstances =
        options && options.removedObjects ? options.removedObjects : [];

      this._removeInstances(removedInstances);
      this._updateInstances(updatedInstances);
      this._addInstances(addedInstances);

      debuggerClient.sendInstanceChanges({
        updatedInstances,
        addedInstances,
        selectedInstances: getPersistentUuidsFromObjects(
          this._selection.getSelectedObjects()
        ),
        removedInstances: getPersistentUuidsFromObjects(removedInstances),
      });
    }

    private _removeInstances(
      removedInstances: Array<{ persistentUuid: string | null }>
    ) {
      for (const removedInstance of removedInstances) {
        // TODO: Might be worth indexing instances data
        const instanceIndex = this._editedInstanceDataList.findIndex(
          (instance) =>
            instance.persistentUuid === removedInstance.persistentUuid
        );
        if (instanceIndex >= 0) {
          this._editedInstanceDataList.splice(instanceIndex, 1);
        }
      }
    }

    private _updateInstances(updatedInstances: Array<InstanceData>) {
      for (const updatedInstance of updatedInstances) {
        // TODO: Might be worth indexing instances data
        const oldInstance = this._editedInstanceDataList.find(
          (oldInstance) =>
            oldInstance.persistentUuid === updatedInstance.persistentUuid
        );
        if (oldInstance) {
          Object.assign(oldInstance, updatedInstance);
        }
      }
    }

    private _addInstances(addedInstances: Array<InstanceData>) {
      for (const addedInstance of addedInstances) {
        this._editedInstanceDataList.push(addedInstance);
      }
    }

    private _updateInnerAreaOutline(): void {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const layer = this._getFirstLayer3D();
      if (!layer) {
        return;
      }
      const threeGroup = layer.getRenderer().getThreeGroup();
      if (!threeGroup) {
        return;
      }
      if (!this._innerArea) {
        if (this._threeInnerArea) {
          threeGroup.remove(this._threeInnerArea);
          this._threeInnerArea = null;
        }
        return;
      }
      if (!this._threeInnerArea) {
        const boxMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            alphaTest: 1,
          })
        );
        boxMesh.position.x = 0.5;
        boxMesh.position.y = 0.5;
        boxMesh.position.z = 0.5;
        const box = new THREE.BoxHelper(boxMesh, '#444444');
        box.rotation.order = 'ZYX';
        //box.material.depthTest = false;
        box.material.fog = false;
        const container = new THREE.Group();
        container.rotation.order = 'ZYX';
        container.add(box);
        threeGroup.add(container);
        this._threeInnerArea = container;
      }
      const threeInnerArea = this._threeInnerArea;
      const innerArea = this._innerArea;
      threeInnerArea.scale.x = innerArea.max[0] - innerArea.min[0];
      threeInnerArea.scale.y = innerArea.max[1] - innerArea.min[1];
      threeInnerArea.scale.z = innerArea.max[2] - innerArea.min[2];
      threeInnerArea.position.x = innerArea.min[0];
      threeInnerArea.position.y = innerArea.min[1];
      threeInnerArea.position.z = innerArea.min[2];
    }

    private _handleContextMenu() {
      const inputManager = this._runtimeGame.getInputManager();
      if (
        inputManager.isMouseButtonReleased(1) &&
        this._hasCursorStayedStillWhilePressed()
      ) {
        this._sendOpenContextMenu(
          inputManager.getCursorX(),
          inputManager.getCursorY()
        );
      }
    }

    private _hasCursorStayedStillWhilePressed() {
      const inputManager = this._runtimeGame.getInputManager();
      return (
        this._pressedOriginalCursorX === inputManager.getCursorX() &&
        this._pressedOriginalCursorY === inputManager.getCursorY()
      );
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
        this._draggedNewObject.deleteFromScene();
        this._draggedNewObject = null;
      }
    }

    dragNewInstance({ name, dropped }: { name: string; dropped: boolean }) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      const selectedLayer = currentScene.getLayer(this._selectedLayerName);

      if (dropped) {
        if (this._draggedNewObject) {
          const isLayer3D = selectedLayer.getRenderer().getThreeGroup();
          if (isLayer3D) {
            const cameraX = selectedLayer.getCameraX();
            const cameraY = selectedLayer.getCameraY();
            const cameraZ = gdjs.scene3d.camera.getCameraZ(
              currentScene,
              selectedLayer.getName(),
              0
            );

            const closestIntersect = this._getClosestIntersectionUnderCursor();
            if (closestIntersect && !is3D(this._draggedNewObject)) {
              // Avoid to create a 2D object hidden under a 3D one.
              this.cancelDragNewInstance();
              return;
            }

            let cursorX;
            let cursorY;
            let cursorZ;
            if (closestIntersect) {
              cursorX = closestIntersect.point.x;
              cursorY = -closestIntersect.point.y;
              cursorZ = closestIntersect.point.z;
            } else {
              const projectedCursor = this._getProjectedCursor();
              if (!projectedCursor) {
                // Avoid to create an object behind the camera when it's dropped over the horizon.
                this.cancelDragNewInstance();
                return;
              }
              cursorX = projectedCursor[0];
              cursorY = projectedCursor[1];
              cursorZ = 0;
            }

            const cursorDistance = Math.hypot(
              cursorX - cameraX,
              cursorY - cameraY,
              cursorZ - cameraZ
            );
            if (
              cursorDistance >
              selectedLayer.getInitialCamera3DFarPlaneDistance()
            ) {
              // Avoid to create an object outside of the rendered area.
              this.cancelDragNewInstance();
              return;
            }
          }
          this._sendSelectionUpdate({
            addedObjects: [this._draggedNewObject],
          });
        }

        this._draggedNewObject = null;
        return;
      }

      if (this._draggedNewObject && this._draggedNewObject.getName() !== name) {
        this._draggedNewObject.deleteFromScene();
        this._draggedNewObject = null;
      }

      if (!this._draggedNewObject) {
        const newObject = editedInstanceContainer.createObject(name);
        if (!newObject) return;
        newObject.persistentUuid = gdjs.makeUuid();
        newObject.setLayer(selectedLayer.getName());
        this._draggedNewObject = newObject;
      }

      if (is3D(this._draggedNewObject)) {
        const closestIntersect = this._getClosestIntersectionUnderCursor();
        if (closestIntersect) {
          this._draggedNewObject.setX(closestIntersect.point.x);
          this._draggedNewObject.setY(-closestIntersect.point.y);
          this._draggedNewObject.setZ(closestIntersect.point.z);
        } else {
          const projectedCursor = this._getProjectedCursor();
          if (projectedCursor) {
            this._draggedNewObject.setX(projectedCursor[0]);
            this._draggedNewObject.setY(projectedCursor[1]);
            this._draggedNewObject.setZ(0);
          }
        }
      } else {
        const projectedCursor = this._getProjectedCursor();
        if (projectedCursor) {
          this._draggedNewObject.setX(projectedCursor[0]);
          this._draggedNewObject.setY(projectedCursor[1]);
        }
      }
    }

    _getFirstLayer3D(): gdjs.RuntimeLayer | null {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return null;

      const layerNames = [];
      currentScene.getAllLayerNames(layerNames);
      for (const layerName of layerNames) {
        const layer = currentScene.getLayer(layerName);
        const isLayer3D = layer.getRenderer().getThreeGroup();
        if (isLayer3D) {
          return layer;
        }
      }
      return null;
    }

    /**
     * @returns The cursor projected on the plane Z = 0 or `null` if the cursor is in the sky.
     */
    _getProjectedCursor(): FloatPoint | null {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return null;

      const layer = this._getFirstLayer3D();
      if (!layer) {
        return null;
      }

      const cameraX = layer.getCameraX();
      const cameraY = layer.getCameraY();
      const cameraZ = gdjs.scene3d.camera.getCameraZ(
        currentScene,
        layer.getName(),
        0
      );

      const cursorX = gdjs.evtTools.input.getCursorX(
        currentScene,
        layer.getName(),
        0
      );
      const cursorY = gdjs.evtTools.input.getCursorY(
        currentScene,
        layer.getName(),
        0
      );

      const deltaX = cursorX - cameraX;
      const deltaY = cursorY - cameraY;
      const deltaZ = 0 - cameraZ;

      const threeCamera = layer.getRenderer().getThreeCamera();
      if (!threeCamera) {
        return [cursorX, cursorY];
      }
      const { forward } = getCameraVectors(threeCamera);
      // It happens when the cursor is over the horizon and projected on the plane Z = 0.
      const isCursorBehindTheCamera =
        forward.dot(new THREE.Vector3(deltaX, deltaY, deltaZ)) < 1;
      if (isCursorBehindTheCamera) {
        return null;
      }
      return [cursorX, cursorY];
    }

    reloadInstances(instances: Array<InstanceData>) {
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
            if (is3D(runtimeObject)) {
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
      this._updateInstances(instances);
      this._forceUpdateSelectionControls();
    }

    addInstances(instances: Array<InstanceData>) {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      editedInstanceContainer.createObjectsFrom(instances, 0, 0, 0, true);
      this._addInstances(instances);
    }

    deleteSelection() {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      this._removeInstances(this._selection.getSelectedObjects());
      for (const object of this._selection.getSelectedObjects()) {
        object.deleteFromScene();
      }
      this._selection.clear();
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
      if (this._threeInnerArea) {
        for (const child of this._threeInnerArea.children) {
          child.layers.set(1);
        }
      }
      let draggedNewObjectPreviousMask = 0;
      if (this._draggedNewObject && is3D(this._draggedNewObject)) {
        const draggedRendererObject =
          this._draggedNewObject.get3DRendererObject();
        if (draggedRendererObject) {
          draggedNewObjectPreviousMask = draggedRendererObject.layers.mask;
          draggedRendererObject.layers.set(1);
          draggedRendererObject.traverse((object) => object.layers.set(1));
        }
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
          this._getNormalizedScreenX(cursorX),
          this._getNormalizedScreenY(cursorY)
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
      if (this._threeInnerArea) {
        for (const child of this._threeInnerArea.children) {
          child.layers.set(0);
        }
      }
      // Also reset the layer of the object being added.
      if (this._draggedNewObject && is3D(this._draggedNewObject)) {
        const draggedRendererObject =
          this._draggedNewObject.get3DRendererObject();
        if (draggedRendererObject) {
          draggedRendererObject.layers.mask = draggedNewObjectPreviousMask;
          draggedRendererObject.traverse(
            (object) => (object.layers.mask = draggedNewObjectPreviousMask)
          );
        }
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

    private _getNormalizedScreenX(x: float): float {
      return (x / this._runtimeGame.getGameResolutionWidth()) * 2 - 1;
    }

    private _getNormalizedScreenY(y: float): float {
      return -(y / this._runtimeGame.getGameResolutionHeight()) * 2 + 1;
    }

    getObjectUnderCursor(): gdjs.RuntimeObject | null {
      const closestIntersect = this._getClosestIntersectionUnderCursor();
      if (!closestIntersect) return null;
      return this._getObject(closestIntersect.object);
    }

    private _getObject(
      initialThreeObject: THREE.Object3D
    ): gdjs.RuntimeObject | null {
      const editedInstanceContainer = this._getEditedInstanceContainer();
      if (!editedInstanceContainer) return null;

      // Walk back up the object hierarchy to find the runtime object.
      // We sadly need to do that because the intersection can be found on a Mesh or other
      // child Three.js object, instead of the one exposed by the gdjs.RuntimeObject.
      let threeObject: THREE.Object3D | null = initialThreeObject;
      while (threeObject) {
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
      return null;
    }

    updateAndRender() {
      const objectUnderCursor: gdjs.RuntimeObject | null =
        this.getObjectUnderCursor();

      const inputManager = this._runtimeGame.getInputManager();
      if (
        !this._wasMouseLeftButtonPressed &&
        !this._wasMouseRightButtonPressed &&
        (inputManager.isMouseButtonPressed(0) ||
          inputManager.isMouseButtonPressed(1))
      ) {
        this._pressedOriginalCursorX = inputManager.getCursorX();
        this._pressedOriginalCursorY = inputManager.getCursorY();
      }

      this._handleCameraMovement();
      this._handleSelectionMovement();
      this._updateSelectionBox();
      this._handleSelection({ objectUnderCursor });
      this._updateSelectionOutline({ objectUnderCursor });
      this._updateSelectionControls();
      this._updateInnerAreaOutline();
      this._handleContextMenu();
      this._wasMovingSelectionLastFrame =
        !!this._selectionControlsMovementTotalDelta;
      if (!this._selectionControlsMovementTotalDelta) {
        this._hasSelectionActuallyMoved = false;
      }
      this._wasMouseLeftButtonPressed = inputManager.isMouseButtonPressed(0);
      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);
    }

    private _getEditorCamera(): EditorCamera {
      let editorCamera = this._editorCameras.get(this._editorId);
      if (!editorCamera) {
        editorCamera = new EditorCamera(this._runtimeGame);
        this._editorCameras.set(this._editorId, editorCamera);
      }
      return editorCamera;
    }

    private _getObitCameraControl() {
      return this._getEditorCamera().orbitCameraControl;
    }

    private _getFreeCameraControl() {
      return this._getEditorCamera().freeCameraControl;
    }
  }

  class EditorCamera implements CameraControl {
    orbitCameraControl: OrbitCameraControl;
    freeCameraControl: FreeCameraControl;

    constructor(runtimeGame: gdjs.RuntimeGame) {
      this.orbitCameraControl = new OrbitCameraControl(runtimeGame);
      this.freeCameraControl = new FreeCameraControl(runtimeGame);
      this.freeCameraControl.setEnabled(false);
    }

    switchToOrbitCamera(): void {
      if (this.freeCameraControl.isEnabled()) {
        this.orbitCameraControl.rotationAngle =
          this.freeCameraControl.rotationAngle;
        this.orbitCameraControl.elevationAngle =
          this.freeCameraControl.elevationAngle;
      }
      this.orbitCameraControl.setEnabled(true);
      this.freeCameraControl.setEnabled(false);
    }

    step(): void {
      this.orbitCameraControl.step();
      this.freeCameraControl.step();
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      if (this.orbitCameraControl.isEnabled()) {
        this.orbitCameraControl.updateCamera(currentScene, layer);
      } else {
        this.freeCameraControl.updateCamera(currentScene, layer);
      }
    }
  }

  interface CameraControl {
    step(): void;
    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void;
  }

  class OrbitCameraControl implements CameraControl {
    target: THREE.Vector3 = new THREE.Vector3();
    rotationAngle: float = 0;
    elevationAngle: float = 90;
    distance: float = 800;
    private _isEnabled: boolean = true;

    private _runtimeGame: gdjs.RuntimeGame;
    private _lastCursorX: float = 0;
    private _lastCursorY: float = 0;
    private _wasMouseRightButtonPressed = false;

    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._runtimeGame = runtimeGame;
    }

    isEnabled(): boolean {
      return this._isEnabled;
    }

    setEnabled(isEnabled: boolean): void {
      this._isEnabled = isEnabled;
    }

    step(): void {
      const inputManager = this._runtimeGame._inputManager;
      if (this._isEnabled) {
        // Right click: rotate the camera.
        if (
          inputManager.isMouseButtonPressed(1) &&
          // The camera should not move the 1st frame
          this._wasMouseRightButtonPressed
        ) {
          const xDelta = inputManager.getCursorX() - this._lastCursorX;
          const yDelta = inputManager.getCursorY() - this._lastCursorY;

          const rotationSpeed = 0.2;
          this.rotationAngle += xDelta * rotationSpeed;
          this.elevationAngle += yDelta * rotationSpeed;
        }
      }

      // Mouse wheel: movement on the plane or forward/backward movement.
      const wheelDeltaY = inputManager.getMouseWheelDelta();
      if (shouldZoom(inputManager)) {
        this.distance = Math.max(10, this.distance - wheelDeltaY);
      }

      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);
      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    getCameraX(): float {
      return (
        this.target.x +
        this.distance *
          Math.cos(gdjs.toRad(this.rotationAngle + 90)) *
          Math.cos(gdjs.toRad(this.elevationAngle))
      );
    }

    getCameraY(): float {
      return (
        this.target.y +
        this.distance *
          Math.sin(gdjs.toRad(this.rotationAngle + 90)) *
          Math.cos(gdjs.toRad(this.elevationAngle))
      );
    }

    getCameraZ(): float {
      return (
        this.target.z +
        this.distance * Math.sin(gdjs.toRad(this.elevationAngle))
      );
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      const layerRenderer = layer.getRenderer();
      const layerName = layer.getName();
      const threeCamera = layerRenderer.getThreeCamera();

      if (!threeCamera) {
        return;
      }

      layer.setCameraX(this.getCameraX());
      layer.setCameraY(this.getCameraY());
      gdjs.scene3d.camera.setCameraZ(
        currentScene,
        this.getCameraZ(),
        layerName,
        0
      );
      gdjs.scene3d.camera.setCameraRotationX(
        currentScene,
        90 - this.elevationAngle,
        layerName,
        0
      );
      gdjs.scene3d.camera.setCameraRotationY(currentScene, 0, layerName, 0);
      layer.setCameraRotation(this.rotationAngle);
    }
  }

  class FreeCameraControl implements CameraControl {
    position: THREE.Vector3 = new THREE.Vector3();
    rotationAngle: float = 0;
    elevationAngle: float = 30;
    private _isEnabled: boolean = true;

    private _euler: THREE.Euler;
    private _rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();

    private _runtimeGame: gdjs.RuntimeGame;
    private _lastCursorX: float = 0;
    private _lastCursorY: float = 0;
    private _wasMouseRightButtonPressed = false;

    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._runtimeGame = runtimeGame;
      this._euler = new THREE.Euler();
      this._euler.order = 'ZYX';
    }

    isEnabled(): boolean {
      return this._isEnabled;
    }

    setEnabled(isEnabled: boolean): void {
      this._isEnabled = isEnabled;
    }

    step(): void {
      const inputManager = this._runtimeGame._inputManager;
      if (this._isEnabled) {
        const { right, up, forward } = this.getCameraVectors();

        const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
          this.position.x += vector.x * scale;
          this.position.y += vector.y * scale;
          this.position.z += vector.z * scale;
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
        if (
          inputManager.isMouseButtonPressed(1) &&
          // The camera should not move the 1st frame
          this._wasMouseRightButtonPressed
        ) {
          const xDelta = inputManager.getCursorX() - this._lastCursorX;
          const yDelta = inputManager.getCursorY() - this._lastCursorY;

          const rotationSpeed = 0.2;
          this.rotationAngle += xDelta * rotationSpeed;
          this.elevationAngle += yDelta * rotationSpeed;
        }
      }
      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);
      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    moveForward(distanceDelta: number) {
      const { forward } = this.getCameraVectors();

      const moveCameraByVector = (vector: THREE.Vector3, scale: number) => {
        this.position.x += vector.x * scale;
        this.position.y += vector.y * scale;
        this.position.z += vector.z * scale;
      };

      moveCameraByVector(forward, distanceDelta);
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      const layerRenderer = layer.getRenderer();
      const layerName = layer.getName();
      const threeCamera = layerRenderer.getThreeCamera();

      if (!threeCamera) {
        return;
      }

      layer.setCameraX(this.position.x);
      layer.setCameraY(this.position.y);
      gdjs.scene3d.camera.setCameraZ(
        currentScene,
        this.position.z,
        layerName,
        0
      );
      gdjs.scene3d.camera.setCameraRotationX(
        currentScene,
        90 - this.elevationAngle,
        layerName,
        0
      );
      gdjs.scene3d.camera.setCameraRotationY(currentScene, 0, layerName, 0);
      layer.setCameraRotation(this.rotationAngle);
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
      // We also invert the Y axis because it's inverted in GDevelop coordinates.
      const elements = this._rotationMatrix.elements;

      // Local right axis in world space:
      const right = new THREE.Vector3(elements[0], elements[1], elements[2]);
      // Local up axis in world space:
      const up = new THREE.Vector3(elements[4], -elements[5], elements[6]);
      // Local forward axis in world space (note we take the negative of that column).
      const forward = new THREE.Vector3(
        elements[8],
        elements[9],
        -elements[10]
      );

      // Normalize them, just in case (they should generally be unit vectors).
      right.normalize();
      up.normalize();
      forward.normalize();

      return { right, up, forward };
    }
  }
}
