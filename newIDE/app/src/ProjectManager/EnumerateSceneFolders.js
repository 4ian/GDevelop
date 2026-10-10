// @flow
import { mapFor } from '../Utils/MapFor';

export type EnumeratedSceneFolder = {|
  path: string,
  folder: gdLayoutFolderOrLayout,
|};

const recursivelyEnumerateFoldersInFolder = (
  folder: gdLayoutFolderOrLayout,
  prefix: string,
  result: Array<EnumeratedSceneFolder>
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

/**
 * Enumerate all the folders used to organize the scenes of the project,
 * with the path to display them in the "Move to folder" menus.
 */
export const enumerateSceneFoldersInProject = (
  project: gdProject
): Array<EnumeratedSceneFolder> => {
  const result: Array<EnumeratedSceneFolder> = [];
  recursivelyEnumerateFoldersInFolder(
    project.getLayoutsRootFolder(),
    '',
    result
  );
  return result;
};
