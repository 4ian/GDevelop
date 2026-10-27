## Execution model

- A test is the body of `async (harness) => { ... }`. `harness` and a
  capturing `console` are the only globals you should use.
- The game logic only advances when you call `await harness.stepFrames(...)`
  or `await harness.stepUntil(...)`. Each stepped frame uses a fixed time
  delta (1/60th of a second) — tests are deterministic in time and can run
  faster than real time.
- All step/navigation calls MUST be awaited, or the script will exit after
  one frame.
- Do not use `setTimeout` or `setInterval` — use `stepFrames`/`stepUntil`.
- The test ends when the script returns, throws, hits a failed assertion,
  reaches the frame budget (default 20 000) or the wall-clock timeout
  (default 30s).
- `passed` = the script completed with no failed assertion. A failed
  assertion → `failed`. A thrown error / unknown API → `error`. Frame or
  time budget exceeded → `timeout`.
- A run that completes without stepping a single frame nor making any
  assertion is an `error` (a no-op script — often a function definition
  instead of the body statements).

## API

```typescript
interface Harness {
  // NAVIGATION / STEPPING
  /** Load a scene fresh. Call before using getObjects on scene objects.
   * skipCreatingInstances starts the scene EMPTY (use spawn/loadExternalLayout). */
  goToScene(sceneName: string, options?: { skipCreatingInstances?: boolean }): Promise<void>;
  /** Step N frames. onFrame runs after each frame: use it for reactive input. */
  stepFrames(count: number, options?: { dtMs?: number, onFrame?: (c: {frame: number}) => void }): Promise<void>;
  /** Step until condition() is true, at most maxFrames. Returns whether met.
   * stuckDetection fires onStuck when the object moved less than
   * minDisplacement (default 5px) over windowFrames (default 30) — all keys
   * are auto-released before onStuck for a clean slate. */
  stepUntil(condition: () => boolean, options: {
    maxFrames: number,
    onFrame?: (c: {frame: number}) => void,
    stuckDetection?: { objectName: string, windowFrames?: number, minDisplacement?: number,
                       onStuck?: (c: {frame: number, x: number, y: number, z: number}) => void },
  }): Promise<boolean>;
  /** Step until the object stops moving (moved less than tolerance,
   * default 0.5, for stableFrames, default 20, consecutive frames), at
   * most maxFrames (default 300). Use it instead of a hand-written
   * "compare and update" stepUntil condition (which silently passes
   * without stepping - see the rule below). */
  stepUntilObjectIsStable(objectName: string,
    options?: { tolerance?: number, stableFrames?: number, maxFrames?: number }): Promise<boolean>;
  getSceneName(): string;
  getSceneStack(): string[];

  // INPUT (state is applied on the NEXT stepped frame)
  /** Accepts GDevelop event-sheet names ("Left", "Space", "a", "Num1", "LShift")
   * and Web API names ("ArrowLeft", "Enter"...). Throws on unknown names. */
  setKeyPressed(keyName: string, pressed: boolean): void;
  /** Position in SCENE coordinates of the given layer — always pass the layer
   * of the object you are pointing at. */
  setMousePosition(x: number, y: number, layerName?: string): void;
  /** Position in game resolution ("screen") pixels. */
  setMousePositionScreen(screenX: number, screenY: number): void;
  /** FPS/pointer-lock mouse look: apply once per frame from onFrame. */
  setMouseDelta(deltaX: number, deltaY: number): void;
  setMouseButtonPressed(pressed: boolean, button?: 'left'|'right'|'middle'): void;
  touchStart(identifier: number, x: number, y: number, layerName?: string): void;
  touchMove(identifier: number, x: number, y: number, layerName?: string): void;
  touchEnd(identifier: number): void;
  getGameResolutionWidth(): number;
  getGameResolutionHeight(): number;
  /** Change the game resolution, as if the game window was resized, to test
   * layouts made for other screen sizes. Step at least one frame before asserting
   * positions or taking a screenshot. */
  setGameResolutionSize(width: number, height: number): void;
  releaseAllInputs(): void;

  // INSPECTION (read-only snapshots)
  /** All live instances of an object. Order is UNSPECIFIED - never assume
   * index 0 is the nearest. `id` is runtime-only: never hardcode an id.
   * childrenDepth (default 1, max 8) is how deep `children` goes. */
  getObjects(objectName: string, options?: { childrenDepth?: number }): ObjectSnapshot[];
  /** Instances of objectName within radius of the first instance of
   * referenceObjectName, sorted by distance (3D distance when objects
   * have a Z). */
  getNearby(objectName: string, referenceObjectName: string, radius: number,
            options?: { childrenDepth?: number }): NearbySnapshot[];
  /** Line-of-sight test between the centers of two objects. 2D ONLY:
   * uses the 2D hitboxes in the X/Y plane and ignores Z. */
  has2dLineOfSight(referenceObjectName: string, targetObjectName: string,
                 blockerObjectNames: string[]): { clear: boolean, blockedBy?: string, blockedAt?: {x: number, y: number} };
  /** The raw gdjs.RuntimeLayer, or null if the layer does not exist. To
   * check if a dialog/UI panel is open, check its LAYER visibility
   * (getRuntimeLayer('UI')?.isVisible()) - not `hidden` on the objects. */
  getRuntimeLayer(layerName: string): gdjs.RuntimeLayer | null;
  /** JSON-safe camera of a layer (null if it does not exist). angle is
   * the yaw of the view (same convention as object angles); rotationX is
   * 0 looking straight down (the 2D default) and 90 at the horizon, so
   * the pitch of a first-person view is rotationX - 90 (positive =
   * looking up). */
  getCameraState(layerName?: string): { x: number, y: number, z: number,
    rotationX: number, rotationY: number, angle: number, zoom: number } | null;
  /** The recorded events so far (sceneChanged/sceneReset with their
   * cause...): lets a test assert the game restarted its scene. */
  getEventLog(): Array<{ frame: number, event: string, cause?: string }>;
  /** Sounds/musics played so far with their frame - a direct signal that
   * a mechanic fired (a pickup, a shot...). */
  getPlayedSounds(): Array<{ sound: string, frame: number }>;
  /** Returns the raw variable entry ({ name, value, type, children... }) or
   * undefined. Booleans are real booleans: check `v?.value === true`,
   * NEVER `v.value === "True"`. */
  getSceneVariable(variableName: string): VariableData | undefined;
  getGlobalVariable(variableName: string): VariableData | undefined;
  getObjectVariable(objectIdOrName: number | string, variableName: string): VariableData | undefined;
  /** Include full snapshots of this object in the final result. */
  watch(objectName: string): void;
  /** The raw gdjs.RuntimeObject of an instance (an id from `getObjects`,
   * or an object name: first instance), or null if not found. Behaviors:
   * getRuntimeObject('Player')?.getBehavior('PlatformerObject') - also
   * null if the behavior does not exist. */
  getRuntimeObject(objectIdOrName: number | string): gdjs.RuntimeObject | null;
  /** LAST RESORT: the raw gdjs.RuntimeGame / gdjs.RuntimeScene being
   * tested. Prefer the harness APIs - direct mutations can invalidate
   * what the test asserts. */
  getRuntimeGame(): gdjs.RuntimeGame;
  getCurrentRuntimeScene(): gdjs.RuntimeScene;

  // MOVING TOWARD THINGS (measurements - the movement strategy is yours)
  /** Where the target is relative to the object (2D and 3D). Pick the keys
   * to press with resetSceneAndProbeControls; detect a lack of progress
   * with makeProgressTracker. */
  /** Options: fromCamera (measure from a layer's camera - what a
   * first-person view aims with), fromZ (an eye/muzzle height), heading
   * (compute yawDiff against this heading - turrets, weapons with their
   * own rotation, e.g. tank.angle + tank.state.TopRotation). */
  getRelativePosition(referenceObjectName: string,
                      target: { name: string, id?: number } | { x: number, y: number, z?: number },
                      options?: { reachRadius?: number, fromCamera?: string,
                                  fromZ?: number, heading?: number }): RelativePosition | null;
  /** Measure what each key ACTUALLY does to the object (2D and 3D - dz is
   * measured when the object has a Z): restarts the scene, holds the key
   * for `frames` (default 30) frames, reports net + extreme displacements
   * and yaw change. Compare to `baseline` (no key held: gravity/idle drift
   * affects both). Restarts the scene at the end - call it FIRST, before
   * the test scenario. Its restarts appear in the event log as sceneReset
   * events with the `controlsProbe` cause: expected, not a malfunction. */
  resetSceneAndProbeControls(objectName: string, keyNames: string[],
                options?: { frames?: number }): Promise<{
    baseline: ControlProbeResult | null,
    keys: { [keyName: string]: ControlProbeResult | null },
  }>;
  /** Track progress toward a target (3D distance when the object has a Z).
   * Call update() once per loop iteration: `stalled` becomes true when the
   * distance shrank by less than minProgress (default 8px) over
   * windowFrames (default 60) - time to try an escape.
   * reset() after switching targets. */
  makeProgressTracker(referenceObjectName: string,
                      target: { name: string, id?: number } | { x: number, y: number, z?: number },
                      options?: { windowFrames?: number, minProgress?: number, reachRadius?: number }):
    { update: () => ProgressStatus | null, reset: () => void };
  /** Aim at the target by applying mouse deltas (FPS/pointer-lock style,
   * yaw + pitch in 3D), adapting to the game's mouse sensitivity per axis.
   * sawYawResponse=false => the game ignored the mouse (pointer lock not
   * engaged: click once first). If the vertical aim shows no response, it
   * is undone and the aim falls back to yaw-only (sawPitchResponse=false).
   * Steps frames itself: NEVER call it inside an onFrame callback.
   * Null if the object or target is missing. */
  lookTowardWithMouseDelta(referenceObjectName: string,
             target: { name: string, id?: number } | { x: number, y: number, z?: number },
             options?: { yawOnly?: boolean, fromCamera?: string,
                         toleranceDegrees?: number /* default 3 - lower it to hit a small or far target */ }):
    Promise<{ aimed: boolean, yawDiff: number, pitchDiff: number,
              sawYawResponse: boolean, sawPitchResponse: boolean,
              measuredFrom: 'camera' | 'object' } | null>;

  // SCENARIO SETUP (arrange a situation - never use these to fake an assertion)
  spawn(objectName: string, x: number, y: number, z?: number, layerName?: string): ObjectSnapshot;
  removeObject(id: number): void;
  /** Takes effect immediately (physics bodies included), but the game's
   * logic keeps acting each stepped frame (forces, AI...): to hold an
   * object somewhere, re-apply the position every frame via onFrame. */
  setObjectPosition(id: number, x: number, y: number, z?: number): void;
  setSceneVariable(variableName: string, value: string|number|boolean): void;
  setObjectVariable(objectIdOrName: number | string, variableName: string, value: string|number|boolean): void;
  setGlobalVariable(variableName: string, value: string|number|boolean): void;
  /** Create the instances of an external layout in the current scene. */
  loadExternalLayout(externalLayoutName: string, x?: number, y?: number, z?: number): void;

  // VERDICTS AND EVIDENCE
  /** Record a named assertion. THROWS immediately on failure, stopping the
   * script (wrap in try/catch if the check is optional). */
  assert(condition: boolean, message: string): void;
  /** Record a failure and throw immediately. */
  fail(message: string): void;
  /** Downscaled screenshot returned in the result (max 5 per run). DOM
   * overlays (text inputs...) do not appear in screenshots. */
  takeScreenshot(label?: string): Promise<void>;
  /** Profile frames between start and stop. Returns a flat, JSON-safe
   * summary - ALSO attached to the test result as `result.profiles`, so
   * do NOT console.log it (it would be truncated). Sections (events,
   * physics, render... - nested ones flattened as "parent > child") are
   * sorted by average time descending, with the worst single frame per
   * section (maxTimeMs - spikes that averages hide). `worstFrames` and
   * the window use harness frame numbers: correlate with eventLog. The
   * timeline is downsampled past 120 frames (bucket MAX, spikes kept). */
  startProfiling(): void;
  stopProfiling(): { startFrame: number, endFrame: number,
                     avgStepTimeMs: number, maxStepTimeMs: number,
                     sections: Array<{ name: string, avgTimeMs: number, maxTimeMs: number }>,
                     worstFrames: Array<{ frame: number, timeMs: number }>,
                     frameTimesMs: number[], frameTimesBucketSize: number,
                     objectCounts: { [objectName: string]: number },
                     renderer: { drawCalls: number, triangles: number,
                                 geometries: number, textures: number } | null,
                     jsHeapUsedMb?: number } | null;
}

interface ObjectSnapshot {
  id: number; name: string;
  x: number; y: number; z?: number;
  /** In FPS/3D games, `angle` is the YAW; `rotationX` is the pitch. */
  angle: number; rotationX?: number; rotationY?: number;
  width: number; height: number; depth?: number;
  /** Use centerX/centerY (never x + width/2): 3D models can have
   * non-default origins. */
  centerX: number; centerY: number; centerZ?: number;
  layer: string; hidden: boolean;
  animation?: string; text?: string; opacity?: number;
  variables: VariableData[];
  /** The object's own conditions/expressions, evaluated at snapshot time
   * (custom objects expose their properties as PropertyX). */
  state: { [conditionOrExpressionName: string]: boolean | number | string };
  /** Each behavior's conditions/expressions, evaluated at snapshot time
   * under the EXACT names used in the game's events: e.g.
   * behaviors.PlatformerObject.state.IsOnFloor, .state.CurrentSpeed —
   * including configuration (.state.MaxSpeed) and, for events-based
   * behaviors, their properties (.state.PropertyHealth). PREFER these over
   * inferring state from coordinates. Reading an unknown name throws with
   * the list of available names. */
  behaviors: { [behaviorName: string]: { act: boolean,
    state: { [conditionOrExpressionName: string]: boolean | number | string } } };
  /** Only on a CHILD of a custom object: width/height/depth/angle/rotationX/
   * rotationY above are the child's OWN, LOCAL values (not scaled nor
   * rotated by its parents), unlike its positions and worldBounds, which are
   * in scene coordinates. */
  isLocalGeometry?: boolean;
  /** Only on a CHILD of a custom object: its box in SCENE coordinates (the
   * child's own box — its own complete transformation included, rotations
   * around X, Y and Z as well as flips — through the complete transformation
   * of its parents) — the only size information of a child that accounts for
   * them. minZ/maxZ are 0 in 2D. */
  worldBounds?: { minX: number, minY: number, minZ: number,
                  maxX: number, maxY: number, maxZ: number };
  /** For a custom object: its children, keyed by child object name (see
   * "Custom objects"). Direct children only, unless childrenDepth is used. */
  children?: { [objectName: string]: ObjectSnapshot[] };
}

interface NearbySnapshot extends ObjectSnapshot {
  /** Distance between the centers (3D when both objects have a Z). */
  distance: number;
  /** Center of this object minus the center of the reference object. */
  relativeX: number;
  relativeY: number;
  relativeZ?: number;
  above: boolean;
  below: boolean;
  left: boolean;
  right: boolean;
  /** Direction from the reference object to this one, in degrees
   * (same convention as object angles). */
  bearingFromReference: number;
}

interface RelativePosition {
  relativeX: number; relativeY: number; relativeZ?: number;
  /** Full distance (3D when Z is available). */
  distance: number;
  /** Distance ignoring Z (equals distance in 2D). */
  horizontalDistance: number;
  /** Object angle (yaw) vs direction of the target, degrees in [-180, 180]. */
  yawDiff: number;
  /** Vertical aim difference in degrees (3D only, 0 in 2D). */
  pitchDiff: number;
  dominantAxis: 'x' | 'y';
  /** distance <= reachRadius (default 30). */
  reached: boolean;
  targetX: number; targetY: number; targetZ?: number;
}

interface ControlProbeResult {
  /** Net displacement over the probe. */
  dx: number; dy: number; dz?: number;
  /** Extremes during the probe: a jump shows as a negative minDy even if
   * the object landed back (net dy ~ 0). */
  minDx: number; maxDx: number; minDy: number; maxDy: number;
  minDz?: number; maxDz?: number;
  yawDelta: number;
}

interface ProgressStatus {
  frame: number; distance: number;
  reached: boolean; stalled: boolean;
}
```

## Mandatory first step: build the control map

Before writing any input simulation, identify exactly how the game is
controlled. The game may have no "player" at all (RTS, point-and-click,
puzzle...). Derive the controls from the project (object behaviors, their
properties, and the scene events) — NEVER guess the control scheme, NEVER
assume arrow keys.

- If the player has a keyboard mapper behavior (e.g.
  `PhysicsCar3DKeyboardMapper`, `TopDownKeyboardMapper`), the actual
  configured key values are in its behavior properties — do NOT assume
  defaults. (`PlatformerMultitouchMapper` is NOT a keyboard mapper.)
- GDevelop Platformer default keyboard keys (when default controls are
  not ignored): move = `Left`/`Right`, ladder up = `Up`, down = `Down`,
  jump = `Space` (NOT `Up`).
- Prefer keyboard input whenever available — it is simpler and more
  reliable. Virtual joysticks (SpriteMultitouchJoystick) are NOT supported:
  use the keyboard path instead.
- Then VERIFY the control map empirically with `resetSceneAndProbeControls` before
  relying on it: it measures what each candidate key actually does
  (displacement vs the no-key baseline; a jump = negative `minDy`). One
  probe call replaces guessing and documentation lookups:

```javascript
await harness.goToScene('Level');
const probes = await harness.resetSceneAndProbeControls('Player', ['Left', 'Right', 'Space']);
console.log(JSON.stringify(probes)); // Keep it in the first run's output.
// probes.keys.Right.dx - probes.baseline.dx > 0  => 'Right' moves right.
```

## Driving toward a target — the recipe

Games differ too much (platforms, walls, gravity, vehicles...) for a
generic autopilot. Write a small control loop from these parts:

1. `getRelativePosition` for the geometry (recompute it every frame — it is
   just math, it costs nothing).
2. A HYSTERESIS band, not a tiny deadzone: keep moving while
   `Math.abs(rel.relativeX) > reachRadius`, only stop once well inside.
   Stopping the instant `relativeX` crosses 0 strands the object at a pixel
   boundary (and above/below a target it can never reach vertically).
3. `makeProgressTracker` + an ESCALATING escape when `stalled`: the target
   may be unreachable in a straight line (e.g. a coin below the platform
   you stand on — walk off an edge first).

```javascript
const tracker = harness.makeProgressTracker('Player', { x: coin.centerX, y: coin.centerY });
let escapes = 0;
for (let i = 0; i < 3000; i++) {
  const coins = harness.getObjects('Coin');
  if (coins.length === 0) break;
  const rel = harness.getRelativePosition('Player', { x: coins[0].centerX, y: coins[0].centerY });
  if (!rel) break;
  harness.setKeyPressed('Right', rel.relativeX > 30);   // hysteresis band,
  harness.setKeyPressed('Left', rel.relativeX < -30);   // not > 1 / < -1
  const progress = tracker.update();
  if (progress && progress.stalled) {
    escapes++;
    if (escapes === 1) { harness.setKeyPressed('Space', true); await harness.stepFrames(10); harness.setKeyPressed('Space', false); }
    else if (escapes === 2) { harness.setKeyPressed('Left', true); await harness.stepFrames(45); harness.releaseAllInputs(); } // back off
    else { harness.fail('Player is stuck: no progress toward the coin at ' + JSON.stringify({x: rel.targetX, y: rel.targetY})); }
    tracker.reset();
  }
  await harness.stepFrames(1);
}
harness.releaseAllInputs();
```

If positions in your logs ever move AGAINST the game's physics (an object
teleporting back to its spawn, a `sceneReset` event you did not cause),
report it in the test output — do not theorize around it.

## Trigger-once, clicks and shots — CRITICAL

GDevelop "Trigger once" conditions fire only on the FIRST frame a condition
is true. To click or shoot repeatedly: press, step at least 1 frame,
release, step at least 1 frame, then press again. If you press again before
the input was released for a frame, the action is silently skipped.

## Dragging objects

1. Read the object's `points`/center via `getObjects` (use `centerX/Y`).
2. Move the mouse to the center, step 1 frame.
3. Press the left button, step 1-2 frames.
4. Move the mouse in SMALL increments over 30-60 frames (drag slowly —
   physics objects thrown in 1-2 frames behave erratically).
5. Release the button, step 1 frame.

## FPS games (pointer lock)

- Pointer lock is simulated: `requestPointerLock()` never locks the real
  mouse, but once the game requests it, the pointer is reported as locked
  (including `document.pointerLockElement`) and `setMouseDelta` deltas are
  delivered both to the input manager and as `pointermove` DOM events on
  the canvas — so mouse-look extensions receive them. Many FPS games
  request the lock on a "first click to focus" event: ALWAYS send one
  dummy click first (press, step, release, step), or mouse deltas will be
  ignored by the game.
- DO NOT use `setMousePosition` in pointer-lock FPS games: the game
  raycasts from the crosshair. Aim with `lookTowardWithMouseDelta` (or `setMouseDelta`
  once per frame in `onFrame`), then walk.
- ALWAYS `await lookTowardWithMouseDelta(...)` (without `yawOnly`) immediately before
  shooting or interacting — the pitch changes with distance.
- WASD moves relative to the camera: `a`/`d` STRAFE — never pick them from
  the target's left/right side. Aim first (`lookTowardWithMouseDelta`), then hold the
  forward key in 30-frame chunks, re-aiming between chunks. (`resetSceneAndProbeControls`
  measures displacements in the current camera frame: probe after aiming.)
- Use a `reachRadius` of 80-150 in 3D games.

## Stuck detection and escalation

If a stall escape applies the same input every time, the object stays stuck
and the stall fires again every window — causing oscillation and no
progress.

DON'T (oscillation): on stall, `useY = !useY;`
DO (escalate): first try a sidestep + jump; on the second stall, give
up on this target (pick another one or `fail(...)` with what you observed).

(`stepUntil` also has a lower-level `stuckDetection` option based on raw
displacement; `makeProgressTracker` measures progress toward YOUR target
and works in manual loops — prefer it.)

## Cars / tanks / steering

Gate the throttle on `yawDiff`: only accelerate when
`Math.abs(rel.yawDiff) < 45`, otherwise turn in place first.

## Reading state

- PREFER `behaviors.X.state` checks (`IsOnFloor`, `CanJump`,
  `PropertyHealth`...) over inferring state from positions or thresholds —
  the names are the same as in the game's events, and configuration values
  (`JumpSpeed`, `MaxSpeed`...) are there too: no need to measure them.
  This also makes tests survive variants of a game (same events, different
  settings): assert on the behavior's own state (`state.Angle` of a
  top-down movement) rather than on object properties it may or may not
  drive (`rotateObject` can be off). `behaviors.X.act` says whether a
  behavior is currently deactivated (attacks often root the player by
  deactivating its movement).
- Derive thresholds from the CONFIGURATION in the state, not from a
  measured run: `jumpHeight > 0.8 * JumpSpeed² / (2 * Gravity)` means "it
  jumped as far as configured" and works on every variant of the game —
  a magic `> 150` breaks as soon as a setting differs.
- `Object.keys(snapshot.state)` (and an unknown name throwing with the
  list of available names) is the fastest way to discover the state of an
  object or behavior: log it once on a first exploration run.
- Compare against a MEASURED baseline, not against zero: a car engine can
  idle at 1000 RPM, a "moved" check must subtract the standing drift.
- Instances are returned in an unspecified order: to pick "the nearest",
  use `getNearby` (sorted) — never `getObjects(...)[0]`. Distance TIES are
  common in symmetric levels: a test picking `[0]` must stay correct for
  any of the tied instances.
- Use `centerX`/`centerY`/`centerZ` from snapshots (origins vary); in 3D,
  `centerZ` is usually the coordinate that matters.
- Multi-instance targets: pass the `id` to `getRelativePosition` and
  `makeProgressTracker` so the target doesn't oscillate between instances.
- Boolean variables are real booleans (`v?.value === true`).
- When in doubt about a shape, `console.log(JSON.stringify(...))` the first
  snapshot once — logs come back in the result.
- Use a local frame counter for interpolation inside `stepFrames` (the
  `frame` given to `onFrame` is cumulative across the whole script).

### Custom objects

- A custom object exposes its own PROPERTIES in `state` as `PropertyX`
  (`PropertyHealth`, `PropertyMaxLives`...), next to its other
  expressions/conditions — only those taking no argument are there, so read
  anything else through the object's expressions in an event or
  `getRuntimeObject`. Shared properties are a BEHAVIOR feature, not a custom
  object one: read them on the behavior
  (`behaviors.MyBehavior.state.SharedPropertyMaxLives`).
- Its children are in `children`, keyed by child object name
  (`children.TankTop_Combined[0]`). Their `layer` is the layer of the custom
  object itself — its internal layers are not visible.
- WORLD (scene) values of a child: its POSITIONS (`x`, `y`, `z`, `centerX`,
  `centerY`, `centerZ`) and its `worldBounds`. The positions are computed
  with the COMPLETE transformation of every custom object above the child
  (pivots, rotations around X/Y/Z, scales, flips), so they can be used
  directly with `getNearby` or to point at a child:
  `setMousePosition(child.centerX, child.centerY, child.layer)` then
  `setMouseButtonPressed(true)` and `setMouseButtonPressed(false)`.
- LOCAL values of a child (marked by `isLocalGeometry: true`): its size and
  angles (`width`, `height`, `depth`, `angle`, `rotationX`, `rotationY`) are
  its OWN values, in the local space of its parent — NEITHER scaled NOR
  rotated by it (a rotated box has no width along the scene axes, and the
  angles of the parents are not summed into the child's).
- So NEVER measure a child in the scene with `width`/`height`/`depth`, and
  never build a box from `x` + `width`: use `worldBounds`
  (`{ minX, minY, minZ, maxX, maxY, maxZ }`, the child's box with its OWN
  complete transformation - rotations around X, Y and Z, flips - and the
  complete transformation of its parents applied) — e.g. a 10-wide child of
  a parent scaled by 2 keeps `width: 10` but spans 20 in `worldBounds`, and
  a 10x6x4 child rotated by 90° around X spans 10x4x6 there.
- `children` holds the direct children only; for nested custom objects pass
  `getObjects('CombinedTank', { childrenDepth: 2 })` (max 8) to reach
  `children.TankTop_Combined[0].children.TankCanon[0]`.

## Raw GDJS escape hatches (`getRuntime*`)

The `getRuntime*` methods return raw GDJS engine objects
(`gdjs.RuntimeGame`, `gdjs.RuntimeScene`, `gdjs.RuntimeLayer`,
`gdjs.RuntimeObject`) — the full engine API for when no harness method
covers a need. Every other harness method returns JSON-safe data; these do
not:

- Prefer the harness methods (snapshots, inputs, spawn...) when they exist.
- NEVER `console.log` a raw object whole (circular references, huge
  output): log only the specific value you read from it.
- Always null-check the chain:
  `harness.getRuntimeObject('Player')?.getBehavior('PlatformerObject')` —
  both return null when not found.
- Read, don't mutate: changing the game through them can invalidate what
  the test asserts.

## Reliable tests (sizing, waiting, counting)

- Size every `stepUntil`'s `maxFrames` to about TWICE what the working
  case needs: a broken mechanic then FAILS an assertion instead of
  timing out with no explanation. Stop measuring as soon as the thing
  happened (`stepUntil(() => moved > 30)`), instead of stepping a fixed
  window and checking after.
- A `stepUntil` condition must be PURE: it is evaluated before stepping,
  so a condition that updates its own comparison variable is true
  immediately and silently passes. Accumulate state in `onFrame` (which
  runs after each stepped frame) — or use `stepUntilObjectIsStable` for
  "wait until it stops moving".
- Prefer an INSTANTANEOUS signal over a delta measured across a window
  for short-lived objects (a bullet can die before the window closes:
  its `angle` says the direction immediately). Assert the BEFORE value of
  a count (`particlesBefore === 0`), not just that it grew.
- A warm-up input (a click to take the pointer lock...) is only safe if
  it is inert for what is measured: check what it triggers first — in
  shooter games, a click usually fires.
- "Slow time, wait, restart" game-overs: a `Wait` counts in SCENE time,
  so 0.15s at a time scale of 0.15 is a full second — about 60 frames,
  six times what the number suggests.

## Scenario setup ("jump into the middle of the game")

You don't have to play from the beginning of a scene. Use
`goToScene(name, { skipCreatingInstances: true })` +
`loadExternalLayout`/`spawn`/`setSceneVariable`/`setObjectVariable` to
arrange the exact situation to test. Setup helpers are for ARRANGING, not
asserting: a test that `spawn`s the win screen and asserts it exists
proves nothing.

To bring two objects together, MOVE THE ONE whose physics the test does
not depend on (teleporting a physics character onto unknown terrain makes
the simulation throw it around), place it RELATIVE to the other (on the
line between them), and assert the arranged-for object stayed put. Prefer
what the level already contains over spawning a copy of it (the level's
own hazard is often closer than anything a test can place).

## Performance testing

Wrap the interesting frames with `startProfiling()` / `stopProfiling()`:
the returned `sections` (sorted by average time descending) tell where the
time goes, and `maxTimeMs` which section spikes. Use `worstFrames` (harness
frame numbers) to find WHEN a spike happened and correlate with the
`eventLog` frames (a spawn, a wave...). The full summary is attached to the
test result as `result.profiles` — do NOT `console.log` it (it would be
truncated); log at most a one-line conclusion. Assert on the profile values
or on `result.performance.avgStepMs` (logic time per frame, wall-clock).
