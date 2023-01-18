namespace gdjs {
  class TextEntryRuntimeObjectPixiRenderer {
    _object: gdjs.TextEntryRuntimeObject;
    _pressHandler: any;
    _upHandler: any;
    _downHandler: any;

    constructor(runtimeObject: gdjs.TextEntryRuntimeObject) {
      this._object = runtimeObject;
      this._pressHandler = function (evt) {
        if (!runtimeObject.isActivated()) {
          return;
        }
        evt = evt || window.event;
        const charCode = evt.which || evt.keyCode;
        const charTyped = String.fromCharCode(charCode);
        if (
          charTyped !== undefined &&
          //Skip some non displayable characters
          charCode !== 8
        ) {
          //On Firefox, backspace is considered as a character
          runtimeObject.setString(runtimeObject.getString() + charTyped);
        }
        if (evt.preventDefault) {
          evt.preventDefault();
        }
        return false;
      };
      this._upHandler = function (evt) {
        if (!runtimeObject.isActivated()) {
          return;
        }
        evt = evt || window.event;
        const charCode = evt.which || evt.keyCode;
        if (charCode === 8) {
          //Backspace
          runtimeObject.setString(runtimeObject.getString().slice(0, -1));
        }
        if (evt.preventDefault) {
          evt.preventDefault();
        }
        return false;
      };
      // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
      this._downHandler = function (evt) {
        evt = evt || window.event;
        const charCode = evt.which || evt.keyCode;

        //Prevent backspace from going to the previous page
        if (charCode === 8) {
          if (evt.preventDefault) {
            evt.preventDefault();
          }
          return false;
        }
      };
      document.addEventListener('keypress', this._pressHandler);
      document.addEventListener('keyup', this._upHandler);
      document.addEventListener('keydown', this._downHandler);
    }

    onDestroy() {
      document.removeEventListener('keypress', this._pressHandler);
      document.removeEventListener('keyup', this._upHandler);
      document.removeEventListener('keydown', this._downHandler);
    }

    updateString(): void {
      //Nothing to do.
    }

    activate(enable) {
      //Nothing to do.
    }
  }

  export const TextEntryRuntimeObjectRenderer = TextEntryRuntimeObjectPixiRenderer;
  export type TextEntryRuntimeObjectRenderer = TextEntryRuntimeObjectPixiRenderer;
}
