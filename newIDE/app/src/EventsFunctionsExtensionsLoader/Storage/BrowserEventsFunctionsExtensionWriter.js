// @flow
import { serializeToJSObject } from '../../Utils/Serializer';

const downloadStringContentAsFile = async (
  filename: string,
  content: string
): Promise<void> => {
  const blob = new Blob([content], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);

  const adhocLink = document.createElement('a');
  adhocLink.href = blobUrl;
  adhocLink.download = filename;
  if (document.body) {
    document.body.appendChild(adhocLink);
    adhocLink.click();
    adhocLink.remove();
  } else {
    throw new Error("Document body couldn't be found.");
  }
  return;
};

export default class BrowserEventsFunctionsExtensionWriter {
  static chooseEventsFunctionExtensionFile = async (
    extensionName?: string
  ): Promise<?string> => {
    return extensionName;
  };

  static writeEventsFunctionsExtension = async (
    extension: gdEventsFunctionsExtension,
    filename: string
  ): Promise<void> => {
    const serializedObject = serializeToJSObject(extension);
    try {
      await downloadStringContentAsFile(
        filename,
        JSON.stringify(serializedObject)
      );
    } catch (error) {
      console.error('Unable to write the events function extension:', error);
      throw error;
    }
  };

  static chooseCustomObjectFile = async (
    objectName?: string
  ): Promise<?string> => {
    return objectName;
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
