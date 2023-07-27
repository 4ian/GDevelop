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
            console.log('No file selected.');
            resolve(null);
          }
        };

        window.addEventListener('focus', onFocusBackWindow);
        adhocInput.click();
      }
    });
  };

  static readEventsFunctionExtensionFile = (file: any): Promise<Object> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onloadend = event => {
          try {
            const content = reader.result;
            if (!content) {
              throw new Error('The selected file is empty');
            }
            // content should be a string since the method readAsText guarantees it.
            // $FlowExpectedError
            return resolve(JSON.parse(content));
          } catch (error) {
            console.error('An error occurred when parsing the file content: ', {
              error,
            });
            reject(error);
          }
        };
        reader.readAsText(file, 'UTF-8');
      } catch (error) {
        console.error('An error occurred when reading the file: ', {
          error,
        });
        reject(error);
      }
    });
  };
}
