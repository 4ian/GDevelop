export default class KeyboardShortcuts {
  constructor({domElement, onDelete}) {
    this.mount();
    this.domElement = domElement;
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
    if (!this.domElement) return;

    this.domElement.addEventListener('keydown', this._onKeyDown);
    this.domElement.addEventListener('keyup', this._onKeyUp);
  }

  unmount() {
    if (!this.domElement) return;

    this.domElement.removeEventListener('keydown', this._onKeyDown);
    this.domElement.removeEventListener('keyup', this._onKeyUp);
  }
}
