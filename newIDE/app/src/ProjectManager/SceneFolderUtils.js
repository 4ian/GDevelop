// @flow

export const SCENE_FOLDER_ID_PREFIX = 'scene-folder-';

export const getSceneFolderTreeViewItemId = (folderId: string): string =>
  `${SCENE_FOLDER_ID_PREFIX}${folderId}`;

export const getSceneFolderIdFromTreeViewItemId = (
  itemId: string
): ?string =>
  itemId.startsWith(SCENE_FOLDER_ID_PREFIX)
    ? itemId.slice(SCENE_FOLDER_ID_PREFIX.length)
    : null;

