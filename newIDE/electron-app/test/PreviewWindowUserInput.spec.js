const assert = require('assert');

const {
  findClickDescriptor,
  injectPreviewClickUserGesture,
} = require('../app/PreviewWindowUserInput');

const run = async () => {
  assert.deepStrictEqual(
    findClickDescriptor(
      [
        { type: 'mouseMove', x: 420, y: 180 },
        { type: 'mouseButtonPressed', button: 1 },
      ],
      { width: 640, height: 360 }
    ),
    { x: 420, y: 180, button: 'right' }
  );

  assert.deepStrictEqual(
    findClickDescriptor(
      [{ type: 'clickAndHold', x: 900, y: -10, button: 'left' }],
      { width: 640, height: 360 }
    ),
    { x: 639, y: 0, button: 'left' }
  );
  assert.strictEqual(
    findClickDescriptor([{ type: 'keyPressed', key: 'Space' }], {
      width: 640,
      height: 360,
    }),
    null
  );

  const inputEvents = [];
  const executeJavaScriptCalls = [];
  const windowCalls = [];
  const previewWindow = {
    id: 42,
    isDestroyed: () => false,
    isMinimized: () => true,
    restore: () => windowCalls.push('restore'),
    show: () => windowCalls.push('show'),
    focus: () => windowCalls.push('focus'),
    getContentBounds: () => ({ width: 640, height: 360 }),
    webContents: {
      isDestroyed: () => false,
      sendInputEvent: event => inputEvents.push(event),
      executeJavaScript: async (script, userGesture) => {
        executeJavaScriptCalls.push({ script, userGesture });
        return {
          audioContextPresent: true,
          audioContextState: 'running',
          audioUnlocked: true,
          audioUnlockError: null,
        };
      },
    },
  };

  const result = await injectPreviewClickUserGesture(previewWindow, [
    { type: 'clickAndHold', x: 320, y: 180, button: 'right' },
  ]);

  assert.deepStrictEqual(windowCalls, ['restore', 'show', 'focus']);
  assert.deepStrictEqual(inputEvents, [
    {
      type: 'mouseMove',
      x: 320,
      y: 180,
      movementX: 0,
      movementY: 0,
    },
    {
      type: 'mouseDown',
      x: 320,
      y: 180,
      button: 'right',
      clickCount: 1,
    },
    {
      type: 'mouseUp',
      x: 320,
      y: 180,
      button: 'right',
      clickCount: 1,
    },
  ]);
  assert.strictEqual(executeJavaScriptCalls.length, 1);
  assert.strictEqual(executeJavaScriptCalls[0].userGesture, true);
  assert(executeJavaScriptCalls[0].script.includes('audioContext.resume()'));
  assert.deepStrictEqual(result, {
    success: true,
    attempted: true,
    supported: true,
    nativeClickInjected: true,
    windowId: 42,
    click: { x: 320, y: 180, button: 'right' },
    audioContextPresent: true,
    audioContextState: 'running',
    audioUnlocked: true,
    audioUnlockError: null,
    error: undefined,
  });

  previewWindow.isMinimized = () => false;
  previewWindow.webContents.executeJavaScript = async () => ({
    audioContextPresent: true,
    audioContextState: 'suspended',
    audioUnlocked: false,
    audioUnlockError: null,
  });
  const lockedResult = await injectPreviewClickUserGesture(previewWindow, [
    { type: 'mouseButtonPressed', button: 'left' },
  ]);
  assert.strictEqual(lockedResult.success, false);
  assert.match(lockedResult.error, /remained in the "suspended" state/);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
