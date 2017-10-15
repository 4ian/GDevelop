const CTRL_KEY = 17;
const SHIFT_KEY = 16;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;

// TODO: This is similar to EventsSheet/KeyboardShortcuts.js and could be merged
export default class KeyboardShortcuts {
  constructor({ domElement, onDelete, onMove }) {
    this.domElement = domElement;
    this.onDelete = onDelete;
    this.onMove = onMove;
    this.lastDownTarget = null;
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
    // On OS X, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return this.metaPressed || this.rawCtrlPressed;
  };

  _onKeyDown = evt => {
    if (this.lastDownTarget !== this.domElement) return;

    if (evt.metaKey) this.metaPressed = true;
    if (evt.altKey) this.altPressed = true;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = true;
    if (evt.which === SHIFT_KEY) this.shiftPressed = true;
  };

  _onKeyUp = evt => {
    if (this.lastDownTarget !== this.domElement) return;

    if (!evt.metaKey) this.metaPressed = false;
    if (!evt.altKey) this.altPressed = false;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = false;
    if (evt.which === SHIFT_KEY) this.shiftPressed = false;
    if (evt.which === UP_KEY) {
      this.onMove(0, -1);
    } else if (evt.which === DOWN_KEY) {
      this.onMove(0, 1);
    } else if (evt.which === LEFT_KEY) {
      this.onMove(-1, 0);
    } else if (evt.which === RIGHT_KEY) {
      this.onMove(1, 0);
    } else if (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY) {
      this.onDelete();
    }
  };

  _onKeyPress = evt => {
    if (this.lastDownTarget !== this.domElement) return;
  };

  _onMouseDown = evt => {
    this.lastDownTarget = evt.target;
  };

  mount() {
    if (typeof document === 'undefined') return;

    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('keypress', this._onKeyPress);
  }

  unmount() {
    if (typeof document === 'undefined') return;

    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('keypress', this._onKeyPress);
  }
}
