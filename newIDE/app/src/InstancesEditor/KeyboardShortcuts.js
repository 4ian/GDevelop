export default class KeyboardShortcuts {
  constructor({onDelete}) {
    this.mount();
    this.onDelete = onDelete;
  }

  shouldCloneInstances() { return this.ctrlPressed; }

  shouldMultiSelect() { return this.shiftPressed; }

  shouldScrollHorizontally() { return this.altPressed; }

  shouldZoom() { return this.metaPressed; }

  _onKeyDown = (evt) => {
    if ( evt.metaKey ) this.metaPressed = true;
    if ( evt.altKey ) this.altPressed = true;
    if ( evt.which === 17 ) this.ctrlPressed = true;
    if ( evt.which === 16 ) this.shiftPressed = true;
  }

  _onKeyUp = (evt) => {
    if ( !evt.metaKey ) this.metaPressed = false;
    if ( !evt.altKey ) this.altPressed = false;
    if ( evt.which === 17 ) this.ctrlPressed = false;
    if ( evt.which === 16 ) this.shiftPressed = false;
    if ( evt.which === 8 || evt.which === 46 ) {
      this.onDelete();
    }
  }

  mount() {
    if (!document) return;

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  unmount() {
    if (!document) return;

    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }
}
