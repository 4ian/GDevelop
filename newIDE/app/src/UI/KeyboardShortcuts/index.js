// @flow
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const BACKSPACE_KEY = 8;
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
const ESC_KEY = 27;

type ShortcutCallbacks = {|
  onDelete?: () => void,
  onMove?: (number, number) => void,
  onCopy?: () => void,
  onCut?: () => void,
  onPaste?: () => void,
  onUndo?: () => void,
  onRedo?: () => void,
  onSearch?: () => void,
  onZoomOut?: KeyboardEvent => void,
  onZoomIn?: KeyboardEvent => void,
  onEscape?: () => void,
|};

type ConstructorArgs = {|
  isActive?: () => boolean,
  shortcutCallbacks: ShortcutCallbacks,
|};

/**
 * Listen to keyboard shorcuts and call callbacks according to them.
 * Also store the state of the modifier keys (shift, ctrl, alt, meta) to know
 * if some special operations (multi selection, selection duplication) must
 * be done.
 *
 * `onKeyDown`, `onKeyUp` and other methods handling events (`onDragOver`...)
 * must be binded to the `div` element containing your component. We're not
 * using `document` to avoid issues with shortcuts being detected while a
 * component is not focused.
 */
export default class KeyboardShortcuts {
  _shortcutCallbacks: ShortcutCallbacks;
  _isActive: ?() => boolean;
  _shiftPressed = false;
  _ctrlPressed = false;
  _altPressed = false;
  _metaPressed = false;

  constructor({ isActive, shortcutCallbacks }: ConstructorArgs) {
    this._shortcutCallbacks = shortcutCallbacks;
    this._isActive = isActive;
  }

  shouldCloneInstances() {
    return this._isControlOrCmdPressed();
  }

  shouldMultiSelect() {
    return this._shiftPressed;
  }

  _updateModifiersFromEvent = (evt: KeyboardEvent | DragEvent) => {
    this._metaPressed = evt.metaKey;
    this._altPressed = evt.altKey;
    this._ctrlPressed = evt.ctrlKey;
    this._shiftPressed = evt.shiftKey;
  };

  _isControlOrCmdPressed = () => {
    // On macOS, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return this._metaPressed || this._ctrlPressed;
  };

  onDragOver = (evt: DragEvent) => {
    this._updateModifiersFromEvent(evt);
  };

  onKeyUp = (evt: KeyboardEvent) => {
    this._updateModifiersFromEvent(evt);
  };

  onKeyDown = (evt: KeyboardEvent) => {
    this._updateModifiersFromEvent(evt);

    if (this._isActive && !this._isActive()) return;

    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';
    // $FlowFixMe
    if (evt.target && evt.target.closest(textEditorSelectors)) {
      return; // Something else is currently being edited.
    }

    const {
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
      onEscape,
    } = this._shortcutCallbacks;

    if (onMove) {
      if (evt.which === UP_KEY) {
        this._shiftPressed ? onMove(0, -5) : onMove(0, -1);
      } else if (evt.which === DOWN_KEY) {
        this._shiftPressed ? onMove(0, 5) : onMove(0, 1);
      } else if (evt.which === LEFT_KEY) {
        this._shiftPressed ? onMove(-5, 0) : onMove(-1, 0);
      } else if (evt.which === RIGHT_KEY) {
        this._shiftPressed ? onMove(5, 0) : onMove(1, 0);
      }
    }
    if (onDelete && (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY)) {
      onDelete();
    }
    if (onCopy && this._isControlOrCmdPressed() && evt.which === C_KEY) {
      onCopy();
    }
    if (onCut && this._isControlOrCmdPressed() && evt.which === X_KEY) {
      onCut();
    }
    if (onPaste && this._isControlOrCmdPressed() && evt.which === V_KEY) {
      onPaste();
    }
    if (onUndo && this._isControlOrCmdPressed() && evt.which === Z_KEY) {
      onUndo();
    }
    if (
      onRedo &&
      this._isControlOrCmdPressed() &&
      evt.shiftKey &&
      evt.which === Z_KEY
    ) {
      onRedo();
    }
    if (onRedo && this._isControlOrCmdPressed() && evt.which === Y_KEY) {
      onRedo();
    }
    if (onSearch && this._isControlOrCmdPressed() && evt.which === F_KEY) {
      onSearch();
    }
    if (onEscape && evt.which === ESC_KEY) {
      onEscape();
    }

    if (onZoomOut && this._isControlOrCmdPressed() && evt.which === MINUS_KEY) {
      onZoomOut(evt);
    }
    if (onZoomOut && evt.which === NUMPAD_SUBTRACT) {
      onZoomOut(evt);
    }

    if (onZoomIn && this._isControlOrCmdPressed() && evt.which === EQUAL_KEY) {
      onZoomIn(evt);
    }
    if (onZoomIn && evt.which === NUMPAD_ADD) {
      onZoomIn(evt);
    }
  };
}
