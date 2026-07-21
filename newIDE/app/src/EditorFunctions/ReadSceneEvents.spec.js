// @flow
import {
  editorFunctions,
  noEventsInSceneText,
  type EditorFunctionGenericOutput,
} from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('read_scene_events', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('fails when the scene does not exist', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.read_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'MissingScene' },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Scene not found: "MissingScene". Scenes in this project: "TestScene".'
    );
  });

  it('reads the events of a scene containing an event', async () => {
    testScene
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

    const result: EditorFunctionGenericOutput = await editorFunctions.read_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );

    expect(result.success).toBe(true);
    expect(result.eventsForSceneNamed).toBe('TestScene');
    expect(typeof result.eventsAsText).toBe('string');
    expect(result.eventsAsText).not.toBe(noEventsInSceneText);
    // Each event is wrapped in a tag identifying it by its path.
    expect(result.eventsAsText).toContain('<event-0>');
    expect(result.eventsAsText).toContain('</event-0>');
    // No partial rendering failure is reported.
    expect(result.eventsRenderingErrors).toBeUndefined();
  });
});
