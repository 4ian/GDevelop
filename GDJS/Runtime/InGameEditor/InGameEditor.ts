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

  interface ObjectUnderCursor {
    object: gdjs.RuntimeObject;
  }

  export class InGameEditor {
    private _runtimeGame: RuntimeGame;
    private _tempVector2d = new THREE.Vector2();
    private _outlinePasses: Record<string, THREE_ADDONS.OutlinePass> = {};
    private _raycaster = new THREE.Raycaster();
    private _currentTransformControls: {
      object: gdjs.RuntimeObject;
      threeTransformControls: THREE_ADDONS.TransformControls;
    } | null = null;
    private _lastCursorX: number = 0;
    private _lastCursorY: number = 0;
    private _wasManipulatingSelectionLastFrame = false;
    private _isManipulatingSelection = false;
    private _selectedObjects: Array<gdjs.RuntimeObject> = [];

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

        // TODO: replace everything by "real 3D movement".

        // Mouse wheel: forward/backward movement.
        const wheelDeltaY = inputManager.getMouseWheelDelta();
        const wheelDeltaX = inputManager.getMouseWheelDeltaX();
        if (shouldZoom(inputManager)) {
          // TODO: factor this?
          const assumedFovIn2D = 45;
          const layerRenderer = layer.getRenderer();
          const threeCamera = layerRenderer.getThreeCamera();
          const fov = threeCamera
            ? threeCamera instanceof THREE.OrthographicCamera
              ? null
              : threeCamera.fov
            : assumedFovIn2D;

          layer.setCameraZ(layer.getCameraZ(fov) - wheelDeltaY, fov);
        } else if (shouldScrollHorizontally(inputManager)) {
          layer.setCameraX(layer.getCameraX() + wheelDeltaY / 5);
        } else {
          layer.setCameraX(layer.getCameraX() + wheelDeltaX / 5);
          layer.setCameraY(layer.getCameraY() - wheelDeltaY / 5);
        }

        // Movement with the keyboard
        if (inputManager.isKeyPressed(LEFT_KEY)) {
          layer.setCameraX(layer.getCameraX() - 5);
        }
        if (inputManager.isKeyPressed(RIGHT_KEY)) {
          layer.setCameraX(layer.getCameraX() + 5);
        }
        if (inputManager.isKeyPressed(UP_KEY)) {
          layer.setCameraY(layer.getCameraY() - 5);
        }
        if (inputManager.isKeyPressed(DOWN_KEY)) {
          layer.setCameraY(layer.getCameraY() + 5);
        }

        // Space + click: move the camera on its plane.
        if (
          inputManager.isKeyPressed(SPACE_KEY) &&
          inputManager.isMouseButtonPressed(0)
        ) {
          const xDelta = this._lastCursorX - inputManager.getCursorX();
          const yDelta = this._lastCursorY - inputManager.getCursorY();
          layer.setCameraX(layer.getCameraX() + xDelta);
          layer.setCameraY(layer.getCameraY() + yDelta);
        }
      });

      // TODO: touch controls - pinch to zoom
      // TODO: touch controls - two fingers to move the camera

      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    private _handleSelection({
      objectUnderCursor,
    }: {
      objectUnderCursor: ObjectUnderCursor | null;
    }) {
      const currentScene = this._runtimeGame.getSceneStack().getCurrentScene();
      const inputManager = this._runtimeGame.getInputManager();
      if (!currentScene) return;

      if (
        this._wasManipulatingSelectionLastFrame &&
        !this._isManipulatingSelection
      ) {
        // Just finished dragging/editing the selection.
        this._sendSelectionUpdate();
      }

      // Left click: select the object under the cursor.
      if (
        inputManager.isMouseButtonPressed(0) &&
        !this._isManipulatingSelection
      ) {
        if (!isShiftPressed(inputManager)) {
          this._selectedObjects = [];
        }

        if (objectUnderCursor) {
          if (!this._selectedObjects.includes(objectUnderCursor.object)) {
            this._selectedObjects.push(objectUnderCursor.object);
            this._sendSelectionUpdate();
          }
        }
      }

      if (shouldDeleteSelection(inputManager)) {
        const removedObjects = this._selectedObjects;
        removedObjects.forEach((object) => {
          object.deleteFromScene(currentScene);
        });
        this._selectedObjects = [];
        this._sendSelectionUpdate({
          removedObjects,
        });
      }

      this._wasManipulatingSelectionLastFrame = this._isManipulatingSelection;
    }

    private _updateSelectionOutline({
      objectUnderCursor,
    }: {
      objectUnderCursor: ObjectUnderCursor | null;
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
        outlinePass.selectedObjects = this._selectedObjects
          .filter((object) => object.getLayer() === layerName)
          .map((object) => object.get3DRendererObject())
          .filter(isDefined);
      });
    }

    private _updateSelectionControls() {
      const runtimeGame = this._runtimeGame;
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return;

      const lastSelectedObject =
        this._selectedObjects[this._selectedObjects.length - 1] || null;

      if (
        this._currentTransformControls &&
        (!lastSelectedObject ||
          (lastSelectedObject &&
            this._currentTransformControls.object !== lastSelectedObject))
      ) {
        this._currentTransformControls.threeTransformControls.detach();
        this._currentTransformControls = null;
      }

      if (lastSelectedObject && !this._currentTransformControls) {
        const threeObject = lastSelectedObject.get3DRendererObject();
        if (!threeObject) return;

        const layerName = lastSelectedObject.getLayer();
        const runtimeLayerRender = currentScene
          .getLayer(layerName)
          .getRenderer();
        const threeCamera = runtimeLayerRender.getThreeCamera();
        const threeScene = runtimeLayerRender.getThreeScene();
        if (!threeCamera || !threeScene) return;

        // Create and attach the transform controls to the THREE object.
        const threeTransformControls = new THREE_ADDONS.TransformControls(
          threeCamera,
          this._runtimeGame.getRenderer().getCanvas() || undefined
        );
        threeTransformControls.scale.y = -1;
        threeTransformControls.attach(threeObject);
        threeScene.add(threeTransformControls);

        threeTransformControls.addEventListener('change', (e) => {
          console.log('change', e);
        });
        threeTransformControls.addEventListener('dragging-changed', (e) => {
          if (e.value) {
            // Ignore if the user starts dragging
            this._isManipulatingSelection = true;
            return;
          }
          this._isManipulatingSelection = false;
        });

        this._currentTransformControls = {
          object: lastSelectedObject,
          threeTransformControls,
        };
      }
    }

    activate(enable: boolean) {
      if (enable) {
        // Nothing to do.
      } else {
        // Disable transform controls.
        if (this._currentTransformControls) {
          this._currentTransformControls.threeTransformControls.detach();
          this._currentTransformControls = null;
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

      const updatedInstances = this._selectedObjects
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
        selectedInstances: getPersistentUuidsFromObjects(this._selectedObjects),
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

    getObjectUnderCursor(): ObjectUnderCursor | null {
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

      return {
        object: threeObject.gdjsRuntimeObject,
      };
    }

    updateAndRender() {
      const objectUnderCursor: ObjectUnderCursor | null = this.getObjectUnderCursor();

      this._handleCameraMovement();
      this._handleSelection({ objectUnderCursor });
      this._updateSelectionOutline({ objectUnderCursor });
      this._updateSelectionControls();
    }
  }
}
