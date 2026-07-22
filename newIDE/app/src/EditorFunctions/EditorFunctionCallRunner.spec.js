// @flow
import { processEditorFunctionCalls } from './EditorFunctionCallRunner';
import { type EditorFunctionCall } from './index';
import { makeFakeLaunchFunctionOptionsWithoutProject } from './TestHelpers';

// The real PixiResourcesLoader transitively imports ESM-only packages that
// Jest cannot parse: replace it with the test mock.
jest.mock('../ObjectsRendering/PixiResourcesLoader', () => {
  const {
    PixiResourcesLoaderMock,
  } = require('../fixtures/TestPixiResourcesLoader');
  return { __esModule: true, default: PixiResourcesLoaderMock };
});

const gd: libGDevelop = global.gd;

describe('processEditorFunctionCalls', () => {
  const makeRunnerOptions = (
    project: ?gdProject,
    functionCalls: Array<EditorFunctionCall>
  ) => {
    // The runner takes the same collaborators as launchFunction options,
    // without `args` and `PixiResourcesLoader` (it provides those itself).
    const {
      args,
      PixiResourcesLoader,
      ...collaborators
    } = makeFakeLaunchFunctionOptionsWithoutProject();
    return {
      ...collaborators,
      project,
      functionCalls,
    };
  };

  it('reports a single failure and does not run the function when arguments are invalid JSON', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('TestScene', 0);

    const { results } = await processEditorFunctionCalls(
      makeRunnerOptions(project, [
        {
          call_id: 'call-1',
          name: 'read_scene_events',
          arguments: '{not valid json',
        },
      ])
    );

    // Exactly one result for the call: the function must not also run with
    // undefined arguments and push a second result for the same call_id.
    expect(results).toEqual([
      {
        status: 'finished',
        call_id: 'call-1',
        success: false,
        output: {
          message: 'Invalid arguments (not a valid JSON string).',
        },
      },
    ]);

    project.delete();
  });

  it('refuses project-requiring functions when no project is opened', async () => {
    const { results } = await processEditorFunctionCalls(
      makeRunnerOptions(null, [
        {
          call_id: 'call-1',
          name: 'read_scene_events',
          arguments: JSON.stringify({ scene_name: 'TestScene' }),
        },
      ])
    );

    expect(results).toEqual([
      {
        status: 'finished',
        call_id: 'call-1',
        success: false,
        output: {
          message: 'No project opened.',
        },
      },
    ]);
  });

  // Every function registered in `editorFunctionsWithoutProject` must run
  // without a project — not just `initialize_project`.
  it('runs no-project functions like get_game_starter_summary when no project is opened', async () => {
    const { results } = await processEditorFunctionCalls(
      makeRunnerOptions(null, [
        {
          call_id: 'call-1',
          name: 'get_game_starter_summary',
          arguments: JSON.stringify({ template_slug: 'starting-platformer' }),
        },
      ])
    );

    expect(results).toEqual([
      {
        status: 'finished',
        call_id: 'call-1',
        success: false,
        output: {
          message: 'get_game_starter_summary is handled on the backend.',
        },
      },
    ]);
  });

  it('refuses initialize_project when a project is already opened', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();

    const { results } = await processEditorFunctionCalls(
      makeRunnerOptions(project, [
        {
          call_id: 'call-1',
          name: 'initialize_project',
          arguments: JSON.stringify({
            project_name: 'My game',
            template_slug: 'empty',
          }),
        },
      ])
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(
      expect.objectContaining({
        status: 'finished',
        call_id: 'call-1',
        success: false,
        output: expect.objectContaining({
          message: expect.stringContaining('A project is already open'),
        }),
      })
    );

    project.delete();
  });

  it('reports unknown functions', async () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();

    const { results } = await processEditorFunctionCalls(
      makeRunnerOptions(project, [
        {
          call_id: 'call-1',
          name: 'not_a_real_function',
          arguments: '{}',
        },
      ])
    );

    expect(results).toEqual([
      {
        status: 'finished',
        call_id: 'call-1',
        success: false,
        output: {
          message: 'Unknown function: not_a_real_function.',
        },
      },
    ]);

    project.delete();
  });
});
