// @flow

export default class BrowserEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<?any> => {
    return new Promise(resolve => {
      if (window.showOpenFilePicker) {
        window
          .showOpenFilePicker({
            types: [
              {
                description: 'GDevelop Extension',
                accept: {
                  'application/json': ['.json'],
                },
              },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
          })
          .then(([handle]) => {
            if (!handle) return resolve(null);
            resolve(handle.getFile());
          })
          .catch(() => {
            resolve(null);
          });
      } else {
        const adhocInput = document.createElement('input');
        adhocInput.type = 'file';
        adhocInput.multiple = false;
        adhocInput.accept = 'application/json,.json';
        adhocInput.onchange = e => {
          const file = e.target.files[0];
          return resolve(file);
        };

        // There is no built-in way to know if the user closed the file picking dialog
        // with the cancel button. What follows is an implementation that follows
        // https://stackoverflow.com/questions/71435515/how-can-i-detect-that-the-cancel-button-has-been-clicked-on-a-input-type-file.
        // TODO: Find a better way to detect this since it looks like the `change` event
        // does not have enough time to propagate when the user selects a file from the dialog
        // by double-clicking it.

        const onFocusBackWindow = () => {
          window.removeEventListener('focus', onFocusBackWindow);
          if (document.body) {
            document.body.addEventListener(
              'pointermove',
              onFilePickingDialogFinishedClosing
            );
          }
        };

        const onFilePickingDialogFinishedClosing = () => {
          if (document.body) {
            document.body.removeEventListener(
              'pointermove',
              onFilePickingDialogFinishedClosing
            );
          }
          if (!adhocInput.files.length) {
            resolve(null);
          }
        };

        window.addEventListener('focus', onFocusBackWindow);
        adhocInput.click();
      }
    });
  };

  static readEventsFunctionExtensionFile = async (
    file: any
  ): Promise<Object> => {
    if (!(file instanceof File)) {
      console.error('Given file is not a JS File object. Instead it is:', {
        file,
      });
      throw new Error('Given file is not a JS File object.');
    }

    try {
      const content = await file.text();
      return JSON.parse(content);
    } catch (error) {
      console.error('An error occurred when parsing the file content: ', {
        error,
      });
      throw error;
    }
  };
}
