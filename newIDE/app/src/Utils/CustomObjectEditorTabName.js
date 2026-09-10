// @flow

/**
 * A custom object editor tab's `projectItemName`, encoded as
 * `extensionName::objectName[::variantName]`. The single place that knows this
 * `::` encoding - use these helpers instead of splitting/joining by hand.
 */
export type ParsedCustomObjectEditorTabName = {|
  extensionName: string,
  objectName: string,
  /** Empty string when editing the default variant. */
  variantName: string,
|};

export const makeCustomObjectEditorTabName = ({
  extensionName,
  objectName,
  variantName,
}: {|
  extensionName: string,
  objectName: string,
  variantName?: string,
|}): string =>
  extensionName + '::' + objectName + (variantName ? '::' + variantName : '');

export const parseCustomObjectEditorTabName = (
  name: string
): ParsedCustomObjectEditorTabName => {
  const segments = name.split('::');
  return {
    extensionName: segments[0] || '',
    objectName: segments[1] || '',
    variantName: segments[2] || '',
  };
};

/** The events-based object type (`extension::object`), dropping any variant. */
export const getObjectTypeFromCustomObjectEditorTabName = (
  name: string
): string => {
  const { extensionName, objectName } = parseCustomObjectEditorTabName(name);
  return extensionName + '::' + objectName;
};
