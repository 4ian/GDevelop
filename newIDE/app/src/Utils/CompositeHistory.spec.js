// @flow
import {
  getCompositeHistoryInitialState,
  saveCompositeToHistory,
  undoComposite,
  redoComposite,
  canUndo,
  canRedo,
  type CompositeTargets,
} from './History';

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

  it('captures the changes of all the targets in a single undoable step', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    expect(canUndo(history)).toBe(false);

    // Change both targets, then save once.
    variablesContainer.insertNew('Score', 0).setValue(100);
    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets);
    expect(canUndo(history)).toBe(true);

    // Undo restores both targets.
    history = undoComposite(history, targets);
    expect(variablesContainer.has('Score')).toBe(false);
    expect(customState.color).toBe('red');
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(true);

    // Redo re-applies both.
    history = redoComposite(history, targets);
    expect(variablesContainer.has('Score')).toBe(true);
    expect(variablesContainer.get('Score').getValue()).toBe(100);
    expect(customState.color).toBe('blue');
    expect(canRedo(history)).toBe(false);
  });

  it('supports custom serialization methods and per-target project passing', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    // The same targets as the scene editor: the instances unserialization
    // requires the project as first argument, the layers one breaks if it
    // is given.
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
    history = saveCompositeToHistory(history, sceneTargets);

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

  it('empties the redo stack on a new save', () => {
    let history = getCompositeHistoryInitialState(targets, {
      historyMaxSize: 10,
    });
    customState.color = 'blue';
    history = saveCompositeToHistory(history, targets);
    history = undoComposite(history, targets);
    expect(canRedo(history)).toBe(true);

    customState.color = 'green';
    history = saveCompositeToHistory(history, targets);
    expect(canRedo(history)).toBe(false);
  });
});
