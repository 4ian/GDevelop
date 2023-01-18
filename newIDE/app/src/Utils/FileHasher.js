// @flow

export const getFileSha512TruncatedTo256 = async (
  file: File
): Promise<string> => {
  // $FlowFixMe - Flow does not know about crypto API
  if (!crypto || !crypto.subtle) {
    console.error('crypto.subtle is not available in this environment.');
    throw new Error('crypto.subtle is not available in this environment.');
  }

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
      const arrayBuffer: string | ArrayBuffer | null = event.target
        ? // $FlowFixMe - using the type inferred by TypeScript.
          event.target.result
        : null;
      if (!arrayBuffer instanceof ArrayBuffer) {
        reject(new Error('Error reading file.'));
      }

      resolve(
        crypto.subtle.digest('SHA-512', arrayBuffer).then(hashBuffer => {
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHexString = hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          return hashHexString.substr(0, 64);
        })
      );
    };

    fileReader.onerror = () => {
      reject(new Error('Error reading file.'));
    };

    fileReader.onabort = () => {
      reject(new Error('Error reading file.'));
    };

    fileReader.readAsArrayBuffer(file);
  });
};
