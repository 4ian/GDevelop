// @flow
import { type SerializedExtension } from '../../Utils/GDevelopServices/Extension';

export default class BrowserEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<Array<any>> => {
    return new Promise(resolve => {
      // $FlowFixMe[cannot-resolve-name]
      if (window.showOpenFilePicker) {
        // $FlowFixMe[cannot-resolve-name]
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
            multiple: true,
          })
          .then(handles => {
            if (!handles) return resolve([]);
            resolve(Promise.all(handles.map(handle => handle.getFile())));
          })
          .catch(() => {
            resolve([]);
          });
      } else {
        // $FlowFixMe[cannot-resolve-name]
        const adhocInput = document.createElement('input');
        adhocInput.type = 'file';
        adhocInput.multiple = true;
        adhocInput.accept = 'application/json,.json';
        adhocInput.onchange = e => {
          return resolve(e.target.files);
        };

        // There is no built-in way to know if the user closed the file picking dialog
        // with the cancel button. What follows is an implementation that follows
        // https://stackoverflow.com/questions/71435515/how-can-i-detect-that-the-cancel-button-has-been-clicked-on-a-input-type-file.
        // TODO: Find a better way to detect this since it looks like the `change` event
        // does not have enough time to propagate when the user selects a file from the dialog
        // by double-clicking it.

        const onFocusBackWindow = () => {
          // $FlowFixMe[cannot-resolve-name]
          window.removeEventListener('focus', onFocusBackWindow);
          // $FlowFixMe[cannot-resolve-name]
          if (document.body) {
            // $FlowFixMe[cannot-resolve-name]
            document.body.addEventListener(
              'pointermove',
              onFilePickingDialogFinishedClosing
            );
          }
        };

        const onFilePickingDialogFinishedClosing = () => {
          // $FlowFixMe[cannot-resolve-name]
          if (document.body) {
            // $FlowFixMe[cannot-resolve-name]
            document.body.removeEventListener(
              'pointermove',
              onFilePickingDialogFinishedClosing
            );
          }
          if (!adhocInput.files.length) {
            resolve([]);
          }
        };

        // $FlowFixMe[cannot-resolve-name]
        window.addEventListener('focus', onFocusBackWindow);
        adhocInput.click();
      }
    });
  };

  static readEventsFunctionExtensionFile = async (
    file: any
  ): Promise<SerializedExtension> => {
    // $FlowFixMe[cannot-resolve-name]
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
