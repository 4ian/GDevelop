namespace gdjs {
  const logger = new gdjs.Logger('In-Game editor');

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
  const C_KEY = 67;
  const S_KEY = 83;
  const D_KEY = 68;
  const Q_KEY = 81;
  const E_KEY = 69;
  const F_KEY = 70;
  const V_KEY = 86;
  const X_KEY = 88;
  const Y_KEY = 89;
  const Z_KEY = 90;

  let hasWindowFocus = true;
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      hasWindowFocus = true;
    });
    window.addEventListener('blur', () => {
      hasWindowFocus = false;
    });
  }

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
    return gdjs.Base3DHandler.is3D(object);
  };

  type AABB3D = {
    min: [float, float, float];
    max: [float, float, float];
  };

  const defaultEffectsData: EffectData[] = [
    {
      effectType: 'Scene3D::HemisphereLight',
      name: '3D Light',
      doubleParameters: { elevation: 45, intensity: 1, rotation: 0 },
      stringParameters: {
        groundColor: '64;64;64',
        skyColor: '255;255;255',
        top: 'Y-',
      },
      booleanParameters: {},
    },
  ];

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

  const isControlPressedOnly = (inputManager: gdjs.InputManager) => {
    return (
      isControlOrCmdPressed(inputManager) &&
      !isShiftPressed(inputManager) &&
      !isAltPressed(inputManager)
    );
  };

  const isControlPlusShiftPressedOnly = (inputManager: gdjs.InputManager) => {
    return (
      isControlOrCmdPressed(inputManager) &&
      isShiftPressed(inputManager) &&
      !isAltPressed(inputManager)
    );
  };

  const isSpacePressed = (inputManager: gdjs.InputManager) =>
    inputManager.isKeyPressed(SPACE_KEY);

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

  const shouldDragSelectedObject = (inputManager: gdjs.InputManager) =>
    isAltPressed(inputManager) || isControlOrCmdPressed(inputManager);

  const freeCameraKeys = [
    LEFT_KEY,
    RIGHT_KEY,
    UP_KEY,
    DOWN_KEY,
    W_KEY,
    S_KEY,
    A_KEY,
    D_KEY,
    Q_KEY,
    E_KEY,
  ];
  const shouldSwitchToFreeCamera = (inputManager: gdjs.InputManager) =>
    !isControlOrCmdPressed(inputManager) &&
    !isAltPressed(inputManager) &&
    !isShiftPressed(inputManager) &&
    freeCameraKeys.some((key) => inputManager.isKeyPressed(key));

  class Selection {
    private _selectedObjects: Array<gdjs.RuntimeObject> = [];

    add(object: gdjs.RuntimeObject) {
      if (!this._selectedObjects.includes(object)) {
        this._selectedObjects.push(object);
      }
    }

    addAll(objects: RuntimeObject[]) {
      for (const object of objects) {
        this.add(object);
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

    getAABB(): AABB3D | null {
      let aabb: AABB3D | null = null;
      for (const object of this._selectedObjects) {
        if (is3D(object)) {
          const aabb2D = object.getAABB();
          const minZ = object.getUnrotatedAABBMinZ();
          const maxZ = object.getUnrotatedAABBMaxZ();
          if (aabb) {
            aabb.min[0] = Math.min(aabb.min[0], aabb2D.min[0]);
            aabb.min[1] = Math.min(aabb.min[1], aabb2D.min[1]);
            aabb.min[2] = Math.min(aabb.min[2], minZ);
            aabb.max[0] = Math.max(aabb.max[0], aabb2D.max[0]);
            aabb.max[1] = Math.max(aabb.max[1], aabb2D.max[1]);
            aabb.max[2] = Math.max(aabb.max[2], maxZ);
          } else {
            aabb = {
              min: [aabb2D.min[0], aabb2D.min[1], minZ],
              max: [aabb2D.max[0], aabb2D.max[1], maxZ],
            };
          }
        }
      }
      return aabb;
    }
  }

  class ObjectMover {
    editor: InGameEditor;

    constructor(editor: InGameEditor) {
      this.editor = editor;
    }

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
        if (this.editor.isInstanceLocked(object)) {
          return;
        }
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
        object.setX(Math.round(initialPosition.x + movement.translationX));
        object.setY(Math.round(initialPosition.y + movement.translationY));
        object.setAngle(initialPosition.angle + movement.rotationZ);
        object.setWidth(initialPosition.width * movement.scaleX);
        object.setHeight(initialPosition.height * movement.scaleY);
        if (is3D(object)) {
          object.setZ(Math.round(initialPosition.z + movement.translationZ));
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
    private _currentScene: gdjs.RuntimeScene | null = null;
    private _editedInstanceContainer: gdjs.RuntimeInstanceContainer | null =
      null;
    private _editedInstanceDataList: InstanceData[] = [];
    private _selectedLayerName: string = '';
    private _innerArea: AABB3D | null = null;
    private _threeInnerArea: THREE.Object3D | null = null;
    private _tempVector2d: THREE.Vector2 = new THREE.Vector2();
    private _raycaster: THREE.Raycaster = new THREE.Raycaster();

    private _editorCamera;

    /** Keep track of the focus to know if the game was blurred since the last frame. */
    private _windowHadFocus = true;

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
    private _selectionBoxElement: HTMLDivElement;
    private _selectionBoxStartCursorX: float = 0;
    private _selectionBoxStartCursorY: float = 0;

    // The selected objects.
    private _selection = new Selection();
    private _selectionBoxes: Map<
      RuntimeObjectWith3D,
      { container: THREE.Group; box: THREE.BoxHelper }
    > = new Map();
    private _objectMover = new ObjectMover(this);

    private _wasMouseRightButtonPressed = false;
    private _wasMouseLeftButtonPressed = false;
    private _pressedOriginalCursorX: float = 0;
    private _pressedOriginalCursorY: float = 0;

    // Dragged new object:
    private _draggedNewObject: gdjs.RuntimeObject | null = null;
    private _draggedSelectedObject: gdjs.RuntimeObject | null = null;
    private _draggedSelectedObjectInitialX: float = 0;
    private _draggedSelectedObjectInitialY: float = 0;
    private _draggedSelectedObjectInitialZ: float = 0;
    private _draggedSelectedObjectTotalDelta: {
      translationX: float;
      translationY: float;
      translationZ: float;
      rotationX: float;
      rotationY: float;
      rotationZ: float;
      scaleX: float;
      scaleY: float;
      scaleZ: float;
    } = {
      translationX: 0,
      translationY: 0,
      translationZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    };

    constructor(game: RuntimeGame, projectData: ProjectData) {
      this._runtimeGame = game;
      this._editorCamera = new EditorCamera(this);
      this._selectionBoxElement = document.createElement('div');
      this._selectionBoxElement.style.position = 'fixed';
      this._selectionBoxElement.style.backgroundColor = '#f2a63c44';
      this._selectionBoxElement.style.border = '1px solid #f2a63c';
      this.onProjectDataChange(projectData);
    }

    getRuntimeGame() {
      return this._runtimeGame;
    }

    onProjectDataChange(projectData: ProjectData): void {
      for (const layoutData of projectData.layouts) {
        this.onLayersDataChange(
          layoutData.layers,
          !!projectData.areEffectsHiddenInEditor
        );
      }
    }

    onLayersDataChange(
      layersData: Array<LayerData>,
      areEffectsHiddenInEditor: boolean
    ): void {
      for (const layerData of layersData) {
        // Camera controls don't work in orthographic.
        if (layerData.cameraType === 'orthographic') {
          layerData.cameraType = 'perspective';
        }
        // Force 2D and 3D objects to be visible on any layer.
        layerData.renderingType = '2d+3d';
        if (areEffectsHiddenInEditor) {
          layerData.effects = defaultEffectsData;
        }
      }
    }

    getEditorId(): string {
      return this._editorId;
    }

    getEditedInstanceDataList(): InstanceData[] {
      return this._editedInstanceDataList;
    }

    getEditedInstanceContainer(): gdjs.RuntimeInstanceContainer | null {
      return this._editedInstanceContainer;
    }

    getCurrentScene(): gdjs.RuntimeScene | null {
      return this._currentScene;
    }

    /**
     * Return the layer to be used for camera calculus.
     * @see getEditorLayer
     */
    private getCameraLayer(layerName: string): gdjs.RuntimeLayer | null {
      // When the edited container is a custom object,
      // only a base layer exists and `getLayer` falls back on it.
      return this._currentScene ? this._currentScene.getLayer(layerName) : null;
    }

    /**
     * Return the layer which contains the objects.
     * @see getCameraLayer
     */
    private getEditorLayer(layerName: string): gdjs.RuntimeLayer | null {
      return this._editedInstanceContainer
        ? this._editedInstanceContainer.getLayer(layerName)
        : null;
    }

    /**
     * Called by the RuntimeGame when the game resolution is changed.
     * Useful to notify scene and layers that resolution is changed, as they
     * might be caching it.
     */
    onGameResolutionResized() {
      if (!this._currentScene) {
        return;
      }
      this._currentScene.onGameResolutionResized();
    }

    async switchToSceneOrVariant(
      editorId: string | null,
      sceneName: string | null,
      externalLayoutName: string | null,
      eventsBasedObjectType: string | null,
      eventsBasedObjectVariantName: string | null,
      editorCamera3D: EditorCameraState | null
    ) {
      if (this._currentScene) {
        this._currentScene.unloadScene();
        this._currentScene = null;
      }
      // The 3D scene is rebuilt and the inner area marker is lost in the process.
      this._threeInnerArea = null;
      this._innerArea = null;
      this._selectedLayerName = '';
      // Clear any reference to `RuntimeObject` from the unloaded scene.
      this._selectionBoxes.clear();
      this._selectionControls = null;
      this._draggedNewObject = null;
      this._draggedSelectedObject = null;
      const selectedObjectIds = this._selection
        .getSelectedObjects()
        .map((object) => object.persistentUuid)
        .filter(Boolean) as Array<string>;

      let editedInstanceDataList: Array<InstanceData> = [];
      if (eventsBasedObjectType) {
        const eventsBasedObjectVariantData =
          this._runtimeGame.getEventsBasedObjectVariantData(
            eventsBasedObjectType,
            eventsBasedObjectVariantName || ''
          );
        if (eventsBasedObjectVariantData) {
          editedInstanceDataList = eventsBasedObjectVariantData.instances;
          await this._runtimeGame._resourcesLoader.loadResources(
            eventsBasedObjectVariantData.usedResources.map(
              (resource) => resource.name
            ),
            () => {}
          );
          const sceneAndCustomObject = this._createSceneWithCustomObject(
            eventsBasedObjectType,
            eventsBasedObjectVariantName || ''
          );
          if (sceneAndCustomObject) {
            const { scene, customObjectInstanceContainer } =
              sceneAndCustomObject;
            this._currentScene = scene;
            this._editedInstanceContainer = customObjectInstanceContainer;
          }
          this._innerArea = eventsBasedObjectVariantData._initialInnerArea;
        } else {
          console.warn(
            `Couldn't find any variant named "${eventsBasedObjectVariantName || ''}" for ${eventsBasedObjectType}`
          );
        }
      } else if (sceneName) {
        await this._runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
          sceneName,
          () => {}
        );
        // Load the new one
        const newScene = new gdjs.RuntimeScene(this._runtimeGame);
        newScene.loadFromScene(
          this._runtimeGame.getSceneAndExtensionsData(sceneName),
          {
            skipCreatingInstances: !!externalLayoutName,
          }
        );

        // Optionally create the objects from an external layout.
        if (externalLayoutName) {
          const externalLayoutData =
            this._runtimeGame.getExternalLayoutData(externalLayoutName);
          if (externalLayoutData) {
            newScene.createObjectsFrom(
              externalLayoutData.instances,
              0,
              0,
              0,
              /*trackByPersistentUuid=*/
              true
            );
          }
        }
        this._currentScene = newScene;
        this._editedInstanceContainer = newScene;
        if (externalLayoutName) {
          const externalLayoutData =
            this._runtimeGame.getExternalLayoutData(externalLayoutName);
          if (externalLayoutData) {
            editedInstanceDataList = externalLayoutData.instances;
          }
        } else {
          const sceneAndExtensionsData =
            this._runtimeGame.getSceneAndExtensionsData(sceneName);
          if (sceneAndExtensionsData) {
            editedInstanceDataList = sceneAndExtensionsData.sceneData.instances;
          }
        }
      } else {
        console.warn('eventsBasedObjectType or sceneName must be set.');
      }
      this._editedInstanceDataList = editedInstanceDataList;
      this._editorId = editorId || '';
      if (editorCamera3D) {
        this.restoreCameraState(editorCamera3D);
      } else {
        // TODO Get the visibleScreenArea from the editor.
        this.zoomToInitialPosition({
          minX: 0.15,
          minY: 0.15,
          maxX: 0.85,
          maxY: 0.85,
        });
      }

      // Update initialRuntimeGameStatus so that a hard reload
      // will come back to the same state, and so that we can check later
      // if the game is already on the state that is being requested.
      this._runtimeGame.getAdditionalOptions().initialRuntimeGameStatus = {
        isPaused: this._runtimeGame.isPaused(),
        isInGameEdition: this._runtimeGame.isInGameEdition(),
        sceneName: sceneName,
        injectedExternalLayoutName: externalLayoutName,
        skipCreatingInstancesFromScene: !!externalLayoutName,
        eventsBasedObjectType,
        eventsBasedObjectVariantName,
        editorId,
      };

      // Try to keep object selection in case the same scene is reloaded.
      this.setSelectedObjects(selectedObjectIds);
    }

    private _createSceneWithCustomObject(
      eventsBasedObjectType: string,
      eventsBasedObjectVariantName: string
    ): {
      scene: gdjs.RuntimeScene;
      customObjectInstanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
    } | null {
      const eventsBasedObjectData = this._runtimeGame.getEventsBasedObjectData(
        eventsBasedObjectType
      );
      if (!eventsBasedObjectData) {
        logger.error(
          `A CustomRuntimeObject was open in editor referring to an non existing events based object data with type "${eventsBasedObjectType}".`
        );
        return null;
      }

      const scene = new gdjs.RuntimeScene(this._runtimeGame);
      scene.loadFromScene({
        sceneData: {
          variables: [],
          instances: [
            {
              angle: 0,
              customSize: false,
              height: 0,
              layer: '',
              name: 'Object',
              persistentUuid: '12345678-1234-1234-1234-123456789abc',
              width: 0,
              x: 0,
              y: 0,
              zOrder: 1,
              numberProperties: [],
              stringProperties: [],
              initialVariables: [],
              locked: false,
            },
          ],
          objects: [
            {
              name: 'Object',
              type: eventsBasedObjectType,
              //@ts-ignore
              variant: eventsBasedObjectVariantName,
              content: {},
              variables: [],
              // Add all capabilities just in case events need them.
              behaviors: [
                {
                  name: 'Animation',
                  type: 'AnimatableCapability::AnimatableBehavior',
                },
                { name: 'Effect', type: 'EffectCapability::EffectBehavior' },
                {
                  name: 'Flippable',
                  type: 'FlippableCapability::FlippableBehavior',
                },
                {
                  name: 'Object3D',
                  type: 'Scene3D::Base3DBehavior',
                },
                {
                  name: 'Opacity',
                  type: 'OpacityCapability::OpacityBehavior',
                },
                {
                  name: 'Resizable',
                  type: 'ResizableCapability::ResizableBehavior',
                },
                {
                  name: 'Scale',
                  type: 'ScalableCapability::ScalableBehavior',
                },
                {
                  name: 'Text',
                  type: 'TextContainerCapability::TextContainerBehavior',
                },
              ],
              effects: [],
            },
          ],
          layers: [
            {
              ambientLightColorB: 200,
              ambientLightColorG: 200,
              ambientLightColorR: 200,
              camera3DFarPlaneDistance: 10000,
              camera3DFieldOfView: 45,
              camera3DNearPlaneDistance: 3,
              followBaseLayerCamera: false,
              isLightingLayer: false,
              name: '',
              renderingType: '2d+3d',
              visibility: true,
              cameras: [
                {
                  defaultSize: true,
                  defaultViewport: true,
                  height: 0,
                  viewportBottom: 1,
                  viewportLeft: 0,
                  viewportRight: 1,
                  viewportTop: 0,
                  width: 0,
                },
              ],
              effects: [
                {
                  effectType: 'Scene3D::HemisphereLight',
                  name: '3D Light',
                  doubleParameters: {
                    elevation: 45,
                    intensity: 1,
                    rotation: 0,
                  },
                  stringParameters: {
                    groundColor: '64;64;64',
                    skyColor: '255;255;255',
                    top: 'Y-',
                  },
                  booleanParameters: {},
                },
              ],
            },
          ],
          r: 32,
          v: 32,
          b: 32,
          mangledName: 'FakeSceneForCustomObject',
          name: eventsBasedObjectData.name,
          stopSoundsOnStartup: true,
          title: '',
          behaviorsSharedData: [
            {
              name: 'Text',
              type: 'TextContainerCapability::TextContainerBehavior',
            },
          ],
          usedResources: [],
        },
        usedExtensionsWithVariablesData:
          this._runtimeGame.getGameData().eventsFunctionsExtensions,
      });
      const objects = scene.getObjects('Object');
      const object = objects ? objects[0] : null;
      if (!object) {
        return null;
      }
      const customObject = object as gdjs.CustomRuntimeObject;
      if (!customObject._instanceContainer) {
        return null;
      }
      return {
        scene,
        customObjectInstanceContainer: customObject._instanceContainer,
      };
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

    private _getTempVector2d(x: float, y: float): THREE.Vector2 {
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
      if (this._innerArea) {
        this.zoomToFitArea(
          {
            minX: this._innerArea.min[0],
            minY: this._innerArea.min[1],
            minZ: this._innerArea.min[2],
            maxX: this._innerArea.max[0],
            maxY: this._innerArea.max[1],
            maxZ: this._innerArea.max[2],
          },
          visibleScreenArea,
          0.1
        );
      } else {
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
    }

    zoomToFitContent(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      const editedInstanceContainer = this.getEditedInstanceContainer();
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
      this._getEditorCamera().zoomToFitObjects(
        objects,
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
      if (!this._currentScene) return;
      this._getEditorCamera().zoomToFitArea(
        sceneArea,
        visibleScreenArea,
        margin
      );
    }

    zoomBy(zoomFactor: float) {
      if (!this._currentScene) return;
      this._getEditorCamera().zoomBy(zoomFactor);
    }

    setZoom(zoom: float) {
      if (!this._currentScene) return;
      this._getEditorCamera().setZoom(zoom);
    }

    getSelectionAABB(): AABB3D | null {
      return this._selection.getAABB();
    }

    setSelectedObjects(persistentUuids: Array<string>) {
      const editedInstanceContainer = this.getEditedInstanceContainer();
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
      // Send back default instances sizes.
      this._sendSelectionUpdate({ isSendingBackSelectionForDefaultSize: true });
    }

    centerViewOnLastSelectedInstance(visibleScreenArea: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) {
      if (!this._currentScene) return;

      const object = this._selection.getLastSelectedObject();
      if (!object) {
        return;
      }

      this._getEditorCamera().switchToOrbitAroundObject(object);
      // We keep the same camera distance.
      this._getEditorCamera().resetRotationToTopDown();
    }

    private _handleCameraMovement() {
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._currentScene;
      if (!currentScene) return;

      const selectedObject = this._selection.getLastSelectedObject();
      if (inputManager.isKeyPressed(F_KEY) && selectedObject) {
        // TODO Use the center of the AABB of the whole selection instead
        this._getEditorCamera().switchToOrbitAroundObject(selectedObject);
      }

      if (
        !this._getEditorCamera().isFreeCamera() &&
        shouldSwitchToFreeCamera(inputManager)
      ) {
        this._getEditorCamera().switchToFreeCamera();
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
      if (!this._currentScene) return;

      const cursor = this._getCursorIn3D(this._selection.getSelectedObjects());
      if (!cursor) {
        return;
      }
      const [cursorX, cursorY, cursorZ] = cursor;

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
      this._sendSelectionUpdate({ hasSelectedObjectBeenModified: true });
    }

    private _handleSelectedObjectDragging(): void {
      const inputManager = this._runtimeGame.getInputManager();
      if (!shouldDragSelectedObject(inputManager)) {
        return;
      }
      if (!this._currentScene) return;
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      if (
        inputManager.isMouseButtonPressed(0) &&
        !this._draggedSelectedObject
      ) {
        let object = this.getObjectUnderCursor();
        if (object && this._selection.getSelectedObjects().includes(object)) {
          if (isControlOrCmdPressed(inputManager)) {
            object = this._duplicateSelectedObjects(object);
            if (!object) {
              return;
            }
          }
          this._draggedSelectedObject = object;
          this._draggedSelectedObjectInitialX = object.getX();
          this._draggedSelectedObjectInitialY = object.getY();
          this._draggedSelectedObjectInitialZ = is3D(object)
            ? object.getZ()
            : 0;
          this._objectMover.startMove();
        }
      }

      if (!this._draggedSelectedObject) {
        return;
      }

      let isIntersectionFound = false;
      let intersectionX: float = 0;
      let intersectionY: float = 0;
      let intersectionZ: float = 0;
      if (is3D(this._draggedSelectedObject)) {
        const cursor = this._getCursorIn3D(
          this._selection.getSelectedObjects()
        );
        if (cursor) {
          const [cursorX, cursorY, cursorZ] = cursor;
          isIntersectionFound = true;
          intersectionX = cursorX;
          intersectionY = cursorY;
          intersectionZ = cursorZ;
        }
      } else {
        const projectedCursor = this._getProjectedCursor();
        if (projectedCursor) {
          isIntersectionFound = true;
          intersectionX = projectedCursor[0];
          intersectionY = projectedCursor[1];
        }
      }
      if (isIntersectionFound) {
        this._draggedSelectedObjectTotalDelta.translationX =
          intersectionX - this._draggedSelectedObjectInitialX;
        this._draggedSelectedObjectTotalDelta.translationY =
          intersectionY - this._draggedSelectedObjectInitialY;
        this._draggedSelectedObjectTotalDelta.translationZ =
          intersectionZ - this._draggedSelectedObjectInitialZ;
      } else {
        this._draggedSelectedObjectTotalDelta.translationX = 0;
        this._draggedSelectedObjectTotalDelta.translationY = 0;
        this._draggedSelectedObjectTotalDelta.translationZ = 0;
      }
      this._objectMover.move(
        this._selection.getSelectedObjects(),
        this._draggedSelectedObjectTotalDelta
      );

      if (inputManager.isMouseButtonReleased(0)) {
        this._draggedSelectedObject = null;
        this._objectMover.endMove();
        this._sendSelectionUpdate({ hasSelectedObjectBeenModified: true });
      }
    }

    private _duplicateSelectedObjects(
      objectUnderCursor: gdjs.RuntimeObject
    ): gdjs.RuntimeObject | null {
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return null;
      let newObjectUnderCursor: gdjs.RuntimeObject | null = null;
      const addedObjects: Array<gdjs.RuntimeObject> = [];
      for (const selectedObject of this._selection.getSelectedObjects()) {
        const newObject = editedInstanceContainer.createObject(
          selectedObject.getName()
        );
        if (!newObject) return null;
        newObject.persistentUuid = gdjs.makeUuid();
        newObject.setLayer(selectedObject.getLayer());
        newObject.setX(selectedObject.getX());
        newObject.setY(selectedObject.getY());
        newObject.setAngle(selectedObject.getAngle());
        newObject.setWidth(selectedObject.getWidth());
        newObject.setHeight(selectedObject.getHeight());
        if (is3D(newObject) && is3D(selectedObject)) {
          newObject.setZ(selectedObject.getZ());
          newObject.setRotationX(selectedObject.getRotationX());
          newObject.setRotationY(selectedObject.getRotationY());
          newObject.setDepth(selectedObject.getDepth());
        }
        addedObjects.push(newObject);
        if (selectedObject === objectUnderCursor) {
          newObjectUnderCursor = newObject;
        }
      }
      this._selection.clear();
      this._selection.addAll(addedObjects);
      this._sendSelectionUpdate({
        addedObjects,
      });
      return newObjectUnderCursor;
    }

    private _handleSelectionMovement() {
      // Finished moving the selection.
      if (
        this._wasMovingSelectionLastFrame &&
        !this._selectionControlsMovementTotalDelta
      ) {
        this._objectMover.endMove();
        this._sendSelectionUpdate({ hasSelectedObjectBeenModified: true });
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
      const currentScene = this._currentScene;
      if (!currentScene) return;
      const editedInstanceContainer = this._editedInstanceContainer;
      if (!editedInstanceContainer) return;
      const cameraLayer = this.getCameraLayer('');
      if (!cameraLayer) return;

      const runtimeLayerRender = cameraLayer.getRenderer();
      const threeCamera = runtimeLayerRender.getThreeCamera();
      const threeScene = runtimeLayerRender.getThreeScene();
      if (!threeCamera || !threeScene) return;

      const cursorX = inputManager.getCursorX();
      const cursorY = inputManager.getCursorY();

      if (
        inputManager.isMouseButtonPressed(0) &&
        !shouldDragSelectedObject(inputManager) &&
        !isSpacePressed(inputManager)
      ) {
        if (this._wasMouseLeftButtonPressed && this._selectionBox) {
          this._selectionBox.endPoint.set(
            this._getNormalizedScreenX(cursorX),
            this._getNormalizedScreenY(cursorY),
            0.5
          );
          const minX = Math.min(this._selectionBoxStartCursorX, cursorX);
          const minY = Math.min(this._selectionBoxStartCursorY, cursorY);
          const maxX = Math.max(this._selectionBoxStartCursorX, cursorX);
          const maxY = Math.max(this._selectionBoxStartCursorY, cursorY);
          this._selectionBoxElement.style.left = minX + 'px';
          this._selectionBoxElement.style.top = minY + 'px';
          this._selectionBoxElement.style.width = maxX - minX + 'px';
          this._selectionBoxElement.style.height = maxY - minY + 'px';
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
          const domElementContainer = runtimeGame
            .getRenderer()
            .getDomElementContainer();
          if (domElementContainer) {
            this._selectionBoxElement.style.left = cursorX + 'px';
            this._selectionBoxElement.style.top = cursorY + 'px';
            this._selectionBoxElement.style.width = '0px';
            this._selectionBoxElement.style.height = '0px';
            domElementContainer.appendChild(this._selectionBoxElement);
          }
          this._selectionBoxStartCursorX = cursorX;
          this._selectionBoxStartCursorY = cursorY;
        }
      }
      if (
        (inputManager.isMouseButtonReleased(0) ||
          this._hasSelectionActuallyMoved) &&
        this._selectionBox
      ) {
        if (
          !this._selectionBox.endPoint.equals(this._selectionBox.startPoint) &&
          !this._hasSelectionActuallyMoved
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
          const layer = this.getEditorLayer(this._selectedLayerName);
          if (layer && layer.isVisible() && !layer._initialLayerData.isLocked) {
            for (const object of objects) {
              if (!this.isInstanceSealed(object)) {
                this._selection.add(object);
              }
            }
          }
          this._sendSelectionUpdate();
        }
        this._selectionBox = null;
        const domElementContainer = runtimeGame
          .getRenderer()
          .getDomElementContainer();
        if (domElementContainer) {
          domElementContainer.removeChild(this._selectionBoxElement);
        }
      }
    }

    private _handleSelection({
      objectUnderCursor,
    }: {
      objectUnderCursor: gdjs.RuntimeObject | null;
    }) {
      const editedInstanceContainer = this.getEditedInstanceContainer();
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
          !shouldDragSelectedObject(inputManager) &&
          this._selection.getLastSelectedObject() === objectUnderCursor
        ) {
          this._swapTransformControlsMode();
        } else {
          if (!isShiftPressed(inputManager)) {
            this._selection.clear();
          }
          if (objectUnderCursor) {
            const layer = this.getEditorLayer(objectUnderCursor.getLayer());
            if (
              layer &&
              !layer._initialLayerData.isLocked &&
              !this.isInstanceSealed(objectUnderCursor)
            ) {
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
      if (!this._currentScene) return;

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
        !this._selectionBoxes.has(objectUnderCursor) &&
        !this.isInstanceSealed(objectUnderCursor)
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
      const currentScene = this._currentScene;
      if (!currentScene) return;

      const threeObject = object.get3DRendererObject();
      if (!threeObject) return;

      const objectLayer = this.getEditorLayer(object.getLayer());
      if (!objectLayer) return;

      const threeGroup = objectLayer.getRenderer().getThreeGroup();
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
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._currentScene;
      if (!currentScene) return;

      const lastSelectedObject = this._selection.getLastSelectedObject();

      if (
        this._selectionControls &&
        (!lastSelectedObject ||
          (lastSelectedObject &&
            this._selectionControls.object !== lastSelectedObject) ||
          shouldDragSelectedObject(inputManager))
      ) {
        this._selectionControls.threeTransformControls.detach();
        this._selectionControls.threeTransformControls.removeFromParent();
        this._selectionControls.dummyThreeObject.removeFromParent();
        this._selectionControls = null;
      }

      if (
        lastSelectedObject &&
        !this._selectionControls &&
        !shouldDragSelectedObject(inputManager)
      ) {
        const threeObject = lastSelectedObject.get3DRendererObject();
        if (!threeObject) return;

        const cameraLayer = this.getCameraLayer(lastSelectedObject.getLayer());
        if (!cameraLayer) return;

        const runtimeLayerRender = cameraLayer.getRenderer();
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
      hasSelectedObjectBeenModified?: boolean;
      isSendingBackSelectionForDefaultSize?: boolean;
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

      const getSelectedInstances = (
        objects: Array<gdjs.RuntimeObject>
      ): Array<InstancePersistentUuidData> =>
        objects
          .map((object) => {
            if (!object.persistentUuid) {
              return null;
            }
            return {
              persistentUuid: object.persistentUuid,
              defaultWidth: object.getOriginalWidth(),
              defaultHeight: object.getOriginalHeight(),
              defaultDepth: is3D(object)
                ? object.getOriginalDepth()
                : undefined,
            };
          })
          .filter(isDefined);

      const updatedInstances =
        options && options.hasSelectedObjectBeenModified
          ? this._selection
              .getSelectedObjects()
              .map((object) => this.getInstanceDataFromRuntimeObject(object))
              .filter(isDefined)
          : [];

      const addedInstances =
        options && options.addedObjects
          ? options.addedObjects
              .map((object) => this.getInstanceDataFromRuntimeObject(object))
              .filter(isDefined)
          : [];

      const removedInstances =
        options && options.removedObjects ? options.removedObjects : [];

      this._removeInstances(removedInstances);
      this._updateInstances(updatedInstances);
      this._addInstances(addedInstances);

      debuggerClient.sendInstanceChanges({
        isSendingBackSelectionForDefaultSize: options
          ? options.isSendingBackSelectionForDefaultSize || false
          : false,
        updatedInstances,
        addedInstances,
        selectedInstances: getSelectedInstances(
          this._selection.getSelectedObjects()
        ),
        removedInstances: getPersistentUuidsFromObjects(removedInstances),
      });
    }

    private getInstanceDataFromRuntimeObject(
      runtimeObject: gdjs.RuntimeObject
    ): InstanceData | null {
      if (is3D(runtimeObject)) {
        if (!runtimeObject.persistentUuid) return null;

        const width = runtimeObject.getWidth();
        const height = runtimeObject.getHeight();
        const depth = runtimeObject.getDepth();
        const defaultWidth = runtimeObject.getOriginalWidth();
        const defaultHeight = runtimeObject.getOriginalHeight();
        const defaultDepth = runtimeObject.getOriginalDepth();

        const oldData = this._getInstanceData(runtimeObject.persistentUuid);
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
          customSize: width !== defaultWidth || height !== defaultHeight,
          width,
          height,
          depth: depth === defaultDepth ? undefined : depth,
          locked: oldData ? oldData.locked : false,
          sealed: oldData ? oldData.sealed : false,
          // TODO: how to transmit/should we transmit other properties?
          numberProperties: [],
          stringProperties: [],
          initialVariables: [],
          // @ts-ignore
          defaultWidth,
          defaultHeight,
          defaultDepth,
        };

        return instanceData;
      } else {
        // TODO: handle 2D objects/instances.
        return null;
      }
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
        const oldInstance = this._getInstanceData(
          updatedInstance.persistentUuid
        );
        if (oldInstance) {
          gdjs.HotReloader.assignOrDelete(oldInstance, updatedInstance, [
            // These are never modified by the InGameEditor, so don't update them:
            'initialVariables',
            'numberProperties',
            'stringProperties',
          ]);
        }
      }
    }

    private _getInstanceData(
      persistentUuid: string | null
    ): InstanceData | null {
      // TODO: Might be worth indexing instances data
      return persistentUuid
        ? this._editedInstanceDataList.find(
            (instanceData) => instanceData.persistentUuid === persistentUuid
          ) || null
        : null;
    }

    isInstanceLocked(object: gdjs.RuntimeObject): boolean {
      const instanceData = this._getInstanceData(object.persistentUuid);
      return !!instanceData && !!instanceData.locked;
    }

    isInstanceSealed(object: gdjs.RuntimeObject): boolean {
      const instanceData = this._getInstanceData(object.persistentUuid);
      return !!instanceData && !!instanceData.sealed;
    }

    private _addInstances(addedInstances: Array<InstanceData>) {
      for (const addedInstance of addedInstances) {
        this._editedInstanceDataList.push(addedInstance);
      }
    }

    private _updateInnerAreaOutline(): void {
      if (!this._currentScene) return;

      const layer = this.getCameraLayer('');
      if (!layer) {
        return;
      }
      const threeGroup = layer.getRenderer().getThreeGroup();
      if (!threeGroup) {
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
      if (this._innerArea) {
        const innerArea = this._innerArea;
        threeInnerArea.scale.x = innerArea.max[0] - innerArea.min[0];
        threeInnerArea.scale.y = innerArea.max[1] - innerArea.min[1];
        threeInnerArea.scale.z = innerArea.max[2] - innerArea.min[2];
        threeInnerArea.position.x = innerArea.min[0];
        threeInnerArea.position.y = innerArea.min[1];
        threeInnerArea.position.z = innerArea.min[2];
      } else {
        threeInnerArea.scale.x = this._runtimeGame.getOriginalWidth();
        threeInnerArea.scale.y = this._runtimeGame.getOriginalHeight();
        threeInnerArea.scale.z = 0.01;
        threeInnerArea.position.x = 0;
        threeInnerArea.position.y = 0;
        threeInnerArea.position.z = 0;
      }
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

    private _handleShortcuts() {
      const inputManager = this._runtimeGame.getInputManager();
      if (isControlPressedOnly(inputManager)) {
        if (inputManager.wasKeyReleased(Z_KEY)) {
          this._sendUndo();
        } else if (inputManager.wasKeyReleased(Y_KEY)) {
          this._sendRedo();
        } else if (inputManager.wasKeyReleased(C_KEY)) {
          this._sendCopy();
        } else if (inputManager.wasKeyReleased(V_KEY)) {
          this._sendPaste();
        } else if (inputManager.wasKeyReleased(X_KEY)) {
          this._sendCut();
        }
      }
      if (isControlPlusShiftPressedOnly(inputManager)) {
        if (inputManager.wasKeyReleased(Z_KEY)) {
          this._sendRedo();
        }
      }
    }

    private _sendUndo() {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;
      debuggerClient.sendUndo();
    }

    private _sendRedo() {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;
      debuggerClient.sendRedo();
    }

    private _sendCopy() {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;
      debuggerClient.sendCopy();
    }

    private _sendPaste() {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;
      debuggerClient.sendPaste();
    }

    private _sendCut() {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;
      debuggerClient.sendCut();
    }

    cancelDragNewInstance() {
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      if (this._draggedNewObject) {
        this._draggedNewObject.deleteFromScene();
        this._draggedNewObject = null;
      }
    }

    dragNewInstance({ name, dropped }: { name: string; dropped: boolean }) {
      const currentScene = this._currentScene;
      if (!currentScene) return;
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      const selectedLayer = this.getEditorLayer(this._selectedLayerName);
      if (!selectedLayer) return;

      if (dropped) {
        if (this._draggedNewObject) {
          const isLayer3D = selectedLayer.getRenderer().getThreeGroup();
          if (isLayer3D) {
            const cameraX = selectedLayer.getCameraX();
            const cameraY = selectedLayer.getCameraY();
            const cameraZ = getCameraZ(
              currentScene,
              selectedLayer.getName(),
              0
            );

            const closestIntersect = this._getClosestIntersectionUnderCursor([
              this._draggedNewObject,
            ]);
            if (closestIntersect && !is3D(this._draggedNewObject)) {
              // Avoid to create a 2D object hidden under a 3D one.
              this.cancelDragNewInstance();
              return;
            }

            let cursorX: float;
            let cursorY: float;
            let cursorZ: float;
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
          // TODO Move the object according to the last cursor position
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
        if (!is3D(newObject)) {
          editedInstanceContainer.markObjectForDeletion(newObject);
          return;
        }
        newObject.persistentUuid = gdjs.makeUuid();
        newObject.setLayer(selectedLayer.getName());
        this._draggedNewObject = newObject;
      }

      if (is3D(this._draggedNewObject)) {
        const cursor = this._getCursorIn3D([this._draggedNewObject]);
        if (cursor) {
          const [cursorX, cursorY, cursorZ] = cursor;
          this._draggedNewObject.setX(cursorX);
          this._draggedNewObject.setY(cursorY);
          this._draggedNewObject.setZ(cursorZ);
        }
      } else {
        const projectedCursor = this._getProjectedCursor();
        if (projectedCursor) {
          this._draggedNewObject.setX(projectedCursor[0]);
          this._draggedNewObject.setY(projectedCursor[1]);
        }
      }
    }

    /**
     * @returns The cursor projected on the plane Z = 0 or `null` if the cursor is in the sky.
     */
    _getProjectedCursor(): FloatPoint | null {
      const currentScene = this._currentScene;
      if (!currentScene) return null;

      const layer = this.getCameraLayer('');
      if (!layer) {
        return null;
      }

      const cameraX = layer.getCameraX();
      const cameraY = layer.getCameraY();
      const cameraZ = getCameraZ(currentScene, layer.getName(), 0);

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
      const editedInstanceContainer = this.getEditedInstanceContainer();
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
            if (instance.customSize) {
              runtimeObject.setWidth(instance.width);
              runtimeObject.setHeight(instance.height);
            } else {
              runtimeObject.setWidth(runtimeObject.getOriginalWidth());
              runtimeObject.setHeight(runtimeObject.getOriginalHeight());
            }
            runtimeObject.setAngle(instance.angle);
            runtimeObject.setLayer(instance.layer);
            if (is3D(runtimeObject)) {
              runtimeObject.setZ(instance.z === undefined ? 0 : instance.z);
              runtimeObject.setRotationX(
                instance.rotationX == undefined ? 0 : instance.rotationX
              );
              runtimeObject.setRotationY(
                instance.rotationY == undefined ? 0 : instance.rotationY
              );
              runtimeObject.setDepth(
                instance.depth == undefined
                  ? runtimeObject.getOriginalDepth()
                  : instance.depth
              );
            }
            runtimeObject.extraInitializationFromInitialInstance(instance);
          }
        });
      this._updateInstances(instances);
      this._forceUpdateSelectionControls();
    }

    addInstances(instances: Array<InstanceData>) {
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      editedInstanceContainer.createObjectsFrom(instances, 0, 0, 0, true);
      this._addInstances(instances);
    }

    deleteSelection() {
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      this._removeInstances(this._selection.getSelectedObjects());
      for (const object of this._selection.getSelectedObjects()) {
        object.deleteFromScene();
      }
      this._selection.clear();
    }

    private _getClosestIntersectionUnderCursor(
      excludedObjects?: Array<gdjs.RuntimeObject>
    ): THREE.Intersection | null {
      const runtimeGame = this._runtimeGame;
      const firstIntersectsByLayer: {
        [layerName: string]: null | {
          intersect: THREE.Intersection;
        };
      } = {};
      const cursorX = runtimeGame.getInputManager().getCursorX();
      const cursorY = runtimeGame.getInputManager().getCursorY();

      const layerNames = [];
      const currentScene = this._currentScene;
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
      if (excludedObjects) {
        for (const excludedObject of excludedObjects) {
          if (is3D(excludedObject)) {
            const draggedRendererObject = excludedObject.get3DRendererObject();
            if (draggedRendererObject) {
              draggedRendererObject.layers.set(1);
              draggedRendererObject.traverse((object) => object.layers.set(1));
            }
          }
        }
      }

      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        const runtimeLayerRender = currentScene
          .getLayer(layerName)
          .getRenderer();
        const threeCamera = runtimeLayerRender.getThreeCamera();
        const threeGroup = runtimeLayerRender.getThreeGroup();
        if (!threeCamera || !threeGroup) return;

        // Note that raycasting is done by Three.js, which means it could slow down
        // if lots of 3D objects are shown. We consider that if this needs improvements,
        // this must be handled by the game engine culling
        const normalizedDeviceCoordinates = this._getTempVector2d(
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
      if (excludedObjects) {
        for (const excludedObject of excludedObjects) {
          if (is3D(excludedObject)) {
            const draggedRendererObject = excludedObject.get3DRendererObject();
            if (draggedRendererObject) {
              draggedRendererObject.layers.set(0);
              draggedRendererObject.traverse((object) => object.layers.set(0));
            }
          }
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

    private _getCursorIn3D(
      excludedObjects?: Array<gdjs.RuntimeObject>
    ): [float, float, float] | null {
      const closestIntersect =
        this._getClosestIntersectionUnderCursor(excludedObjects);
      if (closestIntersect) {
        return [
          closestIntersect.point.x,
          -closestIntersect.point.y,
          closestIntersect.point.z,
        ];
      }
      const projectedCursor = this._getProjectedCursor();
      if (!projectedCursor) {
        return null;
      }
      return [projectedCursor[0], projectedCursor[1], 0];
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
      const editedInstanceContainer = this.getEditedInstanceContainer();
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

    getCameraState(): EditorCameraState {
      return this._getEditorCamera().getCameraState();
    }

    restoreCameraState(editorCamera3D: EditorCameraState) {
      this._getEditorCamera().restoreCameraState(editorCamera3D);
    }

    updateAndRender() {
      const objectUnderCursor: gdjs.RuntimeObject | null =
        this.getObjectUnderCursor();

      const inputManager = this._runtimeGame.getInputManager();

      // Ensure we don't keep keys considered as pressed if the editor is blurred.
      if (!hasWindowFocus && this._windowHadFocus) {
        inputManager.releaseAllPressedKeys();
      }
      this._windowHadFocus = hasWindowFocus;

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
      this._handleSelectedObjectDragging();
      this._handleSelectionMovement();
      this._updateSelectionBox();
      this._handleSelection({ objectUnderCursor });
      this._updateSelectionOutline({ objectUnderCursor });
      this._updateSelectionControls();
      this._updateInnerAreaOutline();
      this._handleContextMenu();
      this._handleShortcuts();
      this._wasMovingSelectionLastFrame =
        !!this._selectionControlsMovementTotalDelta;
      if (!this._selectionControlsMovementTotalDelta) {
        this._hasSelectionActuallyMoved = false;
      }
      this._wasMouseLeftButtonPressed = inputManager.isMouseButtonPressed(0);
      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);

      if (this._currentScene) {
        this._currentScene._updateObjectsForInGameEditor();
        this._currentScene.render();
      }
    }

    private _getEditorCamera(): EditorCamera {
      return this._editorCamera;
    }
  }

  export type EditorCameraState = {
    cameraMode: 'free' | 'orbit';
    positionX: float;
    positionY: float;
    positionZ: float;
    rotationAngle: float;
    elevationAngle: float;
    distance: float;
  };

  class EditorCamera implements CameraControl {
    editor: gdjs.InGameEditor;
    orbitCameraControl: OrbitCameraControl;
    freeCameraControl: FreeCameraControl;
    private _hasChanged = false;
    private _hadChanged = false;

    constructor(editor: gdjs.InGameEditor) {
      this.editor = editor;
      this.orbitCameraControl = new OrbitCameraControl(this);
      this.freeCameraControl = new FreeCameraControl(this);
      this.freeCameraControl.setEnabled(false);
    }

    isFreeCamera(): boolean {
      return this.freeCameraControl.isEnabled();
    }

    private getActiveCamera() {
      return this.isFreeCamera()
        ? this.freeCameraControl
        : this.orbitCameraControl;
    }

    switchToOrbitAroundObject(object: gdjs.RuntimeObject): void {
      this.switchToOrbitAroundPosition(
        object.getCenterXInScene(),
        object.getCenterYInScene(),
        is3D(object) ? object.getUnrotatedAABBMinZ() : 0
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

    step(): void {
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
      // TODO Should the editor force this fov?
      const fov = 45;
      // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
      // The Z position is computed by taking the half height of the displayed rendering,
      // and using the angle of the triangle defined by the field of view to compute the length
      // of the triangle defining the distance between the camera and the rendering plane.
      return (
        (0.5 * runtimeGame.getGameResolutionHeight()) /
        zoom /
        Math.tan(0.5 * gdjs.toRad(fov))
      );
    };

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
      const inputManager = runtimeGame._inputManager;
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
          this._editorCamera.onHasCameraChanged();
        }

        // Mouse wheel: movement on the plane or forward/backward movement.
        const wheelDeltaY = inputManager.getMouseWheelDelta();
        if (wheelDeltaY !== 0 && shouldZoom(inputManager)) {
          this.distance = Math.max(10, this.distance - wheelDeltaY);
          this._editorCamera.onHasCameraChanged();
        }
      }

      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);
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
      const layerName = layer.getName();
      layer.setCameraX(this.getCameraX());
      layer.setCameraY(this.getCameraY());
      setCameraZ(currentScene, this.getCameraZ(), layerName, 0);
      setCameraRotationX(currentScene, 90 - this.elevationAngle, layerName, 0);
      setCameraRotationY(currentScene, 0, layerName, 0);
      layer.setCameraRotation(this.rotationAngle);
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
      const inputManager = runtimeGame._inputManager;
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

        // Movement with the keyboard:
        // Either arrow keys (move in the camera plane) or WASD ("FPS move" + Q/E for up/down).
        const moveSpeed = isShiftPressed(inputManager) ? 12 : 6;

        if (
          !isControlOrCmdPressed(inputManager) &&
          !isAltPressed(inputManager) &&
          !isShiftPressed(inputManager)
        ) {
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
        }

        // Space + click: move the camera on its plane.
        if (
          isSpacePressed(inputManager) &&
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
          this._editorCamera.onHasCameraChanged();
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
        this._editorCamera.onHasCameraChanged();
      };

      moveCameraByVector(forward, distanceDelta);
    }

    updateCamera(currentScene: RuntimeScene, layer: RuntimeLayer): void {
      const layerName = layer.getName();
      layer.setCameraX(this.position.x);
      layer.setCameraY(this.position.y);
      setCameraZ(currentScene, this.position.z, layerName, 0);
      setCameraRotationX(currentScene, 90 - this.elevationAngle, layerName, 0);
      setCameraRotationY(currentScene, 0, layerName, 0);
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

  const getCameraZ = (
    runtimeScene: RuntimeScene,
    layerName: string,
    cameraIndex: integer
  ): float => {
    return gdjs.scene3d.camera
      ? gdjs.scene3d.camera.getCameraZ(runtimeScene, layerName, cameraIndex)
      : 0;
  };

  const setCameraZ = (
    runtimeScene: RuntimeScene,
    z: float,
    layerName: string,
    cameraIndex: integer
  ) => {
    if (gdjs.scene3d.camera) {
      gdjs.scene3d.camera.setCameraZ(runtimeScene, z, layerName, cameraIndex);
    }
  };

  const getCameraRotationX = (
    runtimeScene: RuntimeScene,
    layerName: string,
    cameraIndex: integer
  ): float => {
    return gdjs.scene3d.camera
      ? gdjs.scene3d.camera.getCameraRotationX(
          runtimeScene,
          layerName,
          cameraIndex
        )
      : 0;
  };

  const setCameraRotationX = (
    runtimeScene: RuntimeScene,
    angle: float,
    layerName: string,
    cameraIndex: integer
  ) => {
    if (gdjs.scene3d.camera) {
      gdjs.scene3d.camera.setCameraRotationX(
        runtimeScene,
        angle,
        layerName,
        cameraIndex
      );
    }
  };

  const getCameraRotationY = (
    runtimeScene: RuntimeScene,
    layerName: string,
    cameraIndex: integer
  ): float => {
    return gdjs.scene3d.camera
      ? gdjs.scene3d.camera.getCameraRotationY(
          runtimeScene,
          layerName,
          cameraIndex
        )
      : 0;
  };

  const setCameraRotationY = (
    runtimeScene: RuntimeScene,
    angle: float,
    layerName: string,
    cameraIndex: integer
  ) => {
    if (gdjs.scene3d.camera) {
      gdjs.scene3d.camera.setCameraRotationY(
        runtimeScene,
        angle,
        layerName,
        cameraIndex
      );
    }
  };
}
