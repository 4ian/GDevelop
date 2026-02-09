// @flow

const downloadStringContentAsFile = async (
  filename: string,
  content: string
): Promise<void> => {
  // $FlowFixMe[cannot-resolve-name]
  const blob = new Blob([content], { type: 'application/json' });
  // $FlowFixMe[cannot-resolve-name]
  const blobUrl = URL.createObjectURL(blob);

  // $FlowFixMe[cannot-resolve-name]
  const adhocLink = document.createElement('a');
  adhocLink.href = blobUrl;
  adhocLink.download = filename;
  // $FlowFixMe[cannot-resolve-name]
  if (document.body) {
    // $FlowFixMe[cannot-resolve-name]
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
