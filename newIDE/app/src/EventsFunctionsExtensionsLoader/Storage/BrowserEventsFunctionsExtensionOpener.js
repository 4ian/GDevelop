// @flow

export default class BrowserEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<?any> => {
    return new Promise(resolve => {
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
