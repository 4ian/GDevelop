// @flow
import * as React from 'react';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

// Project manager items are always created/deleted/renamed one at a time,
// as a deliberate action (never a rapid, per-keystroke stream like an
// instance being dragged) - so, unlike the scene editor's history, no
// debouncing/merging of pending edits is needed here: every action is
// recorded as its own, immediate step.
//
// Each step is about a single item: undoing the creation of a scene removes
// that scene only, whatever was added to the project meanwhile without a
// step (pasted, duplicated, created by the AI...). The content of an item
// is only serialized when it's about to be removed, so it can be re-created
// as it was.

const HISTORY_MAX_SIZE = 50;

export type ProjectManagerHistoryTargetKey =
  | 'scenes'
  | 'externalLayouts'
  | 'externalEvents';

/**
 * A project-level list (the project's scenes, external layouts or external
 * events).
 */
type ProjectManagerList = {|
  getCount: () => number,
  getAt: (index: number) => Object /* gdSerializable, has getName() */,
  has: (name: string) => boolean,
  insertNew: (name: string, position: number) => Object,
  remove: (name: string) => void,
  // The scenes list also tracks which one the game starts with.
  getFirstItemName?: () => string,
  setFirstItemName?: (name: string) => void,
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
    getFirstItemName: () => project.getFirstLayout(),
    setFirstItemName: name => project.setFirstLayout(name),
  },
  externalLayouts: {
    getCount: () => project.getExternalLayoutsCount(),
    getAt: index => project.getExternalLayoutAt(index),
    has: name => project.hasExternalLayoutNamed(name),
    insertNew: (name, position) =>
      project.insertNewExternalLayout(name, position),
    remove: name => project.removeExternalLayout(name),
  },
  externalEvents: {
    getCount: () => project.getExternalEventsCount(),
    getAt: index => project.getExternalEventsAt(index),
    has: name => project.hasExternalEventsNamed(name),
    insertNew: (name, position) =>
      project.insertNewExternalEvents(name, position),
    remove: name => project.removeExternalEvents(name),
  },
});

const getItemIndex = (list: ProjectManagerList, itemName: string): number => {
  for (let i = 0; i < list.getCount(); i++) {
    if (list.getAt(i).getName() === itemName) return i;
  }
  return -1;
};

/**
 * A rename can't be reverted by re-creating the item: it's refactored
 * across the whole project (other scenes' events, external events/layouts
 * referencing it by name) by `gd.WholeProjectRefactorer`, the same way an
 * object or object group rename is. So, like those, it's recorded as a
 * command: undo/redo re-invoke the refactorer in reverse.
 */
export type ProjectManagerRenameCommand = {|
  type: 'renameScene' | 'renameExternalLayout' | 'renameExternalEvents',
  oldName: string,
  newName: string,
|};

/**
 * What an item was when it was removed, to re-create it the same.
 */
type RemovedItem = {|
  index: number,
  serialized: Object,
  wasFirstItem: boolean,
|};

type ProjectManagerHistoryAction =
  | {|
      type: 'add' | 'delete',
      targetKey: ProjectManagerHistoryTargetKey,
      itemName: string,
      // Set while the item is not in the project (the step was undone for
      // an addition, or not yet undone for a deletion).
      removedItem: ?RemovedItem,
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
  // The item added/removed/renamed by this step - the caller uses this to
  // reveal it in the project manager (open it, scroll to it, flash it).
  itemName: string,
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
   * Record the creation of an item, once it's added to the project.
   */
  recordAddition: (
    targetKey: ProjectManagerHistoryTargetKey,
    itemName: string
  ) => void,
  /**
   * Record the deletion of an item, just before it's removed from the
   * project (its content is captured at that moment, so it can be
   * re-created as it was).
   */
  recordDeletion: (
    targetKey: ProjectManagerHistoryTargetKey,
    itemName: string
  ) => void,
  /**
   * Record a rename, applying the given refactoring function once (the
   * caller has already renamed the item and refactored the project before
   * calling this - this only saves the command so it can be replayed in
   * reverse by undo/redo).
   */
  recordRename: (command: ProjectManagerRenameCommand) => void,
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

const insertItem = (
  list: ProjectManagerList,
  project: gdProject,
  itemName: string,
  removedItem: RemovedItem
): boolean => {
  // The name can be taken by an item added outside the history.
  if (list.has(itemName)) return false;
  const item = list.insertNew(
    itemName,
    Math.min(removedItem.index, list.getCount())
  );
  unserializeFromJSObject(
    item,
    removedItem.serialized,
    'unserializeFrom',
    project
  );
  if (removedItem.wasFirstItem && list.setFirstItemName)
    list.setFirstItemName(itemName);
  return true;
};

/**
 * Track undo/redo for the project manager: scenes, external layouts and
 * external events being created, deleted or renamed. Extensions are
 * intentionally not tracked yet (adding/removing one reloads their types
 * into the running platform, a riskier operation to safely undo).
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

  // The hook is mounted once for the whole app's lifetime: the history is
  // about one project at a time.
  const previousProjectRef = React.useRef<?gdProject>(project);
  React.useEffect(
    () => {
      if (previousProjectRef.current !== project) {
        previousProjectRef.current = project;
        setLatestHistory(getEmptyHistory());
      }
    },
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

  const recordAddition = (
    targetKey: ProjectManagerHistoryTargetKey,
    itemName: string
  ) => {
    if (!project) return;
    pushAction({ type: 'add', targetKey, itemName, removedItem: null });
  };

  const recordDeletion = (
    targetKey: ProjectManagerHistoryTargetKey,
    itemName: string
  ) => {
    if (!project) return;
    const removedItem = captureItem(
      getProjectManagerLists(project)[targetKey],
      itemName
    );
    if (!removedItem) return;
    pushAction({ type: 'delete', targetKey, itemName, removedItem });
  };

  const recordRename = (command: ProjectManagerRenameCommand) => {
    if (!project) return;
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
    const action = getActionToApply(direction);
    if (!action || !projectForApply) return null;

    let appliedAction = action;
    let change: ProjectManagerHistoryChange;
    if (action.type === 'rename') {
      if (applyRenameCommand(action.command, direction) === false) return null;
      change = {
        targetKey: renameCommandTargetKey(action.command),
        itemName:
          direction === 'undo'
            ? action.command.oldName
            : action.command.newName,
      };
    } else {
      const { targetKey, itemName } = action;
      const list = getProjectManagerLists(projectForApply)[targetKey];
      const isRemoving = (action.type === 'add') === (direction === 'undo');
      if (isRemoving) {
        if (onWillRemoveItems && list.has(itemName))
          await onWillRemoveItems(targetKey, [itemName]);
        // A step recorded during the wait is the one to apply next, not
        // this one.
        if (getActionToApply(direction) !== action) return null;
        const removedItem = captureItem(list, itemName);
        removeItem(list, itemName);
        appliedAction = { ...action, removedItem };
      } else {
        // Nothing restored (the name is taken): leave the step as is, it
        // can be applied once the name is free again.
        if (
          action.removedItem &&
          !insertItem(list, projectForApply, itemName, action.removedItem)
        )
          return null;
        appliedAction = { ...action, removedItem: null };
      }
      change = { targetKey, itemName };
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
    recordRename,
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
  return 'externalEvents';
};

export default useProjectManagerHistory;
