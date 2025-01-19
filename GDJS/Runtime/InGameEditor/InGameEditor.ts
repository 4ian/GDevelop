namespace gdjs {
  export class InGameEditor {
    _game: RuntimeGame;
    _pointer = new THREE.Vector2();
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

    constructor(game: RuntimeGame) {
      this._game = game;
    }

    onPointerMove(event) {
      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components

      this._pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this._pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    selectObject() {
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
          this._game.getRenderer().getCanvas() || undefined
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
              this._game.sendRuntimeObjectsUpdated([
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

    setupListeners() {
      this.cleanListeners();

      const canvas = this._game.getRenderer().getCanvas();
      this._editionAbortController = new AbortController();
      if (!canvas) return;

      canvas.addEventListener('pointermove', this.onPointerMove.bind(this), {
        signal: this._editionAbortController.signal,
      });
      canvas.addEventListener('wheel', (event) => {
        const currentScene = this._game.getSceneStack().getCurrentScene();
        if (!currentScene) return;

        const layerNames = [];
        currentScene.getAllLayerNames(layerNames);
        layerNames.forEach((layerName) => {
          const layer = currentScene.getLayer(layerName);
          const assumedFovIn2D = 45;
          const layerRenderer = layer.getRenderer();
          const threeCamera = layerRenderer.getThreeCamera();
          const fov = threeCamera
            ? threeCamera instanceof THREE.OrthographicCamera
              ? null
              : threeCamera.fov
            : assumedFovIn2D;

          layer.setCameraZ(layer.getCameraZ(fov) + event.deltaY, fov);
        });
      });
      canvas.addEventListener('click', this.selectObject.bind(this), {
        signal: this._editionAbortController.signal,
      });
    }
    cleanListeners() {
      this._editionAbortController.abort();
    }
    activate(enable: boolean) {
      if (enable) this.setupListeners();
      else {
        this.cleanListeners();
        if (this._currentTransformControls) {
          this._currentTransformControls.detach();
          this._currentTransformControls = null;
        }
      }
    }

    reloadInstances(payload: {
      layoutName: string;
      instances: Array<{
        persistentUuid: string;
        position: { x: number; y: number; z: number };
      }>;
    }) {
      const currentScene = this._game.getSceneStack().getCurrentScene();
      if (!currentScene || currentScene.getName() !== payload.layoutName) {
        return;
      }
      // TODO: Might be worth indexing instances data and runtime objects by their
      // persistentUuid (See HotReloader.indexByPersistentUuid).
      currentScene.getAdhocListOfAllInstances().forEach((runtimeObject) => {
        const instance = payload.instances.find(
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
      const firstIntersectsByLayer: {
        [layerName: string]: null | {
          intersect: THREE.Intersection;
          camera: THREE.Camera;
          scene: THREE.Scene;
        };
      } = {};

      const layerNames = new Array();
      const currentScene = this._game.getSceneStack().getCurrentScene();
      if (!currentScene) return firstIntersectsByLayer;
      const threeRenderer = this._game.getRenderer().getThreeRenderer();
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
        this._raycaster.setFromCamera(this._pointer, threeCamera);
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

    render() {
      this.getFirstIntersectsOnEachLayer(true);
    }
  }
}
