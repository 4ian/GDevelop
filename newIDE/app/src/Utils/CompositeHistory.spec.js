// @flow
import {
  getCompositeHistoryInitialState,
  saveCompositeToHistory,
  savePartialValueToHistory,
  saveCommandToHistory,
  refreshCompositeHistoryValue,
  getLastUndoableAction,
  getLastRedoableAction,
  undoComposite,
  redoComposite,
  canUndo,
  canRedo,
  type CompositeTargets,
  type HistoryState,
} from './History';
import { serializeToJSObject, unserializeFromJSObject } from './Serializer';

const gd: libGDevelop = global.gd;

describe('composite history', () => {
  let variablesContainer: gdVariablesContainer;
  let customState: { color: string };
  let targets: CompositeTargets;

  beforeEach(() => {
    variablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Unknown
    );
    customState = { color: 'red' };
    targets = {
      variables: { serializableObject: variablesContainer },
      custom: {
        getValue: () => ({ ...customState }),
        setValue: value => {
          customState = { ...value };
        },
      },
    };
  });

  afterEach(() => {
    variablesContainer.delete();
  });

  it('captures the changes of several targets in a single undoable step', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    expect(canUndo(history)).toBe(false);

    variablesContainer.insertNew('Score', 0).setValue(100);
    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets, ['variables', 'custom']);
    expect(canUndo(history)).toBe(true);

    history = undoComposite(history, targets);
    expect(variablesContainer.has('Score')).toBe(false);
    expect(customState.color).toBe('red');
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(true);

    history = redoComposite(history, targets);
    expect(variablesContainer.has('Score')).toBe(true);
    expect(variablesContainer.get('Score').getValue()).toBe(100);
    expect(customState.color).toBe('blue');
    expect(canRedo(history)).toBe(false);
  });

  it('only stores and restores the targets declared by a step', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });

    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets, ['custom']);
    const action = getLastUndoableAction(history);
    expect(action && Object.keys(action.valueBeforeChange)).toEqual(['custom']);

    // A change of another target that was not declared (a bug, or a change
    // made outside of this history) is left untouched by the undo.
    variablesContainer.insertNew('Score', 0).setValue(7);
    history = undoComposite(history, targets);
    expect(customState.color).toBe('red');
    expect(variablesContainer.has('Score')).toBe(true);
  });

  it('does not save a step for targets that did not change', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    const unchangedHistory = saveCompositeToHistory(history, targets, [
      'variables',
    ]);
    expect(unchangedHistory).toBe(history);
    expect(canUndo(unchangedHistory)).toBe(false);
  });

  it('bases the next step on a refreshed value', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    // Changed outside of the history, then refreshed.
    customState.color = 'blue';
    history = refreshCompositeHistoryValue(history, targets, ['custom']);
    expect(canUndo(history)).toBe(false);

    customState.color = 'green';
    history = saveCompositeToHistory(history, targets, ['custom']);
    history = undoComposite(history, targets);
    expect(customState.color).toBe('blue');
  });

  it('keeps the command of a command step through undo and redo', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    history = saveCommandToHistory(
      history,
      { type: 'rename' },
      { source: 'panel' }
    );
    expect(canUndo(history)).toBe(true);
    const action = getLastUndoableAction(history);
    expect(action && action.command).toEqual({ type: 'rename' });

    history = undoComposite(history, targets);
    expect(history.futureActions[0].command).toEqual({ type: 'rename' });
    expect(customState.color).toBe('red');
    history = redoComposite(history, targets);
    expect(history.previousActions[0].command).toEqual({ type: 'rename' });
  });

  it('supports custom serialization methods and per-target project passing', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    const sceneTargets: CompositeTargets = {
      instances: {
        serializableObject: layout.getInitialInstances(),
        unserializationNeedsProject: true,
      },
      layers: {
        serializableObject: layout.getLayers(),
        serializationMethodName: 'serializeLayersTo',
        unserializationMethodName: 'unserializeLayersFrom',
      },
    };

    let history = getCompositeHistoryInitialState(sceneTargets, {
      historyMaxSize: 10,
    });
    const instance = layout.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Player');
    instance.setHidden(true);
    layout.getLayers().insertNewLayer('UI', 1);
    layout
      .getLayers()
      .getLayer('UI')
      .setVisibility(false);
    history = saveCompositeToHistory(history, sceneTargets, [
      'instances',
      'layers',
    ]);

    history = undoComposite(history, sceneTargets, project);
    expect(layout.getLayers().hasLayerNamed('UI')).toBe(false);
    expect(layout.getInitialInstances().getInstancesCount()).toBe(0);

    redoComposite(history, sceneTargets, project);
    expect(layout.getLayers().hasLayerNamed('UI')).toBe(true);
    expect(
      layout
        .getLayers()
        .getLayer('UI')
        .getVisibility()
    ).toBe(false);
    expect(layout.getInitialInstances().getInstancesCount()).toBe(1);

    project.delete();
  });

  it('restores objects, folders and groups of an objects container', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectsContainer = layout.getObjects();
    objectsContainer.insertNewObject(project, 'Sprite', 'Player', 0);

    const objectsTargets: CompositeTargets = {
      objects: {
        getValue: () => ({
          objects: serializeToJSObject(objectsContainer, 'serializeObjectsTo'),
          folders: serializeToJSObject(objectsContainer, 'serializeFoldersTo'),
        }),
        setValue: value => {
          unserializeFromJSObject(
            objectsContainer,
            value.objects,
            'unserializeObjectsFrom',
            project
          );
          unserializeFromJSObject(
            objectsContainer,
            value.folders,
            'unserializeFoldersFrom',
            project
          );
        },
      },
      groups: { serializableObject: objectsContainer.getObjectGroups() },
    };
    let history = getCompositeHistoryInitialState(objectsTargets, {
      historyMaxSize: 10,
    });

    const folder = objectsContainer
      .getRootFolder()
      .insertNewFolder('Enemies', 0);
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'Enemy',
      folder,
      0
    );
    objectsContainer
      .getObject('Player')
      .getVariables()
      .insertNew('Life', 0)
      .setValue(3);
    const group = objectsContainer.getObjectGroups().insertNew('Everyone', 0);
    group.addObject('Player');
    history = saveCompositeToHistory(history, objectsTargets, [
      'objects',
      'groups',
    ]);

    history = undoComposite(history, objectsTargets, project);
    expect(objectsContainer.hasObjectNamed('Enemy')).toBe(false);
    expect(objectsContainer.getRootFolder().getChildrenCount()).toBe(1);
    expect(
      objectsContainer
        .getObject('Player')
        .getVariables()
        .has('Life')
    ).toBe(false);
    expect(objectsContainer.getObjectGroups().has('Everyone')).toBe(false);

    redoComposite(history, objectsTargets, project);
    expect(objectsContainer.hasObjectNamed('Enemy')).toBe(true);
    expect(objectsContainer.getRootFolder().getChildrenCount()).toBe(2);
    expect(
      objectsContainer
        .getRootFolder()
        .getChildAt(0)
        .getChildAt(0)
        .getObject()
        .getName()
    ).toBe('Enemy');
    expect(
      objectsContainer
        .getObject('Player')
        .getVariables()
        .get('Life')
        .getValue()
    ).toBe(3);
    expect(
      objectsContainer
        .getObjectGroups()
        .get('Everyone')
        .find('Player')
    ).toBe(true);

    project.delete();
  });

  it('records two separate steps for two changes to different targets, each undo/redo touching only its own target', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });

    variablesContainer.insertNew('Score', 0).setValue(1);
    history = saveCompositeToHistory(history, targets, ['variables']);
    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets, ['custom']);
    expect(history.previousActions.length).toBe(2);

    // First undo only reverts the second (custom) step.
    history = undoComposite(history, targets);
    expect(customState.color).toBe('red');
    expect(variablesContainer.get('Score').getValue()).toBe(1);
    expect(canUndo(history)).toBe(true);

    // Second undo reverts the first (variables) step, leaving custom alone.
    history = undoComposite(history, targets);
    expect(variablesContainer.has('Score')).toBe(false);
    expect(customState.color).toBe('red');
    expect(canUndo(history)).toBe(false);

    // Redoing replays them in the same order, one target at a time.
    history = redoComposite(history, targets);
    expect(variablesContainer.get('Score').getValue()).toBe(1);
    expect(customState.color).toBe('red');
    history = redoComposite(history, targets);
    expect(customState.color).toBe('blue');
  });

  it('undoing a step that declared overlapping keys only reverts what it actually changed', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });

    // Step 1 changes both targets.
    variablesContainer.insertNew('Score', 0).setValue(1);
    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets, ['variables', 'custom']);

    // Step 2 changes only "custom" (declares a subset of step 1's keys).
    customState.color = 'green';
    history = saveCompositeToHistory(history, targets, ['custom']);

    // Undoing step 2 must not touch "variables", set by step 1.
    history = undoComposite(history, targets);
    expect(customState.color).toBe('blue');
    expect(variablesContainer.get('Score').getValue()).toBe(1);

    // Undoing step 1 now reverts both targets to their initial state.
    undoComposite(history, targets);
    expect(customState.color).toBe('red');
    expect(variablesContainer.has('Score')).toBe(false);
  });

  it('saves and undoes an already-merged partial value, as SceneEditor does for a patched instance array', () => {
    // `savePartialValueToHistory` is called directly (not through
    // `saveCompositeToHistory`) with a value the caller already merged
    // itself - e.g. one changed instance patched into the full array of a
    // scene's instances, to avoid re-serializing untouched ones.
    const initialHistory: HistoryState = {
      previousActions: [],
      currentValue: {
        instances: [{ id: 'a', x: 0 }, { id: 'b', x: 100 }],
        color: 'red',
      },
      futureActions: [],
      maxSize: 10,
    };

    const history = savePartialValueToHistory(
      initialHistory,
      { instances: [{ id: 'a', x: 50 }, { id: 'b', x: 100 }] },
      'EDIT',
      { source: 'panel' }
    );
    expect(canUndo(history)).toBe(true);
    expect(history.currentValue.color).toBe('red'); // Untouched target kept.
    const action = getLastUndoableAction(history);
    // Only the declared key is stored, with its full pre-change value.
    expect(action && Object.keys(action.valueBeforeChange)).toEqual([
      'instances',
    ]);
    expect(action && action.valueBeforeChange.instances).toEqual([
      { id: 'a', x: 0 },
      { id: 'b', x: 100 },
    ]);
  });

  it('refreshes the cache after a command, so the next step reverts to the post-command value, not a stale one', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });

    // A command step (like a rename), whose effect on "variables" is
    // applied directly by the caller and then refreshed into the cache -
    // mirroring `_recordHistoryCommand`. Without that refresh, the cache
    // would keep the pre-command value, and undoing a later step touching
    // "variables" would wrongly revert past the command's own effect.
    variablesContainer.insertNew('Renamed', 0).setValue(42);
    history = saveCommandToHistory(
      history,
      { type: 'rename' },
      { source: 'panel' }
    );
    history = refreshCompositeHistoryValue(history, targets, ['variables']);

    // A later, ordinary edit of the same target...
    variablesContainer.get('Renamed').setValue(100);
    history = saveCompositeToHistory(history, targets, ['variables']);

    // ...undoes back to the post-command state (42), not to some stale
    // pre-command value the cache would have kept without the refresh.
    history = undoComposite(history, targets);
    expect(variablesContainer.get('Renamed').getValue()).toBe(42);

    // Undoing further reaches the command step itself; its command is kept
    // for the caller to revert.
    history = undoComposite(history, targets);
    const redoAction = getLastRedoableAction(history);
    expect(redoAction && redoAction.command).toEqual({ type: 'rename' });
  });

  it('trims the oldest steps once the history exceeds its max size', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 2,
    });

    ['blue', 'green', 'yellow', 'purple'].forEach(color => {
      customState.color = color;
      history = saveCompositeToHistory(history, targets, ['custom']);
    });
    expect(history.previousActions.length).toBe(2);

    // Only the last 2 steps are still reachable: 2 undos get back to
    // "green" (the value right before the 3rd, oldest-kept step), and a
    // 3rd undo is a no-op since the step that set it was trimmed away.
    history = undoComposite(history, targets);
    expect(customState.color).toBe('yellow');
    history = undoComposite(history, targets);
    expect(customState.color).toBe('green');
    expect(canUndo(history)).toBe(false);
    history = undoComposite(history, targets);
    expect(customState.color).toBe('green');
  });

  it('empties the redo stack on a new save', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets, ['custom']);
    history = undoComposite(history, targets);
    expect(canRedo(history)).toBe(true);

    customState.color = 'green';
    history = saveCompositeToHistory(history, targets, ['custom']);
    expect(canRedo(history)).toBe(false);
  });
});
