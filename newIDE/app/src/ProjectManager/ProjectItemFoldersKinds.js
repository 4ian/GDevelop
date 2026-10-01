// @flow
import { type ProjectItemFoldersKind } from './ProjectItemFolders';
import { sceneFoldersKind } from './SceneTreeViewItemContent';
import { externalLayoutFoldersKind } from './ExternalLayoutTreeViewItemContent';
import { externalEventsFoldersKind } from './ExternalEventsTreeViewItemContent';
import { gameplayTestFoldersKind } from './GameplayTestTreeViewItemContent';

/** Every kind of project item organized in folders. */
export const projectItemFoldersKinds: Array<ProjectItemFoldersKind> = [
  sceneFoldersKind,
  externalLayoutFoldersKind,
  externalEventsFoldersKind,
  gameplayTestFoldersKind,
];

export const getProjectItemFoldersKind = (
  rootId: string
): ?ProjectItemFoldersKind =>
  projectItemFoldersKinds.find(kind => kind.getRootId() === rootId);
