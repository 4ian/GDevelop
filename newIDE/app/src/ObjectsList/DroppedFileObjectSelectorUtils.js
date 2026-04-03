// @flow

const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];

export type DroppedSupportedFile = {|
  file: ?File,
  resourceKind: 'image',
|};

export const getFileExtension = (filename: string): string => {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filename.substring(dotIndex + 1).toLowerCase();
};

export const getResourceKindFromExtension = (extension: string): ?'image' => {
  if (imageExtensions.includes(extension)) {
    return 'image';
  }
  return null;
};

export const getResourceKindFromMimeType = (mimeType: string): ?'image' => {
  const normalizedMimeType = mimeType.toLowerCase();
  if (normalizedMimeType.startsWith('image/')) {
    return 'image';
  }
  return null;
};

export const getDroppedSupportedFile = (
  entries: any
): ?DroppedSupportedFile => {
  const firstEntry = Array.isArray(entries)
    ? entries[0]
    : entries && entries[0];
  if (!firstEntry) return null;

  if (typeof firstEntry.kind === 'string') {
    if (firstEntry.kind !== 'file') return null;

    const firstFile = firstEntry.getAsFile ? firstEntry.getAsFile() : null;
    const resourceKindFromFile = firstFile
      ? getResourceKindFromExtension(getFileExtension(firstFile.name || ''))
      : null;
    const resourceKind =
      resourceKindFromFile ||
      getResourceKindFromMimeType(firstEntry.type || '');

    if (!resourceKind) return null;

    return {
      file: firstFile,
      resourceKind,
    };
  }

  const firstFile = firstEntry;
  const resourceKind = getResourceKindFromExtension(
    getFileExtension(firstFile.name || '')
  );
  if (!resourceKind) return null;

  return {
    file: firstFile,
    resourceKind,
  };
};
