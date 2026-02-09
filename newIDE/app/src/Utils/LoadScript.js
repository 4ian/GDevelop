// @flow

/**
 * Load a script from the specified source. The returned promise
 * resolves when the script is loaded.
 * @param source The script source
 */
export const loadScript = (source: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // $FlowFixMe[cannot-resolve-name]
    if (typeof document === 'undefined') {
      reject(
        new Error('loadScript is only supported in a browser environment.')
      );
      return;
    }

    // $FlowFixMe[cannot-resolve-name]
    const { body } = document;
    if (!body) {
      reject(
        new Error('loadScript is only supported in a browser environment.')
      );
      return;
    }

    // $FlowFixMe[cannot-resolve-name]
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = source;
    scriptElement.onload = () => resolve();
    scriptElement.onerror = error => reject(error);
    scriptElement.onabort = error => reject(error);

    body.appendChild(scriptElement);
  });
};
