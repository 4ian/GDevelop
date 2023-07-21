// @flow
import { serializeToJSObject } from '../../Utils/Serializer';

const downloadStringContentAsFile = (
  filename: string,
  content: string
): Promise<void> => {
  const blob = new Blob([content], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);

  const adhocLink = document.createElement('a');
  adhocLink.href = blobUrl;
  adhocLink.download = filename;
  adhocLink.innerHTML = 'Click here to download the file';
  if (document.body) {
    document.body.appendChild(adhocLink);
    adhocLink.click();
    adhocLink.remove();
  }
  return Promise.resolve();
};

export default class BrowserEventsFunctionsExtensionWriter {
  static chooseEventsFunctionExtensionFile = (
    extensionName?: string
  ): Promise<?string> => {
    return Promise.resolve(extensionName);
  };

  static writeEventsFunctionsExtension = (
    extension: gdEventsFunctionsExtension,
    filename: string
  ): Promise<void> => {
    const serializedObject = serializeToJSObject(extension);
    return downloadStringContentAsFile(
      filename,
      JSON.stringify(serializedObject)
    ).catch(err => {
      console.error('Unable to write the events function extension:', err);
      throw err;
    });
  };

  static chooseCustomObjectFile = (objectName?: string): Promise<?string> => {
    return Promise.resolve(objectName);
  };

  static writeCustomObject = (
    customObject: gdObject,
    filename: string
  ): Promise<void> => {
    const exportedObject = customObject.clone().get();
    exportedObject.setTags('');
    exportedObject.getVariables().clear();
    exportedObject.getEffects().clear();
    exportedObject
      .getAllBehaviorNames()
      .toJSArray()
      .forEach(name => exportedObject.removeBehavior(name));
    const serializedObject = serializeToJSObject(exportedObject);
    return downloadStringContentAsFile(
      filename,
      JSON.stringify(serializedObject)
    ).catch(err => {
      console.error('Unable to write the events function extension:', err);
      throw err;
    });
  };
}
