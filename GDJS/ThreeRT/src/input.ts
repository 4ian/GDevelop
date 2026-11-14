// ThreeRT's input (the frame script's `f.input`) to GDJS's input manager: keys, mouse buttons, the pointer, the
// wheel, and, when the pointer is captured (games reading mouse movements, like first person shooters), the
// movement of the mouse as `pointermove` events on the canvas.
import { gameViewport } from './browser';
import { threertState } from './gdjs-patches';

const g = globalThis as any;

/** ThreeRT's key names (by their place on a US keyboard) to the key codes of browsers, and their location. */
const keyCodes: Record<string, [number, number]> = {
  Space: [32, 0],
  Shift: [16, 1],
  Ctrl: [17, 1],
  Alt: [18, 1],
  Meta: [91, 1],
  Tab: [9, 0],
  Enter: [13, 0],
  Escape: [27, 0],
  Backspace: [8, 0],
  Left: [37, 0],
  Up: [38, 0],
  Right: [39, 0],
  Down: [40, 0],
  Minus: [189, 0],
  Equal: [187, 0],
  BracketLeft: [219, 0],
  BracketRight: [221, 0],
  Semicolon: [186, 0],
  Quote: [222, 0],
  Comma: [188, 0],
  Period: [190, 0],
  Slash: [191, 0],
  Backslash: [220, 0],
  Backquote: [192, 0],
};
for (let i = 0; i < 26; i++) keyCodes[String.fromCharCode(65 + i)] = [65 + i, 0];
for (let i = 0; i < 10; i++) keyCodes[String(i)] = [48 + i, 0];
for (let i = 1; i <= 12; i++) keyCodes['F' + i] = [111 + i, 0];

/** ThreeRT's mouse buttons (0 left, 1 middle, 2 right) to GDJS's (0 left, 1 right, 2 middle). */
const gdjsMouseButton = [0, 2, 1];

/** Radians of look by mouse count in ThreeRT apps (docs/RUNTIME.md "Input"): turned back into pixels. */
const radiansByCount = 0.0025;

type ThreeRTInput = {
  down(key: string): boolean;
  pressed(key: string): boolean;
  released(key: string): boolean;
  button(n: number): boolean;
  pointer: { u: number; v: number };
  look: { dx: number; dy: number };
  wheel: number;
  captured: boolean;
};

export const applyInput = (game: any, input: ThreeRTInput | null | undefined) => {
  if (!input) return;
  const inputManager = game.getInputManager();

  for (const key of Object.keys(keyCodes)) {
    const [code, location] = keyCodes[key];
    if (input.pressed(key)) inputManager.onKeyPressed(code, location);
    if (input.released(key)) inputManager.onKeyReleased(code, location);
  }
  for (let button = 0; button < 3; button++) {
    const name = 'Mouse' + button;
    if (input.pressed(name)) inputManager.onMouseButtonPressed(gdjsMouseButton[button]);
    if (input.released(name)) inputManager.onMouseButtonReleased(gdjsMouseButton[button]);
  }

  const movementX = input.look.dx / radiansByCount;
  const movementY = input.look.dy / radiansByCount;
  const x = input.pointer.u * gameViewport.width;
  const y = input.pointer.v * gameViewport.height;
  const gameCoordinates = game.getRenderer().convertPageToGameCoords(x, y);
  inputManager.onMouseMove(gameCoordinates[0], gameCoordinates[1], { movementX, movementY });

  threertState.pointerLocked = !!input.captured;
  const canvas = game.getRenderer().getCanvas && game.getRenderer().getCanvas();
  if (g.document) g.document.pointerLockElement = input.captured ? canvas : null;
  if (canvas && (movementX || movementY)) {
    const event = { type: 'pointermove', movementX, movementY, clientX: x, clientY: y, pageX: x, pageY: y, target: canvas, pointerType: 'mouse', preventDefault() {}, stopPropagation() {} };
    canvas.dispatchEvent(event);
    canvas.dispatchEvent({ ...event, type: 'mousemove' });
    if (g.document && g.document.dispatchEvent) {
      g.document.dispatchEvent({ ...event, type: 'mousemove' });
      g.document.dispatchEvent({ ...event, type: 'pointermove' });
    }
  }
  if (input.wheel) inputManager.onMouseWheel(-input.wheel * 100, 0, 0);
};
