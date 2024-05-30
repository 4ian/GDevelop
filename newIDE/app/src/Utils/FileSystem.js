// @flow
import optionalRequire from './OptionalRequire';
const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

export const readJSONFile = async (filepath: string): Promise<Object> => {
  if (!fsPromises) throw new Error('Filesystem is not supported.');

  try {
    const data = await fsPromises.readFile(filepath, { encoding: 'utf8' });
    const dataObject = JSON.parse(data);
    return dataObject;
  } catch (ex) {
    throw new Error(filepath + ' is a corrupted/malformed file.');
  }
};

export const openFilePicker = ({
  title,
  properties,
  message,
  filters,
}: {|
  title: string,
  properties: string[],
  message: string,
  filters: {| name: string, extensions: string[] |}[],
|}) => {
  if (!dialog) return Promise.reject('Not supported');
  const browserWindow = remote.getCurrentWindow();

  return dialog
    .showOpenDialog(browserWindow, {
      title,
      properties,
      message,
      filters,
    })
    .then(({ filePaths }) => {
      if (!filePaths || !filePaths.length) return null;
      return filePaths[0];
    });
};
