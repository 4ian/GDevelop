const ELECTRON_MOUSE_BUTTONS = ['left', 'right', 'middle', 'back', 'forward'];

// Keep this script static: no MCP-provided value is interpolated into code
// executed in the preview renderer. `userGesture: true` is the deterministic
// fallback for Chromium's autoplay policy when a synthetic native click alone
// does not resume the WebAudio context quickly enough.
const RESUME_PREVIEW_AUDIO_SCRIPT = `(() => {
  const howler =
    typeof globalThis !== 'undefined' && globalThis.Howler
      ? globalThis.Howler
      : null;
  const audioContext = howler && howler.ctx ? howler.ctx : null;
  const makeResult = error => ({
    audioContextPresent: !!audioContext,
    audioContextState: audioContext ? audioContext.state : null,
    audioUnlocked: !!audioContext && audioContext.state === 'running',
    audioUnlockError: error ? String(error.message || error) : null,
    userActivation:
      typeof navigator !== 'undefined' && navigator.userActivation
        ? {
            isActive: !!navigator.userActivation.isActive,
            hasBeenActive: !!navigator.userActivation.hasBeenActive,
          }
        : null,
  });

  if (
    !audioContext ||
    audioContext.state === 'running' ||
    typeof audioContext.resume !== 'function'
  ) {
    return makeResult(null);
  }

  return Promise.resolve(audioContext.resume()).then(
    () => makeResult(null),
    error => makeResult(error)
  );
})()`;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getMouseButtonName = button => {
  if (typeof button === 'string') {
    const normalized = button.toLowerCase();
    return ELECTRON_MOUSE_BUTTONS.indexOf(normalized) !== -1
      ? normalized
      : 'left';
  }
  return ELECTRON_MOUSE_BUTTONS[button] || 'left';
};

const findClickDescriptor = (inputs, contentBounds) => {
  const width = Math.max(1, Number(contentBounds && contentBounds.width) || 1);
  const height = Math.max(
    1,
    Number(contentBounds && contentBounds.height) || 1
  );
  let x = Math.floor(width / 2);
  let y = Math.floor(height / 2);
  let button = 'left';
  let found = false;

  for (const input of Array.isArray(inputs) ? inputs : []) {
    if (!input || typeof input !== 'object') continue;
    if (typeof input.x === 'number' && Number.isFinite(input.x)) x = input.x;
    if (typeof input.y === 'number' && Number.isFinite(input.y)) y = input.y;

    const type =
      typeof input.type === 'string' ? input.type.trim().toLowerCase() : '';
    if (
      type === 'mousebuttonpressed' ||
      type === 'clickandhold' ||
      type === 'mouseclickandhold' ||
      type === 'click_and_hold'
    ) {
      found = true;
      button = getMouseButtonName(input.button);
      break;
    }
  }

  return found
    ? {
        x: Math.round(clamp(x, 0, width - 1)),
        y: Math.round(clamp(y, 0, height - 1)),
        button,
      }
    : null;
};

const injectPreviewClickUserGesture = async (previewWindow, inputs) => {
  if (!previewWindow || previewWindow.isDestroyed()) {
    return {
      success: false,
      attempted: true,
      supported: true,
      error: 'The target preview window is unavailable.',
    };
  }

  const webContents = previewWindow.webContents;
  if (
    !webContents ||
    webContents.isDestroyed() ||
    typeof webContents.sendInputEvent !== 'function'
  ) {
    return {
      success: false,
      attempted: true,
      supported: false,
      error: 'The target preview does not support native input injection.',
    };
  }

  const click = findClickDescriptor(
    inputs,
    typeof previewWindow.getContentBounds === 'function'
      ? previewWindow.getContentBounds()
      : null
  );
  if (!click) {
    return {
      success: true,
      attempted: false,
      supported: true,
    };
  }

  if (previewWindow.isMinimized()) previewWindow.restore();
  previewWindow.show();
  previewWindow.focus();

  const common = {
    x: click.x,
    y: click.y,
    button: click.button,
    clickCount: 1,
  };
  webContents.sendInputEvent({
    type: 'mouseMove',
    x: click.x,
    y: click.y,
    movementX: 0,
    movementY: 0,
  });
  webContents.sendInputEvent({ type: 'mouseDown', ...common });
  webContents.sendInputEvent({ type: 'mouseUp', ...common });

  let audio = null;
  if (typeof webContents.executeJavaScript === 'function') {
    audio = await webContents.executeJavaScript(
      RESUME_PREVIEW_AUDIO_SCRIPT,
      true
    );
  }

  const audioUnlockFailed = !!(
    audio &&
    audio.audioContextPresent &&
    !audio.audioUnlocked
  );
  return {
    success: !(audio && audio.audioUnlockError) && !audioUnlockFailed,
    attempted: true,
    supported: true,
    nativeClickInjected: true,
    windowId: previewWindow.id,
    click,
    ...(audio || {}),
    error:
      audio && audio.audioUnlockError
        ? `The native click was injected, but WebAudio could not be resumed: ${
            audio.audioUnlockError
          }`
        : audioUnlockFailed
        ? `The native click was injected, but WebAudio remained in the "${audio.audioContextState ||
            'unknown'}" state.`
        : undefined,
  };
};

module.exports = {
  findClickDescriptor,
  injectPreviewClickUserGesture,
};
