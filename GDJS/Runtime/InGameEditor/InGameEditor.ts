namespace gdjs {
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;
  const ALT_KEY = 18;
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

  export class InGameEditor {
    _runtimeGame: RuntimeGame;
    _tempVector2d = new THREE.Vector2();
    _selectedObjectData: {
      intersect: THREE.Intersection;
      camera: THREE.Camera;
      scene: THREE.Scene;
    } | null = null;
    _outlinePasses: Record<string, THREE_ADDONS.OutlinePass> = {};
    _raycaster = new THREE.Raycaster();
    _editionAbortController: AbortController = new AbortController();
    _currentTransformControls: THREE_ADDONS.TransformControls | null = null;
    _shouldIgnoreNextClick: boolean = false;
    _lastCursorX: number = 0;
    _lastCursorY: number = 0;

    constructor(game: RuntimeGame) {
      this._runtimeGame = game;
    }

    getTempVector2d(x: float, y: float): THREE.Vector2 {
      this._tempVector2d.x = x;
      this._tempVector2d.y = y;
      return this._tempVector2d;
    }

    private _selectObject() {
      // TODO: avoid calling this again, store instead.
      const firstIntersectsByLayer = this.getFirstIntersectsOnEachLayer(false);

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
      this._selectedObjectData = closestIntersect;
      if (!this._selectedObjectData) return;

      if (
        this._currentTransformControls &&
        this._currentTransformControls.camera ===
          this._selectedObjectData.camera
      ) {
        this._currentTransformControls.detach();
        this._currentTransformControls.attach(
          this._selectedObjectData.intersect.object
        );
      } else {
        if (this._currentTransformControls) {
          this._currentTransformControls.detach();
          this._currentTransformControls = null;
        }
        this._currentTransformControls = new THREE_ADDONS.TransformControls(
          this._selectedObjectData.camera,
          this._runtimeGame.getRenderer().getCanvas() || undefined
        );
        this._currentTransformControls.addEventListener(
          'dragging-changed',
          (e) => {
            if (!this._selectedObjectData) return;
            if (e.value) {
              // Ignore if the user starts dragging
              return;
            }
            const threeObject = this._selectedObjectData.intersect.object;
            const object = threeObject.gdjsRuntimeObject;
            if (!object) return;

            if (object instanceof gdjs.RuntimeObject3D) {
              this._runtimeGame.sendRuntimeObjectsUpdated([
                {
                  object,
                  position: object
                    .getRenderer()
                    .getObjectPositionFrom3DRendererObject(),
                },
              ]);
            }
          }
        );
        this._currentTransformControls.scale.y = -1;
        this._currentTransformControls.attach(
          this._selectedObjectData.intersect.object
        );
        this._selectedObjectData.scene.add(this._currentTransformControls);
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

      // Left click: select the object.
      if (inputManager.isMouseButtonReleased(0)) {
        this._selectObject();
      }

      this._lastCursorX = inputManager.getCursorX();
      this._lastCursorY = inputManager.getCursorY();
    }

    activate(enable: boolean) {
      if (enable) {
        // Nothing to do.
      } else {
        // Disable transform controls.
        if (this._currentTransformControls) {
          this._currentTransformControls.detach();
          this._currentTransformControls = null;
        }
      }
    }

    reloadInstances(
      instances: Array<{
        persistentUuid: string;
        position: { x: number; y: number; z: number };
      }>
    ) {
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
          runtimeObject.setX(instance.position.x);
          runtimeObject.setY(instance.position.y);
          if (runtimeObject instanceof gdjs.RuntimeObject3D) {
            runtimeObject.setZ(instance.position.z);
          }
        }
      });
    }

    getFirstIntersectsOnEachLayer(highlightObject: boolean) {
      const runtimeGame = this._runtimeGame;
      const firstIntersectsByLayer: {
        [layerName: string]: null | {
          intersect: THREE.Intersection;
          camera: THREE.Camera;
          scene: THREE.Scene;
        };
      } = {};

      const layerNames = new Array();
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) return firstIntersectsByLayer;
      const threeRenderer = runtimeGame.getRenderer().getThreeRenderer();
      if (!threeRenderer) return firstIntersectsByLayer;

      currentScene.getAllLayerNames(layerNames);
      layerNames.forEach((layerName) => {
        firstIntersectsByLayer[layerName] = null;

        const runtimeLayerRender = currentScene
          .getLayer(layerName)
          .getRenderer();
        const threeCamera = runtimeLayerRender.getThreeCamera();
        const threeScene = runtimeLayerRender.getThreeScene();
        const threeGroup = runtimeLayerRender.getThreeGroup();
        if (!threeCamera || !threeScene || !threeGroup) return;

        if (!this._outlinePasses[layerName]) {
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

        if (
          highlightObject &&
          (!this._currentTransformControls ||
            !this._currentTransformControls.dragging)
        ) {
          // TODO: OutlinePass currently wrongly highlights the transform controls helper.
          // (See https://discourse.threejs.org/t/outlinepass-with-transform-control/18722)

          outlinePass.edgeStrength = 6.0;
          outlinePass.edgeGlow = 0;
          outlinePass.edgeThickness = 1.0;
          outlinePass.pulsePeriod = 0;
          outlinePass.selectedObjects = [firstIntersect.object];
        }
        firstIntersectsByLayer[layerName] = {
          intersect: firstIntersect,
          camera: threeCamera,
          scene: threeScene,
        };
      });

      return firstIntersectsByLayer;
    }

    updateAndRender() {
      this._handleCameraMovement();
      // TODO: handle selection
      this.getFirstIntersectsOnEachLayer(true);
    }
  }
}
