export default class KeyboardShortcuts {
  constructor() {
    this.mount();
  }

  shouldCloneInstances() { return this.ctrlPressed; }

  shouldMultiSelect() { return this.shiftPressed; }

  _onKeyDown = (evt) => {
    if ( evt.which === 17 ) this.ctrlPressed = true;
    if ( evt.which === 16 ) this.shiftPressed = true;
  }

  _onKeyUp = (evt) => {
    if ( evt.which === 17 ) this.ctrlPressed = false;
    if ( evt.which === 16 ) this.shiftPressed = false;
  }

  mount() {
    if (!document) return;

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  unmount() {
    if (!document) return;

    document.removeEventListener(this._onKeyDown);
    document.removeEventListener(this._onKeyUp);
  }
}
