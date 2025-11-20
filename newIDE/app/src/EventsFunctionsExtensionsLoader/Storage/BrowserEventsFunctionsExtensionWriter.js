// @flow

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

  static writeSerializedObject = async (
    serializedObject: Object,
    filename: string
  ): Promise<void> => {
    try {
      await downloadStringContentAsFile(
        filename,
        JSON.stringify(serializedObject, null, 2)
      );
    } catch (error) {
      console.error('Unable to write the events function extension:', error);
      throw error;
    }
  };
}
