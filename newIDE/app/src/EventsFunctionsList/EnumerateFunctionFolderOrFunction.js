// @flow

import { mapFor } from '../Utils/MapFor';

export const getFunctionFolderOrFunctionUnifiedName = (
  functionFolderOrFunction: gdFunctionFolderOrFunction
): string =>
  functionFolderOrFunction.isFolder()
    ? functionFolderOrFunction.getFolderName()
    : functionFolderOrFunction.getFunction().getName();

type EnumeratedFolder = {| path: string, folder: gdFunctionFolderOrFunction |};

const recursivelyEnumerateFoldersInFolder = (
  folder: gdFunctionFolderOrFunction,
  prefix: string,
  result: Array<EnumeratedFolder>
) => {
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    if (child.isFolder()) {
      const newPrefix = prefix
        ? prefix + ' > ' + child.getFolderName()
        : child.getFolderName();
      result.push({
        path: newPrefix,
        folder: child,
      });
      recursivelyEnumerateFoldersInFolder(child, newPrefix, result);
    }
  });
};

const recursivelyEnumerateFunctionsInFolder = (
  folder: gdFunctionFolderOrFunction,
  result: Array<gdEventsFunction>
) => {
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    if (!child.isFolder()) {
      result.push(child.getFunction());
    } else {
      recursivelyEnumerateFunctionsInFolder(child, result);
    }
  });
};

export const enumerateFunctionsInFolder = (
  folder: gdFunctionFolderOrFunction
): Array<gdEventsFunction> => {
  if (!folder.isFolder()) return [];
  const result: Array<gdEventsFunction> = [];
  recursivelyEnumerateFunctionsInFolder(folder, result);
  return result;
};

export const enumerateFoldersInFolder = (
  folder: gdFunctionFolderOrFunction
): Array<EnumeratedFolder> => {
  if (!folder.isFolder()) return [];
  const result: Array<EnumeratedFolder> = [];
  recursivelyEnumerateFoldersInFolder(folder, '', result);
  return result;
};

export const enumerateFoldersInContainer = (
  container: gdEventsFunctionsContainer
): Array<EnumeratedFolder> => {
  const rootFolder = container.getRootFolder();
  const result: Array<EnumeratedFolder> = [];
  recursivelyEnumerateFoldersInFolder(rootFolder, '', result);
  return result;
};

export const getFunctionsInFolder = (
  functionFolderOrFunction: gdFunctionFolderOrFunction
): gdEventsFunction[] => {
  if (!functionFolderOrFunction.isFolder()) return [];
  return mapFor(0, functionFolderOrFunction.getChildrenCount(), i => {
    const child = functionFolderOrFunction.getChildAt(i);
    if (child.isFolder()) {
      return null;
    }
    return child.getFunction();
  }).filter(Boolean);
};

export const getFoldersAscendanceWithoutRootFolder = (
  functionFolderOrFunction: gdFunctionFolderOrFunction
): Array<gdFunctionFolderOrFunction> => {
  if (functionFolderOrFunction.isRootFolder()) return [];
  const parent = functionFolderOrFunction.getParent();
  if (parent.isRootFolder()) return [];
  return [parent, ...getFoldersAscendanceWithoutRootFolder(parent)];
};
