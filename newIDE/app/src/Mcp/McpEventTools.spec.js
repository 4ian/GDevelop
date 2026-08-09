// @flow
import { findSceneEvents } from './McpEventTools';

const gd: libGDevelop = global.gd;

describe('MCP scene lifecycle event tools', () => {
  let project: gdProject;
  let scene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Main Scene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('defaults to sceneUpdate and routes an explicit lifecycle function', () => {
    scene
      .getLifecycleEventsFunctions()
      .getByName('sceneLoad')
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

    const defaultResult = findSceneEvents(project, {
      scene_name: 'Main Scene',
    });
    const loadResult = findSceneEvents(project, {
      scene_name: 'Main Scene',
      lifecycle_function_name: 'sceneLoad',
    });

    expect(defaultResult.lifecycleFunctionName).toBe('sceneUpdate');
    expect(defaultResult.count).toBe(0);
    expect(loadResult.count).toBe(1);
    expect(loadResult.ownerKind).toBe('scene');
    expect(loadResult.lifecycleFunctionName).toBe('sceneLoad');
    expect(loadResult.eventsUri).toBe(
      'game://scenes/Main%20Scene/functions/sceneLoad.events'
    );
    expect(loadResult.functionSettingsUri).toBe(
      'game://scenes/Main%20Scene/functions/sceneLoad.settings'
    );
  });

  it('routes External Events to the lifecycle function under its owning scene', () => {
    const externalEvents = project.insertNewExternalEvents('Shared Logic', 0);
    externalEvents.setAssociatedLayout('Main Scene');
    externalEvents
      .getLifecycleEventsFunctions()
      .getByName('sceneUnload')
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

    const result = findSceneEvents(project, {
      external_events_name: 'Shared Logic',
      lifecycle_function_name: 'sceneUnload',
    });

    expect(result.count).toBe(1);
    expect(result.sceneName).toBe('Main Scene');
    expect(result.ownerKind).toBe('externalEvents');
    expect(result.ownerName).toBe('Shared Logic');
    expect(result.lifecycleFunctionName).toBe('sceneUnload');
    expect(result.eventsUri).toBe(
      'game://scenes/Main%20Scene/external-events/Shared%20Logic/functions/sceneUnload.events'
    );
    expect(result.functionSettingsUri).toBe(
      'game://scenes/Main%20Scene/external-events/Shared%20Logic/functions/sceneUnload.settings'
    );
  });

  it('rejects an External Events owner associated with another scene', () => {
    project.insertNewLayout('Other Scene', 1);
    const externalEvents = project.insertNewExternalEvents('Shared Logic', 0);
    externalEvents.setAssociatedLayout('Other Scene');

    expect(() =>
      findSceneEvents(project, {
        scene_name: 'Main Scene',
        external_events_name: 'Shared Logic',
        lifecycle_function_name: 'sceneSignal',
      })
    ).toThrow(
      'External Events "Shared Logic" belongs to scene "Other Scene", not "Main Scene".'
    );
  });
});
