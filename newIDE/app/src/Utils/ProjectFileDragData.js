// @flow

export const projectFileDragDataMimeType =
  'application/x-gdevelop-project-file';

let activeProjectFileDragPath: ?string = null;

export const setActiveProjectFileDragPath = (absolutePath: string) => {
  activeProjectFileDragPath = absolutePath;
};

export const clearActiveProjectFileDragPath = () => {
  activeProjectFileDragPath = null;
};

export const getActiveProjectFileDragPath = (): ?string =>
  activeProjectFileDragPath;

export const hasProjectFileDragData = (dataTransferTypes: any): boolean => {
  if (!dataTransferTypes) return false;

  if (typeof dataTransferTypes.includes === 'function') {
    return dataTransferTypes.includes(projectFileDragDataMimeType);
  }

  if (typeof dataTransferTypes.contains === 'function') {
    return dataTransferTypes.contains(projectFileDragDataMimeType);
  }

  for (let index = 0; index < dataTransferTypes.length; index++) {
    if (dataTransferTypes[index] === projectFileDragDataMimeType) return true;
  }

  return false;
};

export const getProjectFilePathFromDragData = (dragData: string): ?string => {
  try {
    const parsedDragData = JSON.parse(dragData);
    if (
      !parsedDragData ||
      parsedDragData.type !== 'file' ||
      typeof parsedDragData.absolutePath !== 'string' ||
      !parsedDragData.absolutePath
    ) {
      return null;
    }

    return parsedDragData.absolutePath;
  } catch (error) {
    return null;
  }
};

export const getProjectFilePathFromDataTransfer = (
  dataTransfer: ?DataTransfer | any
): ?string => {
  if (
    !dataTransfer ||
    typeof dataTransfer.getData !== 'function' ||
    !hasProjectFileDragData(dataTransfer.types)
  ) {
    return null;
  }

  return getProjectFilePathFromDragData(
    dataTransfer.getData(projectFileDragDataMimeType)
  );
};
