namespace gdjs {
  const logger = new gdjs.Logger('In-Game editor');

  /**
   * A minimal utility to define DOM elements.
   * Also copied in InGameDebugger.tsx.
   */
  function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: {
      style?: Partial<CSSStyleDeclaration>;
      onClick?: () => void;
    },
    ...nodes: (HTMLElement | string)[]
  ): HTMLElement {
    const node = document.createElement(tag);
    Object.keys(attrs).forEach((key) => {
      if (key === 'style') {
        for (const [styleName, value] of Object.entries(attrs.style!)) {
          node.style[styleName] = value;
        }
      } else if (key === 'onClick') {
        node.addEventListener('click', attrs[key]!);
      } else {
        node.setAttribute(key, '' + attrs[key]);
      }
    });

    node.append(...nodes);
    return node;
  }

  /**
   * Adapt the Three.js TransformControls gizmos so that the axis are in the same direction as in GDevelop.
   * This does not change the way the controls work (notably when dragged), it's only a visual adaptation.
   */
  const patchAxesOnTransformControlsGizmos = (
    controls: THREE_ADDONS.TransformControls
  ) => {
    const gizmoRoot = controls && (controls as any)._gizmo;
    if (!gizmoRoot) return;

    // Flip gizmo (visual), picker (raycast), and helper (guide lines)
    const groupsToFlip = ['gizmo', 'picker', 'helper'];

    // Bake axis reflections into geometry so per-frame handle scaling
    // inside TransformControlsGizmo.updateMatrixWorld() won't undo it.
    const flipY = new THREE.Matrix4().makeScale(1, -1, 1);
    const flipX = new THREE.Matrix4().makeScale(-1, 1, 1);

    // For translate mode: flip Y-axis handles
    const shouldFlipYByName = (name) =>
      name === 'Y' || name === 'XY' || name === 'YZ';

    // For scale mode: flip X-axis handles
    const shouldFlipXByName = (name) =>
      name === 'X' || name === 'XY' || name === 'XZ';

    // Process translate mode (flip Y)
    for (const group of groupsToFlip) {
      const root = gizmoRoot[group] && gizmoRoot[group]['translate'];
      if (!root) continue;

      root.traverse((obj) => {
        if (!obj || !obj.geometry) return;
        const name = obj.name || '';
        if (!shouldFlipYByName(name)) return;

        // Bake the Y flip directly into the geometry
        obj.geometry.applyMatrix4(flipY);

        // Keep raycasting bounds correct after mutation
        if (typeof obj.geometry.computeBoundingBox === 'function') {
          obj.geometry.computeBoundingBox();
        }
        if (typeof obj.geometry.computeBoundingSphere === 'function') {
          obj.geometry.computeBoundingSphere();
        }
      });
    }

    // Process scale mode (flip X)
    for (const group of groupsToFlip) {
      const root = gizmoRoot[group] && gizmoRoot[group]['scale'];
      if (!root) continue;

      root.traverse((obj) => {
        if (!obj || !obj.geometry) return;
        const name = obj.name || '';
        if (!shouldFlipXByName(name)) return;

        // Bake the X flip directly into the geometry
        obj.geometry.applyMatrix4(flipX);

        // Keep raycasting bounds correct after mutation
        if (typeof obj.geometry.computeBoundingBox === 'function') {
          obj.geometry.computeBoundingBox();
        }
        if (typeof obj.geometry.computeBoundingSphere === 'function') {
          obj.geometry.computeBoundingSphere();
        }
      });
    }
  };

  const patchColorsOnTransformControlsGizmos = (
    controls: THREE_ADDONS.TransformControls
  ) => {
    const gizmoRoot = controls && (controls as any)._gizmo;
    if (!gizmoRoot) return;

    const colorMap = {
      x: 0xf53e63,
      y: 0xa4e507,
      z: 0x36a9f5,
      e: 0xffff00,
      xyz: 0xffffff,
      xyze: 0x787878,
      highlight: 0xeeeeee,
    };
    const modes = ['translate', 'rotate', 'scale'];
    const groups = ['gizmo', 'helper'];

    // Helper to determine which color to use based on handle name
    const getColorForHandle = (name) => {
      const nameLower = (name || '').toLowerCase();

      if (nameLower === 'xyze') return colorMap.xyze;
      if (nameLower === 'xyz') return colorMap.xyz;
      if (nameLower === 'e') return colorMap.e;

      // For plane handles (XY, YZ, XZ), use the color of the missing axis
      if (nameLower === 'xy') return colorMap.z;
      if (nameLower === 'yz') return colorMap.x;
      if (nameLower === 'xz') return colorMap.y;

      // Single axis handles
      if (nameLower === 'x' || nameLower.includes('x')) return colorMap.x;
      if (nameLower === 'y' || nameLower.includes('y')) return colorMap.y;
      if (nameLower === 'z' || nameLower.includes('z')) return colorMap.z;

      return null;
    };

    // Apply colors to all gizmo materials
    for (const mode of modes) {
      for (const group of groups) {
        const root = gizmoRoot[group] && gizmoRoot[group][mode];
        if (!root) continue;

        root.traverse((obj) => {
          if (!obj || !obj.material) return;

          const color = getColorForHandle(obj.name);
          if (color === null) return;

          // Update the material color and store it as the base color
          obj.material.color.setHex(color);
          obj.material._color = obj.material.color.clone();
          obj.material._opacity = obj.material.opacity;
        });
      }
    }

    // Patch the gizmo's updateMatrixWorld to use custom highlight color
    if (!gizmoRoot._originalUpdateMatrixWorld) {
      gizmoRoot._originalUpdateMatrixWorld =
        gizmoRoot.updateMatrixWorld.bind(gizmoRoot);
      gizmoRoot._customHighlightColor = colorMap.highlight;

      gizmoRoot.updateMatrixWorld = function (force) {
        // Call original update first
        this._originalUpdateMatrixWorld(force);

        // Override the highlight color if an axis is selected
        if (this.enabled && this.axis) {
          const modes = ['translate', 'rotate', 'scale'];
          const groups = ['gizmo', 'helper'];

          for (const mode of modes) {
            for (const group of groups) {
              const root = this[group] && this[group][mode];
              if (!root) continue;

              root.traverse((obj) => {
                if (!obj || !obj.material) return;

                // Check if this handle should be highlighted
                const shouldHighlight =
                  obj.name === this.axis ||
                  this.axis.split('').some((a) => obj.name === a);

                if (shouldHighlight) {
                  // Apply custom highlight color
                  obj.material.color.setHex(this._customHighlightColor);
                  obj.material.opacity = 1.0;
                }
              });
            }
          }
        }
      };
    } else {
      // Update the stored highlight color if already patched
      gizmoRoot._customHighlightColor = colorMap.highlight;
    }
  };

  function patchNegativeAxisHandlesOnTransformControlsGizmos(
    controls: THREE_ADDONS.TransformControls
  ) {
    const gizmo = (controls as any)._gizmo;
    if (!gizmo) return;

    // Helper function to remove specific children from gizmo groups
    function removeNegativeHandles(gizmoGroup, mode) {
      if (!gizmoGroup || !gizmoGroup.children) return;

      const toRemove: Array<THREE.Mesh> = [];
      const seenAxes = { X: [], Y: [], Z: [] };

      // First pass: catalog all children by axis
      gizmoGroup.children.forEach((child) => {
        if (child.name === 'X' || child.name === 'Y' || child.name === 'Z') {
          seenAxes[child.name].push(child);
        }
      });

      // Second pass: mark negative handles for removal
      Object.keys(seenAxes).forEach((axisName) => {
        const axisChildren = seenAxes[axisName];

        if (mode === 'translate' && axisChildren.length >= 2) {
          // In translate: [positive arrow at index 0, negative arrow at index 1, line at index 2]
          // Remove the negative arrow (index 1)
          toRemove.push(axisChildren[1]);
        } else if (mode === 'scale' && axisChildren.length >= 3) {
          // In scale: [negative cube at index 0, line at index 1, positive cube at index 2]
          // Remove the negative cube (index 2)
          toRemove.push(axisChildren[0]);
        }
      });

      // Remove marked children
      toRemove.forEach((child) => {
        gizmoGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material && Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      });
    }

    // Only process the visual gizmos, NOT the pickers (which handle interaction)
    if (gizmo.gizmo && gizmo.gizmo['translate']) {
      removeNegativeHandles(gizmo.gizmo['translate'], 'translate');
    }

    if (gizmo.gizmo && gizmo.gizmo['scale']) {
      removeNegativeHandles(gizmo.gizmo['scale'], 'scale');
    }

    // Keep the pickers intact for interaction - they're invisible anyway
  }

  const getSvgIconUrl = (game: RuntimeGame, resourceName: string) => {
    const resource = game.getResourceLoader().getResource(resourceName);
    if (!resource) return '';
    return game.getResourceLoader().getFullUrl(resource.file);
  };

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
  const O_KEY = 79;
  const V_KEY = 86;
  const X_KEY = 88;
  const Y_KEY = 89;
  const Z_KEY = 90;
  const ESC_KEY = 27;
  const EQUAL_KEY = 187;
  const MINUS_KEY = 189;
  const KEY_DIGIT_1 = 49;
  const KEY_DIGIT_2 = 50;
  const KEY_DIGIT_3 = 51;

  const exceptionallyGetKeyCodeFromLocationAwareKeyCode = (
    locationAwareKeyCode: number
  ): number => {
    return locationAwareKeyCode % 1000;
  };

  // See same factors in `newIDE/app/src/Utils/ZoomUtils.js`.
  const zoomInFactor = Math.pow(2, (2 * 1) / 16);
  const zoomOutFactor = Math.pow(2, (-2 * 1) / 16);

  const instanceStateFlag = {
    selected: 1,
    locked: 2,
    hovered: 4,
  };
  const instanceWireframeColor = {
    [instanceStateFlag.hovered]: '#54daff',
    [instanceStateFlag.selected]: '#f2a63c',
    [instanceStateFlag.selected | instanceStateFlag.hovered]: '#ffd200',
    [instanceStateFlag.locked | instanceStateFlag.hovered]: '#b02715',
    [instanceStateFlag.locked | instanceStateFlag.selected]: '#b87f7f',
    [instanceStateFlag.locked |
    instanceStateFlag.selected |
    instanceStateFlag.hovered]: '#f51e02',
  };

  const editorCameraFov = 45;

  export type InGameEditorSettings = {
    theme: {
      iconButtonSelectedBackgroundColor: string;
      iconButtonSelectedColor: string;
      toolbarBackgroundColor: string;
      toolbarSeparatorColor: string;
      textColorPrimary: string;
    };
  };

  const defaultInGameEditorSettings: InGameEditorSettings = {
    theme: {
      iconButtonSelectedBackgroundColor: 'black',
      iconButtonSelectedColor: 'black',
      toolbarBackgroundColor: 'black',
      toolbarSeparatorColor: 'black',
      textColorPrimary: 'black',
    },
  };

  let hasWindowFocus = true;
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      hasWindowFocus = true;
    });
    window.addEventListener('blur', () => {
      hasWindowFocus = false;
    });
  }

  function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
    return value !== null && value !== undefined;
  }

  type Point3D = [float, float, float];

  type RuntimeObjectWith3D = RuntimeObject &
    Base3DHandler &
    Resizable &
    Scalable &
    Flippable & {
      getCenterZInScene(): float;
    };

  const is3D = (object: gdjs.RuntimeObject): object is RuntimeObjectWith3D => {
    return gdjs.Base3DHandler.is3D(object);
  };

  type AABB3D = {
    min: Point3D;
    max: Point3D;
  };

  const defaultEffectsData: EffectData[] = [
    {
      effectType: 'Scene3D::HemisphereLight',
      name: 'Default Light for in-game editor',
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

  /** Get the identifiers of the touches that are currently active, without the mouse. */
  const getCurrentTouchIdentifiers = (inputManager: gdjs.InputManager) => {
    return inputManager
      .getAllTouchIdentifiers()
      .slice()
      .filter((id) => id !== gdjs.InputManager.MOUSE_TOUCH_ID) // Exclude mouse touch
      .sort((a, b) => a - b); // Ensure stable order to help comparisons.
  };

  const getTouchesCentroid = (inputManager: gdjs.InputManager) => {
    const ids = getCurrentTouchIdentifiers(inputManager);
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
    const ids = getCurrentTouchIdentifiers(inputManager);
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

  const snap = (value: float, size: float, offset: float) =>
    size ? offset + size * Math.round((value - offset) / size) : value;

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

    getLastSelectedObject(options?: {
      ignoreIf: (object: gdjs.RuntimeObject) => boolean;
    }): gdjs.RuntimeObject | null {
      if (options && options.ignoreIf) {
        for (let i = this._selectedObjects.length - 1; i >= 0; i--) {
          const object = this._selectedObjects[i];
          if (!options.ignoreIf(object)) {
            return object;
          }
        }
        return null;
      }

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
    _changeHappened = false;

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
      this._changeHappened = false;
      this._objectInitialPositions.clear();
    }

    endMove(): boolean {
      const changeHappened = this._changeHappened;
      this._objectInitialPositions.clear();
      this._changeHappened = false;
      return changeHappened;
    }

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

        this._changeHappened =
          this._changeHappened ||
          movement.translationX !== 0 ||
          movement.translationY !== 0 ||
          movement.translationZ !== 0 ||
          movement.rotationX !== 0 ||
          movement.rotationY !== 0 ||
          movement.rotationZ !== 0 ||
          movement.scaleX !== 1 ||
          movement.scaleY !== 1 ||
          movement.scaleZ !== 1;

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
        // TODO Remove this when we handle 2D instances controls
        if (!is3D(object)) {
          return;
        }
        object.setX(Math.round(initialPosition.x + movement.translationX));
        object.setY(Math.round(initialPosition.y + movement.translationY));
        object.setAngle(
          gdjs.evtTools.common.mod(
            Math.round(initialPosition.angle + movement.rotationZ),
            360
          )
        );
        if (movement.scaleX !== 1) {
          object.setWidth(
            Math.round(initialPosition.width * Math.abs(movement.scaleX))
          );
        }
        if (movement.scaleY !== 1) {
          object.setHeight(
            Math.round(initialPosition.height * Math.abs(movement.scaleY))
          );
        }
        if (is3D(object)) {
          object.setZ(Math.round(initialPosition.z + movement.translationZ));
          object.setRotationX(
            gdjs.evtTools.common.mod(
              Math.round(initialPosition.rotationX + movement.rotationX),
              360
            )
          );
          object.setRotationY(
            gdjs.evtTools.common.mod(
              Math.round(initialPosition.rotationY + movement.rotationY),
              360
            )
          );
          if (movement.scaleZ !== 1) {
            object.setDepth(
              Math.round(initialPosition.depth * Math.abs(movement.scaleZ))
            );
          }
        }
      });
    }
  }

  const getCameraForwardVector = (threeCamera: THREE.Camera) => {
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
    const elements = threeCamera.matrixWorld.elements;

    // Local forward axis in world space (note we take the negative of that column).
    const forward = new THREE.Vector3(-elements[8], elements[9], -elements[10]);

    // Normalize it, just in case (they should generally be unit vectors).
    forward.normalize();

    return { forward };
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

    private _isVisible = true;
    private _timeSinceLastInteraction = 0;
    private _isFirstFrame = true;

    private _editorCamera;

    /** Keep track of the focus to know if the game was blurred since the last frame. */
    private _windowHadFocus = true;

    // The controls shown to manipulate the selection.
    private _selectionControls: {
      object: gdjs.RuntimeObject;
      dummyThreeObject: THREE.Object3D;
      threeTransformControls: THREE_ADDONS.TransformControls;
    } | null = null;
    private _editorGrid: EditorGrid;
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
    private _isTransformControlsHovered = false;
    private _wasMovingSelectionLastFrame = false;

    private _selectionBox: THREE_ADDONS.SelectionBox | null = null;
    private _selectionBoxElement: HTMLDivElement;
    private _selectionBoxStartCursorX: float = 0;
    private _selectionBoxStartCursorY: float = 0;

    // The selected objects.
    private _selection = new Selection();
    private _selectionBoxes: Map<RuntimeObject, ObjectSelectionBoxHelper> =
      new Map();
    private _objectMover = new ObjectMover(this);

    private _wasMouseRightButtonPressed = false;
    private _wasMouseLeftButtonPressed = false;
    private _pressedOriginalCursorX: float = 0;
    private _pressedOriginalCursorY: float = 0;
    private _previousCursorX: float = 0;
    private _previousCursorY: float = 0;

    private _lastClickOnObjectUnderCursor: {
      object: gdjs.RuntimeObject | null;
      time: number;
    } = {
      object: null,
      time: 0,
    };

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
    private _instancesEditorSettings: InstancesEditorSettings | null = null;
    private _toolbar: Toolbar;
    private _inGameEditorSettings: InGameEditorSettings;

    constructor(
      game: RuntimeGame,
      projectData: ProjectData,
      inGameEditorSettings: InGameEditorSettings | null
    ) {
      this._runtimeGame = game;
      this._editorCamera = new EditorCamera(this);
      this._editorGrid = new EditorGrid(this);

      this._selectionBoxElement = document.createElement('div');
      this._selectionBoxElement.style.position = 'fixed';
      this._selectionBoxElement.style.backgroundColor = '#f2a63c44';
      this._selectionBoxElement.style.border = '1px solid #f2a63c';

      this._inGameEditorSettings =
        inGameEditorSettings || defaultInGameEditorSettings;

      this._toolbar = new Toolbar({
        getTransformControlsMode: () => this._getTransformControlsMode(),
        setTransformControlsMode: (mode: 'translate' | 'rotate' | 'scale') =>
          this._setTransformControlsMode(mode),
        focusOnSelection: () => this._focusOnSelection(),
        switchToFreeCamera: () => this._getEditorCamera().switchToFreeCamera(),
        switchToOrbitCamera: () =>
          this._getEditorCamera().switchToOrbitAroundZ0(4000),
        isFreeCamera: () => this._getEditorCamera().isFreeCamera(),
        getSvgIconUrl: (iconName: string) => getSvgIconUrl(game, iconName),
        hasSelectionControlsShown: () => !!this._selectionControls,
      });

      this._applyInGameEditorSettings();
      this.onProjectDataChange(projectData);
    }

    private _applyInGameEditorSettings() {
      if (typeof document === 'undefined') return;

      const rootElement = document.documentElement;
      if (!rootElement) return;

      rootElement.style.setProperty(
        '--in-game-editor-theme-icon-button-selected-background-color',
        this._inGameEditorSettings.theme.iconButtonSelectedBackgroundColor
      );
      rootElement.style.setProperty(
        '--in-game-editor-theme-icon-button-selected-color',
        this._inGameEditorSettings.theme.iconButtonSelectedColor
      );
      rootElement.style.setProperty(
        '--in-game-editor-theme-toolbar-background-color',
        this._inGameEditorSettings.theme.toolbarBackgroundColor
      );
      rootElement.style.setProperty(
        '--in-game-editor-theme-toolbar-separator-color',
        this._inGameEditorSettings.theme.toolbarSeparatorColor
      );
      rootElement.style.setProperty(
        '--in-game-editor-theme-text-color-primary',
        this._inGameEditorSettings.theme.textColorPrimary
      );
    }

    setInGameEditorSettings(inGameEditorSettings: InGameEditorSettings) {
      this._inGameEditorSettings = {
        ...this._inGameEditorSettings,
        ...inGameEditorSettings,
      };
      this._applyInGameEditorSettings();
    }

    getRuntimeGame() {
      return this._runtimeGame;
    }

    onProjectDataChange(projectData: ProjectData): void {
      this.setEffectsHiddenInEditor(
        !!projectData.properties.areEffectsHiddenInEditor
      );
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
        layerData.camera3DFieldOfView = editorCameraFov;
        // Force 2D and 3D objects to be visible on any layer.
        layerData.renderingType = '2d+3d';
        if (areEffectsHiddenInEditor) {
          if (layerData.effects !== defaultEffectsData) {
            layerData._hiddenEffects = layerData.effects;
            layerData.effects = defaultEffectsData;
          }
        } else {
          if (layerData._hiddenEffects) {
            layerData.effects = layerData._hiddenEffects;
          }
        }
      }
    }

    /**
     * Modify the layer data accordingly.
     * `gdjs.HotReloader.hotReloadRuntimeSceneLayers` must be run for the
     * changes to be applied.
     */
    setEffectsHiddenInEditor(areEffectsHiddenInEditor: boolean) {
      const projectData = this._runtimeGame.getGameData();
      projectData.properties.areEffectsHiddenInEditor =
        areEffectsHiddenInEditor;
      for (const layoutData of projectData.layouts) {
        this.onLayersDataChange(layoutData.layers, areEffectsHiddenInEditor);
      }
    }

    areEffectsHidden(): boolean {
      return !!this._runtimeGame.getGameData().properties
        .areEffectsHiddenInEditor;
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
          this.setInstancesEditorSettings(
            eventsBasedObjectVariantData.editionSettings
          );
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
        const sceneAndExtensionsData =
          this._runtimeGame.getSceneAndExtensionsData(sceneName);
        const newScene = new gdjs.RuntimeScene(this._runtimeGame);
        newScene.loadFromScene(sceneAndExtensionsData, {
          skipCreatingInstances: !!externalLayoutName,
        });

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
            this.setInstancesEditorSettings(externalLayoutData.editionSettings);
          }
        } else {
          this.setInstancesEditorSettings(
            sceneAndExtensionsData!.sceneData.uiSettings
          );
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
      this._isFirstFrame = true;
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

    setInstancesEditorSettings(
      instancesEditorSettings: InstancesEditorSettings
    ) {
      this._instancesEditorSettings = instancesEditorSettings;
      this._editorGrid.setSettings(instancesEditorSettings);
    }

    updateInstancesEditorSettings(
      instancesEditorSettings: InstancesEditorSettings
    ) {
      if (this._instancesEditorSettings) {
        Object.assign(this._instancesEditorSettings, instancesEditorSettings);
      } else {
        this._instancesEditorSettings = instancesEditorSettings;
      }
      this._editorGrid.setSettings(instancesEditorSettings);
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
      this._getEditorCamera().switchToFreeCamera();
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

    centerViewOnLastSelectedInstance() {
      if (!this._currentScene) return;

      const object = this._selection.getLastSelectedObject();
      if (!object) {
        return;
      }

      this._getEditorCamera().switchToOrbitAroundObject(object);
    }

    private _focusOnSelection() {
      // TODO Use the center of the AABB of the whole selection instead
      const selectedObject = this._selection.getLastSelectedObject();
      if (!selectedObject) {
        return;
      }
      this._getEditorCamera().switchToOrbitAroundObject(selectedObject);
    }

    private _handleCameraMovement() {
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._currentScene;
      if (!currentScene) return;

      const selectedObject = this._selection.getLastSelectedObject();
      if (inputManager.isKeyPressed(F_KEY) && selectedObject) {
        this._focusOnSelection();
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

    private _shouldDragSelectedObject(): boolean {
      const inputManager = this._runtimeGame.getInputManager();
      return (
        isControlOrCmdPressed(inputManager) &&
        (!this._selectionControls ||
          !this._selectionControls.threeTransformControls.dragging)
      );
    }

    private _handleSelectedObjectDragging(): void {
      const inputManager = this._runtimeGame.getInputManager();

      // Always check first if we should end an existing drag.
      if (
        this._draggedSelectedObject &&
        (inputManager.isMouseButtonReleased(0) ||
          !this._shouldDragSelectedObject())
      ) {
        this._draggedSelectedObject = null;
        const changeHappened = this._objectMover.endMove();
        this._sendSelectionUpdate({
          hasSelectedObjectBeenModified: changeHappened,
        });
      }

      // Inspect then if a drag should be started or continued.
      if (!this._shouldDragSelectedObject()) {
        // We can early return as the rest is not applicable (we've already checked
        // if a drag should be ended).
        return;
      }
      if (!this._currentScene) return;
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      if (
        inputManager.isMouseButtonPressed(0) &&
        !this._draggedSelectedObject
      ) {
        // Start a new drag.
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

      // Continue an existing drag.
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
          isIntersectionFound = true;
          [intersectionX, intersectionY, intersectionZ] = cursor;
        }
      } else {
        const projectedCursor = this._getProjectedCursor();
        if (projectedCursor) {
          isIntersectionFound = true;
          [intersectionX, intersectionY] = projectedCursor;
        }
      }
      if (isIntersectionFound) {
        this._editorGrid.setNormal('Z');
        this._editorGrid.setPosition(
          intersectionX,
          intersectionY,
          intersectionZ
        );
        const cameraLayer = this.getCameraLayer(
          this._draggedSelectedObject.getLayer()
        );
        const threeScene = cameraLayer
          ? cameraLayer.getRenderer().getThreeScene()
          : null;
        if (threeScene) {
          this._editorGrid.setTreeScene(threeScene);
        }
        this._editorGrid.setVisible(true);
        if (this._editorGrid.isSpanningEnabled(inputManager)) {
          intersectionX = this._editorGrid.getSnappedX(intersectionX);
          intersectionY = this._editorGrid.getSnappedY(intersectionY);
        }
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
        const changeHappened = this._objectMover.endMove();
        this._sendSelectionUpdate({
          hasSelectedObjectBeenModified: changeHappened,
        });
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

      const touchIds = getCurrentTouchIdentifiers(inputManager);
      const hasMultipleTouches = touchIds.length >= 2;

      if (
        inputManager.isMouseButtonPressed(0) &&
        !this._shouldDragSelectedObject() &&
        !isSpacePressed(inputManager) &&
        !hasMultipleTouches
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
          !this._hasSelectionActuallyMoved &&
          !hasMultipleTouches
        ) {
          // Selection rectangle ended.

          const objects = new Set<gdjs.RuntimeObject>();
          for (const selectThreeObject of this._selectionBox.select()) {
            // TODO Select the object if all its meshes are inside the rectangle
            // instead of if any is.
            const object = this._getObject3D(selectThreeObject);
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
        } else {
          // Selection rectangle was discarded.
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

      if (this._isTransformControlsHovered) {
        return;
      }

      const inputManager = this._runtimeGame.getInputManager();

      if (inputManager.wasKeyJustPressed(ESC_KEY)) {
        this._selection.clear();
        this._sendSelectionUpdate();
      }

      // Left click: select the object under the cursor.
      if (
        inputManager.isMouseButtonReleased(0) &&
        this._hasCursorStayedStillWhilePressed({ toleranceRadius: 10 })
      ) {
        if (!isShiftPressed(inputManager)) {
          this._selection.clear();
        }
        let objectToEdit: gdjs.RuntimeObject | null = null;
        if (objectUnderCursor) {
          const layer = this.getEditorLayer(objectUnderCursor.getLayer());
          if (
            layer &&
            !layer._initialLayerData.isLocked &&
            !this.isInstanceSealed(objectUnderCursor)
          ) {
            this._selection.toggle(objectUnderCursor);
          }

          if (
            this._lastClickOnObjectUnderCursor.object === objectUnderCursor &&
            Date.now() - this._lastClickOnObjectUnderCursor.time < 400
          ) {
            // Double click on the same object: edit the object.
            objectToEdit = objectUnderCursor;

            this._lastClickOnObjectUnderCursor = {
              object: null,
              time: 0,
            };
          } else {
            this._lastClickOnObjectUnderCursor = {
              object: objectUnderCursor,
              time: Date.now(),
            };
          }
        }
        this._sendSelectionUpdate({
          objectToEdit,
        });
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

    private _updateSelectionOutline({
      objectUnderCursor,
    }: {
      objectUnderCursor: gdjs.RuntimeObject | null;
    }) {
      if (!this._currentScene) return;

      const selectedObjects = this._selection.getSelectedObjects();

      // Add/update boxes for selected objects
      selectedObjects.forEach((object) =>
        this._createBoundingBoxIfNeeded(object)
      );
      if (
        objectUnderCursor &&
        !this._selectionBoxes.has(objectUnderCursor) &&
        !this.isInstanceSealed(objectUnderCursor)
      ) {
        this._createBoundingBoxIfNeeded(objectUnderCursor);
      }

      // Remove boxes for deselected objects
      this._selectionBoxes.forEach((box, object) => {
        const isHovered =
          object === objectUnderCursor && !this._isTransformControlsHovered;
        const isInSelection = selectedObjects.includes(object);
        if (!isInSelection && !isHovered) {
          box.removeFromParent();
          this._selectionBoxes.delete(object);
        } else {
          const isLocked = this.isInstanceLocked(object);

          const color =
            instanceWireframeColor[
              (isLocked || !is3D(object) ? instanceStateFlag.locked : 0) |
                (isInSelection ? instanceStateFlag.selected : 0) |
                (isHovered ? instanceStateFlag.hovered : 0)
            ] || '#aaaaaa';

          box.setColor(color);
        }
      });

      this._selectionBoxes.forEach((box) => {
        box.update();
      });
    }

    private _createBoundingBoxIfNeeded(object: RuntimeObject): void {
      if (this._selectionBoxes.has(object)) {
        return;
      }
      const currentScene = this._currentScene;
      if (!currentScene) return;

      const objectLayer = this.getEditorLayer(object.getLayer());
      if (!objectLayer) return;

      const threeGroup = objectLayer.getRenderer().getThreeGroup();
      if (!threeGroup) return;

      const objectBoxHelper = new ObjectSelectionBoxHelper(object);
      threeGroup.add(objectBoxHelper.container);
      this._selectionBoxes.set(object, objectBoxHelper);
    }

    private _getTransformControlsMode():
      | 'translate'
      | 'rotate'
      | 'scale'
      | null {
      if (!this._selectionControls) {
        return null;
      }
      return this._selectionControls.threeTransformControls.mode;
    }

    private _setTransformControlsMode(
      mode: 'translate' | 'rotate' | 'scale'
    ): void {
      if (!this._selectionControls) {
        return;
      }
      const { threeTransformControls, dummyThreeObject } =
        this._selectionControls;
      threeTransformControls.mode = mode;

      const lastEditableSelectedObject = this._selection.getLastSelectedObject({
        ignoreIf: (object) =>
          this.isInstanceLocked(object) || this.isInstanceSealed(object),
      });
      if (!lastEditableSelectedObject) {
        return;
      }
      const threeObject = lastEditableSelectedObject.get3DRendererObject();
      if (!threeObject) {
        return;
      }
      dummyThreeObject.rotation.copy(threeObject.rotation);
      if (threeTransformControls.mode === 'rotate') {
        dummyThreeObject.rotation.y = -dummyThreeObject.rotation.y;
        dummyThreeObject.rotation.z = -dummyThreeObject.rotation.z;
      }
    }

    private _forceUpdateSelectionControls() {
      let mode: 'translate' | 'rotate' | 'scale' | null = null;
      if (this._selectionControls) {
        mode = this._selectionControls.threeTransformControls.mode;
        this._removeSelectionControls();
      }
      this._updateSelectionControls();
      if (mode && this._selectionControls) {
        this._setTransformControlsMode(mode);
      }
    }

    private _updateSelectionControls() {
      const inputManager = this._runtimeGame.getInputManager();
      const currentScene = this._currentScene;
      if (!currentScene) return;

      const touchIds = getCurrentTouchIdentifiers(inputManager);
      const hasMultipleTouches = touchIds.length >= 2;

      // Selection controls are shown on the last object that can be manipulated
      // (and if none, selection controls are not shown).
      const lastEditableSelectedObject = this._selection.getLastSelectedObject({
        ignoreIf: (object) =>
          this.isInstanceLocked(object) || this.isInstanceSealed(object),
      });

      // Space or multiple touches will hide the selection controls as they are
      // used to move the camera.
      const shouldHideSelectionControls =
        isSpacePressed(inputManager) || hasMultipleTouches;

      // Remove the selection controls if the last selected object has changed
      // or if nothing movable is selected.
      if (
        this._selectionControls &&
        (!lastEditableSelectedObject ||
          (lastEditableSelectedObject &&
            this._selectionControls.object !== lastEditableSelectedObject) ||
          this._shouldDragSelectedObject() ||
          shouldHideSelectionControls)
      ) {
        this._removeSelectionControls();
      }

      // Create the selection controls on the last object that can be manipulated.
      if (
        lastEditableSelectedObject &&
        !this._selectionControls &&
        !this._shouldDragSelectedObject() &&
        !shouldHideSelectionControls &&
        lastEditableSelectedObject.get3DRendererObject()
      ) {
        const cameraLayer = this.getCameraLayer(
          lastEditableSelectedObject.getLayer()
        );
        if (cameraLayer) {
          const runtimeLayerRender = cameraLayer
            ? cameraLayer.getRenderer()
            : null;
          const threeCamera = runtimeLayerRender
            ? runtimeLayerRender.getThreeCamera()
            : null;
          const threeScene = runtimeLayerRender
            ? runtimeLayerRender.getThreeScene()
            : null;
          if (threeCamera && threeScene) {
            // Create and attach the transform controls. It is attached to a dummy object
            // to avoid the controls to directly move the runtime object (we handle this
            // manually).
            const threeTransformControls = new THREE_ADDONS.TransformControls(
              threeCamera,
              this._runtimeGame.getRenderer().getCanvas() || undefined
            );
            patchAxesOnTransformControlsGizmos(threeTransformControls);
            patchColorsOnTransformControlsGizmos(threeTransformControls);
            patchNegativeAxisHandlesOnTransformControlsGizmos(
              threeTransformControls
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
            this._updateDummyLocation(
              dummyThreeObject,
              lastEditableSelectedObject,
              threeTransformControls
            );
            threeScene.add(dummyThreeObject);

            threeTransformControls.attach(dummyThreeObject);
            threeScene.add(threeTransformControls);

            // Keep track of the movement so the editor can apply it to the selection.
            let initialObjectX = 0;
            let initialObjectY = 0;
            let initialObjectZ = 0;
            const initialDummyPosition = new THREE.Vector3();
            const initialDummyRotation = new THREE.Euler();
            const initialDummyScale = new THREE.Vector3();
            threeTransformControls.addEventListener('change', (e) => {
              if (!threeTransformControls.dragging) {
                this._selectionControlsMovementTotalDelta = null;

                this._updateDummyLocation(
                  dummyThreeObject,
                  lastEditableSelectedObject,
                  threeTransformControls
                );
                // Reset the initial position to the current position, so that
                // it's ready to be dragged again.
                initialObjectX = lastEditableSelectedObject.getX();
                initialObjectY = lastEditableSelectedObject.getY();
                initialObjectZ = is3D(lastEditableSelectedObject)
                  ? lastEditableSelectedObject.getZ()
                  : 0;
                initialDummyPosition.copy(dummyThreeObject.position);
                initialDummyRotation.copy(dummyThreeObject.rotation);
                initialDummyScale.copy(dummyThreeObject.scale);
                return;
              }

              let translationX =
                dummyThreeObject.position.x - initialDummyPosition.x;
              let translationY =
                dummyThreeObject.position.y - initialDummyPosition.y;
              let translationZ =
                dummyThreeObject.position.z - initialDummyPosition.z;
              if (
                threeTransformControls.mode === 'translate' &&
                threeTransformControls.axis
              ) {
                if (threeTransformControls.axis === 'XYZ') {
                  // We need to override the translation vector because
                  // `threeTransformControls` don't know that the selection
                  // must be excluded when looking for the cursor position.
                  let isIntersectionFound = false;
                  let intersectionX: float = 0;
                  let intersectionY: float = 0;
                  let intersectionZ: float = 0;
                  if (is3D(lastEditableSelectedObject)) {
                    const cursor = this._getCursorIn3D(
                      this._selection.getSelectedObjects()
                    );
                    if (cursor) {
                      isIntersectionFound = true;
                      [intersectionX, intersectionY, intersectionZ] = cursor;
                    }
                  } else {
                    const projectedCursor = this._getProjectedCursor();
                    if (projectedCursor) {
                      isIntersectionFound = true;
                      [intersectionX, intersectionY] = projectedCursor;
                    }
                  }
                  if (isIntersectionFound) {
                    translationX = intersectionX - initialObjectX;
                    translationY = intersectionY - initialObjectY;
                    translationZ = intersectionZ - initialObjectZ;
                  } else {
                    translationX = 0;
                    translationY = 0;
                    translationZ = 0;
                  }
                }
                const isMovingOnX = threeTransformControls.axis.includes('X');
                const isMovingOnY = threeTransformControls.axis.includes('Y');
                const isMovingOnZ = threeTransformControls.axis.includes('Z');
                if (this._editorGrid.isSpanningEnabled(inputManager)) {
                  if (isMovingOnX) {
                    translationX =
                      this._editorGrid.getSnappedX(
                        initialObjectX + translationX
                      ) - initialObjectX;
                  }
                  if (isMovingOnY) {
                    translationY =
                      this._editorGrid.getSnappedY(
                        initialObjectY + translationY
                      ) - initialObjectY;
                  }
                  if (isMovingOnZ) {
                    translationZ =
                      this._editorGrid.getSnappedZ(
                        initialObjectZ + translationZ
                      ) - initialObjectZ;
                  }
                }
              }
              // 0.2 = 20% of the movement speed (Three.js transform controls scaling is too fast)
              const scaleDamping =
                threeTransformControls.axis &&
                threeTransformControls.axis.length === 1
                  ? 1
                  : 0.2;
              this._selectionControlsMovementTotalDelta = {
                translationX,
                translationY,
                translationZ,
                rotationX: gdjs.toDegrees(
                  dummyThreeObject.rotation.x - initialDummyRotation.x
                ),
                rotationY: -gdjs.toDegrees(
                  dummyThreeObject.rotation.y - initialDummyRotation.y
                ),
                rotationZ: -gdjs.toDegrees(
                  dummyThreeObject.rotation.z - initialDummyRotation.z
                ),
                scaleX:
                  1 +
                  (dummyThreeObject.scale.x / initialDummyScale.x - 1) *
                    scaleDamping,
                scaleY:
                  1 +
                  (dummyThreeObject.scale.y / initialDummyScale.y - 1) *
                    scaleDamping,
                scaleZ:
                  1 +
                  (dummyThreeObject.scale.z / initialDummyScale.z - 1) *
                    scaleDamping,
              };

              this._hasSelectionActuallyMoved =
                this._hasSelectionActuallyMoved ||
                !dummyThreeObject.position.equals(initialDummyPosition) ||
                !dummyThreeObject.rotation.equals(initialDummyRotation) ||
                !dummyThreeObject.scale.equals(initialDummyScale);
            });

            this._selectionControls = {
              object: lastEditableSelectedObject,
              dummyThreeObject,
              threeTransformControls,
            };
          }
        }
      }

      if (
        lastEditableSelectedObject &&
        this._selectionControls &&
        !this._draggedNewObject &&
        !this._draggedSelectedObject
      ) {
        const { threeTransformControls } = this._selectionControls;
        const axis = threeTransformControls.axis;
        if (axis) {
          const isMovingOnX = axis ? axis.includes('X') : false;
          const isMovingOnY = axis ? axis.includes('Y') : false;
          const isMovingOnZ = axis ? axis.includes('Z') : false;
          let gridNormal: 'X' | 'Y' | 'Z' = 'Z';
          if (isMovingOnZ) {
            if (!isMovingOnX && !isMovingOnY) {
              // Choose the plan that faces the camera.
              const cameraRotation = Math.abs(
                gdjs.evtTools.common.angleDifference(
                  this._editorCamera.getCameraRotation(),
                  0
                )
              );
              if (cameraRotation <= 45 || cameraRotation > 135) {
                gridNormal = 'Y';
              } else {
                gridNormal = 'X';
              }
            } else if (!isMovingOnX) {
              gridNormal = 'X';
            } else if (!isMovingOnY) {
              gridNormal = 'Y';
            }
          }
          this._editorGrid.setNormal(gridNormal);
        }
        this._editorGrid.setPosition(
          lastEditableSelectedObject.getX(),
          lastEditableSelectedObject.getY(),
          is3D(lastEditableSelectedObject)
            ? lastEditableSelectedObject.getZ()
            : 0
        );
        const cameraLayer = this.getCameraLayer(
          lastEditableSelectedObject.getLayer()
        );
        const threeScene = cameraLayer
          ? cameraLayer.getRenderer().getThreeScene()
          : null;
        if (threeScene) {
          this._editorGrid.setTreeScene(threeScene);
        }
        this._editorGrid.setVisible(
          threeTransformControls.mode === 'translate'
        );
      }
    }

    private _updateDummyLocation(
      dummyThreeObject: THREE.Object3D,
      lastEditableSelectedObject: gdjs.RuntimeObject,
      threeTransformControls: THREE_ADDONS.TransformControls
    ) {
      const threeObject = lastEditableSelectedObject.get3DRendererObject();
      if (!threeObject) return;
      dummyThreeObject.position.copy(threeObject.position);
      dummyThreeObject.rotation.copy(threeObject.rotation);
      dummyThreeObject.scale.copy(threeObject.scale);
      if (threeTransformControls.mode === 'rotate') {
        // This is only done for the rotate mode because it messes with the
        // orientation of the scale mode.
        dummyThreeObject.rotation.y = -dummyThreeObject.rotation.y;
        dummyThreeObject.rotation.z = -dummyThreeObject.rotation.z;

        dummyThreeObject.position.set(
          lastEditableSelectedObject.getCenterXInScene(),
          lastEditableSelectedObject.getCenterYInScene(),
          is3D(lastEditableSelectedObject)
            ? lastEditableSelectedObject.getCenterZInScene()
            : 0
        );
      } else {
        dummyThreeObject.position.set(
          lastEditableSelectedObject.getX(),
          lastEditableSelectedObject.getY(),
          is3D(lastEditableSelectedObject)
            ? lastEditableSelectedObject.getZ()
            : 0
        );
      }
    }

    private _removeSelectionControls(): void {
      if (!this._selectionControls) {
        return;
      }
      this._selectionControls.threeTransformControls.detach();
      this._selectionControls.threeTransformControls.removeFromParent();
      this._selectionControls.dummyThreeObject.removeFromParent();
      this._editorGrid.setVisible(false);
      this._selectionControls = null;
    }

    activate(enable: boolean) {
      if (enable) {
        // Nothing to do.
      } else {
        this._runtimeGame.getSoundManager().unmuteEverything('in-game-editor');
        this._removeSelectionControls();

        // Cleanup selection boxes
        this._selectionBoxes.forEach((box) => {
          box.removeFromParent();
        });
        this._selectionBoxes.clear();
      }
    }

    setVisibleStatus(visible: boolean) {
      this._isVisible = visible;
    }

    private _sendSelectionUpdate(options?: {
      hasSelectedObjectBeenModified?: boolean;
      isSendingBackSelectionForDefaultSize?: boolean;
      addedObjects?: Array<gdjs.RuntimeObject>;
      removedObjects?: Array<gdjs.RuntimeObject>;
      objectToEdit?: gdjs.RuntimeObject | null;
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
        objectNameToEdit: options && options.objectToEdit ? options.objectToEdit.getName() : null,
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
        this._hasCursorStayedStillWhilePressed({ toleranceRadius: 0 })
      ) {
        this._sendOpenContextMenu(
          inputManager.getCursorX(),
          inputManager.getCursorY()
        );
      }
    }

    private _hasCursorStayedStillWhilePressed({
      toleranceRadius,
    }: {
      toleranceRadius: float;
    }) {
      const inputManager = this._runtimeGame.getInputManager();
      const deltaX = Math.abs(
        this._pressedOriginalCursorX - inputManager.getCursorX()
      );
      const deltaY = Math.abs(
        this._pressedOriginalCursorY - inputManager.getCursorY()
      );
      return (
        deltaX * deltaX + deltaY * deltaY <= toleranceRadius * toleranceRadius
      );
    }

    private _sendOpenContextMenu(cursorX: float, cursorY: float) {
      const debuggerClient = this._runtimeGame._debuggerClient;
      if (!debuggerClient) return;

      debuggerClient.sendOpenContextMenu(cursorX, cursorY);
    }

    private _handleShortcuts() {
      const inputManager = this._runtimeGame.getInputManager();
      let alreadyHandledShortcut = false;
      if (isControlPressedOnly(inputManager)) {
        // Note: use `wasKeyJustPressed` instead of `wasKeyReleased` to avoid
        // macOS stealing the key release ("key up") information
        // when the "Meta" key is pressed.
        if (inputManager.wasKeyJustPressed(Z_KEY)) {
          this._sendUndo();
          alreadyHandledShortcut = true;
        } else if (inputManager.wasKeyJustPressed(Y_KEY)) {
          this._sendRedo();
          alreadyHandledShortcut = true;
        } else if (inputManager.wasKeyJustPressed(C_KEY)) {
          this._sendCopy();
          alreadyHandledShortcut = true;
        } else if (inputManager.wasKeyJustPressed(V_KEY)) {
          this._sendPaste();
          alreadyHandledShortcut = true;
        } else if (inputManager.wasKeyJustPressed(X_KEY)) {
          this._sendCut();
          alreadyHandledShortcut = true;
        }
      }
      if (isControlPlusShiftPressedOnly(inputManager)) {
        if (inputManager.wasKeyJustPressed(Z_KEY)) {
          this._sendRedo();
          alreadyHandledShortcut = true;
        }
      }

      // Send the shortcut to the editor (as the iframe does not bubble up
      // the event to the parent window).
      if (!alreadyHandledShortcut) {
        this._forwardShortcutsToEditor(inputManager);
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

    private _forwardShortcutsToEditor(inputManager: gdjs.InputManager) {
      const isCtrlPressed =
        inputManager.isKeyPressed(LEFT_CTRL_KEY) ||
        inputManager.isKeyPressed(RIGHT_CTRL_KEY);
      const isMetaPressed =
        inputManager.isKeyPressed(LEFT_META_KEY) ||
        inputManager.isKeyPressed(RIGHT_META_KEY);
      const isShiftKeyPressed = isShiftPressed(inputManager);
      const isAltKeyPressed = isAltPressed(inputManager);

      if (
        !isCtrlPressed &&
        !isMetaPressed &&
        !isAltKeyPressed &&
        !isShiftKeyPressed
      ) {
        return;
      }

      for (const locationAwareKeyCode of this._runtimeGame
        .getInputManager()
        .exceptionallyGetAllJustPressedKeys()) {
        const keyCode =
          exceptionallyGetKeyCodeFromLocationAwareKeyCode(locationAwareKeyCode);

        const debuggerClient = this._runtimeGame._debuggerClient;
        if (debuggerClient) {
          debuggerClient.sendKeyboardShortcut({
            keyCode,
            metaKey: isMetaPressed,
            ctrlKey: isCtrlPressed,
            altKey: isAltKeyPressed,
            shiftKey: isShiftKeyPressed,
          });
        }
      }
    }

    cancelDragNewInstance() {
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      if (this._draggedNewObject) {
        this._draggedNewObject.deleteFromScene();
        this._draggedNewObject = null;
      }
      this._editorGrid.setVisible(false);
    }

    dragNewInstance({
      name,
      dropped,
      isAltPressed,
    }: {
      name: string;
      dropped: boolean;
      isAltPressed: boolean;
    }) {
      const currentScene = this._currentScene;
      if (!currentScene) return;
      const editedInstanceContainer = this.getEditedInstanceContainer();
      if (!editedInstanceContainer) return;

      const selectedLayer = this.getEditorLayer(this._selectedLayerName);
      if (!selectedLayer) return;

      const inputManager = this._runtimeGame.getInputManager();

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

      // We don't update the object position when it's dropped because it makes
      // the object shift a bit.
      // It seems that newIDE doesn't send the last cursor position even when
      // the cursor stay still for several frames. The right position is only
      // sent it when the object is dropped which make the shift.
      // To reproduce the issue:
      // - remove the `if`
      // - drag the object vertically very fast
      // - stay still
      // - drop the object
      if (!dropped) {
        let isCursorFound = false;
        let cursorX = 0;
        let cursorY = 0;
        let cursorZ = 0;
        if (is3D(this._draggedNewObject)) {
          const cursor = this._getCursorIn3D([this._draggedNewObject]);
          if (cursor) {
            [cursorX, cursorY, cursorZ] = cursor;
            isCursorFound = true;
          }
        } else {
          const projectedCursor = this._getProjectedCursor();
          if (projectedCursor) {
            [cursorX, cursorY] = projectedCursor;
            isCursorFound = true;
          }
        }
        if (isCursorFound) {
          this._editorGrid.setNormal('Z');
          this._editorGrid.setPosition(cursorX, cursorY, cursorZ);
          const cameraLayer = this.getCameraLayer(
            this._draggedNewObject.getLayer()
          );
          const threeScene = cameraLayer
            ? cameraLayer.getRenderer().getThreeScene()
            : null;
          if (threeScene) {
            this._editorGrid.setTreeScene(threeScene);
          }
          this._editorGrid.setVisible(true);
          if (this._editorGrid.isSpanningEnabled(inputManager, isAltPressed)) {
            cursorX = this._editorGrid.getSnappedX(cursorX);
            cursorY = this._editorGrid.getSnappedY(cursorY);
          }
          // TODO The object Z should be changed according to the new X and Y
          // to match the ground.
          this._draggedNewObject.setX(Math.round(cursorX));
          this._draggedNewObject.setY(Math.round(cursorY));
          // We don't round on Z because if cubes are stacked and there depth
          // is not round it would leave an interstice between them.
          if (is3D(this._draggedNewObject)) {
            this._draggedNewObject.setZ(cursorZ);
          }
        }
      }

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
          this._sendSelectionUpdate({
            addedObjects: [this._draggedNewObject],
          });
        }

        this._draggedNewObject = null;
        return;
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
      const { forward } = getCameraForwardVector(threeCamera);
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
      this._selectionBoxes.forEach((box) => box.setLayer(1));
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
      this._selectionBoxes.forEach((box) => box.setLayer(0));
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
    ): Point3D | null {
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
      if (!closestIntersect) {
        const editedInstanceContainer = this.getEditedInstanceContainer();
        if (!editedInstanceContainer) {
          return null;
        }
        const cursor = this._getCursorIn3D();
        if (!cursor || cursor[2] !== 0) {
          return null;
        }
        let topObject2D: gdjs.RuntimeObject | null = null;
        let topLayer: gdjs.RuntimeLayer | null = null;
        let topLayerIndex = 0;
        for (const object of editedInstanceContainer.getAdhocListOfAllInstances()) {
          if (is3D(object) || !object.cursorOnObject()) {
            continue;
          }
          const layer = editedInstanceContainer.getLayer(object.getLayer());
          const layerIndex =
            editedInstanceContainer._orderedLayers.indexOf(layer);
          if (
            !topObject2D ||
            layerIndex > topLayerIndex ||
            (layer === topLayer && object.getZOrder() > topObject2D.getZOrder())
          ) {
            topObject2D = object;
            topLayer = layer;
            topLayerIndex = layerIndex;
          }
        }
        return topObject2D;
      }
      return this._getObject3D(closestIntersect.object);
    }

    private _getObject3D(
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

    private _updateMouseCursor() {
      const mouseCursor = this._getEditorCamera().getRequestedMouseCursor();

      const canvas = this._runtimeGame.getRenderer().getCanvas();
      if (canvas) {
        canvas.style.cursor = mouseCursor || 'default';
      }
    }

    private _handleTransformControlsMode() {
      const inputManager = this._runtimeGame.getInputManager();
      if (inputManager.wasKeyJustPressed(KEY_DIGIT_1)) {
        this._setTransformControlsMode('translate');
      } else if (inputManager.wasKeyJustPressed(KEY_DIGIT_2)) {
        this._setTransformControlsMode('rotate');
      } else if (inputManager.wasKeyJustPressed(KEY_DIGIT_3)) {
        this._setTransformControlsMode('scale');
      }
    }

    updateTargetFramerate(elapsedTime: float) {
      const inputManager = this._runtimeGame.getInputManager();
      if (
        inputManager.anyKeyPressed() ||
        inputManager.anyMouseButtonPressed() ||
        inputManager.getAllTouchIdentifiers().length > 0 ||
        inputManager.getMouseWheelDelta() !== 0 ||
        inputManager.getMouseWheelDeltaX() !== 0 ||
        inputManager.getMouseWheelDeltaZ() !== 0
      ) {
        this._timeSinceLastInteraction = 0;
      }
      if (this._draggedNewObject) {
        this._timeSinceLastInteraction = 0;
      }
      this._timeSinceLastInteraction += elapsedTime;

      // Adapt the framerate to avoid consuming too much CPU when the editor is not visible
      // or not interacted with.
      if (!this._isVisible) {
        this._runtimeGame.setMaximumFps(0.3);
      } else {
        if (this._timeSinceLastInteraction > 1000) {
          this._runtimeGame.setMaximumFps(10);
        } else {
          this._runtimeGame.setMaximumFps(60);
        }
      }
    }

    updateAndRender() {
      const objectUnderCursor: gdjs.RuntimeObject | null =
        this.getObjectUnderCursor();

      this._runtimeGame.getSoundManager().muteEverything('in-game-editor');

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

      if (!this._selectionControls) {
        this._isTransformControlsHovered = false;
      } else if (
        this._previousCursorX !== inputManager.getMouseX() ||
        this._previousCursorY !== inputManager.getMouseY()
      ) {
        this._isTransformControlsHovered =
          !!this._selectionControls.threeTransformControls.axis;
      }

      this._handleTransformControlsMode();
      this._handleCameraMovement();
      this._handleSelectedObjectDragging();
      this._handleSelectionMovement();
      this._updateSelectionBox();
      this._handleSelection({ objectUnderCursor });
      this._updateSelectionOutline({ objectUnderCursor });
      // Custom objects only update their position at the end of the frame
      // because they don't override position setters like built-in objects do.
      // Since the instance position is not yet set when `onCreated` is called,
      // they will be at (0; 0; 0) during the 1st step.
      // When they are selected and `switchToSceneOrVariant` has just been
      // called, it avoid to put the control at (0; 0; 0).
      if (!this._isFirstFrame) {
        this._updateSelectionControls();
      }
      this._updateInnerAreaOutline();
      this._handleContextMenu();
      this._handleShortcuts();
      this._updateMouseCursor();

      const domElementContainer = this._runtimeGame
        .getRenderer()
        .getDomElementContainer();
      if (domElementContainer) {
        this._toolbar.render(domElementContainer);
      }

      this._wasMovingSelectionLastFrame =
        !!this._selectionControlsMovementTotalDelta;
      if (!this._selectionControlsMovementTotalDelta) {
        this._hasSelectionActuallyMoved = false;
      }
      this._wasMouseLeftButtonPressed = inputManager.isMouseButtonPressed(0);
      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);
      this._previousCursorX = inputManager.getMouseX();
      this._previousCursorY = inputManager.getMouseY();

      if (this._currentScene) {
        this._currentScene._updateObjectsForInGameEditor();
        this._currentScene.render();
      }
      this._isFirstFrame = false;
    }

    private _getEditorCamera(): EditorCamera {
      return this._editorCamera;
    }
  }

  class Toolbar {
    private _renderedElements: {
      container: HTMLDivElement;
      moveButton: HTMLButtonElement;
      rotateButton: HTMLButtonElement;
      scaleButton: HTMLButtonElement;
      freeCameraButton: HTMLButtonElement;
      orbitCameraButton: HTMLButtonElement;
    } | null = null;
    private _parent: HTMLElement | null = null;
    private _getTransformControlsMode: () =>
      | 'translate'
      | 'rotate'
      | 'scale'
      | null;
    private _setTransformControlsMode: (
      mode: 'translate' | 'rotate' | 'scale'
    ) => void;
    private _focusOnSelection: () => void;
    private _switchToFreeCamera: () => void;
    private _switchToOrbitCamera: () => void;
    private _isFreeCamera: () => boolean;
    private _getSvgIconUrl: (iconName: string) => string;
    private _hasSelectionControlsShown: () => boolean;

    private addOrUpdateToolbarStyle() {
      const id = 'InGameEditor-Toolbar-Style';

      let styleElement = document.getElementById(id);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'InGameEditor-Toolbar-Style';
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = `
        .InGameEditor-Toolbar-Centering-Container {
          position: fixed;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;

          transition: transform 0.1s ease-in-out;
        }
        .InGameEditor-Toolbar-Container {
          position: relative;
          pointer-events: all;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          top: 2px;
          border-radius: 3px;
          padding: 4px;
          gap: 6px;
        }
        .InGameEditor-Toolbar-Container-Background {
          position: absolute;
          inset: 0;
          background-color: var(--in-game-editor-theme-toolbar-background-color);
          opacity: 0.5;
          border-radius: 3px;
          z-index: -1;
        }
        .InGameEditor-Toolbar-Button {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: none;
          padding: 0;
          border-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;

          background-color: transparent;
        }
        .InGameEditor-Toolbar-Button-Icon {
          width: 20px;
          height: 20px;
          display:inline-block;
          background-color: var(--in-game-editor-theme-text-color-primary);
        }
        .InGameEditor-Toolbar-Button:hover:not(.InGameEditor-Toolbar-Button-Active):not(.InGameEditor-Toolbar-Button-Disabled) {
          background-color: rgba(255, 255, 255, 0.08);
        }
        .InGameEditor-Toolbar-Button-Active {
          background-color: var(--in-game-editor-theme-icon-button-selected-background-color);
        }
        .InGameEditor-Toolbar-Button-Active .InGameEditor-Toolbar-Button-Icon {
          background-color: var(--in-game-editor-theme-icon-button-selected-color);
        }
        .InGameEditor-Toolbar-Divider {
          width: 1px;
          height: 24px;
          background-color: var(--in-game-editor-theme-toolbar-separator-color);
        }
      `;
    }

    constructor({
      getTransformControlsMode,
      setTransformControlsMode,
      focusOnSelection,
      switchToFreeCamera,
      switchToOrbitCamera,
      isFreeCamera,
      getSvgIconUrl,
      hasSelectionControlsShown,
    }: {
      getTransformControlsMode: () => 'translate' | 'rotate' | 'scale' | null;
      setTransformControlsMode: (
        mode: 'translate' | 'rotate' | 'scale'
      ) => void;
      focusOnSelection: () => void;
      switchToFreeCamera: () => void;
      switchToOrbitCamera: () => void;
      isFreeCamera: () => boolean;
      getSvgIconUrl: (iconName: string) => string;
      hasSelectionControlsShown: () => boolean;
    }) {
      this._getTransformControlsMode = getTransformControlsMode;
      this._setTransformControlsMode = setTransformControlsMode;
      this._focusOnSelection = focusOnSelection;
      this._switchToFreeCamera = switchToFreeCamera;
      this._switchToOrbitCamera = switchToOrbitCamera;
      this._isFreeCamera = isFreeCamera;
      this._getSvgIconUrl = getSvgIconUrl;
      this._hasSelectionControlsShown = hasSelectionControlsShown;

      this.addOrUpdateToolbarStyle();
    }

    render(parent: HTMLElement) {
      if (this._renderedElements && this._parent !== parent) {
        this._renderedElements.container.remove();
        this._renderedElements = null;
      }
      this._parent = parent;

      const makeIcon = ({ svgIconUrl }: { svgIconUrl: string }) => (
        <span
          class="InGameEditor-Toolbar-Button-Icon"
          style={{
            '-webkit-mask': `url('${svgIconUrl}') center/contain no-repeat`,
            mask: `url('${svgIconUrl}') center/contain no-repeat`,
          }}
        ></span>
      );

      if (!this._renderedElements) {
        const container = (
          <div class="InGameEditor-Toolbar-Centering-Container">
            <div class="InGameEditor-Toolbar-Container">
              <div class="InGameEditor-Toolbar-Container-Background" />
              <button
                class="InGameEditor-Toolbar-Button"
                id="free-camera-button"
                onClick={this._switchToFreeCamera}
                title="Free camera mode"
              >
                {makeIcon({
                  svgIconUrl: this._getSvgIconUrl(
                    'InGameEditor-FreeCameraIcon'
                  ),
                })}
              </button>
              <button
                class="InGameEditor-Toolbar-Button"
                id="orbit-camera-button"
                onClick={this._switchToOrbitCamera}
                title="Orbit camera mode"
              >
                {makeIcon({
                  svgIconUrl: this._getSvgIconUrl(
                    'InGameEditor-OrbitCameraIcon'
                  ),
                })}
              </button>
              <div class="InGameEditor-Toolbar-Divider" />
              <button
                class="InGameEditor-Toolbar-Button"
                id="move-button"
                onClick={() => this._setTransformControlsMode('translate')}
                title="Move (translate) selection (1)"
              >
                {makeIcon({
                  svgIconUrl: this._getSvgIconUrl('InGameEditor-MoveIcon'),
                })}
              </button>
              <button
                class="InGameEditor-Toolbar-Button"
                id="rotate-button"
                onClick={() => this._setTransformControlsMode('rotate')}
                title="Rotate selection (2)"
              >
                {makeIcon({
                  svgIconUrl: this._getSvgIconUrl('InGameEditor-RotateIcon'),
                })}
              </button>
              <button
                class="InGameEditor-Toolbar-Button"
                id="scale-button"
                onClick={() => this._setTransformControlsMode('scale')}
                title="Resize selection (3)"
              >
                {makeIcon({
                  svgIconUrl: this._getSvgIconUrl('InGameEditor-ResizeIcon'),
                })}
              </button>
              <div class="InGameEditor-Toolbar-Divider" />
              <button
                class="InGameEditor-Toolbar-Button"
                id="focus-button"
                onClick={this._focusOnSelection}
                title="Focus on selection (F)"
              >
                {makeIcon({
                  svgIconUrl: this._getSvgIconUrl('InGameEditor-FocusIcon'),
                })}
              </button>
            </div>
          </div>
        );
        this._parent.appendChild(container);

        this._renderedElements = {
          container,
          moveButton: container.querySelector('#move-button')!,
          rotateButton: container.querySelector('#rotate-button')!,
          scaleButton: container.querySelector('#scale-button')!,
          freeCameraButton: container.querySelector('#free-camera-button')!,
          orbitCameraButton: container.querySelector('#orbit-camera-button')!,
        };
      }

      const displayed = this._hasSelectionControlsShown();

      this._renderedElements.container.tabIndex = displayed ? 0 : -1;
      this._renderedElements.container.style.transform = displayed
        ? 'translateY(0)'
        : 'translateY(-50px)';

      const transformControlsMode = this._getTransformControlsMode();
      this._renderedElements.freeCameraButton.classList.toggle(
        'InGameEditor-Toolbar-Button-Active',
        this._isFreeCamera()
      );
      this._renderedElements.orbitCameraButton.classList.toggle(
        'InGameEditor-Toolbar-Button-Active',
        !this._isFreeCamera()
      );
      this._renderedElements.moveButton.classList.toggle(
        'InGameEditor-Toolbar-Button-Active',
        transformControlsMode === 'translate'
      );
      this._renderedElements.rotateButton.classList.toggle(
        'InGameEditor-Toolbar-Button-Active',
        transformControlsMode === 'rotate'
      );
      this._renderedElements.scaleButton.classList.toggle(
        'InGameEditor-Toolbar-Button-Active',
        transformControlsMode === 'scale'
      );
    }
  }

  class EditorGrid {
    editor: gdjs.InGameEditor;
    gridHelper: THREE.GridHelper;
    isVisible = true;
    normal: 'Z' | 'Y' | 'X' = 'Z';
    position = new THREE.Vector3();

    isForcefullyHidden = true;
    gridWidth: float = 0;
    gridHeight: float = 0;
    gridDepth: float = 0;
    gridOffsetX: float = 0;
    gridOffsetY: float = 0;
    gridOffsetZ: float = 0;
    gridColor: integer = 0;
    gridAlpha: float = 1;
    isSnappingEnabledByDefault = false;
    threeScene: THREE.Scene | null = null;

    constructor(editor: gdjs.InGameEditor) {
      this.editor = editor;
      this.gridHelper = new THREE.GridHelper();
    }

    setSettings(instancesEditorSettings: InstancesEditorSettings): void {
      this.isForcefullyHidden = !instancesEditorSettings.grid;
      this.gridWidth = instancesEditorSettings.gridWidth || 0;
      this.gridHeight = instancesEditorSettings.gridHeight || 0;
      this.gridDepth =
        instancesEditorSettings.gridDepth === undefined
          ? 32
          : instancesEditorSettings.gridDepth;
      this.gridOffsetX = instancesEditorSettings.gridOffsetX || 0;
      this.gridOffsetY = instancesEditorSettings.gridOffsetY || 0;
      this.gridOffsetZ = instancesEditorSettings.gridOffsetZ || 0;
      this.gridColor = instancesEditorSettings.gridColor;
      this.gridAlpha = instancesEditorSettings.gridAlpha;
      this.isSnappingEnabledByDefault = instancesEditorSettings.snap;
      this.rebuildGrid();
    }

    private rebuildGrid(): void {
      this.gridHelper.removeFromParent();
      this.gridHelper.dispose();
      this.gridHelper = new THREE.GridHelper(
        10,
        10,
        this.gridColor,
        this.gridColor
      );
      this.gridHelper.material.transparent = true;
      this.gridHelper.material.opacity = this.gridAlpha;
      this.gridHelper.rotation.order = 'ZYX';
      this.updateVisibility();
      this.updateLocation();
      if (this.threeScene) {
        this.threeScene.add(this.gridHelper);
      }
    }

    private updateLocation() {
      const { gridWidth, gridHeight, gridDepth } = this;
      const { x, y, z } = this.position;
      if (this.normal === 'X') {
        this.gridHelper.rotation.set(0, 0, Math.PI / 2);
        this.gridHelper.scale.set(gridWidth, 1, gridDepth || 0);
        this.gridHelper.position.set(
          x,
          this.getSnappedY(y),
          this.getSnappedZ(z)
        );
      } else if (this.normal === 'Y') {
        this.gridHelper.rotation.set(0, 0, 0);
        this.gridHelper.scale.set(gridHeight, 1, gridDepth || 0);
        this.gridHelper.position.set(
          this.getSnappedX(x),
          y,
          this.getSnappedZ(z)
        );
      } else {
        this.gridHelper.rotation.set(Math.PI / 2, 0, 0);
        this.gridHelper.scale.set(gridWidth, 1, gridHeight);
        this.gridHelper.position.set(
          this.getSnappedX(x),
          this.getSnappedY(y),
          z
        );
      }
    }

    setTreeScene(threeScene: THREE.Scene): void {
      this.threeScene = threeScene;
      this.gridHelper.removeFromParent();
      threeScene.add(this.gridHelper);
    }

    setVisible(isVisible: boolean): void {
      this.isVisible = isVisible;
      this.updateVisibility();
    }

    private updateVisibility(): void {
      this.gridHelper.visible = this.isVisible && !this.isForcefullyHidden;
    }

    setNormal(normal: 'X' | 'Y' | 'Z') {
      this.normal = normal;
      if (this.normal === 'X') {
        this.gridHelper.rotation.set(0, 0, Math.PI / 2);
      } else if (this.normal === 'Y') {
        this.gridHelper.rotation.set(0, 0, 0);
      } else {
        this.gridHelper.rotation.set(Math.PI / 2, 0, 0);
      }
      this.updateLocation();
    }

    setPosition(x: float, y: float, z: float): void {
      this.position.set(x, y, z);
      this.updateLocation();
    }

    getSnappedX(x: float): float {
      const { gridWidth, gridOffsetX } = this;
      return snap(x, gridWidth, gridOffsetX);
    }

    getSnappedY(y: float): float {
      const { gridHeight, gridOffsetY } = this;
      return snap(y, gridHeight, gridOffsetY);
    }

    getSnappedZ(z: float): float {
      const { gridDepth, gridOffsetY } = this;
      return snap(z, gridDepth || 0, gridOffsetY);
    }

    isSpanningEnabled(
      inputManager: gdjs.InputManager,
      considerAltPressed?: boolean
    ): boolean {
      const altPressed =
        considerAltPressed === undefined
          ? isAltPressed(inputManager)
          : considerAltPressed;
      return this.isSnappingEnabledByDefault !== altPressed;
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

    step(): void {
      const runtimeGame = this.editor.getRuntimeGame();
      const inputManager = runtimeGame.getInputManager();

      const touchIds = getCurrentTouchIdentifiers(inputManager);
      const touchCount = touchIds.length;

      // Always allow to use Space+click to switch to free camera and pan.
      // Display a grab cursor to indicate that.
      this._mouseCursor = null;
      if (isSpacePressed(inputManager)) {
        this._mouseCursor = 'grab';

        // Switch to pan if space + left click is used.
        if (inputManager.isMouseButtonPressed(0) && !this.isFreeCamera()) {
          this.switchToFreeCamera();
        }
      }
      // Also switch to pan if shift + wheel click is used.
      if (
        isShiftPressed(inputManager) &&
        inputManager.isMouseButtonPressed(2) &&
        !this.isFreeCamera()
      ) {
        this.switchToFreeCamera();
      }
      // Shift to orbit if just mouse wheel click is used
      if (
        !isShiftPressed(inputManager) &&
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
        (touchCount === 3 || inputManager.isKeyPressed(O_KEY)) &&
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
      // Set the camera so that it displays the whole PixiJS plane, as if it was a 2D rendering.
      // The Z position is computed by taking the half height of the displayed rendering,
      // and using the angle of the triangle defined by the field of view to compute the length
      // of the triangle defining the distance between the camera and the rendering plane.
      return (
        (0.5 * runtimeGame.getGameResolutionHeight()) /
        zoom /
        Math.tan(0.5 * gdjs.toRad(editorCameraFov))
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
      if (this._isEnabled) {
        // Right click: rotate the camera.
        // Middle click: also rotate the camera.
        if (
          (inputManager.isMouseButtonPressed(1) &&
            // The camera should not move the 1st frame
            this._wasMouseRightButtonPressed) ||
          (inputManager.isMouseButtonPressed(2) &&
            // The camera should not move the 1st frame
            this._wasMouseMiddleButtonPressed)
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
          this.distance = Math.max(
            10,
            this.distance * Math.pow(2, -wheelDeltaY / 512)
          );
          this._editorCamera.onHasCameraChanged();
        }

        // Movement with keyboard: zoom in/out.
        if (isControlOrCmdPressed(inputManager)) {
          if (inputManager.wasKeyJustPressed(EQUAL_KEY)) {
            this.zoomBy(zoomInFactor);
          } else if (inputManager.wasKeyJustPressed(MINUS_KEY)) {
            this.zoomBy(zoomOutFactor);
          }
        }

        // Touch gestures
        const touchIds = getCurrentTouchIdentifiers(inputManager);
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
              if (this.elevationAngle < 5) this.elevationAngle = 5;
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

      this._wasMouseRightButtonPressed = inputManager.isMouseButtonPressed(1);
      this._wasMouseMiddleButtonPressed = inputManager.isMouseButtonPressed(2);
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
        const touchIds = getCurrentTouchIdentifiers(inputManager);
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
        // Either arrow keys (move in the camera plane) or WASD ("FPS move" + Q/E for up/down).
        const moveSpeed = isShiftPressed(inputManager) ? 48 : 6;

        if (
          !isControlOrCmdPressed(inputManager) &&
          !isAltPressed(inputManager)
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

        // Movement with keyboard: zoom in/out.
        if (isControlOrCmdPressed(inputManager)) {
          if (inputManager.wasKeyJustPressed(EQUAL_KEY)) {
            this.zoomBy(zoomInFactor);
          } else if (inputManager.wasKeyJustPressed(MINUS_KEY)) {
            this.zoomBy(zoomOutFactor);
          }
        }

        // Space + click: move the camera on its plane.
        // Shift + Wheel click: same.
        if (
          (isSpacePressed(inputManager) &&
            inputManager.isMouseButtonPressed(0)) ||
          (isShiftPressed(inputManager) && inputManager.isMouseButtonPressed(2))
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
      } else {
        // Reset gesture tracking when camera control is disabled.
        this._gestureActiveTouchIds = [];
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

  class ObjectSelectionBoxHelper {
    object: gdjs.RuntimeObject;
    dummyObject3DForObject2D: THREE.Object3D | null = null;
    boxHelper: THREE.BoxHelper;
    container: THREE.Group;

    constructor(object: gdjs.RuntimeObject) {
      this.object = object;

      let threeObject = object.get3DRendererObject();
      if (!threeObject) {
        threeObject = new THREE.Group();
        threeObject.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial()
          )
        );
        this.dummyObject3DForObject2D = threeObject;
      }
      // Use a group to invert the Y-axis as the GDevelop Y axis is inverted
      // compared to Three.js. This is somehow necessary because the position
      // of the BoxHelper is always (0, 0, 0) and the geometry is hard to manipulate.
      this.container = new THREE.Group();
      this.container.rotation.order = 'ZYX';
      this.container.scale.y = -1;
      this.boxHelper = new THREE.BoxHelper(threeObject, '#f2a63c');
      this.boxHelper.rotation.order = 'ZYX';
      this.boxHelper.material.depthTest = false;
      this.boxHelper.material.fog = false;
      this.container.add(this.boxHelper);
    }

    update() {
      if (this.dummyObject3DForObject2D) {
        this.dummyObject3DForObject2D.position.set(
          this.object.getCenterXInScene(),
          -this.object.getCenterYInScene(),
          0
        );
        this.dummyObject3DForObject2D.scale.set(
          this.object.getWidth() + 2,
          this.object.getHeight() + 2,
          0
        );
      }
      this.boxHelper.update();
    }

    removeFromParent() {
      this.container.removeFromParent();
    }

    setLayer(layer: number): void {
      this.boxHelper.layers.set(layer);
    }

    setColor(color: THREE.ColorRepresentation) {
      this.boxHelper.material.color.set(color);
      this.boxHelper.material.needsUpdate = true;
    }
  }

  /**
   * A 3D object placeholder that is used as a fall back when the object type
   * is not known.
   */
  class UnknownRuntimeObject extends gdjs.RuntimeObject3D {
    _renderer: UnknownRuntimeObjectRenderer;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: gdjs.Object3DData
    ) {
      super(instanceContainer, objectData);
      this._renderer = new UnknownRuntimeObjectRenderer(
        this,
        instanceContainer
      );
    }

    override getRenderer(): gdjs.RuntimeObject3DRenderer {
      return this._renderer;
    }

    override onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroyed();
    }
  }
  gdjs.registerObject('', UnknownRuntimeObject);

  class UnknownRuntimeObjectRenderer extends gdjs.RuntimeObject3DRenderer {
    private _threeObject: THREE.Mesh;

    constructor(
      runtimeObject: UnknownRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        runtimeObject
          .getInstanceContainer()
          .getGame()
          .getImageManager()
          .getThreeMaterial('', {
            useTransparentTexture: false,
            forceBasicMaterial: true,
            vertexColors: false,
          })
      );
      super(runtimeObject, instanceContainer, cube);
      this._threeObject = cube;
      this.updateSize();
      this.updatePosition();
      this.updateRotation();
    }

    onDestroyed(): void {
      this._threeObject.removeFromParent();
      this._threeObject.geometry.dispose();
    }
  }
}
