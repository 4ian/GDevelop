// @flow
import * as React from 'react';
import {
  type HistoryState,
  type CompositeTargets,
  type CompositeTarget,
  type UndoAction,
  type RedoAction,
  getCompositeHistoryInitialState,
  saveValueChangeToHistory,
  saveCommandToHistory,
  serializeCompositeTargets,
  refreshCompositeHistoryValue,
  getLastUndoableAction,
  getLastRedoableAction,
  undoComposite,
  redoComposite,
  canUndo as canUndoHistory,
  canRedo as canRedoHistory,
} from '../Utils/History';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

// Project manager items are always created/deleted/renamed one at a time,
// as a deliberate action (never a rapid, per-keystroke stream like an
// instance being dragged) - so, unlike the scene editor's history, no
// debouncing/merging of pending edits is needed here: every action is
// recorded as its own, immediate step.

const HISTORY_MAX_SIZE = 50;

/**
 * A project-level list (the project's scenes, external layouts or external
 * events), tracked as a single history target: its value is the ordered
 * list of items, each fully serialized, so a step can restore an item
 * removed by a later step (deletion here isn't a whole-project refactor,
 * unlike an object's - it only removes the item itself, so it can be
 * treated like any other tracked target).
 * The content of an item is only used to re-create it: a step never
 * changes an item that exists in both its before and after values.
 */
export type ProjectManagerListTarget = {|
  getCount: () => number,
  getAt: (index: number) => Object /* gdSerializable, has getName() */,
  insertNew: (name: string, position: number) => Object,
  remove: (name: string) => void,
  // The scenes list also tracks which one the game starts with.
  getFirstItemName?: () => string,
  setFirstItemName?: (name: string) => void,
|};

const getListItemNames = (list: ProjectManagerListTarget): Array<string> => {
  const names = [];
  for (let i = 0; i < list.getCount(); i++) {
    names.push(list.getAt(i).getName());
  }
  return names;
};

const getProjectListHistoryTarget = (
  list: ProjectManagerListTarget,
  project: gdProject
): CompositeTarget => ({
  getValue: () => {
    const items = [];
    for (let i = 0; i < list.getCount(); i++) {
      const item = list.getAt(i);
      items.push({
        name: item.getName(),
        serialized: serializeToJSObject(item),
      });
    }
    return list.getFirstItemName
      ? { items, firstItemName: list.getFirstItemName() }
      : { items };
  },
  setValue: (value: Object) => {
    const targetItems = value.items || [];
    const targetNames = new Set(targetItems.map(item => item.name));

    const currentNames = getListItemNames(list);
    // Only remove items that shouldn't exist any more, and only insert
    // items that are missing - never remove-then-reinsert an item that's
    // in both the current and the target state. That item would otherwise
    // be destroyed and recreated as a new C++ object for no reason, even
    // though nothing about it (its own content included) is tracked by
    // this step - and any open editor for it (holding references to its
    // instances, events, instructions...) would be left with dangling
    // references to the destroyed original, crashing on next use.
    currentNames
      .filter(name => !targetNames.has(name))
      .forEach(name => list.remove(name));

    const remainingNames = new Set<string>();
    for (let i = 0; i < list.getCount(); i++) {
      remainingNames.add(list.getAt(i).getName());
    }
    targetItems.forEach(({ name, serialized }, index) => {
      if (remainingNames.has(name)) return;
      const item = list.insertNew(name, index);
      unserializeFromJSObject(item, serialized, 'unserializeFrom', project);
    });

    if (list.setFirstItemName && typeof value.firstItemName === 'string') {
      list.setFirstItemName(
        targetNames.has(value.firstItemName) ? value.firstItemName : ''
      );
    }
  },
});

/** The value of a list target without one of its items. */
const getValueWithoutItem = (value: Object, itemName: string): Object => ({
  ...value,
  items: (value.items || []).filter(item => item.name !== itemName),
  ...(value.firstItemName === itemName ? { firstItemName: '' } : {}),
});

export type ProjectManagerHistoryTargetKey =
  | 'scenes'
  | 'externalLayouts'
  | 'externalEvents';

const getProjectManagerLists = (
  project: gdProject
): { [ProjectManagerHistoryTargetKey]: ProjectManagerListTarget } => ({
  scenes: {
    getCount: () => project.getLayoutsCount(),
    getAt: index => project.getLayoutAt(index),
    insertNew: (name, position) => project.insertNewLayout(name, position),
    remove: name => project.removeLayout(name),
    getFirstItemName: () => project.getFirstLayout(),
    setFirstItemName: name => project.setFirstLayout(name),
  },
  externalLayouts: {
    getCount: () => project.getExternalLayoutsCount(),
    getAt: index => project.getExternalLayoutAt(index),
    insertNew: (name, position) =>
      project.insertNewExternalLayout(name, position),
    remove: name => project.removeExternalLayout(name),
  },
  externalEvents: {
    getCount: () => project.getExternalEventsCount(),
    getAt: index => project.getExternalEventsAt(index),
    insertNew: (name, position) =>
      project.insertNewExternalEvents(name, position),
    remove: name => project.removeExternalEvents(name),
  },
});

const getProjectManagerHistoryTargets = (
  project: ?gdProject
): CompositeTargets => {
  if (!project) return {};
  const lists = getProjectManagerLists(project);
  return {
    scenes: getProjectListHistoryTarget(lists.scenes, project),
    externalLayouts: getProjectListHistoryTarget(
      lists.externalLayouts,
      project
    ),
    externalEvents: getProjectListHistoryTarget(lists.externalEvents, project),
  };
};

/**
 * A rename can't be captured by a snapshot of the target list alone: it's
 * refactored across the whole project (other scenes' events, external
 * events/layouts referencing it by name) by `gd.WholeProjectRefactorer`, the
 * same way an object or object group rename is. So, like those, it's
 * recorded as a command: undo/redo re-invoke the refactorer in reverse.
 */
export type ProjectManagerRenameCommand = {|
  type: 'renameScene' | 'renameExternalLayout' | 'renameExternalEvents',
  oldName: string,
  newName: string,
|};

export type ProjectManagerHistoryChange = {|
  targetKey: ProjectManagerHistoryTargetKey,
  // The item added/removed/renamed by this step - the caller uses this to
  // reveal it in the project manager (open it, scroll to it, flash it).
  itemName: string,
|};

export type ProjectManagerHistoryApplyOptions = {|
  applyRenameCommand: (
    command: ProjectManagerRenameCommand,
    direction: 'undo' | 'redo'
  ) => void,
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

/**
 * Track undo/redo for the project manager: scenes, external layouts and
 * external events being created, deleted or renamed. Extensions are
 * intentionally not tracked yet (adding/removing one reloads their types
 * into the running platform, a riskier operation to safely undo).
 */
const useProjectManagerHistory = (
  project: ?gdProject
): UseProjectManagerHistoryResult => {
  const [history, setHistory] = React.useState<HistoryState>(() =>
    getCompositeHistoryInitialState(getProjectManagerHistoryTargets(project), {
      historyMaxSize: HISTORY_MAX_SIZE,
    })
  );
  // Mirrors the value of `history` synchronously, so a change is visible to
  // the very next call in the same event, before React re-renders.
  const latestHistoryRef = React.useRef<HistoryState>(history);
  const setLatestHistory = (newHistory: HistoryState) => {
    latestHistoryRef.current = newHistory;
    setHistory(newHistory);
  };

  // The hook is mounted once for the whole app's lifetime, before any
  // project is loaded - so the state above is initialized with no project
  // (empty targets) and never re-evaluated by React afterwards. Whenever
  // the project actually becomes available (or a different one is opened),
  // reset the history and re-seed its cached values from that project -
  // otherwise the first ever undo/redo would revert to an empty, bogus
  // "before" value instead of the project's real initial state.
  const previousProjectRef = React.useRef<?gdProject>(project);
  React.useEffect(
    () => {
      if (previousProjectRef.current !== project) {
        previousProjectRef.current = project;
        setLatestHistory(
          getCompositeHistoryInitialState(
            getProjectManagerHistoryTargets(project),
            { historyMaxSize: HISTORY_MAX_SIZE }
          )
        );
      }
    },
    [project]
  );

  // The cached value of a target goes stale as soon as an item is edited
  // (in its own editor) or renamed: the values of a step are always taken
  // from the project at the moment of the change, never from the cache.
  const serializeTarget = (
    projectToSerialize: gdProject,
    targetKey: ProjectManagerHistoryTargetKey
  ): Object =>
    serializeCompositeTargets(
      getProjectManagerHistoryTargets(projectToSerialize),
      [targetKey]
    )[targetKey];

  const recordAddition = (
    targetKey: ProjectManagerHistoryTargetKey,
    itemName: string
  ) => {
    if (!project) return;
    const valueAfterChange = serializeTarget(project, targetKey);
    setLatestHistory(
      saveValueChangeToHistory(
        latestHistoryRef.current,
        { [targetKey]: getValueWithoutItem(valueAfterChange, itemName) },
        { [targetKey]: valueAfterChange },
        'ADD',
        { targetKey, itemName }
      )
    );
  };

  const recordDeletion = (
    targetKey: ProjectManagerHistoryTargetKey,
    itemName: string
  ) => {
    if (!project) return;
    const valueBeforeChange = serializeTarget(project, targetKey);
    setLatestHistory(
      saveValueChangeToHistory(
        latestHistoryRef.current,
        { [targetKey]: valueBeforeChange },
        { [targetKey]: getValueWithoutItem(valueBeforeChange, itemName) },
        'DELETE',
        { targetKey, itemName }
      )
    );
  };

  const recordRename = (command: ProjectManagerRenameCommand) => {
    const targetKey = renameCommandTargetKey(command);
    const historyWithCommand = saveCommandToHistory(
      latestHistoryRef.current,
      command,
      { targetKey, itemName: command.newName }
    );
    setLatestHistory(
      project
        ? refreshCompositeHistoryValue(
            historyWithCommand,
            getProjectManagerHistoryTargets(project),
            [targetKey]
          )
        : historyWithCommand
    );
  };

  const applyHistoryChange = async (
    direction: 'undo' | 'redo',
    projectForApply: ?gdProject,
    { applyRenameCommand, onWillRemoveItems }: ProjectManagerHistoryApplyOptions
  ): Promise<?ProjectManagerHistoryChange> => {
    let currentHistory = latestHistoryRef.current;
    const canApply =
      direction === 'undo'
        ? canUndoHistory(currentHistory)
        : canRedoHistory(currentHistory);
    if (!canApply) return null;

    const action =
      direction === 'undo'
        ? getLastUndoableAction(currentHistory)
        : getLastRedoableAction(currentHistory);
    if (!action) return null;
    const changeContext = action.changeContext || null;

    if (action.command) {
      applyRenameCommand(action.command, direction);
    }

    const targets = getProjectManagerHistoryTargets(projectForApply);
    const valueToApply: Object =
      direction === 'undo'
        ? ((action: any): UndoAction).valueBeforeChange
        : ((action: any): RedoAction).valueAfterChange;
    const keys: Array<ProjectManagerHistoryTargetKey> = (Object.keys(
      valueToApply
    ): any);
    if (projectForApply && keys.length) {
      // The step applied the other way must restore the items as they are
      // now, not as they were when this step was recorded.
      currentHistory = refreshCompositeHistoryValue(currentHistory, targets, [
        ...keys,
      ]);
      if (onWillRemoveItems) {
        const lists = getProjectManagerLists(projectForApply);
        for (const key of keys) {
          const targetNames = new Set(
            (valueToApply[key].items || []).map(item => item.name)
          );
          const removedNames = getListItemNames(lists[key]).filter(
            name => !targetNames.has(name)
          );
          if (removedNames.length) await onWillRemoveItems(key, removedNames);
        }
      }
    }

    const newHistory =
      direction === 'undo'
        ? undoComposite(currentHistory, targets, projectForApply)
        : redoComposite(currentHistory, targets, projectForApply);
    setLatestHistory(newHistory);

    if (!changeContext) return null;
    // A rename's changeContext.itemName is always the post-rename name, but
    // undoing it renames the item back to its old name - the item to reveal
    // depends on the direction just applied, not on that fixed value.
    const itemName = action.command
      ? direction === 'undo'
        ? action.command.oldName
        : action.command.newName
      : changeContext.itemName;
    return {
      targetKey: changeContext.targetKey,
      itemName,
    };
  };

  return {
    canUndo: canUndoHistory(history),
    canRedo: canRedoHistory(history),
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
