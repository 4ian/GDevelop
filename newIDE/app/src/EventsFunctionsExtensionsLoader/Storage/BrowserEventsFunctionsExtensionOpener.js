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

      adhocInput.click();
    });
  };

  static readEventsFunctionExtensionFile = (file: any): Promise<Object> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = event => {
        const content = reader.result;
        if (!content) {
          throw new Error('The selected file is empty')
        }
        // content should be a string since the method readAsText guarantees it.
        // $FlowExpectedError
        return resolve(JSON.parse(content))
      };
      reader.readAsText(file, 'UTF-8');

    })
  };
}
