// @flow

const EXTENSION_STORE_ORIGIN_NAME = 'gdevelop-extension-store';
export const IMPORTED_FILE_ORIGIN_NAME = 'imported-file';

/**
 * Extensions installed from the store or imported from a file are entirely
 * replaced when they are updated, including the default variant of their
 * custom objects. Users must duplicate the default variant to keep their
 * changes.
 */
export const isDefaultVariantReplacedByUpdates = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): boolean => {
  const originName = eventsFunctionsExtension.getOriginName();
  return (
    originName === EXTENSION_STORE_ORIGIN_NAME ||
    originName === IMPORTED_FILE_ORIGIN_NAME
  );
};
