const CTRL_KEY = 17;
const SHIFT_KEY = 16;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;
const C_KEY = 67;
const X_KEY = 88;
const V_KEY = 86;

export default class KeyboardShortcuts {
  constructor({ onDelete, onMove, onCopy, onCut, onPaste }) {
    this.onDelete = onDelete;
    this.onMove = onMove;
    this.onCopy = onCopy;
    this.onCut = onCut;
    this.onPaste = onPaste;
    this.isFocused = false;
    this.shiftPressed = false;
    this.rawCtrlPressed = false;
    this.metaPressed = false;

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

  shouldResizeProportionally() {
    return this.shiftPressed;
  }

  shouldScrollHorizontally() {
    return this.altPressed;
  }

  shouldZoom() {
    return this._isControlPressed();
  }

  _isControlPressed = () => {
    // On macOS, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return this.metaPressed || this.rawCtrlPressed;
  };

  _onKeyDown = evt => {
    if (!this.isFocused) return;

    if (evt.metaKey) this.metaPressed = true;
    if (evt.altKey) this.altPressed = true;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = true;
    if (evt.which === SHIFT_KEY) this.shiftPressed = true;

    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';
    if (evt.target && evt.target.closest(textEditorSelectors)) {
      return; // Something else is currently being edited.
    }

    if (this.onMove) {
      if (evt.which === UP_KEY) {
        this.onMove(0, -1);
      } else if (evt.which === DOWN_KEY) {
        this.onMove(0, 1);
      } else if (evt.which === LEFT_KEY) {
        this.onMove(-1, 0);
      } else if (evt.which === RIGHT_KEY) {
        this.onMove(1, 0);
      }
    }
    if (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY) {
      this.onDelete();
    }
    if (evt.which === C_KEY && this._isControlPressed()) {
      this.onCopy();
    }
    if (evt.which === X_KEY && this._isControlPressed()) {
      this.onCut();
    }
    if (evt.which === V_KEY && this._isControlPressed()) {
      this.onPaste();
    }
  };

  _onKeyUp = evt => {
    if (!this.isFocused) return;

    if (!evt.metaKey) this.metaPressed = false;
    if (!evt.altKey) this.altPressed = false;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = false;
    if (evt.which === SHIFT_KEY) this.shiftPressed = false;
  };

  _onKeyPress = evt => {};

  focus() {
    this.isFocused = true;
  }

  blur() {
    this.isFocused = false;
  }

  mount() {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', this._onKeyDown, true);
    document.addEventListener('keyup', this._onKeyUp, true);
    document.addEventListener('keypress', this._onKeyPress, true);
  }

  unmount() {
    if (typeof document === 'undefined') return;

    document.removeEventListener('keydown', this._onKeyDown, true);
    document.removeEventListener('keyup', this._onKeyUp, true);
    document.removeEventListener('keypress', this._onKeyPress, true);
  }
}
