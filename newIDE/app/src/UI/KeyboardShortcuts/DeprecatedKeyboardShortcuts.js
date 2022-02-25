import { isMacLike } from '../../Utils/Platform';

const CTRL_KEY = 17;
const SHIFT_KEY = 16;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const BACKSPACE_KEY = 8;
const SPACE_KEY = 32;
const DELETE_KEY = 46;
const EQUAL_KEY = 187;
const MINUS_KEY = 189;
const NUMPAD_ADD = 107;
const NUMPAD_SUBTRACT = 109;
const C_KEY = 67;
const F_KEY = 70;
const V_KEY = 86;
const X_KEY = 88;
const Y_KEY = 89;
const Z_KEY = 90;
const MID_MOUSE_BUTTON = 1;

/**
 * Deprecated class to handle shortcut. Don't use this anymore, prefer the non
 * deprecated version that does not add listener on the document (risking catching events
 * when the components are not focused).
 *
 * TODO: Replace InstancesEditor shortcuts by the new `KeyboardShortcuts`.
 */
export default class DeprecatedKeyboardShortcuts {
  constructor({
    onDelete,
    onMove,
    onCopy,
    onCut,
    onPaste,
    onUndo,
    onRedo,
    onSearch,
    onZoomOut,
    onZoomIn,
  }) {
    this.onDelete = onDelete || this._noop;
    this.onMove = onMove || this._noop;
    this.onCopy = onCopy || this._noop;
    this.onCut = onCut || this._noop;
    this.onPaste = onPaste || this._noop;
    this.onUndo = onUndo || this._noop;
    this.onRedo = onRedo || this._noop;
    this.onZoomOut = onZoomOut || this._noop;
    this.onZoomIn = onZoomIn || this._noop;
    this.onSearch = onSearch || this._noop;
    this.isFocused = false;
    this.shiftPressed = false;
    this.rawCtrlPressed = false;
    this.metaPressed = false;
    this.spacePressed = false;
    this.mouseMidButtonPressed = false;
    this.mount();
  }

  shouldCloneInstances() {
    return this._isControlPressed();
  }

  shouldMultiSelect() {
    return this.shiftPressed;
  }

  shouldFollowAxis() {
    return this.shiftPressed;
  }

  shouldNotSnapToGrid() {
    return this.altPressed;
  }

  shouldResizeProportionally() {
    return this.shiftPressed;
  }

  shouldScrollHorizontally() {
    return this.altPressed;
  }

  shouldZoom() {
    if (isMacLike()) {
      return this._isControlPressed();
    } else {
      if (!this._isControlPressed() && !this.altPressed && !this.shiftPressed) {
        return true;
      } else {
        return false;
      }
    }
  }

  shouldMoveView() {
    return this.spacePressed || this.mouseMidButtonPressed;
  }

  _isControlPressed = () => {
    // On macOS, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return this.metaPressed || this.rawCtrlPressed;
  };

  _onKeyDown = evt => {
    if (!this.isFocused) return;

    let preventDefault = false;

    if (evt.metaKey) this.metaPressed = true;
    if (evt.altKey) this.altPressed = true;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = true;
    if (evt.which === SHIFT_KEY) this.shiftPressed = true;
    if (evt.which === SPACE_KEY) this.spacePressed = true;

    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';
    if (evt.target && evt.target.closest(textEditorSelectors)) {
      return; // Something else is currently being edited.
    }

    if (this.onMove) {
      if (evt.which === UP_KEY) {
        this.shiftPressed ? this.onMove(0, -5) : this.onMove(0, -1);
      } else if (evt.which === DOWN_KEY) {
        this.shiftPressed ? this.onMove(0, 5) : this.onMove(0, 1);
      } else if (evt.which === LEFT_KEY) {
        this.shiftPressed ? this.onMove(-5, 0) : this.onMove(-1, 0);
      } else if (evt.which === RIGHT_KEY) {
        this.shiftPressed ? this.onMove(5, 0) : this.onMove(1, 0);
      }
    }
    if (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY) {
      this.onDelete();
      preventDefault = true;
    }
    if (this._isControlPressed() && evt.which === C_KEY) {
      this.onCopy();
    }
    if (this._isControlPressed() && evt.which === X_KEY) {
      this.onCut();
    }
    if (this._isControlPressed() && evt.which === V_KEY) {
      this.onPaste();
    }
    if (this._isControlPressed() && evt.which === Z_KEY) {
      if (this.shiftPressed) {
        this.onRedo();
      } else {
        this.onUndo();
      }
    }
    if (this._isControlPressed() && evt.which === Y_KEY) {
      this.onRedo();
    }
    if (this._isControlPressed() && evt.which === F_KEY) {
      this.onSearch();
    }

    if (this._isControlPressed() && evt.which === MINUS_KEY) {
      this.onZoomOut();
    }
    if (evt.which === NUMPAD_SUBTRACT) {
      this.onZoomOut();
    }

    if (this._isControlPressed() && evt.which === EQUAL_KEY) {
      this.onZoomIn();
    }
    if (evt.which === NUMPAD_ADD) {
      this.onZoomIn();
    }

    if (preventDefault) {
      if (evt.preventDefault) evt.preventDefault();
      return false;
    }
  };

  _onKeyUp = evt => {
    // Always handle key up event, even if we don't have the focus,
    // for modifier keys to ensure we don't lose track of their pressed/unpressed status.

    if (!evt.metaKey) this.metaPressed = false;
    if (!evt.altKey) this.altPressed = false;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = false;
    if (evt.which === SHIFT_KEY) this.shiftPressed = false;
    if (evt.which === SPACE_KEY) this.spacePressed = false;

    let preventDefault = false;

    if (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY) {
      preventDefault = true;
    }

    if (preventDefault) {
      if (evt.preventDefault) evt.preventDefault();
      return false;
    }
  };

  _onMouseDown = evt => {
    if (!this.isFocused) return;

    if (!isMacLike()) {
      if (evt.button === MID_MOUSE_BUTTON) {
        this.mouseMidButtonPressed = true;
      } else {
        this.mouseMidButtonPressed = false;
      }
    }
  };

  _onMouseUp = evt => {
    if (!this.isFocused) return;

    if (!isMacLike() && evt.button === MID_MOUSE_BUTTON) {
      this.mouseMidButtonPressed = false;
    }
  };

  _onKeyPress = evt => {};

  _noop = () => {};

  focus() {
    this.isFocused = true;
  }

  blur() {
    this.isFocused = false;

    // Clear these keys on blur to handle the case where app switching via
    // Cmd+Tab, Win+Tab, or Alt+Tab prevents us from capturing the "keyup" event.
    this.metaPressed = false;
    this.altPressed = false;
  }

  mount() {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', this._onKeyDown, true);
    document.addEventListener('keyup', this._onKeyUp, true);
    document.addEventListener('keypress', this._onKeyPress, true);
    document.addEventListener('mousedown', this._onMouseDown, true);
    document.addEventListener('mouseup', this._onMouseUp, true);
  }

  unmount() {
    if (typeof document === 'undefined') return;

    document.removeEventListener('keydown', this._onKeyDown, true);
    document.removeEventListener('keyup', this._onKeyUp, true);
    document.removeEventListener('keypress', this._onKeyPress, true);
    document.removeEventListener('mousedown', this._onMouseDown, true);
    document.removeEventListener('mouseup', this._onMouseUp, true);
  }
}
