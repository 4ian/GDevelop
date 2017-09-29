import { Component } from 'react';

const CTRL_KEY = 17;
const SHIFT_KEY = 16;
const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;

// TODO: This is similar to InstancesEditor/KeyboardShortcuts.js and could be merged
export default class KeyboardShortcuts extends Component {
  constructor(props) {
    super(props);

    this.shiftPressed = false;
    this.rawCtrlPressed = false;
    this.metaPressed = false;
  }

  shouldMultiSelect() {
    return this.shiftPressed;
  }

  _isControlPressed = () => {
    // On OS X, meta key (Apple/Command key) acts as Control key on Windows/Linux.
    return this.metaPressed || this.rawCtrlPressed;
  }

  _onKeyDown = evt => {
    if (evt.metaKey) this.metaPressed = true;
    if (evt.altKey) this.altPressed = true;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = true;
    if (evt.which === SHIFT_KEY) this.shiftPressed = true;

    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';
    if (evt.target && evt.target.closest(textEditorSelectors)) {
      return; // Something else is currently being edited.
    }

    if (evt.which === BACKSPACE_KEY || evt.which === DELETE_KEY) {
      this.props.onDelete();
    }
  };

  _onKeyUp = evt => {
    if (!evt.metaKey) this.metaPressed = false;
    if (!evt.altKey) this.altPressed = false;
    if (evt.which === CTRL_KEY) this.rawCtrlPressed = false;
    if (evt.which === SHIFT_KEY) this.shiftPressed = false;
  };

  _onKeyPress = evt => {
  };

  componentDidMount() {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('keypress', this._onKeyPress);
  }

  componentWillUnmount() {
    if (typeof document === 'undefined') return;

    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('keypress', this._onKeyPress);
  }

  render() {
    return null;
  }
}
