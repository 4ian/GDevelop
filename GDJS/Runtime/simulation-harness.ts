/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('SimulationHarness');

  const MAX_CONSOLE_LOGS = 50;
  const MAX_CONSOLE_LOG_LENGTH = 300;

  export type SimObjectState = {
    /** The GDevelop object type name (e.g. 'Player', 'Coin'). */
    objectName: string;
    /**
     * Unique numeric instance ID — stable for the lifetime of the instance.
     * Use this to track a specific instance across frames:
     *   const tower = harness.getObjects('Tower')[0];
     *   // ... later:
     *   const same = harness.getObjects('Tower').find(t => t.id === tower.id);
     */
    id: number;
    // --- Common fields (all objects) ---
    x: number;
    y: number;
    /** Z position. 0 for 2D objects. */
    z: number;
    angle: number;
    width: number;
    height: number;
    /** Z size. 0 for 2D objects. */
    depth: number;
    layer: string;
    hidden: boolean;
    /** Rotation around the X axis in degrees (pitch). 0 for 2D objects. */
    rotationX: number;
    /** Rotation around the Y axis in degrees (roll). 0 for 2D objects. */
    rotationY: number;
    /** Named points in world coordinates. Always includes Origin and Center. Sprites also expose custom named points. */
    points: { [name: string]: { x: number; y: number } };
    /** Object variables as a {name: value} dict. */
    variables: { [name: string]: any };
    /** Behavior state by behavior name, e.g. behaviors.Platformer.currentSpeed */
    behaviors: { [behaviorName: string]: { [key: string]: any } };
    // --- Type-specific fields (present on relevant object types) ---
    /**
     * Sprite/3D model animation state.
     * For Sprite: { animationName, animationIndex, frameIndex, speedScale, paused, ... }
     * For Model3D: { animationIndex, animationSpeedScale, animationPaused, ... }
     */
    animation?: any;
    /**
     * Text content for Text, BBText, BitmapText, and TextInput objects.
     *   harness.getObjects('QuestionText')[0].text  // → "What is 2+2?"
     */
    text?: string;
    /** Opacity 0–255 for objects that support it (Sprite, Text, etc.). */
    opacity?: number;
    /** Any other type-specific properties from getNetworkSyncData (useFullNames). */
    [key: string]: any;
  };

  export type SimNearbyObjectState = SimObjectState & {
    /** Straight-line distance from the reference object's center to this object's center (3D). */
    distance: number;
    /** Horizontal offset: negative = this object is to the left, positive = to the right. */
    relativeX: number;
    /** Vertical offset: negative = this object is above (lower Y in screen space), positive = below. */
    relativeY: number;
    /** Depth offset (3D only): negative = closer to camera, positive = further away. */
    relativeZ: number;
    /** True if this object's center is above the reference object's center. */
    above: boolean;
    /** True if this object's center is below the reference object's center. */
    below: boolean;
    /** True if this object's center is to the left of the reference object's center. */
    left: boolean;
    /** True if this object's center is to the right of the reference object's center. */
    right: boolean;
    /**
     * Angle from the reference object's center to this object's center, in degrees.
     * Follows the same convention as obj.angle: 0 = right, 90 = down, 180/-180 = left, -90 = up.
     * Compare against the reference object's angle to know if this object is roughly in front.
     */
    bearingFromReference: number;
  };

  export type NavigationHint = {
    /**
     * Move left (world-space X) to get closer to the target.
     * For rotation-steered objects (cars, 3D characters) prefer shouldTurnLeft/shouldTurnRight.
     */
    shouldMoveLeft: boolean;
    /**
     * Move right (world-space X) to get closer to the target.
     * For rotation-steered objects (cars, 3D characters) prefer shouldTurnLeft/shouldTurnRight.
     */
    shouldMoveRight: boolean;
    /** Move up to get closer to the target (top-down games). */
    shouldMoveUp: boolean;
    /** Move down to get closer to the target (top-down games). */
    shouldMoveDown: boolean;
    /**
     * The target is meaningfully above the reference object (platformer games).
     * True when relativeY < -jumpThreshold. Tune jumpThreshold in getNavigationHint options.
     */
    shouldJump: boolean;
    /** True when distanceTo <= reachRadius (target is considered reached). */
    reached: boolean;
    /** Center-to-center distance in pixels (3D). */
    distanceTo: number;
    /** World position of the target's center. */
    targetX: number;
    targetY: number;
    targetZ: number;
    /** Signed offset from reference center to target center. */
    relativeX: number;
    relativeY: number;
    relativeZ: number;
    /**
     * Signed angle (degrees) between the object's current facing and the direction toward the target.
     * Negative = target is to the left, positive = to the right. Normalized to [-180, 180].
     * For 3D objects, computed in the horizontal plane (yaw only, Z ignored).
     */
    angleDiff: number;
    /**
     * True when the object needs to rotate counter-clockwise to face the target.
     * Use instead of shouldMoveLeft for rotation-steered objects (cars, 3D characters).
     */
    shouldTurnLeft: boolean;
    /**
     * True when the object needs to rotate clockwise to face the target.
     * Use instead of shouldMoveRight for rotation-steered objects (cars, 3D characters).
     */
    shouldTurnRight: boolean;
    /**
     * Signed angle (degrees) between the object's current vertical aim and the direction toward
     * the target in the vertical plane. Negative = target is below, positive = target is above.
     * Normalized to [-180, 180]. Zero for 2D objects (no getRotationX available).
     * Only meaningful for 3D games where the object can look up/down.
     */
    pitchDiff: number;
    /** True when the object needs to look/aim upward to face the target. */
    shouldLookUp: boolean;
    /** True when the object needs to look/aim downward to face the target. */
    shouldLookDown: boolean;
    /**
     * The axis with the larger absolute offset to the target ('x' or 'y').
     * Use this when the movement behavior has AllowDiagonals disabled: only press the
     * key for the dominant axis each frame to avoid conflicting inputs that cancel movement.
     */
    dominantAxis: 'x' | 'y';
  };

  export type SimEvent =
    | { frame: number; event: 'spawned'; object: string }
    | { frame: number; event: 'removed'; object: string }
    | {
        frame: number;
        event: 'stuck';
        object: string;
        x: number;
        y: number;
        z: number;
        duration: number;
      };

  export type SimulationResult = {
    passed: boolean;
    framesExecuted: number;
    errors: string[];
    assertions: Array<{ message: string; passed: boolean }>;
    objectStates: { [objectName: string]: SimObjectState[] };
    sceneVariables: { [name: string]: any };
    consoleLogs: Array<{ level: string; message: string }>;
    eventLog: SimEvent[];
  };

  /**
   * A harness used by the AI to run scripted simulations against a running game.
   * Provides synchronous frame-stepping, input injection, state inspection, and assertions.
   * @category Debugging > Simulation
   */
  export class SimulationHarness {
    private _game: gdjs.RuntimeGame;
    private _assertions: Array<{ message: string; passed: boolean }> = [];
    private _errors: string[] = [];
    private _framesExecuted: number = 0;
    private _consoleLogs: Array<{ level: string; message: string }> = [];
    private _droppedConsoleLogs: number = 0;
    private _failed: boolean = false;

    private _eventLog: SimEvent[] = [];
    private _prevObjectIds: Map<string, Set<number>> = new Map();
    private _cancelled: boolean = false;
    /** Tracked mouse position so setMouseDelta can compute the next absolute position. */
    private _mouseX: number = 0;
    private _mouseY: number = 0;

    constructor(game: gdjs.RuntimeGame) {
      this._game = game;
      // Fake pointer lock so FPS behaviors process mouse input during simulation.
      // In the iframe, document.pointerLockElement is always null, causing behaviors
      // that gate on isPointerLocked() to silently ignore all mouse movement.
      const renderer = (game as any).getRenderer();
      if (renderer && typeof renderer.isPointerLocked === 'function') {
        renderer.isPointerLocked = () => true;
      }
      // Mute all audio for the duration of the simulation.
      this._game.getSoundManager().muteEverything('simulation');
    }

    /**
     * Cancel the running simulation. Safe to call at any time.
     * The next frame step will throw, causing execute() to exit cleanly.
     */
    cancel(): void {
      this._cancelled = true;
    }

    /**
     * Replace the current scene stack with the specified scene.
     * Waits (with event-loop yields) until the scene is fully loaded,
     * handling async asset loading that may occur on the first use.
     */
    async goToScene(name: string): Promise<void> {
      this._game.getSceneStack().replace({ sceneName: name, clear: true });

      // Wait up to ~5 seconds for async scene/asset loading to complete.
      // Each iteration yields to the JS event loop so loading promises can settle.
      for (let i = 0; i < 300; i++) {
        const current = this._game.getSceneStack().getCurrentScene();
        if (current && current.getName() === name) {
          // Always step a few frames after the scene is confirmed loaded so that
          // first-frame init events (NavMesh building, variable setup, etc.) have
          // run before the caller starts interacting with the game.
          this._framesExecuted = 0;
          this._snapshotObjectIds();
          for (let j = 0; j < 5; j++) {
            await new Promise<void>((r) => setTimeout(r, 0));
            if (this._cancelled) throw new Error('SimulationCancelled');
            this._game.getSceneStack().step(1000 / 60);
            this._game.getInputManager().onFrameEnded();
          }
          this._framesExecuted = 0;
          this._snapshotObjectIds();
          return;
        }
        await new Promise<void>((r) => setTimeout(r, 16));
        if (this._cancelled) throw new Error('SimulationCancelled');
        this._game.getSceneStack().step(1000 / 60);
        this._game.getInputManager().onFrameEnded();
      }

      const currentScene = this._game.getSceneStack().getCurrentScene();
      if (!currentScene || currentScene.getName() !== name) {
        throw new Error(
          `Scene "${name}" could not be loaded. Make sure the scene name is correct.`
        );
      }
      this._framesExecuted = 0;
      this._snapshotObjectIds();
    }

    /**
     * Step the simulation by `count` frames.
     * Yields to the browser every frame so intermediate states are visible.
     * @param count Number of frames to step.
     * @param options.dtMs Elapsed time per frame in milliseconds. Default: 1000/60 (~16.67ms for 60fps).
     * @param options.onFrame Called after each frame is stepped with the current frame index.
     *   Use it to read object state and adjust inputs reactively.
     *   Example: ({ frame }) => { harness.setKeyPressed('ArrowRight', harness.getObjects('Player')[0].x < 200); }
     */
    async stepFrames(
      count: number,
      options?: { dtMs?: number; onFrame?: (state: { frame: number }) => void }
    ): Promise<void> {
      const dtMs = (options && options.dtMs) ?? 1000 / 60;
      const onFrame = options && options.onFrame;
      for (let i = 0; i < count; i++) {
        if (this._cancelled) throw new Error('SimulationCancelled');
        const gameRunning = this._game.getSceneStack().step(dtMs);
        this._game.getInputManager().onFrameEnded();
        this._framesExecuted++;
        this._trackObjectEvents();
        if (onFrame) onFrame({ frame: this._framesExecuted });
        if (!gameRunning) break; // Game called STOP_GAME
        await new Promise<void>((r) => setTimeout(r, 1000 / 60));
      }
    }

    /**
     * Step the simulation one frame at a time until `condition` returns true,
     * or until `maxFrames` frames have been stepped.
     * @param condition A function returning true when the expected state is reached.
     * @param options.maxFrames Maximum number of frames to step before giving up.
     * @param options.onFrame Called after each frame is stepped with the current frame index.
     *   Use it to read object state and adjust inputs reactively.
     * @param options.stuckDetection Fires `onStuck` when an object has not moved enough.
     *   - objectName: the object to watch.
     *   - windowFrames: how many frames to look back (e.g. 30).
     *   - minDisplacement: minimum net displacement (px) expected in that window.
     *   - onStuck: callback fired (at most once per window) when the object is stuck.
     *     Use it to change strategy: reverse direction, jump, etc.
     *   Example: detect Player stuck for 30 frames moving less than 5 px:
     *     stuckDetection: { objectName: 'Player', windowFrames: 30, minDisplacement: 5,
     *       onStuck: ({ frame, x, y }) => harness.setKeyPressed('ArrowLeft', true) }
     * @returns true if the condition was met, false if maxFrames was reached.
     */
    async stepUntil(
      condition: () => boolean,
      options: {
        maxFrames: number;
        onFrame?: (state: { frame: number }) => void;
        stuckDetection?: {
          objectName: string;
          windowFrames: number;
          minDisplacement: number;
          onStuck: (state: {
            frame: number;
            x: number;
            y: number;
            z: number;
          }) => void;
        };
      }
    ): Promise<boolean> {
      const maxFrames = options.maxFrames || 300;
      const onFrame = options.onFrame;
      const stuck = options.stuckDetection;

      // Sliding window of recent positions for stuck detection
      const posHistory: Array<{ x: number; y: number; z: number }> = [];
      let lastStuckFrame = -Infinity;

      for (let i = 0; i < maxFrames; i++) {
        if (this._cancelled) throw new Error('SimulationCancelled');
        if (condition()) return true;
        const gameRunning = this._game.getSceneStack().step(1000 / 60);
        this._game.getInputManager().onFrameEnded();
        this._framesExecuted++;
        this._trackObjectEvents();
        if (onFrame) onFrame({ frame: this._framesExecuted });
        if (!gameRunning) return false; // Game called STOP_GAME

        if (stuck) {
          const scene = this._game.getSceneStack().getCurrentScene();
          const objs = scene ? scene.getObjects(stuck.objectName) : [];
          if (objs.length > 0) {
            const obj = objs[0];
            const pos = {
              x: obj.getX(),
              y: obj.getY(),
              z: (obj as any).getZ ? (obj as any).getZ() : 0,
            };
            posHistory.push(pos);
            if (posHistory.length > stuck.windowFrames) posHistory.shift();

            if (posHistory.length >= stuck.windowFrames) {
              const oldest = posHistory[0];
              const dx = pos.x - oldest.x;
              const dy = pos.y - oldest.y;
              const dz = pos.z - oldest.z;
              const displacement = Math.sqrt(dx * dx + dy * dy + dz * dz);
              // Fire at most once per window to avoid spamming the callback
              if (
                displacement < stuck.minDisplacement &&
                this._framesExecuted - lastStuckFrame >= stuck.windowFrames
              ) {
                lastStuckFrame = this._framesExecuted;
                this._eventLog.push({
                  frame: this._framesExecuted,
                  event: 'stuck',
                  object: stuck.objectName,
                  x: pos.x,
                  y: pos.y,
                  z: pos.z,
                  duration: stuck.windowFrames,
                });
                // Release all keys before the callback so onStuck starts from a clean slate.
                this._releaseAllKeys();
                stuck.onStuck({
                  frame: this._framesExecuted,
                  x: pos.x,
                  y: pos.y,
                  z: pos.z,
                });
              }
            }
          }
        }

        await new Promise<void>((r) => setTimeout(r, 1000 / 60));
      }
      return condition();
    }

    /**
     * Convert a world-space position on a given layer to the input coordinate
     * space expected by the input manager (inverse of layer.convertCoords).
     * For a default camera (no scroll, zoom=1, no rotation) the result equals
     * the input, so this is safe to call unconditionally.
     */
    private _worldToInputCoords(
      layerName: string,
      worldX: number,
      worldY: number,
      worldZ: number = 0
    ): { x: number; y: number } {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return { x: worldX, y: worldY };
      const layer = scene.getLayer(layerName);

      // Mirror exactly what layer.convertCoords does:
      //   if isCameraRotatedIn3D() → transformTo3DWorld (3D projection)
      //   otherwise              → 2D formula (linear, camera-scroll + zoom + rotation)
      // Using renderer._threeCamera alone would break perspective non-tilted cameras:
      // their convertCoords still uses the 2D formula, so we must also use it.
      const renderer = (layer as any)._renderer;
      if (
        renderer &&
        renderer.isCameraRotatedIn3D &&
        renderer.isCameraRotatedIn3D()
      ) {
        const camera = renderer._threeCamera as any;
        const THREE = (globalThis as any).THREE;
        if (camera && THREE) {
          // Ensure the camera matrix is up to date before projecting.
          camera.updateMatrixWorld(true);
          // GDevelop Y = -THREE Y (scene.scale.y = -1 mirrors the world on Y).
          // transformTo3DWorld returns [threeX, -threeY], so the inverse maps
          // GDevelop (worldX, worldY, worldZ) → THREE (worldX, -worldY, worldZ).
          const vec = new THREE.Vector3(worldX, -worldY, worldZ);
          vec.project(camera);
          // NDC → screen coords (inverse of normalizedX/Y in transformTo3DWorld).
          const layerW: number = layer.getWidth();
          const layerH: number = layer.getHeight();
          return {
            x: ((vec.x + 1) / 2) * layerW,
            y: ((-vec.y + 1) / 2) * layerH,
          };
        }
      }

      // 2D camera path: inverse of layer.convertCoords(inputX, inputY) → [worldX, worldY]:
      //   worldX = ((inputX - gameW/2) * cos(-a) - (inputY - gameH/2) * sin(-a)) / zoom + cameraX
      // Reversed: subtract camera, multiply by zoom, rotate by +angle, add center.
      const cameraX = layer.getCameraX();
      const cameraY = layer.getCameraY();
      const zoom = layer.getCameraZoom();
      const angleDeg = layer.getCameraRotation();
      const gameW = this._game.getGameResolutionWidth();
      const gameH = this._game.getGameResolutionHeight();
      let x = (worldX - cameraX) * zoom;
      let y = (worldY - cameraY) * zoom;
      if (angleDeg !== 0) {
        const rad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        x = rx;
        y = ry;
      }
      return { x: x + gameW / 2, y: y + gameH / 2 };
    }

    /**
     * Move the simulated mouse cursor to a world-space position on the given
     * layer. The layer's camera transform (scroll, zoom, rotation) is inverted
     * so the click lands on the correct screen pixel.
     *
     * Pass `obj.layer` from `getObjects()` to click exactly on a live object.
     * Defaults to the base layer (`''`). For a 2D game with an unscrolled camera
     * the conversion is a no-op, so existing callers that pass raw pixel coords
     * continue to work unchanged.
     *
     * @param x World X coordinate.
     * @param y World Y coordinate.
     * @param layerName Layer whose camera to invert (default: '' = base layer).
     *
     * Example:
     *   const btn = harness.getObjects('TileType_SelectButton')[0];
     *   harness.setMousePosition(btn.points.Center.x, btn.points.Center.y, btn.layer);
     */
    setMousePosition(
      x: number,
      y: number,
      layerName: string = '',
      z: number = 0
    ): void {
      const converted = this._worldToInputCoords(layerName, x, y, z);
      this._mouseX = converted.x;
      this._mouseY = converted.y;
      this._game.getInputManager().onMouseMove(converted.x, converted.y);
    }

    /**
     * Move the simulated mouse to a raw screen/pixel position (no camera
     * conversion). Use this when you already have screen-space coordinates,
     * e.g. the centre of the game canvas:
     *
     *   harness.setMousePositionScreen(
     *     harness.getGameResolutionWidth() / 2,
     *     harness.getGameResolutionHeight() / 2
     *   );
     *
     * Use `setMousePosition(obj.x, obj.y, obj.layer)` instead when clicking
     * on a live game object whose position is in world space.
     *
     * @param screenX Screen X in pixels (0 = left edge, gameWidth = right edge).
     * @param screenY Screen Y in pixels (0 = top edge, gameHeight = bottom edge).
     */
    setMousePositionScreen(screenX: number, screenY: number): void {
      this._mouseX = screenX;
      this._mouseY = screenY;
      this._game.getInputManager().onMouseMove(screenX, screenY);
    }

    /** Width of the game canvas in pixels. Use with setMousePositionScreen. */
    getGameResolutionWidth(): number {
      return this._game.getGameResolutionWidth();
    }

    /** Height of the game canvas in pixels. Use with setMousePositionScreen. */
    getGameResolutionHeight(): number {
      return this._game.getGameResolutionHeight();
    }

    /**
     * Move the mouse cursor by a relative amount from its current position.
     * This is the correct way to simulate FPS-style mouse look: the game reads
     * how much the mouse moved each frame (delta), not its absolute position.
     * Call once per frame inside onFrame for smooth rotation.
     * @param dx Pixels to move horizontally (positive = right → typically turns right).
     * @param dy Pixels to move vertically (positive = down → typically looks down).
     *
     * Example (rotate camera right by 50 pixels over 30 frames):
     *   await harness.stepFrames(30, { onFrame: () => harness.setMouseDelta(50 / 30, 0) });
     */
    setMouseDelta(dx: number, dy: number): void {
      this._mouseX += dx;
      this._mouseY += dy;
      // Pass movementX/movementY explicitly so the InputManager accumulates the
      // per-frame delta that getMouseMovementX()/getMouseMovementY() return.
      // Without this, FPS behaviors that read mouse movement (not absolute position)
      // would always see a delta of 0.
      this._game.getInputManager().onMouseMove(this._mouseX, this._mouseY, {
        movementX: dx,
        movementY: dy,
      });
      // Also inject into the MousePointerLock community extension handler.
      // That extension accumulates mouse movement via real browser pointermove events
      // (gated on document.pointerLockElement), so the GDevelop input manager alone
      // is not enough. We write directly into handler.movementX/Y so that
      // FirstPersonPointerMapper and similar behaviors see the simulated deltas.
      this._patchMousePointerLockExt();
      const mousePointerLockExt = (gdjs as any)._MousePointerLockExtension;
      if (mousePointerLockExt && mousePointerLockExt.handler) {
        mousePointerLockExt.handler.movementX += dx;
        mousePointerLockExt.handler.movementY += dy;
      }
    }

    /**
     * Patch the MousePointerLock community extension so it works inside the
     * simulation iframe where document.pointerLockElement is always null.
     * Safe to call multiple times — patches are applied only once.
     */
    private _patchMousePointerLockExt(): void {
      const ext = (gdjs as any)._MousePointerLockExtension;
      if (ext && ext.handler && !ext.handler._simulationPatched) {
        // Make the extension think pointer lock is always active so the
        // FirstPersonPointerMapper behavior doesn't skip its camera update.
        ext.handler.isPointerLocked = () => true;
        // Prevent canvas.requestPointerLock() from throwing NotAllowedError
        // (requires a real user gesture — not available in simulation).
        ext.handler.requestPointerLock = () => {};
        ext.handler._simulationPatched = true;
      }
    }

    /**
     * Simulate a mouse button press or release.
     * @param button 'left' | 'right' | 'middle'. Defaults to 'left'.
     * @param pressed true to press, false to release.
     */
    /**
     * Discover which keys affect a given object by briefly pressing each common key
     * and observing position or behavior-state changes.
     * Call this once at the start of a test (before any other input) to learn the
     * game's actual control scheme instead of assuming arrow keys.
     *
     * Returns a map of key name → observed effect. Keys with no observable effect
     * are omitted. The object will have moved slightly by the end — if that matters,
     * call goToScene() again to reset.
     *
     * @param objectName The object to watch (e.g. 'Player').
     * @param options.framesPerKey How many frames to hold each key (default: 5).
     *
     * Example:
     *   const controls = await harness.discoverControls('Player');
     *   // 2D platformer → { "a": { dx:-12, dy:0, dz:0, dAngle:0, dRotationX:0, dRotationY:0, stateChanged:false }, ... }
     *   // 3D FPS        → { "w": { dx:0, dy:-10, dz:0, ... }, "Space": { dz:45, stateChanged:true, ... },
     *                        "MouseRight": { dAngle:5, ... }, "MouseLeft": { dAngle:-5, ... } }
     */
    /**
     * Rotate the camera/player to face the nearest instance of `targetObjectName`.
     * Auto-calibrates mouse sensitivity by applying a small test movement and measuring
     * the resulting rotation, then applies the exact correction needed.
     * Works for both horizontal (yaw via `angle`) and vertical (pitch via `rotationX`).
     *
     * @param reference The object whose rotation to adjust (e.g. `{ name: 'Player' }`).
     * @param target The object to look toward. Omit `id` to pick the nearest instance to the reference.
     * @param options.tolerance Acceptable angular error in degrees (default: 3).
     * @param options.maxFrames Maximum correction frames before giving up (default: 30).
     * @param options.yawOnly Only correct the horizontal angle (yaw). Pitch is left unchanged.
     *   Use this when facing a direction to move toward — avoids pitching the camera down toward
     *   a floor-level target and causing the player to look at the ground while walking.
     * @returns true if within tolerance, false if the camera did not converge.
     *
     * Example (FPS: look toward the nearest enemy then walk forward):
     *   await harness.lookToward('Player', 'Enemy');
     *   await harness.stepFrames(60, { onFrame: () => harness.setKeyPressed('w', true) });
     */
    async lookToward(
      reference: { name: string; id?: number },
      target: { name: string; id?: number },
      options?: {
        tolerance?: number;
        maxFrames?: number;
        yawOnly?: boolean;
      }
    ): Promise<boolean> {
      const tolerance = (options && options.tolerance) || 3;
      const maxFrames = (options && options.maxFrames) || 60;
      const yawOnly = !!(options && options.yawOnly);
      const calibPx = 20;

      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return false;

      const refRuntimeObj = this._resolveInstance(scene, reference);
      if (!refRuntimeObj) return false;

      const ref =
        this.getObjects(reference.name).find(
          (s) => s.id === refRuntimeObj.id
        ) || this.getObjects(reference.name)[0];
      if (!ref) return false;
      const layerName = ref.layer || '';

      // Use the layer camera position as the reference point so nearest-target
      // resolution is consistent with the geometry used for aim calculation.
      const refLayer = scene.getLayer(layerName);
      const refPos = {
        x: refLayer.getCameraX(0),
        y: refLayer.getCameraY(0),
        z: (refRuntimeObj as any).getZ ? (refRuntimeObj as any).getZ() : 0,
      };
      const tgt = this._resolveInstance(scene, target, refPos);
      if (!tgt) return false;

      // gdjs.scene3d.camera is used to read the actual camera Z position (eye height
      // for pitch) and as a fallback to read pitch when the reference object does not
      // expose getRotationX. The core yaw calibration/correction works via
      // refRuntimeObj.getAngle() + setMouseDelta and does NOT require this API.
      const scene3dCamera =
        (gdjs as any).scene3d && (gdjs as any).scene3d.camera;

      {
        // Ensure the MousePointerLock extension (if present) is patched before any
        // frames run, so the FPS behavior is active and processes mouse deltas.
        this._patchMousePointerLockExt();

        // Step 1: Compute ideal yaw/pitch directly from player→target geometry.
        // Use the layer's actual camera position as the ray origin.
        // FPS behaviors (e.g. FirstPersonPointerMapper / LookFromObjectEyes) set the
        // camera via setCameraX/Y(Object.CenterX/Y()), where getCenterXInScene() can
        // differ from getX()+getWidth()/2 for 3D models with a custom origin point.
        // Reading X/Y directly from the layer eliminates that systematic offset.
        const refCx = refLayer.getCameraX(0);
        const refCy = refLayer.getCameraY(0);
        // Same logic for Z: LookFromObjectEyes sets camera Z to the top of the player
        // (player.z + player.depth), not the geometric center. Falls back to center Z
        // for non-3D / non-FPS scenes where getCameraZ is not available.
        const refCz =
          scene3dCamera && typeof scene3dCamera.getCameraZ === 'function'
            ? scene3dCamera.getCameraZ(scene, layerName, 0)
            : ref.z + (ref.depth || 0) / 2;

        // Always aim at the geometric center of the target.
        // Use getCenterXInScene/Y/Z rather than getX()+width/2 etc.:
        // for 3D models whose origin is at the geometric center, getCenterX/Y/Z() = 0 so
        // getCenterXInScene() = getX(). Adding width/2 would overshoot by width/2.
        // These methods handle both standard boxes (origin at corner → adds half-size)
        // and center-origin models (adds 0) correctly.
        const targetX = tgt.getCenterXInScene();
        const targetY = tgt.getCenterYInScene();
        const targetZ = (tgt as any).getCenterZInScene
          ? (tgt as any).getCenterZInScene()
          : (tgt as any).getZ
            ? (tgt as any).getZ() +
              ((tgt as any).getDepth ? (tgt as any).getDepth() / 2 : 0)
            : 0;

        const dx = targetX - refCx;
        const dy = targetY - refCy;
        const dz = targetZ - refCz;
        const horizontalDist = Math.sqrt(dx * dx + dy * dy);

        console.log('[lookToward] ref camera pos:', { refCx, refCy, refCz });
        console.log('[lookToward] target center:', {
          targetX,
          targetY,
          targetZ,
        });
        console.log('[lookToward] target raw:', {
          x: tgt.getX(),
          y: tgt.getY(),
          w: tgt.getWidth(),
          h: tgt.getHeight(),
          z: (tgt as any).getZ?.(),
          d: (tgt as any).getDepth?.(),
        });
        console.log('[lookToward] delta:', { dx, dy, dz, horizontalDist });

        // Step 2: Calibrate sensitivity by probing all available rotation sources.
        // Some FPS games store yaw in the player's angle, others in the camera layer.
        // We measure all candidates simultaneously and pick the one that responds most
        // to mouse X (for yaw) and mouse Y (for pitch).
        const readObjAngle = (): number => refRuntimeObj.getAngle();
        const readObjRotX =
          typeof (refRuntimeObj as any).getRotationX === 'function'
            ? (): number => (refRuntimeObj as any).getRotationX()
            : null;
        const readCamRotX =
          scene3dCamera &&
          typeof scene3dCamera.getCameraRotationX === 'function'
            ? (): number =>
                scene3dCamera.getCameraRotationX(scene, layerName, 0)
            : null;
        const readCamRotY =
          scene3dCamera &&
          typeof scene3dCamera.getCameraRotationY === 'function'
            ? (): number =>
                scene3dCamera.getCameraRotationY(scene, layerName, 0)
            : null;

        const readAll = () => ({
          objAngle: readObjAngle(),
          objRotX: readObjRotX ? readObjRotX() : 0,
          camRotX: readCamRotX ? readCamRotX() : 0,
          camRotY: readCamRotY ? readCamRotY() : 0,
        });
        type RotKey = 'objAngle' | 'objRotX' | 'camRotX' | 'camRotY';

        // Baseline frame — let the FPS behavior settle before calibrating.
        this._game.getSceneStack().step(1000 / 60);
        this._game.getInputManager().onFrameEnded();
        this._framesExecuted++;
        await new Promise<void>((r) => setTimeout(r, 1000 / 60));

        // Yaw calibration: apply mouse X, measure all sources simultaneously.
        const preMouseX = readAll();
        this.setMouseDelta(calibPx, 0);
        this._game.getSceneStack().step(1000 / 60);
        this._game.getInputManager().onFrameEnded();
        this._framesExecuted++;
        await new Promise<void>((r) => setTimeout(r, 1000 / 60));
        const postMouseX = readAll();

        const deltaMouseX: Record<RotKey, number> = {
          objAngle: postMouseX.objAngle - preMouseX.objAngle,
          objRotX: postMouseX.objRotX - preMouseX.objRotX,
          camRotX: postMouseX.camRotX - preMouseX.camRotX,
          camRotY: postMouseX.camRotY - preMouseX.camRotY,
        };
        // Pick the source with the largest absolute response to mouse X.
        const yawKey = (
          ['objAngle', 'camRotY', 'camRotX', 'objRotX'] as RotKey[]
        ).reduce(
          (best, k) =>
            Math.abs(deltaMouseX[k]) > Math.abs(deltaMouseX[best]) ? k : best,
          'objAngle' as RotKey
        );
        const yawRate = deltaMouseX[yawKey] / calibPx;
        // Build the yaw reader and ideal-yaw from the winning source.
        // For obj.angle, idealYaw is directly atan2(dy,dx) in GDevelop's angle space.
        // For camera sources, the coordinate zero differs but degrees are consistent,
        // so idealYaw = current_cam_reading + angle_error_computed_from_obj.angle.
        const getRefYaw: () => number =
          yawKey === 'objAngle'
            ? readObjAngle
            : yawKey === 'objRotX'
              ? (readObjRotX ?? readObjAngle)
              : yawKey === 'camRotX'
                ? (readCamRotX ?? readObjAngle)
                : (readCamRotY ?? readObjAngle);
        const idealYaw: number =
          yawKey === 'objAngle'
            ? (Math.atan2(dy, dx) * 180) / Math.PI
            : // For a camera source: current_cam_Y + how many degrees obj.angle is off target
              preMouseX[yawKey] +
              this._shortAngle(
                preMouseX.objAngle,
                (Math.atan2(dy, dx) * 180) / Math.PI
              );

        // Pitch calibration: apply mouse Y, measure all sources simultaneously.
        // Skipped when yawOnly is set.
        let pitchRate = 0;
        let getRefPitch: () => number = readObjRotX ?? readCamRotX ?? (() => 0);
        let idealPitch: number =
          horizontalDist > 0
            ? (-Math.atan2(dz, horizontalDist) * 180) / Math.PI
            : 0;

        if (!yawOnly) {
          const preMouseY = readAll();
          this.setMouseDelta(0, calibPx);
          this._game.getSceneStack().step(1000 / 60);
          this._game.getInputManager().onFrameEnded();
          this._framesExecuted++;
          await new Promise<void>((r) => setTimeout(r, 1000 / 60));
          const postMouseY = readAll();

          const deltaMouseY: Record<RotKey, number> = {
            objAngle: postMouseY.objAngle - preMouseY.objAngle,
            objRotX: postMouseY.objRotX - preMouseY.objRotX,
            camRotX: postMouseY.camRotX - preMouseY.camRotX,
            camRotY: postMouseY.camRotY - preMouseY.camRotY,
          };
          // Pick the source with the largest response to mouse Y, preferring
          // rotation-X sources (natural pitch) and excluding the yaw source.
          const pitchKey = (
            ['objRotX', 'camRotX', 'camRotY', 'objAngle'] as RotKey[]
          )
            .filter((k) => k !== yawKey)
            .reduce(
              (best, k) =>
                Math.abs(deltaMouseY[k]) > Math.abs(deltaMouseY[best])
                  ? k
                  : best,
              'objRotX' as RotKey
            );
          pitchRate = deltaMouseY[pitchKey] / calibPx;
          getRefPitch =
            pitchKey === 'objAngle'
              ? readObjAngle
              : pitchKey === 'objRotX'
                ? (readObjRotX ?? (() => 0))
                : pitchKey === 'camRotX'
                  ? (readCamRotX ?? (() => 0))
                  : (readCamRotY ?? (() => 0));
          // Adjust idealPitch to match the pitch source's coordinate system.
          if (pitchKey === 'camRotX') {
            // getCameraRotationX returns threeCamera.rotation.x in degrees.
            // In GDevelop 3D the scene is mirrored on Y (scale.y = -1), so the
            // camera must be rotated +90° around X to look "forward" horizontally.
            // Consequently, threeCamera.rotation.x = 90° when horizontal, and
            // rotation.x = 90° + elevationAngle where elevationAngle = atan2(dz, h).
            // The geometric idealPitch is -atan2(dz, h) (elevation-angle space where
            // 0° = horizontal), which is NOT the same as rotation.x space.
            idealPitch =
              horizontalDist > 0
                ? 90 + (Math.atan2(dz, horizontalDist) * 180) / Math.PI
                : 90;
          } else if (pitchKey !== 'objRotX') {
            // For non-standard pitch sources (e.g. objAngle or camRotY), express
            // idealPitch in the pitch source's coordinate system the same way
            // idealYaw is expressed for camera yaw sources:
            //   current_source + delta_in_rotX_space.
            // Both values MUST come from the same pre-calibration snapshot so the
            // offsets are consistent (mixing pre and post would add the calibration
            // overshoot to idealPitch, causing the camera to converge to the wrong angle).
            const preStdPitch = readObjRotX
              ? preMouseY.objRotX
              : readCamRotX
                ? preMouseY.camRotX
                : 0;
            idealPitch = preMouseY[pitchKey] + (idealPitch - preStdPitch);
          }
        }

        // If mouse has no effect at all, we cannot rotate the camera.
        if (
          Math.abs(yawRate) < 0.001 &&
          !yawOnly &&
          Math.abs(pitchRate) < 0.001
        )
          return false;

        console.log('[lookToward] calibration:', {
          yawKey,
          yawRate,
          pitchRate,
        });
        console.log(
          '[lookToward] idealYaw:',
          idealYaw,
          'idealPitch:',
          idealPitch
        );

        // Restoration frame: undo the calibration mouse movements so the correction
        // loop starts from the pre-calibration state. Without this, if the calibration
        // displacement (calibPx * rate) happens to be within `tolerance`, the loop exits
        // on its first check without correcting anything, leaving up to `tolerance`
        // degrees of error (e.g. 3° at 600 units ≈ 31 units of miss on a small target).
        this.setMouseDelta(-calibPx, yawOnly ? 0 : -calibPx);
        this._game.getSceneStack().step(1000 / 60);
        this._game.getInputManager().onFrameEnded();
        this._framesExecuted++;
        await new Promise<void>((r) => setTimeout(r, 1000 / 60));

        // Step 3: Correction loop — drive the FPS behavior's camera to idealYaw/idealPitch.
        // The FPS behavior applies rotation as: newAngle = oldAngle + mouseDelta * sensitivity,
        // so applying (error / rate) pixels converges in ~1 frame.
        for (let i = 0; i < maxFrames; i++) {
          if (this._cancelled) throw new Error('SimulationCancelled');

          const currentYaw: number = getRefYaw();
          const currentPitch: number = getRefPitch();

          const yawError = this._shortAngle(currentYaw, idealYaw);
          const pitchError = yawOnly ? 0 : idealPitch - currentPitch;

          console.log(
            `[lookToward] loop i=${i} currentYaw=${currentYaw.toFixed(3)} idealYaw=${idealYaw.toFixed(3)} yawError=${yawError.toFixed(3)} currentPitch=${currentPitch.toFixed(3)} idealPitch=${idealPitch.toFixed(3)} pitchError=${pitchError.toFixed(3)}`
          );

          if (
            Math.abs(yawError) <= tolerance &&
            Math.abs(pitchError) <= tolerance
          ) {
            // Clear residual mouse deltas so subsequent stepFrames don't keep rotating.
            const mousePointerLockExtInner = (gdjs as any)
              ._MousePointerLockExtension;
            if (mousePointerLockExtInner && mousePointerLockExtInner.handler) {
              mousePointerLockExtInner.handler.movementX = 0;
              mousePointerLockExtInner.handler.movementY = 0;
            }
            return true;
          }

          // Cap at 500px to avoid extreme inputs on miscalibrated rates, while still
          // allowing the P-controller to converge in a single frame for any realistic
          // pitch/yaw error. 100px was too small: a 24° pitch with rate=0.111°/px needs
          // 215px, which was clamped to 100, leaving a 1.6° residual per iteration.
          const mouseDx =
            Math.abs(yawRate) > 0.001
              ? Math.max(-500, Math.min(500, yawError / yawRate))
              : 0;
          const mouseDy =
            !yawOnly && Math.abs(pitchRate) > 0.001
              ? Math.max(-500, Math.min(500, pitchError / pitchRate))
              : 0;

          this.setMouseDelta(mouseDx, mouseDy);
          this._game.getSceneStack().step(1000 / 60);
          this._game.getInputManager().onFrameEnded();
          this._framesExecuted++;
          this._trackObjectEvents();
          await new Promise<void>((r) => setTimeout(r, 1000 / 60));
        }

        // Clear residual mouse deltas so subsequent stepFrames don't keep rotating.
        const mousePointerLockExt = (gdjs as any)._MousePointerLockExtension;
        if (mousePointerLockExt && mousePointerLockExt.handler) {
          mousePointerLockExt.handler.movementX = 0;
          mousePointerLockExt.handler.movementY = 0;
        }

        // Final check after correction loop
        const finalYaw: number = getRefYaw();
        const finalPitch: number = yawOnly ? idealPitch : getRefPitch();
        console.log('[lookToward] final:', {
          finalYaw,
          idealYaw,
          finalPitch,
          idealPitch,
          camX: refLayer.getCameraX(0),
          camY: refLayer.getCameraY(0),
        });
        return (
          Math.abs(this._shortAngle(finalYaw, idealYaw)) <= tolerance &&
          Math.abs(idealPitch - finalPitch) <= tolerance
        );
      }
    }

    /** Normalise an angular difference to the range -180..180. */
    private _shortAngle(current: number, target: number): number {
      let delta = target - current;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      return delta;
    }

    setMouseButtonPressed(
      pressed: boolean,
      button: 'left' | 'right' | 'middle' = 'left'
    ): void {
      const inputManager = this._game.getInputManager();
      const buttonCode =
        button === 'right'
          ? gdjs.InputManager.MOUSE_RIGHT_BUTTON
          : button === 'middle'
            ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON
            : gdjs.InputManager.MOUSE_LEFT_BUTTON;
      if (pressed) {
        inputManager.onMouseButtonPressed(buttonCode);
      } else {
        inputManager.onMouseButtonReleased(buttonCode);
      }
    }

    /**
     * Simulate a keyboard key being pressed or released.
     * @param keyName Human-readable key name (e.g. "ArrowRight", "Space", "a").
     * @param pressed true to press the key, false to release it.
     */
    setKeyPressed(keyName: string, pressed: boolean): void {
      const keyCode = SimulationHarness._keyNameToCode[keyName];
      if (keyCode === undefined) {
        this._errors.push(`Unknown key name: "${keyName}"`);
        return;
      }
      const inputManager = this._game.getInputManager();
      if (pressed) {
        inputManager.onKeyPressed(keyCode);
      } else {
        inputManager.onKeyReleased(keyCode);
      }
    }

    private _releaseAllKeys(): void {
      const inputManager = this._game.getInputManager();
      for (const keyCode of Object.values(SimulationHarness._keyNameToCode)) {
        inputManager.onKeyReleased(keyCode);
      }
    }

    /**
     * Get all instances of the named object in the current scene.
     * Returns an array of state snapshots (position, size, angle, layer).
     */
    getObjects(objectName: string): SimObjectState[] {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return [];
      const objects = scene.getObjects(objectName);
      return objects.map((obj) => {
        const syncData = (obj as any).getNetworkSyncData({
          syncAllBehaviors: true,
          syncObjectIdentifiers: true,
          useFullNames: true,
          shouldExcludeVariableFromData: () => false,
        });

        // Build named points map (not present in sync data).
        // Origin and Center are always present; sprites also expose custom named points.
        const points: { [name: string]: { x: number; y: number } } = {
          Origin: { x: obj.getX(), y: obj.getY() },
          Center: {
            x: obj.getCenterXInScene(),
            y: obj.getCenterYInScene(),
          },
        };
        if (obj instanceof gdjs.SpriteRuntimeObject) {
          const frame = obj._animator.getCurrentFrame();
          if (frame) {
            // Override Center with the actual sprite center point (respects flip/scale/rotation).
            points['Center'] = {
              x: obj.getPointX('Center'),
              y: obj.getPointY('Center'),
            };
            for (const name of Object.keys(frame.points.items)) {
              points[name] = {
                x: obj.getPointX(name),
                y: obj.getPointY(name),
              };
            }
          }
        }

        return {
          ...syncData,
          // Not in sync data: runtime id, named points.
          // objectName is included via syncObjectIdentifiers above.
          id: obj.id,
          points,
        };
      });
    }

    /**
     * Get all instances of `objectName` within `radius` pixels of the first
     * instance of `referenceObjectName`, sorted nearest-first.
     * Each entry extends SimObjectState with spatial relationship fields:
     *   - distance: center-to-center distance in pixels (3D Euclidean)
     *   - relativeX/relativeY/relativeZ: signed offset from reference center to this object's center
     *   - above/below/left/right: boolean directional labels
     * Returns an empty array if no reference instance exists or none are in range.
     *
     * Example:
     *   const coins = harness.getNearby('Coin', 'Player', 200);
     *   // coins[0].left === true  → nearest coin is to the left
     *   // coins[0].above === true → nearest coin is above (may need to jump to reach it)
     */
    getNearby(
      objectName: string,
      referenceObjectName: string,
      radius: number
    ): SimNearbyObjectState[] {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return [];

      const refs = scene.getObjects(referenceObjectName);
      if (refs.length === 0) return [];
      const ref = refs[0];
      const refCx = ref.getCenterXInScene();
      const refCy = ref.getCenterYInScene();
      const refCz = (ref as any).getCenterZInScene
        ? (ref as any).getCenterZInScene()
        : (ref as any).getZ
          ? (ref as any).getZ()
          : 0;

      const result: SimNearbyObjectState[] = [];
      for (const state of this.getObjects(objectName)) {
        const cx = state.points?.Center?.x ?? state.x + state.width / 2;
        const cy = state.points?.Center?.y ?? state.y + state.height / 2;
        const cz = state.z;
        const dx = cx - refCx;
        const dy = cy - refCy;
        const dz = cz - refCz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance <= radius) {
          result.push({
            ...state,
            distance,
            relativeX: dx,
            relativeY: dy,
            relativeZ: dz,
            above: dy < 0,
            below: dy > 0,
            left: dx < 0,
            right: dx > 0,
            bearingFromReference: Math.atan2(dy, dx) * (180 / Math.PI),
          });
        }
      }

      result.sort((a, b) => a.distance - b.distance);
      return result;
    }

    /**
     * Resolve a `{ name, id? }` reference to a runtime object instance.
     * - If `id` is provided, returns the instance with that id (O(k) over instances of that type).
     * - If `id` is omitted and `nearestTo` is provided, returns the nearest instance to that position.
     * - If `id` is omitted and no `nearestTo`, returns the first instance.
     */
    private _resolveInstance(
      scene: gdjs.RuntimeScene,
      ref: { name: string; id?: number },
      nearestTo?: { x: number; y: number; z: number }
    ): gdjs.RuntimeObject | null {
      const objs = scene.getObjects(ref.name);
      if (objs.length === 0) return null;
      if (ref.id !== undefined) {
        for (const obj of objs) {
          if (obj.id === ref.id) return obj;
        }
        return null;
      }
      if (!nearestTo || objs.length === 1) return objs[0];
      let best = objs[0];
      let bestDist = Infinity;
      for (const obj of objs) {
        const cx = obj.getCenterXInScene();
        const cy = obj.getCenterYInScene();
        const cz = (obj as any).getCenterZInScene
          ? (obj as any).getCenterZInScene()
          : (obj as any).getZ
            ? (obj as any).getZ()
            : 0;
        const dx = cx - nearestTo.x;
        const dy = cy - nearestTo.y;
        const dz = cz - nearestTo.z;
        const dist = dx * dx + dy * dy + dz * dz;
        if (dist < bestDist) {
          bestDist = dist;
          best = obj;
        }
      }
      return best;
    }

    /**
     * Check whether there is a clear line of sight (in the XY plane) from the reference
     * object to the target object, testing whether any instance of the blocker object types
     * intersects the segment between their centers.
     *
     * Both `reference` and `target` are `{ name, id? }`:
     *   - Omit `id` to use the first instance of that type.
     *   - Pass `id` (from a SimObjectState) to target a specific instance.
     *
     * Returns:
     *   - `clear: true`  — nothing blocks the path.
     *   - `clear: false` — `blockedBy` is `{ name, id }` of the specific blocking instance,
     *     `blockedAt` is the approximate world-space hit point.
     *
     * Example:
     *   const monsters = harness.getNearby('Monster', 'Player', 500);
     *   for (const monster of monsters) {
     *     const los = harness.hasLineOfSight(
     *       { name: 'Player' },
     *       { name: 'Monster', id: monster.id },
     *       ['Wall', 'Crate']
     *     );
     *     if (los.clear) { // aim at this monster
     *       break;
     *     } else {
     *       // los.blockedBy = { name: 'Wall', id: 42 } — can target the specific blocker
     *     }
     *   }
     */
    hasLineOfSight(
      reference: { name: string; id?: number },
      target: { name: string; id?: number },
      blockerObjectNames: string[]
    ): {
      clear: boolean;
      blockedBy?: { name: string; id: number };
      blockedAt?: { x: number; y: number; z: number };
    } {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return { clear: true };

      const ref = this._resolveInstance(scene, reference);
      if (!ref) return { clear: true };
      const refCx = ref.getCenterXInScene();
      const refCy = ref.getCenterYInScene();

      const refPos = {
        x: refCx,
        y: refCy,
        z: (ref as any).getCenterZInScene
          ? (ref as any).getCenterZInScene()
          : (ref as any).getZ
            ? (ref as any).getZ()
            : 0,
      };
      const tgt = this._resolveInstance(scene, target, refPos);
      if (!tgt) return { clear: true };
      const tgtCx = tgt.getCenterXInScene();
      const tgtCy = tgt.getCenterYInScene();

      const dx = tgtCx - refCx;
      const dy = tgtCy - refCy;

      for (const blockerName of blockerObjectNames) {
        const blockers = scene.getObjects(blockerName);
        for (const blocker of blockers) {
          if (blocker === ref || blocker === tgt) continue;

          const bLeft = blocker.getX();
          const bTop = blocker.getY();
          const bRight = bLeft + blocker.getWidth();
          const bBottom = bTop + blocker.getHeight();

          // Slab method: intersect the segment parameter interval [0,1] with each axis slab.
          let tMin = 0;
          let tMax = 1;

          if (Math.abs(dx) < 1e-10) {
            if (refCx < bLeft || refCx > bRight) continue;
          } else {
            const t1 = (bLeft - refCx) / dx;
            const t2 = (bRight - refCx) / dx;
            tMin = Math.max(tMin, Math.min(t1, t2));
            tMax = Math.min(tMax, Math.max(t1, t2));
            if (tMin > tMax) continue;
          }

          if (Math.abs(dy) < 1e-10) {
            if (refCy < bTop || refCy > bBottom) continue;
          } else {
            const t1 = (bTop - refCy) / dy;
            const t2 = (bBottom - refCy) / dy;
            tMin = Math.max(tMin, Math.min(t1, t2));
            tMax = Math.min(tMax, Math.max(t1, t2));
            if (tMin > tMax) continue;
          }

          const hitT = Math.max(0, tMin);
          return {
            clear: false,
            blockedBy: { name: blockerName, id: blocker.id },
            blockedAt: { x: refCx + hitT * dx, y: refCy + hitT * dy, z: 0 },
          };
        }
      }

      return { clear: true };
    }

    /**
     * Returns directional movement hints toward a target.
     * Uses the first instance of `referenceObjectName` as the origin.
     * Returns null if the reference or target instance does not exist.
     *
     * @param referenceObjectName The object doing the navigating (e.g. 'Player').
     * @param target
     *   { name: string } — nearest instance of that object type (re-resolved each frame).
     *     Useful for unique objects or moving targets.
     *   { name: string; id: number } — a specific instance by ID. Use this when there are
     *     multiple instances to avoid oscillation between them.
     *   { x: number; y: number; z?: number } — fixed world coordinates.
     * @param options.jumpThreshold Minimum upward offset (px) to set shouldJump = true.
     *   Defaults to half the reference object's height. Tune this for your game's jump arc.
     * @param options.reachRadius Distance (px) at which the target is considered reached.
     *   Defaults to 32.
     */
    getNavigationHint(
      referenceObjectName: string,
      target:
        | { name: string; id?: number }
        | { x: number; y: number; z?: number },
      options?: { jumpThreshold?: number; reachRadius?: number }
    ): NavigationHint | null {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return null;

      const refs = scene.getObjects(referenceObjectName);
      if (refs.length === 0) return null;
      const ref = refs[0];
      const refCx = ref.getCenterXInScene();
      const refCy = ref.getCenterYInScene();
      const refCz = (ref as any).getCenterZInScene
        ? (ref as any).getCenterZInScene()
        : (ref as any).getZ
          ? (ref as any).getZ()
          : 0;

      const jumpThreshold =
        options && options.jumpThreshold !== undefined
          ? options.jumpThreshold
          : ref.getHeight() / 2;
      const reachRadius =
        options && options.reachRadius !== undefined ? options.reachRadius : 32;

      let targetCx: number;
      let targetCy: number;
      let targetCz: number;

      if ('x' in target) {
        targetCx = target.x;
        targetCy = target.y;
        targetCz = target.z || 0;
      } else {
        const targets = scene.getObjects(target.name);
        if (targets.length === 0) return null;

        let best: gdjs.RuntimeObject | undefined;
        if (target.id !== undefined) {
          best = targets.find((t) => t.id === target.id);
          if (!best) return null;
        } else {
          // No id provided: pick the nearest instance
          best = targets[0];
          let bestDist = Infinity;
          for (const t of targets) {
            const dx = t.getCenterXInScene() - refCx;
            const dy = t.getCenterYInScene() - refCy;
            const dz =
              ((t as any).getCenterZInScene
                ? (t as any).getCenterZInScene()
                : (t as any).getZ
                  ? (t as any).getZ()
                  : 0) - refCz;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d < bestDist) {
              bestDist = d;
              best = t;
            }
          }
        }

        targetCx = best.getCenterXInScene();
        targetCy = best.getCenterYInScene();
        targetCz = (best as any).getCenterZInScene
          ? (best as any).getCenterZInScene()
          : (best as any).getZ
            ? (best as any).getZ()
            : 0;
      }
      const dx = targetCx - refCx;
      const dy = targetCy - refCy;
      const dz = targetCz - refCz;
      const distanceTo = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Yaw: signed angle between current facing and direction to target (horizontal plane).
      const angleToTarget = (Math.atan2(dy, dx) * 180) / Math.PI;
      const refAngle = ref.getAngle();
      let angleDiff = angleToTarget - refAngle;
      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;

      // Pitch: signed angle between current vertical aim and direction to target.
      // Zero for 2D objects (no getRotationX). GDevelop's rotationX is negated to match
      // the convention where positive pitch = looking up.
      const horizontalDist = Math.sqrt(dx * dx + dy * dy);
      const angleToTargetVertical =
        (Math.atan2(dz, horizontalDist) * 180) / Math.PI;
      const refPitch = (ref as any).getRotationX
        ? -(ref as any).getRotationX()
        : 0;
      let pitchDiff = angleToTargetVertical - refPitch;
      while (pitchDiff > 180) pitchDiff -= 360;
      while (pitchDiff < -180) pitchDiff += 360;

      return {
        shouldMoveLeft: dx < 0,
        shouldMoveRight: dx > 0,
        shouldMoveUp: dy < 0,
        shouldMoveDown: dy > 0,
        shouldJump: dy < -jumpThreshold,
        reached: distanceTo <= reachRadius,
        distanceTo,
        targetX: targetCx,
        targetY: targetCy,
        targetZ: targetCz,
        relativeX: dx,
        relativeY: dy,
        relativeZ: dz,
        angleDiff,
        shouldTurnLeft: angleDiff < 0,
        shouldTurnRight: angleDiff > 0,
        pitchDiff,
        shouldLookUp: pitchDiff > 0,
        shouldLookDown: pitchDiff < 0,
        dominantAxis: Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y',
      };
    }

    /**
     * Get the raw sync data entry for a scene variable by name.
     * Returns undefined if the variable does not exist.
     *
     * The entry has the shape: { name, value, type, children, owner }
     *   - Primitives:  entry.value  (number | string | boolean)
     *   - Array:       entry.children[index].value  (array items have name: '')
     *   - Structure:   entry.children.find(c => c.name === 'Field').value
     *
     * Examples:
     *   harness.getSceneVariable('Score').value                          // → 5
     *   harness.getSceneVariable('QuestionList').children[1].value       // → 'Paris'
     *   harness.getSceneVariable('Settings').children.find(c => c.name === 'Volume').value
     */
    getSceneVariable(name: string): any {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return undefined;
      const vars = scene.getVariables().getNetworkSyncData({
        shouldExcludeVariableFromData: () => false,
      });
      return (vars || []).find((v: any) => v.name === name);
    }

    /**
     * Return basic state of a scene layer by name.
     * Use this to check whether a layer is visible — note that obj.hidden reflects only the
     * instance-level hidden flag; a layer can be hidden while all its objects have hidden=false.
     *
     * Example:
     *   harness.getLayer('Dialog layer').visible  // → false when the layer is hidden
     */
    getLayer(name: string): { visible: boolean } | null {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return null;
      const layer = scene.getLayer(name);
      if (!layer) return null;
      return { visible: layer.isVisible() };
    }

    /**
     * Return a single global variable entry by name, in raw VariableNetworkSyncData format.
     * Global variables are shared across all scenes.
     *
     * Examples:
     *   harness.getGlobalVariable('HighScore').value                          // → 100
     *   harness.getGlobalVariable('Inventory').children[0].value              // → 'Sword'
     *   harness.getGlobalVariable('Config').children.find(c => c.name === 'Volume').value
     */
    getGlobalVariable(name: string): any {
      const vars = this._game.getVariables().getNetworkSyncData({
        shouldExcludeVariableFromData: () => false,
      });
      return (vars || []).find((v: any) => v.name === name);
    }

    /**
     * Assert that `condition` is true. If false, records a failed assertion.
     * Does NOT throw — all assertions are collected and reported at the end.
     */
    assert(condition: boolean, message: string): void {
      const passed = !!condition;
      this._assertions.push({ message, passed });
      if (!passed) {
        this._failed = true;
        throw new Error(`Assertion failed: ${message}`);
      }
    }

    /**
     * Unconditionally record a failure with the given message and throw immediately.
     */
    fail(message: string): never {
      this._errors.push(message);
      this._failed = true;
      throw new Error(`Test failed: ${message}`);
    }

    /**
     * Execute the AI-provided simulation script.
     * Pauses the game loop during execution so rAF doesn't interfere.
     * Patches the scene stack to prevent in-game scene changes (STOP_GAME,
     * REPLACE_SCENE, etc.) from corrupting state mid-simulation.
     */
    async execute(sceneName: string, scriptBody: string): Promise<void> {
      // Pause the normal rAF game loop while we step manually
      this._game.pause(true);

      // Intercept console output during the simulation
      const originalLog = console.log.bind(console);
      const originalWarn = console.warn.bind(console);
      const originalError = console.error.bind(console);
      const capture =
        (level: string, original: (...args: any[]) => void) =>
        (...args: any[]) => {
          if (this._consoleLogs.length < MAX_CONSOLE_LOGS) {
            let message = args.map(String).join(' ');
            if (message.length > MAX_CONSOLE_LOG_LENGTH) {
              message = message.slice(0, MAX_CONSOLE_LOG_LENGTH) + '…';
            }
            this._consoleLogs.push({ level, message });
          } else {
            this._droppedConsoleLogs++;
          }
          original(...args);
        };
      console.log = capture('log', originalLog);
      console.warn = capture('warn', originalWarn);
      console.error = capture('error', originalError);

      try {
        await this.goToScene(sceneName);

        // Patch pointer lock extension immediately so FPS behaviors work from the
        // very first frame, even if lookToward is never called.
        this._patchMousePointerLockExt();

        // Build and call the user script.
        // Support two formats:
        //   1. A raw function body:  "await harness.stepFrames(60); ..."
        //   2. A full async function: "async (harness) => { ... }" or "(async (harness) => { ... })"
        // The AI sometimes sends the full function expression instead of just the body.
        // eslint-disable-next-line no-new-func
        let scriptFn: (harness: gdjs.SimulationHarness) => Promise<void>;
        try {
          const trimmed = scriptBody.trim();
          const looksLikeFunction =
            trimmed.startsWith('async') || trimmed.startsWith('(async');
          if (looksLikeFunction) {
            scriptFn = new Function(`"use strict"; return (${trimmed});`)();
          } else {
            scriptFn = new Function(
              `"use strict"; return async (harness) => { ${scriptBody} };`
            )();
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          throw new Error(
            `Syntax error in simulation script: ${msg}\nScript body:\n${scriptBody}`
          );
        }
        await scriptFn(this);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === 'SimulationCancelled') {
          // Cancelled by the user — not an error, just stop silently.
        } else {
          this._errors.push(msg);
          this._failed = true;
          logger.error('Simulation script error: ' + msg);
        }
      } finally {
        // Restore console
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        // Release all held keys and mouse buttons so they don't bleed into the next simulation run
        const inputManager = this._game.getInputManager();
        inputManager.clearAllPressedKeys();
        inputManager.onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
        inputManager.onMouseButtonReleased(
          gdjs.InputManager.MOUSE_RIGHT_BUTTON
        );
        inputManager.onMouseButtonReleased(
          gdjs.InputManager.MOUSE_MIDDLE_BUTTON
        );
        // Keep game paused – it will be stepped manually in subsequent simulations
      }
    }

    /** Snapshot current instance IDs for all object types — used as the baseline for event tracking. */
    private _snapshotObjectIds(): void {
      this._prevObjectIds.clear();
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return;
      const names: string[] = [];
      (scene as any)._objects.keys(names);
      for (const name of names) {
        const objs = scene.getObjects(name);
        this._prevObjectIds.set(
          name,
          new Set(objs.map((o) => (o as any).id as number))
        );
      }
    }

    /**
     * Compare current instance IDs against the previous frame snapshot and push
     * 'spawned' / 'removed' events to the event log for any changes.
     */
    private _trackObjectEvents(): void {
      const scene = this._game.getSceneStack().getCurrentScene();
      if (!scene) return;
      const names: string[] = [];
      (scene as any)._objects.keys(names);
      for (const name of names) {
        const objs = scene.getObjects(name);
        const currentIds = new Set(objs.map((o) => (o as any).id as number));
        const prevIds = this._prevObjectIds.get(name) || new Set<number>();
        for (const id of prevIds) {
          if (!currentIds.has(id)) {
            this._eventLog.push({
              frame: this._framesExecuted,
              event: 'removed',
              object: name,
            });
          }
        }
        for (const id of currentIds) {
          if (!prevIds.has(id)) {
            this._eventLog.push({
              frame: this._framesExecuted,
              event: 'spawned',
              object: name,
            });
          }
        }
        this._prevObjectIds.set(name, currentIds);
      }
    }

    /**
     * Build and return the final simulation result object.
     * Automatically snapshots all object instances and top-level scene variables
     * present in the current scene at the time this is called.
     */
    getResult(): SimulationResult {
      const scene = this._game.getSceneStack().getCurrentScene();

      const objectStates: { [objectName: string]: SimObjectState[] } = {};
      let sceneVariables: any[] = [];

      if (scene) {
        // Snapshot all object types defined in the scene.
        const objectNames: string[] = [];
        (scene as any)._objects.keys(objectNames);
        for (const name of objectNames) {
          const instances = this.getObjects(name);
          if (instances.length > 0) objectStates[name] = instances;
        }

        // Snapshot all scene variables as raw sync data entries.
        sceneVariables =
          scene.getVariables().getNetworkSyncData({
            shouldExcludeVariableFromData: () => false,
          }) || [];
      }

      // If logs were dropped due to the cap, append a summary entry so the AI knows.
      const consoleLogs = [...this._consoleLogs];
      if (this._droppedConsoleLogs > 0) {
        consoleLogs.push({
          level: 'warn',
          message: `[${this._droppedConsoleLogs} console log(s) dropped — reduce logging to stay within the ${MAX_CONSOLE_LOGS}-entry limit]`,
        });
      }

      return {
        passed: !this._failed && this._assertions.every((a) => a.passed),
        framesExecuted: this._framesExecuted,
        errors: this._errors,
        assertions: this._assertions,
        objectStates,
        sceneVariables,
        consoleLogs,
        eventLog: this._eventLog,
      };
    }

    /** Maps human-readable key names to browser keyCodes.
     * Accepts both Web API names (ArrowLeft) and GDevelop event sheet names (Left)
     * so that keys read from read_scene_events can be passed directly to setKeyPressed. */
    private static _keyNameToCode: { [name: string]: number } = {
      // Arrows — both Web API names and GDevelop event sheet names
      ArrowLeft: 37,
      Left: 37,
      ArrowUp: 38,
      Up: 38,
      ArrowRight: 39,
      Right: 39,
      ArrowDown: 40,
      Down: 40,
      // Common keys
      Space: 32,
      Enter: 13,
      Return: 13,
      Escape: 27,
      Backspace: 8,
      Back: 8,
      Tab: 9,
      Delete: 46,
      Insert: 45,
      Home: 36,
      End: 35,
      PageUp: 33,
      PageDown: 34,
      Pause: 19,
      Menu: 93,
      // Modifiers — generic (maps to left variant), left, and right
      Shift: 16,
      LShift: 1016,
      RShift: 2016,
      Control: 17,
      LControl: 1017,
      RControl: 2017,
      Alt: 18,
      LAlt: 1018,
      RAlt: 2018,
      LSystem: 1091,
      RSystem: 2091,
      // Function keys
      F1: 112,
      F2: 113,
      F3: 114,
      F4: 115,
      F5: 116,
      F6: 117,
      F7: 118,
      F8: 119,
      F9: 120,
      F10: 121,
      F11: 122,
      F12: 123,
      // Letters
      a: 65,
      b: 66,
      c: 67,
      d: 68,
      e: 69,
      f: 70,
      g: 71,
      h: 72,
      i: 73,
      j: 74,
      k: 75,
      l: 76,
      m: 77,
      n: 78,
      o: 79,
      p: 80,
      q: 81,
      r: 82,
      s: 83,
      t: 84,
      u: 85,
      v: 86,
      w: 87,
      x: 88,
      y: 89,
      z: 90,
      A: 65,
      B: 66,
      C: 67,
      D: 68,
      E: 69,
      F: 70,
      G: 71,
      H: 72,
      I: 73,
      J: 74,
      K: 75,
      L: 76,
      M: 77,
      N: 78,
      O: 79,
      P: 80,
      Q: 81,
      R: 82,
      S: 83,
      T: 84,
      U: 85,
      V: 86,
      W: 87,
      X: 88,
      Y: 89,
      Z: 90,
      // Digits (top row)
      '0': 48,
      '1': 49,
      '2': 50,
      '3': 51,
      '4': 52,
      '5': 53,
      '6': 54,
      '7': 55,
      '8': 56,
      '9': 57,
      Num0: 48,
      Num1: 49,
      Num2: 50,
      Num3: 51,
      Num4: 52,
      Num5: 53,
      Num6: 54,
      Num7: 55,
      Num8: 56,
      Num9: 57,
      // Numpad digits
      Numpad0: 96,
      Numpad1: 97,
      Numpad2: 98,
      Numpad3: 99,
      Numpad4: 100,
      Numpad5: 101,
      Numpad6: 102,
      Numpad7: 103,
      Numpad8: 104,
      Numpad9: 105,
      // Numpad arrows / nav
      NumpadLeft: 3037,
      NumpadUp: 3038,
      NumpadRight: 3039,
      NumpadDown: 3040,
      NumpadPageUp: 3033,
      NumpadPageDown: 3034,
      NumpadEnd: 3035,
      NumpadHome: 3036,
      NumpadReturn: 3013,
      // Numpad operators
      Add: 107,
      NumpadAdd: 3107,
      Subtract: 109,
      NumpadSubtract: 3109,
      Multiply: 106,
      NumpadMultiply: 3106,
      Divide: 111,
      NumpadDivide: 3111,
      // Punctuation
      SemiColon: 186,
      Comma: 188,
      Period: 190,
      Quote: 222,
      Slash: 191,
      BackSlash: 220,
      Equal: 187,
      Dash: 189,
      LBracket: 219,
      RBracket: 221,
      Tilde: 192,
    };
  }
}
