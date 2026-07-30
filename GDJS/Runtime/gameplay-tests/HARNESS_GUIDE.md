# Gameplay test harness guide

This is the reference for writing gameplay tests: JavaScript scripts run
against the real game (in a preview), stepping frames deterministically,
simulating inputs and asserting on the game state.

This file is the **single source of truth** for the harness documentation:
it is used to build the AI prompts and the code editor autocompletions.
Keep it in sync with `gameplay-test-runner.ts`.

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
  releaseAllInputs(): void;

  // INSPECTION (read-only snapshots)
  /** All live instances of an object. Order is UNSPECIFIED - never assume
   * index 0 is the nearest. `id` is runtime-only: never hardcode an id. */
  getObjects(objectName: string): ObjectSnapshot[];
  /** Instances of objectName within radius of the first instance of
   * referenceObjectName, sorted by distance. */
  getNearby(objectName: string, referenceObjectName: string, radius: number): NearbySnapshot[];
  /** 2D line-of-sight test between the centers of two objects. */
  hasLineOfSight(referenceObjectName: string, targetObjectName: string,
                 blockerObjectNames: string[]): { clear: boolean, blockedBy?: string, blockedAt?: {x: number, y: number} };
  /** To check if a dialog/UI panel is open, check its LAYER visibility -
   * not `hidden` on the objects. Returns null if the layer does not exist. */
  getLayer(layerName: string): { visible: boolean } | null;
  /** Returns the raw variable entry ({ name, value, type, children... }) or
   * undefined. Booleans are real booleans: check `v?.value === true`,
   * NEVER `v.value === "True"`. */
  getSceneVariable(variableName: string): VariableData | undefined;
  getGlobalVariable(variableName: string): VariableData | undefined;
  /** Include full snapshots of this object in the final result. */
  watch(objectName: string): void;

  // NAVIGATION INTENT (hints only - translate them to the game's controls!)
  getNavigationHint(referenceObjectName: string,
                    target: { name: string, id?: number } | { x: number, y: number, z?: number },
                    options?: { jumpThreshold?: number, reachRadius?: number }): NavigationHint | null;
  /** Aim (FPS-style, via mouse deltas) at the target. Steps frames itself:
   * NEVER call it inside an onFrame callback. */
  lookToward(referenceObjectName: string,
             target: { name: string, id?: number } | { x: number, y: number, z?: number },
             options?: { yawOnly?: boolean }): Promise<boolean>;

  // SCENARIO SETUP (arrange a situation - never use these to fake an assertion)
  spawn(objectName: string, x: number, y: number, z?: number, layerName?: string): ObjectSnapshot;
  removeObject(id: number): void;
  setObjectPosition(id: number, x: number, y: number, z?: number): void;
  setSceneVariable(variableName: string, value: string|number|boolean): void;
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
  /** Profile frames between start and stop: returns average measures per
   * section (events, render...) to find performance issues. */
  startProfiling(): void;
  stopProfiling(): { framesAverageMeasures: Object, stats: Object } | null;
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
  /** Per-behavior state, e.g. behaviors.PlatformerObject.props. Properties
   * defined in a custom object/behavior editor are NOT exposed: derive them
   * from the game state instead. */
  behaviors: { [behaviorName: string]: { act: boolean, props: Object } };
  children?: { [objectName: string]: ObjectSnapshot[] };
}

interface NavigationHint {
  shouldMoveLeft: boolean; shouldMoveRight: boolean;
  shouldMoveUp: boolean; shouldMoveDown: boolean;
  shouldJump: boolean;
  shouldTurnLeft: boolean; shouldTurnRight: boolean;
  shouldLookUp: boolean; shouldLookDown: boolean;
  angleDiff: number; pitchDiff: number;
  dominantAxis: 'x' | 'y';
  reached: boolean; distanceTo: number;
  targetX: number; targetY: number; targetZ?: number;
  relativeX: number; relativeY: number; relativeZ?: number;
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

- The harness patches pointer lock: `requestPointerLock()` is a no-op and
  the "mouse is locked" condition is true once the game requested it. Many
  FPS games have a "first click to focus" event — always send one dummy
  click first (press, step, release, step).
- DO NOT use `setMousePosition` in pointer-lock FPS games: the game
  raycasts from the crosshair. Aim with `lookToward` (or `setMouseDelta`
  once per frame in `onFrame`), then walk.
- ALWAYS `await lookToward(...)` (without `yawOnly`) immediately before
  shooting or interacting — the pitch changes with distance.
- WASD moves relative to the camera: never use `shouldMoveLeft/Right` to
  choose `a`/`d` (they strafe). Aim first (`lookToward`), then hold the
  forward key in 30-frame chunks, re-aiming between chunks.
- Use a `reachRadius` of 80-150 in 3D games.

## Stuck detection and escalation

If `onStuck` applies the same input every time, the object stays stuck and
`onStuck` fires again every window — causing oscillation and no progress.

DON'T (oscillation): `onStuck: () => { useY = !useY; }`
DO (escalate): first try a sidestep + jump; on the second stuck event, give
up on this target (pick another one or `fail(...)` with what you observed).

## Cars / tanks / steering

Gate the throttle on `angleDiff`: only accelerate when
`Math.abs(hint.angleDiff) < 45`, otherwise turn in place first.

## Reading state

- Instances are returned in an unspecified order: to pick "the nearest",
  use `getNearby` (sorted) — never `getObjects(...)[0]`.
- Multi-instance targets: pass the `id` to `getNavigationHint` so the hint
  doesn't oscillate between instances.
- Boolean variables are real booleans (`v?.value === true`).
- When in doubt about a shape, `console.log(JSON.stringify(...))` the first
  snapshot once — logs come back in the result.
- Use a local frame counter for interpolation inside `stepFrames` (the
  `frame` given to `onFrame` is cumulative across the whole script).

## Scenario setup ("jump into the middle of the game")

You don't have to play from the beginning of a scene. Use
`goToScene(name, { skipCreatingInstances: true })` +
`loadExternalLayout`/`spawn`/`setSceneVariable` to arrange the exact
situation to test. Setup helpers are for ARRANGING, not asserting: a test
that `spawn`s the win screen and asserts it exists proves nothing.

## Performance testing

Wrap the interesting frames with `startProfiling()` / `stopProfiling()` and
assert on the returned average section times, or on
`result.performance.avgStepMs` (logic time per frame, wall-clock).
