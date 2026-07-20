// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('add_scene_events', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  const makeArgs = (args: Object) => ({
    scene_name: 'TestScene',
    events_description: 'When the player presses space, make the player jump',
    extension_names_list: '',
    objects_list: 'Player',
    ...args,
  });

  it('fails when the scene does not exist', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({ scene_name: 'MissingScene' }),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Scene not found: "MissingScene". Scenes in this project: "TestScene".'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('fails when there is no related AI request ID', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        relatedAiRequestId: null,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No related AI request ID found for events generation.'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('fails when no events description (and no event batches) is provided', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: {
          scene_name: 'TestScene',
          extension_names_list: '',
          objects_list: 'Player',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('No events description provided.');
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('reports an aborted generation without an error message', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationAborted: true,
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result).toEqual({ success: false, aborted: true });
  });

  it('fails when the generation could not complete (infrastructure error)', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: false,
      errorMessage: 'Service unavailable',
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Infrastructure error during events generation (Service unavailable). Try again or a different approach.'
    );
  });

  it('fails when the AI generated event contains an error', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: {
        id: 'test-ai-event-id',
        error: { message: 'Model crashed' },
        changes: [],
        resultMessage: '',
      },
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Infrastructure error generating events (Model crashed). Try again or a different approach.'
    );
    expect(result.aiGeneratedEventId).toBe('test-ai-event-id');
  });
});
