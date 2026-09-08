// @flow
import * as React from 'react';
import {
  type HistoryState,
  type CompositeTargets,
  type CompositeTarget,
  getCompositeHistoryInitialState,
  savePartialValueToHistory,
  saveCommandToHistory,
  serializeCompositeTargets,
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
 */
export type ProjectManagerListTarget = {|
  getCount: () => number,
  getAt: (index: number) => Object /* gdSerializable, has getName() */,
  insertNew: (name: string, position: number) => Object,
  remove: (name: string) => void,
|};

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
    return { items };
  },
  setValue: (value: Object) => {
    const currentNames = [];
    for (let i = 0; i < list.getCount(); i++) {
      currentNames.push(list.getAt(i).getName());
    }
    currentNames.forEach(name => list.remove(name));
    (value.items || []).forEach(({ name, serialized }, index) => {
      const item = list.insertNew(name, index);
      unserializeFromJSObject(item, serialized, 'unserializeFrom', project);
    });
  },
});

export type ProjectManagerHistoryTargetKey =
  | 'scenes'
  | 'externalLayouts'
  | 'externalEvents';

const getProjectManagerHistoryTargets = (
  project: ?gdProject
): CompositeTargets => {
  if (!project) return {};
  return {
    scenes: getProjectListHistoryTarget(
      {
        getCount: () => project.getLayoutsCount(),
        getAt: index => project.getLayoutAt(index),
        insertNew: (name, position) => project.insertNewLayout(name, position),
        remove: name => project.removeLayout(name),
      },
      project
    ),
    externalLayouts: getProjectListHistoryTarget(
      {
        getCount: () => project.getExternalLayoutsCount(),
        getAt: index => project.getExternalLayoutAt(index),
        insertNew: (name, position) =>
          project.insertNewExternalLayout(name, position),
        remove: name => project.removeExternalLayout(name),
      },
      project
    ),
    externalEvents: getProjectListHistoryTarget(
      {
        getCount: () => project.getExternalEventsCount(),
        getAt: index => project.getExternalEventsAt(index),
        insertNew: (name, position) =>
          project.insertNewExternalEvents(name, position),
        remove: name => project.removeExternalEvents(name),
      },
      project
    ),
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

export type UseProjectManagerHistoryResult = {|
  canUndo: boolean,
  canRedo: boolean,
  /**
   * Record a step for the current state of the given target (a creation or
   * a deletion - a rename must use `recordRename` instead).
   */
  recordStep: (
    targetKey: ProjectManagerHistoryTargetKey,
    actionType: 'ADD' | 'DELETE',
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
    applyRenameCommand: (
      command: ProjectManagerRenameCommand,
      direction: 'undo' | 'redo'
    ) => void
  ) => ?ProjectManagerHistoryChange,
  redo: (
    project: ?gdProject,
    applyRenameCommand: (
      command: ProjectManagerRenameCommand,
      direction: 'undo' | 'redo'
    ) => void
  ) => ?ProjectManagerHistoryChange,
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

  const recordStep = (
    targetKey: ProjectManagerHistoryTargetKey,
    actionType: 'ADD' | 'DELETE',
    itemName: string
  ) => {
    if (!project) return;
    const value = serializeCompositeTargets(
      getProjectManagerHistoryTargets(project),
      [targetKey]
    );
    setLatestHistory(
      savePartialValueToHistory(latestHistoryRef.current, value, actionType, {
        targetKey,
        itemName,
      })
    );
  };

  const recordRename = (command: ProjectManagerRenameCommand) => {
    setLatestHistory(
      saveCommandToHistory(latestHistoryRef.current, command, {
        targetKey: renameCommandTargetKey(command),
        itemName: command.newName,
      })
    );
  };

  const applyHistoryChange = (
    direction: 'undo' | 'redo',
    projectForApply: ?gdProject,
    applyRenameCommand: (
      command: ProjectManagerRenameCommand,
      direction: 'undo' | 'redo'
    ) => void
  ): ?ProjectManagerHistoryChange => {
    const currentHistory = latestHistoryRef.current;
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
    recordStep,
    recordRename,
    undo: (projectForApply, applyRenameCommand) =>
      applyHistoryChange('undo', projectForApply, applyRenameCommand),
    redo: (projectForApply, applyRenameCommand) =>
      applyHistoryChange('redo', projectForApply, applyRenameCommand),
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
