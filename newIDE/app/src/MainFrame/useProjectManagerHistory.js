// @flow
import * as React from 'react';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

// Project manager items are always created/deleted/renamed as a deliberate
// action (never a rapid, per-keystroke stream like an instance being
// dragged) - so, unlike the scene editor's history, no debouncing/merging
// of pending edits is needed here: every action is recorded as its own,
// immediate step.
//
// A step is about the items it added or deleted: undoing the creation of a
// scene removes that scene only, whatever was added to the project meanwhile
// without a step (pasted, duplicated, created by the AI...). The content of
// an item is only serialized when it's about to be removed, so it can be
// re-created as it was.
//
// Like the folders of the objects list, the folders organizing the items are
// a snapshot: every step holds the folder structure of its kind before and
// after it (only names: a few hundred bytes), restored with the items.

const HISTORY_MAX_SIZE = 50;

export type ProjectManagerHistoryTargetKey =
  | 'scenes'
  | 'externalLayouts'
  | 'externalEvents'
  | 'gameplayTests';

/**
 * A serialized folder structure: a folder is `{folderName, children}`, an
 * item is `{itemName}`.
 */
type SerializedFolders = Object;

/**
 * A project-level list (the project's scenes, external layouts or external
 * events), with the folder structure organizing it.
 */
type ProjectManagerList = {|
  getCount: () => number,
  getAt: (index: number) => Object /* gdSerializable, has getName() */,
  has: (name: string) => boolean,
  insertNew: (name: string, position: number) => Object,
  remove: (name: string) => void,
  unserializeItem: (item: Object, serialized: Object) => void,
  // The scenes list also tracks which one the game starts with.
  getFirstItemName?: () => string,
  setFirstItemName?: (name: string) => void,
  // The folder structure only references the items by name: the items it
  // does not hold are added at its end when it is set.
  serializeFolders: () => SerializedFolders,
  unserializeFolders: (folders: SerializedFolders) => void,
|};

const getProjectManagerLists = (
  project: gdProject
): { [ProjectManagerHistoryTargetKey]: ProjectManagerList } => ({
  scenes: {
    getCount: () => project.getLayoutsCount(),
    getAt: index => project.getLayoutAt(index),
    has: name => project.hasLayoutNamed(name),
    insertNew: (name, position) => project.insertNewLayout(name, position),
    remove: name => project.removeLayout(name),
    unserializeItem: (item, serialized) =>
      unserializeFromJSObject(item, serialized, 'unserializeFrom', project),
    getFirstItemName: () => project.getFirstLayout(),
    setFirstItemName: name => project.setFirstLayout(name),
    serializeFolders: () =>
      serializeToJSObject(project, 'serializeLayoutsFoldersTo'),
    unserializeFolders: folders =>
      unserializeFromJSObject(
        project,
        folders,
        'unserializeLayoutsFoldersFrom'
      ),
  },
  externalLayouts: {
    getCount: () => project.getExternalLayoutsCount(),
    getAt: index => project.getExternalLayoutAt(index),
    has: name => project.hasExternalLayoutNamed(name),
    insertNew: (name, position) =>
      project.insertNewExternalLayout(name, position),
    remove: name => project.removeExternalLayout(name),
    unserializeItem: (item, serialized) =>
      unserializeFromJSObject(item, serialized, 'unserializeFrom', project),
    serializeFolders: () =>
      serializeToJSObject(project, 'serializeExternalLayoutsFoldersTo'),
    unserializeFolders: folders =>
      unserializeFromJSObject(
        project,
        folders,
        'unserializeExternalLayoutsFoldersFrom'
      ),
  },
  externalEvents: {
    getCount: () => project.getExternalEventsCount(),
    getAt: index => project.getExternalEventsAt(index),
    has: name => project.hasExternalEventsNamed(name),
    insertNew: (name, position) =>
      project.insertNewExternalEvents(name, position),
    remove: name => project.removeExternalEvents(name),
    unserializeItem: (item, serialized) =>
      unserializeFromJSObject(item, serialized, 'unserializeFrom', project),
    serializeFolders: () =>
      serializeToJSObject(project, 'serializeExternalEventsFoldersTo'),
    unserializeFolders: folders =>
      unserializeFromJSObject(
        project,
        folders,
        'unserializeExternalEventsFoldersFrom'
      ),
  },
  gameplayTests: {
    getCount: () => project.getTests().getTestsCount(),
    getAt: index => project.getTests().getTestAt(index),
    has: name => project.getTests().hasTestNamed(name),
    insertNew: (name, position) =>
      project.getTests().insertNewTest(name, position),
    remove: name => project.getTests().removeTest(name),
    unserializeItem: (item, serialized) =>
      unserializeFromJSObject(item, serialized, 'unserializeFrom'),
    serializeFolders: () =>
      serializeToJSObject(project.getTests(), 'serializeFolderStructureTo'),
    unserializeFolders: folders =>
      unserializeFromJSObject(
        project.getTests(),
        folders,
        'unserializeFolderStructureFrom'
      ),
  },
});

const getItemIndex = (list: ProjectManagerList, itemName: string): number => {
  for (let i = 0; i < list.getCount(); i++) {
    if (list.getAt(i).getName() === itemName) return i;
  }
  return -1;
};

// A folder without children is serialized without a `children` key.
const normalizeFolders = (folders: SerializedFolders): SerializedFolders => {
  if (!folders.children) return folders;
  const { children, ...folder } = folders;
  return children.length > 0
    ? { ...folder, children: children.map(normalizeFolders) }
    : folder;
};

const areFoldersEqual = (a: SerializedFolders, b: SerializedFolders) =>
  JSON.stringify(normalizeFolders(a)) === JSON.stringify(normalizeFolders(b));

const getItemNamesInFolders = (
  folders: SerializedFolders,
  names: Set<string> = new Set()
): Set<string> => {
  if (folders.itemName != null) names.add(folders.itemName);
  (folders.children || []).forEach(child =>
    getItemNamesInFolders(child, names)
  );
  return names;
};

const removeItemsFromFolders = (
  folders: SerializedFolders,
  names: Set<string>
): SerializedFolders =>
  normalizeFolders(
    folders.children
      ? {
          ...folders,
          children: folders.children
            .filter(
              child => child.itemName == null || !names.has(child.itemName)
            )
            .map(child => removeItemsFromFolders(child, names)),
        }
      : folders
  );

const getNamesOnlyIn = (names: Set<string>, otherNames: Set<string>) =>
  new Set([...names].filter(name => !otherNames.has(name)));

/**
 * Whether the folders changed: a folder added, removed or renamed, an item
 * or a folder moved. Items added, removed or renamed meanwhile are not
 * folder changes (they can come from outside the history).
 */
const haveFoldersChanged = (
  before: SerializedFolders,
  after: SerializedFolders
): boolean => {
  if (areFoldersEqual(before, after)) return false;
  const namesBefore = getItemNamesInFolders(before);
  const namesAfter = getItemNamesInFolders(after);
  return !areFoldersEqual(
    removeItemsFromFolders(before, getNamesOnlyIn(namesBefore, namesAfter)),
    removeItemsFromFolders(after, getNamesOnlyIn(namesAfter, namesBefore))
  );
};

/**
 * A rename can't be reverted by re-creating the item: it's refactored
 * across the whole project (other scenes' events, external events/layouts
 * referencing it by name) by `gd.WholeProjectRefactorer`, the same way an
 * object or object group rename is. So, like those, it's recorded as a
 * command: undo/redo re-invoke the refactorer in reverse. (A gameplay test
 * rename only changes its name, but is replayed the same way.)
 */
export type ProjectManagerRenameCommand = {|
  type:
    | 'renameScene'
    | 'renameExternalLayout'
    | 'renameExternalEvents'
    | 'renameGameplayTest',
  oldName: string,
  newName: string,
|};

/**
 * What an item was when it was removed, to re-create it the same.
 */
type RemovedItem = {|
  name: string,
  index: number,
  serialized: Object,
  wasFirstItem: boolean,
|};

type ProjectManagerHistoryAction =
  | {|
      type: 'add' | 'delete',
      targetKey: ProjectManagerHistoryTargetKey,
      itemNames: Array<string>,
      // Set while the items are not in the project (the step was undone for
      // an addition, or not yet undone for a deletion).
      removedItems: ?Array<RemovedItem>,
      foldersBefore: SerializedFolders,
      // Null while a deletion is being made (see `completeDeletion`).
      foldersAfter: ?SerializedFolders,
    |}
  | {|
      type: 'folders',
      targetKey: ProjectManagerHistoryTargetKey,
      foldersBefore: SerializedFolders,
      foldersAfter: SerializedFolders,
    |}
  | {|
      type: 'rename',
      command: ProjectManagerRenameCommand,
    |};

type ProjectManagerHistoryState = {|
  previousActions: Array<ProjectManagerHistoryAction>,
  futureActions: Array<ProjectManagerHistoryAction>,
|};

const getEmptyHistory = (): ProjectManagerHistoryState => ({
  previousActions: [],
  futureActions: [],
});

export type ProjectManagerHistoryChange = {|
  targetKey: ProjectManagerHistoryTargetKey,
  // The item added/removed/renamed by this step (the first one of a batch),
  // or null for a change of the folders only - the caller uses this to
  // reveal it in the project manager (open it, scroll to it, flash it).
  itemName: ?string,
|};

export type ProjectManagerHistoryApplyOptions = {|
  // Returns false when the rename can't be applied (the step is then left
  // as is).
  applyRenameCommand: (
    command: ProjectManagerRenameCommand,
    direction: 'undo' | 'redo'
  ) => boolean | void,
  /**
   * Called, and awaited, before the items are removed from the project:
   * the editors opened on them must be closed first.
   */
  onWillRemoveItems?: (
    targetKey: ProjectManagerHistoryTargetKey,
    itemNames: Array<string>
  ) => Promise<void>,
|};

export type UseProjectManagerHistoryResult = {|
  canUndo: boolean,
  canRedo: boolean,
  /**
   * Record the creation of items, once they're added to the project and
   * put in their folder.
   */
  recordAddition: (
    targetKey: ProjectManagerHistoryTargetKey,
    itemNames: Array<string>
  ) => void,
  /**
   * Record the deletion of items, just before they're removed from the
   * project (their content is captured at that moment, so they can be
   * re-created as they were). The step takes the folders as they are when
   * `completeDeletion` is called, once the items (and the folder deleted
   * with them, if any) are removed.
   */
  recordDeletion: (
    targetKey: ProjectManagerHistoryTargetKey,
    itemNames: Array<string>
  ) => void,
  completeDeletion: () => void,
  /**
   * Record a rename, applying the given refactoring function once (the
   * caller has already renamed the item and refactored the project before
   * calling this - this only saves the command so it can be replayed in
   * reverse by undo/redo).
   */
  recordRename: (command: ProjectManagerRenameCommand) => void,
  /**
   * Record a step if the folders were changed (a folder added, renamed or
   * removed, an item or a folder moved): to call after any change made from
   * the project manager.
   */
  syncFolders: () => void,
  /**
   * Undo/redo the last step. Applies the change to the project and returns
   * which item was affected, or null if there was nothing to undo/redo.
   * The caller (which owns the refactoring functions, to avoid a circular
   * dependency) must pass `applyRenameCommand` to revert/reapply a rename.
   */
  undo: (
    project: ?gdProject,
    options: ProjectManagerHistoryApplyOptions
  ) => Promise<?ProjectManagerHistoryChange>,
  redo: (
    project: ?gdProject,
    options: ProjectManagerHistoryApplyOptions
  ) => Promise<?ProjectManagerHistoryChange>,
|};

const captureItem = (
  list: ProjectManagerList,
  itemName: string
): ?RemovedItem => {
  const index = getItemIndex(list, itemName);
  if (index === -1) return null;
  return {
    name: itemName,
    index,
    serialized: serializeToJSObject(list.getAt(index)),
    wasFirstItem:
      !!list.getFirstItemName && list.getFirstItemName() === itemName,
  };
};

const removeItem = (list: ProjectManagerList, itemName: string) => {
  if (!list.has(itemName)) return;
  const { getFirstItemName, setFirstItemName } = list;
  if (getFirstItemName && setFirstItemName && getFirstItemName() === itemName)
    setFirstItemName('');
  list.remove(itemName);
};

/**
 * Re-create the removed items at their index, in ascending order so that
 * each one finds the ones before it already in place.
 */
const insertItems = (
  list: ProjectManagerList,
  removedItems: Array<RemovedItem>
) => {
  [...removedItems]
    .sort((a, b) => a.index - b.index)
    .forEach(removedItem => {
      const item = list.insertNew(
        removedItem.name,
        Math.min(removedItem.index, list.getCount())
      );
      list.unserializeItem(item, removedItem.serialized);
      if (removedItem.wasFirstItem && list.setFirstItemName)
        list.setFirstItemName(removedItem.name);
    });
};

const isUncompletedDeletion = (action: ?ProjectManagerHistoryAction) =>
  !!action && action.type === 'delete' && !action.foldersAfter;

/**
 * Track undo/redo for the project manager: scenes, external layouts,
 * external events and gameplay tests being created, deleted, renamed or
 * organized in folders.
 * Extensions are intentionally not tracked yet (adding/removing one reloads
 * their types into the running platform, a riskier operation to safely
 * undo).
 */
const useProjectManagerHistory = (
  project: ?gdProject
): UseProjectManagerHistoryResult => {
  const [history, setHistory] = React.useState<ProjectManagerHistoryState>(
    getEmptyHistory
  );
  // Mirrors the value of `history` synchronously, so a change is visible to
  // the very next call in the same event, before React re-renders.
  const latestHistoryRef = React.useRef<ProjectManagerHistoryState>(history);
  const setLatestHistory = (newHistory: ProjectManagerHistoryState) => {
    latestHistoryRef.current = newHistory;
    setHistory(newHistory);
  };
  // The folders of each kind as they were after the last step.
  const knownFoldersRef = React.useRef<{
    [ProjectManagerHistoryTargetKey]: SerializedFolders,
  }>({});
  const serializeAllFolders = (projectToSerialize: gdProject) => {
    const lists = getProjectManagerLists(projectToSerialize);
    return {
      scenes: lists.scenes.serializeFolders(),
      externalLayouts: lists.externalLayouts.serializeFolders(),
      externalEvents: lists.externalEvents.serializeFolders(),
      gameplayTests: lists.gameplayTests.serializeFolders(),
    };
  };

  const getKnownFolders = (
    list: ProjectManagerList,
    targetKey: ProjectManagerHistoryTargetKey
  ): SerializedFolders => {
    if (!knownFoldersRef.current[targetKey])
      knownFoldersRef.current[targetKey] = list.serializeFolders();
    return knownFoldersRef.current[targetKey];
  };

  // The hook is mounted once for the whole app's lifetime: the history is
  // about one project at a time.
  const previousProjectRef = React.useRef<?gdProject>(project);
  React.useEffect(
    () => {
      if (previousProjectRef.current !== project) {
        previousProjectRef.current = project;
        setLatestHistory(getEmptyHistory());
      }
      // Known from the start: the first change can be a folder one.
      knownFoldersRef.current = project ? serializeAllFolders(project) : {};
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project]
  );

  const pushAction = (action: ProjectManagerHistoryAction) => {
    const previousActions = [
      ...latestHistoryRef.current.previousActions,
      action,
    ];
    if (previousActions.length > HISTORY_MAX_SIZE)
      previousActions.splice(0, previousActions.length - HISTORY_MAX_SIZE);
    setLatestHistory({ previousActions, futureActions: [] });
  };

  const getLastAction = (): ?ProjectManagerHistoryAction => {
    const { previousActions } = latestHistoryRef.current;
    return previousActions[previousActions.length - 1];
  };

  const completeDeletion = () => {
    const action = getLastAction();
    if (!project || !action || action.type !== 'delete' || action.foldersAfter)
      return;
    const { targetKey } = action;
    const foldersAfter = getProjectManagerLists(project)[
      targetKey
    ].serializeFolders();
    knownFoldersRef.current[targetKey] = foldersAfter;
    const { previousActions, futureActions } = latestHistoryRef.current;
    setLatestHistory({
      previousActions: [
        ...previousActions.slice(0, -1),
        { ...action, foldersAfter },
      ],
      futureActions,
    });
  };

  const syncFolders = () => {
    if (!project) return;
    // The deletion being made takes the folders as they end up.
    if (isUncompletedDeletion(getLastAction())) return;
    const lists = getProjectManagerLists(project);
    Object.keys(lists).forEach(targetKey => {
      const list = lists[targetKey];
      const foldersBefore = getKnownFolders(list, targetKey);
      const foldersAfter = list.serializeFolders();
      if (areFoldersEqual(foldersBefore, foldersAfter)) return;
      knownFoldersRef.current[targetKey] = foldersAfter;
      if (haveFoldersChanged(foldersBefore, foldersAfter))
        pushAction({ type: 'folders', targetKey, foldersBefore, foldersAfter });
    });
  };

  const recordAddition = (
    targetKey: ProjectManagerHistoryTargetKey,
    itemNames: Array<string>
  ) => {
    if (!project || itemNames.length === 0) return;
    completeDeletion();
    const list = getProjectManagerLists(project)[targetKey];
    const foldersBefore = removeItemsFromFolders(
      getKnownFolders(list, targetKey),
      new Set(itemNames)
    );
    const foldersAfter = list.serializeFolders();
    knownFoldersRef.current[targetKey] = foldersAfter;
    pushAction({
      type: 'add',
      targetKey,
      itemNames,
      removedItems: null,
      foldersBefore,
      foldersAfter,
    });
  };

  const recordDeletion = (
    targetKey: ProjectManagerHistoryTargetKey,
    itemNames: Array<string>
  ) => {
    if (!project) return;
    completeDeletion();
    syncFolders();
    const list = getProjectManagerLists(project)[targetKey];
    const removedItems = itemNames
      .map(itemName => captureItem(list, itemName))
      .filter(Boolean);
    if (removedItems.length === 0) return;
    pushAction({
      type: 'delete',
      targetKey,
      itemNames: removedItems.map(removedItem => removedItem.name),
      removedItems,
      foldersBefore: getKnownFolders(list, targetKey),
      foldersAfter: null,
    });
  };

  const recordRename = (command: ProjectManagerRenameCommand) => {
    if (!project) return;
    completeDeletion();
    syncFolders();
    pushAction({ type: 'rename', command });
  };

  // An undo/redo waits for the tabs of the removed items to close: a second
  // one started meanwhile would apply the same step again.
  const isApplyingHistoryChangeRef = React.useRef(false);

  const applyHistoryChange = async (
    direction: 'undo' | 'redo',
    projectForApply: ?gdProject,
    options: ProjectManagerHistoryApplyOptions
  ): Promise<?ProjectManagerHistoryChange> => {
    if (isApplyingHistoryChangeRef.current) return null;
    isApplyingHistoryChangeRef.current = true;
    try {
      return await applyHistoryChangeNow(direction, projectForApply, options);
    } finally {
      isApplyingHistoryChangeRef.current = false;
    }
  };

  const getActionToApply = (
    direction: 'undo' | 'redo'
  ): ?ProjectManagerHistoryAction => {
    const { previousActions, futureActions } = latestHistoryRef.current;
    const actions = direction === 'undo' ? previousActions : futureActions;
    return actions[actions.length - 1];
  };

  const applyHistoryChangeNow = async (
    direction: 'undo' | 'redo',
    projectForApply: ?gdProject,
    { applyRenameCommand, onWillRemoveItems }: ProjectManagerHistoryApplyOptions
  ): Promise<?ProjectManagerHistoryChange> => {
    if (!projectForApply) return null;
    completeDeletion();
    // A change of the folders made without a step is the latest change.
    syncFolders();
    const action = getActionToApply(direction);
    if (!action) return null;

    let appliedAction = action;
    let change: ProjectManagerHistoryChange;
    const lists = getProjectManagerLists(projectForApply);
    if (action.type === 'rename') {
      if (applyRenameCommand(action.command, direction) === false) return null;
      change = {
        targetKey: renameCommandTargetKey(action.command),
        itemName:
          direction === 'undo'
            ? action.command.oldName
            : action.command.newName,
      };
    } else if (action.type === 'folders') {
      const { targetKey } = action;
      const folders =
        direction === 'undo' ? action.foldersBefore : action.foldersAfter;
      lists[targetKey].unserializeFolders(folders);
      knownFoldersRef.current[targetKey] = folders;
      change = { targetKey, itemName: null };
    } else {
      const { targetKey, itemNames } = action;
      const list = lists[targetKey];
      const isRemoving = (action.type === 'add') === (direction === 'undo');
      if (isRemoving) {
        const presentNames = itemNames.filter(name => list.has(name));
        if (onWillRemoveItems && presentNames.length > 0)
          await onWillRemoveItems(targetKey, presentNames);
        // A step recorded during the wait is the one to apply next, not
        // this one.
        if (getActionToApply(direction) !== action) return null;
        const removedItems = itemNames
          .map(name => captureItem(list, name))
          .filter(Boolean);
        itemNames.forEach(name => removeItem(list, name));
        appliedAction = { ...action, removedItems };
      } else {
        const removedItems = action.removedItems || [];
        // Nothing restored (a name is taken): leave the step as is, it can
        // be applied once the name is free again.
        if (removedItems.some(removedItem => list.has(removedItem.name)))
          return null;
        insertItems(list, removedItems);
        appliedAction = { ...action, removedItems: null };
      }
      const folders =
        direction === 'undo'
          ? action.foldersBefore
          : action.foldersAfter || list.serializeFolders();
      list.unserializeFolders(folders);
      knownFoldersRef.current[targetKey] = folders;
      change = { targetKey, itemName: itemNames[0] };
    }

    const { previousActions, futureActions } = latestHistoryRef.current;
    setLatestHistory(
      direction === 'undo'
        ? {
            previousActions: previousActions.slice(0, -1),
            futureActions: [...futureActions, appliedAction],
          }
        : {
            previousActions: [...previousActions, appliedAction],
            futureActions: futureActions.slice(0, -1),
          }
    );
    return change;
  };

  return {
    canUndo: history.previousActions.length > 0,
    canRedo: history.futureActions.length > 0,
    recordAddition,
    recordDeletion,
    completeDeletion,
    recordRename,
    syncFolders,
    undo: (projectForApply, options) =>
      applyHistoryChange('undo', projectForApply, options),
    redo: (projectForApply, options) =>
      applyHistoryChange('redo', projectForApply, options),
  };
};

const renameCommandTargetKey = (
  command: ProjectManagerRenameCommand
): ProjectManagerHistoryTargetKey => {
  if (command.type === 'renameScene') return 'scenes';
  if (command.type === 'renameExternalLayout') return 'externalLayouts';
  if (command.type === 'renameGameplayTest') return 'gameplayTests';
  return 'externalEvents';
};

export default useProjectManagerHistory;
